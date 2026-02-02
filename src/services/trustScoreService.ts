import { mockDB } from './mockDatabase';
import type {
    TrustScoreComponents,
    TrustLevel,
    PlayerTrustProfile,
    VerificationHistory,
    ProxyFlag,
    PlayerBan,
    TournamentPlayerStatus
} from '@/types/proxyPrevention';

/**
 * Trust Score Service
 * Calculates and manages player trust scores based on verification history,
 * tournament participation, and proxy flags.
 */

// Scoring weights
const WEIGHTS = {
    VERIFICATION: 40,
    PARTICIPATION: 30,
    PROXY_PENALTY: 30
};

// Verification points
const VERIFICATION_POINTS = {
    MOBILE: 15,
    EMAIL: 10,
    IDENTITY: 10,
    BADGE: 5
};

// Proxy flag penalties
const PROXY_PENALTIES = {
    low: 2,
    medium: 5,
    high: 10,
    critical: 15
};

/**
 * Calculate verification score (0-40 points)
 */
export const calculateVerificationScore = (userId: string): number => {
    const user = mockDB.getUsers().find(u => u.id === userId);
    if (!user) return 0;

    let score = 0;

    // Mobile verification
    if (user.isMobileVerified) {
        score += VERIFICATION_POINTS.MOBILE;
    }

    // Email verification
    if (user.isEmailVerified) {
        score += VERIFICATION_POINTS.EMAIL;
    }

    // Identity verification (check verification history)
    const verificationHistory = mockDB.getVerificationHistory(userId);
    const hasIdentityVerification = verificationHistory.some(
        v => v.verificationType === 'identity' && v.success
    );
    if (hasIdentityVerification) {
        score += VERIFICATION_POINTS.IDENTITY;
    }

    // Badge verification
    if (user.verificationBadge === 'blue_tick' || user.verificationBadge === 'gold_tick') {
        score += VERIFICATION_POINTS.BADGE;
    }

    return Math.min(score, WEIGHTS.VERIFICATION);
};

/**
 * Calculate tournament participation score (0-30 points)
 */
export const calculateTournamentParticipationScore = (userId: string): number => {
    const user = mockDB.getUsers().find(u => u.id === userId);
    if (!user) return 0;

    // Get all matches where user participated
    const allBalls = mockDB.getAllBalls();
    const userMatches = new Set<string>();

    allBalls.forEach(ball => {
        if (ball.batsman_name === user.fullName || ball.bowler_name === user.fullName) {
            userMatches.add(ball.match_id);
        }
    });

    const totalMatches = userMatches.size;

    // Get completed matches
    const matches = mockDB.getMatches();
    const completedMatches = Array.from(userMatches).filter(matchId => {
        const match = matches.find(m => m.id === matchId);
        return match?.status === 'completed';
    }).length;

    // Base score: 2 points per tournament, max 20 points
    const baseScore = Math.min(totalMatches * 2, 20);

    // Completion rate bonus: up to 10 points
    const completionRate = totalMatches > 0 ? completedMatches / totalMatches : 0;
    const completionBonus = completionRate * 10;

    return Math.min(baseScore + completionBonus, WEIGHTS.PARTICIPATION);
};

/**
 * Calculate proxy penalty (0 to -30 points)
 */
export const calculateProxyPenalty = (userId: string): number => {
    const proxyFlags = mockDB.getProxyFlags(userId);

    if (proxyFlags.length === 0) return 0;

    let totalPenalty = 0;
    const now = new Date();

    proxyFlags.forEach(flag => {
        if (flag.resolved) return; // Skip resolved flags

        // Base penalty
        let penalty = PROXY_PENALTIES[flag.severity];

        // Time decay: penalty reduces over time (1 year = full decay)
        const flagDate = new Date(flag.reportedAt);
        const daysAgo = (now.getTime() - flagDate.getTime()) / (1000 * 60 * 60 * 24);
        const decayFactor = Math.max(0, 1 - (daysAgo / 365));

        penalty = penalty * decayFactor;
        totalPenalty += penalty;
    });

    return -Math.min(totalPenalty, WEIGHTS.PROXY_PENALTY);
};

/**
 * Calculate composite trust score (0-100)
 */
export const calculateTrustScore = (userId: string): number => {
    const verificationScore = calculateVerificationScore(userId);
    const participationScore = calculateTournamentParticipationScore(userId);
    const proxyPenalty = calculateProxyPenalty(userId);

    const totalScore = verificationScore + participationScore + proxyPenalty;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, totalScore));
};

/**
 * Get detailed trust score breakdown
 */
export const getTrustScoreBreakdown = (userId: string): TrustScoreComponents => {
    const verificationScore = calculateVerificationScore(userId);
    const participationScore = calculateTournamentParticipationScore(userId);
    const proxyPenalty = calculateProxyPenalty(userId);
    const totalScore = calculateTrustScore(userId);

    return {
        verificationScore,
        participationScore,
        proxyPenalty,
        totalScore,
        calculatedAt: new Date().toISOString()
    };
};

/**
 * Convert score to trust level
 */
export const getTrustLevel = (score: number): TrustLevel => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'critical';
};

/**
 * Get comprehensive player trust profile
 */
export const getPlayerTrustProfile = (userId: string): PlayerTrustProfile | null => {
    const user = mockDB.getUsers().find(u => u.id === userId);
    if (!user) return null;

    const scoreComponents = getTrustScoreBreakdown(userId);
    const trustScore = scoreComponents.totalScore;
    const trustLevel = getTrustLevel(trustScore);

    const verificationHistory = mockDB.getVerificationHistory(userId);
    const proxyFlags = mockDB.getProxyFlags(userId);
    const bans = mockDB.getUserBans(userId);
    const tournamentStatuses = mockDB.getUserTournamentStatuses(userId);

    // Calculate statistics
    const allBalls = mockDB.getAllBalls();
    const userMatches = new Set<string>();

    allBalls.forEach(ball => {
        if (ball.batsman_name === user.fullName || ball.bowler_name === user.fullName) {
            userMatches.add(ball.match_id);
        }
    });

    const matches = mockDB.getMatches();
    const completedMatches = Array.from(userMatches).filter(matchId => {
        const match = matches.find(m => m.id === matchId);
        return match?.status === 'completed';
    }).length;

    const activeBans = bans.filter(ban => {
        if (ban.isPermanent) return true;
        if (!ban.expiresAt) return false;
        return new Date(ban.expiresAt) > new Date();
    }).length;

    return {
        userId,
        trustScore,
        trustLevel,
        scoreComponents,
        verificationHistory,
        proxyFlags,
        bans,
        tournamentStatuses,
        statistics: {
            totalTournaments: userMatches.size,
            completedTournaments: completedMatches,
            completionRate: userMatches.size > 0 ? completedMatches / userMatches.size : 0,
            totalMatches: userMatches.size,
            verificationCount: verificationHistory.filter(v => v.success).length,
            proxyFlagCount: proxyFlags.filter(f => !f.resolved).length,
            activeBans
        },
        lastUpdated: new Date().toISOString()
    };
};

/**
 * Get trust level color for UI
 */
export const getTrustLevelColor = (level: TrustLevel): string => {
    switch (level) {
        case 'excellent': return 'text-green-600';
        case 'good': return 'text-blue-600';
        case 'fair': return 'text-yellow-600';
        case 'poor': return 'text-orange-600';
        case 'critical': return 'text-red-600';
    }
};

/**
 * Get trust level background color for UI
 */
export const getTrustLevelBgColor = (level: TrustLevel): string => {
    switch (level) {
        case 'excellent': return 'bg-green-100';
        case 'good': return 'bg-blue-100';
        case 'fair': return 'bg-yellow-100';
        case 'poor': return 'bg-orange-100';
        case 'critical': return 'bg-red-100';
    }
};

/**
 * Get trust score progress color
 */
export const getTrustScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#3b82f6'; // blue
    if (score >= 40) return '#eab308'; // yellow
    if (score >= 20) return '#f97316'; // orange
    return '#ef4444'; // red
};

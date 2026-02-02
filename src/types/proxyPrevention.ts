// Proxy Prevention System Type Definitions

/**
 * Types of verification methods supported
 */
export type VerificationType =
    | 'mobile'
    | 'email'
    | 'identity'
    | 'biometric'
    | 'document';

/**
 * Verification attempt record
 */
export interface VerificationHistory {
    id: string;
    userId: string;
    verificationType: VerificationType;
    success: boolean;
    attemptedAt: string; // ISO timestamp
    metadata?: {
        ipAddress?: string;
        deviceInfo?: string;
        verificationMethod?: string;
        documentType?: string;
    };
}

/**
 * Severity levels for proxy flags
 */
export type ProxyFlagSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Proxy flag record for suspicious activities
 */
export interface ProxyFlag {
    id: string;
    userId: string;
    tournamentId?: string;
    severity: ProxyFlagSeverity;
    reason: string;
    description?: string;
    reportedBy: string; // Organizer user ID
    reportedAt: string; // ISO timestamp
    evidence?: {
        type: 'screenshot' | 'video' | 'witness' | 'system_detection' | 'other';
        description: string;
        url?: string;
    };
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
    resolutionNotes?: string;
}

/**
 * Player status in tournament context
 */
export type PlayerStatus =
    | 'pending'     // Awaiting organizer approval
    | 'approved'    // Approved to participate
    | 'rejected'    // Rejected from tournament
    | 'banned';     // Banned from organizer's tournaments

/**
 * Player ban record
 */
export interface PlayerBan {
    id: string;
    userId: string;
    organizerId: string;
    reason: string;
    isPermanent: boolean;
    bannedAt: string; // ISO timestamp
    expiresAt?: string; // ISO timestamp (null if permanent)
    tournamentId?: string; // Specific tournament or all tournaments
    notes?: string;
    appealStatus?: 'none' | 'pending' | 'approved' | 'rejected';
    appealNotes?: string;
}

/**
 * Player status for a specific tournament
 */
export interface TournamentPlayerStatus {
    id: string;
    userId: string;
    tournamentId: string;
    organizerId: string;
    status: PlayerStatus;
    statusChangedAt: string;
    statusChangedBy: string; // Organizer user ID
    reason?: string;
    notes?: string;
}

/**
 * Trust score component breakdown
 */
export interface TrustScoreComponents {
    verificationScore: number; // 0-40
    participationScore: number; // 0-30
    proxyPenalty: number; // 0 to -30
    totalScore: number; // 0-100
    calculatedAt: string;
}

/**
 * Trust level based on score
 */
export type TrustLevel =
    | 'excellent'  // 80-100
    | 'good'       // 60-79
    | 'fair'       // 40-59
    | 'poor'       // 20-39
    | 'critical';  // 0-19

/**
 * Comprehensive player trust profile
 */
export interface PlayerTrustProfile {
    userId: string;
    trustScore: number; // 0-100
    trustLevel: TrustLevel;
    scoreComponents: TrustScoreComponents;
    verificationHistory: VerificationHistory[];
    proxyFlags: ProxyFlag[];
    bans: PlayerBan[];
    tournamentStatuses: TournamentPlayerStatus[];
    statistics: {
        totalTournaments: number;
        completedTournaments: number;
        completionRate: number;
        totalMatches: number;
        verificationCount: number;
        proxyFlagCount: number;
        activeBans: number;
    };
    lastUpdated: string;
}

/**
 * Trust score history for tracking changes over time
 */
export interface TrustScoreHistory {
    id: string;
    userId: string;
    score: number;
    components: TrustScoreComponents;
    calculatedAt: string;
    trigger?: string; // What caused the recalculation
}

/**
 * Organizer player management filters
 */
export interface PlayerManagementFilters {
    tournamentId?: string;
    status?: PlayerStatus | 'all';
    trustLevel?: TrustLevel | 'all';
    minTrustScore?: number;
    maxTrustScore?: number;
    hasProxyFlags?: boolean;
    isBanned?: boolean;
    searchQuery?: string;
}

/**
 * Player management statistics for organizer dashboard
 */
export interface PlayerManagementStats {
    totalPlayers: number;
    pendingApprovals: number;
    approvedPlayers: number;
    rejectedPlayers: number;
    bannedPlayers: number;
    averageTrustScore: number;
    highRiskPlayers: number; // Trust score < 30
    recentProxyFlags: number; // Last 30 days
}

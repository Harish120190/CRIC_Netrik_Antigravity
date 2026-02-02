import { Ball, Match } from './mockDatabase';
import { MatchSummaryData } from '@/pages/ScoringPage';
// Ensure we import compatible types. If MatchSummaryData is not exported or has different types, we might need to adapt.
// Ideally, we should move shared types to a types file, but for now we import from ScoringPage or redefine.

// Redefining Key Interfaces to avoid circular dependencies if ScoringPage imports services
// In a real app, these should be in @/types/cricket.ts

export interface BatsmanStats {
    id: string;
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    isOut: boolean;
    isOnStrike: boolean;
}

export interface BowlerStats {
    id: string;
    name: string;
    overs: number;
    balls: number;
    maidens: number;
    runs: number;
    wickets: number;
    isBowling: boolean;
}

export interface InningsData {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    extras: number;
    fours: number;
    sixes: number;
    battingTeam: any; // Using any to avoid complex Team type casting issues for now
    bowlingTeam: any;
    batsmenStats: BatsmanStats[];
    bowlersStats: BowlerStats[];
}

export interface ComputedMatchSummary {
    team1: any;
    team2: any;
    venue: string;
    overs: number;
    innings1: InningsData;
    innings2?: InningsData;
    result: string;
    winner?: any;
}

export const calculateMatchStats = (match: Match, allBalls: Ball[]): ComputedMatchSummary => {
    // Sort balls by innings, over, ball
    const sortedBalls = [...allBalls].sort((a, b) => {
        if (a.innings_no !== b.innings_no) return a.innings_no - b.innings_no;
        if (a.over_number !== b.over_number) return a.over_number - b.over_number;
        return a.ball_number - b.ball_number;
    });

    const innings1Balls = sortedBalls.filter(b => b.innings_no === 1);
    const innings2Balls = sortedBalls.filter(b => b.innings_no === 2);

    // Helper calculation
    const calculateInnings = (balls: Ball[], battingTeamName: string, bowlingTeamName: string): InningsData => {
        let runs = 0;
        let wickets = 0;
        let validBalls = 0;
        let extras = 0;
        let fours = 0;
        let sixes = 0;

        const batsmenMap = new Map<string, BatsmanStats>();
        const bowlersMap = new Map<string, BowlerStats>();

        // Initialize maps if we had team players list, but here we derive from balls
        // This implies players who didn't face a ball or bowl won't show up in stats
        // For a derived view this is often acceptable fallback

        balls.forEach(ball => {
            const isExtra = !!ball.extras_type;
            const isWide = ball.extras_type === 'wide';
            const isNoBall = ball.extras_type === 'no-ball';
            const isBye = ball.extras_type === 'bye';
            const isLegBye = ball.extras_type === 'leg-bye';

            const runsScored = ball.runs_scored;
            const extrasRuns = ball.extras_runs || 0;

            // Total Runs
            runs += runsScored + extrasRuns;

            // Extras count
            if (isExtra) extras += extrasRuns; // Simpler approximation, often extras_runs is just 1 except for byes/legbyes + runs

            // Valid balls for over calculation (Wides and No-balls don't count)
            if (!isWide && !isNoBall) {
                validBalls++;
            }

            // Wickets
            if (ball.is_wicket) {
                wickets++;
            }

            // Boundaries
            if (runsScored === 4) fours++;
            if (runsScored === 6) sixes++;

            // Batsman Stats
            const batName = ball.batsman_name || 'Unknown';
            if (!batsmenMap.has(batName)) {
                batsmenMap.set(batName, { id: batName, name: batName, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, isOnStrike: false });
            }
            const batStats = batsmenMap.get(batName)!;

            // Credit runs to batsman
            // Wides don't count as balls faced, usually (depends on rule, standard is no)
            if (!isWide) {
                batStats.balls++;
            }
            batStats.runs += runsScored;

            if (runsScored === 4) batStats.fours++;
            if (runsScored === 6) batStats.sixes++;

            if (ball.is_wicket && ball.player_out_name === batName) {
                batStats.isOut = true;
            }

            // Bowler Stats
            const bowlName = ball.bowler_name || 'Unknown';
            if (!bowlersMap.has(bowlName)) {
                bowlersMap.set(bowlName, { id: bowlName, name: bowlName, overs: 0, balls: 0, maidens: 0, runs: 0, wickets: 0, isBowling: false });
            }
            const bowlStats = bowlersMap.get(bowlName)!;

            // Bowler balls
            if (!isWide && !isNoBall) {
                bowlStats.balls++;
                if (bowlStats.balls >= 6) {
                    bowlStats.overs++;
                    bowlStats.balls = 0;
                }
            }

            // Bowler runs conceded
            // Byes and Leg Byes don't count against bowler
            const bowlerRuns = (isBye || isLegBye) ? 0 : (runsScored + (isWide || isNoBall ? 1 : 0)); // Assuming 1 run penalty for wd/nb
            bowlStats.runs += bowlerRuns;

            // Wickets
            if (ball.is_wicket && !['runout', 'retired'].includes(ball.extras_type || '')) {
                bowlStats.wickets++;
            }
        });

        return {
            runs,
            wickets,
            overs: Math.floor(validBalls / 6),
            balls: validBalls % 6,
            extras,
            fours,
            sixes,
            battingTeam: { name: battingTeamName },
            bowlingTeam: { name: bowlingTeamName },
            batsmenStats: Array.from(batsmenMap.values()),
            bowlersStats: Array.from(bowlersMap.values())
        };
    };

    // Determine teams
    const tossWinner = match.toss_winner || match.team1_name;
    const tossDecision = match.toss_decision || 'bat';

    let team1BattingFirst = false;
    if (tossWinner === match.team1_name && tossDecision === 'bat') team1BattingFirst = true;
    if (tossWinner === match.team2_name && tossDecision === 'bowl') team1BattingFirst = true;

    const innings1Team = team1BattingFirst ? match.team1_name : match.team2_name;
    const innings2Team = team1BattingFirst ? match.team2_name : match.team1_name;

    const innings1Data = calculateInnings(innings1Balls, innings1Team, innings2Team);
    const innings2Data = calculateInnings(innings2Balls, innings2Team, innings1Team);

    return {
        team1: { name: match.team1_name },
        team2: { name: match.team2_name },
        venue: match.ground_name || match.city || 'Unknown',
        overs: match.overs || 20,
        innings1: innings1Data,
        innings2: innings2Balls.length > 0 ? innings2Data : undefined,
        result: match.result || 'Match Completed',
        winner: match.winner_name ? { name: match.winner_name } : undefined
    };
};

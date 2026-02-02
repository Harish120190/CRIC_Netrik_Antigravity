import { mockDB, Ball as MockBall } from './mockDatabase';

export interface Highlight {
    id: string;
    match_id: string;
    ball_id: string;
    type: 'wicket' | 'six' | 'four' | 'milestone' | 'momentum';
    score: number; // Highlight importance score
    over: number;
    ball: number;
    title: string;
    description: string;
    batsman?: string;
    bowler?: string;
    timestamp: string;
    metadata?: {
        runs?: number;
        milestone_type?: string;
        wicket_type?: string;
        player_runs?: number;
        player_wickets?: number;
    };
}

interface PlayerStats {
    runs: number;
    wickets: number;
}

class HighlightsEngine {
    private calculateHighlightScore(ball: MockBall, playerStats: Map<string, PlayerStats>): number {
        let score = 0;

        // Wickets
        if (ball.is_wicket) {
            score += 100;
            // Golden duck bonus
            const batsmanStats = playerStats.get(ball.batsman_name);
            if (batsmanStats && batsmanStats.runs === 0) {
                score += 50; // Golden duck = 150 total
            }
        }

        // Boundaries
        if (ball.runs_scored === 6) {
            score += 80;
        } else if (ball.runs_scored === 4) {
            score += 40;
        }

        return score;
    }

    private detectMilestones(balls: MockBall[]): Highlight[] {
        const milestones: Highlight[] = [];
        const playerRuns = new Map<string, number>();
        const bowlerWickets = new Map<string, number>();

        balls.forEach((ball, index) => {
            // Track batsman runs
            const currentRuns = (playerRuns.get(ball.batsman_name) || 0) + ball.runs_scored;
            playerRuns.set(ball.batsman_name, currentRuns);

            // Check for 50 or 100
            const previousRuns = currentRuns - ball.runs_scored;
            if (previousRuns < 50 && currentRuns >= 50) {
                milestones.push({
                    id: `milestone-${ball.id}`,
                    match_id: ball.match_id,
                    ball_id: ball.id,
                    type: 'milestone',
                    score: 90,
                    over: ball.over_number,
                    ball: ball.ball_number,
                    title: `${ball.batsman_name}'s Half-Century!`,
                    description: `${ball.batsman_name} reaches 50 runs`,
                    batsman: ball.batsman_name,
                    bowler: ball.bowler_name,
                    timestamp: ball.created_at,
                    metadata: {
                        milestone_type: 'fifty',
                        player_runs: currentRuns
                    }
                });
            } else if (previousRuns < 100 && currentRuns >= 100) {
                milestones.push({
                    id: `milestone-${ball.id}`,
                    match_id: ball.match_id,
                    ball_id: ball.id,
                    type: 'milestone',
                    score: 150,
                    over: ball.over_number,
                    ball: ball.ball_number,
                    title: `${ball.batsman_name}'s Century!`,
                    description: `${ball.batsman_name} reaches 100 runs - What a knock!`,
                    batsman: ball.batsman_name,
                    bowler: ball.bowler_name,
                    timestamp: ball.created_at,
                    metadata: {
                        milestone_type: 'century',
                        player_runs: currentRuns
                    }
                });
            }

            // Track bowler wickets
            if (ball.is_wicket) {
                const currentWickets = (bowlerWickets.get(ball.bowler_name) || 0) + 1;
                bowlerWickets.set(ball.bowler_name, currentWickets);

                if (currentWickets === 5) {
                    milestones.push({
                        id: `milestone-5w-${ball.id}`,
                        match_id: ball.match_id,
                        ball_id: ball.id,
                        type: 'milestone',
                        score: 120,
                        over: ball.over_number,
                        ball: ball.ball_number,
                        title: `${ball.bowler_name}'s 5-Wicket Haul!`,
                        description: `${ball.bowler_name} takes their 5th wicket`,
                        batsman: ball.batsman_name,
                        bowler: ball.bowler_name,
                        timestamp: ball.created_at,
                        metadata: {
                            milestone_type: 'five_wickets',
                            player_wickets: currentWickets
                        }
                    });
                }
            }
        });

        return milestones;
    }

    private detectMomentumShifts(balls: MockBall[]): Highlight[] {
        const momentumHighlights: Highlight[] = [];
        let consecutiveBoundaries = 0;
        let boundaryStreak: MockBall[] = [];

        balls.forEach((ball, index) => {
            if (ball.runs_scored === 4 || ball.runs_scored === 6) {
                consecutiveBoundaries++;
                boundaryStreak.push(ball);

                if (consecutiveBoundaries === 3) {
                    // 3 consecutive boundaries = momentum shift
                    const lastBall = boundaryStreak[boundaryStreak.length - 1];
                    momentumHighlights.push({
                        id: `momentum-${lastBall.id}`,
                        match_id: lastBall.match_id,
                        ball_id: lastBall.id,
                        type: 'momentum',
                        score: 50,
                        over: lastBall.over_number,
                        ball: lastBall.ball_number,
                        title: `${lastBall.batsman_name} on Fire!`,
                        description: `3 consecutive boundaries - ${boundaryStreak.map(b => b.runs_scored).join(', ')} runs`,
                        batsman: lastBall.batsman_name,
                        bowler: lastBall.bowler_name,
                        timestamp: lastBall.created_at,
                        metadata: {
                            runs: boundaryStreak.reduce((sum, b) => sum + b.runs_scored, 0)
                        }
                    });
                }
            } else {
                consecutiveBoundaries = 0;
                boundaryStreak = [];
            }
        });

        return momentumHighlights;
    }

    generateHighlights(matchId: string): Highlight[] {
        const balls = mockDB.getBalls(matchId);
        if (!balls || balls.length === 0) return [];

        const highlights: Highlight[] = [];
        const playerStats = new Map<string, PlayerStats>();

        // Initialize player stats
        balls.forEach(ball => {
            if (!playerStats.has(ball.batsman_name)) {
                playerStats.set(ball.batsman_name, { runs: 0, wickets: 0 });
            }
            const stats = playerStats.get(ball.batsman_name)!;
            stats.runs += ball.runs_scored;
        });

        // Generate basic highlights (wickets, boundaries)
        balls.forEach(ball => {
            const score = this.calculateHighlightScore(ball, playerStats);

            if (score > 0) {
                let title = '';
                let description = '';
                let type: Highlight['type'] = 'four';

                if (ball.is_wicket) {
                    type = 'wicket';
                    title = `${ball.batsman_name} OUT!`;
                    description = `${ball.bowler_name} gets ${ball.batsman_name}`;
                } else if (ball.runs_scored === 6) {
                    type = 'six';
                    title = `Massive Six!`;
                    description = `${ball.batsman_name} smashes ${ball.bowler_name} for SIX`;
                } else if (ball.runs_scored === 4) {
                    type = 'four';
                    title = `Boundary!`;
                    description = `${ball.batsman_name} finds the gap for FOUR`;
                }

                highlights.push({
                    id: `highlight-${ball.id}`,
                    match_id: ball.match_id,
                    ball_id: ball.id,
                    type,
                    score,
                    over: ball.over_number,
                    ball: ball.ball_number,
                    title,
                    description,
                    batsman: ball.batsman_name,
                    bowler: ball.bowler_name,
                    timestamp: ball.created_at,
                    metadata: {
                        runs: ball.runs_scored,
                        wicket_type: ball.is_wicket ? 'out' : undefined
                    }
                });
            }
        });

        // Add milestones
        const milestones = this.detectMilestones(balls);
        highlights.push(...milestones);

        // Add momentum shifts
        const momentum = this.detectMomentumShifts(balls);
        highlights.push(...momentum);

        // Sort by score (highest first)
        return highlights.sort((a, b) => b.score - a.score);
    }

    getTopHighlights(matchId: string, count: number = 5): Highlight[] {
        const allHighlights = this.generateHighlights(matchId);
        return allHighlights.slice(0, count);
    }

    getChronologicalHighlights(matchId: string): Highlight[] {
        const allHighlights = this.generateHighlights(matchId);
        // Sort by over and ball number
        return allHighlights.sort((a, b) => {
            if (a.over !== b.over) return a.over - b.over;
            return a.ball - b.ball;
        });
    }

    getHighlightsByType(matchId: string, type: Highlight['type']): Highlight[] {
        const allHighlights = this.generateHighlights(matchId);
        return allHighlights.filter(h => h.type === type);
    }
}

export const highlightsEngine = new HighlightsEngine();

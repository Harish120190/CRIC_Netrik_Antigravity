import { useState, useEffect } from 'react';
import { mockDB } from '@/services/mockDatabase';

export interface TeamStats {
    id: string;
    name: string;
    matches: number;
    won: number;
    lost: number;
    tied: number;
    points: number;
    rank?: number;
}

export function useTeamLeaderboard(limit = 20) {
    const [leaderboard, setLeaderboard] = useState<TeamStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const data = mockDB.getTeamStats();
                const entries: TeamStats[] = data.slice(0, limit).map((item: any, index: number) => ({
                    ...item,
                    rank: index + 1,
                }));
                setLeaderboard(entries);
            } catch (err) {
                console.error('Error fetching team leaderboard:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [limit]);

    return { leaderboard, isLoading };
}

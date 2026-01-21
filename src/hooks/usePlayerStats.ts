import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PlayerStats {
  id: string;
  user_id: string;
  matches: number;
  innings: number;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  highest_score: number;
  not_outs: number;
  fifties: number;
  hundreds: number;
  ducks: number;
  overs_bowled: number;
  balls_bowled: number;
  runs_conceded: number;
  wickets: number;
  maidens: number;
  best_bowling_wickets: number;
  best_bowling_runs: number;
  catches: number;
  stumpings: number;
  run_outs: number;
  // Computed fields
  average?: number;
  strike_rate?: number;
  economy?: number;
  bowling_average?: number;
  // Joined fields
  full_name?: string;
  avatar_url?: string;
}

export interface LeaderboardEntry extends PlayerStats {
  rank: number;
}

export function usePlayerStats(userId?: string) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (data) {
          const computed = computeStats(data as PlayerStats);
          setStats(computed);
        } else {
          setStats(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, isLoading, error };
}

export function useLeaderboard(category: 'runs' | 'wickets' | 'catches' = 'runs', limit = 20) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('player_stats')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .gt('matches', 0);

        // Order by category
        switch (category) {
          case 'runs':
            query = query.order('runs', { ascending: false });
            break;
          case 'wickets':
            query = query.order('wickets', { ascending: false });
            break;
          case 'catches':
            query = query.order('catches', { ascending: false });
            break;
        }

        const { data, error } = await query.limit(limit);

        if (error) throw error;

        const entries: LeaderboardEntry[] = (data || []).map((item: any, index: number) => ({
          ...computeStats(item),
          full_name: item.profiles?.full_name || 'Unknown Player',
          avatar_url: item.profiles?.avatar_url,
          rank: index + 1,
        }));

        setLeaderboard(entries);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [category, limit]);

  return { leaderboard, isLoading };
}

function computeStats(stats: PlayerStats): PlayerStats {
  const dismissals = stats.innings - stats.not_outs;
  const average = dismissals > 0 ? stats.runs / dismissals : stats.runs;
  const strike_rate = stats.balls_faced > 0 ? (stats.runs / stats.balls_faced) * 100 : 0;
  const economy = stats.balls_bowled > 0 ? (stats.runs_conceded / stats.balls_bowled) * 6 : 0;
  const bowling_average = stats.wickets > 0 ? stats.runs_conceded / stats.wickets : 0;

  return {
    ...stats,
    average: Math.round(average * 100) / 100,
    strike_rate: Math.round(strike_rate * 100) / 100,
    economy: Math.round(economy * 100) / 100,
    bowling_average: Math.round(bowling_average * 100) / 100,
  };
}

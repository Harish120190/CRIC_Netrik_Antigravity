import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';

export interface PersistedMatch {
  id: string;
  team1_name: string;
  team2_name: string;
  venue: string;
  total_overs: number;
  status: 'live' | 'completed';
  result: string | null;
  winner_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersistedInnings {
  id: string;
  match_id: string;
  innings_number: number;
  batting_team_name: string;
  bowling_team_name: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
  fours: number;
  sixes: number;
}

export const useMatchPersistence = () => {
  const [liveMatches, setLiveMatches] = useState<PersistedMatch[]>([]);
  const [completedMatches, setCompletedMatches] = useState<PersistedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all matches
  const fetchMatches = useCallback(async () => {
    try {
      const { data } = await api.get<PersistedMatch[]>('/matches');
      // Sort by created_at desc
      const matches = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLiveMatches(matches.filter(m => m.status === 'live'));
      setCompletedMatches(matches.filter(m => m.status === 'completed'));
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new match
  const createMatch = async (
    team1Name: string,
    team2Name: string,
    venue: string,
    totalOvers: number
  ): Promise<string | null> => {
    try {
      const { data } = await api.post<PersistedMatch>('/matches', {
        team1_name: team1Name,
        team2_name: team2Name,
        venue: venue,
        total_overs: totalOvers,
        status: 'live',
      });

      toast.success('Match created and synced!');
      return data.id;
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create match');
      return null;
    }
  };

  // Create innings for a match
  const createInnings = async (
    matchId: string,
    inningsNumber: number,
    battingTeamName: string,
    bowlingTeamName: string
  ): Promise<string | null> => {
    try {
      const { data } = await api.post<PersistedInnings>('/innings', {
        match_id: matchId,
        innings_number: inningsNumber,
        batting_team_name: battingTeamName,
        bowling_team_name: bowlingTeamName,
      });
      return data.id;
    } catch (error) {
      console.error('Error creating innings:', error);
      return null;
    }
  };

  // Update innings score
  const updateInningsScore = async (
    inningsId: string,
    runs: number,
    wickets: number,
    overs: number,
    balls: number,
    extras: number,
    fours: number,
    sixes: number
  ) => {
    try {
      await api.put(`/innings/${inningsId}`, {
        runs,
        wickets,
        overs,
        balls,
        extras,
        fours,
        sixes,
      });
    } catch (error) {
      console.error('Error updating innings:', error);
    }
  };

  // Record a ball
  const recordBall = async (
    inningsId: string,
    overNumber: number,
    ballNumber: number,
    runs: number,
    isWicket: boolean,
    extrasType: string | null,
    batsmanName: string,
    bowlerName: string
  ) => {
    try {
      await api.post('/balls', {
        innings_id: inningsId,
        over_number: overNumber,
        ball_number: ballNumber,
        runs,
        is_wicket: isWicket,
        extras_type: extrasType,
        batsman_name: batsmanName,
        bowler_name: bowlerName,
      });
    } catch (error) {
      console.error('Error recording ball:', error);
    }
  };

  // Complete a match
  const completeMatch = async (
    matchId: string,
    result: string,
    winnerName?: string
  ) => {
    try {
      await api.put(`/matches/${matchId}`, {
        status: 'completed',
        result,
        winner_name: winnerName || null,
      });
      toast.success('Match completed and saved!');
    } catch (error) {
      console.error('Error completing match:', error);
      toast.error('Failed to save match result');
    }
  };

  // Get match details with innings
  const getMatchWithInnings = async (matchId: string) => {
    try {
      const [matchRes, inningsRes] = await Promise.all([
        api.get<PersistedMatch>(`/matches/${matchId}`),
        api.get<PersistedInnings[]>(`/innings?match_id=${matchId}`),
      ]);

      return {
        match: matchRes.data,
        innings: inningsRes.data.sort((a, b) => a.innings_number - b.innings_number),
      };
    } catch (error) {
      console.error('Error fetching match details:', error);
      return null;
    }
  };

  // Simple polling for updates (replaces supabase realtime)
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => {
      fetchMatches();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [fetchMatches]);

  return {
    liveMatches,
    completedMatches,
    isLoading,
    createMatch,
    createInnings,
    updateInningsScore,
    recordBall,
    completeMatch,
    getMatchWithInnings,
    refetch: fetchMatches,
  };
};

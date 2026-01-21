import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const matches = (data || []) as PersistedMatch[];
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
      const { data, error } = await supabase
        .from('matches')
        .insert({
          team1_name: team1Name,
          team2_name: team2Name,
          venue: venue,
          total_overs: totalOvers,
          status: 'live',
        })
        .select()
        .single();

      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('innings')
        .insert({
          match_id: matchId,
          innings_number: inningsNumber,
          batting_team_name: battingTeamName,
          bowling_team_name: bowlingTeamName,
        })
        .select()
        .single();

      if (error) throw error;
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
      const { error } = await supabase
        .from('innings')
        .update({
          runs,
          wickets,
          overs,
          balls,
          extras,
          fours,
          sixes,
        })
        .eq('id', inningsId);

      if (error) throw error;
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
      const { error } = await supabase
        .from('balls')
        .insert({
          innings_id: inningsId,
          over_number: overNumber,
          ball_number: ballNumber,
          runs,
          is_wicket: isWicket,
          extras_type: extrasType,
          batsman_name: batsmanName,
          bowler_name: bowlerName,
        });

      if (error) throw error;
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
      const { error } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          result,
          winner_name: winnerName || null,
        })
        .eq('id', matchId);

      if (error) throw error;
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
        supabase.from('matches').select('*').eq('id', matchId).single(),
        supabase.from('innings').select('*').eq('match_id', matchId).order('innings_number'),
      ]);

      if (matchRes.error) throw matchRes.error;
      if (inningsRes.error) throw inningsRes.error;

      return {
        match: matchRes.data as PersistedMatch,
        innings: inningsRes.data as PersistedInnings[],
      };
    } catch (error) {
      console.error('Error fetching match details:', error);
      return null;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel('match-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
        },
        () => {
          fetchMatches();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'innings',
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

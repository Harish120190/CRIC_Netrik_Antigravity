import { useState, useEffect, useCallback } from 'react';
import { mockDB } from '@/services/mockDatabase';
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
  tournamentId?: string;
  match_type?: string;
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

  // Fetch all matches from mockDB
  const fetchMatches = useCallback(async () => {
    try {
      const allMatches = mockDB.getMatches();
      // Sort by created_at desc
      const sortedMatches = allMatches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Map to PersistedMatch structure if needed, but mockDB Match is compatible
      setLiveMatches(sortedMatches.filter(m => m.status === 'live' || m.status === 'scheduled') as any);
      setCompletedMatches(sortedMatches.filter(m => m.status === 'completed') as any);
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
      const newMatch = mockDB.createMatch({
        team1_name: team1Name,
        team2_name: team2Name,
        venue: venue,
        total_overs: totalOvers,
        status: 'live',
        match_type: 'friendly',
        city: 'Local',
        match_date: new Date().toISOString(),
        match_time: new Date().toLocaleTimeString(),
        ball_type: 'tennis'
      } as any);

      toast.success('Match created and synced!');
      fetchMatches(); // Refresh local state
      return newMatch.id;
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error('Failed to create match');
      return null;
    }
  };

  // Create innings for a match - MockDB handling
  // For now, mockDB doesn't explicitly store "Innings" objects separate from match/balls,
  // but we can simulate it if needed or just return a generated ID.
  const createInnings = async (
    matchId: string,
    inningsNumber: number,
    battingTeamName: string,
    bowlingTeamName: string
  ): Promise<string | null> => {
    // Mock successful innings creation
    return `${matchId}_innings_${inningsNumber}`;
  };

  // Update innings score - handled via ball recording in mockDB, 
  // but this function might be used for manual overrides. 
  // We can leave it as a no-op or implement if we add innings to mockDB.
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
    // No-op for mockDB simplified flow, stats are calculated from balls
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
      const matchId = inningsId.split('_mappings_')[0]; // simple hack if we formatted ID that way, or pass matchId context
      // Actually, let's assume we can get matchId from context or passed params.
      // But the signature is fixed. 
      // For mockDB integration, we'll try to extract matchId or use specialized logic.
      const effectiveMatchId = inningsId.includes('_') ? inningsId.split('_')[0] : inningsId;

      mockDB.saveBall({
        match_id: effectiveMatchId,
        over_number: overNumber,
        ball_number: ballNumber,
        runs_scored: runs,
        is_wicket: isWicket,
        extras_type: extrasType as any,
        batsman_name: batsmanName,
        bowler_name: bowlerName,
        wicket_type: isWicket ? 'bowled' : undefined // default
      } as any);

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
      mockDB.updateMatch(matchId, {
        status: 'completed',
        result,
        winner_name: winnerName || null,
      });
      toast.success('Match completed and saved!');
      fetchMatches();
    } catch (error) {
      console.error('Error completing match:', error);
      toast.error('Failed to save match result');
    }
  };

  // Get match details with innings
  const getMatchWithInnings = async (matchId: string) => {
    try {
      const match = mockDB.getMatch(matchId);
      if (!match) return null;

      // Mock innings data derived from balls or just return skeletons
      return {
        match: match as any,
        innings: [
          {
            id: `${matchId}_innings_1`,
            match_id: matchId,
            innings_number: 1,
            batting_team_name: match.team1_name,
            bowling_team_name: match.team2_name,
            // These should ideally be calculated
            runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0, fours: 0, sixes: 0
          },
          {
            id: `${matchId}_innings_2`,
            match_id: matchId,
            innings_number: 2,
            batting_team_name: match.team2_name,
            bowling_team_name: match.team1_name,
            runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0, fours: 0, sixes: 0
          }
        ],
      };
    } catch (error) {
      console.error('Error fetching match details:', error);
      return null;
    }
  };

  // Simple polling
  useEffect(() => {
    fetchMatches();
    const interval = setInterval(() => {
      fetchMatches();
    }, 2000); // Poll faster for mock local check

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

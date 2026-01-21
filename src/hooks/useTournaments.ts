import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Tournament {
  id: string;
  name: string;
  format: string;
  overs: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  start_date: string;
  end_date: string | null;
  venue: string | null;
  organizer_id: string | null;
  banner_url: string | null;
  rules: string | null;
  max_teams: number;
  entry_fee: number;
  prize_pool: string | null;
  created_at: string;
  teams_count?: number;
}

export interface TournamentTeam {
  id: string;
  tournament_id: string;
  team_id: string;
  group_name: string | null;
  seed: number | null;
  status: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  matches_tied: number;
  points: number;
  net_run_rate: number;
  team?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;

      // Get team counts for each tournament
      const tournamentsWithCounts = await Promise.all(
        (data || []).map(async (tournament: any) => {
          const { count } = await supabase
            .from('tournament_teams')
            .select('*', { count: 'exact', head: true })
            .eq('tournament_id', tournament.id);

          return {
            ...tournament,
            teams_count: count || 0,
          };
        })
      );

      setTournaments(tournamentsWithCounts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTournament = async (tournamentData: Partial<Tournament>) => {
    if (!user) throw new Error('Must be logged in');

    const insertData = {
      name: tournamentData.name || 'Untitled Tournament',
      format: tournamentData.format || 'T20',
      overs: tournamentData.overs || 20,
      status: tournamentData.status || 'upcoming',
      start_date: tournamentData.start_date || new Date().toISOString().split('T')[0],
      end_date: tournamentData.end_date || null,
      venue: tournamentData.venue || null,
      organizer_id: user.id,
      banner_url: tournamentData.banner_url || null,
      rules: tournamentData.rules || null,
      max_teams: tournamentData.max_teams || 16,
      entry_fee: tournamentData.entry_fee || 0,
      prize_pool: tournamentData.prize_pool || null,
    };

    const { data, error } = await supabase
      .from('tournaments')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    await fetchTournaments();
    return data;
  };

  const getTournamentDetails = async (tournamentId: string) => {
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    if (tournamentError) throw tournamentError;

    const { data: teams, error: teamsError } = await supabase
      .from('tournament_teams')
      .select(`
        *,
        teams:team_id (
          id,
          name,
          logo_url
        )
      `)
      .eq('tournament_id', tournamentId)
      .order('points', { ascending: false });

    if (teamsError) throw teamsError;

    return {
      tournament,
      teams: (teams || []).map((t: any) => ({
        ...t,
        team: t.teams,
      })),
    };
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  return {
    tournaments,
    isLoading,
    error,
    createTournament,
    getTournamentDetails,
    refresh: fetchTournaments,
  };
}

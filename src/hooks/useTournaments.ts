import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDB, Tournament as PersistedTournament } from '@/services/mockDatabase';

export type { PersistedTournament as Tournament };

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
    owner_id?: string;
  };
}

import api from '@/services/api';

export function useTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      // Fetch from API instead of mockDB
      const { data } = await api.get<any[]>('/tournaments');

      const tournamentsWithCounts = data.map(tournament => {
        // Hybrid: Teams still from mockDB for now
        const teams = mockDB.getTournamentTeams(tournament.id);
        return {
          ...tournament,
          start_date: tournament.start_date || tournament.startDate, // Handle both cases just in case
          end_date: tournament.end_date || tournament.endDate,
          format: (tournament.overs || tournament.matchFormat) + ' Overs',
          teams_count: teams.length,
        };
      });

      setTournaments(tournamentsWithCounts);
    } catch (err: any) {
      console.error("Error fetching tournaments:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTournament = async (tournamentData: any) => {
    if (!user) throw new Error('Must be logged in');

    // API call to create tournament
    const { data: newTournament } = await api.post('/tournaments', {
      name: tournamentData.name || 'Untitled Tournament',
      venue: tournamentData.venue || tournamentData.city || 'Local',
      start_date: tournamentData.start_date || new Date().toISOString(),
      end_date: tournamentData.end_date || new Date().toISOString(),
      format: tournamentData.format || 'T20',
      overs: tournamentData.overs || 20,
      max_teams: tournamentData.max_teams || 8,
      entry_fee: tournamentData.entry_fee || 0,
      prize_pool: tournamentData.prize_pool || '',
      rules: tournamentData.rules || '',
      orgId: user.id,
    });

    await fetchTournaments();
    return newTournament;
  };

  const getTournamentDetails = async (tournamentId: string) => {
    // API call for details
    const { data: tournament } = await api.get(`/tournaments/${tournamentId}`);
    if (!tournament) throw new Error('Tournament not found');

    // Hybrid: Teams from mockDB
    const teams = mockDB.getTournamentTeams(tournamentId);
    const registeredTeams = mockDB.getTeams();

    return {
      tournament: {
        ...tournament,
        start_date: tournament.start_date,
        end_date: tournament.end_date,
      },
      teams: teams.map(t => ({
        ...t,
        tournament_id: t.tournamentId,
        team_id: t.teamId,
        group_name: t.group || null,
        seed: null,
        matches_played: 0,
        matches_won: 0,
        matches_lost: 0,
        matches_tied: 0,
        points: 0,
        net_run_rate: 0,
        team: registeredTeams.find(rt => rt.id === t.teamId)
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

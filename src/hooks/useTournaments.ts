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

export function useTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTournaments = async () => {
    setIsLoading(true);
    try {
      const data = mockDB.getTournaments();

      const tournamentsWithCounts = data.map(tournament => {
        const teams = mockDB.getTournamentTeams(tournament.id);
        return {
          ...tournament,
          start_date: tournament.startDate,
          end_date: tournament.endDate,
          format: tournament.matchFormat + ' Overs',
          teams_count: teams.length,
        };
      });

      setTournaments(tournamentsWithCounts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTournament = async (tournamentData: any) => {
    if (!user) throw new Error('Must be logged in');

    const newTournament = mockDB.createTournament({
      name: tournamentData.name || 'Untitled Tournament',
      city: tournamentData.city || 'Local',
      startDate: tournamentData.start_date || new Date().toISOString(),
      endDate: tournamentData.end_date || new Date().toISOString(),
      ballType: tournamentData.ballType || 'tennis',
      matchFormat: tournamentData.overs || 20,
      matchType: tournamentData.matchType || 'league',
      orgId: user.id,
    });

    await fetchTournaments();
    return newTournament;
  };

  const getTournamentDetails = async (tournamentId: string) => {
    const tournament = mockDB.getTournament(tournamentId);
    if (!tournament) throw new Error('Tournament not found');

    const teams = mockDB.getTournamentTeams(tournamentId);
    const registeredTeams = mockDB.getTeams();

    return {
      tournament: {
        ...tournament,
        start_date: tournament.startDate,
        end_date: tournament.endDate,
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

import { useState, useCallback } from 'react';
import { mockDB, generateUUID } from '@/services/mockDatabase';
import { Team } from '@/types/cricket';

interface TeamPlayer {
  id: string;
  team_id: string;
  user_id: string | null;
  mobile_number: string;
  player_name: string;
  role: 'admin' | 'captain' | 'player';
  status: 'invited' | 'pending' | 'joined';
  invited_by: string | null;
  joined_at: string | null;
  created_at: string;
}

interface CreateTeamData {
  name: string;
  logo_url?: string;
}

interface AddPlayerData {
  team_id: string;
  player_name: string;
  mobile_number: string;
  role?: 'admin' | 'captain' | 'player';
}

const STORAGE_KEY_PLAYERS = 'cric_hub_team_players';

export const useTeamManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = useCallback(async (data: CreateTeamData, userId: string): Promise<any | null> => {
    setLoading(true);
    setError(null);

    try {
      const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      const newTeam = mockDB.createTeam(data.name);

      // Mock additional fields
      const playersJson = localStorage.getItem(STORAGE_KEY_PLAYERS);
      const players = playersJson ? JSON.parse(playersJson) : [];

      const newPlayer: TeamPlayer = {
        id: generateUUID(),
        team_id: newTeam.id,
        user_id: userId,
        mobile_number: 'creator',
        player_name: 'Team Admin',
        role: 'admin',
        status: 'joined',
        invited_by: null,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      players.push(newPlayer);
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));

      return {
        ...newTeam,
        team_code: generateCode(),
        created_by: userId,
        created_at: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error in createTeam:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeams = useCallback(async (userId: string): Promise<any[]> => {
    setLoading(true);
    setError(null);

    try {
      const allTeams = mockDB.getTeams();
      // For mock, return all as we don't strictly filter by user_id yet
      return allTeams;
    } catch (err) {
      console.error('Error in getTeams:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeamDetails = useCallback(async (teamId: string): Promise<{ team: any | null; players: TeamPlayer[] }> => {
    setLoading(true);
    setError(null);

    try {
      const teams = mockDB.getTeams();
      const team = teams.find(t => t.id === teamId);

      const playersJson = localStorage.getItem(STORAGE_KEY_PLAYERS);
      const allPlayers: TeamPlayer[] = playersJson ? JSON.parse(playersJson) : [];
      const players = allPlayers.filter(p => p.team_id === teamId);

      return {
        team: team || null,
        players
      };
    } catch (err) {
      console.error('Error in getTeamDetails:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return { team: null, players: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const addPlayer = useCallback(async (data: AddPlayerData, invitedBy: string): Promise<TeamPlayer | null> => {
    setLoading(true);
    setError(null);

    try {
      const updatedTeam = mockDB.addPlayerToTeam(data.team_id, data.player_name);

      const playersJson = localStorage.getItem(STORAGE_KEY_PLAYERS);
      const players: TeamPlayer[] = playersJson ? JSON.parse(playersJson) : [];

      const newPlayer: TeamPlayer = {
        id: generateUUID(),
        team_id: data.team_id,
        user_id: null,
        mobile_number: data.mobile_number,
        player_name: data.player_name,
        role: data.role || 'player',
        status: 'joined', // Auto-join for mock simplicity
        invited_by: invitedBy,
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      players.push(newPlayer);
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));

      return newPlayer;
    } catch (err) {
      console.error('Error in addPlayer:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlayerRole = useCallback(async (playerId: string, role: 'admin' | 'captain' | 'player'): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const playersJson = localStorage.getItem(STORAGE_KEY_PLAYERS);
      const players: TeamPlayer[] = playersJson ? JSON.parse(playersJson) : [];
      const index = players.findIndex(p => p.id === playerId);

      if (index !== -1) {
        players[index].role = role;
        localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error in updatePlayerRole:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removePlayer = useCallback(async (playerId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const playersJson = localStorage.getItem(STORAGE_KEY_PLAYERS);
      const players: TeamPlayer[] = playersJson ? JSON.parse(playersJson) : [];
      const playerToRemove = players.find(p => p.id === playerId);

      if (playerToRemove) {
        mockDB.removePlayerFromTeam(playerToRemove.team_id, playerToRemove.player_name);
      }

      const filtered = players.filter(p => p.id !== playerId);
      localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(filtered));
      return true;
    } catch (err) {
      console.error('Error in removePlayer:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinTeamByCode = useCallback(async (
    teamCode: string,
    userId: string,
    mobileNumber: string,
    playerName: string
  ): Promise<{ success: boolean; message: string }> => {
    // Mock successful join
    return { success: true, message: 'Joined team successfully!' };
  }, []);

  const getInvitedTeams = useCallback(async (mobileNumber: string) => {
    return [];
  }, []);

  return {
    loading,
    error,
    createTeam,
    getTeams,
    getTeamDetails,
    addPlayer,
    updatePlayerRole,
    removePlayer,
    joinTeamByCode,
    getInvitedTeams,
  };
};
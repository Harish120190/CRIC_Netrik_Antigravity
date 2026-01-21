import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  team_code: string;
  qr_code_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

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

export const useTeamManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = useCallback(async (data: CreateTeamData, userId: string): Promise<Team | null> => {
    setLoading(true);
    setError(null);

    try {
      // Generate team code client-side since DB column requires it
      const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: data.name,
          logo_url: data.logo_url || null,
          created_by: userId,
          team_code: generateCode(),
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        setError(teamError.message);
        return null;
      }

      // Add creator as admin player
      const { error: playerError } = await supabase
        .from('team_players')
        .insert({
          team_id: team.id,
          user_id: userId,
          mobile_number: 'creator',
          player_name: 'Team Admin',
          role: 'admin',
          status: 'joined',
          joined_at: new Date().toISOString(),
        });

      if (playerError) {
        console.error('Error adding creator as admin:', playerError);
      }

      // Generate QR code via edge function
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.access_token) {
        const response = await supabase.functions.invoke('generate-qr', {
          body: { teamId: team.id, teamCode: team.team_code },
        });

        if (response.data?.qrCodeUrl) {
          team.qr_code_url = response.data.qrCodeUrl;
        }
      }

      return team as Team;
    } catch (err) {
      console.error('Error in createTeam:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeams = useCallback(async (userId: string): Promise<Team[]> => {
    setLoading(true);
    setError(null);

    try {
      // Get teams where user is creator or member
      const { data: playerTeams, error: playerError } = await supabase
        .from('team_players')
        .select('team_id')
        .eq('user_id', userId);

      if (playerError) {
        console.error('Error fetching player teams:', playerError);
        setError(playerError.message);
        return [];
      }

      const teamIds = playerTeams?.map(p => p.team_id) || [];

      const { data: createdTeams, error: createdError } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', userId);

      if (createdError) {
        console.error('Error fetching created teams:', createdError);
      }

      const { data: memberTeams, error: memberError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);

      if (memberError) {
        console.error('Error fetching member teams:', memberError);
      }

      // Merge and dedupe
      const allTeams = [...(createdTeams || []), ...(memberTeams || [])];
      const uniqueTeams = allTeams.filter((team, index, self) =>
        index === self.findIndex(t => t.id === team.id)
      );

      return uniqueTeams as Team[];
    } catch (err) {
      console.error('Error in getTeams:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeamDetails = useCallback(async (teamId: string): Promise<{ team: Team | null; players: TeamPlayer[] }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) {
        console.error('Error fetching team:', teamError);
        setError(teamError.message);
        return { team: null, players: [] };
      }

      const { data: players, error: playersError } = await supabase
        .from('team_players')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: true });

      if (playersError) {
        console.error('Error fetching players:', playersError);
      }

      return { 
        team: team as Team, 
        players: (players || []) as TeamPlayer[] 
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
      // Check if player already exists in team
      const { data: existing, error: existingError } = await supabase
        .from('team_players')
        .select('*')
        .eq('team_id', data.team_id)
        .eq('mobile_number', data.mobile_number)
        .single();

      if (existing) {
        setError('Player already exists in this team');
        return null;
      }

      // Check if user exists with this mobile number
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('mobile_number', data.mobile_number)
        .single();

      const { data: player, error: insertError } = await supabase
        .from('team_players')
        .insert({
          team_id: data.team_id,
          user_id: userProfile?.id || null,
          mobile_number: data.mobile_number,
          player_name: data.player_name,
          role: data.role || 'player',
          status: userProfile ? 'pending' : 'invited',
          invited_by: invitedBy,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error adding player:', insertError);
        setError(insertError.message);
        return null;
      }

      return player as TeamPlayer;
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
      const { error: updateError } = await supabase
        .from('team_players')
        .update({ role })
        .eq('id', playerId);

      if (updateError) {
        console.error('Error updating player role:', updateError);
        setError(updateError.message);
        return false;
      }

      return true;
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
      const { error: deleteError } = await supabase
        .from('team_players')
        .delete()
        .eq('id', playerId);

      if (deleteError) {
        console.error('Error removing player:', deleteError);
        setError(deleteError.message);
        return false;
      }

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
    setLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'getTeamByCode',
          teamCode,
        },
      });

      if (response.error || !response.data?.team) {
        setError('Team not found');
        return { success: false, message: 'Team not found' };
      }

      const joinResponse = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'joinTeam',
          teamId: response.data.team.id,
          userId,
          mobileNumber,
          playerName,
        },
      });

      if (joinResponse.error) {
        setError(joinResponse.error.message);
        return { success: false, message: joinResponse.error.message };
      }

      return { success: true, message: 'Joined team successfully!' };
    } catch (err) {
      console.error('Error in joinTeamByCode:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvitedTeams = useCallback(async (mobileNumber: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'getInvitedTeams',
          mobileNumber,
        },
      });

      if (response.error) {
        setError(response.error.message);
        return [];
      }

      return response.data?.invites || [];
    } catch (err) {
      console.error('Error in getInvitedTeams:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setLoading(false);
    }
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
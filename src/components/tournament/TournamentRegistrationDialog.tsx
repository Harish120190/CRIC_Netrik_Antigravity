import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

interface TournamentRegistrationDialogProps {
  tournamentId: string;
  tournamentName: string;
  onRegistered?: () => void;
}

export function TournamentRegistrationDialog({
  tournamentId,
  tournamentName,
  onRegistered,
}: TournamentRegistrationDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTeams, setIsFetchingTeams] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchUserTeams();
    }
  }, [open, user]);

  const fetchUserTeams = async () => {
    setIsFetchingTeams(true);
    try {
      // Get teams the user owns
      const { data: userTeams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, logo_url')
        .eq('created_by', user?.id);

      if (teamsError) throw teamsError;

      // Get teams already in the tournament
      const { data: existingTeams } = await supabase
        .from('tournament_teams')
        .select('team_id')
        .eq('tournament_id', tournamentId);

      // Get teams with pending registrations
      const { data: pendingRegs } = await supabase
        .from('tournament_registrations')
        .select('team_id')
        .eq('tournament_id', tournamentId)
        .eq('status', 'pending');

      // Get teams with pending invites
      const { data: pendingInvites } = await supabase
        .from('tournament_invites')
        .select('team_id')
        .eq('tournament_id', tournamentId)
        .eq('status', 'pending');

      const existingIds = new Set([
        ...(existingTeams || []).map((t) => t.team_id),
        ...(pendingRegs || []).map((r) => r.team_id),
        ...(pendingInvites || []).map((i) => i.team_id),
      ]);

      // Filter out teams already in tournament or with pending requests
      const availableTeams = (userTeams || []).filter(
        (team) => !existingIds.has(team.id)
      );

      setTeams(availableTeams);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setIsFetchingTeams(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTeamId || !user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('tournament_registrations').insert({
        tournament_id: tournamentId,
        team_id: selectedTeamId,
        requested_by: user.id,
        message: message.trim() || null,
      });

      if (error) throw error;

      // Create notification for organizer
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('organizer_id')
        .eq('id', tournamentId)
        .single();

      const selectedTeam = teams.find((t) => t.id === selectedTeamId);

      if (tournament?.organizer_id) {
        await supabase.from('notifications').insert({
          user_id: tournament.organizer_id,
          type: 'tournament_registration',
          title: 'New Registration Request',
          message: `${selectedTeam?.name} has requested to join ${tournamentName}`,
          data: {
            tournament_id: tournamentId,
            team_id: selectedTeamId,
          },
        });
      }

      toast.success('Registration request sent!');
      setOpen(false);
      setSelectedTeamId('');
      setMessage('');
      onRegistered?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send registration request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Register Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register for {tournamentName}</DialogTitle>
          <DialogDescription>
            Select a team you manage to request registration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {isFetchingTeams ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : teams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              You don't have any teams eligible for registration. Either you don't
              own any teams, or they're already registered/invited.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Select Team</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <Textarea
                  placeholder="Add a message to the organizer..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!selectedTeamId || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

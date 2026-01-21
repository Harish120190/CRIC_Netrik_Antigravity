import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, Send, Users, Check, X, Loader2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  player_count: number;
}

interface TournamentInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: string;
  tournamentName: string;
  existingTeamIds: string[];
}

export function TournamentInviteDialog({
  open,
  onOpenChange,
  tournamentId,
  tournamentName,
  existingTeamIds,
}: TournamentInviteDialogProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [pendingInvites, setPendingInvites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTeamsAndInvites();
    }
  }, [open, tournamentId]);

  const fetchTeamsAndInvites = async () => {
    setIsLoading(true);
    try {
      // Fetch all teams with player counts
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          logo_url,
          team_players(count)
        `)
        .order('name');

      if (teamsError) throw teamsError;

      // Fetch existing pending invites for this tournament
      const { data: invitesData, error: invitesError } = await supabase
        .from('tournament_invites')
        .select('team_id')
        .eq('tournament_id', tournamentId)
        .eq('status', 'pending');

      if (invitesError) throw invitesError;

      const teamsWithCounts = (teamsData || []).map((team: any) => ({
        id: team.id,
        name: team.name,
        logo_url: team.logo_url,
        player_count: team.team_players?.[0]?.count || 0,
      }));

      setTeams(teamsWithCounts);
      setPendingInvites((invitesData || []).map((i: any) => i.team_id));
    } catch (error: any) {
      toast.error('Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !existingTeamIds.includes(team.id)
  );

  const toggleTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const sendInvites = async () => {
    if (!user || selectedTeams.length === 0) return;

    setIsSending(true);
    try {
      const invites = selectedTeams.map((teamId) => ({
        tournament_id: tournamentId,
        team_id: teamId,
        invited_by: user.id,
        message: message || null,
      }));

      const { error } = await supabase.from('tournament_invites').insert(invites);

      if (error) throw error;

      // Create notifications for team owners
      const { data: teamOwners } = await supabase
        .from('teams')
        .select('id, name, created_by')
        .in('id', selectedTeams);

      if (teamOwners) {
        const notifications = teamOwners.map((team: any) => ({
          user_id: team.created_by,
          type: 'tournament_invite',
          title: 'Tournament Invitation',
          message: `Your team "${team.name}" has been invited to join ${tournamentName}`,
          data: { tournament_id: tournamentId, team_id: team.id },
        }));

        await supabase.from('notifications').insert(notifications);
      }

      toast.success(`Sent ${selectedTeams.length} invitation(s)`);
      setSelectedTeams([]);
      setMessage('');
      onOpenChange(false);
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('Some teams have already been invited');
      } else {
        toast.error('Failed to send invitations');
      }
    } finally {
      setIsSending(false);
    }
  };

  const getTeamStatus = (teamId: string) => {
    if (existingTeamIds.includes(teamId)) return 'registered';
    if (pendingInvites.includes(teamId)) return 'pending';
    return 'available';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Teams</DialogTitle>
          <DialogDescription>
            Select teams to invite to {tournamentName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selected teams preview */}
          {selectedTeams.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTeams.map((teamId) => {
                const team = teams.find((t) => t.id === teamId);
                return (
                  <Badge key={teamId} variant="secondary" className="gap-1">
                    {team?.name}
                    <button onClick={() => toggleTeam(teamId)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Teams list */}
          <ScrollArea className="h-64 border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-sm">No available teams found</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredTeams.map((team) => {
                  const status = getTeamStatus(team.id);
                  const isSelected = selectedTeams.includes(team.id);
                  const isPending = status === 'pending';

                  return (
                    <button
                      key={team.id}
                      onClick={() => !isPending && toggleTeam(team.id)}
                      disabled={isPending}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border border-primary'
                          : isPending
                          ? 'bg-muted opacity-60 cursor-not-allowed'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{team.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {team.player_count} players
                        </p>
                      </div>
                      {isPending && (
                        <Badge variant="outline" className="text-xs">
                          Invited
                        </Badge>
                      )}
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Optional message */}
          <Textarea
            placeholder="Add a message (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
          />

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={sendInvites}
              disabled={selectedTeams.length === 0 || isSending}
              className="flex-1 gap-2"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send {selectedTeams.length > 0 && `(${selectedTeams.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

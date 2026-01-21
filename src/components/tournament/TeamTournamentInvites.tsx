import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Trophy, Check, X, Mail, Loader2 } from 'lucide-react';

interface TournamentInvite {
  id: string;
  tournament_id: string;
  team_id: string;
  status: string;
  message: string | null;
  created_at: string;
  tournament: {
    id: string;
    name: string;
    format: string;
    start_date: string;
    venue: string | null;
  };
  team: {
    id: string;
    name: string;
  };
}

interface TeamTournamentInvitesProps {
  teamId?: string;
}

export function TeamTournamentInvites({ teamId }: TeamTournamentInvitesProps) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<TournamentInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user, teamId]);

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      // Get teams the user owns
      let query = supabase
        .from('tournament_invites')
        .select(`
          *,
          tournaments:tournament_id (
            id,
            name,
            format,
            start_date,
            venue
          ),
          teams:team_id (
            id,
            name,
            created_by
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (teamId) {
        query = query.eq('team_id', teamId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter to only show invites for teams the user owns
      const userInvites = (data || [])
        .filter((invite: any) => invite.teams?.created_by === user?.id)
        .map((invite: any) => ({
          ...invite,
          tournament: invite.tournaments,
          team: invite.teams,
        }));

      setInvites(userInvites);
    } catch (error: any) {
      console.error('Failed to fetch invites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const respondToInvite = async (inviteId: string, accept: boolean) => {
    setProcessingId(inviteId);
    try {
      const invite = invites.find((i) => i.id === inviteId);
      if (!invite) return;

      // Update invite status
      const { error: updateError } = await supabase
        .from('tournament_invites')
        .update({
          status: accept ? 'accepted' : 'declined',
          responded_at: new Date().toISOString(),
        })
        .eq('id', inviteId);

      if (updateError) throw updateError;

      // If accepted, add team to tournament
      if (accept) {
        const { error: joinError } = await supabase
          .from('tournament_teams')
          .insert({
            tournament_id: invite.tournament_id,
            team_id: invite.team_id,
            status: 'confirmed',
          });

        if (joinError) throw joinError;
      }

      // Update local state
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));

      toast.success(
        accept
          ? `Joined ${invite.tournament.name}!`
          : 'Invitation declined'
      );
    } catch (error: any) {
      toast.error('Failed to respond to invitation');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (invites.length === 0) {
    return null; // Don't show anything if no pending invites
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Tournament Invitations
          <Badge variant="secondary">{invites.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="p-4 rounded-lg bg-background border space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{invite.tournament.name}</p>
                <p className="text-sm text-muted-foreground">
                  {invite.tournament.format} • {new Date(invite.tournament.start_date).toLocaleDateString()}
                </p>
                {invite.tournament.venue && (
                  <p className="text-sm text-muted-foreground">{invite.tournament.venue}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  For team: <span className="font-medium">{invite.team.name}</span>
                </p>
              </div>
            </div>

            {invite.message && (
              <p className="text-sm text-muted-foreground italic">
                "{invite.message}"
              </p>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => respondToInvite(invite.id, false)}
                disabled={processingId === invite.id}
              >
                <X className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => respondToInvite(invite.id, true)}
                disabled={processingId === invite.id}
              >
                {processingId === invite.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

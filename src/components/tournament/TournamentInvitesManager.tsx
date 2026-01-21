import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Check, X, Clock, Users, Loader2 } from 'lucide-react';

interface Invite {
  id: string;
  tournament_id: string;
  team_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message: string | null;
  created_at: string;
  responded_at: string | null;
  team: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

interface TournamentInvitesManagerProps {
  tournamentId: string;
  isOrganizer: boolean;
  onInviteAccepted?: () => void;
}

export function TournamentInvitesManager({
  tournamentId,
  isOrganizer,
  onInviteAccepted,
}: TournamentInvitesManagerProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, [tournamentId]);

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_invites')
        .select(`
          *,
          teams:team_id (
            id,
            name,
            logo_url
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvites(
        (data || []).map((invite: any) => ({
          ...invite,
          team: invite.teams,
        }))
      );
    } catch (error: any) {
      toast.error('Failed to load invites');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      const { error } = await supabase
        .from('tournament_invites')
        .delete()
        .eq('id', inviteId);

      if (error) throw error;

      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success('Invitation cancelled');
    } catch (error) {
      toast.error('Failed to cancel invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="gap-1 bg-green-500">
            <Check className="w-3 h-3" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="destructive" className="gap-1">
            <X className="w-3 h-3" />
            Declined
          </Badge>
        );
      default:
        return null;
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
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Mail className="w-8 h-8 mb-2" />
          <p className="text-sm">No invitations sent yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Sent Invitations ({invites.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {invite.team.logo_url ? (
                <img
                  src={invite.team.logo_url}
                  alt={invite.team.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{invite.team.name}</p>
              <p className="text-xs text-muted-foreground">
                Sent {new Date(invite.created_at).toLocaleDateString()}
              </p>
            </div>
            {getStatusBadge(invite.status)}
            {isOrganizer && invite.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => cancelInvite(invite.id)}
                disabled={processingId === invite.id}
              >
                {processingId === invite.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, Loader2, Users, Clock, MessageSquare } from 'lucide-react';

interface Registration {
  id: string;
  tournament_id: string;
  team_id: string;
  status: string;
  message: string | null;
  created_at: string;
  team: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

interface TournamentRegistrationsManagerProps {
  tournamentId: string;
}

export function TournamentRegistrationsManager({
  tournamentId,
}: TournamentRegistrationsManagerProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [responseMessages, setResponseMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRegistrations();
  }, [tournamentId]);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_registrations')
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

      setRegistrations(
        (data || []).map((r: any) => ({
          ...r,
          team: r.teams,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResponse = async (registrationId: string, approve: boolean) => {
    setProcessingId(registrationId);
    try {
      const registration = registrations.find((r) => r.id === registrationId);
      if (!registration) return;

      const responseMessage = responseMessages[registrationId]?.trim() || null;

      // Update registration status
      const { error: updateError } = await supabase
        .from('tournament_registrations')
        .update({
          status: approve ? 'approved' : 'rejected',
          response_message: responseMessage,
          responded_at: new Date().toISOString(),
        })
        .eq('id', registrationId);

      if (updateError) throw updateError;

      // If approved, add team to tournament
      if (approve) {
        const { error: joinError } = await supabase
          .from('tournament_teams')
          .insert({
            tournament_id: tournamentId,
            team_id: registration.team_id,
            status: 'confirmed',
          });

        if (joinError) throw joinError;
      }

      // Get tournament name for notification
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('name')
        .eq('id', tournamentId)
        .single();

      // Notify team owner
      const { data: team } = await supabase
        .from('teams')
        .select('created_by')
        .eq('id', registration.team_id)
        .single();

      if (team?.created_by) {
        await supabase.from('notifications').insert({
          user_id: team.created_by,
          type: 'tournament_registration_response',
          title: approve ? 'Registration Approved!' : 'Registration Declined',
          message: approve
            ? `Your team ${registration.team.name} has been approved to join ${tournament?.name}`
            : `Your registration for ${registration.team.name} to ${tournament?.name} was declined`,
          data: {
            tournament_id: tournamentId,
            team_id: registration.team_id,
            approved: approve,
          },
        });
      }

      // Update local state
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registrationId
            ? { ...r, status: approve ? 'approved' : 'rejected' }
            : r
        )
      );

      toast.success(approve ? 'Registration approved!' : 'Registration declined');
    } catch (error: any) {
      toast.error('Failed to process registration');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRegistrations = registrations.filter((r) => r.status === 'pending');
  const processedRegistrations = registrations.filter((r) => r.status !== 'pending');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Registrations
            {pendingRegistrations.length > 0 && (
              <Badge variant="secondary">{pendingRegistrations.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRegistrations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No pending registration requests
            </p>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 rounded-lg border bg-card space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{reg.team.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested {new Date(reg.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {reg.message && (
                    <div className="flex gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                      <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="italic">"{reg.message}"</p>
                    </div>
                  )}

                  <Textarea
                    placeholder="Add a response message (optional)..."
                    value={responseMessages[reg.id] || ''}
                    onChange={(e) =>
                      setResponseMessages((prev) => ({
                        ...prev,
                        [reg.id]: e.target.value,
                      }))
                    }
                    rows={2}
                    className="text-sm"
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleResponse(reg.id, false)}
                      disabled={processingId === reg.id}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleResponse(reg.id, true)}
                      disabled={processingId === reg.id}
                    >
                      {processingId === reg.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Registrations */}
      {processedRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registration History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processedRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{reg.team.name}</span>
                  </div>
                  <Badge
                    variant={reg.status === 'approved' ? 'default' : 'secondary'}
                    className={
                      reg.status === 'approved'
                        ? 'bg-green-500/10 text-green-600'
                        : 'bg-red-500/10 text-red-600'
                    }
                  >
                    {reg.status === 'approved' ? 'Approved' : 'Declined'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

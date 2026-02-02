import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Mail, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTournaments, Tournament, TournamentTeam } from '@/hooks/useTournaments';
import TournamentPointsTable from '@/components/tournament/TournamentPointsTable';
import TournamentMatches from '@/components/tournament/TournamentMatches';
import TournamentTeamsList from '@/components/tournament/TournamentTeamsList';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import { TournamentInviteDialog } from '@/components/tournament/TournamentInviteDialog';
import { TournamentInvitesManager } from '@/components/tournament/TournamentInvitesManager';
import { TournamentRegistrationDialog } from '@/components/tournament/TournamentRegistrationDialog';
import { TournamentRegistrationsManager } from '@/components/tournament/TournamentRegistrationsManager';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { mockDB } from '@/services/mockDatabase';
import { TournamentShareDialog } from '@/components/tournament/TournamentShareDialog';

type TournamentStatus = 'draft' | 'open_for_registration' | 'ongoing' | 'completed';

const TournamentDetailsPage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTournamentDetails } = useTournaments();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const isOrganizer = user?.id === tournament?.organizer_id;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!tournamentId) return;

      try {
        const data = await getTournamentDetails(tournamentId);
        setTournament({
          ...data.tournament,
          status: data.tournament.status as TournamentStatus
        });
        setTeams(data.teams.map(t => ({
          ...t,
          team: {
            ...t.team,
            logo_url: t.team.logo_url || '' // Ensure string
          }
        })));
      } catch (err) {
        console.error('Failed to fetch tournament:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [tournamentId]);

  const getStatusBadge = (status: string) => {
    const styles = {
      open_for_registration: 'bg-green-100 text-green-800',
      ongoing: 'bg-live/10 text-live',
      completed: 'bg-muted text-muted-foreground',
      draft: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  // Check if user has a pending team
  const pendingTeam = teams.find(t => t.status === 'pending' && t.team?.owner_id === user?.id);

  const handleWithdraw = async (tournamentTeamId: string) => {
    mockDB.updateTournamentTeam(tournamentTeamId, { status: 'rejected', rejection_reason: 'Withdrawn by Captain' });
    const data = await getTournamentDetails(tournamentId!);
    setTeams(data.teams.map(t => ({
      ...t,
      team: {
        ...t.team!,
        logo_url: t.team?.logo_url || '',
        owner_id: t.team?.owner_id
      }
    })));
  };

  // Auto-open registration dialog if coming from shared link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('register') === 'true' && user && tournament?.status === 'open_for_registration') {
      // Small delay to ensure UI is ready
      setTimeout(() => {
        const registerButton = document.querySelector('[data-register-trigger]') as HTMLElement;
        registerButton?.click();
      }, 500);
    }
  }, [tournament, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Tournament Not Found</h2>
        <Button onClick={() => navigate('/tournaments')}>Back to Tournaments</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-primary shadow-lg">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-primary-foreground/80">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pb-6">
          <span className={cn(
            "inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2",
            getStatusBadge(tournament.status)
          )}>
            {tournament.status.replace(/_/g, ' ').toUpperCase()}
          </span>
          <h1 className="text-2xl font-bold text-primary-foreground mb-2">
            {tournament.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
            {tournament.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {tournament.venue}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(tournament.start_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {teams.length} teams
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-4">
        <div className="bg-card rounded-xl p-4 shadow-card grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{tournament.format}</p>
            <p className="text-xs text-muted-foreground">Format</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-2xl font-bold text-foreground">{tournament.overs}</p>
            <p className="text-xs text-muted-foreground">Overs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{tournament.max_teams}</p>
            <p className="text-xs text-muted-foreground">Max Teams</p>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="px-4 mt-6">
        {/* Action Buttons */}
        <div className="mb-4 flex gap-2">
          {isOrganizer ? (
            <>
              <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
                <Mail className="w-4 h-4" />
                Invite Teams
              </Button>
              <TournamentShareDialog
                tournamentId={tournamentId!}
                tournamentName={tournament.name}
              />
            </>
          ) : (
            user && tournament.status === 'open_for_registration' && (
              pendingTeam ? (
                <Button variant="destructive" onClick={() => handleWithdraw(pendingTeam.id)}>
                  Withdraw Request
                </Button>
              ) : (
                <div data-register-trigger>
                  <TournamentRegistrationDialog
                    tournamentId={tournamentId!}
                    tournamentName={tournament.name}
                    maxTeams={tournament.max_teams}
                    onRegistered={() => {
                      getTournamentDetails(tournamentId!).then(data => {
                        setTeams(data.teams.map(t => ({
                          ...t,
                          team: {
                            ...t.team,
                            logo_url: t.team.logo_url || ''
                          }
                        })));
                      });
                    }}
                  />
                </div>
              )
            )
          )}
        </div>

        <Tabs defaultValue="points" className="w-full">
          <TabsList className={cn("w-full grid", isOrganizer ? "grid-cols-6" : "grid-cols-5")}>
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="bracket">Bracket</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            {isOrganizer && <TabsTrigger value="registrations">Requests</TabsTrigger>}
            {isOrganizer && <TabsTrigger value="invites">Invites</TabsTrigger>}
          </TabsList>

          <TabsContent value="points" className="mt-4">
            <TournamentPointsTable teams={teams} />
          </TabsContent>

          <TabsContent value="bracket" className="mt-4">
            <TournamentBracket tournamentId={tournamentId!} />
          </TabsContent>

          <TabsContent value="matches" className="mt-4">
            <TournamentMatches
              tournamentId={tournamentId!}
              teams={teams}
              isOrganizer={user?.id === tournament.organizer_id}
              defaultVenue={tournament.venue || ''}
              defaultOvers={tournament.overs}
              format={tournament.format}
            />
          </TabsContent>

          <TabsContent value="teams" className="mt-4">
            <TournamentTeamsList teams={teams} />
          </TabsContent>

          {isOrganizer && (
            <TabsContent value="registrations" className="mt-4">
              <TournamentRegistrationsManager tournamentId={tournamentId!} />
            </TabsContent>
          )}

          {isOrganizer && (
            <TabsContent value="invites" className="mt-4">
              <TournamentInvitesManager
                tournamentId={tournamentId!}
                isOrganizer={isOrganizer}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Invite Dialog */}
      <TournamentInviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        tournamentId={tournamentId!}
        tournamentName={tournament.name}
        existingTeamIds={teams.map((t) => t.team_id)}
      />
    </div>
  );
};

export default TournamentDetailsPage;

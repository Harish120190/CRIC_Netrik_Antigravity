import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ChevronRight, QrCode, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { TeamTournamentInvites } from '@/components/tournament/TeamTournamentInvites';

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  team_code: string;
  qr_code_url: string | null;
  created_by: string;
  created_at: string;
}

const TeamsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTeams, loading } = useTeamManagement();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!user) return;
      
      setIsLoading(true);
      const userTeams = await getTeams(user.id);
      setTeams(userTeams);
      setIsLoading(false);
    };

    fetchTeams();
  }, [user, getTeams]);

  const TeamCard = ({ team }: { team: Team }) => (
    <button
      onClick={() => navigate(`/teams/${team.id}`)}
      className="w-full bg-card rounded-xl p-4 shadow-card hover:shadow-elevated transition-all duration-200 flex items-center gap-4 text-left"
    >
      <div className="w-14 h-14 rounded-xl gradient-pitch flex items-center justify-center">
        {team.logo_url ? (
          <img src={team.logo_url} alt={team.name} className="w-full h-full rounded-xl object-cover" />
        ) : (
          <span className="text-lg font-bold text-primary-foreground">
            {team.name.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{team.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
            {team.team_code}
          </span>
          {team.created_by === user?.id && (
            <span className="text-xs text-primary font-medium">Admin</span>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Please sign in to view your teams</p>
          <Button onClick={() => navigate('/auth/signin')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="My Teams" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="default"
            size="lg"
            className="h-14 text-base"
            onClick={() => navigate('/teams/create')}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Team
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 text-base"
            onClick={() => navigate('/join-team')}
          >
            <QrCode className="w-5 h-5 mr-2" />
            Join Team
          </Button>
        </div>

        {/* Tournament Invites */}
        <div className="mb-6">
          <TeamTournamentInvites />
        </div>

        {/* Teams List */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-3">Your Teams</h3>
          
          {isLoading || loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : teams.length > 0 ? (
            <div className="space-y-3">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Users className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No Teams Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first team or join an existing one!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default TeamsPage;

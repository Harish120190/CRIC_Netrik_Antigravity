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
      className="w-full bg-card/60 backdrop-blur-md rounded-3xl p-5 shadow-card hover:shadow-glow transition-all duration-500 flex items-center gap-5 text-left border border-border/50 group"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
        {team.logo_url ? (
          <img src={team.logo_url} alt={team.name} className="w-full h-full rounded-2xl object-cover" />
        ) : (
          <Users className="w-8 h-8 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground text-xl tracking-tight truncate mb-1">{team.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
            {team.team_code}
          </span>
          {team.created_by === user?.id && (
            <span className="text-[10px] font-black tracking-widest uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              MANAGER
            </span>
          )}
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
        <ChevronRight className="w-5 h-5" />
      </div>
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

      <main className="px-6 py-6 max-w-7xl mx-auto">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => navigate('/teams/create')}
            className="group relative overflow-hidden h-24 bg-gradient-primary rounded-3xl p-1 shadow-elevated hover:shadow-glow transition-all duration-500"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
            <div className="relative h-full w-full bg-background/5 rounded-[1.4rem] flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-black text-lg leading-tight">Create Team</p>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Start a legacy</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          <button
            onClick={() => navigate('/join-team')}
            className="group relative overflow-hidden h-24 bg-card/60 backdrop-blur-md rounded-3xl p-1 shadow-card hover:shadow-elevated transition-all duration-500 border border-border/50"
          >
            <div className="relative h-full w-full flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-foreground font-black text-lg leading-tight">Join Team</p>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Via QR or Code</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        </div>

        {/* Tournament Invites */}
        <div className="mb-10">
          <TeamTournamentInvites />
        </div>

        {/* Teams List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-foreground tracking-tight">Your Squads</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
              {teams.length} Teams
            </span>
          </div>

          {isLoading || loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card/40 backdrop-blur-sm rounded-[3rem] border border-dashed border-border/50 mx-4">
              <div className="w-24 h-24 mx-auto mb-6 rounded-[2rem] bg-gradient-primary/10 flex items-center justify-center group">
                <Users className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">No Active Squads</h3>
              <p className="text-muted-foreground font-medium max-w-[240px] mx-auto mb-8">
                Experience the thrill of competitive cricket with your own team.
              </p>
              <Button
                onClick={() => navigate('/teams/create')}
                className="rounded-full px-8 h-12 font-black uppercase tracking-widest bg-gradient-primary border-none shadow-glow hover:scale-105 transition-all"
              >
                Assemble Team
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default TeamsPage;

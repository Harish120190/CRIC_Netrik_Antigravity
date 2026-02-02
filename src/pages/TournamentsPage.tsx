import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Trophy } from '@/components/icons/CricketIcons';
import { cn } from '@/lib/utils';
import { mockDB, Tournament } from '@/services/mockDatabase';

interface TournamentsPageProps {
  onNavigate: (path: string) => void;
}

const TournamentsPage: React.FC<TournamentsPageProps> = ({ onNavigate }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allTournaments = mockDB.getTournaments();
    // Filter out drafts
    const publishedTournaments = allTournaments.filter(t =>
      t.status === 'open_for_registration' ||
      t.status === 'ongoing' ||
      t.status === 'completed'
    );
    setTournaments(publishedTournaments);
    setLoading(false);
  }, []);

  const getStatusStyle = (status: Tournament['status']) => {
    switch (status) {
      case 'ongoing':
        return 'bg-live/10 text-live';
      case 'open_for_registration':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => (
    <button
      onClick={() => onNavigate(`/tournaments/${tournament.id}`)}
      className="w-full bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 text-left border border-border/50 group"
    >
      <div className="bg-gradient-primary p-5">
        <div className="flex items-start justify-between">
          <div>
            <span className={cn(
              "inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2",
              getStatusStyle(tournament.status)
            )}>
              {tournament.status.replace(/_/g, ' ').toUpperCase()}
            </span>
            <h3 className="font-bold text-primary-foreground text-lg leading-tight">
              {tournament.name}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {tournament.startDate}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {tournament.city}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
              {tournament.format || 'T20'}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              {/* Mock count for now, or fetch if available */}
              -- teams
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Tournaments" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Create Tournament Button */}
        <Button
          variant="gold"
          size="lg"
          className="w-full mb-6 h-14 text-base"
          onClick={() => onNavigate('/tournaments/create')}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Tournament
        </Button>

        {/* Tournaments List */}
        <section>
          <h3 className="text-lg font-bold text-foreground mb-3">All Tournaments</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Loading tournaments...</p>
            ) : tournaments.length === 0 ? (
              <p className="text-center text-muted-foreground">No tournaments found.</p>
            ) : (
              tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TournamentsPage;

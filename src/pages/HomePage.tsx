import React from 'react';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import MatchList from '@/components/home/MatchList';
import QuickStats from '@/components/match/QuickStats';
import { useMatchPersistence } from '@/hooks/useMatchPersistence';
import { Skeleton } from '@/components/ui/skeleton';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { liveMatches, completedMatches, isLoading } = useMatchPersistence();

  // Convert persisted matches to display format
  const formattedLiveMatches = liveMatches.map(match => ({
    id: match.id,
    title: `${match.team1_name} vs ${match.team2_name}`,
    team1: { name: match.team1_name, runs: 0, wickets: 0, overs: 0 },
    team2: { name: match.team2_name, runs: 0, wickets: 0, overs: 0 },
    venue: match.venue,
    status: 'live' as const,
    currentBatting: 1 as const,
  }));

  const formattedCompletedMatches = completedMatches.slice(0, 3).map(match => ({
    id: match.id,
    title: match.result || `${match.team1_name} vs ${match.team2_name}`,
    team1: { name: match.team1_name, runs: 0, wickets: 0, overs: 0 },
    team2: { name: match.team2_name, runs: 0, wickets: 0, overs: 0 },
    venue: match.venue,
    status: 'completed' as const,
    currentBatting: 1 as const,
  }));

  const userStats = {
    matchesPlayed: completedMatches.length,
    totalRuns: 0,
    totalWickets: 0,
    strikeRate: 0,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="px-4 py-4 max-w-lg mx-auto">
        <HeroSection 
          onStartMatch={() => onNavigate('/match-wizard')}
          onJoinMatch={() => onNavigate('/matches')}
        />

        {/* Quick Stats */}
        <section className="mb-6">
          <h3 className="text-lg font-bold text-foreground mb-3">Your Stats</h3>
          <QuickStats stats={userStats} />
        </section>

        {/* Live Matches */}
        {isLoading ? (
          <div className="space-y-3 mb-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : formattedLiveMatches.length > 0 ? (
          <MatchList 
            title="🔴 Live Now" 
            matches={formattedLiveMatches}
            onMatchPress={(id) => onNavigate(`/match/${id}`)}
          />
        ) : null}

        {/* Recent Matches */}
        {!isLoading && formattedCompletedMatches.length > 0 && (
          <MatchList 
            title="📊 Recent Matches" 
            matches={formattedCompletedMatches}
            onMatchPress={(id) => onNavigate(`/match/${id}`)}
          />
        )}

        {/* No matches state */}
        {!isLoading && formattedLiveMatches.length === 0 && formattedCompletedMatches.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No matches yet. Start your first match!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;

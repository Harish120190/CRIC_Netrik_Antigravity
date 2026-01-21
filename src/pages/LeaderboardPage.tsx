import React, { useState } from 'react';
import { Trophy, Target, Hand, ChevronRight, Medal } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/usePlayerStats';
import { cn } from '@/lib/utils';

interface LeaderboardPageProps {
  onNavigate: (path: string) => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const [category, setCategory] = useState<'runs' | 'wickets' | 'catches'>('runs');
  const { leaderboard, isLoading } = useLeaderboard(category, 50);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'runs':
        return <Trophy className="w-4 h-4" />;
      case 'wickets':
        return <Target className="w-4 h-4" />;
      case 'catches':
        return <Hand className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const getStatValue = (entry: LeaderboardEntry) => {
    switch (category) {
      case 'runs':
        return { value: entry.runs, label: 'runs', secondary: `Avg: ${entry.average}` };
      case 'wickets':
        return { value: entry.wickets, label: 'wkts', secondary: `Econ: ${entry.economy}` };
      case 'catches':
        return { value: entry.catches, label: 'catches', secondary: `Matches: ${entry.matches}` };
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-950';
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800';
      case 3:
        return 'bg-gradient-to-br from-amber-600 to-orange-700 text-amber-100';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const PlayerRow: React.FC<{ entry: LeaderboardEntry }> = ({ entry }) => {
    const stat = getStatValue(entry);
    
    return (
      <button
        onClick={() => onNavigate(`/player/${entry.user_id}`)}
        className="w-full flex items-center gap-3 p-3 bg-card rounded-xl hover:shadow-card transition-all"
      >
        {/* Rank */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          getRankStyle(entry.rank)
        )}>
          {entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
        </div>

        {/* Avatar */}
        <Avatar className="h-10 w-10">
          <AvatarImage src={entry.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {entry.full_name?.charAt(0) || 'P'}
          </AvatarFallback>
        </Avatar>

        {/* Name & Secondary */}
        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-foreground truncate">{entry.full_name}</p>
          <p className="text-xs text-muted-foreground">{stat.secondary}</p>
        </div>

        {/* Main Stat */}
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Leaderboard" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Top 3 Podium */}
        {!isLoading && leaderboard.length >= 3 && (
          <div className="flex justify-center items-end gap-2 mb-6 h-40">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <Avatar className="h-14 w-14 border-2 border-gray-400">
                <AvatarImage src={leaderboard[1]?.avatar_url || undefined} />
                <AvatarFallback className="bg-gray-200 text-gray-700">
                  {leaderboard[1]?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold truncate max-w-[80px]">{leaderboard[1]?.full_name}</p>
                <p className="text-xs text-muted-foreground">{getStatValue(leaderboard[1]).value}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center mt-2">
                <span className="text-2xl font-bold text-gray-800">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mb-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-yellow-400">
                  <AvatarImage src={leaderboard[0]?.avatar_url || undefined} />
                  <AvatarFallback className="bg-yellow-100 text-yellow-700">
                    {leaderboard[0]?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Trophy className="w-6 h-6 text-yellow-500 absolute -top-3 left-1/2 -translate-x-1/2" />
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold truncate max-w-[80px]">{leaderboard[0]?.full_name}</p>
                <p className="text-xs text-muted-foreground">{getStatValue(leaderboard[0]).value}</p>
              </div>
              <div className="w-16 h-24 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-t-lg flex items-center justify-center mt-2">
                <span className="text-3xl font-bold text-amber-950">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <Avatar className="h-12 w-12 border-2 border-amber-600">
                <AvatarImage src={leaderboard[2]?.avatar_url || undefined} />
                <AvatarFallback className="bg-amber-100 text-amber-700">
                  {leaderboard[2]?.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-2 text-center">
                <p className="text-sm font-semibold truncate max-w-[80px]">{leaderboard[2]?.full_name}</p>
                <p className="text-xs text-muted-foreground">{getStatValue(leaderboard[2]).value}</p>
              </div>
              <div className="w-16 h-12 bg-gradient-to-b from-amber-600 to-orange-700 rounded-t-lg flex items-center justify-center mt-2">
                <span className="text-xl font-bold text-amber-100">3</span>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as any)} className="mb-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="runs" className="gap-1">
              <Trophy className="w-4 h-4" />
              Runs
            </TabsTrigger>
            <TabsTrigger value="wickets" className="gap-1">
              <Target className="w-4 h-4" />
              Wickets
            </TabsTrigger>
            <TabsTrigger value="catches" className="gap-1">
              <Hand className="w-4 h-4" />
              Catches
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Player List */}
        <div className="space-y-2">
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No players yet. Start playing to appear on the leaderboard!</p>
            </div>
          ) : (
            leaderboard.slice(3).map((entry) => (
              <PlayerRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;

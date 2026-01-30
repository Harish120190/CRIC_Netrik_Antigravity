import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Target, Hand, ChevronRight, Medal, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/usePlayerStats';
import { useTeamLeaderboard, TeamStats } from '@/hooks/useTeamStats';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface LeaderboardPageProps {
  onNavigate: (path: string) => void;
}

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate }) => {
  const { type } = useParams<{ type?: string }>();
  const [view, setView] = useState<'players' | 'teams'>((type === 'teams' ? 'teams' : 'players'));
  const [category, setCategory] = useState<'runs' | 'wickets' | 'catches'>('runs');
  const { leaderboard: playerLeaderboard, isLoading: playersLoading } = useLeaderboard(category, 50);
  const { leaderboard: teamLeaderboard, isLoading: teamsLoading } = useTeamLeaderboard(50);

  useEffect(() => {
    if (type === 'teams') {
      setView('teams');
    } else if (type === 'players') {
      setView('players');
    }
  }, [type]);

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

  const TeamRow: React.FC<{ entry: TeamStats }> = ({ entry }) => {
    return (
      <button
        onClick={() => onNavigate(`/teams/${entry.id}`)}
        className="w-full flex items-center gap-3 p-3 bg-card rounded-xl hover:shadow-card transition-all"
      >
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          getRankStyle(entry.rank || 0)
        )}>
          {entry.rank && entry.rank <= 3 ? <Medal className="w-4 h-4" /> : entry.rank}
        </div>

        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 text-left min-w-0">
          <p className="font-semibold text-foreground truncate">{entry.name}</p>
          <p className="text-xs text-muted-foreground">W: {entry.won} • L: {entry.lost} • T: {entry.tied}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-primary">{entry.points}</p>
          <p className="text-xs text-muted-foreground uppercase">pts</p>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Leaderboard" />

      <main className="px-6 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Top Performers</h2>
            <p className="text-muted-foreground text-sm font-medium">Real-time rankings based on match performance</p>
          </div>

          {/* View Selection Tabs */}
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-2 bg-muted/30 p-1 rounded-2xl border border-border/50">
              <TabsTrigger value="players" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg px-8">Players</TabsTrigger>
              <TabsTrigger value="teams" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg px-8">Teams</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === 'players' ? (
          <>
            {/* Top 3 Podium (Unified) */}
            {!playersLoading && playerLeaderboard.length >= 3 && view === 'players' && (
              <div className="relative mb-20 pt-16 h-80 flex items-end justify-center gap-2 sm:gap-6">
                {/* 2nd Place */}
                <div className="flex flex-col items-center group w-24 sm:w-32 animate-fade-in-up [animation-delay:200ms]">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-slate-400/20 blur-2xl rounded-full scale-150 group-hover:bg-slate-400/30 transition-all duration-700" />
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-slate-300/50 shadow-2xl relative z-10 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                      <AvatarImage src={playerLeaderboard[1]?.avatar_url || undefined} />
                      <AvatarFallback className="bg-slate-200 text-slate-700 text-xl font-black">
                        {playerLeaderboard[1]?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-400 text-white text-[10px] font-black rounded-full shadow-lg border-2 border-background z-20">2ND</div>
                  </div>
                  <div className="text-center relative z-10">
                    <p className="font-black text-foreground truncate w-full text-sm tracking-tight">{playerLeaderboard[1]?.full_name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Trophy className="w-3 h-3 text-slate-400" />
                      <p className="text-primary font-black text-base">{getStatValue(playerLeaderboard[1]).value}</p>
                    </div>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center group w-32 sm:w-40 z-20 animate-fade-in-up">
                  <div className="relative mb-6">
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
                      <Trophy className="w-12 h-12 text-yellow-500 drop-shadow-glow" />
                    </div>
                    <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full scale-150 group-hover:bg-yellow-400/30 transition-all duration-700" />
                    <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-yellow-400 shadow-glow relative z-10 group-hover:scale-110 group-hover:-translate-y-3 transition-all duration-500">
                      <AvatarImage src={playerLeaderboard[0]?.avatar_url || undefined} />
                      <AvatarFallback className="bg-yellow-100 text-yellow-700 text-3xl font-black">
                        {playerLeaderboard[0]?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-yellow-500 text-white text-xs font-black rounded-full shadow-xl border-4 border-background z-20">CHAMPION</div>
                  </div>
                  <div className="text-center relative z-10">
                    <p className="font-black text-foreground truncate w-full text-lg tracking-tight leading-none mb-1">{playerLeaderboard[0]?.full_name}</p>
                    <p className="text-primary font-black text-2xl">{getStatValue(playerLeaderboard[0]).value}</p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center group w-20 sm:w-28 animate-fade-in-up [animation-delay:400ms]">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-amber-600/10 blur-xl rounded-full scale-150 group-hover:bg-amber-600/20 transition-all duration-700" />
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-amber-600/30 shadow-xl relative z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
                      <AvatarImage src={playerLeaderboard[2]?.avatar_url || undefined} />
                      <AvatarFallback className="bg-amber-50 text-amber-700 text-lg font-black">
                        {playerLeaderboard[2]?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-700 text-white text-[10px] font-black rounded-full shadow-lg border-2 border-background z-20">3RD</div>
                  </div>
                  <div className="text-center relative z-10">
                    <p className="font-black text-foreground truncate w-full text-xs tracking-tight">{playerLeaderboard[2]?.full_name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Trophy className="w-2.5 h-2.5 text-amber-700" />
                      <p className="text-primary font-black text-sm">{getStatValue(playerLeaderboard[2]).value}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Category Tabs (Players only) */}
            <Tabs value={category} onValueChange={(v) => setCategory(v as any)} className="mb-4">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="runs" className="gap-1 text-xs">Runs</TabsTrigger>
                <TabsTrigger value="wickets" className="gap-1 text-xs">Wickets</TabsTrigger>
                <TabsTrigger value="catches" className="gap-1 text-xs">Catches</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Player List */}
            <div className="space-y-2">
              {playersLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))
              ) : playerLeaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No player stats yet.</p>
                </div>
              ) : (
                playerLeaderboard.slice(3).map((entry) => (
                  <PlayerRow key={entry.id} entry={entry} />
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Top 3 Podium (Teams) */}
            {!teamsLoading && teamLeaderboard.length >= 3 && (
              <div className="flex justify-center items-end gap-2 mb-6 h-40">
                {/* Same podium logic for teams... */}
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-400">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-semibold truncate max-w-[80px]">{teamLeaderboard[1]?.name}</p>
                    <p className="text-xs text-muted-foreground">{teamLeaderboard[1]?.points} pts</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-lg flex items-center justify-center mt-2">
                    <span className="text-2xl font-bold text-gray-800">2</span>
                  </div>
                </div>

                <div className="flex flex-col items-center -mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-400">
                      <Users className="w-8 h-8 text-yellow-600" />
                    </div>
                    <Trophy className="w-6 h-6 text-yellow-500 absolute -top-3 left-1/2 -translate-x-1/2" />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-semibold truncate max-w-[80px]">{teamLeaderboard[0]?.name}</p>
                    <p className="text-xs text-muted-foreground">{teamLeaderboard[0]?.points} pts</p>
                  </div>
                  <div className="w-16 h-24 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-t-lg flex items-center justify-center mt-2">
                    <span className="text-3xl font-bold text-amber-950">1</span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-600">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-semibold truncate max-w-[80px]">{teamLeaderboard[2]?.name}</p>
                    <p className="text-xs text-muted-foreground">{teamLeaderboard[2]?.points} pts</p>
                  </div>
                  <div className="w-16 h-12 bg-gradient-to-b from-amber-600 to-orange-700 rounded-t-lg flex items-center justify-center mt-2">
                    <span className="text-xl font-bold text-amber-100">3</span>
                  </div>
                </div>
              </div>
            )}

            {/* Team List */}
            <div className="space-y-2">
              {teamsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))
              ) : teamLeaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No team stats yet.</p>
                </div>
              ) : (
                teamLeaderboard.slice(3).map((entry) => (
                  <TeamRow key={entry.id} entry={entry} />
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;

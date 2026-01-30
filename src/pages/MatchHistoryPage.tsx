import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, ChevronRight, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useMatchHistory, MatchHistoryItem } from '@/hooks/useMatchHistory';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterState {
  search: string;
  status: 'all' | 'scheduled' | 'live' | 'completed';
  dateFrom: string;
  dateTo: string;
  team: string;
  venue: string;
}

const MatchHistoryPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    team: '',
    venue: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { matches, isLoading, teams, venues } = useMatchHistory(filters);

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      team: '',
      venue: '',
    });
  };

  const activeFiltersCount = Object.entries(filters).reduce((acc, [key, value]) => {
    if (key === 'status' && value === 'all') return acc;
    return value ? acc + 1 : acc;
  }, 0);

  const getScoreDisplay = (match: MatchHistoryItem, teamName: string) => {
    if (match.status === 'scheduled') return 'TBD';
    return teamName === match.team1_name ? match.team1_score : match.team2_score;
  };

  const MatchCard: React.FC<{ match: MatchHistoryItem }> = ({ match }) => {
    const isLive = match.status === 'live';
    const isCompleted = match.status === 'completed';

    return (
      <button
        onClick={() => navigate(`/match/${match.id}`)}
        className="w-full bg-card/60 backdrop-blur-md rounded-[2rem] p-6 shadow-card hover:shadow-glow transition-all duration-500 text-left border border-border/50 group"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {isLive ? (
              <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-red-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                LIVE
              </div>
            ) : isCompleted ? (
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-primary/20">
                FINISHED
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-border/50">
                UPCOMING
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-bold leading-none">
              {match.match_date || match.created_at ? format(new Date(match.match_date || match.created_at), 'dd MMM yyyy') : 'No Date'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4 mb-6">
          <div className="text-right">
            <p className={cn(
              "font-black text-lg tracking-tight truncate mb-1",
              match.winner_name === match.team1_name ? "text-foreground" : "text-muted-foreground/60"
            )}>
              {match.team1_name}
            </p>
            <p className="font-mono text-xs font-bold text-primary">
              {getScoreDisplay(match, match.team1_name) || '0/0'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-[10px] font-black text-muted-foreground border border-border/50">
            VS
          </div>
          <div className="text-left">
            <p className={cn(
              "font-black text-lg tracking-tight truncate mb-1",
              match.winner_name === match.team2_name ? "text-foreground" : "text-muted-foreground/60"
            )}>
              {match.team2_name}
            </p>
            <p className="font-mono text-xs font-bold text-primary">
              {getScoreDisplay(match, match.team2_name) || '0/0'}
            </p>
          </div>
        </div>

        {match.result && (
          <div className="bg-gradient-primary/5 p-3 rounded-2xl border border-primary/10 mb-6">
            <p className="text-sm font-bold text-primary text-center leading-tight">
              {match.result}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold truncate max-w-[180px]">{match.ground_name}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Match History" />
      <main className="px-6 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Game Archive</h2>
            <p className="text-muted-foreground text-sm font-medium">Revisit your past performances and live matches</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Search teams, venues..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-12 h-14 bg-card/50 border-none rounded-2xl shadow-card focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
              />
            </div>
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl bg-card border-none shadow-card hover:bg-primary hover:text-white group relative shrink-0 transition-all">
                  <Filter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-background animate-pulse">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md bg-background/80 backdrop-blur-xl border-l border-border/50">
                <div className="p-2">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-black tracking-tight">Refine Results</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                      <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v as any })}>
                        <SelectTrigger className="h-14 bg-muted/30 border-none rounded-2xl shadow-inner font-bold">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50 rounded-2xl shadow-glow">
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Team</Label>
                      <Select value={filters.team} onValueChange={(v) => setFilters({ ...filters, team: v === 'all' ? '' : v })}>
                        <SelectTrigger className="h-14 bg-muted/30 border-none rounded-2xl">
                          <SelectValue placeholder="All teams" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Teams</SelectItem>
                          {teams.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <Button variant="outline" onClick={clearFilters} className="h-12 rounded-xl">Clear</Button>
                      <Button onClick={() => setShowFilters(false)} className="h-12 rounded-xl">Apply</Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.status !== 'all' && (
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 px-3 py-1.5 rounded-full">
                {filters.status.toUpperCase()}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, status: 'all' })} />
              </Badge>
            )}
            {filters.team && (
              <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 px-3 py-1.5 rounded-full">
                {filters.team}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters({ ...filters, team: '' })} />
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-3">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />)
          ) : matches.length === 0 ? (
            <div className="text-center py-20 bg-card/40 rounded-[3rem] border border-dashed border-border/50">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-black">No matches found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            matches.map((m) => <MatchCard key={m.id} match={m} />)
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchHistoryPage;

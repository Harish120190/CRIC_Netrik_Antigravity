import React, { useState } from 'react';
import { Search, Filter, Calendar, MapPin, ChevronRight, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useMatchHistory, MatchFilters, MatchHistoryItem } from '@/hooks/useMatchHistory';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MatchHistoryPageProps {
  onNavigate: (path: string) => void;
}

const MatchHistoryPage: React.FC<MatchHistoryPageProps> = ({ onNavigate }) => {
  const [filters, setFilters] = useState<Partial<MatchFilters>>({
    search: '',
    status: 'all',
    venue: '',
    team: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { matches, isLoading, venues, teams } = useMatchHistory(filters);

  const activeFiltersCount = [
    filters.status !== 'all' && filters.status,
    filters.venue,
    filters.team,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      search: filters.search,
      status: 'all',
      venue: '',
      team: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const getScoreDisplay = (match: MatchHistoryItem, teamName: string) => {
    const innings = match.innings?.find((i) => i.batting_team_name === teamName);
    if (!innings) return '-';
    return `${innings.runs}/${innings.wickets} (${innings.overs}.${innings.balls % 6})`;
  };

  const MatchCard: React.FC<{ match: MatchHistoryItem }> = ({ match }) => {
    const isLive = match.status === 'live';
    const isCompleted = match.status === 'completed';

    return (
      <button
        onClick={() => onNavigate(`/match/${match.id}`)}
        className="w-full bg-card rounded-xl p-4 shadow-card hover:shadow-elevated transition-all text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isLive && (
              <Badge variant="destructive" className="animate-pulse gap-1 text-xs">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                LIVE
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="text-xs">COMPLETED</Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(match.match_date || match.created_at), 'dd MMM yyyy')}
          </span>
        </div>

        {/* Teams */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className={cn(
              "font-semibold",
              match.winner_name === match.team1_name && "text-primary"
            )}>
              {match.team1_name}
            </span>
            <span className="font-mono text-sm font-medium">
              {getScoreDisplay(match, match.team1_name)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn(
              "font-semibold",
              match.winner_name === match.team2_name && "text-primary"
            )}>
              {match.team2_name}
            </span>
            <span className="font-mono text-sm font-medium">
              {getScoreDisplay(match, match.team2_name)}
            </span>
          </div>
        </div>

        {/* Result */}
        {match.result && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{match.result}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[150px]">{match.venue}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Match History" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Search & Filter Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search teams, venues..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <Filter className="w-4 h-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Matches</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(v) => setFilters({ ...filters, status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Filter */}
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Select
                    value={filters.team}
                    onValueChange={(v) => setFilters({ ...filters, team: v === 'all' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All teams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team} value={team}>{team}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Venue Filter */}
                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Select
                    value={filters.venue}
                    onValueChange={(v) => setFilters({ ...filters, venue: v === 'all' ? '' : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All venues" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Venues</SelectItem>
                      {venues.map((venue) => (
                        <SelectItem key={venue} value={venue}>{venue}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    Clear All
                  </Button>
                  <Button onClick={() => setShowFilters(false)} className="flex-1">
                    Apply
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.status !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {filters.status}
                <button onClick={() => setFilters({ ...filters, status: 'all' })}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.team && (
              <Badge variant="secondary" className="gap-1">
                {filters.team}
                <button onClick={() => setFilters({ ...filters, team: '' })}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {filters.venue && (
              <Badge variant="secondary" className="gap-1">
                {filters.venue}
                <button onClick={() => setFilters({ ...filters, venue: '' })}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-3">
          {isLoading ? 'Loading...' : `${matches.length} matches found`}
        </p>

        {/* Match List */}
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : matches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No matches found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            matches.map((match) => <MatchCard key={match.id} match={match} />)
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchHistoryPage;

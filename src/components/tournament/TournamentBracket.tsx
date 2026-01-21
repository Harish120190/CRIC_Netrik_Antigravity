import React, { useState, useEffect } from 'react';
import { Trophy, ChevronRight, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface Match {
  id: string;
  team1_name: string;
  team2_name: string;
  status: string;
  winner_name: string | null;
  result: string | null;
}

interface TournamentBracketProps {
  tournamentId: string;
}

interface BracketMatch {
  id: string;
  team1: string;
  team2: string;
  winner: string | null;
  status: string;
  round: number;
  position: number;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ tournamentId }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMatches(data);
    }
    setIsLoading(false);
  };

  // Organize matches into rounds for bracket visualization
  const organizeBracket = (matches: Match[]): BracketMatch[][] => {
    if (matches.length === 0) return [];

    // Get unique teams from all matches
    const teams = new Set<string>();
    matches.forEach(m => {
      teams.add(m.team1_name);
      teams.add(m.team2_name);
    });

    const teamCount = teams.size;
    
    // Calculate number of rounds needed
    const totalRounds = Math.ceil(Math.log2(teamCount));
    
    // For simplicity, we'll organize matches by creation order into rounds
    // First N/2 matches are Round 1, next N/4 are Round 2, etc.
    const rounds: BracketMatch[][] = [];
    let matchIndex = 0;
    
    for (let round = 0; round < totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round - 1);
      const roundMatches: BracketMatch[] = [];
      
      for (let pos = 0; pos < matchesInRound && matchIndex < matches.length; pos++) {
        const match = matches[matchIndex];
        roundMatches.push({
          id: match.id,
          team1: match.team1_name,
          team2: match.team2_name,
          winner: match.winner_name,
          status: match.status,
          round: round,
          position: pos,
        });
        matchIndex++;
      }
      
      if (roundMatches.length > 0) {
        rounds.push(roundMatches);
      }
    }

    return rounds;
  };

  const getRoundName = (roundIndex: number, totalRounds: number): string => {
    const roundsFromEnd = totalRounds - roundIndex;
    switch (roundsFromEnd) {
      case 1: return 'Final';
      case 2: return 'Semi-Finals';
      case 3: return 'Quarter-Finals';
      case 4: return 'Round of 16';
      case 5: return 'Round of 32';
      default: return `Round ${roundIndex + 1}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const brackets = organizeBracket(matches);

  if (brackets.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No bracket matches yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Generate knockout fixtures to see the bracket
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Knockout Bracket
        </h3>
        <span className="text-xs text-muted-foreground">
          {matches.filter(m => m.status === 'completed').length}/{matches.length} completed
        </span>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {brackets.map((round, roundIndex) => (
            <div key={roundIndex} className="flex flex-col">
              {/* Round Header */}
              <div className="text-center mb-3">
                <span className="text-xs font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">
                  {getRoundName(roundIndex, brackets.length)}
                </span>
              </div>

              {/* Round Matches */}
              <div 
                className="flex flex-col justify-around flex-1 gap-4"
                style={{ 
                  paddingTop: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 20}px` : 0,
                  gap: `${Math.pow(2, roundIndex + 1) * 16}px`
                }}
              >
                {round.map((match, matchIndex) => (
                  <div key={match.id} className="relative">
                    {/* Match Card */}
                    <div className={cn(
                      "w-48 bg-card rounded-xl border-2 overflow-hidden transition-all",
                      match.status === 'completed' ? "border-border" : "border-primary/30"
                    )}>
                      {/* Team 1 */}
                      <div className={cn(
                        "px-3 py-2.5 flex items-center justify-between border-b border-border",
                        match.winner === match.team1 && "bg-pitch/10"
                      )}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                            match.winner === match.team1 ? "bg-pitch text-pitch-foreground" : "bg-muted"
                          )}>
                            <Users className="w-3 h-3" />
                          </div>
                          <span className={cn(
                            "text-sm truncate",
                            match.winner === match.team1 ? "font-semibold text-pitch" : "text-foreground"
                          )}>
                            {match.team1}
                          </span>
                        </div>
                        {match.winner === match.team1 && (
                          <Trophy className="w-4 h-4 text-pitch flex-shrink-0" />
                        )}
                      </div>

                      {/* Team 2 */}
                      <div className={cn(
                        "px-3 py-2.5 flex items-center justify-between",
                        match.winner === match.team2 && "bg-pitch/10"
                      )}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                            match.winner === match.team2 ? "bg-pitch text-pitch-foreground" : "bg-muted"
                          )}>
                            <Users className="w-3 h-3" />
                          </div>
                          <span className={cn(
                            "text-sm truncate",
                            match.winner === match.team2 ? "font-semibold text-pitch" : "text-foreground"
                          )}>
                            {match.team2}
                          </span>
                        </div>
                        {match.winner === match.team2 && (
                          <Trophy className="w-4 h-4 text-pitch flex-shrink-0" />
                        )}
                      </div>

                      {/* Status indicator */}
                      {match.status === 'live' && (
                        <div className="px-3 py-1.5 bg-live/10 flex items-center justify-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
                          <span className="text-xs font-semibold text-live">LIVE</span>
                        </div>
                      )}
                      {match.status === 'upcoming' && (
                        <div className="px-3 py-1.5 bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Upcoming</span>
                        </div>
                      )}
                    </div>

                    {/* Connector Lines */}
                    {roundIndex < brackets.length - 1 && (
                      <div className="absolute top-1/2 -right-4 w-4 h-px bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Champion Column */}
          {brackets.length > 0 && brackets[brackets.length - 1].some(m => m.winner) && (
            <div className="flex flex-col justify-center">
              <div className="text-center mb-3">
                <span className="text-xs font-semibold text-pitch px-3 py-1 bg-pitch/10 rounded-full">
                  Champion
                </span>
              </div>
              <div className="w-48 bg-gradient-to-br from-pitch/20 to-pitch/5 rounded-xl border-2 border-pitch p-4 text-center">
                <Trophy className="w-10 h-10 text-pitch mx-auto mb-2" />
                <p className="font-bold text-foreground">
                  {brackets[brackets.length - 1].find(m => m.winner)?.winner || 'TBD'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Tournament Winner</p>
              </div>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-pitch/20 border border-pitch" />
          <span>Winner</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-live animate-pulse" />
          <span>Live</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-muted border border-border" />
          <span>Upcoming</span>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
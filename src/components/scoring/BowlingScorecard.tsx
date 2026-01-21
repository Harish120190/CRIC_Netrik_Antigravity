import React from 'react';
import { cn } from '@/lib/utils';
import { CricketBall } from '@/components/icons/CricketIcons';

export interface BowlerStats {
  id: string;
  name: string;
  overs: number;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  isBowling?: boolean;
}

interface BowlingScorecardProps {
  bowlers: BowlerStats[];
  teamName: string;
}

const BowlingScorecard: React.FC<BowlingScorecardProps> = ({ bowlers, teamName }) => {
  const activeBowlers = bowlers.filter(b => b.overs > 0 || b.balls > 0);
  
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="bg-live/10 px-4 py-3 flex items-center gap-2">
        <CricketBall className="w-4 h-4 text-live" />
        <h3 className="font-semibold text-foreground">{teamName} - Bowling</h3>
      </div>
      
      {/* Header */}
      <div className="grid grid-cols-12 gap-1 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
        <div className="col-span-4">Bowler</div>
        <div className="col-span-2 text-center">O</div>
        <div className="col-span-1 text-center">M</div>
        <div className="col-span-2 text-center">R</div>
        <div className="col-span-1 text-center">W</div>
        <div className="col-span-2 text-center">Econ</div>
      </div>
      
      {/* Bowlers */}
      <div className="divide-y divide-border">
        {activeBowlers.length > 0 ? (
          activeBowlers.map((bowler) => {
            const totalBalls = bowler.overs * 6 + bowler.balls;
            const economy = totalBalls > 0 
              ? ((bowler.runs / totalBalls) * 6).toFixed(1) 
              : '0.0';
            const oversDisplay = `${bowler.overs}.${bowler.balls}`;
            
            return (
              <div 
                key={bowler.id}
                className={cn(
                  "grid grid-cols-12 gap-1 px-4 py-3 text-sm",
                  bowler.isBowling && "bg-live/5"
                )}
              >
                <div className="col-span-4 flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {bowler.name}
                  </span>
                  {bowler.isBowling && (
                    <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
                  )}
                </div>
                <div className="col-span-2 text-center text-foreground">
                  {oversDisplay}
                </div>
                <div className="col-span-1 text-center text-muted-foreground">
                  {bowler.maidens}
                </div>
                <div className="col-span-2 text-center text-foreground">
                  {bowler.runs}
                </div>
                <div className={cn(
                  "col-span-1 text-center font-bold",
                  bowler.wickets >= 3 ? "text-live" : "text-foreground"
                )}>
                  {bowler.wickets}
                </div>
                <div className={cn(
                  "col-span-2 text-center text-xs",
                  parseFloat(economy) < 6 ? "text-win" : 
                  parseFloat(economy) > 10 ? "text-live" : "text-muted-foreground"
                )}>
                  {economy}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-center text-muted-foreground text-sm">
            No bowling data yet
          </div>
        )}
      </div>
    </div>
  );
};

export default BowlingScorecard;

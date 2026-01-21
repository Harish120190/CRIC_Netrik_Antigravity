import React from 'react';
import { cn } from '@/lib/utils';
import { CricketBat } from '@/components/icons/CricketIcons';

export interface BatsmanStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissal?: string;
  isOnStrike?: boolean;
}

interface BattingScorecardProps {
  batsmen: BatsmanStats[];
  teamName: string;
}

const BattingScorecard: React.FC<BattingScorecardProps> = ({ batsmen, teamName }) => {
  const activeBatsmen = batsmen.filter(b => !b.isOut || b.runs > 0 || b.balls > 0);
  
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="bg-primary/10 px-4 py-3 flex items-center gap-2">
        <CricketBat className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">{teamName} - Batting</h3>
      </div>
      
      {/* Header */}
      <div className="grid grid-cols-12 gap-1 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
        <div className="col-span-5">Batsman</div>
        <div className="col-span-2 text-center">R</div>
        <div className="col-span-2 text-center">B</div>
        <div className="col-span-1 text-center">4s</div>
        <div className="col-span-1 text-center">6s</div>
        <div className="col-span-1 text-center">SR</div>
      </div>
      
      {/* Batsmen */}
      <div className="divide-y divide-border">
        {activeBatsmen.length > 0 ? (
          activeBatsmen.map((batsman) => {
            const strikeRate = batsman.balls > 0 
              ? ((batsman.runs / batsman.balls) * 100).toFixed(1) 
              : '0.0';
            
            return (
              <div 
                key={batsman.id}
                className={cn(
                  "grid grid-cols-12 gap-1 px-4 py-3 text-sm",
                  batsman.isOnStrike && "bg-primary/5"
                )}
              >
                <div className="col-span-5 flex items-center gap-2">
                  <span className={cn(
                    "font-medium truncate",
                    batsman.isOut ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {batsman.name}
                  </span>
                  {batsman.isOnStrike && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                  {batsman.isOut && (
                    <span className="text-xs text-live">out</span>
                  )}
                </div>
                <div className={cn(
                  "col-span-2 text-center font-bold",
                  batsman.runs >= 50 ? "text-gold" : "text-foreground"
                )}>
                  {batsman.runs}
                </div>
                <div className="col-span-2 text-center text-muted-foreground">
                  {batsman.balls}
                </div>
                <div className="col-span-1 text-center text-primary">
                  {batsman.fours}
                </div>
                <div className="col-span-1 text-center text-gold">
                  {batsman.sixes}
                </div>
                <div className="col-span-1 text-center text-muted-foreground text-xs">
                  {strikeRate}
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-center text-muted-foreground text-sm">
            No batting data yet
          </div>
        )}
      </div>
    </div>
  );
};

export default BattingScorecard;

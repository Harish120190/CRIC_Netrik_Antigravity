import React from 'react';
import { Target } from 'lucide-react';

export interface WicketFall {
  wicketNumber: number;
  batsmanName: string;
  runs: number;
  overs: number;
  balls: number;
  teamScore: number;
}

interface FallOfWicketsProps {
  wickets: WicketFall[];
}

const FallOfWickets: React.FC<FallOfWicketsProps> = ({ wickets }) => {
  if (wickets.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-destructive" />
        <h3 className="text-sm font-semibold text-foreground">Fall of Wickets</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {wickets.map((wicket) => (
          <div
            key={wicket.wicketNumber}
            className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-center min-w-[70px]"
          >
            <p className="text-xs text-muted-foreground mb-0.5">
              {wicket.wicketNumber}{wicket.wicketNumber === 1 ? 'st' : wicket.wicketNumber === 2 ? 'nd' : wicket.wicketNumber === 3 ? 'rd' : 'th'}
            </p>
            <p className="text-sm font-bold text-foreground">
              {wicket.teamScore}
            </p>
            <p className="text-xs text-muted-foreground">
              ({wicket.overs}.{wicket.balls})
            </p>
          </div>
        ))}
      </div>
      
      {/* Detailed list */}
      <div className="mt-3 pt-3 border-t border-border space-y-1.5">
        {wickets.map((wicket) => (
          <div
            key={`detail-${wicket.wicketNumber}`}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-muted-foreground">
              {wicket.wicketNumber}. {wicket.batsmanName}
            </span>
            <span className="font-medium text-foreground">
              {wicket.teamScore}/{wicket.wicketNumber} ({wicket.overs}.{wicket.balls})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FallOfWickets;

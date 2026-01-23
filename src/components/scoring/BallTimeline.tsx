import React from 'react';
import { cn } from '@/lib/utils';

interface Ball {
  runs: number;
  isWicket: boolean;
  extras?: string;
  overNumber?: number;
}

interface BallTimelineProps {
  balls: Ball[];
  currentOver: number;
}

const BallTimeline: React.FC<BallTimelineProps> = ({ balls, currentOver }) => {
  const getBallStyle = (ball: Ball) => {
    if (ball.isWicket) return 'bg-destructive text-destructive-foreground';
    if (ball.runs === 4) return 'bg-primary text-primary-foreground';
    if (ball.runs === 6) return 'gradient-gold text-accent-foreground';
    if (ball.extras) return 'bg-accent/50 text-accent-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  const getBallText = (ball: Ball) => {
    if (ball.isWicket) return 'W';
    if (ball.extras === 'wide') return 'WD';
    if (ball.extras === 'no-ball') return 'NB';
    if (ball.extras === 'bye') return 'B';
    if (ball.extras === 'leg-bye') return 'LB';
    return ball.runs.toString();
  };

  // Group balls by over
  const ballsByOver = balls.reduce((acc, ball) => {
    const over = ball.overNumber || 0; // Default to 0 if undefined
    if (!acc[over]) {
      acc[over] = [];
    }
    acc[over].push(ball);
    return acc;
  }, {} as Record<number, Ball[]>);

  // Get list of over numbers (0, 1, 2...) depending on what's in the map
  // We want to show the current over first? Or typically reverse chronological order?
  // Let's sort them descending so the latest over is at top.
  const overNumbers = Object.keys(ballsByOver).map(Number).sort((a, b) => b - a);

  // If no balls, at least show current over empty
  if (overNumbers.length === 0) {
    overNumbers.push(currentOver);
    ballsByOver[currentOver] = [];
  } else if (!overNumbers.includes(currentOver)) {
    // If we started a new over but haven't bowled a ball yet, make sure it appears
    overNumbers.unshift(currentOver);
    ballsByOver[currentOver] = [];
  }

  return (
    <div className="space-y-3">
      {overNumbers.map((overNum) => {
        const overBalls = ballsByOver[overNum] || [];
        const isCurrentOver = overNum === currentOver;
        const overRuns = overBalls.reduce((sum, b) => sum + b.runs + (b.extras ? 1 : 0), 0);

        return (
          <div key={overNum} className={cn(
            "rounded-xl p-4 shadow-sm border",
            isCurrentOver ? "bg-card border-primary/20 shadow-card" : "bg-card/50 border-border"
          )}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={cn("text-sm font-semibold", isCurrentOver ? "text-primary" : "text-muted-foreground")}>
                Over {overNum + 1}
              </h4>
              <span className="text-xs text-muted-foreground font-medium bg-secondary px-2 py-1 rounded-md">
                {overRuns} run{overRuns !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {overBalls.map((ball, index) => (
                <div
                  key={`${overNum}-${index}`}
                  className={cn(
                    "w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                    getBallStyle(ball)
                  )}
                >
                  {getBallText(ball)}
                </div>
              ))}

              {/* Show empty slots only for current over to indicate remaining balls */}
              {isCurrentOver && Array.from({ length: Math.max(0, 6 - overBalls.length) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="w-9 h-9 shrink-0 rounded-full border-2 border-dashed border-border flex items-center justify-center"
                >
                  <span className="text-[10px] text-muted-foreground">
                    {overBalls.length + index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BallTimeline;

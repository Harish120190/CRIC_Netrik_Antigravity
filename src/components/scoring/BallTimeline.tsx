import React from 'react';
import { cn } from '@/lib/utils';

interface Ball {
  runs: number;
  isWicket: boolean;
  extras?: string;
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

  const thisOverBalls = balls.slice(-6);
  const remainingSlots = Math.max(0, 6 - thisOverBalls.length);

  return (
    <div className="bg-card rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">
          Over {currentOver + 1}
        </h4>
        <span className="text-xs text-muted-foreground">
          {thisOverBalls.reduce((sum, b) => sum + b.runs + (b.extras ? 1 : 0), 0)} runs
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {thisOverBalls.map((ball, index) => (
          <div
            key={index}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ball-bounce",
              getBallStyle(ball)
            )}
          >
            {getBallText(ball)}
          </div>
        ))}
        {Array.from({ length: remainingSlots }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center"
          >
            <span className="text-xs text-muted-foreground">
              {thisOverBalls.length + index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BallTimeline;

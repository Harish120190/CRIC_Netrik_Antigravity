import React from 'react';
import { cn } from '@/lib/utils';
import { LiveBadge } from '@/components/icons/CricketIcons';

interface ScoreBoardProps {
  battingTeam: string;
  bowlingTeam: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  target?: number;
  isLive?: boolean;
  runRate: number;
  requiredRate?: number;
  totalOvers?: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({
  battingTeam,
  bowlingTeam,
  runs,
  wickets,
  overs,
  balls,
  target,
  isLive = true,
  runRate,
  requiredRate,
  totalOvers = 20,
}) => {
  const oversDisplay = `${overs}.${balls}`;
  
  return (
    <div className="gradient-scoreboard rounded-2xl p-5 shadow-elevated">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-scoreboard-text/70 text-xs font-medium mb-0.5">Batting</p>
          <h3 className="text-scoreboard-text text-lg font-bold">{battingTeam}</h3>
        </div>
        {isLive && <LiveBadge />}
      </div>

      {/* Main Score */}
      <div className="flex items-end justify-between mb-4">
        <div className="score-text">
          <span className="text-5xl text-scoreboard-text">{runs}</span>
          <span className="text-3xl text-scoreboard-text/70">/{wickets}</span>
        </div>
        <div className="text-right">
          <p className="text-scoreboard-text/50 text-xs">Overs</p>
          <p className="score-text text-2xl text-scoreboard-text">{oversDisplay}<span className="text-lg text-scoreboard-text/50">/{totalOvers}</span></p>
        </div>
      </div>

      {/* Target and rates */}
      {target && (
        <div className="bg-scoreboard-text/10 rounded-lg p-3 mb-3">
          <p className="text-scoreboard-text text-sm">
            Need <span className="font-bold">{target - runs}</span> runs from{' '}
            <span className="font-bold">{120 - (overs * 6 + balls)}</span> balls
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-scoreboard-text/50 text-xs">CRR</p>
          <p className="score-text text-scoreboard-text">{runRate.toFixed(2)}</p>
        </div>
        {requiredRate && (
          <div className="text-right">
            <p className="text-scoreboard-text/50 text-xs">RRR</p>
            <p className={cn(
              "score-text",
              requiredRate > runRate ? "text-live" : "text-win"
            )}>
              {requiredRate.toFixed(2)}
            </p>
          </div>
        )}
        <div className="text-right">
          <p className="text-scoreboard-text/50 text-xs">vs</p>
          <p className="text-scoreboard-text text-sm font-medium">{bowlingTeam}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;

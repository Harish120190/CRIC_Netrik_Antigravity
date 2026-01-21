import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import BattingScorecard, { BatsmanStats } from './BattingScorecard';
import BowlingScorecard, { BowlerStats } from './BowlingScorecard';

interface PlayerScorecardsProps {
  batsmen: BatsmanStats[];
  bowlers: BowlerStats[];
  battingTeamName: string;
  bowlingTeamName: string;
}

const PlayerScorecards: React.FC<PlayerScorecardsProps> = ({
  batsmen,
  bowlers,
  battingTeamName,
  bowlingTeamName,
}) => {
  const [activeTab, setActiveTab] = useState<'batting' | 'bowling'>('batting');

  return (
    <div className="space-y-3">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl">
        <button
          onClick={() => setActiveTab('batting')}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
            activeTab === 'batting'
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Batting
        </button>
        <button
          onClick={() => setActiveTab('bowling')}
          className={cn(
            "flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all",
            activeTab === 'bowling'
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Bowling
        </button>
      </div>

      {/* Content */}
      {activeTab === 'batting' ? (
        <BattingScorecard batsmen={batsmen} teamName={battingTeamName} />
      ) : (
        <BowlingScorecard bowlers={bowlers} teamName={bowlingTeamName} />
      )}
    </div>
  );
};

export default PlayerScorecards;

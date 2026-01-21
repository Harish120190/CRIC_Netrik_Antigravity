import React from 'react';
import LiveMatchCard from '@/components/match/LiveMatchCard';

interface Match {
  id: string;
  title: string;
  team1: {
    name: string;
    runs: number;
    wickets: number;
    overs: number;
  };
  team2: {
    name: string;
    runs: number;
    wickets: number;
    overs: number;
  };
  venue: string;
  status: 'live' | 'upcoming' | 'completed';
  currentBatting: 1 | 2;
}

interface MatchListProps {
  title: string;
  matches: Match[];
  onMatchPress?: (id: string) => void;
}

const MatchList: React.FC<MatchListProps> = ({ title, matches, onMatchPress }) => {
  if (matches.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <button className="text-sm font-medium text-primary hover:underline">
          See All
        </button>
      </div>
      <div className="space-y-3">
        {matches.map((match) => (
          <LiveMatchCard
            key={match.id}
            {...match}
            onPress={() => onMatchPress?.(match.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default MatchList;

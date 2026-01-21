import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { LiveBadge } from '@/components/icons/CricketIcons';
import { cn } from '@/lib/utils';

interface TeamScore {
  name: string;
  logo?: string;
  runs: number;
  wickets: number;
  overs: number;
}

interface LiveMatchCardProps {
  id: string;
  title: string;
  team1: TeamScore;
  team2: TeamScore;
  venue: string;
  status: 'live' | 'upcoming' | 'completed';
  currentBatting: 1 | 2;
  onPress?: () => void;
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({
  title,
  team1,
  team2,
  venue,
  status,
  currentBatting,
  onPress,
}) => {
  const isLive = status === 'live';
  const isCompleted = status === 'completed';

  const TeamRow: React.FC<{ team: TeamScore; isBatting: boolean; index: 1 | 2 }> = ({ 
    team, 
    isBatting,
    index 
  }) => (
    <div className={cn(
      "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
      isBatting && isLive && "bg-primary/10"
    )}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-secondary-foreground">
              {team.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <span className={cn(
          "font-semibold",
          isBatting && isLive ? "text-primary" : "text-foreground"
        )}>
          {team.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="score-text text-lg">
          {team.runs}/{team.wickets}
        </span>
        <span className="text-xs text-muted-foreground">
          ({team.overs})
        </span>
      </div>
    </div>
  );

  return (
    <button
      onClick={onPress}
      className="w-full bg-card rounded-xl shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden text-left"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50">
        <span className="text-xs font-medium text-muted-foreground truncate flex-1">
          {title}
        </span>
        {isLive && <LiveBadge />}
        {isCompleted && (
          <span className="text-xs font-semibold text-muted-foreground">COMPLETED</span>
        )}
      </div>

      {/* Teams */}
      <div className="p-2 space-y-1">
        <TeamRow team={team1} isBatting={currentBatting === 1} index={1} />
        <TeamRow team={team2} isBatting={currentBatting === 2} index={2} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border">
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="text-xs truncate max-w-[150px]">{venue}</span>
        </div>
        {isLive && (
          <div className="flex items-center gap-1 text-primary">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">Watch Live</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default LiveMatchCard;

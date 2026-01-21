import React, { useState } from 'react';
import { User, Check, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Team } from '@/types/cricket';

interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
}

interface PlayerSelectionProps {
  team1: Team;
  team2: Team;
  selectedPlayersTeam1: string[];
  selectedPlayersTeam2: string[];
  onSelectPlayersTeam1: (players: string[]) => void;
  onSelectPlayersTeam2: (players: string[]) => void;
}

// Sample players data - in real app would come from team data
const generatePlayers = (teamId: string): Player[] => {
  const roles: Player['role'][] = ['batsman', 'batsman', 'batsman', 'batsman', 'all-rounder', 'all-rounder', 'wicket-keeper', 'bowler', 'bowler', 'bowler', 'bowler', 'bowler', 'batsman', 'all-rounder', 'bowler'];
  const firstNames = ['Virat', 'Rohit', 'Jasprit', 'KL', 'Hardik', 'Rishabh', 'Ravindra', 'Mohammed', 'Yuzvendra', 'Axar', 'Shreyas', 'Shubman', 'Ishan', 'Suryakumar', 'Kuldeep'];
  const lastNames = ['Kumar', 'Singh', 'Sharma', 'Patel', 'Shah', 'Verma', 'Yadav', 'Chauhan', 'Gupta', 'Reddy', 'Nair', 'Menon', 'Iyer', 'Pandey', 'Rathore'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `${teamId}-player-${i + 1}`,
    name: `${firstNames[i]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
    role: roles[i],
  }));
};

const getRoleIcon = (role: Player['role']) => {
  switch (role) {
    case 'wicket-keeper':
      return <Shield className="w-3 h-3" />;
    case 'all-rounder':
      return <Star className="w-3 h-3" />;
    default:
      return null;
  }
};

const getRoleColor = (role: Player['role']) => {
  switch (role) {
    case 'batsman':
      return 'bg-primary/20 text-primary';
    case 'bowler':
      return 'bg-live/20 text-live';
    case 'all-rounder':
      return 'bg-gold/20 text-gold';
    case 'wicket-keeper':
      return 'bg-accent/20 text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const PlayerSelection: React.FC<PlayerSelectionProps> = ({
  team1,
  team2,
  selectedPlayersTeam1,
  selectedPlayersTeam2,
  onSelectPlayersTeam1,
  onSelectPlayersTeam2,
}) => {
  const [activeTeam, setActiveTeam] = useState<1 | 2>(1);
  
  const team1Players = React.useMemo(() => generatePlayers(team1.id), [team1.id]);
  const team2Players = React.useMemo(() => generatePlayers(team2.id), [team2.id]);

  const currentTeam = activeTeam === 1 ? team1 : team2;
  const currentPlayers = activeTeam === 1 ? team1Players : team2Players;
  const selectedPlayers = activeTeam === 1 ? selectedPlayersTeam1 : selectedPlayersTeam2;
  const onSelectPlayers = activeTeam === 1 ? onSelectPlayersTeam1 : onSelectPlayersTeam2;

  const handlePlayerToggle = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      onSelectPlayers(selectedPlayers.filter(id => id !== playerId));
    } else if (selectedPlayers.length < 11) {
      onSelectPlayers([...selectedPlayers, playerId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPlayers.length === 11) {
      onSelectPlayers([]);
    } else {
      onSelectPlayers(currentPlayers.slice(0, 11).map(p => p.id));
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Select Playing XI</h2>
        <p className="text-muted-foreground">
          Choose 11 players for each team
        </p>
      </div>

      {/* Team Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl">
        <button
          onClick={() => setActiveTeam(1)}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
            activeTeam === 1
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="truncate">{team1.name}</span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            selectedPlayersTeam1.length === 11 
              ? "bg-win/20 text-win" 
              : "bg-muted-foreground/20 text-muted-foreground"
          )}>
            {selectedPlayersTeam1.length}/11
          </span>
        </button>
        <button
          onClick={() => setActiveTeam(2)}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2",
            activeTeam === 2
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="truncate">{team2.name}</span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            selectedPlayersTeam2.length === 11 
              ? "bg-win/20 text-win" 
              : "bg-muted-foreground/20 text-muted-foreground"
          )}>
            {selectedPlayersTeam2.length}/11
          </span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {selectedPlayers.length} of 11 selected
        </span>
        <button
          onClick={handleSelectAll}
          className="text-sm text-primary font-medium hover:underline"
        >
          {selectedPlayers.length === 11 ? 'Clear All' : 'Select First 11'}
        </button>
      </div>

      {/* Player List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto px-1">
        {currentPlayers.map((player, index) => {
          const isSelected = selectedPlayers.includes(player.id);
          const isDisabled = !isSelected && selectedPlayers.length >= 11;
          
          return (
            <button
              key={player.id}
              onClick={() => handlePlayerToggle(player.id)}
              disabled={isDisabled}
              className={cn(
                "w-full p-3 rounded-xl border flex items-center gap-3 transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : isDisabled
                  ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                  : "border-border hover:border-primary/50 bg-card"
              )}
            >
              <div className="relative">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <User className="w-5 h-5" />
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-win flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">{player.name}</h3>
                  {getRoleIcon(player.role)}
                </div>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full capitalize",
                  getRoleColor(player.role)
                )}>
                  {player.role.replace('-', ' ')}
                </span>
              </div>
              
              <span className="text-xs text-muted-foreground w-6">
                #{index + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">{team1.name}: </span>
            <span className={cn(
              "font-medium",
              selectedPlayersTeam1.length === 11 ? "text-win" : "text-foreground"
            )}>
              {selectedPlayersTeam1.length}/11
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">{team2.name}: </span>
            <span className={cn(
              "font-medium",
              selectedPlayersTeam2.length === 11 ? "text-win" : "text-foreground"
            )}>
              {selectedPlayersTeam2.length}/11
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelection;

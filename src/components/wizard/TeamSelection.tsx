import React, { useState } from 'react';
import { Users, Check, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Team } from '@/types/cricket';

interface TeamSelectionProps {
  teams: Team[];
  selectedTeam1: Team | null;
  selectedTeam2: Team | null;
  onSelectTeam1: (team: Team) => void;
  onSelectTeam2: (team: Team) => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({
  teams,
  selectedTeam1,
  selectedTeam2,
  onSelectTeam1,
  onSelectTeam2,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const selectingFor = !selectedTeam1 ? 1 : !selectedTeam2 ? 2 : null;

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTeamClick = (team: Team) => {
    if (selectedTeam1?.id === team.id) {
      onSelectTeam1(null as any);
      return;
    }
    if (selectedTeam2?.id === team.id) {
      onSelectTeam2(null as any);
      return;
    }
    
    if (!selectedTeam1) {
      onSelectTeam1(team);
    } else if (!selectedTeam2) {
      onSelectTeam2(team);
    }
  };

  const isSelected = (team: Team) => 
    selectedTeam1?.id === team.id || selectedTeam2?.id === team.id;

  const getTeamLabel = (team: Team) => {
    if (selectedTeam1?.id === team.id) return 'Team A';
    if (selectedTeam2?.id === team.id) return 'Team B';
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Select Teams</h2>
        <p className="text-muted-foreground">
          {selectingFor === 1 
            ? 'Choose the first team'
            : selectingFor === 2
            ? 'Now choose the second team'
            : 'Both teams selected! Tap to change'}
        </p>
      </div>

      {/* Selected Teams Display */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className={cn(
          "w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all",
          selectedTeam1 ? "border-pitch bg-pitch/10" : "border-muted-foreground/30"
        )}>
          {selectedTeam1 ? (
            <>
              <div className="w-12 h-12 rounded-full bg-pitch/20 flex items-center justify-center mb-1">
                <span className="text-lg font-bold text-pitch">{selectedTeam1.name.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium text-foreground truncate max-w-[80px]">{selectedTeam1.name}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Team A</span>
          )}
        </div>

        <div className="text-2xl font-bold text-muted-foreground">VS</div>

        <div className={cn(
          "w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all",
          selectedTeam2 ? "border-accent bg-accent/10" : "border-muted-foreground/30"
        )}>
          {selectedTeam2 ? (
            <>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-1">
                <span className="text-lg font-bold text-accent">{selectedTeam2.name.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium text-foreground truncate max-w-[80px]">{selectedTeam2.name}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Team B</span>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search teams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto px-1">
        {filteredTeams.map((team) => (
          <button
            key={team.id}
            onClick={() => handleTeamClick(team)}
            className={cn(
              "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all",
              isSelected(team)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              isSelected(team) ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-foreground">{team.name}</h3>
              <p className="text-sm text-muted-foreground">{team.players.length} players • {team.location}</p>
            </div>
            {isSelected(team) ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {getTeamLabel(team)}
                </span>
                <Check className="w-5 h-5 text-primary" />
              </div>
            ) : null}
          </button>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">No teams yet</p>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamSelection;

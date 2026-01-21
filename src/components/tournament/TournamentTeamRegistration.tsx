import React, { useState, useEffect } from 'react';
import { Search, Users, Check, Plus, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TournamentFormData } from '@/pages/CreateTournamentPage';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  player_count?: number;
}

interface TournamentTeamRegistrationProps {
  formData: TournamentFormData;
  updateFormData: (updates: Partial<TournamentFormData>) => void;
}

const TournamentTeamRegistration: React.FC<TournamentTeamRegistrationProps> = ({ 
  formData, 
  updateFormData 
}) => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, logo_url');
      
      if (!error && data) {
        // Get player counts
        const teamsWithCounts = await Promise.all(
          data.map(async (team) => {
            const { count } = await supabase
              .from('team_players')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', team.id);
            return { ...team, player_count: count || 0 };
          })
        );
        setTeams(teamsWithCounts);
      }
      setIsLoading(false);
    };

    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTeamSelection = (teamId: string) => {
    const isSelected = formData.selectedTeamIds.includes(teamId);
    let newSelection: string[];

    if (isSelected) {
      newSelection = formData.selectedTeamIds.filter(id => id !== teamId);
    } else if (formData.selectedTeamIds.length < formData.maxTeams) {
      newSelection = [...formData.selectedTeamIds, teamId];
    } else {
      return; // Max teams reached
    }

    updateFormData({ selectedTeamIds: newSelection });
  };

  const selectedTeams = teams.filter(team => formData.selectedTeamIds.includes(team.id));

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-3">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Register Teams</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select teams to participate ({formData.selectedTeamIds.length}/{formData.maxTeams})
        </p>
      </div>

      {/* Selected Teams Preview */}
      {selectedTeams.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3">Selected Teams</p>
          <div className="flex flex-wrap gap-2">
            {selectedTeams.map(team => (
              <button
                key={team.id}
                onClick={() => toggleTeamSelection(team.id)}
                className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                {team.logo_url ? (
                  <img src={team.logo_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                {team.name}
                <span className="ml-1 text-xs">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search teams..."
          className="pl-10"
        />
      </div>

      {/* Teams List */}
      <ScrollArea className="h-[300px] -mx-4 px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No teams found</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => navigate('/teams/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTeams.map(team => {
              const isSelected = formData.selectedTeamIds.includes(team.id);
              const isDisabled = !isSelected && formData.selectedTeamIds.length >= formData.maxTeams;

              return (
                <button
                  key={team.id}
                  onClick={() => toggleTeamSelection(team.id)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : isDisabled
                      ? "border-border opacity-50 cursor-not-allowed"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">{team.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {team.player_count} players
                    </p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  )}>
                    {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Quick Create Team */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate('/teams/create')}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create New Team
      </Button>
    </div>
  );
};

export default TournamentTeamRegistration;

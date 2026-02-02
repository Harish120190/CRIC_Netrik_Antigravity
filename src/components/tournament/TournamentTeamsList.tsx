import React from 'react';
import { Shield, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { TournamentTeam } from '@/hooks/useTournaments';
import { cn } from '@/lib/utils';

interface TournamentTeamsListProps {
  teams: TournamentTeam[];
}

const TournamentTeamsList: React.FC<TournamentTeamsListProps> = ({ teams }) => {
  if (teams.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No teams registered yet</p>
      </div>
    );
  }

  // Sort by points, filter only approved
  const sortedTeams = [...teams]
    .filter(t => t.status === 'approved')
    .sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-3">
      {sortedTeams.map((team, index) => (
        <div
          key={team.id}
          className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
        >
          {/* Rank */}
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            index < 2 ? "bg-pitch text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {index + 1}
          </div>

          {/* Team Info */}
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {team.team?.logo_url ? (
              <img
                src={team.team.logo_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Shield className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">
              {team.team?.name || 'Unknown Team'}
            </h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span>{team.matches_played} played</span>
              <span className="text-pitch">{team.matches_won}W</span>
              <span className="text-destructive">{team.matches_lost}L</span>
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{team.points}</p>
            <div className="flex items-center gap-1 text-xs">
              {(team.net_run_rate || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3 text-pitch" />
              ) : (
                <TrendingDown className="w-3 h-3 text-destructive" />
              )}
              <span className={cn(
                (team.net_run_rate || 0) >= 0 ? "text-pitch" : "text-destructive"
              )}>
                {(team.net_run_rate || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TournamentTeamsList;

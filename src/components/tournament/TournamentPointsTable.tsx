import React from 'react';
import { Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TournamentTeam } from '@/hooks/useTournaments';
import { cn } from '@/lib/utils';

interface TournamentPointsTableProps {
  teams: TournamentTeam[];
}

const TournamentPointsTable: React.FC<TournamentPointsTableProps> = ({ teams }) => {
  // Sort teams by points, then NRR
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.net_run_rate || 0) - (a.net_run_rate || 0);
  });

  // Group teams by group_name if exists
  const groupedTeams = sortedTeams.reduce((acc, team) => {
    const group = team.group_name || 'All Teams';
    if (!acc[group]) acc[group] = [];
    acc[group].push(team);
    return acc;
  }, {} as Record<string, TournamentTeam[]>);

  const groups = Object.keys(groupedTeams).sort();

  if (teams.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No teams registered yet</p>
      </div>
    );
  }

  const PointsTableSection: React.FC<{ title: string; teamsList: TournamentTeam[] }> = ({ 
    title, 
    teamsList 
  }) => (
    <div className="mb-6 last:mb-0">
      {groups.length > 1 && (
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          {title}
        </h3>
      )}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center w-10">P</TableHead>
              <TableHead className="text-center w-10">W</TableHead>
              <TableHead className="text-center w-10">L</TableHead>
              <TableHead className="text-center w-10">T</TableHead>
              <TableHead className="text-center w-14">NRR</TableHead>
              <TableHead className="text-center w-12">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamsList.map((team, index) => (
              <TableRow 
                key={team.id}
                className={cn(
                  index < 2 && "bg-pitch/5"
                )}
              >
                <TableCell className="text-center font-medium">
                  <span className={cn(
                    "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs",
                    index < 2 ? "bg-pitch text-primary-foreground" : "bg-muted"
                  )}>
                    {index + 1}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {team.team?.logo_url ? (
                        <img 
                          src={team.team.logo_url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Shield className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium text-foreground truncate max-w-[100px]">
                      {team.team?.name || 'Unknown Team'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {team.matches_played}
                </TableCell>
                <TableCell className="text-center text-pitch font-medium">
                  {team.matches_won}
                </TableCell>
                <TableCell className="text-center text-destructive">
                  {team.matches_lost}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {team.matches_tied}
                </TableCell>
                <TableCell className="text-center text-sm">
                  <span className={cn(
                    (team.net_run_rate || 0) >= 0 ? "text-pitch" : "text-destructive"
                  )}>
                    {(team.net_run_rate || 0) >= 0 ? '+' : ''}
                    {(team.net_run_rate || 0).toFixed(3)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-bold text-foreground">{team.points}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {groups.length > 1 && (
        <p className="text-xs text-muted-foreground mt-2">
          Top 2 teams qualify for knockout stage
        </p>
      )}
    </div>
  );

  return (
    <div>
      {groups.map(group => (
        <PointsTableSection 
          key={group} 
          title={group} 
          teamsList={groupedTeams[group]} 
        />
      ))}
    </div>
  );
};

export default TournamentPointsTable;

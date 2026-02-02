import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockDB } from '@/services/mockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  logo_url?: string;
  captainId?: string;
}

interface TournamentRegistrationDialogProps {
  tournamentId: string;
  tournamentName: string;
  maxTeams?: number;
  onRegistered?: () => void;
}

export function TournamentRegistrationDialog({
  tournamentId,
  tournamentName,
  maxTeams,
  onRegistered,
}: TournamentRegistrationDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTeams, setIsFetchingTeams] = useState(true);
  const [isTournamentFull, setIsTournamentFull] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchUserTeams();
    }
  }, [open, user]);

  const fetchUserTeams = async () => {
    setIsFetchingTeams(true);
    try {
      // Get all teams
      const allTeams = mockDB.getTeams();
      // Filter teams where the current user is the captain
      // Note: In a real app, you'd check created_by or captain_id
      // For mockDB, we'll assume we can verify ownership via captainId if it exists, 
      // or just show all teams for demo purposes if captainId isn't strictly enforced.
      // Let's assume the      
      // Filter teams where the current user is the owner
      const userTeams = allTeams.filter(t => t.owner_id === user?.id);

      // Get teams already in the tournament
      const tournamentTeams = mockDB.getTournamentTeams(tournamentId);
      const existingTeamIds = new Set(tournamentTeams.map(tt => tt.teamId));

      // check if full
      if (maxTeams) {
        const approvedCount = tournamentTeams.filter(t => t.status === 'approved').length;
        if (approvedCount >= maxTeams) {
          setIsTournamentFull(true);
        }
      }

      // Filter out teams already in tournament
      const availableTeams = userTeams.filter(
        (team) => !existingTeamIds.has(team.id)
      );

      setTeams(availableTeams);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setIsFetchingTeams(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTeamId || !user) return;

    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const success = mockDB.registerTeamForTournament(selectedTeamId, tournamentId);

      if (!success) {
        throw new Error("Failed to register. Team might be already registered.");
      }

      toast.success('Registration request sent! Waiting for organizer approval.');
      setOpen(false);
      setSelectedTeamId('');
      setMessage('');
      onRegistered?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send registration request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Register Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register for {tournamentName}</DialogTitle>
          <DialogDescription>
            Select a team you manage to request registration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {isFetchingTeams ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : isTournamentFull ? (
            <div className="text-center py-6 text-destructive">
              <p className="font-semibold">Tournament Full</p>
              <p className="text-sm">Maximum number of teams ({maxTeams}) has been reached.</p>
            </div>
          ) : teams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              You don't have any eligible teams. You must be a captain of a team to register.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Select Team</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Message (optional)</Label>
                <Textarea
                  placeholder="Add a message to the organizer..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!selectedTeamId || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

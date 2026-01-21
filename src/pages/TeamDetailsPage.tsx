import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Users, QrCode, Copy, Check, UserPlus, 
  MoreVertical, Shield, Crown, User, Loader2, Trash2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  team_code: string;
  qr_code_url: string | null;
  created_by: string;
}

interface TeamPlayer {
  id: string;
  team_id: string;
  user_id: string | null;
  mobile_number: string;
  player_name: string;
  role: 'admin' | 'captain' | 'player';
  status: 'invited' | 'pending' | 'joined';
  joined_at: string | null;
}

const TeamDetailsPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTeamDetails, addPlayer, updatePlayerRole, removePlayer, loading } = useTeamManagement();
  
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerMobile, setNewPlayerMobile] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState<'player' | 'captain'>('player');

  const isAdmin = team?.created_by === user?.id || 
    players.some(p => p.user_id === user?.id && p.role === 'admin');
  const isCaptain = players.some(p => p.user_id === user?.id && p.role === 'captain');
  const canManage = isAdmin || isCaptain;

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) return;
      
      setIsLoading(true);
      const { team: teamData, players: playersData } = await getTeamDetails(teamId);
      setTeam(teamData);
      setPlayers(playersData);
      setIsLoading(false);
    };

    fetchTeam();
  }, [teamId, getTeamDetails]);

  const handleCopyCode = async () => {
    if (!team) return;
    await navigator.clipboard.writeText(team.team_code);
    setCopied(true);
    toast.success('Team code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPlayer = async () => {
    if (!teamId || !user || !newPlayerName || !newPlayerMobile) {
      toast.error('Please fill in all fields');
      return;
    }

    const player = await addPlayer({
      team_id: teamId,
      player_name: newPlayerName,
      mobile_number: newPlayerMobile,
      role: newPlayerRole,
    }, user.id);

    if (player) {
      setPlayers([...players, player]);
      setNewPlayerName('');
      setNewPlayerMobile('');
      setNewPlayerRole('player');
      setShowAddPlayer(false);
      toast.success('Player added successfully!');
    } else {
      toast.error('Failed to add player');
    }
  };

  const handleRoleChange = async (playerId: string, role: 'admin' | 'captain' | 'player') => {
    const success = await updatePlayerRole(playerId, role);
    if (success) {
      setPlayers(players.map(p => p.id === playerId ? { ...p, role } : p));
      toast.success('Role updated');
    } else {
      toast.error('Failed to update role');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    const success = await removePlayer(playerId);
    if (success) {
      setPlayers(players.filter(p => p.id !== playerId));
      toast.success('Player removed');
    } else {
      toast.error('Failed to remove player');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-primary" />;
      case 'captain': return <Crown className="w-4 h-4 text-yellow-500" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'joined': return <Badge variant="default" className="bg-green-500">Joined</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'invited': return <Badge variant="outline">Invited</Badge>;
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Please sign in to view team details</p>
          <Button onClick={() => navigate('/auth/signin')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Team not found</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container flex items-center gap-4 h-14 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/teams')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold truncate">{team.name}</h1>
          {isAdmin && <Badge className="ml-auto">Admin</Badge>}
        </div>
      </header>

      <main className="container max-w-lg mx-auto p-4 space-y-4">
        {/* Team Code & QR */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Team Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <code className="flex-1 text-2xl font-mono font-bold tracking-widest text-center bg-muted py-3 rounded-lg">
                {team.team_code}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopyCode}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            
            {team.qr_code_url && (
              <div className="flex justify-center">
                <img 
                  src={team.qr_code_url} 
                  alt="Team QR Code" 
                  className="w-48 h-48 rounded-lg border"
                />
              </div>
            )}
            
            <p className="text-sm text-muted-foreground text-center mt-3">
              Share this code or QR to invite players
            </p>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                Members ({players.length})
              </CardTitle>
              {canManage && (
                <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Player</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Player Name</Label>
                        <Input
                          placeholder="Enter name"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile Number</Label>
                        <Input
                          placeholder="Enter mobile number"
                          value={newPlayerMobile}
                          onChange={(e) => setNewPlayerMobile(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={newPlayerRole} onValueChange={(v) => setNewPlayerRole(v as 'player' | 'captain')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="player">Player</SelectItem>
                            <SelectItem value="captain">Captain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={handleAddPlayer}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Add Player
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {players.map((player) => (
                <div 
                  key={player.id} 
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {getRoleIcon(player.role)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{player.player_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{player.role}</p>
                  </div>
                  {getStatusBadge(player.status)}
                  {canManage && player.role !== 'admin' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleChange(player.id, 'captain')}>
                          <Crown className="w-4 h-4 mr-2" />
                          Make Captain
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(player.id, 'player')}>
                          <User className="w-4 h-4 mr-2" />
                          Make Player
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRemovePlayer(player.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}

              {players.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No members yet</p>
                  <p className="text-sm">Share the team code to invite players</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TeamDetailsPage;

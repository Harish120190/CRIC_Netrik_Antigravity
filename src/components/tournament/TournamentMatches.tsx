import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Edit2, Trash2, Wand2, Shuffle, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TournamentTeam } from '@/hooks/useTournaments';

interface Match {
  id: string;
  team1_name: string;
  team2_name: string;
  venue: string;
  status: string;
  match_date: string | null;
  winner_name: string | null;
  result: string | null;
  total_overs: number;
}

interface TournamentMatchesProps {
  tournamentId: string;
  teams?: TournamentTeam[];
  isOrganizer?: boolean;
  defaultVenue?: string;
  defaultOvers?: number;
  format?: string;
}

const TournamentMatches: React.FC<TournamentMatchesProps> = ({ 
  tournamentId, 
  teams = [],
  isOrganizer = false,
  defaultVenue = '',
  defaultOvers = 20,
  format = 'T20'
}) => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateType, setGenerateType] = useState<'round-robin' | 'double-round-robin' | 'knockout'>('round-robin');
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    team1_name: '',
    team2_name: '',
    venue: defaultVenue,
    match_date: '',
    match_time: '',
  });

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('match_date', { ascending: true });

    if (!error && data) {
      setMatches(data);
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      team1_name: '',
      team2_name: '',
      venue: defaultVenue,
      match_date: '',
      match_time: '',
    });
    setEditingMatch(null);
  };

  const openScheduleDialog = (match?: Match) => {
    if (match) {
      setEditingMatch(match);
      const matchDate = match.match_date ? new Date(match.match_date) : null;
      setFormData({
        team1_name: match.team1_name,
        team2_name: match.team2_name,
        venue: match.venue,
        match_date: matchDate ? matchDate.toISOString().split('T')[0] : '',
        match_time: matchDate ? matchDate.toTimeString().slice(0, 5) : '',
      });
    } else {
      resetForm();
    }
    setShowScheduleDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.team1_name || !formData.team2_name) {
      toast({ title: 'Error', description: 'Please select both teams', variant: 'destructive' });
      return;
    }

    if (formData.team1_name === formData.team2_name) {
      toast({ title: 'Error', description: 'Teams must be different', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const matchDateTime = formData.match_date && formData.match_time
      ? new Date(`${formData.match_date}T${formData.match_time}`).toISOString()
      : formData.match_date
      ? new Date(formData.match_date).toISOString()
      : null;

    try {
      if (editingMatch) {
        const { error } = await supabase
          .from('matches')
          .update({
            team1_name: formData.team1_name,
            team2_name: formData.team2_name,
            venue: formData.venue || defaultVenue,
            match_date: matchDateTime,
          })
          .eq('id', editingMatch.id);

        if (error) throw error;
        toast({ title: 'Match Updated', description: 'Match schedule has been updated' });
      } else {
        const { error } = await supabase
          .from('matches')
          .insert({
            tournament_id: tournamentId,
            team1_name: formData.team1_name,
            team2_name: formData.team2_name,
            venue: formData.venue || defaultVenue || 'TBD',
            match_date: matchDateTime,
            total_overs: defaultOvers,
            status: 'upcoming',
          });

        if (error) throw error;
        toast({ title: 'Match Scheduled', description: 'New match has been scheduled' });
      }

      await fetchMatches();
      setShowScheduleDialog(false);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (matchId: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) throw error;
      toast({ title: 'Match Deleted' });
      await fetchMatches();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Generate Round-Robin fixtures (each team plays every other team once)
  const generateRoundRobinFixtures = () => {
    const teamNames = teams.map(t => t.team?.name || '').filter(Boolean);
    const fixtures: { team1: string; team2: string }[] = [];
    
    for (let i = 0; i < teamNames.length; i++) {
      for (let j = i + 1; j < teamNames.length; j++) {
        fixtures.push({ team1: teamNames[i], team2: teamNames[j] });
      }
    }
    
    return fixtures;
  };

  // Generate Double Round-Robin fixtures (each team plays every other team twice - home and away)
  const generateDoubleRoundRobinFixtures = () => {
    const teamNames = teams.map(t => t.team?.name || '').filter(Boolean);
    const fixtures: { team1: string; team2: string }[] = [];
    
    // First leg - Team A vs Team B
    for (let i = 0; i < teamNames.length; i++) {
      for (let j = i + 1; j < teamNames.length; j++) {
        fixtures.push({ team1: teamNames[i], team2: teamNames[j] });
      }
    }
    
    // Second leg - Team B vs Team A (reversed home/away)
    for (let i = 0; i < teamNames.length; i++) {
      for (let j = i + 1; j < teamNames.length; j++) {
        fixtures.push({ team1: teamNames[j], team2: teamNames[i] });
      }
    }
    
    return fixtures;
  };

  // Generate Knockout bracket fixtures
  const generateKnockoutFixtures = () => {
    const teamNames = teams.map(t => t.team?.name || '').filter(Boolean);
    const shuffled = [...teamNames].sort(() => Math.random() - 0.5);
    const fixtures: { team1: string; team2: string }[] = [];
    
    // Pair teams for first round
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      fixtures.push({ team1: shuffled[i], team2: shuffled[i + 1] });
    }
    
    // If odd number of teams, last team gets a bye (we'll skip them)
    return fixtures;
  };

  const handleGenerateFixtures = async () => {
    if (teams.length < 2) {
      toast({ title: 'Error', description: 'Need at least 2 teams', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);

    try {
      let fixtures: { team1: string; team2: string }[];
      
      switch (generateType) {
        case 'round-robin':
          fixtures = generateRoundRobinFixtures();
          break;
        case 'double-round-robin':
          fixtures = generateDoubleRoundRobinFixtures();
          break;
        case 'knockout':
          fixtures = generateKnockoutFixtures();
          break;
        default:
          fixtures = generateRoundRobinFixtures();
      }

      if (fixtures.length === 0) {
        toast({ title: 'Error', description: 'Could not generate fixtures', variant: 'destructive' });
        return;
      }

      // Create all matches
      const matchesToInsert = fixtures.map((fixture, index) => ({
        tournament_id: tournamentId,
        team1_name: fixture.team1,
        team2_name: fixture.team2,
        venue: defaultVenue || 'TBD',
        total_overs: defaultOvers,
        status: 'upcoming',
        match_date: null,
      }));

      const { error } = await supabase
        .from('matches')
        .insert(matchesToInsert);

      if (error) throw error;

      toast({ 
        title: 'Fixtures Generated', 
        description: `${fixtures.length} ${generateType} matches created` 
      });
      
      await fetchMatches();
      setShowGenerateDialog(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearAllFixtures = async () => {
    if (!confirm('Are you sure you want to delete ALL upcoming matches? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('tournament_id', tournamentId)
        .eq('status', 'upcoming');

      if (error) throw error;
      toast({ title: 'All Upcoming Matches Cleared' });
      await fetchMatches();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-live/10 text-live';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const formatMatchDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  const teamNames = teams.map(t => t.team?.name || '').filter(Boolean);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Group by status
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const completedMatches = matches.filter(m => m.status === 'completed');

  const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
    const dateTime = formatMatchDateTime(match.match_date);
    
    return (
      <div className="bg-card rounded-xl border border-border p-4 relative group">
        {isOrganizer && match.status === 'upcoming' && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => openScheduleDialog(match)}
              className="p-1.5 bg-muted rounded-lg hover:bg-primary/10 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={() => handleDelete(match.id)}
              className="p-1.5 bg-muted rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-semibold",
            getStatusStyle(match.status)
          )}>
            {match.status === 'live' && (
              <span className="inline-block w-2 h-2 rounded-full bg-live mr-1 animate-pulse" />
            )}
            {match.status.toUpperCase()}
          </span>
          {dateTime && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {dateTime.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {dateTime.time}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <p className={cn(
              "font-semibold",
              match.winner_name === match.team1_name ? "text-pitch" : "text-foreground"
            )}>
              {match.team1_name}
            </p>
          </div>
          <div className="px-3 py-1 bg-muted rounded-lg">
            <span className="text-sm font-bold text-muted-foreground">VS</span>
          </div>
          <div className="flex-1 text-center">
            <p className={cn(
              "font-semibold",
              match.winner_name === match.team2_name ? "text-pitch" : "text-foreground"
            )}>
              {match.team2_name}
            </p>
          </div>
        </div>

        {match.result && (
          <p className="text-xs text-center text-muted-foreground mt-3 pt-3 border-t border-border">
            {match.result}
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" />
          {match.venue}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Organizer Actions */}
      {isOrganizer && teams.length >= 2 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => openScheduleDialog()}
            className="flex-1"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Match
          </Button>
          <Button
            onClick={() => setShowGenerateDialog(true)}
            className="flex-1"
            variant="default"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Auto-Generate Fixtures
          </Button>
        </div>
      )}

      {matches.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No matches scheduled yet</p>
          {isOrganizer && teams.length >= 2 && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <Button
                onClick={() => openScheduleDialog()}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Manually
              </Button>
              <Button
                onClick={() => setShowGenerateDialog(true)}
                size="sm"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Auto-Generate
              </Button>
            </div>
          )}
        </div>
      )}

      {liveMatches.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
            Live Now
          </h3>
          <div className="space-y-3">
            {liveMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {upcomingMatches.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Upcoming ({upcomingMatches.length})</h3>
          <div className="space-y-3">
            {upcomingMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {completedMatches.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Completed ({completedMatches.length})</h3>
          <div className="space-y-3">
            {completedMatches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMatch ? 'Edit Match' : 'Schedule New Match'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team1">Team 1</Label>
                <Select
                  value={formData.team1_name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, team1_name: value }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamNames.map(name => (
                      <SelectItem 
                        key={name} 
                        value={name}
                        disabled={name === formData.team2_name}
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="team2">Team 2</Label>
                <Select
                  value={formData.team2_name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, team2_name: value }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamNames.map(name => (
                      <SelectItem 
                        key={name} 
                        value={name}
                        disabled={name === formData.team1_name}
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Match venue"
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.match_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, match_date: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.match_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, match_time: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingMatch ? 'Update Match' : 'Schedule Match'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Fixtures Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Auto-Generate Fixtures
            </DialogTitle>
            <DialogDescription>
              Automatically create all matches for your tournament based on the selected format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setGenerateType('round-robin')}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  generateType === 'round-robin'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Round Robin</span>
                  </div>
                  <span className="text-xs text-primary font-medium">
                    {teams.length > 1 ? `${(teams.length * (teams.length - 1)) / 2} matches` : '0 matches'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-7">
                  Every team plays against every other team once
                </p>
              </button>

              <button
                onClick={() => setGenerateType('double-round-robin')}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  generateType === 'double-round-robin'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Double Round Robin</span>
                  </div>
                  <span className="text-xs text-primary font-medium">
                    {teams.length > 1 ? `${teams.length * (teams.length - 1)} matches` : '0 matches'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-7">
                  Home & away — each team plays every other team twice
                </p>
              </button>

              <button
                onClick={() => setGenerateType('knockout')}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  generateType === 'knockout'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Knockout</span>
                  </div>
                  <span className="text-xs text-primary font-medium">
                    {teams.length > 1 ? `${Math.floor(teams.length / 2)} first-round` : '0 matches'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-7">
                  Single elimination bracket with random seeding
                </p>
              </button>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                <strong>{teams.length}</strong> teams registered. 
                {generateType === 'round-robin' 
                  ? ` Each team will play ${teams.length - 1} matches.`
                  : generateType === 'double-round-robin'
                    ? ` Each team will play ${(teams.length - 1) * 2} matches (home & away).`
                    : teams.length % 2 !== 0 
                      ? ' Odd number of teams - one team will get a bye.'
                      : ' Teams will be randomly paired for the bracket.'}
              </p>
            </div>

            {upcomingMatches.length > 0 && (
              <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                <p className="text-sm text-destructive">
                  ⚠️ You have {upcomingMatches.length} upcoming matches. New fixtures will be added alongside existing ones.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleClearAllFixtures}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear All Upcoming Matches First
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateFixtures} disabled={isGenerating || teams.length < 2}>
              {isGenerating ? 'Generating...' : 'Generate Fixtures'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentMatches;

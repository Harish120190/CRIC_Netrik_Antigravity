import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, GripVertical, Edit2, Trash2, Plus, ChevronRight, LayoutGrid, List as ListIcon, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Match, mockDB, Team } from '@/services/mockDatabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FixtureEditorProps {
    tournamentId: string;
}

const FixtureEditor: React.FC<FixtureEditorProps> = ({ tournamentId }) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
    const [groupBy, setGroupBy] = useState<'date' | 'stage'>('date');
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // DnD State
    const [draggedMatch, setDraggedMatch] = useState<Match | null>(null);
    const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
    const [activeTouchId, setActiveTouchId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [tournamentId]);

    const loadData = () => {
        const tournamentMatches = mockDB.getTournamentMatches(tournamentId).filter(m => m.tournament_id === tournamentId);
        setMatches(tournamentMatches.sort((a, b) => {
            const dateA = new Date(`${a.match_date}T${a.match_time || '00:00'}`);
            const dateB = new Date(`${b.match_date}T${b.match_time || '00:00'}`);
            return dateA.getTime() - dateB.getTime() || (a.match_order || 0) - (b.match_order || 0);
        }));

        const tournamentTeams = mockDB.getTournamentTeams(tournamentId)
            .filter(tt => tt.status === 'approved')
            .map(tt => mockDB.getTeams().find(t => t.id === tt.teamId))
            .filter(Boolean) as Team[];
        setTeams(tournamentTeams);
    };

    const handleDragStart = (e: React.DragEvent, match: Match) => {
        setDraggedMatch(match);
        e.dataTransfer.setData('matchId', match.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetKey: string) => {
        e.preventDefault();
        const matchId = e.dataTransfer.getData('matchId');
        executeDrop(matchId, targetKey);
        setDraggedMatch(null);
    };

    const executeDrop = (matchId: string, targetKey: string) => {
        if (!matchId) return;

        const match = matches.find(m => m.id === matchId);
        if (match) {
            let updatedMatch: Match | null = null;
            if (groupBy === 'date' && match.match_date !== targetKey) {
                updatedMatch = mockDB.updateMatch(matchId, { match_date: targetKey });
                if (updatedMatch) {
                    toast.success(`Match rescheduled to ${targetKey}`);
                }
            } else if (groupBy === 'stage') {
                const currentStage = match.round_name || match.group_name || 'Unassigned';
                if (currentStage !== targetKey) {
                    toast.info(`Match dropped into "${targetKey}". Stage changes via drag-and-drop coming in Phase 3.`);
                }
                updatedMatch = match;
            }

            if (updatedMatch) {
                loadData();
            }
        }
    };

    // Touch Support
    const handleTouchStart = (e: React.TouchEvent, match: Match) => {
        setDraggedMatch(match);
        setActiveTouchId(match.id);
        const touch = e.touches[0];
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setTouchOffset({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!draggedMatch) return;
        // Visual feedback could be added here using a fixed-position clone
        e.preventDefault(); // Prevent scrolling while dragging
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!draggedMatch) return;

        const touch = e.changedTouches[0];
        const elem = document.elementFromPoint(touch.clientX, touch.clientY);

        // Find the drop target
        let target = elem;
        while (target && !(target as HTMLElement).getAttribute('data-drop-key')) {
            target = target.parentElement;
        }

        if (target) {
            const targetKey = (target as HTMLElement).getAttribute('data-drop-key');
            if (targetKey) {
                executeDrop(draggedMatch.id, targetKey);
            }
        }

        setDraggedMatch(null);
        setActiveTouchId(null);
    };

    const groupMatchesByStage = () => {
        const groups: Record<string, Match[]> = {};
        matches.forEach(m => {
            const stage = m.round_name || m.group_name || 'Unassigned';
            if (!groups[stage]) groups[stage] = [];
            groups[stage].push(m);
        });
        return Object.entries(groups);
    };

    const handleEditMatch = (match: Match) => {
        setEditingMatch(match);
        setIsEditDialogOpen(true);
    };

    const handleSaveOverride = (updates: Partial<Match>) => {
        if (editingMatch) {
            mockDB.updateMatch(editingMatch.id, updates);
            toast.success("Match details updated");
            setIsEditDialogOpen(false);
            loadData();
        }
    };

    const handleDeleteMatch = (id: string) => {
        if (confirm("Are you sure you want to remove this fixture?")) {
            mockDB.deleteMatch(id);
            toast.success("Fixture removed");
            loadData();
        }
    };

    // Group matches by date for timeline view
    const groupMatchesByDate = () => {
        const groups: Record<string, Match[]> = {};
        matches.forEach(m => {
            if (!groups[m.match_date]) groups[m.match_date] = [];
            groups[m.match_date].push(m);
        });
        return Object.entries(groups).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Fixture Editor</h2>
                    <p className="text-muted-foreground">Drag and drop matches to reschedule or reorder</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-muted rounded-lg p-1 flex">
                        <Button
                            variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('timeline')}
                            className="h-8 w-8 p-0"
                        >
                            <ListIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="h-8 w-8 p-0"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="bg-muted rounded-lg p-1 flex">
                        <Button
                            size="sm"
                            variant={groupBy === 'date' ? 'secondary' : 'ghost'}
                            onClick={() => setGroupBy('date')}
                            className="text-xs px-2 h-8"
                        >
                            By Date
                        </Button>
                        <Button
                            size="sm"
                            variant={groupBy === 'stage' ? 'secondary' : 'ghost'}
                            onClick={() => setGroupBy('stage')}
                            className="text-xs px-2 h-8"
                        >
                            By Stage
                        </Button>
                    </div>
                    <Button size="sm" onClick={() => toast.info("Manual fixture addition coming soon")}>
                        <Plus className="h-4 w-4 mr-2" /> Add Match
                    </Button>
                </div>
            </div>

            <div className="grid gap-8">
                {(groupBy === 'date' ? groupMatchesByDate() : groupMatchesByStage()).map(([groupKey, groupMatches]) => (
                    <div
                        key={groupKey}
                        className="space-y-4"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, groupKey)}
                        data-drop-key={groupKey}
                    >
                        <div className="flex items-center gap-2">
                            {groupBy === 'date' ? <CalendarIcon className="h-4 w-4 text-primary" /> : <Trophy className="h-4 w-4 text-primary" />}
                            <h3 className="font-semibold text-lg">
                                {groupBy === 'date' ? format(new Date(groupKey), 'PPP') : groupKey}
                            </h3>
                            <Badge variant="outline" className="ml-2">{groupMatches.length} Matches</Badge>
                        </div>

                        <div className="grid gap-3">
                            {groupMatches.map((match) => (
                                <Card
                                    key={match.id}
                                    className={cn(
                                        "hover:shadow-lg transition-all cursor-move border-l-4 border-l-primary",
                                        draggedMatch?.id === match.id && "opacity-50 ring-2 ring-primary"
                                    )}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, match)}
                                    onTouchStart={(e) => handleTouchStart(e, match)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                                            <div className="flex items-center gap-3 col-span-2">
                                                <div className="text-center min-w-[100px]">
                                                    <p className="font-bold text-sm truncate">{match.team1_name}</p>
                                                    <span className="text-[10px] text-muted-foreground">vs</span>
                                                    <p className="font-bold text-sm truncate">{match.team2_name}</p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3 mr-1" /> {match.match_time || 'TBD'}
                                                </div>
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <MapPin className="h-3 w-3 mr-1" /> {match.ground_name}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Badge variant={match.status === 'live' ? 'destructive' : match.status === 'completed' ? 'secondary' : 'default'} className="uppercase text-[10px]">
                                                    {match.status}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditMatch(match)}>
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteMatch(match.id)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <OverrideDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                match={editingMatch}
                teams={teams}
                onSave={handleSaveOverride}
            />
        </div>
    );
};

interface OverrideDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    match: Match | null;
    teams: Team[];
    onSave: (updates: Partial<Match>) => void;
}

const OverrideDialog: React.FC<OverrideDialogProps> = ({ open, onOpenChange, match, teams, onSave }) => {
    const [team1Id, setTeam1Id] = useState("");
    const [team2Id, setTeam2Id] = useState("");
    const [time, setTime] = useState("");
    const [ground, setGround] = useState("");

    useEffect(() => {
        if (match) {
            setTeam1Id(match.team1_id || "");
            setTeam2Id(match.team2_id || "");
            setTime(match.match_time || "");
            setGround(match.ground_name || "");
        }
    }, [match]);

    const handleSave = () => {
        const t1 = teams.find(t => t.id === team1Id);
        const t2 = teams.find(t => t.id === team2Id);

        onSave({
            team1_id: team1Id,
            team2_id: team2Id,
            team1_name: t1?.name || match?.team1_name,
            team2_name: t2?.name || match?.team2_name,
            match_time: time,
            ground_name: ground
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Override Fixture Details</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Team 1</Label>
                            <Select value={team1Id} onValueChange={setTeam1Id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Team 1" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Team 2</Label>
                            <Select value={team2Id} onValueChange={setTeam2Id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Team 2" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Match Time</Label>
                            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Ground</Label>
                            <Input value={ground} onChange={(e) => setGround(e.target.value)} placeholder="Venue Name" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FixtureEditor;

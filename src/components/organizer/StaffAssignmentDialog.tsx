
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { UserSearchSelect } from '@/components/common/UserSearchSelect';
import { mockDB, Match, User } from '@/services/mockDatabase';
import { toast } from 'sonner';

interface StaffAssignmentDialogProps {
    match: Match;
    onUpdate: () => void;
    children?: React.ReactNode; // Trigger button
}

export function StaffAssignmentDialog({ match, onUpdate, children }: StaffAssignmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [scorers, setScorers] = useState<User[]>([]);
    const [umpires, setUmpires] = useState<User[]>([]);

    useEffect(() => {
        if (open) {
            loadStaff();
        }
    }, [open, match]);

    const loadStaff = () => {
        const allUsers = mockDB.getUsers();
        if (match.scorers) {
            setScorers(allUsers.filter(u => match.scorers?.includes(u.id)));
        } else {
            setScorers([]);
        }

        if (match.umpires) {
            setUmpires(allUsers.filter(u => match.umpires?.includes(u.id)));
        } else {
            setUmpires([]);
        }
    };

    const handleAddScorer = (userId: string) => {
        const currentScorers = match.scorers || [];
        if (currentScorers.includes(userId)) return;

        const newScorers = [...currentScorers, userId];
        mockDB.updateMatch(match.id, { scorers: newScorers });
        toast.success("Scorer assigned successfully");
        loadStaff(); // Reload local state
        onUpdate();
    };

    const handleRemoveScorer = (userId: string) => {
        const currentScorers = match.scorers || [];
        const newScorers = currentScorers.filter(id => id !== userId);
        mockDB.updateMatch(match.id, { scorers: newScorers });
        toast.success("Scorer removed");
        loadStaff();
        onUpdate();
    };

    const handleAddUmpire = (userId: string) => {
        const currentUmpires = match.umpires || [];
        if (currentUmpires.includes(userId)) return;

        const newUmpires = [...currentUmpires, userId];
        mockDB.updateMatch(match.id, { umpires: newUmpires });
        toast.success("Umpire assigned successfully");
        loadStaff();
        onUpdate();
    };

    const handleRemoveUmpire = (userId: string) => {
        const currentUmpires = match.umpires || [];
        const newUmpires = currentUmpires.filter(id => id !== userId);
        mockDB.updateMatch(match.id, { umpires: newUmpires });
        toast.success("Umpire removed");
        loadStaff();
        onUpdate();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Staff</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    {/* Scorers Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Scorers</Label>
                            <p className="text-[0.8rem] text-muted-foreground">Scorers will have permission to update scores for this match.</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {scorers.map(user => (
                                <Badge key={user.id} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                                    {user.fullName}
                                    <button onClick={() => handleRemoveScorer(user.id)} className="ml-1 hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            {scorers.length === 0 && <span className="text-sm text-muted-foreground italic">No scorers assigned</span>}
                        </div>

                        <UserSearchSelect
                            onSelect={handleAddScorer}
                            label="Add Scorer"
                            placeholder="Search by name..."
                            excludeIds={scorers.map(s => s.id)}
                        // roleFilter="scorer" // Optional: enable if we want to restrict to users with 'scorer' role
                        />
                    </div>

                    <div className="border-t" />

                    {/* Umpires Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Umpires</Label>
                            <p className="text-[0.8rem] text-muted-foreground">Umpires can view and verify match status.</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                            {umpires.map(user => (
                                <Badge key={user.id} variant="secondary" className="pl-2 pr-1 py-1 gap-1">
                                    {user.fullName}
                                    <button onClick={() => handleRemoveUmpire(user.id)} className="ml-1 hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            {umpires.length === 0 && <span className="text-sm text-muted-foreground italic">No umpires assigned</span>}
                        </div>

                        <UserSearchSelect
                            onSelect={handleAddUmpire}
                            label="Add Umpire"
                            placeholder="Search by name..."
                            excludeIds={umpires.map(u => u.id)}
                        // roleFilter="umpire"
                        />
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}

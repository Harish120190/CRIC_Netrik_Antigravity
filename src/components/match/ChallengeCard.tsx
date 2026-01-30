
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Trophy, AlertCircle } from "lucide-react";
import { Challenge } from "@/types/cricket";
import { mockDB } from "@/services/mockDatabase";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ChallengeCardProps {
    challenge: Challenge;
    isReceived: boolean;
    onStatusChange: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, isReceived, onStatusChange }) => {
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState<'reject' | 'reschedule' | null>(null);
    const [note, setNote] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const senderTeam = mockDB.getTeams().find(t => t.id === challenge.senderTeamId);
    const receiverTeam = mockDB.getTeams().find(t => t.id === challenge.receiverTeamId);
    const opponent = isReceived ? senderTeam : receiverTeam;

    const handleAccept = () => {
        try {
            mockDB.updateChallengeStatus(challenge.id, 'accepted');
            toast.success("Challenge accepted!");
            onStatusChange();
        } catch (e) {
            toast.error("Failed to accept challenge");
        }
    };

    const handleActionSubmit = () => {
        try {
            if (actionType === 'reject') {
                mockDB.updateChallengeStatus(challenge.id, 'rejected', note);
                toast.success("Challenge rejected");
            } else if (actionType === 'reschedule') {
                if (!newDate || !newTime) {
                    toast.error("Please select new date and time");
                    return;
                }
                const newDetails = {
                    date: new Date(`${newDate}T${newTime}`),
                    time: newTime
                };
                mockDB.updateChallengeStatus(challenge.id, 'rescheduled', note, newDetails);
                toast.success("Reschedule request sent");
            }
            setActionDialogOpen(false);
            onStatusChange();
            setNote('');
            setNewDate('');
            setNewTime('');
        } catch (e) {
            toast.error("Failed to update challenge");
        }
    };

    const openActionDialog = (type: 'reject' | 'reschedule') => {
        setActionType(type);
        setNote('');
        if (type === 'reschedule') {
            const dateStr = new Date(challenge.matchDetails.date).toISOString().split('T')[0];
            setNewDate(dateStr);
            setNewTime(challenge.matchDetails.time || '07:00');
        }
        setActionDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
            case 'accepted': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
            case 'rescheduled': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <>
            <Card className="w-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            {opponent?.name || 'Unknown Team'}
                            <Badge variant="outline" className={getStatusColor(challenge.status)}>
                                {challenge.status.toUpperCase()}
                            </Badge>
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">
                            {new Date(challenge.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(challenge.matchDetails.date).toDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{challenge.matchDetails.time || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{challenge.matchDetails.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Trophy className="w-4 h-4" />
                            <span>{challenge.matchDetails.format} • {challenge.matchDetails.ballType} ball</span>
                        </div>
                    </div>

                    {challenge.notes && (
                        <div className="bg-muted/50 p-2 rounded-md text-xs italic">
                            "{challenge.notes}"
                        </div>
                    )}

                    {challenge.responseNote && (
                        <div className="bg-red-500/10 p-2 rounded-md text-xs text-red-600 flex gap-1">
                            <AlertCircle className="w-3 h-3 mt-0.5" />
                            <span>{challenge.responseNote}</span>
                        </div>
                    )}
                </CardContent>

                {isReceived && challenge.status === 'pending' && (
                    <CardFooter className="flex justify-end gap-2 pt-0">
                        <Button variant="outline" size="sm" onClick={() => openActionDialog('reschedule')}>
                            Reschedule
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openActionDialog('reject')}>
                            Reject
                        </Button>
                        <Button variant="default" size="sm" onClick={handleAccept} className="bg-green-600 hover:bg-green-700 text-white">
                            Accept
                        </Button>
                    </CardFooter>
                )}
            </Card>

            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'reject' ? 'Reject Challenge' : 'Propose New Time'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'reject'
                                ? 'Add a note explaining why you cannot accept this challenge.'
                                : 'Suggest a different date or time for the match.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {actionType === 'reschedule' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>New Date</Label>
                                    <Input
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Time</Label>
                                    <Input
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label>Note (Optional)</Label>
                            <Textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={actionType === 'reject' ? "Cannot make it..." : "How about this time?"}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setActionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleActionSubmit}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

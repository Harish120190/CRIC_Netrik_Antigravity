
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockDB } from '@/services/mockDatabase';
import { toast } from 'sonner';

interface SendChallengeDialogProps {
    currentTeamId: string;
    onChallengeSent: () => void;
}

export const SendChallengeDialog: React.FC<SendChallengeDialogProps> = ({ currentTeamId, onChallengeSent }) => {
    const [open, setOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('07:00');
    const [venue, setVenue] = useState<string>('');
    const [format, setFormat] = useState<'T20' | 'ODI' | 'T10' | 'Custom'>('T20');
    const [ballType, setBallType] = useState<'tennis' | 'leather' | 'box' | 'stitch'>('tennis');
    const [overs, setOvers] = useState<string>('20');
    const [notes, setNotes] = useState<string>('');

    const teams = mockDB.getTeams().filter(t => t.id !== currentTeamId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedTeam || !date || !venue) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            mockDB.createChallenge({
                senderTeamId: currentTeamId,
                receiverTeamId: selectedTeam,
                matchDetails: {
                    date: new Date(`${date}T${time}`),
                    time,
                    venue,
                    format,
                    ballType,
                    overs: parseInt(overs)
                },
                notes
            });

            toast.success("Challenge sent successfully!");
            setOpen(false);
            onChallengeSent();
            // Reset form
            setSelectedTeam('');
            setDate('');
            setVenue('');
            setNotes('');
        } catch (error) {
            toast.error("Failed to send challenge");
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                    Send Challenge
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Send Match Challenge</DialogTitle>
                    <DialogDescription>
                        Challenge another team for a match. They will receive a notification to accept or reject.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Opponent Team</Label>
                        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map(team => (
                                    <SelectItem key={team.id} value={team.id}>
                                        {team.name} {team.location ? `(${team.location})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Time</Label>
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Ground / Venue</Label>
                        <Input
                            placeholder="Enter ground name or location"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Format</Label>
                            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="T20">T20</SelectItem>
                                    <SelectItem value="T10">T10</SelectItem>
                                    <SelectItem value="ODI">ODI</SelectItem>
                                    <SelectItem value="Custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ball Type</Label>
                            <Select value={ballType} onValueChange={(v: any) => setBallType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tennis">Tennis</SelectItem>
                                    <SelectItem value="leather">Leather</SelectItem>
                                    <SelectItem value="stitch">Stitch</SelectItem>
                                    <SelectItem value="box">Box</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Overs</Label>
                        <Input
                            type="number"
                            value={overs}
                            onChange={(e) => setOvers(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Message (Optional)</Label>
                        <Textarea
                            placeholder="Add a note for the captain..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit">Send Challenge</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

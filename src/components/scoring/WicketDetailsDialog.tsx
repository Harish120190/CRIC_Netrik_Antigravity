import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type WicketType = 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket' | 'retired' | 'other';

interface WicketDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bowlingTeamPlayers: { id: string; name: string }[];
    strikerName: string;
    nonStrikerName: string;
    onConfirm: (type: WicketType, fielderId?: string, isStrikerOut?: boolean) => void;
}

const WicketDetailsDialog: React.FC<WicketDetailsDialogProps> = ({
    open,
    onOpenChange,
    bowlingTeamPlayers,
    strikerName,
    nonStrikerName,
    onConfirm
}) => {
    const [wicketType, setWicketType] = useState<WicketType>('caught');
    const [fielderId, setFielderId] = useState<string>('');
    const [whoOut, setWhoOut] = useState<'striker' | 'non_striker'>('striker');

    const handleConfirm = () => {
        onConfirm(wicketType, fielderId || undefined, whoOut === 'striker');
        onOpenChange(false);
        // Reset defaults
        setWicketType('caught');
        setFielderId('');
        setWhoOut('striker');
    };

    const needsFielder = ['caught', 'runout', 'stumped'].includes(wicketType);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Wicket Details</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Dismissal Type</Label>
                        <Select value={wicketType} onValueChange={(v) => setWicketType(v as WicketType)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="caught">Caught</SelectItem>
                                <SelectItem value="bowled">Bowled</SelectItem>
                                <SelectItem value="lbw">LBW</SelectItem>
                                <SelectItem value="runout">Run Out</SelectItem>
                                <SelectItem value="stumped">Stumped</SelectItem>
                                <SelectItem value="hitwicket">Hit Wicket</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {needsFielder && (
                        <div className="grid gap-2">
                            <Label>Fielder / Involved Player</Label>
                            <Select value={fielderId} onValueChange={setFielderId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Fielder" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bowlingTeamPlayers.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {wicketType === 'runout' && (
                        <div className="grid gap-2">
                            <Label>Who is Out?</Label>
                            <RadioGroup value={whoOut} onValueChange={(v) => setWhoOut(v as 'striker' | 'non_striker')}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="striker" id="r1" />
                                    <Label htmlFor="r1">{strikerName} (Striker)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="non_striker" id="r2" />
                                    <Label htmlFor="r2">{nonStrikerName} (Non-Striker)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm}>Confirm Wicket</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WicketDetailsDialog;

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Ball } from '@/services/mockDatabase';
import { WicketType } from './WicketDetailsDialog';

interface EditBallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ball: Ball | null;
    onSave: (updates: Partial<Ball>, reason: string) => void;
}

const EditBallDialog: React.FC<EditBallDialogProps> = ({
    open,
    onOpenChange,
    ball,
    onSave,
}) => {
    const [runs, setRuns] = useState(ball?.runs_scored || 0);
    const [extrasType, setExtrasType] = useState<string | null>(ball?.extras_type || null);
    const [extrasRuns, setExtrasRuns] = useState(ball?.extras_runs || 0);
    const [isWicket, setIsWicket] = useState(ball?.is_wicket || false);
    const [wicketType, setWicketType] = useState<WicketType | undefined>(ball?.wicket_type as WicketType);
    const [reason, setReason] = useState("");

    // Update states when ball changes
    React.useEffect(() => {
        if (ball) {
            setRuns(ball.runs_scored);
            setExtrasType(ball.extras_type || null);
            setExtrasRuns(ball.extras_runs);
            setIsWicket(ball.is_wicket);
            setWicketType(ball.wicket_type as WicketType);
            setReason("");
        }
    }, [ball]);

    const handleSave = () => {
        if (!reason.trim()) {
            return;
        }

        onSave({
            runs_scored: runs,
            extras_type: extrasType,
            extras_runs: extrasRuns,
            is_wicket: isWicket,
            wicket_type: isWicket ? wicketType : undefined,
        }, reason);
        onOpenChange(false);
    };

    if (!ball) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Delivery (Over {ball.over_number}, Ball {ball.ball_number})</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="runs" className="text-right">Runs</Label>
                        <Input
                            id="runs"
                            type="number"
                            value={runs}
                            onChange={(e) => setRuns(parseInt(e.target.value) || 0)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Extra</Label>
                        <Select
                            value={extrasType || "none"}
                            onValueChange={(v) => setExtrasType(v === "none" ? null : v)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Extras Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="wide">Wide</SelectItem>
                                <SelectItem value="no-ball">No Ball</SelectItem>
                                <SelectItem value="bye">Bye</SelectItem>
                                <SelectItem value="leg-bye">Leg Bye</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(extrasType === 'wide' || extrasType === 'no-ball') && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="extraRuns" className="text-right">Extra Runs</Label>
                            <Input
                                id="extraRuns"
                                type="number"
                                value={extrasRuns}
                                onChange={(e) => setExtrasRuns(parseInt(e.target.value) || 0)}
                                className="col-span-3"
                            />
                        </div>
                    )}

                    <div className="flex items-center space-x-2 px-1">
                        <Switch
                            id="is-wicket"
                            checked={isWicket}
                            onCheckedChange={setIsWicket}
                        />
                        <Label htmlFor="is-wicket">Is Wicket</Label>
                    </div>

                    {isWicket && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <Select
                                value={wicketType || ""}
                                onValueChange={(v) => setWicketType(v as WicketType)}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Wicket Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bowled">Bowled</SelectItem>
                                    <SelectItem value="caught">Caught</SelectItem>
                                    <SelectItem value="lbw">LBW</SelectItem>
                                    <SelectItem value="runout">Run Out</SelectItem>
                                    <SelectItem value="stumped">Stumped</SelectItem>
                                    <SelectItem value="hitwicket">Hit Wicket</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason for Correction</Label>
                        <Textarea
                            id="reason"
                            placeholder="Explain why this change is being made..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!reason.trim()}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditBallDialog;

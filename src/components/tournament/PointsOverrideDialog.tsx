import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDB, PointAdjustment } from '@/services/mockDatabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

interface PointsOverrideDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tournamentId: string;
    teamId: string;
    teamName: string;
    onSuccess?: () => void;
}

const PointsOverrideDialog: React.FC<PointsOverrideDialogProps> = ({
    open,
    onOpenChange,
    tournamentId,
    teamId,
    teamName,
    onSuccess
}) => {
    const { user } = useAuth();
    const [pointsChange, setPointsChange] = useState<string>('');
    const [category, setCategory] = useState<'slow_over_rate' | 'code_of_conduct' | 'other'>('slow_over_rate');
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!user) {
            toast.error('You must be logged in to adjust points');
            return;
        }

        if (!pointsChange || pointsChange === '0') {
            toast.error('Please enter a non-zero point adjustment');
            return;
        }

        if (!reason.trim()) {
            toast.error('Please provide a reason for this adjustment');
            return;
        }

        const adjustment: Omit<PointAdjustment, 'id' | 'adjusted_at'> = {
            tournament_id: tournamentId,
            team_id: teamId,
            points_change: parseInt(pointsChange),
            reason: reason.trim(),
            category,
            adjusted_by: user.id
        };

        mockDB.addPointAdjustment(adjustment);

        const changeType = parseInt(pointsChange) > 0 ? 'added' : 'deducted';
        toast.success(`${Math.abs(parseInt(pointsChange))} point(s) ${changeType} for ${teamName}`);

        // Reset form
        setPointsChange('');
        setReason('');
        setCategory('slow_over_rate');

        onOpenChange(false);
        onSuccess?.();
    };

    const pointsNum = parseInt(pointsChange) || 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Adjust Points: {teamName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Points Change Input */}
                    <div className="space-y-2">
                        <Label htmlFor="points">Point Adjustment</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="points"
                                type="number"
                                placeholder="e.g., -2 or +1"
                                value={pointsChange}
                                onChange={(e) => setPointsChange(e.target.value)}
                                className="flex-1"
                            />
                            {pointsNum !== 0 && (
                                <div className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${pointsNum > 0
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                                    }`}>
                                    {pointsNum > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    <span className="font-bold">{Math.abs(pointsNum)}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Use negative numbers for deductions, positive for additions</p>
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                            <SelectTrigger id="category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="slow_over_rate">Slow Over Rate</SelectItem>
                                <SelectItem value="code_of_conduct">Code of Conduct Violation</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason (Required)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Provide a detailed explanation for this adjustment..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {/* Audit Preview */}
                    <div className="bg-muted/50 rounded-lg p-3 border border-border">
                        <p className="text-xs font-bold text-muted-foreground mb-1">Audit Trail Preview</p>
                        <p className="text-xs text-foreground">
                            <span className="font-semibold">{user?.id || 'Unknown'}</span> will adjust points on{' '}
                            <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!pointsChange || !reason.trim()}>
                        Apply Adjustment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PointsOverrideDialog;

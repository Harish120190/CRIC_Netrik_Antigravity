import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, Ban, Flag, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mockDB } from '@/services/mockDatabase';
import type { ProxyFlagSeverity } from '@/types/proxyPrevention';

interface PlayerActionPanelProps {
    userId: string;
    tournamentId: string;
    organizerId: string;
    currentStatus?: string;
    onStatusChange?: () => void;
}

const PlayerActionPanel: React.FC<PlayerActionPanelProps> = ({
    userId,
    tournamentId,
    organizerId,
    currentStatus,
    onStatusChange
}) => {
    const [approveDialog, setApproveDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [banDialog, setBanDialog] = useState(false);
    const [flagDialog, setFlagDialog] = useState(false);

    const [rejectReason, setRejectReason] = useState('');
    const [banReason, setBanReason] = useState('');
    const [banDuration, setBanDuration] = useState<'permanent' | 'temporary'>('temporary');
    const [banDays, setBanDays] = useState('30');
    const [banNotes, setBanNotes] = useState('');

    const [flagSeverity, setFlagSeverity] = useState<ProxyFlagSeverity>('medium');
    const [flagReason, setFlagReason] = useState('');
    const [flagDescription, setFlagDescription] = useState('');

    const handleApprove = () => {
        mockDB.updatePlayerStatus(userId, tournamentId, 'approved', organizerId);
        toast({
            title: 'Player Approved',
            description: 'Player has been approved to participate in this tournament.'
        });
        setApproveDialog(false);
        onStatusChange?.();
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast({
                title: 'Error',
                description: 'Please provide a reason for rejection.',
                variant: 'destructive'
            });
            return;
        }

        mockDB.updatePlayerStatus(userId, tournamentId, 'rejected', organizerId, rejectReason);
        toast({
            title: 'Player Rejected',
            description: 'Player has been rejected from this tournament.'
        });
        setRejectDialog(false);
        setRejectReason('');
        onStatusChange?.();
    };

    const handleBan = () => {
        if (!banReason.trim()) {
            toast({
                title: 'Error',
                description: 'Please provide a reason for the ban.',
                variant: 'destructive'
            });
            return;
        }

        const isPermanent = banDuration === 'permanent';
        const expiresAt = isPermanent ? undefined : new Date(
            Date.now() + parseInt(banDays) * 24 * 60 * 60 * 1000
        ).toISOString();

        mockDB.banPlayer(userId, organizerId, banReason, isPermanent, expiresAt, tournamentId, banNotes);
        mockDB.updatePlayerStatus(userId, tournamentId, 'banned', organizerId, banReason);

        toast({
            title: 'Player Banned',
            description: `Player has been ${isPermanent ? 'permanently' : 'temporarily'} banned.`,
            variant: 'destructive'
        });

        setBanDialog(false);
        setBanReason('');
        setBanNotes('');
        onStatusChange?.();
    };

    const handleAddFlag = () => {
        if (!flagReason.trim()) {
            toast({
                title: 'Error',
                description: 'Please provide a reason for the flag.',
                variant: 'destructive'
            });
            return;
        }

        mockDB.addProxyFlag(userId, flagSeverity, flagReason, organizerId, tournamentId, {
            type: 'other',
            description: flagDescription
        });

        toast({
            title: 'Proxy Flag Added',
            description: 'Proxy flag has been added to player record.'
        });

        setFlagDialog(false);
        setFlagReason('');
        setFlagDescription('');
        onStatusChange?.();
    };

    return (
        <div className="space-y-2">
            {currentStatus !== 'approved' && (
                <Button
                    onClick={() => setApproveDialog(true)}
                    className="w-full"
                    variant="default"
                >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Player
                </Button>
            )}

            {currentStatus !== 'rejected' && (
                <Button
                    onClick={() => setRejectDialog(true)}
                    className="w-full"
                    variant="outline"
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Player
                </Button>
            )}

            <Button
                onClick={() => setFlagDialog(true)}
                className="w-full"
                variant="outline"
            >
                <Flag className="w-4 h-4 mr-2" />
                Add Proxy Flag
            </Button>

            <Button
                onClick={() => setBanDialog(true)}
                className="w-full"
                variant="destructive"
            >
                <Ban className="w-4 h-4 mr-2" />
                Ban Player
            </Button>

            {/* Approve Dialog */}
            <Dialog open={approveDialog} onOpenChange={setApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Player</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this player for tournament participation?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setApproveDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleApprove}>
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Player</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this player.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">Reason for Rejection</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Enter reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Reject Player
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Ban Dialog */}
            <Dialog open={banDialog} onOpenChange={setBanDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Ban Player
                        </DialogTitle>
                        <DialogDescription>
                            This is a serious action. Please provide detailed information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="ban-duration">Ban Duration</Label>
                            <Select value={banDuration} onValueChange={(v: any) => setBanDuration(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="temporary">Temporary</SelectItem>
                                    <SelectItem value="permanent">Permanent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {banDuration === 'temporary' && (
                            <div className="space-y-2">
                                <Label htmlFor="ban-days">Duration (days)</Label>
                                <Input
                                    id="ban-days"
                                    type="number"
                                    value={banDays}
                                    onChange={(e) => setBanDays(e.target.value)}
                                    min="1"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="ban-reason">Reason for Ban *</Label>
                            <Textarea
                                id="ban-reason"
                                placeholder="Enter detailed reason..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ban-notes">Additional Notes</Label>
                            <Textarea
                                id="ban-notes"
                                placeholder="Any additional information..."
                                value={banNotes}
                                onChange={(e) => setBanNotes(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBanDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleBan}>
                            {banDuration === 'permanent' ? 'Permanently Ban' : 'Ban Player'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Flag Dialog */}
            <Dialog open={flagDialog} onOpenChange={setFlagDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Proxy Flag</DialogTitle>
                        <DialogDescription>
                            Report suspicious activity or proxy playing behavior.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="flag-severity">Severity</Label>
                            <Select value={flagSeverity} onValueChange={(v: any) => setFlagSeverity(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="flag-reason">Reason *</Label>
                            <Input
                                id="flag-reason"
                                placeholder="Brief reason..."
                                value={flagReason}
                                onChange={(e) => setFlagReason(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="flag-description">Description</Label>
                            <Textarea
                                id="flag-description"
                                placeholder="Detailed description of the incident..."
                                value={flagDescription}
                                onChange={(e) => setFlagDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFlagDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddFlag}>
                            Add Flag
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PlayerActionPanel;

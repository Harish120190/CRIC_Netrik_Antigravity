import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface TournamentShareDialogProps {
    tournamentId: string;
    tournamentName: string;
    trigger?: React.ReactNode;
}

export function TournamentShareDialog({
    tournamentId,
    tournamentName,
    trigger,
}: TournamentShareDialogProps) {
    const [open, setOpen] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [shareUrl, setShareUrl] = useState<string>('');

    useEffect(() => {
        if (open) {
            generateShareUrl();
        }
    }, [open, tournamentId]);

    const generateShareUrl = async () => {
        // Generate shareable URL with registration parameter
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/tournaments/${tournamentId}?register=true`;
        setShareUrl(url);

        // Generate QR code
        try {
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            });
            setQrCodeUrl(qrDataUrl);
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            toast.error('Failed to generate QR code');
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    };

    const handleDownloadQR = () => {
        const link = document.createElement('a');
        link.download = `${tournamentName.replace(/\s+/g, '_')}_QR.png`;
        link.href = qrCodeUrl;
        link.click();
        toast.success('QR code downloaded!');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share Tournament
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share {tournamentName}</DialogTitle>
                    <DialogDescription>
                        Share this tournament with teams via QR code or link
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* QR Code */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="bg-white p-4 rounded-lg border-2 border-border">
                            {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="Tournament QR Code" className="w-64 h-64" />
                            ) : (
                                <div className="w-64 h-64 flex items-center justify-center">
                                    <QrCode className="w-16 h-16 text-muted-foreground animate-pulse" />
                                </div>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleDownloadQR}
                            disabled={!qrCodeUrl}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download QR Code
                        </Button>
                    </div>

                    {/* Shareable Link */}
                    <div className="space-y-2">
                        <Label>Shareable Link</Label>
                        <div className="flex gap-2">
                            <Input
                                value={shareUrl}
                                readOnly
                                className="flex-1 font-mono text-xs"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleCopyLink}
                                disabled={!shareUrl}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Teams can scan the QR code or use this link to register for the tournament
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

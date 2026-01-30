import React, { useState } from 'react';
import { Team } from '@/types/cricket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PaintBucket, Shirt, Image as ImageIcon, Check } from 'lucide-react';
import { mockDB } from '@/services/mockDatabase';

interface TeamBrandingSettingsProps {
    team: Team;
    onUpdate: (updatedTeam: Team) => void;
}

const TeamBrandingSettings: React.FC<TeamBrandingSettingsProps> = ({ team, onUpdate }) => {
    const [open, setOpen] = useState(false);
    const [logo, setLogo] = useState(team.logo || '');
    const [jersey, setJersey] = useState(team.jersey || '');
    const [themeColor, setThemeColor] = useState(team.themeColor || '#3b82f6');
    const [secondaryColor, setSecondaryColor] = useState(team.secondaryColor || '#ffffff');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Direct mock update since useTeamManagement might mock differently
            // Ideally we pass this via a hook prop
            const updated = mockDB.updateTeam(team.id, {
                logo,
                jersey,
                themeColor,
                secondaryColor
            });

            if (updated) {
                toast.success('Team branding updated!');
                onUpdate(updated);
                setOpen(false);
            } else {
                toast.error('Failed to update team');
            }
        } catch (e) {
            toast.error('Error updating branding');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <PaintBucket className="w-4 h-4" />
                    Customize Appearance
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Team Branding</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Primary Theme</Label>
                            <div className="flex gap-2">
                                <div className="w-10 h-10 rounded border" style={{ backgroundColor: themeColor }}></div>
                                <Input
                                    type="color"
                                    value={themeColor}
                                    onChange={(e) => setThemeColor(e.target.value)}
                                    className="w-full h-10 p-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Secondary Color</Label>
                            <div className="flex gap-2">
                                <div className="w-10 h-10 rounded border" style={{ backgroundColor: secondaryColor }}></div>
                                <Input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="w-full h-10 p-1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assets */}
                    <div className="space-y-3">
                        <Label>Team Logo URL</Label>
                        <div className="flex gap-2">
                            <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="text-muted-foreground w-6 h-6" />}
                            </div>
                            <Input
                                placeholder="https://example.com/logo.png"
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Paste an image URL for the team logo.</p>
                    </div>

                    <div className="space-y-3">
                        <Label>Jersey Image URL</Label>
                        <div className="flex gap-2">
                            <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                                {jersey ? <img src={jersey} alt="Jersey" className="w-full h-full object-cover" /> : <Shirt className="text-muted-foreground w-6 h-6" />}
                            </div>
                            <Input
                                placeholder="https://example.com/jersey.png"
                                value={jersey}
                                onChange={(e) => setJersey(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TeamBrandingSettings;

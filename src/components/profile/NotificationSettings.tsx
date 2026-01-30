import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Zap, Trophy, User, Users, Settings2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const NotificationSettings: React.FC = () => {
    const { user, updateProfile } = useAuth();

    const prefs = user?.notificationPreferences || {
        matchStart: true,
        wickets: true,
        milestones: true,
        results: true,
        teams: [],
        players: [],
        tournaments: []
    };

    const handleToggle = async (key: keyof typeof prefs) => {
        if (typeof prefs[key] !== 'boolean') return;

        try {
            const newPrefs = { ...prefs, [key]: !prefs[key] };
            await updateProfile({ notificationPreferences: newPrefs });
            toast({
                title: "Settings updated",
                description: "Your notification preferences have been saved."
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update notification settings.",
                variant: "destructive"
            });
        }
    };

    return (
        <Card className="mb-4 overflow-hidden border-none shadow-elevated">
            <CardHeader className="pb-3 bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Bell className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold">Notification Preferences</CardTitle>
                        <CardDescription className="text-xs">Customize your real-time match alerts</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {/* Match Start */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Match Start
                        </Label>
                        <p className="text-[10px] text-muted-foreground">Get notified when followings start their match</p>
                    </div>
                    <Switch
                        checked={prefs.matchStart}
                        onCheckedChange={() => handleToggle('matchStart')}
                    />
                </div>

                <Separator className="opacity-50" />

                {/* Wickets */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4 text-red-500" />
                            Wickets
                        </Label>
                        <p className="text-[10px] text-muted-foreground">Instant alerts for every wicket in live matches</p>
                    </div>
                    <Switch
                        checked={prefs.wickets}
                        onCheckedChange={() => handleToggle('wickets')}
                    />
                </div>

                <Separator className="opacity-50" />

                {/* Milestones */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            Milestones
                        </Label>
                        <p className="text-[10px] text-muted-foreground">50s, 100s, and hat-tricks alerts</p>
                    </div>
                    <Switch
                        checked={prefs.milestones}
                        onCheckedChange={() => handleToggle('milestones')}
                    />
                </div>

                <Separator className="opacity-50" />

                {/* Match Result */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            Match Results
                        </Label>
                        <p className="text-[10px] text-muted-foreground">Final scores and winner declarations</p>
                    </div>
                    <Switch
                        checked={prefs.results}
                        onCheckedChange={() => handleToggle('results')}
                    />
                </div>

                <Separator className="opacity-50" />

                <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full gap-2 text-[11px] h-8">
                        <Settings2 className="h-3 w-3" />
                        Manage Subscriptions (Teams/Players)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default NotificationSettings;

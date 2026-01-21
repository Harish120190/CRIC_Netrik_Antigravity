import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
// import { useQuery } from '@tanstack/react-query'; // No longer needed
// import { supabase } from '@/integrations/supabase/client'; // No longer needed
import { mockDB } from '@/services/mockDatabase'; // Import MockDB
import { downloadCSV } from '@/utils/csvExport'; // Import CSV Utility
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Save, CheckCircle2, Trophy, Users, Globe } from 'lucide-react';

const STEPS = [
    { id: 'basics', title: 'Match Info', icon: Trophy },
    { id: 'teams', title: 'Teams', icon: Users },
    { id: 'logistics', title: 'Logistics', icon: Calendar },
    { id: 'review', title: 'Review', icon: Save },
];

export default function ScheduleMatchPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form State
    const [matchData, setMatchData] = useState({
        match_type: 'friendly',
        ball_type: 'tennis',
        overs: 20,
        team1_id: '',
        team1_name: '',
        team2_id: '',
        team2_name: '',
        match_date: '',
        match_time: '',
        ground_name: '',
        city: '',
        winning_prize: '',
        match_fee: '',
        toss_delayed: false
    });

    const [teams, setTeams] = useState(mockDB.getTeams());

    // We don't need useQuery for mock data, just load it once or rely on state if we had async
    // In a real app with local storage, this might be a useEffect, but getTeams is sync here.
    const isLoadingTeams = false;

    // Helper to update fields
    const updateField = (field: keyof typeof matchData, value: any) => {
        setMatchData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(c => c - 1);
        else navigate(-1);
    };

    const handleSubmit = async () => {
        if (!matchData.team1_name || !matchData.team2_name || !matchData.match_date) {
            toast.error("Please fill in all required fields (Teams, Date)");
            return;
        }

        setLoading(true);
        try {
            // Mock backend call
            const newMatch = mockDB.createMatch({
                item_type: 'match',
                match_type: matchData.match_type,
                ball_type: matchData.ball_type,
                total_overs: matchData.overs,
                overs: matchData.overs, // keeping both for compat
                team1_name: matchData.team1_name,
                team2_name: matchData.team2_name,
                team1_id: matchData.team1_id,
                team2_id: matchData.team2_id,
                match_date: matchData.match_date,
                match_time: matchData.match_time,
                ground_name: matchData.ground_name,
                city: matchData.city,
                winning_prize: matchData.winning_prize,
                match_fee: matchData.match_fee,
                status: 'scheduled',
                umpire_name: 'TBD', // Defaults
                scorer_name: 'TBD'
            } as any); // using any to bypass strict type check for now vs interface mismatch

            toast.success("Match Scheduled Successfully (Offline Mode)!");
            navigate(`/match/${newMatch.id}`);
        } catch (error: any) {
            toast.error("Error scheduling match: " + error.message);
        } finally {
            setLoading(false);
        }
    };



    const selectTeam = (slot: 'team1' | 'team2', teamId: string) => {
        const team = teams?.find(t => t.id === teamId);
        if (team) {
            updateField(`${slot}_id`, team.id);
            updateField(`${slot}_name`, team.name);
        } else if (teamId === 'custom_team') {
            updateField(`${slot}_id`, '');
            updateField(`${slot}_name`, '');
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0: // Basics
                return (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Match Type</Label>
                            <Select value={matchData.match_type} onValueChange={(v) => updateField('match_type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="friendly">Friendly</SelectItem>
                                    <SelectItem value="league">League</SelectItem>
                                    <SelectItem value="tournament">Tournament</SelectItem>
                                    <SelectItem value="knockout">Knockout</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Ball Type</Label>
                            <Select value={matchData.ball_type} onValueChange={(v) => updateField('ball_type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tennis">Tennis Ball</SelectItem>
                                    <SelectItem value="leather">Leather Ball</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Overs</Label>
                            <Input type="number" value={matchData.overs} onChange={(e) => updateField('overs', parseInt(e.target.value))} />
                        </div>
                    </div>
                );

            case 1: // Teams
                return (
                    <div className="space-y-6">
                        <div className="space-y-4 border p-4 rounded-lg">
                            <Label className="text-lg">Team A (Host)</Label>
                            <Select
                                value={matchData.team1_id || 'custom_team'}
                                onValueChange={(v) => selectTeam('team1', v)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Registered Team" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="custom_team">Custom Team (Enter Below)</SelectItem>
                                    {teams?.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(matchData.team1_id === '' || matchData.team1_id === 'custom_team') && (
                                <Input
                                    placeholder="Or Enter Team Name"
                                    value={matchData.team1_name}
                                    onChange={(e) => {
                                        updateField('team1_id', '');
                                        updateField('team1_name', e.target.value);
                                    }}
                                />
                            )}
                        </div>

                        <div className="space-y-4 border p-4 rounded-lg">
                            <Label className="text-lg">Team B (Visitor)</Label>
                            <Select
                                value={matchData.team2_id || 'custom_team'}
                                onValueChange={(v) => selectTeam('team2', v)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select Registered Team" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="custom_team">Custom Team (Enter Below)</SelectItem>
                                    {teams?.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(matchData.team2_id === '' || matchData.team2_id === 'custom_team') && (
                                <Input
                                    placeholder="Or Enter Team Name"
                                    value={matchData.team2_name}
                                    onChange={(e) => {
                                        updateField('team2_id', '');
                                        updateField('team2_name', e.target.value);
                                    }}
                                />
                            )}
                        </div>
                    </div>
                );

            case 2: // Logistics
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={matchData.match_date} onChange={(e) => updateField('match_date', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input type="time" value={matchData.match_time} onChange={(e) => updateField('match_time', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Ground / Venue</Label>
                            <Input placeholder="Stadium Name" value={matchData.ground_name} onChange={(e) => updateField('ground_name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input placeholder="City" value={matchData.city} onChange={(e) => updateField('city', e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Winning Prize (Optional)</Label>
                                <Input placeholder="e.g. Trophy + 5000" value={matchData.winning_prize} onChange={(e) => updateField('winning_prize', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Match Fee (Optional)</Label>
                                <Input placeholder="e.g. 500 per team" value={matchData.match_fee} onChange={(e) => updateField('match_fee', e.target.value)} />
                            </div>
                        </div>
                    </div>
                );

            case 3: // Review
                return (
                    <div className="space-y-4 text-sm">
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Match</span>
                                <span className="font-medium capitalize">{matchData.match_type} ({matchData.overs} ovs)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Teams</span>
                                <span className="font-medium">{matchData.team1_name} vs {matchData.team2_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">When</span>
                                <span className="font-medium">{matchData.match_date} @ {matchData.match_time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Where</span>
                                <span className="font-medium">{matchData.ground_name}, {matchData.city}</span>
                            </div>
                        </div>
                        <p className="text-center text-muted-foreground">
                            Click Publish to schedule this match and notify teams.
                        </p>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-bold">Schedule Match</h1>
            </header>

            <div className="px-4 py-4 bg-muted/30">
                <div className="flex justify-between relative">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const active = idx <= currentStep;
                        return (
                            <div key={step.id} className="flex flex-col items-center z-10 relative">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs mt-1 ${active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{step.title}</span>
                            </div>
                        )
                    })}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-muted -z-0">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} />
                    </div>
                </div>
            </div>

            <main className="flex-1 p-4 max-w-lg mx-auto w-full">
                <Card>
                    <CardContent className="pt-6">
                        {renderStep()}
                    </CardContent>
                </Card>
            </main>

            <footer className="p-4 border-t bg-background">
                <div className="max-w-lg mx-auto flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleBack} disabled={loading}>Back</Button>
                    {currentStep === STEPS.length - 1 ? (
                        <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Publishing...' : 'Publish Match'}
                        </Button>
                    ) : (
                        <Button className="flex-1" onClick={handleNext}>Next</Button>
                    )}
                </div>
            </footer>
        </div>
    );
}

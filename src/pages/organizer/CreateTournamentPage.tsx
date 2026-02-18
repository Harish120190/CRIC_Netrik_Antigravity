import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { mockDB } from '@/services/mockDatabase';
import { Tournament, PointsConfig } from '@/types/cricket';
import { toast } from 'sonner';
import { Calendar, Trophy, Settings, Check, Table, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
    { id: 1, title: 'Details', icon: Trophy },
    { id: 2, title: 'Structure', icon: Users },
    { id: 3, title: 'Points', icon: Table },
    { id: 4, title: 'Review', icon: Check },
];

const defaultPointsConfig: PointsConfig = {
    win: 2,
    tie: 1,
    noResult: 1,
    loss: 0,
    bonus: {
        points: 1,
        runRateThreshold: 1.25
    }
};

const CreateTournamentPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);

    // extended state for new fields
    const [basicInfo, setBasicInfo] = useState({
        name: '',
        city: '',
        startDate: '',
        endDate: '',
        prizePool: '',
        entryFee: ''
    });

    const [structure, setStructure] = useState({
        type: 'league' as Tournament['type'],
        ballType: 'tennis' as Tournament['ballType'],
        format: 'T20' as Tournament['format'],
        overs: 20,
        teamCount: 8,
        groupCount: 2, // For league+knockout
        qualifyCount: 4 // Teams qualifying for knockout
    });

    const [pointsConfig, setPointsConfig] = useState<PointsConfig>(defaultPointsConfig);

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        try {
            if (!basicInfo.name || !basicInfo.city || !basicInfo.startDate) {
                toast.error("Please fill in all required fields in Details");
                return;
            }

            // Construct the strictly typed Tournament object
            const newTournament: Omit<Tournament, 'id' | 'status'> = {
                name: basicInfo.name,
                city: basicInfo.city,
                startDate: new Date(basicInfo.startDate),
                endDate: basicInfo.endDate ? new Date(basicInfo.endDate) : undefined,
                type: structure.type,
                format: structure.format,
                overs: structure.overs,
                ballType: structure.ballType,
                teams: [], // Empty initially
                matches: [],
                stages: [], // Will be populated by backend/service later based on structure
                pointsConfig: pointsConfig, // New field 
                prizePool: basicInfo.prizePool,
                entryFee: Number(basicInfo.entryFee) || 0,
                // Add default stage configuration based on type? 
                // For now we just save the config, scheduling comes later.
            };

            await mockDB.createTournament(newTournament as any);
            toast.success("Tournament Created Successfully!");
            navigate('/organizer');
        } catch (error) {
            console.error(error);
            toast.error("Failed to create tournament");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            <Header title="Create Tournament" />

            <main className="px-4 py-6 max-w-2xl mx-auto">
                {/* Stepper */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-secondary -z-10" />
                    {steps.map((step) => {
                        const Icon = step.icon;
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center bg-background px-2">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                        isActive || isCompleted
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "bg-card border-muted-foreground text-muted-foreground"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={cn(
                                    "text-[10px] mt-1 font-medium bg-background px-1",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <Card className="mb-6 shadow-md border-border/50">
                    <CardContent className="pt-6 space-y-6">

                        {/* STEP 1: DETAILS */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Tournament Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="Ex: Premier League 2024"
                                        value={basicInfo.name}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City / Venue <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="Ex: Mumbai"
                                        value={basicInfo.city}
                                        onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                                        className="h-11"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="date"
                                            value={basicInfo.startDate}
                                            onChange={(e) => setBasicInfo({ ...basicInfo, startDate: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={basicInfo.endDate}
                                            onChange={(e) => setBasicInfo({ ...basicInfo, endDate: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Prize Pool</Label>
                                        <Input
                                            placeholder="Ex: ₹50,000"
                                            value={basicInfo.prizePool}
                                            onChange={(e) => setBasicInfo({ ...basicInfo, prizePool: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Entry Fee</Label>
                                        <Input
                                            type="number"
                                            placeholder="Ex: ₹1,000"
                                            value={basicInfo.entryFee}
                                            onChange={(e) => setBasicInfo({ ...basicInfo, entryFee: e.target.value })}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: STRUCTURE */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Tournament Structure</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div
                                            className={cn("border rounded-lg p-4 cursor-pointer transition-all hover:border-primary", structure.type === 'league' && "border-primary bg-primary/5 ring-1 ring-primary")}
                                            onClick={() => setStructure({ ...structure, type: 'league' })}
                                        >
                                            <div className="font-bold">League Only</div>
                                            <div className="text-xs text-muted-foreground">Round robin table. Top team wins.</div>
                                        </div>
                                        <div
                                            className={cn("border rounded-lg p-4 cursor-pointer transition-all hover:border-primary", structure.type === 'knockout' && "border-primary bg-primary/5 ring-1 ring-primary")}
                                            onClick={() => setStructure({ ...structure, type: 'knockout' })}
                                        >
                                            <div className="font-bold">Knockout Only</div>
                                            <div className="text-xs text-muted-foreground">Winner advances, loser eliminated.</div>
                                        </div>
                                        <div
                                            className={cn("border rounded-lg p-4 cursor-pointer transition-all hover:border-primary", structure.type === 'hybrid' && "border-primary bg-primary/5 ring-1 ring-primary")}
                                            onClick={() => setStructure({ ...structure, type: 'hybrid' })}
                                        >
                                            <div className="font-bold">Hybrid (League + Knockout)</div>
                                            <div className="text-xs text-muted-foreground">Groups stage followed by Semis/Finals.</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Match Format</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Format</Label>
                                            <Select value={structure.format} onValueChange={(v: any) => setStructure({ ...structure, format: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="T10">T10 (10 Overs)</SelectItem>
                                                    <SelectItem value="T20">T20 (20 Overs)</SelectItem>
                                                    <SelectItem value="ODI">ODI (50 Overs)</SelectItem>
                                                    <SelectItem value="Custom">Custom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Ball Type</Label>
                                            <Select value={structure.ballType} onValueChange={(v: any) => setStructure({ ...structure, ballType: v })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tennis">Tennis Ball</SelectItem>
                                                    <SelectItem value="leather">Leather Ball</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base font-semibold">Teams & Groups</Label>
                                        <span className="text-xs bg-muted px-2 py-1 rounded">Total Teams: {structure.teamCount}</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Number of Teams</Label>
                                            <Input
                                                type="number"
                                                min={2}
                                                max={64}
                                                value={structure.teamCount}
                                                onChange={(e) => setStructure({ ...structure, teamCount: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>

                                        {(structure.type === 'league' || structure.type === 'hybrid') && (
                                            <div className="space-y-2">
                                                <Label className="text-xs text-muted-foreground">Number of Groups</Label>
                                                <Select
                                                    value={String(structure.groupCount)}
                                                    onValueChange={(v) => setStructure({ ...structure, groupCount: parseInt(v) })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 Group (Round Robin)</SelectItem>
                                                        <SelectItem value="2">2 Groups</SelectItem>
                                                        <SelectItem value="4">4 Groups</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: POINTS & RULES */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                                    <h3 className="font-semibold text-blue-900 mb-1">Points System</h3>
                                    <p className="text-xs text-blue-700">Configure how many points are awarded per result.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Win</Label>
                                        <Input
                                            type="number"
                                            value={pointsConfig.win}
                                            onChange={(e) => setPointsConfig({ ...pointsConfig, win: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tie</Label>
                                        <Input
                                            type="number"
                                            value={pointsConfig.tie}
                                            onChange={(e) => setPointsConfig({ ...pointsConfig, tie: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>No Result</Label>
                                        <Input
                                            type="number"
                                            value={pointsConfig.noResult}
                                            onChange={(e) => setPointsConfig({ ...pointsConfig, noResult: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Loss</Label>
                                        <Input
                                            type="number"
                                            value={pointsConfig.loss}
                                            onChange={(e) => setPointsConfig({ ...pointsConfig, loss: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-border my-2" />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex flex-col">
                                            <span>Bonus Points</span>
                                            <span className="font-normal text-xs text-muted-foreground">Award extra points for high run rate wins</span>
                                        </Label>
                                        <Switch
                                            checked={!!pointsConfig.bonus}
                                            onCheckedChange={(checked) => setPointsConfig({
                                                ...pointsConfig,
                                                bonus: checked ? { points: 1, runRateThreshold: 1.25 } : undefined
                                            })}
                                        />
                                    </div>

                                    {pointsConfig.bonus && (
                                        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Bonus Points</Label>
                                                    <Input
                                                        type="number"
                                                        value={pointsConfig.bonus.points}
                                                        onChange={(e) => setPointsConfig({
                                                            ...pointsConfig,
                                                            bonus: { ...pointsConfig.bonus!, points: Number(e.target.value) }
                                                        })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs">Run Rate Threshold</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={pointsConfig.bonus.runRateThreshold}
                                                        onChange={(e) => setPointsConfig({
                                                            ...pointsConfig,
                                                            bonus: { ...pointsConfig.bonus!, runRateThreshold: Number(e.target.value) }
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: REVIEW */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-muted/30 p-4 rounded-lg space-y-4 border border-border">
                                    <div>
                                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Tournament Details</div>
                                        <div className="font-bold text-lg">{basicInfo.name}</div>
                                        <div className="text-sm text-foreground/80">{basicInfo.city} • {basicInfo.startDate}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-muted-foreground">Type</div>
                                            <div className="font-medium capitalize">{structure.type}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Format</div>
                                            <div className="font-medium">{structure.format} ({structure.ballType})</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Teams</div>
                                            <div className="font-medium">{structure.teamCount} Teams</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-muted-foreground">Structure</div>
                                            <div className="font-medium">{structure.groupCount} Group(s)</div>
                                        </div>
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Points Config</div>
                                        <div className="flex gap-4 text-sm">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-green-600">+{pointsConfig.win}</span>
                                                <span className="text-xs pt-1">Win</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-orange-600">+{pointsConfig.tie}</span>
                                                <span className="text-xs pt-1">Tie</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-slate-600">+{pointsConfig.noResult}</span>
                                                <span className="text-xs pt-1">N/R</span>
                                            </div>
                                            {pointsConfig.bonus && (
                                                <div className="flex flex-col items-center">
                                                    <span className="font-bold text-purple-600">+{pointsConfig.bonus.points}</span>
                                                    <span className="text-xs pt-1">Bonus</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-xs text-center text-muted-foreground">
                                    By clicking Create, you acknowledge that you cannot change the Tournament Structure type once created.
                                </p>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50 flex justify-center">
                    <div className="w-full max-w-2xl flex gap-3">
                        {currentStep > 1 && (
                            <Button variant="outline" className="flex-1 max-w-[120px]" onClick={handleBack}>
                                Back
                            </Button>
                        )}
                        {currentStep < 4 ? (
                            <Button className="flex-1" onClick={handleNext}>
                                Next Step
                            </Button>
                        ) : (
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleSubmit}>
                                Create Tournament
                            </Button>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default CreateTournamentPage;

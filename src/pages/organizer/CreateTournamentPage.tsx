import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { mockDB, Tournament } from '@/services/mockDatabase';
import { toast } from 'sonner';
import { Calendar, Trophy, Settings, Check } from 'lucide-react';

const steps = [
    { id: 1, title: 'Details', icon: Trophy },
    { id: 2, title: 'Format', icon: Settings },
    { id: 3, title: 'Review', icon: Check },
];

const CreateTournamentPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Tournament>>({
        name: '',
        city: '',
        startDate: '',
        endDate: '',
        ballType: 'tennis',
        matchFormat: 20,
        matchType: 'league',
    });

    const handleNext = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        try {
            if (!formData.name || !formData.city || !formData.startDate) {
                toast.error("Please fill in all required fields");
                return;
            }

            await mockDB.createTournament(formData as any);
            toast.success("Tournament Created Successfully!");
            navigate('/organizer');
        } catch (error) {
            console.error(error);
            toast.error("Failed to create tournament");
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="Create Tournament" />

            <main className="px-4 py-6 max-w-lg mx-auto">
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
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive || isCompleted
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'bg-card border-muted-foreground text-muted-foreground'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <Card className="mb-6">
                    <CardContent className="pt-6 space-y-4">

                        {/* STEP 1: DETAILS */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Tournament Name</Label>
                                    <Input
                                        placeholder="Ex: Premier League 2024"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        placeholder="Ex: Mumbai"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: FORMAT */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-2">
                                    <Label>Ball Type</Label>
                                    <Select
                                        value={formData.ballType}
                                        onValueChange={(v) => setFormData({ ...formData, ballType: v as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tennis">Tennis Ball</SelectItem>
                                            <SelectItem value="leather">Leather Ball</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Match Format (Overs)</Label>
                                    <Select
                                        value={String(formData.matchFormat)}
                                        onValueChange={(v) => setFormData({ ...formData, matchFormat: Number(v) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">T10 (10 Overs)</SelectItem>
                                            <SelectItem value="20">T20 (20 Overs)</SelectItem>
                                            <SelectItem value="50">ODI (50 Overs)</SelectItem>
                                            <SelectItem value="100">Test Match</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tournament Type</Label>
                                    <Select
                                        value={formData.matchType}
                                        onValueChange={(v) => setFormData({ ...formData, matchType: v as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="league">League Only</SelectItem>
                                            <SelectItem value="knockout">Knockout Only</SelectItem>
                                            <SelectItem value="hybrid">League + Knockout</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: REVIEW */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium text-right">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Location:</span>
                                        <span className="font-medium">{formData.city}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Dates:</span>
                                        <span className="font-medium">{formData.startDate} - {formData.endDate}</span>
                                    </div>
                                    <div className="h-px bg-border my-2" />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Format:</span>
                                        <span className="font-medium capitalize">{formData.ballType} • {formData.matchFormat} Overs</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Type:</span>
                                        <span className="font-medium capitalize">{formData.matchType}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-center text-muted-foreground">
                                    By clicking Create, you agree to the organizer terms and conditions.
                                </p>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex gap-3">
                    {currentStep > 1 && (
                        <Button variant="outline" className="flex-1" onClick={handleBack}>
                            Back
                        </Button>
                    )}
                    {currentStep < 3 ? (
                        <Button className="flex-1" onClick={handleNext}>
                            Next Step
                        </Button>
                    ) : (
                        <Button className="flex-1" onClick={handleSubmit}>
                            Create Tournament
                        </Button>
                    )}
                </div>

            </main>
        </div>
    );
};

export default CreateTournamentPage;

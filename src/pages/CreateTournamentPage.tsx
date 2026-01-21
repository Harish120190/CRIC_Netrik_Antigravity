import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WizardProgress from '@/components/wizard/WizardProgress';
import TournamentBasicInfo from '@/components/tournament/TournamentBasicInfo';
import TournamentFormatConfig from '@/components/tournament/TournamentFormatConfig';
import TournamentTeamRegistration from '@/components/tournament/TournamentTeamRegistration';
import TournamentReview from '@/components/tournament/TournamentReview';
import { useTournaments } from '@/hooks/useTournaments';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['Basic Info', 'Format', 'Teams', 'Review'];

export interface TournamentFormData {
  name: string;
  venue: string;
  startDate: string;
  endDate: string;
  format: 'T20' | 'ODI' | 'T10' | 'Custom';
  overs: number;
  stageType: 'league' | 'knockout' | 'group_knockout';
  maxTeams: number;
  groupCount: number;
  teamsPerGroup: number;
  entryFee: number;
  prizePool: string;
  rules: string;
  selectedTeamIds: string[];
}

const CreateTournamentPage: React.FC = () => {
  const navigate = useNavigate();
  const { createTournament } = useTournaments();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    venue: '',
    startDate: '',
    endDate: '',
    format: 'T20',
    overs: 20,
    stageType: 'league',
    maxTeams: 8,
    groupCount: 2,
    teamsPerGroup: 4,
    entryFee: 0,
    prizePool: '',
    rules: '',
    selectedTeamIds: [],
  });

  const updateFormData = (updates: Partial<TournamentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== '' && formData.startDate !== '';
      case 1:
        return formData.overs > 0;
      case 2:
        return formData.selectedTeamIds.length >= 2;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const tournament = await createTournament({
        name: formData.name,
        venue: formData.venue || null,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
        format: formData.format,
        overs: formData.overs,
        max_teams: formData.maxTeams,
        entry_fee: formData.entryFee,
        prize_pool: formData.prizePool || null,
        rules: formData.rules || null,
      });

      toast({
        title: 'Tournament Created!',
        description: `${formData.name} has been created successfully.`,
      });

      navigate(`/tournaments/${tournament.id}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create tournament',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <TournamentBasicInfo formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <TournamentFormatConfig formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <TournamentTeamRegistration formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <TournamentReview formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center px-4 py-3">
          <button onClick={handleBack} className="p-2 -ml-2 text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-2 text-lg font-bold text-foreground">Create Tournament</h1>
        </div>
        <WizardProgress steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full">
        {renderStep()}
      </main>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant="gold"
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Tournament'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTournamentPage;

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WizardProgress from '@/components/wizard/WizardProgress';
import TeamSelection from '@/components/wizard/TeamSelection';
import PlayerSelection from '@/components/wizard/PlayerSelection';
import VenuePicker from '@/components/wizard/VenuePicker';
import OversConfig from '@/components/wizard/OversConfig';
import TossSimulation from '@/components/wizard/TossSimulation';
import { Team } from '@/types/cricket';

interface MatchWizardPageProps {
  onBack: () => void;
  onStartMatch: (matchData: {
    team1: Team;
    team2: Team;
    venue: string;
    overs: number;
    tossWinner: Team;
    tossDecision: 'bat' | 'bowl';
    playersTeam1: string[];
    playersTeam2: string[];
    enableShotDirection: boolean;
  }) => void;
}

const STEPS = ['Teams', 'Players', 'Venue', 'Format', 'Toss'];

// Sample teams data
const sampleTeams: Team[] = [
  { id: '1', name: 'Thunder Hawks', location: 'Mumbai', captainId: '1', players: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'], createdAt: new Date() },
  { id: '2', name: 'Royal Strikers', location: 'Delhi', captainId: '2', players: ['12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'], createdAt: new Date() },
  { id: '3', name: 'Golden Eagles', location: 'Bangalore', captainId: '3', players: ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'], createdAt: new Date() },
  { id: '4', name: 'City Warriors', location: 'Chennai', captainId: '4', players: ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44'], createdAt: new Date() },
  { id: '5', name: 'Blue Tigers', location: 'Kolkata', captainId: '5', players: ['45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55'], createdAt: new Date() },
];

const MatchWizardPage: React.FC<MatchWizardPageProps> = ({ onBack, onStartMatch }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  const [playersTeam1, setPlayersTeam1] = useState<string[]>([]);
  const [playersTeam2, setPlayersTeam2] = useState<string[]>([]);
  const [venue, setVenue] = useState('');
  const [overs, setOvers] = useState(20);
  const [tossWinner, setTossWinner] = useState<Team | null>(null);
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl' | null>(null);
  const [enableShotDirection, setEnableShotDirection] = useState(true);

  const canProceed = () => {
    switch (currentStep) {
      case 0: return team1 && team2;
      case 1: return playersTeam1.length === 11 && playersTeam2.length === 11;
      case 2: return venue.trim().length > 0;
      case 3: return overs > 0;
      case 4: return tossWinner && tossDecision;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleStartMatch = () => {
    if (team1 && team2 && venue && overs && tossWinner && tossDecision) {
      onStartMatch({
        team1,
        team2,
        venue,
        overs,
        tossWinner,
        tossDecision,
        playersTeam1,
        playersTeam2,
        enableShotDirection,
      });
    }
  };

  const handleTossComplete = (winner: Team, decision: 'bat' | 'bowl') => {
    setTossWinner(winner);
    setTossDecision(decision);
  };

  // Reset player selections when teams change
  const handleTeam1Select = (team: Team | null) => {
    if (team?.id !== team1?.id) {
      setPlayersTeam1([]);
    }
    setTeam1(team);
  };

  const handleTeam2Select = (team: Team | null) => {
    if (team?.id !== team2?.id) {
      setPlayersTeam2([]);
    }
    setTeam2(team);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TeamSelection
            teams={sampleTeams}
            selectedTeam1={team1}
            selectedTeam2={team2}
            onSelectTeam1={handleTeam1Select}
            onSelectTeam2={handleTeam2Select}
          />
        );
      case 1:
        return team1 && team2 ? (
          <PlayerSelection
            team1={team1}
            team2={team2}
            selectedPlayersTeam1={playersTeam1}
            selectedPlayersTeam2={playersTeam2}
            onSelectPlayersTeam1={setPlayersTeam1}
            onSelectPlayersTeam2={setPlayersTeam2}
          />
        ) : null;
      case 2:
        return (
          <VenuePicker
            selectedVenue={venue}
            onSelectVenue={setVenue}
          />
        );
      case 3:
        return (
          <OversConfig
            selectedOvers={overs}
            onSelectOvers={setOvers}
            enableShotDirection={enableShotDirection}
            onToggleShotDirection={setEnableShotDirection}
          />
        );
      case 4:
        return team1 && team2 ? (
          <TossSimulation
            team1={team1}
            team2={team2}
            tossWinner={tossWinner}
            tossDecision={tossDecision}
            onTossComplete={handleTossComplete}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">New Match</h1>
        </div>
        <WizardProgress steps={STEPS} currentStep={currentStep} />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {renderStep()}
      </main>

      {/* Footer Actions */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-4 safe-area-bottom">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1"
              variant="pitch"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleStartMatch}
              disabled={!canProceed()}
              className="flex-1"
              variant="pitch"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Match
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default MatchWizardPage;

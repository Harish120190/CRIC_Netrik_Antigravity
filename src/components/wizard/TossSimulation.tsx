import React, { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Team } from '@/types/cricket';

interface TossSimulationProps {
  team1: Team;
  team2: Team;
  tossWinner: Team | null;
  tossDecision: 'bat' | 'bowl' | null;
  onTossComplete: (winner: Team, decision: 'bat' | 'bowl') => void;
}

const TossSimulation: React.FC<TossSimulationProps> = ({
  team1,
  team2,
  tossWinner,
  tossDecision,
  onTossComplete,
}) => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [showDecision, setShowDecision] = useState(false);
  const [selectedCaller, setSelectedCaller] = useState<Team | null>(null);
  const [calledSide, setCalledSide] = useState<'heads' | 'tails' | null>(null);

  const flipCoin = useCallback(() => {
    if (!selectedCaller || !calledSide) return;

    setIsFlipping(true);
    setShowDecision(false);

    // Simulate coin flip animation
    setTimeout(() => {
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const winner = result === calledSide ? selectedCaller : (selectedCaller.id === team1.id ? team2 : team1);
      
      setIsFlipping(false);
      setShowDecision(true);
      
      // Don't auto-complete, let user choose decision
    }, 2000);
  }, [selectedCaller, calledSide, team1, team2]);

  const handleDecision = (decision: 'bat' | 'bowl') => {
    if (showDecision && selectedCaller) {
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const winner = result === calledSide ? selectedCaller : (selectedCaller.id === team1.id ? team2 : team1);
      onTossComplete(winner, decision);
    }
  };

  const resetToss = () => {
    setSelectedCaller(null);
    setCalledSide(null);
    setShowDecision(false);
    setIsFlipping(false);
  };

  // If toss already completed
  if (tossWinner && tossDecision) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Toss Result</h2>
          <p className="text-muted-foreground">Ready to start the match!</p>
        </div>

        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gold to-pitch flex items-center justify-center mb-4 shadow-gold">
            <span className="text-3xl">🏏</span>
          </div>
          <h3 className="text-xl font-bold text-foreground">{tossWinner.name}</h3>
          <p className="text-muted-foreground">won the toss</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
            Elected to {tossDecision === 'bat' ? '🏏 Bat First' : '🎯 Bowl First'}
          </div>
        </div>

        <Button variant="outline" onClick={resetToss} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Redo Toss
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Virtual Toss</h2>
        <p className="text-muted-foreground">Flip the coin to decide who bats first</p>
      </div>

      {/* Step 1: Select who calls */}
      {!selectedCaller && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground text-center">Who's calling the toss?</p>
          <div className="grid grid-cols-2 gap-3">
            {[team1, team2].map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedCaller(team)}
                className="p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-card flex flex-col items-center gap-2 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-pitch/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-pitch">{team.name.charAt(0)}</span>
                </div>
                <span className="font-medium text-foreground">{team.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Call heads or tails */}
      {selectedCaller && !calledSide && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground text-center">
            {selectedCaller.name} calls...
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCalledSide('heads')}
              className="p-6 rounded-xl border-2 border-border hover:border-gold bg-card flex flex-col items-center gap-3 transition-all hover:shadow-gold"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-2xl shadow-lg">
                👑
              </div>
              <span className="font-bold text-foreground text-lg">HEADS</span>
            </button>
            <button
              onClick={() => setCalledSide('tails')}
              className="p-6 rounded-xl border-2 border-border hover:border-gold bg-card flex flex-col items-center gap-3 transition-all hover:shadow-gold"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-2xl shadow-lg">
                🦅
              </div>
              <span className="font-bold text-foreground text-lg">TAILS</span>
            </button>
          </div>
          <Button variant="ghost" onClick={() => setSelectedCaller(null)} className="w-full">
            Change caller
          </Button>
        </div>
      )}

      {/* Step 3: Flip animation & result */}
      {selectedCaller && calledSide && !showDecision && (
        <div className="space-y-6 text-center">
          <div className={cn(
            "w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-4xl shadow-lg transition-all",
            isFlipping && "animate-spin"
          )}>
            {isFlipping ? '🪙' : calledSide === 'heads' ? '👑' : '🦅'}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {selectedCaller.name} called <span className="font-bold uppercase">{calledSide}</span>
            </p>
          </div>

          <Button onClick={flipCoin} disabled={isFlipping} className="w-full" size="lg" variant="pitch">
            {isFlipping ? 'Flipping...' : 'Flip Coin!'}
          </Button>

          <Button variant="ghost" onClick={resetToss}>
            Start over
          </Button>
        </div>
      )}

      {/* Step 4: Choose bat/bowl */}
      {showDecision && (
        <div className="space-y-6 text-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pitch to-primary flex items-center justify-center shadow-glow">
            <span className="text-4xl">🎉</span>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-foreground">{selectedCaller.name}</h3>
            <p className="text-muted-foreground">won the toss!</p>
          </div>

          <p className="text-sm font-medium text-foreground">Choose to:</p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleDecision('bat')}
              variant="outline"
              size="lg"
              className="h-20 flex-col gap-2"
            >
              <span className="text-2xl">🏏</span>
              <span>Bat First</span>
            </Button>
            <Button
              onClick={() => handleDecision('bowl')}
              variant="outline"
              size="lg"
              className="h-20 flex-col gap-2"
            >
              <span className="text-2xl">🎯</span>
              <span>Bowl First</span>
            </Button>
          </div>

          <Button variant="ghost" onClick={resetToss}>
            Redo toss
          </Button>
        </div>
      )}
    </div>
  );
};

export default TossSimulation;

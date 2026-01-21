import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScoringPadProps {
  onScore: (runs: number, extras?: string) => void;
  onWicket: () => void;
  onUndo: () => void;
  disabled?: boolean;
}

const ScoringPad: React.FC<ScoringPadProps> = ({
  onScore,
  onWicket,
  onUndo,
  disabled = false,
}) => {
  const [showExtras, setShowExtras] = useState(false);

  const runButtons = [0, 1, 2, 3, 4, 6];
  const extraButtons = [
    { label: 'Wide', value: 'wide' },
    { label: 'No Ball', value: 'no-ball' },
    { label: 'Bye', value: 'bye' },
    { label: 'Leg Bye', value: 'leg-bye' },
  ];

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      {/* Run buttons */}
      <div className="grid grid-cols-6 gap-2 mb-3">
        {runButtons.map((run) => (
          <Button
            key={run}
            variant={run === 4 || run === 6 ? 'pitch' : 'secondary'}
            size="lg"
            className={cn(
              "h-14 score-text text-xl",
              run === 4 && "col-span-1",
              run === 6 && "col-span-1"
            )}
            onClick={() => onScore(run)}
            disabled={disabled}
          >
            {run}
          </Button>
        ))}
      </div>

      {/* Extras toggle */}
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setShowExtras(!showExtras)}
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          Extras
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1 font-bold"
          onClick={onWicket}
          disabled={disabled}
        >
          WICKET
        </Button>
      </div>

      {/* Extra buttons */}
      {showExtras && (
        <div className="grid grid-cols-4 gap-2 mb-3 animate-slide-down">
          {extraButtons.map((extra) => (
            <Button
              key={extra.value}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onScore(1, extra.value)}
              disabled={disabled}
            >
              {extra.label}
            </Button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={disabled}
          className="text-muted-foreground"
        >
          <Undo2 className="w-4 h-4 mr-1" />
          Undo
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-muted-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          End Over
        </Button>
      </div>
    </div>
  );
};

export default ScoringPad;

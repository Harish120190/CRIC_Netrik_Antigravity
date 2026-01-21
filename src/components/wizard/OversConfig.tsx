import React from 'react';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OversConfigProps {
  selectedOvers: number;
  onSelectOvers: (overs: number) => void;
}

const oversOptions = [
  { value: 5, label: '5 Overs', description: 'Quick match', duration: '~30 min', icon: Zap },
  { value: 10, label: '10 Overs', description: 'T10 format', duration: '~1 hour' },
  { value: 15, label: '15 Overs', description: 'Short game', duration: '~1.5 hours' },
  { value: 20, label: '20 Overs', description: 'T20 format', duration: '~2 hours', popular: true },
  { value: 25, label: '25 Overs', description: 'Extended T20', duration: '~2.5 hours' },
  { value: 30, label: '30 Overs', description: 'Half ODI', duration: '~3 hours' },
  { value: 50, label: '50 Overs', description: 'ODI format', duration: '~7 hours' },
];

const OversConfig: React.FC<OversConfigProps> = ({ selectedOvers, onSelectOvers }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Match Format</h2>
        <p className="text-muted-foreground">How many overs per innings?</p>
      </div>

      {/* Selected Display */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-pitch to-primary text-primary-foreground shadow-glow">
          <div className="text-center">
            <span className="text-3xl font-bold">{selectedOvers}</span>
            <p className="text-xs opacity-80">overs</p>
          </div>
        </div>
      </div>

      {/* Overs Grid */}
      <div className="grid grid-cols-2 gap-3">
        {oversOptions.map((option) => {
          const Icon = option.icon || Clock;
          return (
            <button
              key={option.value}
              onClick={() => onSelectOvers(option.value)}
              className={cn(
                "relative p-4 rounded-xl border-2 flex flex-col items-start transition-all text-left",
                selectedOvers === option.value
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 bg-card"
              )}
            >
              {option.popular && (
                <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-gold text-accent-foreground px-2 py-0.5 rounded-full">
                  POPULAR
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn(
                  "w-4 h-4",
                  selectedOvers === option.value ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="text-lg font-bold text-foreground">{option.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{option.description}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{option.duration}</p>
            </button>
          );
        })}
      </div>

      {/* Custom Overs */}
      <div className="pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-3">Or enter custom overs:</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 6, 8, 12, 35, 40, 45].map((num) => (
            <button
              key={num}
              onClick={() => onSelectOvers(num)}
              className={cn(
                "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                selectedOvers === num
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OversConfig;

import React from 'react';
import { Users } from 'lucide-react';

export interface Partnership {
  id: number;
  batsman1Name: string;
  batsman2Name: string;
  runs: number;
  balls: number;
  isActive: boolean;
  wicketNumber: number;
}

interface PartnershipTrackerProps {
  currentPartnership: Partnership;
  previousPartnerships: Partnership[];
}

const PartnershipTracker: React.FC<PartnershipTrackerProps> = ({
  currentPartnership,
  previousPartnerships,
}) => {
  const strikeRate = currentPartnership.balls > 0 
    ? ((currentPartnership.runs / currentPartnership.balls) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Current Partnership */}
      <div className="p-4 bg-primary/5 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Current Partnership
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {currentPartnership.batsman1Name} & {currentPartnership.batsman2Name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{currentPartnership.runs}</p>
            <p className="text-xs text-muted-foreground">
              {currentPartnership.balls} balls • SR {strikeRate}
            </p>
          </div>
        </div>
      </div>

      {/* Previous Partnerships */}
      {previousPartnerships.length > 0 && (
        <div className="p-3">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">
            Previous Partnerships
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {previousPartnerships.slice().reverse().map((partnership) => {
              const partnershipSR = partnership.balls > 0 
                ? ((partnership.runs / partnership.balls) * 100).toFixed(0)
                : '0';
              
              return (
                <div 
                  key={partnership.id} 
                  className="flex items-center justify-between text-sm py-1.5 px-2 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                      {partnership.wicketNumber}
                    </span>
                    <span className="text-muted-foreground text-xs truncate max-w-[140px]">
                      {partnership.batsman1Name} & {partnership.batsman2Name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{partnership.runs}</span>
                    <span className="text-xs text-muted-foreground">({partnership.balls})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnershipTracker;
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  steps: string[];
  currentStep: number;
}

const WizardProgress: React.FC<WizardProgressProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between px-4 py-6">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                index < currentStep
                  ? "bg-pitch text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium",
                index <= currentStep ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-1 mx-2 rounded-full transition-all duration-300",
                index < currentStep ? "bg-pitch" : "bg-muted"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default WizardProgress;

import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CricketBat, CricketBall } from '@/components/icons/CricketIcons';

interface HeroSectionProps {
  onStartMatch: () => void;
  onJoinMatch: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartMatch, onJoinMatch }) => {
  return (
    <section className="relative overflow-hidden rounded-2xl gradient-pitch p-6 mb-6">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <CricketBall className="w-full h-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 rotate-45">
        <CricketBat className="w-full h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-4">
        <div>
          <p className="text-primary-foreground/80 text-sm font-medium mb-1">
            Ready to play?
          </p>
          <h2 className="text-2xl font-bold text-primary-foreground leading-tight">
            Start Scoring<br />Your Match Now
          </h2>
        </div>

        <p className="text-primary-foreground/70 text-sm max-w-[200px]">
          Ball-by-ball scoring with live updates and detailed analytics
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Button 
            variant="gold" 
            size="lg"
            onClick={onStartMatch}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            New Match
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={onJoinMatch}
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Join
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

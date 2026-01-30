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
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent text-white p-8 mb-8 shadow-elevated">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full -ml-16 -mb-16 blur-2xl" />

      {/* Icon Backgrounds */}
      <div className="absolute top-4 right-8 w-24 h-24 opacity-20">
        <CricketBall className="w-full h-full animate-bounce" />
      </div>

      {/* Content */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              Live Scoring Platform
            </span>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Elevate Your <br />
              <span className="text-white/80">Cricket Experience</span>
            </h2>
          </div>

          <p className="text-white/80 text-lg font-medium leading-relaxed max-w-md">
            The most advanced ball-by-ball scoring with real-time analytics and professional match reports.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={onStartMatch}
              className="bg-white text-primary hover:bg-white/90 font-bold rounded-2xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Play className="fill-current w-4 h-4 mr-2" />
              Quick Start
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onJoinMatch}
              className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm rounded-2xl transition-all duration-300"
            >
              Join Match
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="hidden md:flex justify-end items-center">
          <div className="relative w-64 h-64 bg-white/15 backdrop-blur-xl rounded-[40px] border border-white/20 flex items-center justify-center p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <CricketBat className="w-full h-full text-white/90 drop-shadow-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

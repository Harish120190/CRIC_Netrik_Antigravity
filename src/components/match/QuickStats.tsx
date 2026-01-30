import React from 'react';
import { Trophy, Activity, Flame, Target, Zap } from 'lucide-react';
import { CricketBat, CricketBall } from '@/components/icons/CricketIcons';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, color }) => (
  <div className="flex items-center gap-3 p-4 bg-card rounded-[2rem] border border-border/50 shadow-card hover:shadow-elevated transition-all duration-300">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-xl font-black text-foreground tracking-tight leading-none mt-0.5">{value}</p>
      {subtext && <p className="text-[10px] text-muted-foreground mt-1">{subtext}</p>}
    </div>
  </div>
);

interface QuickStatsProps {
  stats: {
    matchesPlayed: number;
    totalRuns: number;
    totalWickets: number;
    strikeRate: number;
  };
}

const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Trophy className="w-5 h-5 text-primary-foreground" />}
        label="Matches"
        value={stats.matchesPlayed}
        color="bg-primary"
      />
      <StatCard
        icon={<CricketBat className="w-5 h-5 text-accent-foreground" />}
        label="Runs"
        value={stats.totalRuns}
        color="bg-accent"
      />
      <StatCard
        icon={<CricketBall className="w-5 h-5 text-white" />}
        label="Wickets"
        value={stats.totalWickets}
        color="bg-blue-600"
      />
      <StatCard
        icon={<Activity className="w-5 h-5 text-white" />}
        label="Strike Rate"
        value={stats.strikeRate.toFixed(1)}
        color="bg-emerald-600"
      />
    </div>
  );
};

export default QuickStats;

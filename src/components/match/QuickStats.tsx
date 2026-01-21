import React from 'react';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { CricketBat, CricketBall } from '@/components/icons/CricketIcons';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, color }) => (
  <div className="flex items-center gap-3 p-3 bg-card rounded-xl shadow-card">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold text-foreground">{value}</p>
      {subtext && <p className="text-[10px] text-muted-foreground">{subtext}</p>}
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
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<Target className="w-5 h-5 text-primary-foreground" />}
        label="Matches"
        value={stats.matchesPlayed}
        color="gradient-pitch"
      />
      <StatCard
        icon={<CricketBat className="w-5 h-5 text-accent-foreground" />}
        label="Total Runs"
        value={stats.totalRuns}
        color="gradient-gold"
      />
      <StatCard
        icon={<CricketBall className="w-5 h-5 text-primary-foreground" />}
        label="Wickets"
        value={stats.totalWickets}
        color="bg-primary"
      />
      <StatCard
        icon={<Zap className="w-5 h-5 text-accent-foreground" />}
        label="Strike Rate"
        value={stats.strikeRate.toFixed(1)}
        color="bg-accent"
      />
    </div>
  );
};

export default QuickStats;

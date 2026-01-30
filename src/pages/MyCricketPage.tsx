import React from 'react';
import {
    Trophy,
    Users,
    History,
    Star,
    ChevronRight,
    LayoutDashboard,
    Medal,
    Activity
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const MyCricketPage: React.FC = () => {
    const { profile } = useAuth();
    const { stats, isLoading } = usePlayerStats(profile?.full_name); // Assuming name-based matching for mock

    const statCards = [
        { label: 'Matches', value: stats?.matches || 0, icon: History, color: 'text-blue-500' },
        { label: 'Runs', value: stats?.runs || 0, icon: Star, color: 'text-yellow-500' },
        { label: 'Wickets', value: stats?.wickets || 0, icon: Medal, color: 'text-emerald-500' },
        { label: 'Average', value: stats?.average || 0, icon: Activity, color: 'text-purple-500' },
    ];

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="My Cricket" />

            <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
                {/* Profile Summary Card */}
                <Card className="overflow-hidden border-none shadow-glow bg-gradient-to-br from-pitch to-primary text-primary-foreground">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20 border-4 border-white/20">
                                <AvatarImage src={profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{profile?.full_name || 'Cricketer'}</h2>
                                <p className="text-white/80 text-sm">All-rounder • Right Hand Bat</p>
                                <div className="mt-2 flex gap-2">
                                    <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-medium">LEVEL 12</div>
                                    <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-medium">PRO</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-medium">Performance Score</span>
                                <span className="text-lg font-bold">78%</span>
                            </div>
                            <Progress value={78} className="h-2 bg-white/20" />
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {statCards.map((card, i) => (
                        <Card key={i} className="border-none shadow-card hover:shadow-lg transition-all cursor-pointer group">
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <div className={`p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors mb-3`}>
                                    <card.icon className={`w-6 h-6 ${card.color}`} />
                                </div>
                                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Menu Options */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-foreground px-1">My Activity</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { title: 'My Teams', icon: Users, count: 2, url: '/teams' },
                            { title: 'Registered Tournaments', icon: Trophy, count: 1, url: '/tournaments' },
                            { title: 'Match Insights', icon: LayoutDashboard, count: 'New', url: '#' },
                            { title: 'Achievements', icon: Star, count: 5, url: '#' },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-transparent hover:border-primary/20 hover:shadow-md transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-foreground">{item.title}</p>
                                </div>
                                {item.count && (
                                    <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                                        {item.count}
                                    </span>
                                )}
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyCricketPage;

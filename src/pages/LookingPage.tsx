import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Trophy,
    Users,
    Swords,
    UserPlus,
    MapPin,
    Gavel,
    ClipboardList,
    Mic,
    Video,
    Plus
} from 'lucide-react';

const categories = [
    { id: 'tournament-team', label: 'Teams for my tournament', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'tournament-participate', label: 'A tournament to participate', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 'opponent', label: 'An opponent to play match', icon: Swords, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'join-team', label: 'A team to join as a player', icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'recruit-player', label: 'Player to join my team', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'ground', label: 'A ground to play', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'umpire', label: 'AN umpire to hire', icon: Gavel, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { id: 'scorer', label: 'A scorer to hire', icon: ClipboardList, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'commentator', label: 'A Commentator to hire', icon: Mic, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { id: 'streamer', label: 'A live Streamer', icon: Video, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

export default function LookingPage() {
    return (
        <div className="pb-20">
            {/* Header */}
            <div className="p-4 border-b border-border bg-card sticky top-0 z-30 flex items-center justify-between">
                <h1 className="font-bold text-lg">Looking For</h1>
                <Button size="icon" variant="ghost" className="rounded-full bg-primary/10 text-primary">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            {/* Categories Grid */}
            <div className="p-4 grid grid-cols-2 gap-3">
                {categories.map((item) => (
                    <Card key={item.id} className="border-border hover:border-primary/50 transition-colors cursor-pointer active:scale-95 duration-200">
                        <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg}`}>
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <span className="text-xs font-medium leading-tight">{item.label}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ShotTypeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (shotType: string) => void;
    onSkip: () => void;
}

// --- 3D Glassmorphism / Unreal Engine Style ---
// - Frosted Glass silhouettes
// - Vibrant background glows
// - 3D depth via Inner Shadows and Gloss

const GlassFilter = () => (
    <svg width="0" height="0" className="absolute">
        <defs>
            {/* Soft inner glow/bevel for 3D feel */}
            <filter id="glass-bevel" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
                <feSpecularLighting in="blur" surfaceScale="2" specularConstant="1" specularExponent="15" result="specular" lightingColor="#ffffff">
                    <fePointLight x="-5000" y="-10000" z="10000" />
                </feSpecularLighting>
                <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular" />
                <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            </filter>
        </defs>
    </svg>
);

// Reusable Paths (Dynamic Action Poses)
const Paths = {
    Defense: "M13 4c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-2 4h3l-.5 6h-2l-.5-6zm-.5 7l-.5 6h2l1-6h-2.5zm4 0l.5 6h2l-1-6h-1.5z m-2.5-2h2l-.2 9h-1.6l-.2-9z",
    Drive: "M14 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-1 3l-1.5 4 3 2 1.5-3-3-3zm-2 9l-3 6h2l2-5-1-1zm5-2l3 5-1.5 2-4-5 2.5-2zm-2.5-3l4 4-1 1.5-4.5-3.5 1.5-2z",
    Cut: "M12 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm1 3l-2 1-1 3 3 1 .5 4-2.5-2 2-7zm-4 9l-2 6h2l1.5-5-1.5-1zm6-1l1.5 6-2 1-1.5-5 2-2zm-3-4l5-1 .5 1.5-5 2-.5-2.5z",
    Pull: "M11 4c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm1 3l-1 4 2 1 1.5-4-2.5-1zm-3 8l-2 6h2l1.5-5-1.5-1zm6-1l2 6-2 1-1.5-5 1.5-2zm-4-6h5l-.5 2h-5z",
    Sweep: "M14 5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-2 3l1 4 2 1-1 4-3-1-1-3 2-5zm-3 9l3 2h3l-1 2h-6l1-4zm7-1l1 2 2-1-1-3-2 2zm-6-2l5 2 .5-1.5-5-2-.5 1.5z",
    Lofted: "M12 3c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm0 3l-1 3 2 4-1 7h2l1-7-1-3-2-4zm-3 12l1 3h2l-1-4h-2zm-1-8l2-1 3 5-1.5 1-3.5-5z",
    Scoop: "M13 6c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-1 3l-1 2 2 4-1 2-2-3 2-5zm-2 9l-2 3h2l1.5-3-1.5 0zm6-1l-1 4h2l1-4-2 0zm-3-8l-2-2 1.5-1.5 3 3-2.5 .5z",
    Leave: "M12 4c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm-1 3l1 4h-1l-.5 4h-.5l.5-4h-1l-1-4 2.5 0zm-1.5 9h2l-.5 5h-1.5l0-5zm3.5 0h2l-.5 5h-1.5l0-5zm1-10h1.5v9h-1.5z"
};

// --- Glass Icon Component ---
const GlassIcon = ({ d, colorClass }: { d: string, colorClass: string }) => (
    <div className="relative w-full h-full flex items-center justify-center">
        {/* 1. Back Glow (Vibrant Blur) */}
        <div className={cn("absolute inset-0 rounded-full blur-[10px] opacity-60 scale-75 animate-pulse", colorClass)} />

        {/* 2. Glass Silhouette Container */}
        <div className="relative w-full h-full z-10 glass-icon-container">
            <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-lg">
                <path
                    d={d}
                    fill="url(#glass-gradient)"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.2"
                    style={{ filter: 'url(#glass-bevel)' }}
                />
            </svg>

            {/* 3. Glossy Reflection Overlay (Simulates Glass Surface) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 rounded-lg pointer-events-none mix-blend-overlay" />
        </div>

        {/* Local Defs for per-icon gradients if needed, mostly global */}
        <svg width="0" height="0" className="absolute">
            <defs>
                <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                    <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                </linearGradient>
            </defs>
        </svg>
    </div>
);


// --- Data ---
interface ShotType {
    name: string;
    path: string;
    category: string;
    color: string; // Tailwind class for glow
}

const SHOT_DATA: ShotType[] = [
    { name: "Defensive", path: Paths.Defense, category: "Defense", color: "bg-blue-500" },
    { name: "Drive", path: Paths.Drive, category: "Front Foot", color: "bg-teal-400" },
    { name: "Cover Drive", path: Paths.Drive, category: "Front Foot", color: "bg-teal-400" },
    { name: "Straight Drive", path: Paths.Drive, category: "Front Foot", color: "bg-teal-400" },
    { name: "On Drive", path: Paths.Drive, category: "Front Foot", color: "bg-teal-400" },
    { name: "Square Drive", path: Paths.Cut, category: "Off Side", color: "bg-indigo-500" },
    { name: "Cut", path: Paths.Cut, category: "Off Side", color: "bg-indigo-500" },
    { name: "Late Cut", path: Paths.Cut, category: "Off Side", color: "bg-indigo-500" },
    { name: "Square Cut", path: Paths.Cut, category: "Off Side", color: "bg-indigo-500" },
    { name: "Pull", path: Paths.Pull, category: "Leg Side", color: "bg-orange-500" },
    { name: "Hook", path: Paths.Pull, category: "Leg Side", color: "bg-orange-500" },
    { name: "Flick", path: Paths.Drive, category: "Leg Side", color: "bg-orange-500" },
    { name: "Sweep", path: Paths.Sweep, category: "Spin", color: "bg-rose-500" },
    { name: "Rev. Sweep", path: Paths.Sweep, category: "Spin", color: "bg-rose-500" },
    { name: "Lofted", path: Paths.Lofted, category: "Aggressive", color: "bg-purple-500" },
    { name: "Slog", path: Paths.Lofted, category: "Aggressive", color: "bg-purple-500" },
    { name: "Helicopter", path: Paths.Lofted, category: "Aggressive", color: "bg-purple-500" },
    { name: "Scoop", path: Paths.Scoop, category: "Unorthodox", color: "bg-pink-500" },
    { name: "Switch Hit", path: Paths.Sweep, category: "Unorthodox", color: "bg-pink-500" },
    { name: "Leave", path: Paths.Leave, category: "Defense", color: "bg-blue-500" }
];

const ShotTypeSelector: React.FC<ShotTypeSelectorProps> = ({
    open,
    onOpenChange,
    onSelect,
    onSkip
}) => {
    const [activeCategory, setActiveCategory] = useState("Defense");
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Grouping
    const groupedShots = SHOT_DATA.reduce((acc, shot) => {
        if (!acc[shot.category]) {
            acc[shot.category] = [];
        }
        acc[shot.category].push(shot);
        return acc;
    }, {} as Record<string, ShotType[]>);

    const categoryOrder = ["Defense", "Front Foot", "Off Side", "Leg Side", "Aggressive", "Spin", "Unorthodox"];

    const scrollToCategory = (category: string) => {
        setActiveCategory(category);
        categoryRefs.current[category]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* 
                "Studio" Theme: 
                - Deep Grey Background (Unreal Engine Viewport tone)
                - Grid Overlay
                - Center focus
            */}
            <DialogContent className="sm:max-w-4xl max-h-[90vh] h-[85vh] flex flex-col p-0 border-none shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-[#1e1e1e] text-white font-sans selection:bg-white/20">
                <GlassFilter />

                {/* Header */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-[#252525] z-20">
                    <div>
                        <DialogTitle className="text-xl font-light tracking-[0.2em] text-white uppercase opacity-80">
                            Shot Analysis <span className="font-bold text-white">PRO</span>
                        </DialogTitle>
                        <div className="text-[10px] text-white/40 tracking-widest mt-1">
                            UNREAL ENGINE RENDER STYLE
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Dark Glass */}
                    <div className="w-48 bg-[#1e1e1e] border-r border-white/5 flex flex-col py-6 overflow-y-auto shrink-0">
                        {categoryOrder.map((category) => (
                            <button
                                key={category}
                                onClick={() => scrollToCategory(category)}
                                className={cn(
                                    "px-6 py-3 text-xs font-bold text-left transition-all duration-300 uppercase tracking-wider relative",
                                    activeCategory === category
                                        ? "text-white"
                                        : "text-white/30 hover:text-white/70"
                                )}
                            >
                                {category}
                                {/* Active Indicator Glow */}
                                {activeCategory === category && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 shadow-[0_0_10px_rgba(100,100,255,0.5)] rounded-r-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main Grid - Viewport */}
                    <div className="flex-1 bg-[#121212] relative">
                        {/* Studio Lighting Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />

                        <ScrollArea className="h-full">
                            <div className="p-10 space-y-16">
                                {categoryOrder.map((category) => {
                                    const shots = groupedShots[category];
                                    if (!shots) return null;

                                    return (
                                        <div
                                            key={category}
                                            ref={(el) => (categoryRefs.current[category] = el)}
                                            className="scroll-mt-8"
                                        >
                                            <h3 className="text-sm font-light text-white/50 mb-8 flex items-center gap-4 uppercase tracking-[0.3em]">
                                                {category}
                                                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                                            </h3>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                {shots.map((shot) => (
                                                    <button
                                                        key={shot.name}
                                                        className="group flex flex-col items-center gap-4 focus:outline-none transition-all duration-500 hover:scale-110"
                                                        onClick={() => onSelect(shot.name)}
                                                    >
                                                        {/* Glass Container */}
                                                        <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative">

                                                            {/* Backdrop Blur Card */}
                                                            <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl transition-all duration-300 group-hover:bg-white/10 group-hover:border-white/30 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]" />

                                                            {/* The Icon */}
                                                            <div className="w-16 h-16 relative z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                                                                <GlassIcon d={shot.path} colorClass={shot.color} />
                                                            </div>

                                                        </div>

                                                        {/* Label */}
                                                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest group-hover:text-white group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] transition-all">
                                                            {shot.name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Footer */}
                <div className="h-16 flex items-center justify-center border-t border-white/5 bg-[#252525] shrink-0 z-20">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSkip}
                        className="text-white/30 hover:text-white hover:bg-white/5 uppercase tracking-[0.2em] text-[10px]"
                    >
                        Skip Selection
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ShotTypeSelector;

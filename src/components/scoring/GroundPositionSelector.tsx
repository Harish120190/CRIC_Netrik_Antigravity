import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SkipForward, ShieldCheck } from 'lucide-react';

interface GroundPositionSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    onSelect: (position: string) => void;
    onSkip: () => void;
}

// Simplified Zones for Grid/Visual Map
const FIELD_ZONES = [
    { id: 'third_man', label: 'Third Man', className: 'top-12 left-10' },
    { id: 'fine_leg', label: 'Fine Leg', className: 'top-12 right-10' },
    { id: 'point', label: 'Point', className: 'top-1/2 left-4 -translate-y-1/2' },
    { id: 'square_leg', label: 'Square Leg', className: 'top-1/2 right-4 -translate-y-1/2' },
    { id: 'cover', label: 'Cover', className: 'bottom-28 left-10' },
    { id: 'mid_wicket', label: 'Mid Wicket', className: 'bottom-28 right-10' },
    { id: 'long_off', label: 'Long Off', className: 'bottom-8 left-20' },
    { id: 'long_on', label: 'Long On', className: 'bottom-8 right-20' },
    { id: 'straight', label: 'Straight', className: 'bottom-4 left-1/2 -translate-x-1/2' },
    { id: 'behind', label: 'Behind', className: 'top-2 left-1/2 -translate-x-1/2' },
];

const GroundPositionSelector: React.FC<GroundPositionSelectorProps> = ({
    open,
    onOpenChange,
    title = "Select Shot Direction",
    onSelect,
    onSkip
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md md:max-w-lg overflow-hidden bg-slate-900 border-slate-800 text-white">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                {/* Cricket Field Visualization */}
                <div className="relative w-full aspect-square max-w-[420px] mx-auto bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 rounded-full border-[8px] border-emerald-900 shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden group">
                    {/* Grass Mowing Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(0,0,0,0.1)_40px,rgba(0,0,0,0.1)_80px)]"></div>
                    </div>

                    {/* Inner Circle (30 yards) */}
                    <div className="absolute inset-[25%] bg-emerald-500/30 rounded-full border-2 border-emerald-400/30 backdrop-blur-[2px]" />

                    {/* Pitch - More Professional Look */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-32 bg-gradient-to-b from-[#EBD9B4] via-[#F3E5AB] to-[#EBD9B4] rounded-sm border border-[#C4B597] shadow-xl z-10 flex flex-col justify-between py-4 items-center overflow-hidden">
                        <div className="w-10 h-0.5 bg-black/10" /> {/* Crease */}
                        <div className="flex gap-1.5 opacity-40">
                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800 shadow-sm" />)}
                        </div>
                        <div className="flex gap-1.5 opacity-40">
                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-800 shadow-sm" />)}
                        </div>
                        <div className="w-10 h-0.5 bg-black/10" /> {/* Crease */}
                    </div>

                    {/* Boundaries Markers */}
                    <div className="absolute inset-0 rounded-full border border-white/10 scale-95 border-dashed" />

                    {/* Zone Buttons */}
                    {FIELD_ZONES.map((zone) => (
                        <button
                            key={zone.id}
                            className={cn(
                                "absolute text-xs md:text-sm font-bold px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md text-white shadow-lg transition-all",
                                "hover:scale-110 hover:bg-emerald-500 hover:text-white hover:z-20 border border-white/20 cursor-pointer",
                                "active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
                                zone.className
                            )}
                            onClick={() => {
                                onSelect(zone.label);
                                onOpenChange(false);
                            }}
                        >
                            {zone.label}
                        </button>
                    ))}
                </div>

                <DialogFooter className="sm:justify-center pt-6">
                    <Button
                        variant="ghost"
                        className="w-full text-slate-400 hover:text-white hover:bg-white/5"
                        onClick={() => {
                            onSkip();
                            onOpenChange(false);
                        }}
                    >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip / Don't Track
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default GroundPositionSelector;

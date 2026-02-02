import React, { useState, useEffect } from 'react';
import { Highlight, highlightsEngine } from '@/services/highlightsEngine';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface HighlightsReelProps {
    matchId: string;
}

const HighlightsReel: React.FC<HighlightsReelProps> = ({ matchId }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const highlights = highlightsEngine.generateHighlights(matchId);

    useEffect(() => {
        if (!isAutoPlay || highlights.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % highlights.length);
        }, 3000); // 3 seconds per highlight

        return () => clearInterval(interval);
    }, [isAutoPlay, highlights.length]);

    if (highlights.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No highlights available</p>
            </div>
        );
    }

    const currentHighlight = highlights[currentIndex];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % highlights.length);
    };

    const handleShare = () => {
        toast.success('Highlight copied to clipboard!');
        // In a real app, this would generate a shareable link
    };

    const getGradientForType = (type: Highlight['type']) => {
        switch (type) {
            case 'wicket':
                return 'from-red-500 to-red-700';
            case 'six':
                return 'from-orange-500 to-orange-700';
            case 'four':
                return 'from-yellow-500 to-yellow-700';
            case 'milestone':
                return 'from-green-500 to-green-700';
            case 'momentum':
                return 'from-blue-500 to-blue-700';
        }
    };

    const getIconEmoji = (type: Highlight['type']) => {
        switch (type) {
            case 'wicket':
                return '🎯';
            case 'six':
                return '🔥';
            case 'four':
                return '⚡';
            case 'milestone':
                return '🏆';
            case 'momentum':
                return '📈';
        }
    };

    return (
        <div className="space-y-4">
            {/* Reel Container */}
            <div className="relative bg-gradient-to-br from-background to-muted rounded-2xl overflow-hidden border-2 border-border shadow-2xl">
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${getGradientForType(currentHighlight.type)} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Highlight {currentIndex + 1} of {highlights.length}
                        </Badge>
                        <span className="text-4xl">{getIconEmoji(currentHighlight.type)}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{currentHighlight.title}</h2>
                    <p className="text-white/90 text-sm">{currentHighlight.description}</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Over/Ball Info */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Over</p>
                            <p className="text-2xl font-bold text-foreground">{currentHighlight.over}</p>
                        </div>
                        <div className="text-4xl text-muted-foreground">•</div>
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground">Ball</p>
                            <p className="text-2xl font-bold text-foreground">{currentHighlight.ball}</p>
                        </div>
                    </div>

                    {/* Players */}
                    <div className="grid grid-cols-2 gap-4">
                        {currentHighlight.batsman && (
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground mb-1">Batsman</p>
                                <p className="font-semibold text-foreground">{currentHighlight.batsman}</p>
                            </div>
                        )}
                        {currentHighlight.bowler && (
                            <div className="bg-muted/50 rounded-lg p-3 text-center">
                                <p className="text-xs text-muted-foreground mb-1">Bowler</p>
                                <p className="font-semibold text-foreground">{currentHighlight.bowler}</p>
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    {currentHighlight.metadata && (
                        <div className="bg-primary/10 rounded-lg p-3 text-center">
                            {currentHighlight.metadata.milestone_type && (
                                <p className="text-sm font-medium text-primary">
                                    🎉 {currentHighlight.metadata.milestone_type.toUpperCase().replace('_', ' ')}
                                </p>
                            )}
                            {currentHighlight.metadata.runs !== undefined && (
                                <p className="text-sm text-muted-foreground">
                                    {currentHighlight.metadata.runs} runs
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 pb-4">
                    {highlights.slice(0, Math.min(10, highlights.length)).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                                }`}
                        />
                    ))}
                    {highlights.length > 10 && (
                        <span className="text-xs text-muted-foreground">+{highlights.length - 10}</span>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant={isAutoPlay ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setIsAutoPlay(!isAutoPlay)}
                    >
                        {isAutoPlay ? (
                            <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Auto Play
                            </>
                        )}
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                </div>

                <Button variant="outline" size="icon" onClick={handleNext}>
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default HighlightsReel;

import React from 'react';
import { Highlight } from '@/services/highlightsEngine';
import { Badge } from '@/components/ui/badge';
import { Zap, Trophy, Target, TrendingUp, Flame } from 'lucide-react';

interface HighlightCardProps {
    highlight: Highlight;
    onClick?: () => void;
}

const getIconForType = (type: Highlight['type']) => {
    switch (type) {
        case 'wicket':
            return <Trophy className="w-5 h-5 text-red-600" />;
        case 'six':
            return <Flame className="w-5 h-5 text-orange-500" />;
        case 'four':
            return <Zap className="w-5 h-5 text-yellow-500" />;
        case 'milestone':
            return <Target className="w-5 h-5 text-green-600" />;
        case 'momentum':
            return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
};

const getColorForType = (type: Highlight['type']) => {
    switch (type) {
        case 'wicket':
            return 'border-red-500 bg-red-50';
        case 'six':
            return 'border-orange-500 bg-orange-50';
        case 'four':
            return 'border-yellow-500 bg-yellow-50';
        case 'milestone':
            return 'border-green-500 bg-green-50';
        case 'momentum':
            return 'border-blue-500 bg-blue-50';
    }
};

const getStars = (score: number) => {
    if (score >= 120) return '⭐⭐⭐';
    if (score >= 80) return '⭐⭐';
    return '⭐';
};

const HighlightCard: React.FC<HighlightCardProps> = ({ highlight, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`border-l-4 rounded-r-xl p-4 cursor-pointer transition-all hover:shadow-lg ${getColorForType(highlight.type)} ${onClick ? 'hover:scale-[1.02]' : ''
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {getIconForType(highlight.type)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                    {/* Title and Stars */}
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-foreground text-base">{highlight.title}</h3>
                        <span className="text-sm">{getStars(highlight.score)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{highlight.description}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="font-mono">
                            {highlight.over}.{highlight.ball}
                        </Badge>
                        {highlight.batsman && (
                            <Badge variant="secondary">{highlight.batsman}</Badge>
                        )}
                        {highlight.bowler && (
                            <Badge variant="secondary">{highlight.bowler}</Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                            {highlight.type}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HighlightCard;

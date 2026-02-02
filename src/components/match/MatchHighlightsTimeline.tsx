import React, { useState } from 'react';
import { Highlight, highlightsEngine } from '@/services/highlightsEngine';
import HighlightCard from './HighlightCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter } from 'lucide-react';

interface MatchHighlightsTimelineProps {
    matchId: string;
}

const MatchHighlightsTimeline: React.FC<MatchHighlightsTimelineProps> = ({ matchId }) => {
    const [filterType, setFilterType] = useState<'all' | Highlight['type']>('all');

    const allHighlights = highlightsEngine.getChronologicalHighlights(matchId);
    const filteredHighlights = filterType === 'all'
        ? allHighlights
        : allHighlights.filter(h => h.type === filterType);

    if (allHighlights.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No highlights available yet</p>
                <p className="text-xs text-muted-foreground mt-2">Highlights will appear as the match progresses</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Tabs */}
            <Tabs value={filterType} onValueChange={(val) => setFilterType(val as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="all">All ({allHighlights.length})</TabsTrigger>
                    <TabsTrigger value="wicket">Wickets</TabsTrigger>
                    <TabsTrigger value="six">Sixes</TabsTrigger>
                    <TabsTrigger value="four">Fours</TabsTrigger>
                    <TabsTrigger value="milestone">Milestones</TabsTrigger>
                    <TabsTrigger value="momentum">Momentum</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Timeline */}
            <div className="space-y-3">
                {filteredHighlights.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No {filterType} highlights</p>
                    </div>
                ) : (
                    filteredHighlights.map((highlight) => (
                        <HighlightCard key={highlight.id} highlight={highlight} />
                    ))
                )}
            </div>
        </div>
    );
};

export default MatchHighlightsTimeline;

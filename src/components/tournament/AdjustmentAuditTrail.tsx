import React from 'react';
import { PointAdjustment } from '@/services/mockDatabase';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface AdjustmentAuditTrailProps {
    adjustments: PointAdjustment[];
}

const categoryLabels = {
    slow_over_rate: 'Slow Over Rate',
    code_of_conduct: 'Code of Conduct',
    other: 'Other'
};

const AdjustmentAuditTrail: React.FC<AdjustmentAuditTrailProps> = ({ adjustments }) => {
    if (adjustments.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No point adjustments recorded</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {adjustments.map((adj) => {
                const isPositive = adj.points_change > 0;
                return (
                    <div
                        key={adj.id}
                        className={`border-l-4 pl-4 py-3 rounded-r-lg ${isPositive
                                ? 'border-green-500 bg-green-50/50'
                                : 'border-red-500 bg-red-50/50'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                                {/* Points Change */}
                                <div className="flex items-center gap-2">
                                    {isPositive ? (
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className={`text-lg font-bold ${isPositive ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                        {isPositive ? '+' : ''}{adj.points_change} point{Math.abs(adj.points_change) !== 1 ? 's' : ''}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {categoryLabels[adj.category]}
                                    </Badge>
                                </div>

                                {/* Reason */}
                                <p className="text-sm text-foreground italic">"{adj.reason}"</p>

                                {/* Metadata */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        Adjusted by: <span className="font-semibold">{adj.adjusted_by}</span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(adj.adjusted_at), 'PPp')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AdjustmentAuditTrail;

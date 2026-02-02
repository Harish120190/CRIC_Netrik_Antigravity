import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { PlayerTrustProfile, TrustLevel } from '@/types/proxyPrevention';
import { getTrustLevelColor, getTrustLevelBgColor, getTrustScoreColor } from '@/services/trustScoreService';

interface PlayerTrustScoreCardProps {
    profile: PlayerTrustProfile;
    compact?: boolean;
}

const PlayerTrustScoreCard: React.FC<PlayerTrustScoreCardProps> = ({ profile, compact = false }) => {
    const { trustScore, trustLevel, scoreComponents, statistics } = profile;

    const getTrustLevelLabel = (level: TrustLevel): string => {
        return level.charAt(0).toUpperCase() + level.slice(1);
    };

    const scoreColor = getTrustScoreColor(trustScore);
    const levelColor = getTrustLevelColor(trustLevel);
    const levelBgColor = getTrustLevelBgColor(trustLevel);

    // Calculate trend (simplified - could be enhanced with historical data)
    const getTrend = () => {
        if (scoreComponents.proxyPenalty < -10) return 'declining';
        if (scoreComponents.verificationScore >= 35) return 'improving';
        return 'stable';
    };

    const trend = getTrend();

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <div className="relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="#e5e7eb"
                            strokeWidth="6"
                            fill="none"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke={scoreColor}
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${(trustScore / 100) * 175.93} 175.93`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">{trustScore}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Badge className={`${levelBgColor} ${levelColor} border-0`}>
                            {getTrustLevelLabel(trustLevel)}
                        </Badge>
                        {trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {trend === 'declining' && <TrendingDown className="w-4 h-4 text-red-600" />}
                        {trend === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {statistics.totalTournaments} tournaments • {statistics.verificationCount} verifications
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Trust Score
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Circular Progress */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                                fill="none"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke={scoreColor}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(trustScore / 100) * 351.86} 351.86`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{trustScore}</span>
                            <span className="text-xs text-muted-foreground">/ 100</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <Badge className={`${levelBgColor} ${levelColor} border-0 text-sm px-3 py-1`}>
                            {getTrustLevelLabel(trustLevel)}
                        </Badge>
                        {trend === 'improving' && (
                            <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs">Improving</span>
                            </div>
                        )}
                        {trend === 'declining' && (
                            <div className="flex items-center gap-1 text-red-600">
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-xs">Declining</span>
                            </div>
                        )}
                        {trend === 'stable' && (
                            <div className="flex items-center gap-1 text-gray-600">
                                <Minus className="w-4 h-4" />
                                <span className="text-xs">Stable</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Score Breakdown</h4>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Verification</span>
                            <span className="font-medium">
                                {scoreComponents.verificationScore} / 40
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(scoreComponents.verificationScore / 40) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Participation</span>
                            <span className="font-medium">
                                {scoreComponents.participationScore} / 30
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${(scoreComponents.participationScore / 30) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Proxy Penalty</span>
                            <span className={`font-medium ${scoreComponents.proxyPenalty < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {scoreComponents.proxyPenalty} / -30
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-red-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.abs(scoreComponents.proxyPenalty / 30) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <p className="text-xs text-muted-foreground">Tournaments</p>
                        <p className="text-lg font-semibold">{statistics.totalTournaments}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                        <p className="text-lg font-semibold">
                            {(statistics.completionRate * 100).toFixed(0)}%
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Verifications</p>
                        <p className="text-lg font-semibold">{statistics.verificationCount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Proxy Flags</p>
                        <p className={`text-lg font-semibold ${statistics.proxyFlagCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {statistics.proxyFlagCount}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PlayerTrustScoreCard;

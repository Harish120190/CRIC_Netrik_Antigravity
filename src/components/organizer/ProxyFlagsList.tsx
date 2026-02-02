import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react';
import type { ProxyFlag } from '@/types/proxyPrevention';
import { formatDistanceToNow } from 'date-fns';
import { mockDB } from '@/services/mockDatabase';

interface ProxyFlagsListProps {
    flags: ProxyFlag[];
    onResolve?: (flagId: string) => void;
    showActions?: boolean;
}

const ProxyFlagsList: React.FC<ProxyFlagsListProps> = ({
    flags,
    onResolve,
    showActions = false
}) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'medium':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'high':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'critical':
                return 'bg-purple-100 text-purple-800 border-purple-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getSeverityLabel = (severity: string): string => {
        return severity.charAt(0).toUpperCase() + severity.slice(1);
    };

    const getReporterName = (reporterId: string): string => {
        const user = mockDB.getUsers().find(u => u.id === reporterId);
        return user?.fullName || 'Unknown Organizer';
    };

    if (flags.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-primary" />
                        Proxy Flags
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 className="w-12 h-12 text-green-600 mb-3" />
                        <p className="text-sm font-medium">No proxy flags</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            This player has a clean record
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    Proxy Flags ({flags.filter(f => !f.resolved).length} active)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {flags.map((flag) => (
                        <div
                            key={flag.id}
                            className={`p-4 rounded-lg border-2 ${flag.resolved
                                    ? 'bg-gray-50 border-gray-200 opacity-60'
                                    : 'bg-white border-red-200'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <Badge className={getSeverityColor(flag.severity)}>
                                        {getSeverityLabel(flag.severity)}
                                    </Badge>
                                    {flag.resolved && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                            Resolved
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                        {formatDistanceToNow(new Date(flag.reportedAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>

                            <h4 className="font-semibold text-sm mb-2">{flag.reason}</h4>

                            {flag.description && (
                                <p className="text-sm text-muted-foreground mb-3">
                                    {flag.description}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    <span>Reported by: {getReporterName(flag.reportedBy)}</span>
                                </div>
                                {flag.tournamentId && (
                                    <div>
                                        <span>Tournament ID: {flag.tournamentId.slice(0, 8)}...</span>
                                    </div>
                                )}
                            </div>

                            {flag.evidence && (
                                <div className="bg-gray-50 rounded p-3 mb-3">
                                    <p className="text-xs font-semibold mb-1">Evidence:</p>
                                    <p className="text-xs text-muted-foreground">
                                        Type: {flag.evidence.type}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {flag.evidence.description}
                                    </p>
                                </div>
                            )}

                            {flag.resolved && flag.resolutionNotes && (
                                <div className="bg-green-50 rounded p-3 mb-3">
                                    <p className="text-xs font-semibold mb-1 text-green-800">Resolution:</p>
                                    <p className="text-xs text-green-700">{flag.resolutionNotes}</p>
                                    {flag.resolvedAt && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Resolved {formatDistanceToNow(new Date(flag.resolvedAt), { addSuffix: true })}
                                        </p>
                                    )}
                                </div>
                            )}

                            {showActions && !flag.resolved && onResolve && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onResolve(flag.id)}
                                    className="w-full mt-2"
                                >
                                    Mark as Resolved
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProxyFlagsList;

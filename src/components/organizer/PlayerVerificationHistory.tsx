import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Smartphone, Mail, FileText, Fingerprint, Clock } from 'lucide-react';
import type { VerificationHistory } from '@/types/proxyPrevention';
import { formatDistanceToNow } from 'date-fns';

interface PlayerVerificationHistoryProps {
    history: VerificationHistory[];
}

const PlayerVerificationHistory: React.FC<PlayerVerificationHistoryProps> = ({ history }) => {
    const getVerificationIcon = (type: string) => {
        switch (type) {
            case 'mobile':
                return <Smartphone className="w-4 h-4" />;
            case 'email':
                return <Mail className="w-4 h-4" />;
            case 'identity':
            case 'document':
                return <FileText className="w-4 h-4" />;
            case 'biometric':
                return <Fingerprint className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const getVerificationLabel = (type: string): string => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    if (history.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Verification History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No verification history available
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Verification History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                            <div className={`p-2 rounded-full ${item.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {getVerificationIcon(item.verificationType)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                        {getVerificationLabel(item.verificationType)} Verification
                                    </span>
                                    {item.success ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-600" />
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                        {formatDistanceToNow(new Date(item.attemptedAt), { addSuffix: true })}
                                    </span>
                                </div>

                                {item.metadata && (
                                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                        {item.metadata.verificationMethod && (
                                            <p>Method: {item.metadata.verificationMethod}</p>
                                        )}
                                        {item.metadata.documentType && (
                                            <p>Document: {item.metadata.documentType}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Badge variant={item.success ? 'default' : 'destructive'} className="shrink-0">
                                {item.success ? 'Success' : 'Failed'}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default PlayerVerificationHistory;

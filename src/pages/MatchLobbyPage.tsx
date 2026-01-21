import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDB, Match } from '@/services/mockDatabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin, Trophy, Users, Calendar } from 'lucide-react';
import ScoringPage, { MatchData } from './ScoringPage';

// Define the shape (using the shared interface from mockDB or cricket types basically)
// We will rely on the shared Match interface from mockDB
import { Match as MatchType } from '@/services/mockDatabase';

interface MatchDBRow extends MatchType { } // Alias for compatibility with existing code structure if needed

// Helper to map DB response to ScoringPage MatchData
const mapMatchData = (data: MatchType): MatchData => ({
    team1: { id: data.team1_id || '1', name: data.team1_name, logo: '', players: [], captainId: '', createdAt: new Date() },
    team2: { id: data.team2_id || '2', name: data.team2_name, logo: '', players: [], captainId: '', createdAt: new Date() },
    venue: data.ground_name || data.city || 'Unknown Venue',
    overs: data.overs || 20,
    tossWinner: { id: (data.toss_winner === data.team1_name ? data.team1_id : data.team2_id) || '1', name: data.toss_winner || data.team1_name, logo: '', players: [], captainId: '', createdAt: new Date() },
    tossDecision: (data.toss_decision as 'bat' | 'bowl') || 'bat',
});

export default function MatchLobbyPage() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [isScoring, setIsScoring] = useState(false);

    // Use state directly since mockDB is sync
    const [match, setMatch] = useState<MatchType | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    const loadMatch = () => {
        setIsLoading(true);
        const found = mockDB.getMatch(matchId || '');
        setMatch(found);
        setIsLoading(false);
    };

    // Load on mount
    React.useEffect(() => {
        loadMatch();
    }, [matchId]);

    const refetch = async () => loadMatch(); // Mocking refetch for compat


    if (isLoading) return <div className="p-4 text-center">Loading match details...</div>;
    if (!match) return <div className="p-4 text-center">Match not found</div>;

    // Handle Match Completion
    const handleMatchCompletion = async (summary: any) => {
        try {
            if (!match) return;

            mockDB.updateMatch(match.id, {
                status: 'completed',
                result: summary.result,
                winner_name: summary.winner?.name
            });

            // Auto-download CSV on completion
            const balls = mockDB.getBalls(match.id);
            if (balls.length > 0) {
                // Determine file name
                const fileName = `${match.team1_name}_vs_${match.team2_name}_${new Date().toISOString().split('T')[0]}.csv`;

                // We might want to flatten the data or just dump the balls
                // For better UX, let's map it to something readable
                const exportData = balls.map(b => ({
                    Over: b.over_number,
                    Ball: b.ball_number,
                    Batsman: b.batsman_name,
                    Bowler: b.bowler_name,
                    Runs: b.runs_scored,
                    Extras: b.extras_type || '-',
                    Wicket: b.is_wicket ? (b.wicket_type || 'Yes') : '-'
                }));

                // Dynamically import to avoid circular dependency issues if any, or just use the utility
                // Assuming imports are fixed at top, but we need to import downloadCSV
                const { downloadCSV } = await import('@/utils/csvExport');
                downloadCSV(exportData, fileName);
                toast.success('Match saved and Scorecard downloaded!');
            } else {
                toast.success('Match completed!');
            }

            navigate('/matches');
        } catch (e: any) {
            toast.error('Error saving match result: ' + e.message);
        }
    };

    // Render Scoring Page if Live or scoring started
    if (isScoring || match.status === 'live') {
        return (
            <ScoringPage
                onBack={() => setIsScoring(false)}
                onEndMatch={handleMatchCompletion}
                matchId={match.id}
                matchData={mapMatchData({
                    ...match,
                    toss_winner_id: match.toss_winner || match.team1_id,
                    toss_decision: match.toss_decision || 'bat'
                })}
            />
        );
    }

    // Handle Start Match
    const handleStartMatch = async () => {
        try {
            if (!match) return;

            mockDB.updateMatch(match.id, {
                status: 'live',
                toss_winner: match.team1_name,
                toss_decision: 'bat' // Mock toss default
            });

            await refetch();
            setIsScoring(true);
            toast.success('Match Started!');
        } catch (e: any) {
            toast.error('Error starting match: ' + e.message);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <Button variant="ghost" className="mb-4" onClick={() => navigate('/matches')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to History
            </Button>

            <Card className="max-w-lg mx-auto">
                <CardHeader className="text-center border-b">
                    <Badge className="mx-auto mb-2 w-fit" variant={match.status === 'scheduled' ? 'secondary' : 'default'}>
                        {match.status.toUpperCase()}
                    </Badge>
                    <div className="flex justify-between items-center px-4">
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{match.team1_name}</h2>
                        </div>
                        <div className="text-muted-foreground font-bold">VS</div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{match.team2_name}</h2>
                        </div>
                    </div>
                    <CardTitle className="mt-4 text-lg hidden">Match Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(match.match_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(match.match_date).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{match.ground_name || 'Ground not set'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-muted-foreground" />
                            <span className="capitalize">{match.match_type} Match</span>
                        </div>
                    </div>

                    {match.status === 'scheduled' && (
                        <Button className="w-full h-12 text-lg" onClick={handleStartMatch}>
                            Start Match / Toss
                        </Button>
                    )}

                    {match.status === 'completed' && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                            Match Completed. Result: {match.result || 'No result available'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}




import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SendChallengeDialog } from './SendChallengeDialog';
import { ChallengeCard } from './ChallengeCard';
import { mockDB } from '@/services/mockDatabase';
import { Challenge } from '@/types/cricket';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const ChallengeDashboard = () => {
    // Mock current user's team ID. In real app, this comes from context/auth
    // Assuming the user is captain of the first team found or a specific ID
    const [myTeamId, setMyTeamId] = useState<string>('');
    const [sentChallenges, setSentChallenges] = useState<Challenge[]>([]);
    const [receivedChallenges, setReceivedChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching user's team
        // For verify: We'll grab the first team created by a user, or just pick '1' (CSK)
        const teams = mockDB.getTeams();
        if (teams.length > 0) {
            setMyTeamId(teams[0].id); // Default to first team for demo
        }
        loadChallenges(teams[0]?.id || '1');
    }, []);

    const loadChallenges = (teamId: string) => {
        if (!teamId) return;
        setLoading(true);
        const { sent, received } = mockDB.getTeamChallenges(teamId);
        setSentChallenges(sent);
        setReceivedChallenges(received);
        setLoading(false);
    };

    const handleRefresh = () => {
        loadChallenges(myTeamId);
    };

    if (!myTeamId) return <div className="p-8 text-center">Loading team data...</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Match Challenges
                    </h1>
                    <p className="text-muted-foreground">Manage match requests with other local teams</p>
                </div>
                <SendChallengeDialog currentTeamId={myTeamId} onChallengeSent={handleRefresh} />
            </div>

            <Tabs defaultValue="received" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="received" className="flex items-center gap-2">
                        <ArrowDownLeft className="h-4 w-4" /> Received
                        <span className="ml-1 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">
                            {receivedChallenges.filter(c => c.status === 'pending').length}
                        </span>
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4" /> Sent
                        <span className="ml-1 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">
                            {sentChallenges.length}
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="received" className="space-y-4">
                    {receivedChallenges.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">No challenges received yet.</p>
                        </div>
                    ) : (
                        receivedChallenges.map(challenge => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                isReceived={true}
                                onStatusChange={handleRefresh}
                            />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="sent" className="space-y-4">
                    {sentChallenges.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                            <p className="text-muted-foreground">You haven't sent any challenges yet.</p>
                        </div>
                    ) : (
                        sentChallenges.map(challenge => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                isReceived={false}
                                onStatusChange={handleRefresh}
                            />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ChallengeDashboard;

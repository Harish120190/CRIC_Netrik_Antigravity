import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockDB, User } from '@/services/mockDatabase';
import Header from '@/components/layout/Header';
import PlayerCard from '@/components/network/PlayerCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const NetworkPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('discover');
    const [searchQuery, setSearchQuery] = useState('');
    const [players, setPlayers] = useState<User[]>([]);

    // Get data directly from mockDB for now, but ideally through a service
    // Filtering based on active tab
    useEffect(() => {
        const allUsers = mockDB.getUsers();

        let filtered = allUsers;

        if (activeTab === 'following' && user) {
            filtered = allUsers.filter(u => user.following?.includes(u.id));
        } else if (activeTab === 'followers' && user) {
            filtered = allUsers.filter(u => user.followers?.includes(u.id));
        } else {
            // Discover: Show everyone except me
            filtered = allUsers.filter(u => u.id !== user?.id);
        }

        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.mobile.includes(searchQuery)
            );
        }

        setPlayers(filtered);
    }, [activeTab, searchQuery, user]); // React to user changes (follows/unfollows)

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="Network" showSearch={false} />

            <main className="container max-w-lg mx-auto p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search players by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="discover">Discover</TabsTrigger>
                        <TabsTrigger value="following">Following</TabsTrigger>
                        <TabsTrigger value="followers">Followers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="discover" className="mt-4 space-y-3">
                        {players.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No players found.</p>
                        ) : (
                            players.map(player => (
                                <PlayerCard key={player.id} player={player} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="following" className="mt-4 space-y-3">
                        {players.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <p>You aren't following anyone yet.</p>
                                <button
                                    className="text-primary hover:underline mt-2"
                                    onClick={() => setActiveTab('discover')}
                                >
                                    Find players to follow
                                </button>
                            </div>
                        ) : (
                            players.map(player => (
                                <PlayerCard key={player.id} player={player} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="followers" className="mt-4 space-y-3">
                        {players.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No followers yet.</p>
                        ) : (
                            players.map(player => (
                                <PlayerCard key={player.id} player={player} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default NetworkPage;

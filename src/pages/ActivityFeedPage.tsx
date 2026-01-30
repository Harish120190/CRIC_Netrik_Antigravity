import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FeedService, FeedItem } from '@/services/FeedService';
import Header from '@/components/layout/Header';
import FeedCard from '@/components/feed/FeedCard';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ActivityFeedPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            // Simulate network delay
            setTimeout(() => {
                const items = FeedService.getFeedForUser(user.id);
                setFeedItems(items);
                setLoading(false);
            }, 800);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-lg font-semibold mb-2">Sign in to view your feed</h2>
                <p className="text-muted-foreground mb-4">See updates from players you follow.</p>
                <Button onClick={() => navigate('/auth/signin')}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Header title="Activity Feed" showSearch={false} />

            <main className="container max-w-lg mx-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : feedItems.length === 0 ? (
                    <div className="text-center py-12 px-4 border rounded-xl border-dashed">
                        <h3 className="text-lg font-medium">Your feed is empty</h3>
                        <p className="text-muted-foreground mt-1 mb-4">Follow players to see their updates here.</p>
                        <Button onClick={() => navigate('/network')}>Find Players to Follow</Button>
                    </div>
                ) : (
                    feedItems.map(item => (
                        <FeedCard key={item.id} item={item} />
                    ))
                )}
            </main>
        </div>
    );
};

export default ActivityFeedPage;

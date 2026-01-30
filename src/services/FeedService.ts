import { mockDB, User, Match } from './mockDatabase';

export interface FeedItem {
    id: string;
    type: 'match_result' | 'milestone_50' | 'milestone_100' | 'milestone_5w' | 'tournament_win';
    actorId: string;
    actorName: string;
    actorAvatar?: string; // For future use
    timestamp: string;
    content: {
        title: string;
        description: string;
        stats?: string;
        matchId?: string;
    };
    metrics: {
        likes: number;
        comments: number;
    };
}

export const FeedService = {
    getFeedForUser: (currentUserId: string): FeedItem[] => {
        const user = mockDB.getUsers().find(u => u.id === currentUserId);
        if (!user) return [];

        const followingIds = user.following || [];
        // Include self in feed? Maybe not for now, or maybe yes for "My Activity"
        // Let's include following + data from the mock DB

        const feedItems: FeedItem[] = [];
        const matches = mockDB.getMatches(); // In real app, would filter by Date

        // 1. Generate Match Result Items
        // For every match where a followed friend played
        matches.forEach(match => {
            // Simulating finding which players played in this match
            // In a real DB, we'd query match_players table. here we assume everyone in following list "might" be in a match
            // For the mock, let's just Randomly assign matches to friends to generate content

            // Deterministic mock generation:
            // formatting ID as integer for modulo operations
            const matchIdInt = parseInt(match.id.replace(/-/g, '').substring(0, 8), 16);

            followingIds.forEach(friendId => {
                const friend = mockDB.getUsers().find(u => u.id === friendId);
                if (!friend) return;

                // Mock logic: 30% chance a friend played in a match
                if ((matchIdInt + friend.fullName.length) % 3 === 0) {
                    feedItems.push({
                        id: `feed_match_${match.id}_${friendId}`,
                        type: 'match_result',
                        actorId: friend.id,
                        actorName: friend.fullName,
                        timestamp: match.match_date || match.created_at,
                        content: {
                            title: `played in a match`,
                            description: `${match.team1_name} vs ${match.team2_name} at ${match.ground_name}`,
                            matchId: match.id
                        },
                        metrics: {
                            likes: (matchIdInt % 50),
                            comments: (matchIdInt % 10)
                        }
                    });
                }
            });
        });

        // 2. Generate Milestone Items (Mocked)
        followingIds.forEach(friendId => {
            const friend = mockDB.getUsers().find(u => u.id === friendId);
            if (!friend) return;

            // Mock a 50 runs milestone
            feedItems.push({
                id: `feed_milestone_50_${friendId}`,
                type: 'milestone_50',
                actorId: friend.id,
                actorName: friend.fullName,
                timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
                content: {
                    title: 'scored a half-century!',
                    description: 'Smashed 53 off 28 balls in the weekend league.',
                    stats: '53 (28)'
                },
                metrics: {
                    likes: 24,
                    comments: 5
                }
            });
        });

        // Sort by timestamp desc
        return feedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    likeItem: (itemId: string, userId: string) => {
        // Persist to local storage
        const key = `feed_likes_${userId}`;
        const likes = JSON.parse(localStorage.getItem(key) || '[]');
        if (!likes.includes(itemId)) {
            likes.push(itemId);
            localStorage.setItem(key, JSON.stringify(likes));
            return true;
        }
        return false; // Already liked
    },

    hasLiked: (itemId: string, userId: string) => {
        const key = `feed_likes_${userId}`;
        const likes = JSON.parse(localStorage.getItem(key) || '[]');
        return likes.includes(itemId);
    }
};

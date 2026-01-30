import React, { useState } from 'react';
import { FeedItem, FeedService } from '@/services/FeedService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Award, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface FeedCardProps {
    item: FeedItem;
}

const FeedCard: React.FC<FeedCardProps> = ({ item }) => {
    const { user } = useAuth();
    const [liked, setLiked] = useState(user ? FeedService.hasLiked(item.id, user.id) : false);
    const [likesCount, setLikesCount] = useState(item.metrics.likes);

    const handleLike = () => {
        if (!user) return;
        if (!liked) {
            FeedService.likeItem(item.id, user.id);
            setLiked(true);
            setLikesCount(prev => prev + 1);
            toast.success('Liked activity!');
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href); // Mock share link
        toast.success('Link copied to clipboard');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderContent = () => {
        if (item.type.includes('milestone')) {
            return (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-amber-100 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-amber-900">{item.content.title}</h4>
                    </div>
                    <p className="text-amber-800 text-sm mb-2">{item.content.description}</p>
                    {item.content.stats && (
                        <div className="text-2xl font-black text-amber-600">{item.content.stats}</div>
                    )}
                </div>
            );
        }

        // Match Result
        return (
            <div className="bg-muted/30 p-3 rounded-lg border mb-2">
                <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">{item.content.title}</h4>
                </div>
                <p className="text-sm text-foreground">{item.content.description}</p>
            </div>
        );
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={item.actorAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {getInitials(item.actorName)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-semibold text-sm truncate">{item.actorName}</span>
                        <span className="text-muted-foreground text-xs">• {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-2">
                {renderContent()}
            </CardContent>

            <CardFooter className="px-2 py-2 border-t bg-muted/10 flex justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
                    onClick={handleLike}
                >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    <span className="text-xs">{likesCount} Likes</span>
                </Button>

                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{item.metrics.comments} Comments</span>
                </Button>

                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs">Share</span>
                </Button>
            </CardFooter>
        </Card>
    );
};

export default FeedCard;

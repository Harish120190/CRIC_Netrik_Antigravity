import React from 'react';
import { User, mockDB } from '@/services/mockDatabase'; // Import mockDB for getting stats
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCheck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlayerCardProps {
    player: User;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
    const { user, followUser, unfollowUser } = useAuth();
    const navigate = useNavigate();

    const isFollowing = user?.following?.includes(player.id);
    const isMe = user?.id === player.id;

    const stats = mockDB.getPlayerStats(player.id)[0] || { matches: 0, runs: 0, wickets: 0 };

    const handleFollowAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFollowing) {
            unfollowUser(player.id);
        } else {
            followUser(player.id);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Card
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/profile/${player.id}`)}
        >
            <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(player.fullName)}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <h3 className="font-semibold truncate">{player.fullName}</h3>
                        {player.verificationBadge === 'blue_tick' && (
                            <Shield className="h-3 w-3 text-blue-500 fill-blue-500" />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                        {player.playerRole || 'Cricketer'}
                    </p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{stats.matches} Matches</span>
                        <span>{stats.runs} Runs</span>
                        <span>{stats.wickets} Wkts</span>
                    </div>
                </div>

                {!isMe && (
                    <Button
                        size="sm"
                        variant={isFollowing ? "secondary" : "default"}
                        className={isFollowing ? "text-muted-foreground" : ""}
                        onClick={handleFollowAction}
                    >
                        {isFollowing ? (
                            <UserCheck className="h-4 w-4" />
                        ) : (
                            <UserPlus className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default PlayerCard;

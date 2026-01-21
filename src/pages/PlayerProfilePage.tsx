import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, Award, UserPlus, UserCheck, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayerStats, PlayerStats } from '@/hooks/usePlayerStats';
import { useUserBadges, UserBadge } from '@/hooks/useBadges';
import { useFollowing } from '@/hooks/useSocial';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PlayerProfilePageProps {
  onNavigate: (path: string) => void;
}

interface PlayerProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({ onNavigate }) => {
  const { playerId } = useParams<{ playerId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const { stats, isLoading: statsLoading } = usePlayerStats(playerId);
  const { userBadges, isLoading: badgesLoading } = useUserBadges(playerId);
  const { followUser, unfollowUser, isFollowingUser, followersCount, followingCount } = useFollowing(playerId);

  const isOwnProfile = user?.id === playerId;
  const isFollowing = playerId ? isFollowingUser(playerId) : false;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!playerId) return;
      
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', playerId)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [playerId]);

  const handleFollowToggle = async () => {
    if (!playerId) return;
    if (isFollowing) {
      await unfollowUser(playerId);
    } else {
      await followUser(playerId);
    }
  };

  const StatCard: React.FC<{ label: string; value: number | string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-muted/50 rounded-lg p-3 text-center">
      {icon && <div className="mx-auto mb-1">{icon}</div>}
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="gradient-pitch h-32" />
        <div className="px-4 -mt-16 max-w-lg mx-auto">
          <div className="flex flex-col items-center">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-6 w-32 mt-3" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Player not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="gradient-pitch h-32 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 text-primary-foreground hover:bg-white/20"
          onClick={() => onNavigate(-1 as any)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-primary-foreground hover:bg-white/20"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Profile Card */}
      <div className="px-4 -mt-16 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl shadow-elevated p-6">
          <div className="flex flex-col items-center -mt-16">
            <Avatar className="w-24 h-24 border-4 border-card shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {profile.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-xl font-bold text-foreground mt-3">{profile.full_name}</h1>
            
            {/* Follow Stats */}
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="text-center">
                <p className="font-semibold text-foreground">{followersCount}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{followingCount}</p>
                <p className="text-muted-foreground">Following</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{stats?.matches || 0}</p>
                <p className="text-muted-foreground">Matches</p>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && user && (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                className="mt-4 gap-2"
                onClick={handleFollowToggle}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Tabs */}
        <Tabs defaultValue="batting" className="mt-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="batting">Batting</TabsTrigger>
            <TabsTrigger value="bowling">Bowling</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="batting" className="mt-4">
            {statsLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Runs" value={stats.runs} icon={<Trophy className="w-5 h-5 text-primary" />} />
                <StatCard label="Average" value={stats.average || '0.00'} />
                <StatCard label="Strike Rate" value={stats.strike_rate || '0.00'} />
                <StatCard label="Highest" value={stats.highest_score} />
                <StatCard label="50s" value={stats.fifties} />
                <StatCard label="100s" value={stats.hundreds} />
                <StatCard label="4s" value={stats.fours} />
                <StatCard label="6s" value={stats.sixes} />
                <StatCard label="Innings" value={stats.innings} />
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No batting stats yet</p>
            )}
          </TabsContent>

          <TabsContent value="bowling" className="mt-4">
            {statsLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Wickets" value={stats.wickets} icon={<Target className="w-5 h-5 text-destructive" />} />
                <StatCard label="Economy" value={stats.economy || '0.00'} />
                <StatCard label="Average" value={stats.bowling_average || '0.00'} />
                <StatCard label="Best" value={`${stats.best_bowling_wickets}/${stats.best_bowling_runs}`} />
                <StatCard label="Maidens" value={stats.maidens} />
                <StatCard label="Overs" value={stats.overs_bowled} />
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No bowling stats yet</p>
            )}
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            {badgesLoading ? (
              <div className="grid grid-cols-4 gap-3">
                {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
              </div>
            ) : userBadges.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {userBadges.map((ub) => (
                  <div key={ub.id} className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">{ub.badge.icon}</div>
                    <p className="text-xs font-medium line-clamp-2">{ub.badge.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No badges earned yet</p>
                <p className="text-sm">Play matches to earn badges!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PlayerProfilePage;

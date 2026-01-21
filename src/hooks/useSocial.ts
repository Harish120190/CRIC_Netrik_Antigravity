import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string | null;
  following_team_id: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  match_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  likes_count: number;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
  replies?: Comment[];
  isLiked?: boolean;
}

export function useFollowing(userId?: string) {
  const [following, setFollowing] = useState<Follow[]>([]);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchFollowData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get who this user is following
      const { data: followingData } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', userId);

      // Get who follows this user
      const { data: followersData } = await supabase
        .from('follows')
        .select('*')
        .eq('following_id', userId);

      setFollowing(followingData || []);
      setFollowers(followersData || []);
    } catch (err) {
      console.error('Error fetching follow data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const followUser = async (targetUserId: string) => {
    if (!user) return;

    const { error } = await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetUserId,
    });

    if (!error) {
      await fetchFollowData();
    }
    return !error;
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId);

    if (!error) {
      await fetchFollowData();
    }
    return !error;
  };

  const followTeam = async (teamId: string) => {
    if (!user) return;

    const { error } = await supabase.from('follows').insert({
      follower_id: user.id,
      following_team_id: teamId,
    });

    if (!error) {
      await fetchFollowData();
    }
    return !error;
  };

  const isFollowingUser = (targetUserId: string) => {
    return following.some((f) => f.following_id === targetUserId);
  };

  const isFollowingTeam = (teamId: string) => {
    return following.some((f) => f.following_team_id === teamId);
  };

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  return {
    following,
    followers,
    isLoading,
    followUser,
    unfollowUser,
    followTeam,
    isFollowingUser,
    isFollowingTeam,
    followingCount: following.length,
    followersCount: followers.length,
  };
}

export function useMatchComments(matchId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = useCallback(async () => {
    if (!matchId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('match_comments')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('match_id', matchId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment: any) => {
          const { data: replies } = await supabase
            .from('match_comments')
            .select(`
              *,
              profiles:user_id (
                full_name,
                avatar_url
              )
            `)
            .eq('parent_id', comment.id)
            .order('created_at');

          // Check if current user liked this comment
          let isLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('comment_likes')
              .select('id')
              .eq('comment_id', comment.id)
              .eq('user_id', user.id)
              .single();
            isLiked = !!likeData;
          }

          return {
            ...comment,
            user: comment.profiles,
            replies: (replies || []).map((r: any) => ({
              ...r,
              user: r.profiles,
            })),
            isLiked,
          };
        })
      );

      setComments(commentsWithReplies);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, user]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user || !matchId) return;

    const { error } = await supabase.from('match_comments').insert({
      match_id: matchId,
      user_id: user.id,
      content,
      parent_id: parentId || null,
    });

    if (!error) {
      await fetchComments();
    }
    return !error;
  };

  const likeComment = async (commentId: string) => {
    if (!user) return;

    const { error } = await supabase.from('comment_likes').insert({
      comment_id: commentId,
      user_id: user.id,
    });

    if (!error) {
      // Update likes count inline
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        await supabase
          .from('match_comments')
          .update({ likes_count: (comment.likes_count || 0) + 1 })
          .eq('id', commentId);
      }
      await fetchComments();
    }
  };

  const unlikeComment = async (commentId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchComments();
    }
  };

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`comments-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_comments',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchComments, matchId]);

  return {
    comments,
    isLoading,
    addComment,
    likeComment,
    unlikeComment,
  };
}

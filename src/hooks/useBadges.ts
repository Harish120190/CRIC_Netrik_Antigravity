import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold: number | null;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  match_id: string | null;
  earned_at: string;
  badge: Badge;
}

export function useBadges() {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('category');

      if (!error && data) {
        setAllBadges(data);
      }
      setIsLoading(false);
    };

    fetchBadges();
  }, []);

  return { allBadges, isLoading };
}

export function useUserBadges(userId?: string) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchUserBadges = async () => {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badge_id (*)
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (!error && data) {
        setUserBadges(data.map((ub: any) => ({
          ...ub,
          badge: ub.badge,
        })));
      }
      setIsLoading(false);
    };

    fetchUserBadges();
  }, [userId]);

  return { userBadges, isLoading };
}

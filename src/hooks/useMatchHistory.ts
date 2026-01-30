import { useState, useEffect } from 'react';
import { mockDB, Match } from '@/services/mockDatabase';

export interface MatchFilters {
  search: string;
  status: 'all' | 'scheduled' | 'live' | 'completed';
  venue: string;
  team: string;
  dateFrom: string;
  dateTo: string;
  ballType: string;
}

export interface MatchHistoryItem extends Match {
  // Using the new mockDB match type directly which includes team names
  // but for compatibility with existing UI which might expect other fields:
  // We can addcomputed fields here if needed.
  innings?: any[]; // MockDB doesn't query innings complexity yet
}

export const useMatchHistory = (filters: Partial<MatchFilters>) => {
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [venues, setVenues] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    const fetchMatches = () => {
      setIsLoading(true);
      try {
        const allMatches = mockDB.getMatches();

        // Client-side filtering
        let filtered = allMatches;

        if (filters.status && filters.status !== 'all') {
          filtered = filtered.filter(m => m.status === filters.status);
        }

        if (filters.search) {
          const q = filters.search.toLowerCase();
          filtered = filtered.filter(m =>
            m.team1_name.toLowerCase().includes(q) ||
            m.team2_name.toLowerCase().includes(q) ||
            m.ground_name.toLowerCase().includes(q)
          );
        }

        if (filters.venue) {
          filtered = filtered.filter(m => m.ground_name === filters.venue);
        }

        if (filters.team) {
          filtered = filtered.filter(m => m.team1_name === filters.team || m.team2_name === filters.team);
        }

        if (filters.ballType && filters.ballType !== 'all') {
          filtered = filtered.filter(m => m.ball_type === filters.ballType);
        }

        // Sort desc
        filtered.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

        // Extract unique values for filters
        const uniqueVenues = Array.from(new Set(allMatches.map(m => m.ground_name))).filter(Boolean);
        const uniqueTeams = Array.from(new Set(allMatches.flatMap(m => [m.team1_name, m.team2_name]))).filter(Boolean);

        setMatches(filtered);
        setVenues(uniqueVenues);
        setTeams(uniqueTeams);
      } catch (err) {
        console.error("Error fetching local matches", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [filters?.status, filters?.venue, filters?.dateFrom, filters?.dateTo, filters?.search, filters?.team, filters?.ballType]);

  return { matches, isLoading, venues, teams };
}

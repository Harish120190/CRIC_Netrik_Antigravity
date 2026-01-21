
import { Team } from '@/types/cricket';

// Define types locally for the mock DB if not shared yet
export interface Match {
    id: string;
    team1_name: string;
    team2_name: string;
    team1_id?: string;
    team2_id?: string;
    item_type?: string;
    match_type: string;
    ball_type: string;
    overs: number;
    match_date: string;
    match_time: string;
    ground_name: string;
    city: string;
    winning_prize?: string;
    match_fee?: string;
    status: 'scheduled' | 'live' | 'completed' | 'abandoned';
    result?: string;
    winner_name?: string;
    toss_winner?: string;
    toss_decision?: 'bat' | 'bowl';
    created_at: string;
}

export interface Ball {
    id: string;
    match_id: string;
    innings_no: number;
    over_number: number;
    ball_number: number;
    bowler_name: string;
    batsman_name: string;
    runs_scored: number;
    extras_type?: string | null;
    extras_runs: number;
    is_wicket: boolean;
    wicket_type?: string;
    player_out_name?: string;
    created_at: string;
}

const STORAGE_KEYS = {
    MATCHES: 'cric_hub_matches',
    TEAMS: 'cric_hub_teams',
    BALLS: 'cric_hub_balls',
};

export const mockDB = {
    // --- MATCHES ---
    getMatches: (): Match[] => {
        const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
        return data ? JSON.parse(data) : [];
    },

    getMatch: (id: string): Match | undefined => {
        const matches = mockDB.getMatches();
        return matches.find((m) => m.id === id);
    },

    createMatch: (match: Omit<Match, 'id' | 'created_at' | 'status'>): Match => {
        const matches = mockDB.getMatches();
        const newMatch: Match = {
            ...match,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            status: 'scheduled',
        };
        matches.push(newMatch);
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
        return newMatch;
    },

    updateMatch: (id: string, updates: Partial<Match>): Match | null => {
        const matches = mockDB.getMatches();
        const index = matches.findIndex((m) => m.id === id);
        if (index === -1) return null;

        matches[index] = { ...matches[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
        return matches[index];
    },

    // --- TEAMS (Mocking the fetch from DB) ---
    getTeams: (): { id: string; name: string }[] => {
        // Return some default teams + others if we stored them
        // For MVP just return hardcoded + any from localstorage if we implemented team creation
        return [
            { id: '1', name: 'Chennai Super Kings' },
            { id: '2', name: 'Mumbai Indians' },
            { id: '3', name: 'Royal Challengers Bangalore' },
            { id: '4', name: 'Kolkata Knight Riders' },
        ];
    },

    // --- BALLS (Scoring) ---
    getBalls: (matchId: string): Ball[] => {
        const data = localStorage.getItem(STORAGE_KEYS.BALLS);
        const allBalls: Ball[] = data ? JSON.parse(data) : [];
        return allBalls.filter((b) => b.match_id === matchId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    },

    saveBall: (ball: Omit<Ball, 'id' | 'created_at'>): Ball => {
        const data = localStorage.getItem(STORAGE_KEYS.BALLS);
        const allBalls: Ball[] = data ? JSON.parse(data) : [];

        const newBall: Ball = {
            ...ball,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
        };

        allBalls.push(newBall);
        localStorage.setItem(STORAGE_KEYS.BALLS, JSON.stringify(allBalls));
        return newBall;
    }
};

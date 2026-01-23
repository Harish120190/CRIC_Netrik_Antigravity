
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

export interface Tournament {
    id: string;
    orgId: string; // Organizer ID
    name: string;
    logo?: string;
    city: string;
    startDate: string;
    endDate: string;
    ballType: 'tennis' | 'leather';
    matchFormat: number; // Overs
    matchType: 'league' | 'knockout' | 'hybrid';
    status: 'draft' | 'active' | 'completed';
    created_at: string;
}

export interface Ground {
    id: string;
    name: string;
    location: string;
    city: string;
    hourlyFee?: number;
}

export interface TournamentTeam {
    id: string;
    tournamentId: string;
    teamId: string;
    status: 'pending' | 'approved' | 'rejected';
    group: string;
    joinedAt: string;
}

const STORAGE_KEYS = {
    MATCHES: 'cric_hub_matches',
    TEAMS: 'cric_hub_teams',
    BALLS: 'cric_hub_balls',
    TOURNAMENTS: 'cric_hub_tournaments',
    GROUNDS: 'cric_hub_grounds',
    TOURN_TEAMS: 'cric_hub_tourn_teams',
    POINTS: 'cric_hub_points'
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

    // --- EXISTING METHODS REPLACED/AUGMENTED BELOW ---

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
    },

    // --- TOURNAMENTS ---
    createTournament: (tournament: Omit<Tournament, 'id' | 'created_at' | 'status'>): Tournament => {
        const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
        const tournaments: Tournament[] = data ? JSON.parse(data) : [];

        const newTournament: Tournament = {
            ...tournament,
            id: crypto.randomUUID(),
            status: 'draft',
            created_at: new Date().toISOString()
        };

        tournaments.push(newTournament);
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
        return newTournament;
    },

    getTournaments: (): Tournament[] => {
        const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
        return data ? JSON.parse(data) : [];
    },

    getTournament: (id: string): Tournament | undefined => {
        const tournaments = mockDB.getTournaments();
        return tournaments.find(t => t.id === id);
    },

    // --- GROUNDS ---
    addGround: (ground: Omit<Ground, 'id'>): Ground => {
        const data = localStorage.getItem(STORAGE_KEYS.GROUNDS);
        const grounds: Ground[] = data ? JSON.parse(data) : [];

        const newGround: Ground = {
            ...ground,
            id: crypto.randomUUID()
        };

        grounds.push(newGround);
        localStorage.setItem(STORAGE_KEYS.GROUNDS, JSON.stringify(grounds));
        return newGround;
    },

    getGrounds: (): Ground[] => {
        const data = localStorage.getItem(STORAGE_KEYS.GROUNDS);
        return data ? JSON.parse(data) : [];
    },

    // --- TOURNAMENT TEAMS ---
    registerTeamForTournament: (teamId: string, tournamentId: string): TournamentTeam => {
        const data = localStorage.getItem(STORAGE_KEYS.TOURN_TEAMS);
        const tournTeams: TournamentTeam[] = data ? JSON.parse(data) : [];

        const newEntry: TournamentTeam = {
            id: crypto.randomUUID(),
            teamId,
            tournamentId,
            status: 'pending',
            group: 'A', // Default group
            joinedAt: new Date().toISOString()
        };

        tournTeams.push(newEntry);
        localStorage.setItem(STORAGE_KEYS.TOURN_TEAMS, JSON.stringify(tournTeams));
        return newEntry;
    },

    getTournamentTeams: (tournamentId: string): TournamentTeam[] => {
        const data = localStorage.getItem(STORAGE_KEYS.TOURN_TEAMS);
        const all: TournamentTeam[] = data ? JSON.parse(data) : [];
        return all.filter(t => t.tournamentId === tournamentId);
    }
};

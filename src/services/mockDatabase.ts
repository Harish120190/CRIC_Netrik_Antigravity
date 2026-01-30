export const generateUUID = () => Math.random().toString(36).substring(2, 11);

export interface User {
    id: string;
    mobile: string;
    fullName: string;
    email?: string;
    password?: string;
    avatar_url?: string;
    role: 'player' | 'organizer' | 'admin' | 'scorer';
    isMobileVerified: boolean;
    isEmailVerified?: boolean;
    verificationBadge?: 'blue_tick' | 'gold_tick' | 'none';
    following?: string[];
    followers?: string[];
    privacySettings?: {
        profileVisibility: 'public' | 'connections_only' | 'private';
        statsVisibility: 'public' | 'connections_only' | 'private';
    };
    notificationPreferences?: {
        matchStart: boolean;
        wickets: boolean;
        milestones: boolean;
        results: boolean;
        teams: string[]; // List of team IDs
        players: string[]; // List of player IDs
        tournaments: string[]; // List of tournament IDs
    };
    playerRole?: string;
    battingStyle?: string;
    bowlingStyle?: string;
    created_at: string;
}

export interface Team {
    id: string;
    name: string;
    logo_url?: string;
    logo?: string;
    team_code: string;
    owner_id: string;
    created_at: string;
    created_by?: string;
    themeColor?: string;
    secondaryColor?: string;
    players?: string[];
    createdAt?: Date;
}

// Define types locally for the mock DB if not shared yet
export interface Match {
    id: string;
    team1_name: string;
    team2_name: string;
    team1_id?: string;
    team2_id?: string;
    item_type?: string;
    match_type: string;
    ball_type: 'tennis' | 'leather' | 'box' | 'stitch';
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
    scorers?: string[]; // User IDs
    umpires?: string[]; // User IDs
    team1_score?: string;
    team2_score?: string;
    tournament_id?: string;
    round_name?: string; // E.g. 'Quarter Final', 'Round 1'
    group_name?: string; // E.g. 'Group A'
    match_order?: number; // Ordering within a date/round
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
    version: number;
    history?: BallHistoryEntry[];
    created_at: string;
}

export interface BallHistoryEntry {
    version: number;
    changed_by: string; // User ID
    changed_at: string;
    previous_state: Partial<Ball>;
    change_reason?: string;
}

export interface Tournament {
    id: string;
    orgId: string; // Organizer ID
    organizer_id?: string; // Alias for UI compatibility
    name: string;
    logo?: string;
    city: string;
    venue?: string; // Alias for city/location
    startDate: string;
    start_date?: string; // Alias
    endDate: string;
    end_date?: string; // Alias
    ballType: 'tennis' | 'leather' | 'box' | 'stitch';
    matchFormat: number; // Overs
    overs?: number; // Alias
    format?: string; // Alias (e.g. 'T20')
    matchType: 'league' | 'knockout' | 'hybrid';
    status: 'draft' | 'active' | 'completed' | 'upcoming' | 'ongoing'; // Added common statuses
    created_at: string;
    max_teams?: number; // Added field found in UI
    groups?: string[]; // E.g. ['Group A', 'Group B']
    rounds?: string[]; // E.g. ['Quarter Final', 'Semi Final', 'Final']
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
    POINTS: 'cric_hub_points',
    USERS: 'cric_hub_users',
    CHALLENGES: 'cric_hub_challenges'
};

export const mockDB = {
    // --- USERS & AUTH ---
    getUsers: (): User[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.USERS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error parsing users", e);
            return [];
        }
    },

    createUser: (user: Omit<User, 'id' | 'created_at' | 'verificationBadge' | 'isMobileVerified' | 'isEmailVerified' | 'followers' | 'following' | 'privacySettings'>): User => {
        const users = mockDB.getUsers();
        // Check duplicates
        if (users.find(u => u.mobile === user.mobile || u.email === user.email)) {
            throw new Error("User already exists with this mobile or email");
        }

        const newUser: User = {
            ...user,
            id: generateUUID(),
            created_at: new Date().toISOString(),
            isMobileVerified: false,
            isEmailVerified: false,
            verificationBadge: 'none',
            followers: [],
            following: [],
            privacySettings: {
                profileVisibility: 'public',
                statsVisibility: 'public'
            }
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return newUser;
    },

    updateUser: (id: string, updates: Partial<User>): User | null => {
        const users = mockDB.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;

        users[index] = { ...users[index], ...updates };

        // Auto-assign badge logic
        if (users[index].isMobileVerified && users[index].verificationBadge === 'none') {
            users[index].verificationBadge = 'blue_tick';
        }

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return users[index];
    },

    getUserByMobile: (mobile: string): User | undefined => {
        return mockDB.getUsers().find(u => u.mobile === mobile);
    },

    // Networking Methods
    followUser: (currentUserId: string, targetUserId: string): void => {
        const users = mockDB.getUsers();
        const currentUserIndex = users.findIndex(u => u.id === currentUserId);
        const targetUserIndex = users.findIndex(u => u.id === targetUserId);

        if (currentUserIndex === -1 || targetUserIndex === -1) return;

        // Add target to current user's following if not already
        if (!users[currentUserIndex].following) users[currentUserIndex].following = [];
        if (!users[currentUserIndex].following.includes(targetUserId)) {
            users[currentUserIndex].following.push(targetUserId);
        }

        // Add current to target user's followers if not already
        if (!users[targetUserIndex].followers) users[targetUserIndex].followers = [];
        if (!users[targetUserIndex].followers.includes(currentUserId)) {
            users[targetUserIndex].followers.push(currentUserId);
        }

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    unfollowUser: (currentUserId: string, targetUserId: string): void => {
        const users = mockDB.getUsers();
        const currentUserIndex = users.findIndex(u => u.id === currentUserId);
        const targetUserIndex = users.findIndex(u => u.id === targetUserId);

        if (currentUserIndex === -1 || targetUserIndex === -1) return;

        // Remove from following
        if (users[currentUserIndex].following) {
            users[currentUserIndex].following = users[currentUserIndex].following.filter(id => id !== targetUserId);
        }

        // Remove from followers
        if (users[targetUserIndex].followers) {
            users[targetUserIndex].followers = users[targetUserIndex].followers.filter(id => id !== currentUserId);
        }

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    getFollowers: (userId: string): User[] => {
        const users = mockDB.getUsers();
        const user = users.find(u => u.id === userId);
        if (!user || !user.followers) return [];
        return users.filter(u => user.followers.includes(u.id));
    },

    getFollowing: (userId: string): User[] => {
        const users = mockDB.getUsers();
        const user = users.find(u => u.id === userId);
        if (!user || !user.following) return [];
        return users.filter(u => user.following.includes(u.id));
    },

    // --- MATCHES ---
    getMatches: (): Match[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error parsing matches", e);
            return [];
        }
    },

    getMatch: (id: string): Match | undefined => {
        const matches = mockDB.getMatches();
        return matches.find((m) => m.id === id);
    },

    createMatch: (match: Omit<Match, 'id' | 'created_at' | 'status'>): Match => {
        const matches = mockDB.getMatches();
        const newMatch: Match = {
            ...match,
            id: generateUUID(),
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
    getTeams: (): Team[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
            const storedTeams = data ? JSON.parse(data) : [];
            const defaultTeams: Team[] = [
                { id: '1', name: 'Chennai Super Kings', team_code: 'CSK001', owner_id: 'system', created_at: new Date().toISOString() },
                { id: '2', name: 'Mumbai Indians', team_code: 'MI002', owner_id: 'system', created_at: new Date().toISOString() },
                { id: '3', name: 'Royal Challengers Bangalore', team_code: 'RCB003', owner_id: 'system', created_at: new Date().toISOString() },
                { id: '4', name: 'Kolkata Knight Riders', team_code: 'KKR004', owner_id: 'system', created_at: new Date().toISOString() },
            ];
            // Combine default and stored teams
            const allTeams = [...defaultTeams];
            storedTeams.forEach((st: any) => {
                if (!allTeams.find(t => t.id === st.id)) {
                    allTeams.push(st);
                }
            });
            return allTeams;
        } catch (e) {
            console.error("Error parsing teams", e);
            return [];
        }
    },

    createTeam: (name: string): Team => {
        const newTeam: Team = {
            id: generateUUID(),
            name,
            team_code: name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000),
            owner_id: 'current-user-id', // Simplified for mock
            created_at: new Date().toISOString(),
            themeColor: '#3b82f6',
            secondaryColor: '#ffffff',
            players: [],
            createdAt: new Date()
        };
        const teams = mockDB.getTeams();
        teams.push(newTeam);
        // We only save the non-default teams to localStorage to keep it clean, 
        // but for simplicity here we just save everything that's not in the default list
        const defaultIds = ['1', '2', '3', '4'];
        const teamsToSave = teams.filter(t => !defaultIds.includes(t.id));
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teamsToSave));
        return newTeam;
    },

    updateTeam: (id: string, updates: Partial<Team>): Team | null => {
        const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
        const teams: Team[] = data ? JSON.parse(data) : [];
        const index = teams.findIndex(t => t.id === id);
        if (index === -1) return null;

        teams[index] = { ...teams[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
        return teams[index];
    },

    addPlayerToTeam: (teamId: string, playerName: string): Team | null => {
        const team = mockDB.getTeams().find(t => t.id === teamId) as any;
        if (!team) return null;

        const players = team.players || [];
        if (!players.includes(playerName)) {
            players.push(playerName);
            return mockDB.updateTeam(teamId, { players } as any);
        }
        return team;
    },

    removePlayerFromTeam: (teamId: string, playerName: string): Team | null => {
        const team = mockDB.getTeams().find(t => t.id === teamId) as any;
        if (!team) return null;

        const players = (team.players || []).filter((p: string) => p !== playerName);
        return mockDB.updateTeam(teamId, { players } as any);
    },

    // --- BALLS (Scoring) ---
    getBalls: (matchId: string): Ball[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.BALLS);
            const allBalls: Ball[] = data ? JSON.parse(data) : [];
            return allBalls.filter((b) => b.match_id === matchId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } catch (e) {
            console.error("Error parsing balls", e);
            return [];
        }
    },

    // --- EXISTING METHODS REPLACED/AUGMENTED BELOW ---

    saveBall: (ball: Omit<Ball, 'id' | 'created_at' | 'version'> & { version?: number }): Ball => {
        const data = localStorage.getItem(STORAGE_KEYS.BALLS);
        const allBalls: Ball[] = data ? JSON.parse(data) : [];

        const newBall: Ball = {
            version: 1,
            ...ball,
            id: generateUUID(),
            created_at: new Date().toISOString()
        } as Ball;

        allBalls.push(newBall);
        localStorage.setItem(STORAGE_KEYS.BALLS, JSON.stringify(allBalls));
        return newBall;
    },

    updateBallWithAudit: (id: string, updates: Partial<Ball>, userId: string, reason?: string): Ball | null => {
        const data = localStorage.getItem(STORAGE_KEYS.BALLS);
        const allBalls: Ball[] = data ? JSON.parse(data) : [];
        const index = allBalls.findIndex(b => b.id === id);
        if (index === -1) return null;

        const oldBall = allBalls[index];
        const newVersion = (oldBall.version || 1) + 1;

        const historyEntry: BallHistoryEntry = {
            version: oldBall.version || 1,
            changed_by: userId,
            changed_at: new Date().toISOString(),
            previous_state: { ...oldBall },
            change_reason: reason
        };
        // Remove nested history from entry to save space
        if (historyEntry.previous_state.history) {
            delete historyEntry.previous_state.history;
        }

        const updatedBall: Ball = {
            ...oldBall,
            ...updates,
            version: newVersion,
            history: [...(oldBall.history || []), historyEntry]
        };

        allBalls[index] = updatedBall;
        localStorage.setItem(STORAGE_KEYS.BALLS, JSON.stringify(allBalls));
        return updatedBall;
    },

    updateBall: (id: string, updates: Partial<Ball>): Ball | null => {
        const data = localStorage.getItem(STORAGE_KEYS.BALLS);
        const allBalls: Ball[] = data ? JSON.parse(data) : [];
        const index = allBalls.findIndex(b => b.id === id);
        if (index === -1) return null;

        allBalls[index] = { ...allBalls[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.BALLS, JSON.stringify(allBalls));
        return allBalls[index];
    },

    deleteBall: (id: string): boolean => {
        const data = localStorage.getItem(STORAGE_KEYS.BALLS);
        const allBalls: Ball[] = data ? JSON.parse(data) : [];
        const filteredBalls = allBalls.filter(b => b.id !== id);

        if (allBalls.length === filteredBalls.length) return false;

        localStorage.setItem(STORAGE_KEYS.BALLS, JSON.stringify(filteredBalls));
        return true;
    },

    deleteMatch: (id: string): boolean => {
        const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
        const all: Match[] = data ? JSON.parse(data) : [];
        const filtered = all.filter(m => m.id !== id);
        if (all.length === filtered.length) return false;
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(filtered));
        return true;
    },

    // --- TOURNAMENTS ---
    createTournament: (tournament: Omit<Tournament, 'id' | 'created_at' | 'status'>): Tournament => {
        const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
        const tournaments: Tournament[] = data ? JSON.parse(data) : [];

        const newTournament: Tournament = {
            ...tournament,
            id: generateUUID(),
            status: 'draft',
            created_at: new Date().toISOString()
        };

        tournaments.push(newTournament);
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
        return newTournament;
    },

    getTournaments: (): Tournament[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error parsing tournaments", e);
            return [];
        }
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
            id: generateUUID()
        };

        grounds.push(newGround);
        localStorage.setItem(STORAGE_KEYS.GROUNDS, JSON.stringify(grounds));
        return newGround;
    },

    getGrounds: (): Ground[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.GROUNDS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error parsing grounds", e);
            return [];
        }
    },

    // --- TOURNAMENT TEAMS ---
    registerTeamForTournament: (teamId: string, tournamentId: string): TournamentTeam => {
        const data = localStorage.getItem(STORAGE_KEYS.TOURN_TEAMS);
        const tournTeams: TournamentTeam[] = data ? JSON.parse(data) : [];

        const newEntry: TournamentTeam = {
            id: generateUUID(),
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
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TOURN_TEAMS);
            const all: TournamentTeam[] = data ? JSON.parse(data) : [];
            return all.filter(t => t.tournamentId === tournamentId);
        } catch (e) {
            console.error("Error parsing tournament teams", e);
            return [];
        }
    },

    updateTournamentTeam: (id: string, updates: Partial<TournamentTeam>): TournamentTeam | null => {
        const data = localStorage.getItem(STORAGE_KEYS.TOURN_TEAMS);
        const all: TournamentTeam[] = data ? JSON.parse(data) : [];
        const index = all.findIndex(t => t.id === id);
        if (index === -1) return null;

        all[index] = { ...all[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.TOURN_TEAMS, JSON.stringify(all));
        return all[index];
    },

    getTournamentMatches: (tournamentId: string): Match[] => {
        const matches = mockDB.getMatches();
        // This assumes we have a way to link matches to tournaments
        // Let's add tournament_id to the Match interface (implicitly) or use winner_prize as a marker for now
        // Better: filter matches that have some property or just return those with tournament match_type
        return matches.filter(m => m.match_type === 'tournament' || m.match_type === 'league');
    },

    generateFixtures: (tournamentId: string) => {
        const tournament = mockDB.getTournament(tournamentId);
        const teams = mockDB.getTournamentTeams(tournamentId).filter(t => t.status === 'approved');
        if (teams.length < 2) return [];

        const matches: any[] = [];
        const registeredTeams = mockDB.getTeams();
        const matchFormat = tournament?.matchType || 'league';

        if (matchFormat === 'league') {
            // Group-based or simple Round Robin
            const groups = Array.from(new Set(teams.map(t => t.group))).sort();

            groups.forEach(groupName => {
                const groupTeams = teams.filter(t => t.group === groupName);
                for (let i = 0; i < groupTeams.length; i++) {
                    for (let j = i + 1; j < groupTeams.length; j++) {
                        const team1 = registeredTeams.find(t => t.id === groupTeams[i].teamId);
                        const team2 = registeredTeams.find(t => t.id === groupTeams[j].teamId);

                        if (team1 && team2) {
                            matches.push({
                                tournament_id: tournamentId,
                                team1_name: team1.name,
                                team2_name: team2.name,
                                team1_id: team1.id,
                                team2_id: team2.id,
                                match_type: 'tournament',
                                ball_type: tournament?.ballType || 'tennis',
                                overs: tournament?.matchFormat || 20,
                                match_date: tournament?.startDate || new Date().toISOString().split('T')[0],
                                match_time: '14:00',
                                ground_name: tournament?.venue || 'Main Stadium',
                                city: tournament?.city || 'Local City',
                                status: 'scheduled',
                                group_name: groupName,
                                round_name: 'League Stage'
                            });
                        }
                    }
                }
            });
        } else if (matchFormat === 'knockout') {
            // Simple Single Elimination Knockout (Round 1)
            const powerOfTwo = Math.pow(2, Math.floor(Math.log2(teams.length)));
            for (let i = 0; i < powerOfTwo; i += 2) {
                const t1 = registeredTeams.find(t => t.id === teams[i]?.teamId);
                const t2 = registeredTeams.find(t => t.id === teams[i + 1]?.teamId);

                if (t1 && t2) {
                    matches.push({
                        tournament_id: tournamentId,
                        team1_name: t1.name,
                        team2_name: t2.name,
                        team1_id: t1.id,
                        team2_id: t2.id,
                        match_type: 'tournament',
                        ball_type: tournament?.ballType || 'tennis',
                        overs: tournament?.matchFormat || 20,
                        match_date: tournament?.startDate || new Date().toISOString().split('T')[0],
                        match_time: '14:00',
                        ground_name: tournament?.venue || 'Main Stadium',
                        city: tournament?.city || 'Local City',
                        status: 'scheduled',
                        round_name: 'Round 1'
                    });
                }
            }
        }

        matches.forEach(m => mockDB.createMatch(m));
        return matches;
    },

    // --- LEADERBOARD & STATS ---
    getAllBalls: (): Ball[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.BALLS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    getPlayerStats: (userId?: string): any[] => {
        const allBalls = mockDB.getAllBalls();
        const playersMap: Record<string, any> = {};

        allBalls.forEach(ball => {
            const name = ball.batsman_name;
            if (!playersMap[name]) {
                playersMap[name] = {
                    id: name,
                    full_name: name,
                    matches: new Set(),
                    runs: 0,
                    balls_faced: 0,
                    wickets: 0,
                    runs_conceded: 0,
                    balls_bowled: 0,
                    catches: 0
                };
            }
            playersMap[name].matches.add(ball.match_id);
            playersMap[name].runs += ball.runs_scored;
            if (!ball.extras_type || ball.extras_type === 'bye' || ball.extras_type === 'leg-bye') {
                playersMap[name].balls_faced += 1;
            }

            const bowler = ball.bowler_name;
            if (!playersMap[bowler]) {
                playersMap[bowler] = {
                    id: bowler,
                    full_name: bowler,
                    matches: new Set(),
                    runs: 0,
                    balls_faced: 0,
                    wickets: 0,
                    runs_conceded: 0,
                    balls_bowled: 0,
                    catches: 0
                };
            }
            playersMap[bowler].matches.add(ball.match_id);
            playersMap[bowler].runs_conceded += ball.runs_scored + (ball.extras_type === 'wide' || ball.extras_type === 'no-ball' ? 1 : 0);
            if (!ball.extras_type || ball.extras_type === 'bye' || ball.extras_type === 'leg-bye') {
                playersMap[bowler].balls_bowled += 1;
            }
            if (ball.is_wicket && ball.wicket_type !== 'runout') {
                playersMap[bowler].wickets += 1;
            }
        });

        const playerStats = Object.values(playersMap).map(p => ({
            ...p,
            matches: p.matches.size,
            average: p.innings > 0 ? (p.runs / p.innings).toFixed(2) : p.runs,
            economy: p.balls_bowled > 0 ? ((p.runs_conceded / p.balls_bowled) * 6).toFixed(2) : 0
        }));

        if (userId) {
            // For mock, we treat name as ID if userId is just a name
            return playerStats.filter(p => p.id === userId);
        }

        return playerStats;
    },

    getTeamStats: (): any[] => {
        const matches = mockDB.getMatches().filter(m => m.status === 'completed');
        const teamsMap: Record<string, any> = {};

        matches.forEach(m => {
            [m.team1_name, m.team2_name].forEach(name => {
                if (!teamsMap[name]) {
                    teamsMap[name] = {
                        id: name,
                        name: name,
                        matches: 0,
                        won: 0,
                        lost: 0,
                        tied: 0,
                        points: 0
                    };
                }
                teamsMap[name].matches += 1;
                if (m.winner_name === name) {
                    teamsMap[name].won += 1;
                    teamsMap[name].points += 2;
                } else if (m.winner_name === 'Draw' || m.winner_name === 'Tie') {
                    teamsMap[name].tied += 1;
                    teamsMap[name].points += 1;
                } else if (m.winner_name) {
                    teamsMap[name].lost += 1;
                }
            });
        });

        return Object.values(teamsMap).sort((a, b) => b.points - a.points);
    },

    // --- CHALLENGES ---
    getChallenges: (): any[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES || 'cric_hub_challenges');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error parsing challenges", e);
            return [];
        }
    },

    createChallenge: (challenge: Omit<any, 'id' | 'createdAt' | 'status'>): any => {
        const challenges = mockDB.getChallenges();
        const newChallenge = {
            ...challenge,
            id: generateUUID(),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        challenges.push(newChallenge);
        localStorage.setItem(STORAGE_KEYS.CHALLENGES || 'cric_hub_challenges', JSON.stringify(challenges));
        return newChallenge;
    },

    updateChallengeStatus: (id: string, status: 'accepted' | 'rejected' | 'rescheduled', responseNote?: string, newDetails?: any): any | null => {
        const challenges = mockDB.getChallenges();
        const index = challenges.findIndex((c: any) => c.id === id);
        if (index === -1) return null;

        challenges[index].status = status;
        if (responseNote) challenges[index].responseNote = responseNote;
        if (newDetails) {
            challenges[index].matchDetails = { ...challenges[index].matchDetails, ...newDetails };
        }

        localStorage.setItem(STORAGE_KEYS.CHALLENGES || 'cric_hub_challenges', JSON.stringify(challenges));
        return challenges[index];
    },

    getTeamChallenges: (teamId: string): { sent: any[], received: any[] } => {
        const challenges = mockDB.getChallenges();
        return {
            sent: challenges.filter((c: any) => c.senderTeamId === teamId),
            received: challenges.filter((c: any) => c.receiverTeamId === teamId)
        };
    }
};

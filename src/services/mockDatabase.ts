import { Tournament, Match, Team, User, Ball, TournamentTeam, PointsRecord } from '@/types/cricket';
import { FixtureGenerator } from './FixtureGenerator';

// Remove local interfaces that are now in cricket.ts if they duplicate/conflict
// OR just keep them if they are distinct DTOs. 
// For Tournament, we definitely want the shared one.

export const generateUUID = () => Math.random().toString(36).substring(2, 11);

// Retaining User, Team, etc if they are different, but preferably we should unify them all.
// For now, let's just fix Tournament to allow the creation flow to work.

export { type User, type Team, type Match, type Ball, type Tournament };


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
    points_adjustments?: string[]; // Array of PointAdjustment IDs
    rejection_reason?: string;
}

export interface PointAdjustment {
    id: string;
    tournament_id: string;
    team_id: string;
    points_change: number; // Positive or negative
    reason: string;
    category: 'slow_over_rate' | 'code_of_conduct' | 'other';
    adjusted_by: string; // User ID of organizer
    adjusted_at: string; // ISO timestamp
    match_id?: string; // Optional reference to specific match
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
    CHALLENGES: 'cric_hub_challenges',
    POINT_ADJUSTMENTS: 'cric_hub_point_adjustments',
    VERIFICATION_HISTORY: 'cric_hub_verification_history',
    PROXY_FLAGS: 'cric_hub_proxy_flags',
    PLAYER_BANS: 'cric_hub_player_bans',
    TOURNAMENT_PLAYER_STATUS: 'cric_hub_tournament_player_status'
};

export const mockDB = {
    // --- USERS & AUTH ---
    getUsers: (): User[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.USERS);
            const storedUsers = data ? JSON.parse(data) : [];

            // Default admin user
            const adminUser: User = {
                id: 'admin-user-id',
                fullName: 'Admin User',
                email: 'admin@cric.netrik',
                mobile: '9999999999',
                role: 'admin',
                created_at: new Date().toISOString(),
                isMobileVerified: true,
                isEmailVerified: true,
                verificationBadge: 'gold_tick',
                followers: [],
                following: [],
                privacySettings: {
                    profileVisibility: 'public',
                    statsVisibility: 'public'
                }
            };

            // Combine admin and stored users, avoid duplicates
            const allUsers = [adminUser];
            storedUsers.forEach((u: User) => {
                if (u.id !== 'admin-user-id' && u.mobile !== '9999999999') {
                    allUsers.push(u);
                }
            });

            return allUsers;
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

    generateFixtures: (tournamentId: string) => {
        const tournament = mockDB.getTournament(tournamentId);
        if (!tournament) return;

        const teamsRecs = mockDB.getTournamentTeams(tournamentId);
        const approvedTeamIds = teamsRecs.filter(t => t.status === 'approved').map(t => t.teamId);

        // Fetch full team objects
        const allTeams = mockDB.getTeams();
        const tournamentTeams = allTeams.filter(t => approvedTeamIds.includes(t.id));

        if (tournamentTeams.length < 2) return;

        // Use the new Fixture Generator
        // Default to Single Round Robin for now, or fetch from tournament config
        const matches = FixtureGenerator.generateRoundRobin(
            tournamentTeams,
            'single',
            tournamentId,
            undefined,
            new Date(tournament.startDate)
        );

        // Save matches
        const existingData = localStorage.getItem(STORAGE_KEYS.MATCHES);
        const existingMatches: Match[] = existingData ? JSON.parse(existingData) : [];

        // Remove existing future matches for this tournament to avoid dupes if re-generating
        const keptMatches = existingMatches.filter(m => m.tournamentId !== tournamentId || m.status === 'completed');

        const finalMatches = [...keptMatches, ...matches];
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(finalMatches));

        return matches;
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
            // Return only user-created teams from localStorage
            // No default teams to avoid owner_id conflicts
            return storedTeams;
        } catch (e) {
            console.error("Error parsing teams", e);
            return [];
        }
    },

    createTeam: (name: string, owner_id?: string): Team => {
        const newTeam: Team = {
            id: generateUUID(),
            name,
            team_code: name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000),
            owner_id: owner_id || 'current-user-id', // Use provided owner_id or fallback
            created_at: new Date().toISOString(),
            themeColor: '#3b82f6',
            secondaryColor: '#ffffff',
            players: [],
            createdAt: new Date()
        };
        const teams = mockDB.getTeams();
        teams.push(newTeam);
        // Save all teams to localStorage
        localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
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

    updateTournament: (id: string, updates: Partial<Tournament>): Tournament | null => {
        const tournaments = mockDB.getTournaments();
        const index = tournaments.findIndex(t => t.id === id);
        if (index === -1) return null;

        tournaments[index] = { ...tournaments[index], ...updates };
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
        return tournaments[index];
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

    // --- POINT ADJUSTMENTS ---
    addPointAdjustment: (adjustment: Omit<PointAdjustment, 'id' | 'adjusted_at'>): PointAdjustment => {
        const adjustments = mockDB.getPointAdjustments(adjustment.tournament_id);
        const newAdjustment: PointAdjustment = {
            ...adjustment,
            id: generateUUID(),
            adjusted_at: new Date().toISOString()
        };
        adjustments.push(newAdjustment);
        localStorage.setItem(STORAGE_KEYS.POINT_ADJUSTMENTS, JSON.stringify(adjustments));

        // Update TournamentTeam to track this adjustment
        const tournTeams = mockDB.getTournamentTeams(adjustment.tournament_id);
        const teamIndex = tournTeams.findIndex(tt => tt.teamId === adjustment.team_id);
        if (teamIndex !== -1) {
            if (!tournTeams[teamIndex].points_adjustments) {
                tournTeams[teamIndex].points_adjustments = [];
            }
            tournTeams[teamIndex].points_adjustments!.push(newAdjustment.id);
            mockDB.updateTournamentTeam(tournTeams[teamIndex].id, { points_adjustments: tournTeams[teamIndex].points_adjustments });
        }

        return newAdjustment;
    },

    getPointAdjustments: (tournamentId: string): PointAdjustment[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.POINT_ADJUSTMENTS);
            const all: PointAdjustment[] = data ? JSON.parse(data) : [];
            return all.filter(adj => adj.tournament_id === tournamentId);
        } catch (e) {
            console.error("Error parsing point adjustments", e);
            return [];
        }
    },

    getTeamAdjustments: (teamId: string): PointAdjustment[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.POINT_ADJUSTMENTS);
            const all: PointAdjustment[] = data ? JSON.parse(data) : [];
            return all.filter(adj => adj.team_id === teamId);
        } catch (e) {
            console.error("Error parsing point adjustments", e);
            return [];
        }
    },

    deletePointAdjustment: (id: string): boolean => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.POINT_ADJUSTMENTS);
            const all: PointAdjustment[] = data ? JSON.parse(data) : [];
            const filtered = all.filter(adj => adj.id !== id);
            if (all.length === filtered.length) return false;
            localStorage.setItem(STORAGE_KEYS.POINT_ADJUSTMENTS, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error("Error deleting point adjustment", e);
            return false;
        }
    },

    getTeamChallenges: (teamId: string): { sent: any[], received: any[] } => {
        const challenges = mockDB.getChallenges();
        return {
            sent: challenges.filter((c: any) => c.senderTeamId === teamId),
            received: challenges.filter((c: any) => c.receiverTeamId === teamId)
        };
    },

    // --- PROXY PREVENTION SYSTEM ---

    // Verification History
    addVerificationHistory: (userId: string, verificationType: string, success: boolean, metadata?: any): any => {
        const data = localStorage.getItem(STORAGE_KEYS.VERIFICATION_HISTORY);
        const history: any[] = data ? JSON.parse(data) : [];

        const newEntry = {
            id: generateUUID(),
            userId,
            verificationType,
            success,
            attemptedAt: new Date().toISOString(),
            metadata
        };

        history.push(newEntry);
        localStorage.setItem(STORAGE_KEYS.VERIFICATION_HISTORY, JSON.stringify(history));
        return newEntry;
    },

    getVerificationHistory: (userId: string): any[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.VERIFICATION_HISTORY);
            const all: any[] = data ? JSON.parse(data) : [];
            return all.filter(v => v.userId === userId).sort((a, b) =>
                new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
            );
        } catch (e) {
            console.error("Error parsing verification history", e);
            return [];
        }
    },

    // Proxy Flags
    addProxyFlag: (userId: string, severity: string, reason: string, reportedBy: string, tournamentId?: string, evidence?: any): any => {
        const data = localStorage.getItem(STORAGE_KEYS.PROXY_FLAGS);
        const flags: any[] = data ? JSON.parse(data) : [];

        const newFlag = {
            id: generateUUID(),
            userId,
            tournamentId,
            severity,
            reason,
            reportedBy,
            reportedAt: new Date().toISOString(),
            evidence,
            resolved: false
        };

        flags.push(newFlag);
        localStorage.setItem(STORAGE_KEYS.PROXY_FLAGS, JSON.stringify(flags));
        return newFlag;
    },

    getProxyFlags: (userId: string): any[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PROXY_FLAGS);
            const all: any[] = data ? JSON.parse(data) : [];
            return all.filter(f => f.userId === userId).sort((a, b) =>
                new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
            );
        } catch (e) {
            console.error("Error parsing proxy flags", e);
            return [];
        }
    },

    getAllProxyFlags: (): any[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PROXY_FLAGS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error parsing proxy flags", e);
            return [];
        }
    },

    resolveProxyFlag: (flagId: string, resolvedBy: string, notes?: string): any | null => {
        const data = localStorage.getItem(STORAGE_KEYS.PROXY_FLAGS);
        const flags: any[] = data ? JSON.parse(data) : [];
        const index = flags.findIndex(f => f.id === flagId);

        if (index === -1) return null;

        flags[index].resolved = true;
        flags[index].resolvedAt = new Date().toISOString();
        flags[index].resolvedBy = resolvedBy;
        flags[index].resolutionNotes = notes;

        localStorage.setItem(STORAGE_KEYS.PROXY_FLAGS, JSON.stringify(flags));
        return flags[index];
    },

    // Player Bans
    banPlayer: (userId: string, organizerId: string, reason: string, isPermanent: boolean, expiresAt?: string, tournamentId?: string, notes?: string): any => {
        const data = localStorage.getItem(STORAGE_KEYS.PLAYER_BANS);
        const bans: any[] = data ? JSON.parse(data) : [];

        const newBan = {
            id: generateUUID(),
            userId,
            organizerId,
            reason,
            isPermanent,
            bannedAt: new Date().toISOString(),
            expiresAt: isPermanent ? null : expiresAt,
            tournamentId,
            notes,
            appealStatus: 'none'
        };

        bans.push(newBan);
        localStorage.setItem(STORAGE_KEYS.PLAYER_BANS, JSON.stringify(bans));
        return newBan;
    },

    getUserBans: (userId: string): any[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PLAYER_BANS);
            const all: any[] = data ? JSON.parse(data) : [];
            return all.filter(b => b.userId === userId).sort((a, b) =>
                new Date(b.bannedAt).getTime() - new Date(a.bannedAt).getTime()
            );
        } catch (e) {
            console.error("Error parsing player bans", e);
            return [];
        }
    },

    getBannedPlayers: (organizerId: string): any[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PLAYER_BANS);
            const all: any[] = data ? JSON.parse(data) : [];
            const now = new Date();

            return all.filter(b => {
                if (b.organizerId !== organizerId) return false;
                if (b.isPermanent) return true;
                if (!b.expiresAt) return false;
                return new Date(b.expiresAt) > now;
            });
        } catch (e) {
            console.error("Error parsing banned players", e);
            return [];
        }
    },

    isPlayerBanned: (userId: string, organizerId: string): boolean => {
        const bans = mockDB.getBannedPlayers(organizerId);
        return bans.some(b => b.userId === userId);
    },

    removeBan: (banId: string): boolean => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PLAYER_BANS);
            const all: any[] = data ? JSON.parse(data) : [];
            const filtered = all.filter(b => b.id !== banId);

            if (all.length === filtered.length) return false;

            localStorage.setItem(STORAGE_KEYS.PLAYER_BANS, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error("Error removing ban", e);
            return false;
        }
    },

    // Tournament Player Status
    updatePlayerStatus: (userId: string, tournamentId: string, status: string, organizerId: string, reason?: string, notes?: string): any => {
        const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_PLAYER_STATUS);
        const statuses: any[] = data ? JSON.parse(data) : [];

        // Check if status already exists
        const existingIndex = statuses.findIndex(
            s => s.userId === userId && s.tournamentId === tournamentId
        );

        const statusEntry = {
            id: existingIndex >= 0 ? statuses[existingIndex].id : generateUUID(),
            userId,
            tournamentId,
            organizerId,
            status,
            statusChangedAt: new Date().toISOString(),
            statusChangedBy: organizerId,
            reason,
            notes
        };

        if (existingIndex >= 0) {
            statuses[existingIndex] = statusEntry;
        } else {
            statuses.push(statusEntry);
        }

        localStorage.setItem(STORAGE_KEYS.TOURNAMENT_PLAYER_STATUS, JSON.stringify(statuses));
        return statusEntry;
    },

    getPlayerStatus: (userId: string, tournamentId: string): any | null => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_PLAYER_STATUS);
            const all: any[] = data ? JSON.parse(data) : [];
            return all.find(s => s.userId === userId && s.tournamentId === tournamentId) || null;
        } catch (e) {
            console.error("Error getting player status", e);
            return null;
        }
    },

    getUserTournamentStatuses: (userId: string): any[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_PLAYER_STATUS);
            const all: any[] = data ? JSON.parse(data) : [];
            return all.filter(s => s.userId === userId);
        } catch (e) {
            console.error("Error getting user tournament statuses", e);
            return [];
        }
    },

    getTournamentPlayerStatuses: (tournamentId: string): any[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENT_PLAYER_STATUS);
            const all: any[] = data ? JSON.parse(data) : [];
            return all.filter(s => s.tournamentId === tournamentId);
        } catch (e) {
            console.error("Error getting tournament player statuses", e);
            return [];
        }
    }
};

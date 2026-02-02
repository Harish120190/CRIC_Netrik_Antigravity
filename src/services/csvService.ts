import { mockDB } from './mockDatabase';

/**
 * CSV Utility Service
 * Provides read and write operations for all data entities
 */

// Helper function to escape CSV values
const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Helper function to parse CSV line
const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            current += '"';
            i++; // Skip next quote
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
};

// Convert array of objects to CSV string
const arrayToCSV = (data: any[], headers: string[]): string => {
    const headerRow = headers.map(escapeCSV).join(',');
    const dataRows = data.map(item =>
        headers.map(header => escapeCSV(item[header])).join(',')
    );
    return [headerRow, ...dataRows].join('\n');
};

// Convert CSV string to array of objects
const csvToArray = (csv: string, headers: string[]): any[] => {
    const lines = csv.trim().split('\n');
    if (lines.length <= 1) return [];

    // Skip header row
    const dataLines = lines.slice(1);

    return dataLines.map(line => {
        const values = parseCSVLine(line);
        const obj: any = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
};

/**
 * Export Functions - Convert data to CSV
 */

export const exportUsersToCSV = (): string => {
    const users = mockDB.getUsers();
    const headers = ['id', 'name', 'email', 'mobile', 'role', 'city', 'created_at', 'isMobileVerified', 'isEmailVerified', 'verificationBadge'];
    return arrayToCSV(users, headers);
};

export const exportTeamsToCSV = (): string => {
    const teams = mockDB.getTeams();
    const headers = ['id', 'name', 'team_code', 'owner_id', 'created_at', 'themeColor', 'secondaryColor'];
    return arrayToCSV(teams, headers);
};

export const exportTournamentsToCSV = (): string => {
    const tournaments = mockDB.getTournaments();
    const headers = ['id', 'orgId', 'name', 'city', 'venue', 'startDate', 'endDate', 'ballType', 'matchFormat', 'matchType', 'status', 'max_teams', 'created_at'];
    return arrayToCSV(tournaments, headers);
};

export const exportTournamentTeamsToCSV = (tournamentId?: string): string => {
    const tournamentTeams = tournamentId
        ? mockDB.getTournamentTeams(tournamentId)
        : JSON.parse(localStorage.getItem('cric_hub_tournament_teams') || '[]');
    const headers = ['id', 'tournamentId', 'teamId', 'status', 'group', 'joinedAt', 'rejection_reason'];
    return arrayToCSV(tournamentTeams, headers);
};

export const exportMatchesToCSV = (): string => {
    const matches = mockDB.getMatches();
    const headers = ['id', 'team1_id', 'team2_id', 'team1_name', 'team2_name', 'match_type', 'ball_type', 'overs', 'match_date', 'match_time', 'ground_name', 'city', 'status', 'created_at'];
    return arrayToCSV(matches, headers);
};

export const exportGroundsToCSV = (): string => {
    const grounds = mockDB.getGrounds();
    const headers = ['id', 'name', 'location', 'city', 'hourlyFee'];
    return arrayToCSV(grounds, headers);
};

export const exportPlayersToCSV = (): string => {
    const users = mockDB.getUsers();
    const headers = ['id', 'name', 'mobile', 'email', 'city', 'batting_style', 'bowling_style', 'role'];
    return arrayToCSV(users, headers);
};

/**
 * Import Functions - Load CSV data into database
 */

export const importUsersFromCSV = (csv: string): { success: boolean; count: number; errors: string[] } => {
    try {
        const headers = ['id', 'name', 'email', 'mobile', 'role', 'city', 'created_at', 'isMobileVerified', 'isEmailVerified', 'verificationBadge'];
        const users = csvToArray(csv, headers);

        const errors: string[] = [];
        let count = 0;

        users.forEach((user, index) => {
            try {
                if (!user.name || !user.mobile) {
                    errors.push(`Row ${index + 2}: Missing required fields (name, mobile)`);
                    return;
                }

                // Check if user exists
                const existing = mockDB.getUserByMobile(user.mobile);
                if (!existing) {
                    mockDB.createUser({
                        fullName: user.name || 'User',
                        email: user.email,
                        mobile: user.mobile,
                        role: user.role || 'player'
                    });
                    count++;
                }
            } catch (err: any) {
                errors.push(`Row ${index + 2}: ${err.message}`);
            }
        });

        return { success: errors.length === 0, count, errors };
    } catch (err: any) {
        return { success: false, count: 0, errors: [err.message] };
    }
};

export const importTeamsFromCSV = (csv: string, ownerId: string): { success: boolean; count: number; errors: string[] } => {
    try {
        const headers = ['name', 'team_code', 'themeColor', 'secondaryColor'];
        const teams = csvToArray(csv, headers);

        const errors: string[] = [];
        let count = 0;

        teams.forEach((team, index) => {
            try {
                if (!team.name) {
                    errors.push(`Row ${index + 2}: Missing team name`);
                    return;
                }

                mockDB.createTeam(team.name, ownerId);
                count++;
            } catch (err: any) {
                errors.push(`Row ${index + 2}: ${err.message}`);
            }
        });

        return { success: errors.length === 0, count, errors };
    } catch (err: any) {
        return { success: false, count: 0, errors: [err.message] };
    }
};

export const importTournamentsFromCSV = (csv: string, organizerId: string): { success: boolean; count: number; errors: string[] } => {
    try {
        const headers = ['name', 'city', 'venue', 'startDate', 'endDate', 'ballType', 'matchFormat', 'matchType', 'status', 'max_teams'];
        const tournaments = csvToArray(csv, headers);

        const errors: string[] = [];
        let count = 0;

        tournaments.forEach((tournament, index) => {
            try {
                if (!tournament.name || !tournament.city) {
                    errors.push(`Row ${index + 2}: Missing required fields (name, city)`);
                    return;
                }

                mockDB.createTournament({
                    name: tournament.name,
                    city: tournament.city,
                    venue: tournament.venue,
                    startDate: tournament.startDate || new Date().toISOString(),
                    endDate: tournament.endDate || new Date().toISOString(),
                    ballType: tournament.ballType || 'tennis',
                    matchFormat: parseInt(tournament.matchFormat) || 20,
                    matchType: tournament.matchType || 'league',
                    orgId: organizerId,
                    max_teams: tournament.max_teams ? parseInt(tournament.max_teams) : undefined
                });
                count++;
            } catch (err: any) {
                errors.push(`Row ${index + 2}: ${err.message}`);
            }
        });


        return { success: errors.length === 0, count, errors };
    } catch (err: any) {
        return { success: false, count: 0, errors: [err.message] };
    }
};

// Ground import not yet implemented - mockDB doesn't have createGround method
export const importGroundsFromCSV = (csv: string): { success: boolean; count: number; errors: string[] } => {
    return {
        success: false,
        count: 0,
        errors: ['Ground import not yet implemented. Please add createGround method to mockDB first.']
    };
};

/**
 * Download Functions - Trigger browser download
 */

export const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Bulk Export - Export all data
 */

export const exportAllData = () => {
    downloadCSV(exportUsersToCSV(), 'users.csv');
    downloadCSV(exportTeamsToCSV(), 'teams.csv');
    downloadCSV(exportTournamentsToCSV(), 'tournaments.csv');
    downloadCSV(exportTournamentTeamsToCSV(), 'tournament_teams.csv');
    downloadCSV(exportMatchesToCSV(), 'matches.csv');
    downloadCSV(exportGroundsToCSV(), 'grounds.csv');
};

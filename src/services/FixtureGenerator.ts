import { Team, Match, Tournament } from '@/types/cricket';
import { generateUUID } from '@/services/mockDatabase';

export class FixtureGenerator {

    /**
     * Generates Round Robin fixtures for a given list of teams.
     * @param teams List of team objects
     * @param type 'single' | 'double'
     * @param tournamentId 
     * @param groupName Optional group name (e.g. "Group A")
     * @param startDate Date to start scheduling from
     */
    static generateRoundRobin(
        teams: Team[],
        type: 'single' | 'double',
        tournamentId: string,
        groupName?: string,
        startDate: Date = new Date()
    ): Match[] {
        if (teams.length < 2) return [];

        const matches: Match[] = [];
        const rounds = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
        const halfSize = Math.ceil(teams.length / 2);

        // Clone teams array to manipulate for rotation
        const teamList = [...teams];
        if (teamList.length % 2 !== 0) {
            // Add a dummy team for odd number of teams logic (bye)
            teamList.push({ id: 'BYE', name: 'BYE' } as Team);
        }

        const teamCount = teamList.length;

        for (let round = 0; round < rounds; round++) {
            for (let i = 0; i < teamCount / 2; i++) {
                const team1 = teamList[i];
                const team2 = teamList[teamCount - 1 - i];

                if (team1.id !== 'BYE' && team2.id !== 'BYE') {
                    // Create Match Object
                    matches.push({
                        id: generateUUID(),
                        title: `${team1.name} vs ${team2.name}`,
                        team1: team1,
                        team2: team2,
                        tournamentId: tournamentId,
                        groupName: groupName,
                        roundName: `Round ${round + 1}`,
                        date: new Date(startDate.getTime() + (round * 24 * 60 * 60 * 1000)), // Daily matches mock
                        status: 'upcoming',
                        venue: 'TBD',
                        overs: 20, // Default, should be passed
                        innings: []
                    } as Match);
                }
            }

            // Rotate teams (Circle Method)
            // Keep first team fixed, rotate others clockwise
            const last = teamList.pop()!;
            teamList.splice(1, 0, last);
        }

        if (type === 'double') {
            // Clone matches with reversed teams for away leg
            const returnLegMatches = matches.map(m => ({
                ...m,
                id: generateUUID(),
                title: `${m.team2.name} vs ${m.team1.name}`,
                team1: m.team2,
                team2: m.team1,
                roundName: `Return ` + m.roundName,
                date: new Date(m.date.getTime() + (rounds * 24 * 60 * 60 * 1000)) // Offset after first leg
            } as Match));
            matches.push(...returnLegMatches);
        }

        return matches;
    }

    /**
     * Generates a Knockout bracket (Single Elimination).
     */
    static generateKnockout(
        teams: Team[],
        tournamentId: string,
        startDate: Date
    ): Match[] {
        // Shuffle teams randomly? Or assume ranked? 
        // For now, assume simple pairing: 1v2, 3v4...

        const matches: Match[] = [];
        const matchCount = Math.floor(teams.length / 2);

        for (let i = 0; i < matchCount; i++) {
            const team1 = teams[i * 2];
            const team2 = teams[i * 2 + 1];

            matches.push({
                id: generateUUID(),
                title: `${team1.name} vs ${team2.name}`,
                team1: team1,
                team2: team2,
                tournamentId: tournamentId,
                roundName: 'Knockout Round 1',
                date: startDate,
                status: 'upcoming',
                venue: 'TBD',
                overs: 20,
                innings: []
            } as Match);
        }

        return matches;
    }
}

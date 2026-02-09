
export class CreateTournamentDto {
    name: string;
    venue: string;
    start_date: string;
    end_date: string;
    format: string; // T20, ODI, etc.
    overs: number;
    max_teams: number;
    entry_fee: number;
    prize_pool?: string;
    rules?: string;
    orgId: string;
}

export class UpdateTournamentDto {
    status?: 'draft' | 'open_for_registration' | 'ongoing' | 'completed';
    venue?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
}

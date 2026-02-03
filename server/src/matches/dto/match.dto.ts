
export class CreateMatchDto {
    team1_name: string;
    team2_name: string;
    venue: string;
    total_overs: number;
    status: 'live' | 'completed';
}

export class UpdateMatchDto {
    status?: 'live' | 'completed';
    result?: string;
    winner_name?: string;
    team1_score?: string; // Optional: to cache updated scores
    team2_score?: string;
}

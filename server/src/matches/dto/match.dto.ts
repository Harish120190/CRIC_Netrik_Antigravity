
export class CreateMatchDto {
    team1_name: string;
    team2_name: string;
    venue: string;
    total_overs: number;
    status: 'live' | 'completed' | 'scheduled';
    match_type?: string;
    ball_type?: string;
    match_date?: string;
    match_time?: string;
    city?: string;
    winning_prize?: string;
    match_fee?: string;
    team1_id?: string;
    team2_id?: string;
}

export class UpdateMatchDto {
    status?: 'live' | 'completed';
    result?: string;
    winner_name?: string;
    team1_score?: string; // Optional: to cache updated scores
    team2_score?: string;
}

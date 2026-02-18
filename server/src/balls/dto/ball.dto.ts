
export class CreateBallDto {
    match_id: string;
    innings_no: number;
    over_number: number;
    ball_number: number;
    runs_scored: number;
    is_wicket: boolean;
    extras_type?: string | null;
    extras_runs?: number;
    batsman_name: string;
    bowler_name: string;
    player_out_name?: string;
}

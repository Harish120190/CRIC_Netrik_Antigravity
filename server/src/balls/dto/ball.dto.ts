
export class CreateBallDto {
    innings_id: string;
    over_number: number;
    ball_number: number;
    runs: number;
    is_wicket: boolean;
    extras_type: string | null;
    batsman_name: string;
    bowler_name: string;
}


export class CreateInningDto {
    match_id: string;
    innings_number: number;
    batting_team_name: string;
    bowling_team_name: string;
}

export class UpdateInningDto {
    runs?: number;
    wickets?: number;
    overs?: number;
    balls?: number;
    extras?: number;
    fours?: number;
    sixes?: number;
}

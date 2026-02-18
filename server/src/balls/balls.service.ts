import { Injectable } from '@nestjs/common';
import { CsvService } from '../csv/csv.service';
import { CreateBallDto } from './dto/ball.dto';
import { v4 as uuidv4 } from 'uuid';

export interface Ball {
    id: string;
    match_id: string;
    innings_no: number;
    over_number: number;
    ball_number: number;
    runs_scored: number;
    is_wicket: boolean;
    extras_type: string | null;
    extras_runs: number;
    batsman_name: string;
    bowler_name: string;
    player_out_name: string | null;
    created_at: string;
}

@Injectable()
export class BallsService {
    private readonly filename = 'balls.csv';
    private readonly headers = [
        'id', 'match_id', 'innings_no', 'over_number', 'ball_number', 'runs_scored',
        'is_wicket', 'extras_type', 'extras_runs', 'batsman_name', 'bowler_name',
        'player_out_name', 'created_at'
    ];

    constructor(private readonly csvService: CsvService) {
        this.csvService.ensureFile(this.filename, this.headers);
    }

    async findAll(): Promise<Ball[]> {
        return this.csvService.readUtf8<Ball>(this.filename);
    }

    async findByMatchId(matchId: string): Promise<Ball[]> {
        const balls = await this.findAll();
        // Ensure type compatibility if CSV reads strings
        return balls.filter(b => b.match_id === matchId);
    }

    // Keep findByInningsId for backward compatibility if needed, but match_id is key now
    async findByInningsId(inningsId: string): Promise<Ball[]> {
        // Fallback or deprecated
        return this.findAll();
    }

    async create(createBallDto: CreateBallDto): Promise<Ball> {
        const newBall: Ball = {
            id: uuidv4(),
            ...createBallDto,
            innings_no: Number(createBallDto.innings_no),
            runs_scored: Number(createBallDto.runs_scored),
            extras_runs: Number(createBallDto.extras_runs || 0),
            is_wicket: Boolean(createBallDto.is_wicket),
            extras_type: createBallDto.extras_type || null,
            player_out_name: createBallDto.player_out_name || null,
            created_at: new Date().toISOString(),
        };
        await this.csvService.append(this.filename, newBall);
        return newBall;
    }
}

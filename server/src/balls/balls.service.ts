import { Injectable } from '@nestjs/common';
import { CsvService } from '../csv/csv.service';
import { CreateBallDto } from './dto/ball.dto';
import { v4 as uuidv4 } from 'uuid';

export interface Ball {
    id: string;
    innings_id: string;
    over_number: number;
    ball_number: number;
    runs: number;
    is_wicket: boolean;
    extras_type: string | null;
    batsman_name: string;
    bowler_name: string;
    created_at: string;
}

@Injectable()
export class BallsService {
    private readonly filename = 'balls.csv';
    private readonly headers = [
        'id', 'innings_id', 'over_number', 'ball_number', 'runs',
        'is_wicket', 'extras_type', 'batsman_name', 'bowler_name', 'created_at'
    ];

    constructor(private readonly csvService: CsvService) {
        this.csvService.ensureFile(this.filename, this.headers);
    }

    async findAll(): Promise<Ball[]> {
        return this.csvService.readUtf8<Ball>(this.filename);
    }

    async findByInningsId(inningsId: string): Promise<Ball[]> {
        const balls = await this.findAll();
        return balls.filter(b => b.innings_id === inningsId);
    }

    async create(createBallDto: CreateBallDto): Promise<Ball> {
        const newBall: Ball = {
            id: uuidv4(),
            ...createBallDto,
            is_wicket: Boolean(createBallDto.is_wicket), // Ensure boolean
            // Handle null explicitly if needed for CSV stringify, though null usually works
            extras_type: createBallDto.extras_type || '',
            created_at: new Date().toISOString(),
        };
        await this.csvService.append(this.filename, newBall);
        return newBall;
    }
}

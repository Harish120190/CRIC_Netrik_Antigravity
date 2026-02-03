import { Injectable, NotFoundException } from '@nestjs/common';
import { CsvService } from '../csv/csv.service';
import { CreateMatchDto, UpdateMatchDto } from './dto/match.dto';
import { v4 as uuidv4 } from 'uuid';

export interface Match {
    id: string;
    team1_name: string;
    team2_name: string;
    venue: string;
    total_overs: number;
    status: 'live' | 'completed';
    result: string | null;
    winner_name: string | null;
    created_at: string;
    updated_at: string;
}

@Injectable()
export class MatchesService {
    private readonly filename = 'matches.csv';
    private readonly headers = [
        'id', 'team1_name', 'team2_name', 'venue', 'total_overs',
        'status', 'result', 'winner_name', 'created_at', 'updated_at'
    ];

    constructor(private readonly csvService: CsvService) {
        this.csvService.ensureFile(this.filename, this.headers);
    }

    async findAll(): Promise<Match[]> {
        return this.csvService.readUtf8<Match>(this.filename);
    }

    async findOne(id: string): Promise<Match> {
        const matches = await this.findAll();
        const match = matches.find(m => m.id === id);
        if (!match) {
            throw new NotFoundException(`Match with ID ${id} not found`);
        }
        return match;
    }

    async create(createMatchDto: CreateMatchDto): Promise<Match> {
        const newMatch: Match = {
            id: uuidv4(),
            ...createMatchDto,
            result: null,
            winner_name: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await this.csvService.append(this.filename, newMatch);
        return newMatch;
    }

    async update(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
        const matches = await this.findAll();
        const index = matches.findIndex(m => m.id === id);

        if (index === -1) {
            throw new NotFoundException(`Match with ID ${id} not found`);
        }

        const updatedMatch = {
            ...matches[index],
            ...updateMatchDto,
            updated_at: new Date().toISOString(),
        };

        matches[index] = updatedMatch;
        await this.csvService.write(this.filename, matches);
        return updatedMatch;
    }
}

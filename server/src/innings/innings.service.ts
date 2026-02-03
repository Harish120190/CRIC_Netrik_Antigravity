import { Injectable, NotFoundException } from '@nestjs/common';
import { CsvService } from '../csv/csv.service';
import { CreateInningDto, UpdateInningDto } from './dto/inning.dto';
import { v4 as uuidv4 } from 'uuid';

export interface Inning {
    id: string;
    match_id: string;
    innings_number: number;
    batting_team_name: string;
    bowling_team_name: string;
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    extras: number;
    fours: number;
    sixes: number;
}

@Injectable()
export class InningsService {
    private readonly filename = 'innings.csv';
    private readonly headers = [
        'id', 'match_id', 'innings_number', 'batting_team_name', 'bowling_team_name',
        'runs', 'wickets', 'overs', 'balls', 'extras', 'fours', 'sixes'
    ];

    constructor(private readonly csvService: CsvService) {
        this.csvService.ensureFile(this.filename, this.headers);
    }

    async findAll(): Promise<Inning[]> {
        return this.csvService.readUtf8<Inning>(this.filename);
    }

    async findByMatchId(matchId: string): Promise<Inning[]> {
        const innings = await this.findAll();
        // CSV read returns strings often, may need type coercion if stricter types preferred
        return innings.filter(i => i.match_id === matchId);
    }

    async create(createInningDto: CreateInningDto): Promise<Inning> {
        const newInning: Inning = {
            id: uuidv4(),
            ...createInningDto,
            runs: 0,
            wickets: 0,
            overs: 0,
            balls: 0,
            extras: 0,
            fours: 0,
            sixes: 0,
        };
        await this.csvService.append(this.filename, newInning);
        return newInning;
    }

    async update(id: string, updateInningDto: UpdateInningDto): Promise<Inning> {
        const innings = await this.findAll();
        const index = innings.findIndex(i => i.id === id);

        if (index === -1) {
            throw new NotFoundException(`Inning with ID ${id} not found`);
        }

        const updatedInning = {
            ...innings[index],
            ...updateInningDto,
        };

        // Ensure numeric values are numbers in case they come as strings from CSV
        if (updateInningDto.runs !== undefined) updatedInning.runs = Number(updateInningDto.runs);
        if (updateInningDto.wickets !== undefined) updatedInning.wickets = Number(updateInningDto.wickets);
        if (updateInningDto.overs !== undefined) updatedInning.overs = Number(updateInningDto.overs);
        if (updateInningDto.balls !== undefined) updatedInning.balls = Number(updateInningDto.balls);
        if (updateInningDto.extras !== undefined) updatedInning.extras = Number(updateInningDto.extras);
        if (updateInningDto.fours !== undefined) updatedInning.fours = Number(updateInningDto.fours);
        if (updateInningDto.sixes !== undefined) updatedInning.sixes = Number(updateInningDto.sixes);

        innings[index] = updatedInning;
        await this.csvService.write(this.filename, innings);
        return updatedInning;
    }
}

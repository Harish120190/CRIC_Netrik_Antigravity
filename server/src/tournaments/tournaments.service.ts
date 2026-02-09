import { Injectable, NotFoundException } from '@nestjs/common';
import { CsvService } from '../csv/csv.service';
import { CreateTournamentDto, UpdateTournamentDto } from './dto/create-tournament.dto';
import { v4 as uuidv4 } from 'uuid';

export interface Tournament {
    id: string;
    name: string;
    venue: string;
    start_date: string;
    end_date: string;
    format: string;
    overs: number;
    max_teams: number;
    entry_fee: number;
    prize_pool?: string;
    rules?: string;
    status: 'draft' | 'open_for_registration' | 'ongoing' | 'completed';
    orgId: string;
    created_at: string;
    updated_at: string;
}

@Injectable()
export class TournamentsService {
    private readonly filename = 'tournaments.csv';
    private readonly headers = [
        'id', 'name', 'venue', 'start_date', 'end_date', 'format',
        'overs', 'max_teams', 'entry_fee', 'prize_pool', 'rules',
        'status', 'orgId', 'created_at', 'updated_at'
    ];

    constructor(private readonly csvService: CsvService) {
        this.csvService.ensureFile(this.filename, this.headers);
    }

    async findAll(): Promise<Tournament[]> {
        return this.csvService.readUtf8<Tournament>(this.filename);
    }

    async findOne(id: string): Promise<Tournament> {
        const tournaments = await this.findAll();
        const tournament = tournaments.find(t => t.id === id);
        if (!tournament) {
            throw new NotFoundException(`Tournament with ID ${id} not found`);
        }
        return tournament;
    }

    async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
        const newTournament: Tournament = {
            id: uuidv4(),
            ...createTournamentDto,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        await this.csvService.append(this.filename, newTournament);
        return newTournament;
    }

    async update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<Tournament> {
        const tournaments = await this.findAll();
        const index = tournaments.findIndex(t => t.id === id);

        if (index === -1) {
            throw new NotFoundException(`Tournament with ID ${id} not found`);
        }

        const updatedTournament = {
            ...tournaments[index],
            ...updateTournamentDto,
            updated_at: new Date().toISOString(),
        };

        tournaments[index] = updatedTournament;
        await this.csvService.write(this.filename, tournaments);
        return updatedTournament;
    }
}

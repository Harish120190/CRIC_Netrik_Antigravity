import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto, UpdateTournamentDto } from './dto/create-tournament.dto';

@Controller('tournaments')
export class TournamentsController {
    constructor(private readonly tournamentsService: TournamentsService) { }

    @Get()
    findAll() {
        return this.tournamentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tournamentsService.findOne(id);
    }

    @Post()
    create(@Body() createTournamentDto: CreateTournamentDto) {
        return this.tournamentsService.create(createTournamentDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateTournamentDto: UpdateTournamentDto) {
        return this.tournamentsService.update(id, updateTournamentDto);
    }
}

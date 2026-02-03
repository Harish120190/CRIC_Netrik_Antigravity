import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InningsService } from './innings.service';
import { CreateInningDto, UpdateInningDto } from './dto/inning.dto';

@Controller('innings')
export class InningsController {
    constructor(private readonly inningsService: InningsService) { }

    @Get()
    findAll(@Query('match_id') matchId?: string) {
        if (matchId) {
            return this.inningsService.findByMatchId(matchId);
        }
        return this.inningsService.findAll();
    }

    @Post()
    create(@Body() createInningDto: CreateInningDto) {
        return this.inningsService.create(createInningDto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateInningDto: UpdateInningDto) {
        return this.inningsService.update(id, updateInningDto);
    }
}

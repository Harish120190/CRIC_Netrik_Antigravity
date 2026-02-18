import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { BallsService } from './balls.service';
import { CreateBallDto } from './dto/ball.dto';

@Controller('balls')
export class BallsController {
    constructor(private readonly ballsService: BallsService) { }

    @Get()
    findAll(@Query('innings_id') inningsId?: string, @Query('match_id') matchId?: string) {
        if (matchId) {
            return this.ballsService.findByMatchId(matchId);
        }
        if (inningsId) {
            return this.ballsService.findByInningsId(inningsId);
        }
        return this.ballsService.findAll();
    }

    @Post()
    create(@Body() createBallDto: CreateBallDto) {
        return this.ballsService.create(createBallDto);
    }
}

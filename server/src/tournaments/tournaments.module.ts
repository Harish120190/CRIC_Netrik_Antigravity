import { Module } from '@nestjs/common';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { CsvModule } from '../csv/csv.module';

@Module({
    imports: [CsvModule],
    controllers: [TournamentsController],
    providers: [TournamentsService],
})
export class TournamentsModule { }

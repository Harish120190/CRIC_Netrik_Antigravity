import { Module } from '@nestjs/common';
import { BallsController } from './balls.controller';
import { BallsService } from './balls.service';
import { CsvModule } from '../csv/csv.module';

@Module({
    imports: [CsvModule],
    controllers: [BallsController],
    providers: [BallsService],
    exports: [BallsService],
})
export class BallsModule { }

import { Module } from '@nestjs/common';
import { InningsController } from './innings.controller';
import { InningsService } from './innings.service';
import { CsvModule } from '../csv/csv.module';

@Module({
    imports: [CsvModule],
    controllers: [InningsController],
    providers: [InningsService],
    exports: [InningsService],
})
export class InningsModule { }

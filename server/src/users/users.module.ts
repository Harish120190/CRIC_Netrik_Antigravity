
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { CsvModule } from '../csv/csv.module';

@Module({
  imports: [CsvModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }

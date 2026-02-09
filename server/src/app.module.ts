import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvModule } from './csv/csv.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MatchesModule } from './matches/matches.module';
import { InningsModule } from './innings/innings.module';
import { BallsModule } from './balls/balls.module';
import { TournamentsModule } from './tournaments/tournaments.module';

import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'dist'),
    }),
    CsvModule,
    AuthModule,
    UsersModule,
    MatchesModule,
    InningsModule,
    BallsModule,
    TournamentsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

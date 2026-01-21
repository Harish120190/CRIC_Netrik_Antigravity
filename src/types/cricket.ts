export type UserRole = 'player' | 'scorer' | 'umpire' | 'organizer' | 'fan';
export type BattingStyle = 'right-handed' | 'left-handed';
export type BowlingStyle = 'right-arm-fast' | 'right-arm-medium' | 'right-arm-spin' | 'left-arm-fast' | 'left-arm-medium' | 'left-arm-spin' | 'none';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  role: UserRole;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  location?: string;
  captainId: string;
  players: string[];
  createdAt: Date;
}

export interface Match {
  id: string;
  title: string;
  team1: Team;
  team2: Team;
  venue: string;
  date: Date;
  overs: number;
  status: 'upcoming' | 'live' | 'completed';
  tossWinner?: string;
  tossDecision?: 'bat' | 'bowl';
  innings: Innings[];
  tournamentId?: string;
}

export interface Innings {
  battingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: Ball[];
  extras: Extras;
}

export interface Ball {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  wicketType?: string;
  batsmanId: string;
  bowlerId: string;
  extras?: Partial<Extras>;
}

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}

export interface Tournament {
  id: string;
  name: string;
  format: 'T20' | 'ODI' | 'T10' | 'Custom';
  overs: number;
  teams: Team[];
  matches: Match[];
  status: 'upcoming' | 'ongoing' | 'completed';
  startDate: Date;
  endDate?: Date;
}

export interface PlayerStats {
  userId: string;
  matches: number;
  innings: number;
  runs: number;
  balls: number;
  wickets: number;
  catches: number;
  stumpings: number;
  highestScore: number;
  bestBowling: string;
  average: number;
  strikeRate: number;
  economy?: number;
}

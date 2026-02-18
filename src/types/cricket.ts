export type UserRole = 'player' | 'scorer' | 'umpire' | 'organizer' | 'fan';
export type BattingStyle = 'right-handed' | 'left-handed';
export type BowlingStyle = 'right-arm-fast' | 'right-arm-medium' | 'right-arm-spin' | 'left-arm-fast' | 'left-arm-medium' | 'left-arm-spin' | 'none';

export interface User {
  id: string;
  name?: string; // Deprecated, use fullName
  fullName: string;
  email: string;
  phone?: string; // Deprecated, use mobile
  mobile: string;
  avatar?: string; // Deprecated, use photoURL or just avatar
  photoURL?: string;
  location?: string;
  role: UserRole;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  createdAt: Date | string; // Allow string for ISO dates
  created_at?: string; // DB style

  // Auth & Verification
  isMobileVerified?: boolean;
  isEmailVerified?: boolean;
  verificationBadge?: 'none' | 'blue_tick' | 'gold_tick';

  // Social
  followers?: string[];
  following?: string[];
  privacySettings?: {
    profileVisibility: 'public' | 'private';
    statsVisibility: 'public' | 'private';
  };
}

export interface Player {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  captainId?: string;
  viceCaptainId?: string;
  players: (Player | string)[];
  homeGround?: string;

  // Extended fields
  owner_id?: string;
  team_code?: string;
  created_at?: string;
  themeColor?: string;
  secondaryColor?: string;
  createdAt?: Date; // Dual support
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  tournamentId?: string;
  date: Date;
  venue: string;
  status: 'upcoming' | 'live' | 'completed' | 'abandoned' | 'scheduled'; // Added scheduled
  toss?: {
    winnerId: string;
    decision: 'bat' | 'bowl';
  };
  result?: {
    winnerId?: string;
    resultType: 'runs' | 'wickets' | 'tie' | 'draw' | 'no_result';
    margin?: number;
    manOfTheMatchId?: string;
  };
  scorecard: {
    firstInnings: Innings;
    secondInnings?: Innings;
  };

  // Extended compatibility fields
  team1_name?: string;
  team2_name?: string;
  team1_id?: string;
  team2_id?: string;
  match_type?: string;
  ball_type?: string;
  match_date?: string;
  match_time?: string;
  ground_name?: string;
  city?: string;
  winner_name?: string;
  created_at?: string;
  round_name?: string;
  group_name?: string;
  title?: string; // For display "Team A vs Team B"
  team1?: Team; // For direct object access
  team2?: Team;
  innings?: any[]; // Legacy structure support
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
  version?: number;
  history?: any[];
}

export interface Extras {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
}

export interface PointsConfig {
  win: number;
  tie: number;
  noResult: number;
  loss: number;
  bonus?: {
    runRateThreshold?: number;
    points: number;
  };
}

export interface PointsRecord {
  teamId: string;
  matchesPlayed: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
  history: {
    matchId: string;
    result: 'W' | 'L' | 'T' | 'NR';
    points: number;
  }[];
}

export interface TournamentGroup {
  id: string;
  name: string;
  teamIds: string[];
}

export interface TournamentStage {
  id: string;
  name: string; // "League Stage", "Quarter Finals", etc.
  type: 'league' | 'knockout';
  status: 'upcoming' | 'ongoing' | 'completed';
  groups?: TournamentGroup[]; // For league stage
  matches: Match[]; // Matches specific to this stage
  qualificationRules?: {
    qualifyCount: number; // Top X teams qualify
    promoteToStageId?: string; // Next stage ID
  };
}

export interface Tournament {
  id: string;
  name: string;
  city?: string;
  venue?: string; // Deprecated, use city/location
  format: 'T20' | 'ODI' | 'T10' | 'Custom';
  type: 'league' | 'knockout' | 'hybrid' | 'custom'; // New field
  overs: number;
  ballType: 'tennis' | 'leather';
  startDate: Date;
  endDate?: Date;
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft' | 'open_for_registration';

  // Teams & Players
  teams: Team[];

  // Structure
  stages: TournamentStage[];
  currentStageId?: string;

  // Configuration
  pointsConfig: PointsConfig;

  // Scheduling
  matchDateRange?: { start: Date; end: Date };

  // Legacy fields (optional compatibility)
  matches: Match[]; // Can be a flat list of all matches or computed from stages
  rules?: string;
  prizePool?: string;
  entryFee?: number;
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

export interface Challenge {
  id: string;
  senderTeamId: string;
  receiverTeamId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'rescheduled';
  matchDetails: {
    date: Date;
    time?: string;
    venue: string;
    format: 'T20' | 'ODI' | 'T10' | 'Custom';
    ballType: 'tennis' | 'leather' | 'box' | 'stitch';
    overs: number;
  };
  createdAt: Date;
  notes?: string;
  responseNote?: string;
}

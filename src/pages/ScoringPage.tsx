import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Settings, Share2, Flag, Users, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScoreBoard from '@/components/scoring/ScoreBoard';
import ScoringPad from '@/components/scoring/ScoringPad';
import BallTimeline from '@/components/scoring/BallTimeline';
import PlayerScorecards from '@/components/scoring/PlayerScorecards';
import PartnershipTracker, { Partnership } from '@/components/scoring/PartnershipTracker';
import FallOfWickets, { WicketFall } from '@/components/scoring/FallOfWickets';
import RunProgressionChart, { OverData } from '@/components/scoring/RunProgressionChart';
import { BatsmanStats } from '@/components/scoring/BattingScorecard';
import { BowlerStats } from '@/components/scoring/BowlingScorecard';
import { Team } from '@/types/cricket';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Ball {
  runs: number;
  isWicket: boolean;
  extras?: string;
  batsmanId: string;
  bowlerId: string;
  overNumber: number;
}

interface InningsData {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  extras: number;
  fours: number;
  sixes: number;
  battingTeam: Team;
  bowlingTeam: Team;
  batsmenStats: BatsmanStats[];
  bowlersStats: BowlerStats[];
}

export interface MatchData {
  team1: Team;
  team2: Team;
  venue: string;
  overs: number;
  tossWinner: Team;
  tossDecision: 'bat' | 'bowl';
}

export interface MatchSummaryData {
  team1: Team;
  team2: Team;
  venue: string;
  overs: number;
  innings1: InningsData;
  innings2?: InningsData;
  result: string;
  winner?: Team;
}

import { mockDB, Ball as MockBall } from '@/services/mockDatabase';
import { toast } from 'sonner';

interface ScoringPageProps {
  onBack: () => void;
  onEndMatch: (summary: MatchSummaryData) => void;
  matchData?: MatchData | null;
  matchId?: string;
}

// Sample player names for demo
const sampleBatsmen = [
  'Virat Kumar', 'Rohit Sharma', 'KL Rahul', 'Shreyas Iyer',
  'Rishabh Pant', 'Hardik Pandya', 'Ravindra Jadeja', 'Axar Patel',
  'Mohammed Shami', 'Jasprit Bumrah', 'Yuzvendra Chahal'
];

const sampleBowlers = [
  'Jasprit Kumar', 'Mohammed Siraj', 'Bhuvneshwar Singh',
  'Shardul Thakur', 'Kuldeep Yadav', 'Ravi Ashwin'
];

const createInitialBatsmenStats = (): BatsmanStats[] =>
  sampleBatsmen.map((name, i) => ({
    id: `bat-${i}`,
    name,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
    isOnStrike: i === 0,
  }));

const createInitialBowlersStats = (): BowlerStats[] =>
  sampleBowlers.map((name, i) => ({
    id: `bowl-${i}`,
    name,
    overs: 0,
    balls: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
    isBowling: i === 0,
  }));

const ScoringPage: React.FC<ScoringPageProps> = ({ onBack, onEndMatch, matchData, matchId }) => {
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [firstInningsData, setFirstInningsData] = useState<InningsData | null>(null);

  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [extras, setExtras] = useState(0);
  const [fours, setFours] = useState(0);
  const [sixes, setSixes] = useState(0);

  // Player tracking
  const [strikerIndex, setStrikerIndex] = useState(0);
  const [nonStrikerIndex, setNonStrikerIndex] = useState(1);
  const [currentBowlerIndex, setCurrentBowlerIndex] = useState(0);

  const [batsmenStats, setBatsmenStats] = useState<BatsmanStats[]>(createInitialBatsmenStats());
  const [bowlersStats, setBowlersStats] = useState<BowlerStats[]>(createInitialBowlersStats());

  // Partnership tracking
  const [currentPartnership, setCurrentPartnership] = useState<Partnership>({
    id: 1,
    batsman1Name: sampleBatsmen[0],
    batsman2Name: sampleBatsmen[1],
    runs: 0,
    balls: 0,
    isActive: true,
    wicketNumber: 1,
  });
  const [previousPartnerships, setPreviousPartnerships] = useState<Partnership[]>([]);

  // Load existing balls from DB on mount
  useEffect(() => {
    if (!matchId) return;

    const loadMatchState = async () => {
      try {
        // MockDB Fetch
        const dbBalls = mockDB.getBalls(matchId);
        // Filter for current innings if needed, but mockDB.getBalls usually returns all? 
        // Our mockDB logic actually filters by matchId only in my implementation above?
        // Let's check mockDB implementation... it returns filtered by matchId.
        // We need to filter by innings here or update query.

        const inningsBalls = dbBalls.filter(b => b.innings_no === currentInnings);

        if (inningsBalls && inningsBalls.length > 0) {
          // Replay balls to restore state
          let restoredRuns = 0;
          let restoredWickets = 0;
          let restoredBalls: Ball[] = [];

          inningsBalls.forEach(dbBall => {
            restoredBalls.push({
              runs: dbBall.runs_scored,
              isWicket: dbBall.is_wicket,
              extras: dbBall.extras_type || undefined,
              batsmanId: dbBall.batsman_name || 'unknown', // Fallback
              bowlerId: dbBall.bowler_name || 'unknown',
              overNumber: dbBall.over_number
            });
            restoredRuns += dbBall.runs_scored + (dbBall.extras_runs || 0);
            if (dbBall.is_wicket) restoredWickets++;
          });

          setRuns(restoredRuns);
          setWickets(restoredWickets);
          setBalls(restoredBalls);

          const lastBall = inningsBalls[inningsBalls.length - 1];
          setCurrentOver(lastBall.over_number);
          setCurrentBall(lastBall.ball_number);
        }
      } catch (e) {
        console.error("Error loading match state:", e);
        toast.error("Failed to restore match state");
      }
    };

    loadMatchState();
  }, [matchId, currentInnings]);

  const saveBallToDb = async (ball: Ball) => {
    if (!matchId) return;
    try {
      mockDB.saveBall({
        match_id: matchId,
        innings_no: currentInnings,
        over_number: currentOver,
        ball_number: currentBall + 1,
        runs_scored: ball.runs,
        is_wicket: ball.isWicket,
        extras_type: ball.extras || null,
        extras_runs: ball.extras ? 1 : 0,
        batsman_name: batsmenStats[strikerIndex].name,
        bowler_name: bowlersStats[currentBowlerIndex].name,
        player_out_name: ball.isWicket ? batsmenStats[strikerIndex].name : undefined
      });
    } catch (e) {
      console.error("Error saving ball:", e);
      toast.error("Failed to save ball locally");
    }
  };


  // Fall of wickets tracking
  const [fallOfWickets, setFallOfWickets] = useState<WicketFall[]>([]);

  // Determine batting and bowling teams based on toss and innings
  const getTeamsForInnings = () => {
    if (!matchData) {
      return {
        batting: { id: '1', name: 'Team A', logo: '', players: [], captainId: '', createdAt: new Date() } as Team,
        bowling: { id: '2', name: 'Team B', logo: '', players: [], captainId: '', createdAt: new Date() } as Team
      };
    }

    const firstBattingTeam = matchData.tossDecision === 'bat'
      ? matchData.tossWinner
      : (matchData.tossWinner.id === matchData.team1.id ? matchData.team2 : matchData.team1);

    const firstBowlingTeam = matchData.tossWinner.id === firstBattingTeam.id
      ? (matchData.team1.id === matchData.tossWinner.id ? matchData.team2 : matchData.team1)
      : matchData.tossWinner;

    if (currentInnings === 1) {
      return { batting: firstBattingTeam, bowling: firstBowlingTeam };
    } else {
      return { batting: firstBowlingTeam, bowling: firstBattingTeam };
    }
  };

  const { batting: battingTeam, bowling: bowlingTeam } = getTeamsForInnings();

  const target = currentInnings === 2 && firstInningsData ? firstInningsData.runs + 1 : undefined;
  const totalOvers = matchData?.overs || 20;
  const totalBallsInMatch = totalOvers * 6;
  const ballsBowled = currentOver * 6 + currentBall;
  const remainingBalls = totalBallsInMatch - ballsBowled;

  // Calculate required run rate for second innings
  const requiredRate = target && remainingBalls > 0
    ? ((target - runs) / remainingBalls) * 6
    : undefined;

  // Check for match completion conditions
  const isInningsComplete = () => {
    if (wickets >= 10) return true;
    if (currentOver >= totalOvers) return true;
    if (currentInnings === 2 && target && runs >= target) return true;
    return false;
  };

  const getMatchResult = (): { result: string; winner?: Team } => {
    if (!firstInningsData) {
      return { result: `${battingTeam.name} scored ${runs}/${wickets}` };
    }

    const innings2Runs = runs;
    const innings1Runs = firstInningsData.runs;

    if (innings2Runs > innings1Runs) {
      const wicketsRemaining = 10 - wickets;
      return {
        result: `${battingTeam.name} won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`,
        winner: battingTeam
      };
    } else if (innings1Runs > innings2Runs) {
      const runDifference = innings1Runs - innings2Runs;
      return {
        result: `${bowlingTeam.name} won by ${runDifference} run${runDifference !== 1 ? 's' : ''}`,
        winner: bowlingTeam
      };
    } else {
      return { result: 'Match Tied' };
    }
  };

  // Auto-detect innings/match completion
  useEffect(() => {
    if (isInningsComplete() && currentInnings === 2) {
      // Match is complete - auto-trigger end match after a brief delay
      const timer = setTimeout(() => {
        handleEndMatch();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [runs, wickets, currentOver, currentBall]);

  const rotateStrike = () => {
    const temp = strikerIndex;
    setStrikerIndex(nonStrikerIndex);
    setNonStrikerIndex(temp);

    setBatsmenStats(prev => prev.map((b, i) => ({
      ...b,
      isOnStrike: i === nonStrikerIndex,
    })));
  };

  const handleScore = (runScored: number, extrasType?: string) => {
    const newBall: Ball = {
      runs: runScored,
      isWicket: false,
      extras: extrasType,
      batsmanId: batsmenStats[strikerIndex].id,
      bowlerId: bowlersStats[currentBowlerIndex].id,
      overNumber: currentOver + 1,
    };

    saveBallToDb(newBall);

    setBalls([...balls, newBall]);
    const totalRunsScored = runScored + (extrasType ? 1 : 0);
    setRuns(runs + totalRunsScored);

    // Update partnership
    setCurrentPartnership(prev => ({
      ...prev,
      runs: prev.runs + totalRunsScored,
      balls: (!extrasType || extrasType === 'bye' || extrasType === 'leg-bye') ? prev.balls + 1 : prev.balls,
    }));

    // Update batsman stats
    setBatsmenStats(prev => prev.map((b, i) => {
      if (i === strikerIndex) {
        return {
          ...b,
          runs: b.runs + runScored,
          balls: (!extrasType || extrasType === 'bye' || extrasType === 'leg-bye') ? b.balls + 1 : b.balls,
          fours: runScored === 4 ? b.fours + 1 : b.fours,
          sixes: runScored === 6 ? b.sixes + 1 : b.sixes,
        };
      }
      return b;
    }));

    // Update bowler stats
    setBowlersStats(prev => prev.map((b, i) => {
      if (i === currentBowlerIndex) {
        const newBalls = (!extrasType || extrasType === 'bye' || extrasType === 'leg-bye') ? b.balls + 1 : b.balls;
        const completedOver = newBalls >= 6;
        return {
          ...b,
          runs: b.runs + runScored + (extrasType && extrasType !== 'bye' && extrasType !== 'leg-bye' ? 1 : 0),
          balls: completedOver ? 0 : newBalls,
          overs: completedOver ? b.overs + 1 : b.overs,
        };
      }
      return b;
    }));

    if (extrasType) {
      setExtras(prev => prev + 1);
    }
    if (runScored === 4) {
      setFours(prev => prev + 1);
    }
    if (runScored === 6) {
      setSixes(prev => prev + 1);
    }

    if (!extrasType || extrasType === 'bye' || extrasType === 'leg-bye') {
      const newBallCount = currentBall + 1;
      if (newBallCount >= 6) {
        setCurrentOver(currentOver + 1);
        setCurrentBall(0);
        rotateStrike(); // End of over, rotate strike
      } else {
        setCurrentBall(newBallCount);
        // Rotate strike on odd runs
        if (runScored % 2 === 1) {
          rotateStrike();
        }
      }
    }
  };

  const handleWicket = () => {
    const newBall: Ball = {
      runs: 0,
      isWicket: true,
      batsmanId: batsmenStats[strikerIndex].id,
      bowlerId: bowlersStats[currentBowlerIndex].id,
      overNumber: currentOver + 1,
    };

    saveBallToDb(newBall);

    setBalls([...balls, newBall]);
    const newWicketCount = wickets + 1;
    setWickets(newWicketCount);

    // Calculate the ball number for display (before incrementing)
    const wicketBall = currentBall + 1 >= 6 ? 0 : currentBall + 1;
    const wicketOver = currentBall + 1 >= 6 ? currentOver + 1 : currentOver;

    // Record fall of wicket
    const newWicketFall: WicketFall = {
      wicketNumber: newWicketCount,
      batsmanName: batsmenStats[strikerIndex].name,
      runs: batsmenStats[strikerIndex].runs,
      overs: wicketOver,
      balls: wicketBall,
      teamScore: runs,
    };
    setFallOfWickets(prev => [...prev, newWicketFall]);

    // Save current partnership and start new one
    setPreviousPartnerships(prev => [...prev, { ...currentPartnership, isActive: false }]);

    // Find the next batsman
    const nextBatsman = batsmenStats.findIndex((b, i) => !b.isOut && i !== strikerIndex && i !== nonStrikerIndex);

    if (nextBatsman !== -1) {
      // Start new partnership
      setCurrentPartnership({
        id: currentPartnership.id + 1,
        batsman1Name: batsmenStats[nonStrikerIndex].name,
        batsman2Name: sampleBatsmen[nextBatsman],
        runs: 0,
        balls: 0,
        isActive: true,
        wicketNumber: newWicketCount + 1,
      });
    }

    // Mark batsman as out
    setBatsmenStats(prev => prev.map((b, i) => {
      if (i === strikerIndex) {
        return { ...b, isOut: true, balls: b.balls + 1, isOnStrike: false };
      }
      return b;
    }));

    // Update bowler wickets
    setBowlersStats(prev => prev.map((b, i) => {
      if (i === currentBowlerIndex) {
        const newBalls = b.balls + 1;
        const completedOver = newBalls >= 6;
        return {
          ...b,
          wickets: b.wickets + 1,
          balls: completedOver ? 0 : newBalls,
          overs: completedOver ? b.overs + 1 : b.overs,
        };
      }
      return b;
    }));

    // Bring in next batsman
    if (nextBatsman !== -1) {
      setStrikerIndex(nextBatsman);
      setBatsmenStats(prev => prev.map((b, i) => ({
        ...b,
        isOnStrike: i === nextBatsman,
      })));
    }

    const newBallCount = currentBall + 1;
    if (newBallCount >= 6) {
      setCurrentOver(currentOver + 1);
      setCurrentBall(0);
    } else {
      setCurrentBall(newBallCount);
    }
  };

  const handleUndo = () => {
    if (balls.length === 0) return;

    const lastBall = balls[balls.length - 1];
    setBalls(balls.slice(0, -1));
    setRuns(runs - lastBall.runs - (lastBall.extras ? 1 : 0));

    if (lastBall.isWicket) {
      setWickets(wickets - 1);
    }
    if (lastBall.extras) {
      setExtras(prev => prev - 1);
    }
    if (lastBall.runs === 4) {
      setFours(prev => prev - 1);
    }
    if (lastBall.runs === 6) {
      setSixes(prev => prev - 1);
    }

    if (!lastBall.extras || lastBall.extras === 'bye' || lastBall.extras === 'leg-bye') {
      if (currentBall === 0 && currentOver > 0) {
        setCurrentOver(currentOver - 1);
        setCurrentBall(5);
      } else if (currentBall > 0) {
        setCurrentBall(currentBall - 1);
      }
    }
  };

  const handleEndInnings = () => {
    const inningsData: InningsData = {
      runs,
      wickets,
      overs: currentOver,
      balls: currentBall,
      extras,
      fours,
      sixes,
      battingTeam,
      bowlingTeam,
      batsmenStats: [...batsmenStats],
      bowlersStats: [...bowlersStats],
    };

    setFirstInningsData(inningsData);
    setCurrentInnings(2);

    // Reset for second innings
    setRuns(0);
    setWickets(0);
    setBalls([]);
    setCurrentOver(0);
    setCurrentBall(0);
    setExtras(0);
    setFours(0);
    setSixes(0);
    setStrikerIndex(0);
    setNonStrikerIndex(1);
    setCurrentBowlerIndex(0);
    setBatsmenStats(createInitialBatsmenStats());
    setBowlersStats(createInitialBowlersStats());

    // Reset partnerships for second innings
    setCurrentPartnership({
      id: 1,
      batsman1Name: sampleBatsmen[0],
      batsman2Name: sampleBatsmen[1],
      runs: 0,
      balls: 0,
      isActive: true,
      wicketNumber: 1,
    });
    setPreviousPartnerships([]);

    // Reset fall of wickets for second innings
    setFallOfWickets([]);
  };

  const handleEndMatch = () => {
    const defaultTeam1: Team = { id: '1', name: 'Team A', logo: '', players: [], captainId: '', createdAt: new Date() };
    const defaultTeam2: Team = { id: '2', name: 'Team B', logo: '', players: [], captainId: '', createdAt: new Date() };

    const currentInningsData: InningsData = {
      runs,
      wickets,
      overs: currentOver,
      balls: currentBall,
      extras,
      fours,
      sixes,
      battingTeam,
      bowlingTeam,
      batsmenStats: [...batsmenStats],
      bowlersStats: [...bowlersStats],
    };

    const { result, winner } = getMatchResult();

    const summary: MatchSummaryData = {
      team1: matchData?.team1 || defaultTeam1,
      team2: matchData?.team2 || defaultTeam2,
      venue: matchData?.venue || 'Local Ground',
      overs: matchData?.overs || 20,
      innings1: firstInningsData || currentInningsData,
      innings2: firstInningsData ? currentInningsData : undefined,
      result,
      winner,
    };
    onEndMatch(summary);
  };

  const runRate = ballsBowled > 0 ? (runs / ballsBowled) * 6 : 0;

  // Convert balls for timeline display
  const timelineBalls = balls.map(b => ({
    runs: b.runs,
    isWicket: b.isWicket,
    extras: b.extras,
  }));

  // Calculate over-by-over data for run progression chart
  const overData = useMemo((): OverData[] => {
    if (balls.length === 0) return [];

    const overMap = new Map<number, { runs: number; wickets: number }>();
    let cumulativeRuns = 0;

    balls.forEach(ball => {
      const overNum = ball.overNumber;
      const existing = overMap.get(overNum) || { runs: 0, wickets: 0 };
      const ballRuns = ball.runs + (ball.extras ? 1 : 0);

      overMap.set(overNum, {
        runs: existing.runs + ballRuns,
        wickets: existing.wickets + (ball.isWicket ? 1 : 0),
      });
    });

    const result: OverData[] = [];
    const maxOver = Math.max(...Array.from(overMap.keys()));

    for (let i = 1; i <= maxOver; i++) {
      const data = overMap.get(i) || { runs: 0, wickets: 0 };
      cumulativeRuns += data.runs;
      result.push({
        over: i,
        runs: data.runs,
        totalRuns: cumulativeRuns,
        wickets: data.wickets,
      });
    }

    return result;
  }, [balls]);

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-foreground">Live Scoring</h1>
            {matchData && (
              <p className="text-xs text-muted-foreground">{matchData.venue}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Users className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh]">
                <SheetHeader>
                  <SheetTitle>Player Scorecards</SheetTitle>
                </SheetHeader>
                <div className="mt-4 overflow-y-auto max-h-[calc(70vh-80px)]">
                  <PlayerScorecards
                    batsmen={batsmenStats}
                    bowlers={bowlersStats}
                    battingTeamName={battingTeam?.name || 'Batting Team'}
                    bowlingTeamName={bowlingTeam?.name || 'Bowling Team'}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Innings indicator */}
        {currentInnings === 2 && firstInningsData && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
            <p className="text-sm text-primary font-medium">
              2nd Innings • Target: {target} runs
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {firstInningsData.battingTeam.name} scored {firstInningsData.runs}/{firstInningsData.wickets}
            </p>
          </div>
        )}

        {/* Scoreboard */}
        <ScoreBoard
          battingTeam={battingTeam.name}
          bowlingTeam={bowlingTeam.name}
          runs={runs}
          wickets={wickets}
          overs={currentOver}
          balls={currentBall}
          target={target}
          runRate={runRate}
          requiredRate={requiredRate}
          isLive={true}
          totalOvers={totalOvers}
        />

        {/* Current Players */}
        <div className="bg-card rounded-xl p-3 border border-border">
          <div className="flex items-start justify-between text-sm gap-4">
            {/* Batsman Stats */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">On Strike</p>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground flex items-center justify-between">
                  <span>{batsmenStats[strikerIndex]?.name}</span>
                  <span className="text-xs text-primary font-bold">
                    {batsmenStats[strikerIndex]?.runs}({batsmenStats[strikerIndex]?.balls})
                  </span>
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>SR: {batsmenStats[strikerIndex]?.balls ? ((batsmenStats[strikerIndex].runs / batsmenStats[strikerIndex].balls) * 100).toFixed(1) : '0.0'}</span>
                  <span>Avg: -</span>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-border self-center" />

            {/* Bowler Stats */}
            <div className="flex-1 text-right">
              <p className="text-xs text-muted-foreground mb-1">Bowler</p>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground flex items-center justify-end gap-2">
                  <span className="text-xs text-live font-bold">
                    {bowlersStats[currentBowlerIndex]?.wickets}-{bowlersStats[currentBowlerIndex]?.runs}
                  </span>
                  <span>{bowlersStats[currentBowlerIndex]?.name}</span>
                </p>
                <div className="flex justify-end gap-3 text-xs text-muted-foreground">
                  <span>Econ: {
                    (() => {
                      const b = bowlersStats[currentBowlerIndex];
                      if (!b) return '0.0';
                      const balls = b.overs * 6 + b.balls;
                      return balls > 0 ? ((b.runs / balls) * 6).toFixed(1) : '0.0';
                    })()
                  }</span>
                  <span>Best: -</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partnership Tracker */}
        <PartnershipTracker
          currentPartnership={currentPartnership}
          previousPartnerships={previousPartnerships}
        />

        {/* Fall of Wickets */}
        <FallOfWickets wickets={fallOfWickets} />

        {/* Ball Timeline */}
        <BallTimeline balls={timelineBalls} currentOver={currentOver} />

        {/* Run Progression Chart */}
        <RunProgressionChart overData={overData} />

        {/* Scoring Pad */}
        <ScoringPad
          onScore={handleScore}
          onWicket={handleWicket}
          onUndo={handleUndo}
        />

        {/* End Innings / End Match Buttons */}
        <div className="space-y-3 mt-4">
          {currentInnings === 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="pitch" className="w-full h-12">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  End Innings
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End first innings?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {battingTeam.name} scored {runs}/{wickets} in {currentOver}.{currentBall} overs.
                    The second team will now bat chasing {runs + 1} runs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Batting</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndInnings}>
                    Start 2nd Innings
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full h-12">
                <Flag className="w-4 h-4 mr-2" />
                End Match
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End this match?</AlertDialogTitle>
                <AlertDialogDescription>
                  {currentInnings === 1
                    ? "This will end the match with only one innings played."
                    : `${getMatchResult().result}. This will finalize the match.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continue Scoring</AlertDialogCancel>
                <AlertDialogAction onClick={handleEndMatch}>
                  End Match
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
};

export default ScoringPage;

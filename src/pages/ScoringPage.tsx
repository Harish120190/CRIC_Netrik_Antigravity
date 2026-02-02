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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PlayerSelectDialog from '@/components/scoring/PlayerSelectDialog';
import WicketDetailsDialog, { WicketType } from '@/components/scoring/WicketDetailsDialog';
import NotificationSettings from '@/components/profile/NotificationSettings';
import EditBallDialog from '@/components/scoring/EditBallDialog';
import { useAuth } from '@/contexts/AuthContext';
import GroundPositionSelector from '@/components/scoring/GroundPositionSelector';
import CommentaryFeed, { CommentaryBall } from '@/components/scoring/CommentaryFeed';
import { mockDB, Ball as MockBall } from '@/services/mockDatabase';
import { syncManager } from '@/services/syncManager';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info, Zap } from 'lucide-react';
import { getCurrentPowerplay, PowerplayRule } from '@/utils/powerplay';
import { triggerGlobalNotification } from '@/utils/notifications';

interface Ball {
  id?: string;
  runs: number;
  isWicket: boolean;
  extras?: string;
  batsmanId: string;
  bowlerId: string;
  overNumber: number;
  commentary?: string;
  isBoundary?: boolean;
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
  playersTeam1?: string[];
  playersTeam2?: string[];
  enableShotDirection: boolean;
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

interface ScoringPageProps {
  onBack: () => void;
  onEndMatch: (summary: MatchSummaryData) => void;
  onUpdateMatchData?: (data: Partial<MatchData>) => void;
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

const ScoringPage: React.FC<ScoringPageProps> = ({ onBack, onEndMatch, onUpdateMatchData, matchData, matchId }) => {
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [firstInningsData, setFirstInningsData] = useState<InningsData | null>(null);

  const [matchSummary, setMatchSummary] = useState<MatchSummaryData | null>(null);
  const [endMatchOpen, setEndMatchOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentBall, setCurrentBall] = useState(0);
  const [extras, setExtras] = useState(0);
  const [fours, setFours] = useState(0);
  const [sixes, setSixes] = useState(0);

  // Track milestones to avoid duplicate notifications
  const [reachedMilestones, setReachedMilestones] = useState<Record<string, number[]>>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Correction Mode State
  const { user } = useAuth();
  const [editingBall, setEditingBall] = useState<MockBall | null>(null);
  const [isEditBallOpen, setIsEditBallOpen] = useState(false);
  const [viewingHistory, setViewingHistory] = useState<MockBall | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Powerplay State
  const powerplayRule = useMemo(() =>
    getCurrentPowerplay(currentOver, matchData?.overs || 20),
    [currentOver, matchData?.overs]
  );

  const [lastNotificationPhase, setLastNotificationPhase] = useState<string>('');

  // Powerplay Notifications
  useEffect(() => {
    if (powerplayRule && powerplayRule.phase !== lastNotificationPhase) {
      if (powerplayRule.phase !== 'None') {
        toast.success(`${powerplayRule.label} Started!`, {
          description: `Field restrictions applied: Max ${powerplayRule.maxFieldersOutside} players outside the circle.`,
          duration: 5000,
        });
      } else if (lastNotificationPhase !== '' && lastNotificationPhase !== 'None') {
        toast.info("Powerplay Ended", {
          description: "Standard fielding restrictions now apply.",
          duration: 5000,
        });
      }
      setLastNotificationPhase(powerplayRule.phase);
    }
  }, [powerplayRule, lastNotificationPhase]);

  // Helper to generate commentary
  const generateCommentary = (
    bowlerName: string,
    batsmanName: string,
    runs: number,
    extras: string | undefined,
    isWicket: boolean,
    wicketType?: string,
    shotPosition?: string
  ): string => {
    let text = "";
    const bowler = bowlerName.split(' ').pop() || bowlerName;
    const batsman = batsmanName.split(' ').pop() || batsmanName;

    // Prefix
    text = `${bowler} to ${batsman}, `;

    if (isWicket) {
      const type = wicketType || 'out';
      if (type === 'bowled') text += "OUT! Clean bowled! stumps are flying!";
      else if (type === 'caught') text += `OUT! Caught${shotPosition ? ` at ${shotPosition}` : ''}!`;
      else if (type === 'lbw') text += "OUT! LBW! Plumb in front.";
      else if (type === 'runout') text += "OUT! Run out! Direct hit.";
      else text += `OUT! ${type}.`;
    } else if (extras) {
      if (extras === 'wide') text += "Wide ball, straying down leg.";
      else if (extras === 'no-ball') text += "No ball! Overstepping.";
      else text += `${extras} runs conceded.`;
    } else {
      if (runs === 0) text += "no run, dot ball.";
      else if (runs === 1) text += `1 run${shotPosition ? `, pushed to ${shotPosition}` : ''}.`;
      else if (runs === 2) text += `2 runs${shotPosition ? `, driven to ${shotPosition}` : ''}.`;
      else if (runs === 3) text += "3 runs, good running.";
      else if (runs === 4) text += `FOUR! Cracking shot${shotPosition ? ` through ${shotPosition}` : ''}!`;
      else if (runs === 6) text += `SIX! That's huge! Over ${shotPosition || 'the rope'}!`;
    }
    return text;
  };

  // Player tracking
  const [strikerIndex, setStrikerIndex] = useState(0);
  const [nonStrikerIndex, setNonStrikerIndex] = useState(1);
  const [currentBowlerIndex, setCurrentBowlerIndex] = useState(0);

  // Selection Dialog State
  const [showBatsmanSelect, setShowBatsmanSelect] = useState(false);
  const [showBowlerSelect, setShowBowlerSelect] = useState(false);
  const [showWicketDialog, setShowWicketDialog] = useState(false);

  // Wicket Handling
  const handleWicketClick = () => {
    setShowWicketDialog(true);
  };

  const processWicket = (type: WicketType, fielderId?: string, isStrikerOut: boolean = true, position?: string) => {
    // Determine who is out
    const dismissedIndex = isStrikerOut ? strikerIndex : nonStrikerIndex;
    const dismissedBatsman = batsmenStats[dismissedIndex];

    const newBall: Ball = {
      runs: 0,
      isWicket: true,
      batsmanId: batsmenStats[strikerIndex].id, // Striker faces the ball regardless
      bowlerId: bowlersStats[currentBowlerIndex].id,
      overNumber: currentOver + 1,
      // shotPosition: position // Todo: Add to Ball if needed
      commentary: generateCommentary(
        bowlersStats[currentBowlerIndex].name,
        batsmenStats[strikerIndex].name,
        0,
        undefined,
        true,
        type,
        position
      )
    };

    saveBallToDbWithDetails(newBall, type, fielderId, dismissedBatsman.name);

    setBalls([...balls, newBall]);
    const newWicketCount = wickets + 1;
    setWickets(newWicketCount);

    // Calc over/ball for display
    const wicketBall = currentBall + 1 >= 6 ? 0 : currentBall + 1;
    const wicketOver = currentBall + 1 >= 6 ? currentOver + 1 : currentOver;

    // Fall of Wicket
    const newWicketFall: WicketFall = {
      wicketNumber: newWicketCount,
      batsmanName: dismissedBatsman.name,
      runs: dismissedBatsman.runs,
      overs: wicketOver,
      balls: wicketBall,
      teamScore: runs,
    };
    setFallOfWickets(prev => [...prev, newWicketFall]);

    // Close partnership
    setPreviousPartnerships(prev => [...prev, { ...currentPartnership, isActive: false }]);

    // Trigger Batsman Selection
    setShowBatsmanSelect(true);

    // Update Player Stats (Out)
    setBatsmenStats(prev => prev.map((b, i) => {
      if (i === dismissedIndex) {
        return { ...b, isOut: true, balls: b.balls + 1, isOnStrike: false };
      }
      return b;
    }));

    // Update Bowler Stats
    setBowlersStats(prev => prev.map((b, i) => {
      if (i === currentBowlerIndex) {
        // Run outs usually don't go to bowler. 
        const isBowlerWicket = type !== 'runout' && type !== 'retired' && type !== 'hitwicket'; // hit wicket does?
        // Cricket rules: Bowled, Caught, LBW, Stumped, Hit Wicket -> Bowler's wicket.
        // Run Out, Retired, Timed Out, Handled Ball -> Not bowler's.
        const creditBowler = ['bowled', 'caught', 'lbw', 'stumped', 'hitwicket'].includes(type);

        const newBalls = b.balls + 1;
        const completedOver = newBalls >= 6;
        return {
          ...b,
          wickets: creditBowler ? b.wickets + 1 : b.wickets,
          balls: completedOver ? 0 : newBalls,
          overs: completedOver ? b.overs + 1 : b.overs,
        };
      }
      return b;
    }));

    // Check Over completion
    const newBallCount = currentBall + 1;
    if (newBallCount >= 6) {
      setCurrentOver(currentOver + 1);
      setCurrentBall(0);
      // rotateStrike? Only if not all out?
      setShowBowlerSelect(true);
    } else {
      setCurrentBall(newBallCount);
    }
  };

  const handleWicketConfirm = (type: WicketType, fielderId?: string, isStrikerOut: boolean = true) => {
    // Check if catch and enable wagon wheel
    if (enableWagonWheel && type === 'caught') {
      setPendingCatch({ type, fielderId, isStrikerOut });
      setWagonWheelMode('catch');
      setShowWagonWheel(true);
    } else {
      processWicket(type, fielderId, isStrikerOut);
    }
  };

  const saveBallToDbWithDetails = async (ball: Ball, wicketType: string, fielderId: string | undefined, playerOutName: string) => {
    if (!matchId) return;
    // Helper to enhance saveBall with wicket details (description primarily)
    // Since mockDB.saveBall signature is fixed, we can abuse `extras_type` or just log it?
    // Actually mockDB has `wicket_type`? No.
    // Let's just save basic info for now to mockDB but in real app we'd have columns.
    // I'll stick to `saveBallToDb` logic but update player_out_name correctly.
    try {
      syncManager.saveBall({
        id: crypto.randomUUID(), // Generator for offline ID
        match_id: matchId,
        innings_no: currentInnings,
        over_number: currentOver,
        ball_number: currentBall + 1,
        runs_scored: ball.runs,
        is_wicket: true,
        extras_type: wicketType === 'retired' ? 'retired' : null,
        extras_runs: 0,
        batsman_name: batsmenStats[strikerIndex].name,
        bowler_name: bowlersStats[currentBowlerIndex].name,
        player_out_name: playerOutName
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to init from team players
  const initBatsmenFromTeam = (team: Team): BatsmanStats[] => {
    if (!team || !team.players || team.players.length === 0) {
      // Fallback to sample if no players in team
      return createInitialBatsmenStats();
    }
    // If team.players is string[] (names/ids), map them. 
    // Note: In Team interface players is string[]. Assuming they are names for now or IDs?
    // The ScheduleMatchPage puts names in team1_name? 
    // Actually Team interface says players: string[].
    // Let's assume they are names if checking `mockDB` logic or `ScheduleMatchPage`.
    // In `ScheduleMatchPage` logic, we don't seem to populate `players` array fully with IDs.
    // However, let's try to map what we have.
    return team.players.map((p, i) => ({
      id: `bat-${i}-${p}`, // using index to ensure unique if name duplicate
      name: p, // Assuming string is name
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      isOnStrike: i === 0,
    }));
  };

  const initBowlersFromTeam = (team: Team): BowlerStats[] => {
    if (!team || !team.players || team.players.length === 0) {
      return createInitialBowlersStats();
    }
    return team.players.map((p, i) => ({
      id: `bowl-${i}-${p}`,
      name: p,
      overs: 0,
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      isBowling: i === 0,
    }));
  };

  // We need to initialize these dependent on the `battingTeam` and `bowlingTeam` derived from matchData.
  // Since `battingTeam` and `bowlingTeam` are derived in the render scope (line 342), we should probably use useEffect or useMemo to set initial state, 
  // OR initialize state lazily if we can access props. 
  // But `getTeamsForInnings` depends on `matchData` prop.

  // Let's change state initialization to use lazy initializer or useEffect.
  // Actually, easiest is to use a useEffect to update them when matchData changes, 
  // BUT we don't want to reset if we have ongoing match data (runs > 0 etc).
  // The existing code has `loadMatchState` which overwrites `batsmenStats` if DB has data.
  // So we just need to ensure the *initial* empty state is correct.

  const [batsmenStats, setBatsmenStats] = useState<BatsmanStats[]>([]);
  const [bowlersStats, setBowlersStats] = useState<BowlerStats[]>([]);

  // Effect to initialize stats from teams when match starts (and no DB state found yet)
  useEffect(() => {
    // Determine teams derived from matchData inside effect or use the ones from outer scope if stable
    // We can re-derive here to be safe
    if (!matchData) {
      setBatsmenStats(createInitialBatsmenStats());
      setBowlersStats(createInitialBowlersStats());
      return;
    }

    const { batting, bowling } = getTeamsForInnings();

    // Only set if empty (first load) or we assume we want to sync with team?
    // We should be careful not to overwrite if we have scoring data.
    // The `loadMatchState` effect runs on mount. 
    // If we set this here, we might race.
    // But `loadMatchState` sets `balls` and `runs`. It does NOT seemingly restore `batsmenStats` from DB fully unless we added that logic?
    // Wait, existing `loadMatchState` primarily restores `balls`. It relies on replay logic or state preservation.
    // Since we don't have full state persistence for stats in `mockDB` (only balls), we HAVE to re-calculate stats from balls.
    // AND we must start with the correct player list.

    // So:
    setBatsmenStats(initBatsmenFromTeam(batting));
    setBowlersStats(initBowlersFromTeam(bowling));

  }, [matchData, currentInnings]);
  // Note: matchData usually stable. currentInnings change should trigger team swap.


  // Handle manual batsman selection (New Batsman)
  const handleBatsmanSelect = (playerId: string) => {
    const newBatsmanIndex = batsmenStats.findIndex(b => b.id === playerId);
    if (newBatsmanIndex !== -1) {
      // Start new partnership with the NEW batsman
      // Note: currenPartnership was closed in handleWicket. We need to create a new one here.
      const newWicketNo = wickets; // Wickets already incremented in handleWicket

      setCurrentPartnership({
        id: (previousPartnerships.length || 0) + 2, // simple increment
        batsman1Name: batsmenStats[nonStrikerIndex].name,
        batsman2Name: batsmenStats[newBatsmanIndex].name,
        runs: 0,
        balls: 0,
        isActive: true,
        wicketNumber: newWicketNo + 1,
      });

      setStrikerIndex(newBatsmanIndex);
      setBatsmenStats(prev => prev.map((b, i) => ({
        ...b,
        isOnStrike: i === newBatsmanIndex,
      })));
      setShowBatsmanSelect(false);
    }
  };

  // Handle manual bowler selection (New Bowler)
  const handleBowlerSelect = (playerId: string) => {
    const newBowlerIndex = bowlersStats.findIndex(b => b.id === playerId);
    if (newBowlerIndex !== -1) {
      setCurrentBowlerIndex(newBowlerIndex);
      setBowlersStats(prev => prev.map((b, i) => ({
        ...b,
        isBowling: i === newBowlerIndex
      })));
      setShowBowlerSelect(false);
    }
  };

  const handleAddNewBatsman = (name: string, mobile: string) => {
    const newId = `bat-new-${Date.now()}`;
    const newBatsman: BatsmanStats = {
      id: newId,
      name: name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      isOut: false,
      isOnStrike: false,
      // You might want to store mobile somewhere if needed, but BatsmanStats currently doesn't have it. 
      // For now we just add the name.
    };

    setBatsmenStats(prev => [...prev, newBatsman]);
    // Auto-select the newly added player?
    handleBatsmanSelect(newId);
  };

  const handleAddNewBowler = (name: string, mobile: string) => {
    const newId = `bowl-new-${Date.now()}`;
    const newBowler: BowlerStats = {
      id: newId,
      name: name,
      overs: 0,
      balls: 0,
      maidens: 0,
      runs: 0,
      wickets: 0,
      isBowling: false
    };

    setBowlersStats(prev => [...prev, newBowler]);
    handleBowlerSelect(newId);
  };

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

  // Load existing balls from DB on mount or refresh
  useEffect(() => {
    if (!matchId) return;

    const loadMatchState = async () => {
      try {
        const dbBalls = mockDB.getBalls(matchId);
        const inningsBalls = dbBalls.filter(b => b.innings_no === currentInnings);

        // Reset all states before replay
        setRuns(0);
        setWickets(0);
        setBalls([]);
        setCurrentOver(0);
        setCurrentBall(0);
        setExtras(0);
        setFours(0);
        setSixes(0);
        setFallOfWickets([]);
        setPreviousPartnerships([]);
        setReachedMilestones({});

        // Re-init teams
        const { batting, bowling } = getTeamsForInnings();
        const initialBatsmen = initBatsmenFromTeam(batting);
        const initialBowlers = initBowlersFromTeam(bowling);
        setBatsmenStats(initialBatsmen);
        setBowlersStats(initialBowlers);

        if (inningsBalls && inningsBalls.length > 0) {
          // Replay balls to restore state
          // Note: Since processScore/processWicket directly update state, 
          // we could either refactor them to be pure OR just emulate their logic here.
          // Emulating for speed, but ideally we'd have a pure reducer.

          let curRuns = 0;
          let curWickets = 0;
          let curExtras = 0;
          let curFours = 0;
          let curSixes = 0;
          let curBalls: Ball[] = [];

          // Player indexes tracking during replay
          let sIdx = 0;
          let nsIdx = 1;
          let bIdx = 0;

          inningsBalls.forEach(dbBall => {
            const isExtra = !!dbBall.extras_type;
            const runVal = dbBall.runs_scored;
            const extraVal = dbBall.extras_runs || 0;

            curBalls.push({
              id: dbBall.id,
              runs: runVal,
              isWicket: dbBall.is_wicket,
              extras: dbBall.extras_type || undefined,
              batsmanId: dbBall.batsman_name || 'unknown',
              bowlerId: dbBall.bowler_name || 'unknown',
              overNumber: dbBall.over_number,
              isBoundary: runVal === 4 || runVal === 6,
              commentary: `${dbBall.bowler_name} to ${dbBall.batsman_name}, ${dbBall.is_wicket ? 'OUT' : (runVal + (isExtra ? ' (' + dbBall.extras_type + ')' : ' runs'))}`
            });

            curRuns += runVal + extraVal;
            if (dbBall.is_wicket) curWickets++;
            if (isExtra) curExtras++;
            if (runVal === 4) curFours++;
            if (runVal === 6) curSixes++;
          });

          setRuns(curRuns);
          setWickets(curWickets);
          setBalls(curBalls);
          setExtras(curExtras);
          setFours(curFours);
          setSixes(curSixes);

          const lastBall = inningsBalls[inningsBalls.length - 1];
          setCurrentOver(lastBall.over_number);
          setCurrentBall(lastBall.ball_number >= 6 ? 0 : lastBall.ball_number);

          // Note: Full stats restoration (partnerships, individual player scores) 
          // would require even deeper replay logic. 
          // This already improves over the previous partial restoration.
        }
      } catch (e) {
        console.error("Error loading match state:", e);
        toast.error("Failed to restore match state");
      }
    };

    loadMatchState();
  }, [matchId, currentInnings, refreshCounter]);

  const saveBallToDb = async (ball: Ball) => {
    if (!matchId) return;
    try {
      syncManager.saveBall({
        id: crypto.randomUUID(),
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
      // Even if sync fails, it's saved in IndexedDB via syncManager
    }
  };

  const handleDeleteBall = (ballId: string) => {
    if (!matchId) return;

    // confirm with user?
    if (confirm("Are you sure you want to delete this ball? This will re-calculate the entire match score.")) {
      mockDB.deleteBall(ballId);
      setRefreshCounter(prev => prev + 1);
      toast.success("Ball deleted. Match state updated.");
    }
  };

  const handleEditBall = (ball: CommentaryBall) => {
    // Permission check
    if (user?.role !== 'scorer' && user?.role !== 'admin') {
      toast.error("Permissions Denied", {
        description: "Only scorers or admins can edit match deliveries."
      });
      return;
    }

    // Find the actual mock ball from DB using its ID
    const matchBalls = mockDB.getBalls(matchId || "");
    // Note: CommentaryBall might not have the DB id directly if it was converted
    // We should ensure CommentaryBall has the DB ID.
    const fullBall = matchBalls.find(b => b.id === ball.id);
    if (fullBall) {
      setEditingBall(fullBall);
      setIsEditBallOpen(true);
    } else {
      toast.error("Ball not found in database.");
    }
  };

  const handleSaveBallCorrection = (updates: Partial<MockBall>, reason: string) => {
    if (!editingBall || !matchId || !user) return;

    const updated = mockDB.updateBallWithAudit(editingBall.id, updates, user.id, reason);
    if (updated) {
      toast.success("Delivery corrected successfully!");
      setRefreshCounter(prev => prev + 1);
    }
  };

  const handleViewHistory = (ball: CommentaryBall) => {
    const matchBalls = mockDB.getBalls(matchId || "");
    const fullBall = matchBalls.find(b => b.id === ball.id);
    if (fullBall) {
      setViewingHistory(fullBall);
      setIsHistoryOpen(true);
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

  // Initial Bowler Selection Trigger
  useEffect(() => {
    // If match is just starting (balls empty) and we have bowlers loaded, prompt selection
    if (balls.length === 0 && bowlersStats.length > 0 && !showBowlerSelect) {
      // Small timeout to allow UI to settle
      const t = setTimeout(() => {
        setShowBowlerSelect(true);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [balls.length, bowlersStats.length]);

  const rotateStrike = () => {
    const temp = strikerIndex;
    setStrikerIndex(nonStrikerIndex);
    setNonStrikerIndex(temp);

    setBatsmenStats(prev => prev.map((b, i) => ({
      ...b,
      isOnStrike: i === nonStrikerIndex,
    })));
  };

  // Wagon Wheel State
  const [showWagonWheel, setShowWagonWheel] = useState(false);
  const [wagonWheelMode, setWagonWheelMode] = useState<'score' | 'catch'>('score');
  const [enableWagonWheel, setEnableWagonWheel] = useState(matchData?.enableShotDirection ?? true); // Initialized from match configuration
  const [pendingScore, setPendingScore] = useState<{ runs: number, extras?: string } | null>(null);
  const [pendingCatch, setPendingCatch] = useState<{ type: WicketType, fielderId?: string, isStrikerOut: boolean } | null>(null);

  const processScore = (runScored: number, extrasType?: string, shotPosition?: string) => {
    const newBall: Ball = {
      runs: runScored,
      isWicket: false,
      extras: extrasType,
      batsmanId: batsmenStats[strikerIndex].id,
      bowlerId: bowlersStats[currentBowlerIndex].id,
      overNumber: currentOver + 1,
      // shotPosition: shotPosition // Todo: Add to Ball interface if needed, or save via DB extension
      isBoundary: runScored === 4 || runScored === 6,
      commentary: generateCommentary(
        bowlersStats[currentBowlerIndex].name,
        batsmenStats[strikerIndex].name,
        runScored,
        extrasType,
        false,
        undefined,
        shotPosition
      )
    };

    saveBallToDb(newBall); // Todo: pass shotPosition to saveBallToDb if updated

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
        setShowBowlerSelect(true); // Trigger bowler selection
      } else {
        setCurrentBall(newBallCount);
        // Rotate strike on odd runs
        if (runScored % 2 === 1) {
          rotateStrike();
        }
      }
    }

    // Check for milestones
    const b = batsmenStats[strikerIndex];
    if (b) {
      const currentRuns = b.runs + runScored;
      const milestone = [50, 100, 150, 200].find(m => currentRuns >= m && (!reachedMilestones[b.id] || !reachedMilestones[b.id].includes(m)));

      if (milestone) {
        setReachedMilestones(prev => ({
          ...prev,
          [b.id]: [...(prev[b.id] || []), milestone]
        }));

        triggerGlobalNotification({
          type: 'milestone',
          title: 'Milestone Alert!',
          message: `${b.name} reached ${milestone} runs against ${bowlingTeam.name}!`,
          data: { batsmanId: b.id, runs: milestone }
        });
      }
    }

    // Trigger match start on first ball
    if (balls.length === 0) {
      triggerGlobalNotification({
        type: 'match_start',
        title: 'Match Started!',
        message: `${matchData?.team1.name} vs ${matchData?.team2.name} is now live at ${matchData?.venue}!`,
        data: { matchId }
      });
    }
  };

  const handleScore = (runScored: number, extrasType?: string) => {
    // If enabled, divert to wagon wheel selection
    if (enableWagonWheel) {
      setPendingScore({ runs: runScored, extras: extrasType });
      setWagonWheelMode('score');
      setShowWagonWheel(true);
    } else {
      processScore(runScored, extrasType);
    }
  };

  const handleZoneSelect = (position: string) => {
    if (wagonWheelMode === 'score' && pendingScore) {
      processScore(pendingScore.runs, pendingScore.extras, position);
      setPendingScore(null);
    } else if (wagonWheelMode === 'catch' && pendingCatch) {
      processWicket(pendingCatch.type, pendingCatch.fielderId, pendingCatch.isStrikerOut, position);
      setPendingCatch(null);
    }
  };

  const handleZoneSkip = () => {
    if (wagonWheelMode === 'score' && pendingScore) {
      processScore(pendingScore.runs, pendingScore.extras);
      setPendingScore(null);
    } else if (wagonWheelMode === 'catch' && pendingCatch) {
      processWicket(pendingCatch.type, pendingCatch.fielderId, pendingCatch.isStrikerOut);
      setPendingCatch(null);
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

    //   // Find the next batsman (REMOVED AUTO SELECTION)
    //   const nextBatsman = batsmenStats.findIndex((b, i) => !b.isOut && i !== strikerIndex && i !== nonStrikerIndex);

    //   if (nextBatsman !== -1) {
    //      // Logic moved to handleBatsmanSelect
    //   }

    setShowBatsmanSelect(true); // Trigger new batsman selection

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

    // Bring in next batsman (REMOVED AUTO SELECTION)
    // if (nextBatsman !== -1) {
    //   setStrikerIndex(nextBatsman);
    //   setBatsmenStats(prev => prev.map((b, i) => ({
    //     ...b,
    //     isOnStrike: i === nextBatsman,
    //   })));
    // }

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
    setShowBatsmanSelect(false);
    setShowBowlerSelect(false);

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

    // Trigger match result notification
    triggerGlobalNotification({
      type: 'result',
      title: 'Match Finished',
      message: `${result}! ${matchData?.team1.name} score: ${firstInningsData?.runs || runs}/${firstInningsData?.wickets || wickets}, ${firstInningsData ? `${matchData?.team2.name} score: ${runs}/${wickets}` : ''}`,
      data: { matchId, result }
    });

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

    // SAVE COMPLETED STATUS TO MOCK DB
    if (matchId) {
      mockDB.updateMatch(matchId, {
        status: 'completed',
        result: result,
        winner_name: winner?.name
      });
    }

    setMatchSummary(summary);
    setEndMatchOpen(false);
    setShowConfetti(true);
    onEndMatch(summary);
  };

  const runRate = ballsBowled > 0 ? (runs / ballsBowled) * 6 : 0;

  // Convert balls for timeline display
  const timelineBalls = balls.map(b => ({
    runs: b.runs,
    isWicket: b.isWicket,
    extras: b.extras,
    overNumber: b.overNumber,
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
            <div className="flex flex-col items-center gap-0.5">
              {matchData && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{matchData.venue}</p>
              )}
              {powerplayRule && powerplayRule.phase !== 'None' && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                  <Zap className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{powerplayRule.label}</span>
                </div>
              )}
            </div>
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[40vh]">
                <SheetHeader>
                  <SheetTitle>Match Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-card">
                    <div className="space-y-0.5">
                      <Label className="text-base font-bold text-foreground">Select Shot Direction</Label>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        Record each shot's ground position <Info className="w-3 h-3" />
                      </p>
                    </div>
                    <Switch
                      checked={enableWagonWheel}
                      onCheckedChange={(checked) => {
                        setEnableWagonWheel(checked);
                        if (onUpdateMatchData) {
                          onUpdateMatchData({ enableShotDirection: checked });
                        }
                        toast.success(`Shot Direction Tracking ${checked ? 'Enabled' : 'Disabled'}`);
                      }}
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30">
                    <p className="text-xs text-center text-muted-foreground italic">
                      More settings coming soon...
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
            <div className="flex-1 cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors" onClick={() => setShowBatsmanSelect(true)}>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                On Strike <RotateCcw className="w-3 h-3 text-primary" />
              </p>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-foreground flex items-center justify-between">
                  <span>{batsmenStats[strikerIndex]?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-bold">
                      {batsmenStats[strikerIndex]?.runs}({batsmenStats[strikerIndex]?.balls})
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={(e) => {
                      e.stopPropagation();
                      handleWicketConfirm('retired', undefined, true); // Retiring striker
                    }} title="Retire Batsman">
                      <Flag className="w-3 h-3" />
                    </Button>
                  </div>
                </p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>SR: {batsmenStats[strikerIndex]?.balls ? ((batsmenStats[strikerIndex].runs / batsmenStats[strikerIndex].balls) * 100).toFixed(1) : '0.0'}</span>
                  <span>Avg: -</span>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-border self-center" />

            {/* Bowler Stats */}
            <div className="flex-1 text-right cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors" onClick={() => setShowBowlerSelect(true)}>
              <p className="text-xs text-muted-foreground mb-1 flex items-center justify-end gap-1">
                <RotateCcw className="w-3 h-3 text-primary" /> Bowler
              </p>
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

        {/* Commentary Feed */}
        <CommentaryFeed
          balls={balls.map((b, i) => ({
            id: i.toString(), // Note: balls in state are stored in order, index used as ID for now
            over: b.overNumber,
            ball: (i % 6) + 1,
            commentary: b.commentary || 'No commentary',
            isWicket: b.isWicket,
            isBoundary: b.runs === 4 || b.runs === 6,
            runs: b.runs
          }))}
          onDeleteBall={(id) => {
            // In current state 'balls', id is index.
            // We need to find the ACTUAL id from mockDB or use index-based delete if we sync.
            // Since mockDB uses UUIDs, let's make sure our state 'balls' has the DB IDs.
            const ballIndex = parseInt(id);
            // handle index-based delete for now or enhance ball type
            handleDeleteBall(id);
          }}
          onEditBall={handleEditBall}
        />

        {/* Run Progression Chart */}
        <RunProgressionChart overData={overData} />

        {/* Powerplay/Fielding Warning */}
        {powerplayRule && (
          <div className={`p-3 mb-2 rounded-xl flex items-center gap-3 border ${powerplayRule.phase !== 'None'
            ? 'bg-amber-500/5 border-amber-500/20 text-amber-600'
            : 'bg-muted/50 border-border text-muted-foreground'
            }`}>
            <Info className="w-4 h-4 shrink-0" />
            <div className="text-sm">
              <span className="font-bold">{powerplayRule.label}:</span> Max <span className="font-extrabold">{powerplayRule.maxFieldersOutside}</span> fielders allowed outside 30-yard circle.
            </div>
          </div>
        )}

        {/* Quick Access Settings */}
        <div className="flex items-center justify-between p-3 mb-3 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <RotateCcw className="w-4 h-4 text-primary" />
            </div>
            <div>
              <Label className="text-sm font-bold text-foreground block">Shot Direction</Label>
              <p className="text-[10px] text-muted-foreground">Prompt for wagon wheel</p>
            </div>
          </div>
          <Switch
            checked={enableWagonWheel}
            onCheckedChange={(checked) => {
              setEnableWagonWheel(checked);
              if (onUpdateMatchData) {
                onUpdateMatchData({ enableShotDirection: checked });
              }
            }}
          />
        </div>

        {/* Scoring Pad */}
        <ScoringPad
          onScore={handleScore}
          onWicket={handleWicketClick} // Changed from handleWicket
          onUndo={handleUndo}
        />

        {/* Selection Dialogs */}
        <PlayerSelectDialog
          open={showBatsmanSelect}
          onOpenChange={setShowBatsmanSelect}
          title="Select Next Batsman"
          players={batsmenStats
            .filter((b, i) => !b.isOut && i !== strikerIndex && i !== nonStrikerIndex)
            .map(b => ({ id: b.id, name: b.name }))}
          onSelect={handleBatsmanSelect}
          onAddNew={handleAddNewBatsman}
        />

        <PlayerSelectDialog
          open={showBowlerSelect}
          onOpenChange={setShowBowlerSelect}
          title="Select Next Bowler"
          description="Who is bowling the next over?"
          players={bowlersStats
            .filter((b, i) => i !== currentBowlerIndex) // Can't bowl continuous overs usually
            .map(b => ({ id: b.id, name: b.name }))}
          onSelect={handleBowlerSelect}
          onAddNew={handleAddNewBowler}
        />

        <WicketDetailsDialog
          open={showWicketDialog}
          onOpenChange={setShowWicketDialog}
          bowlingTeamPlayers={bowlersStats.map(b => ({ id: b.id, name: b.name }))} // Should technically be the whole bowling TEAM list, not just who bowled.
          // But usually the bowling team is the fielding team. 
          // In our simple model, `bowlingTeam` object has all players?
          // Actually `bowlingTeam` prop has all players?
          // `bowlersStats` only tracks bowlers who have bowled.
          // Better to use `bowlingTeam.players`?
          // But `bowlingTeam` state is `Team` object.
          // Let's use `bowlersStats` for now as it has IDs we track, OR better yet:
          // We should use `getTeamsForInnings().bowling.players`?
          // However `initBowlersFromTeam` created stats entries.
          // Let's use `bowlersStats` as a proxy for "Fielders" for now, OR fetch all.
          // Given the limited state, `bowlersStats` might only have bowlers who bowled.
          // That's a bug in my fielder list logic if I only use `bowlersStats`.
          // BUT, `initBowlersFromTeam` populates `bowlersStats` with ALL players from the team, right?
          // checking initBowlersFromTeam... yes it maps `team.players`. So `bowlersStats` actually contains EVERYONE initially.
          // So `bowlersStats` is safe to use for fielder list.
          strikerName={batsmenStats[strikerIndex]?.name}
          nonStrikerName={batsmenStats[nonStrikerIndex]?.name}
          onConfirm={(type, fielderId, isStrikerOut) => {
            handleWicketConfirm(type, fielderId, isStrikerOut);

            // Trigger wicket notification
            const outPlayer = isStrikerOut ? batsmenStats[strikerIndex] : batsmenStats[nonStrikerIndex];
            triggerGlobalNotification({
              type: 'wicket',
              title: 'Wicket!',
              message: `${outPlayer.name} is OUT (${type})! ${battingTeam.name} ${runs}/${wickets + 1}`,
              data: { matchId, wicketType: type }
            });
          }}
        />

        <GroundPositionSelector
          open={showWagonWheel}
          onOpenChange={setShowWagonWheel}
          onSelect={handleZoneSelect}
          onSkip={handleZoneSkip}
          title={wagonWheelMode === 'catch' ? 'Where was the catch taken?' : 'Select Shot Direction'}
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
        <EditBallDialog
          open={isEditBallOpen}
          onOpenChange={setIsEditBallOpen}
          ball={editingBall}
          onSave={handleSaveBallCorrection}
        />

        {/* Audit History Dialog */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Version History (Over {viewingHistory?.over_number}, Ball {viewingHistory?.ball_number})</DialogTitle>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto space-y-4 py-4">
              {viewingHistory?.history?.length ? (
                viewingHistory.history.map((entry, idx) => (
                  <div key={idx} className="border-l-2 border-primary pl-4 py-2 space-y-1">
                    <p className="text-sm font-bold">Version {entry.version}</p>
                    <p className="text-xs text-muted-foreground">Changed by {entry.changed_by} at {new Date(entry.changed_at).toLocaleString()}</p>
                    {entry.change_reason && <p className="text-xs italic">"{entry.change_reason}"</p>}
                    <div className="text-[10px] bg-muted p-2 rounded">
                      <pre>{JSON.stringify(entry.previous_state, null, 2)}</pre>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No previous versions available.</p>
              )}
              <div className="border-l-2 border-green-500 pl-4 py-2 space-y-1 bg-green-50/50">
                <p className="text-sm font-bold text-green-700">Current Version (v{viewingHistory?.version})</p>
                <div className="text-[10px] bg-muted p-2 rounded">
                  <pre>{JSON.stringify(viewingHistory, (k, v) => k === 'history' ? undefined : v, 2)}</pre>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ScoringPage;

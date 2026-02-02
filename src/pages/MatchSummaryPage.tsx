import React from 'react';
import { ArrowLeft, Share2, Trophy, Target, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CricketBat, CricketBall } from '@/components/icons/CricketIcons';
import { Team } from '@/types/cricket';
import { BatsmanStats } from '@/components/scoring/BattingScorecard';
import { BowlerStats } from '@/components/scoring/BowlingScorecard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MatchHighlightsTimeline from '@/components/match/MatchHighlightsTimeline';
import HighlightsReel from '@/components/match/HighlightsReel';
import { Film, List } from 'lucide-react';

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

interface MatchSummaryData {
  team1: Team;
  team2: Team;
  venue: string;
  overs: number;
  innings1: InningsData;
  innings2?: InningsData;
  result: string;
  winner?: Team;
}

interface MatchSummaryPageProps {
  onBack: () => void;
  onNewMatch: () => void;
  matchSummary: MatchSummaryData;
  matchId?: string; // Optional match ID for highlights
}

const InningsScoreCard: React.FC<{ innings: InningsData; inningsNumber: number }> = ({
  innings,
  inningsNumber
}) => {
  const oversDisplay = `${innings.overs}.${innings.balls}`;
  const runRate = (innings.overs * 6 + innings.balls) > 0
    ? ((innings.runs / (innings.overs * 6 + innings.balls)) * 6).toFixed(2)
    : '0.00';

  // Find top batsman
  const topBatsman = [...innings.batsmenStats].sort((a, b) => b.runs - a.runs)[0];
  // Find top bowler
  const topBowler = [...innings.bowlersStats].sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];

  return (
    <div className="space-y-4">
      {/* Team Score */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-foreground font-bold text-lg">{innings.battingTeam.name}</h3>
          <span className="text-xs text-muted-foreground">Innings {inningsNumber}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-foreground">{innings.runs}</span>
          <span className="text-2xl text-muted-foreground">/{innings.wickets}</span>
          <span className="text-muted-foreground ml-2">({oversDisplay} ov)</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-foreground">{runRate}</p>
          <p className="text-xs text-muted-foreground">Run Rate</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-primary">{innings.fours}</p>
          <p className="text-xs text-muted-foreground">Fours</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xl font-bold text-gold">{innings.sixes}</p>
          <p className="text-xs text-muted-foreground">Sixes</p>
        </div>
      </div>

      {/* Top Performers */}
      {topBatsman && (
        <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <CricketBat className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-foreground font-semibold">{topBatsman.name}</p>
            <p className="text-muted-foreground text-sm">
              {topBatsman.runs} ({topBatsman.balls}) • {topBatsman.fours}x4 {topBatsman.sixes}x6
            </p>
          </div>
          {topBatsman.balls > 0 && (
            <div className="text-right">
              <p className="text-primary font-bold">{((topBatsman.runs / topBatsman.balls) * 100).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">SR</p>
            </div>
          )}
        </div>
      )}

      {topBowler && topBowler.overs > 0 && (
        <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
          <div className="w-10 h-10 rounded-full bg-live/20 flex items-center justify-center">
            <CricketBall className="w-5 h-5 text-live" />
          </div>
          <div className="flex-1">
            <p className="text-foreground font-semibold">{topBowler.name}</p>
            <p className="text-muted-foreground text-sm">
              {topBowler.wickets}/{topBowler.runs} ({topBowler.overs}.{topBowler.balls} ov)
            </p>
          </div>
          <div className="text-right">
            <p className="text-live font-bold">
              {(topBowler.runs / (topBowler.overs + topBowler.balls / 6)).toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">Econ</p>
          </div>
        </div>
      )}
    </div>
  );
};

const MatchSummaryPage: React.FC<MatchSummaryPageProps> = ({
  onBack,
  onNewMatch,
  matchSummary,
  matchId
}) => {
  const { innings1, innings2, venue, result, winner } = matchSummary;
  const [highlightsView, setHighlightsView] = React.useState<'timeline' | 'reel'>('timeline');

  // Determine man of the match from both innings
  const allBatsmen = [
    ...innings1.batsmenStats,
    ...(innings2?.batsmenStats || [])
  ];
  const topScorer = [...allBatsmen].sort((a, b) => b.runs - a.runs)[0];

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Match Summary</h1>
          <Button variant="ghost" size="icon">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Result Banner */}
        <div className="gradient-scoreboard rounded-2xl p-5 shadow-elevated">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-gold" />
            <span className="text-scoreboard-text font-bold text-sm uppercase tracking-wide">
              Match Complete
            </span>
          </div>

          <div className="text-center">
            <p className="text-scoreboard-text text-lg font-bold mb-2">{result}</p>
            {winner && (
              <p className="text-gold text-sm">🏆 {winner.name}</p>
            )}
          </div>

          <div className="mt-4 bg-scoreboard-text/10 rounded-lg p-3 text-center">
            <p className="text-scoreboard-text/60 text-xs">{venue}</p>
          </div>
        </div>

        {/* Man of the Match */}
        {topScorer && topScorer.runs > 0 && (
          <div className="bg-gradient-to-r from-gold/20 to-gold/5 rounded-xl p-4 border border-gold/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gold font-medium uppercase tracking-wide">Man of the Match</p>
                <h3 className="text-foreground font-bold text-lg">{topScorer.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {topScorer.runs} runs ({topScorer.balls} balls)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="scorecard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
          </TabsList>

          <TabsContent value="scorecard" className="mt-4 space-y-4">
            {/* Innings Tabs */}
            {innings2 ? (
              <Tabs defaultValue="innings1" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="innings1">1st Innings</TabsTrigger>
                  <TabsTrigger value="innings2">2nd Innings</TabsTrigger>
                </TabsList>
                <TabsContent value="innings1" className="mt-4">
                  <InningsScoreCard innings={innings1} inningsNumber={1} />
                </TabsContent>
                <TabsContent value="innings2" className="mt-4">
                  <InningsScoreCard innings={innings2} inningsNumber={2} />
                </TabsContent>
              </Tabs>
            ) : (
              <InningsScoreCard innings={innings1} inningsNumber={1} />
            )}

            {/* Match Statistics */}
            {innings2 && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <h3 className="text-foreground font-bold mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Match Overview
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{innings1.battingTeam.name}</span>
                    <span className="text-foreground font-bold">
                      {innings1.runs}/{innings1.wickets} ({innings1.overs}.{innings1.balls} ov)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{innings2.battingTeam.name}</span>
                    <span className="text-foreground font-bold">
                      {innings2.runs}/{innings2.wickets} ({innings2.overs}.{innings2.balls} ov)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="highlights" className="mt-4 space-y-4">
            {matchId ? (
              <>
                {/* View Toggle */}
                <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-lg p-1">
                  <Button
                    variant={highlightsView === 'timeline' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setHighlightsView('timeline')}
                    className="flex-1"
                  >
                    <List className="w-4 h-4 mr-2" />
                    Timeline
                  </Button>
                  <Button
                    variant={highlightsView === 'reel' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setHighlightsView('reel')}
                    className="flex-1"
                  >
                    <Film className="w-4 h-4 mr-2" />
                    Reel
                  </Button>
                </div>

                {/* Highlights Content */}
                {highlightsView === 'timeline' ? (
                  <MatchHighlightsTimeline matchId={matchId} />
                ) : (
                  <HighlightsReel matchId={matchId} />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Highlights not available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>


        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            variant="pitch"
            className="w-full h-12"
            onClick={onNewMatch}
          >
            Start New Match
          </Button>
          <Button
            variant="outline"
            className="w-full h-12"
            onClick={onBack}
          >
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MatchSummaryPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/layout/BottomNav';
import HomePage from './HomePage';
import ScoringPage, { MatchSummaryData } from './ScoringPage';
import TournamentsPage from './TournamentsPage';
import ProfilePage from './ProfilePage';
import MatchWizardPage from './MatchWizardPage';
import MatchSummaryPage from './MatchSummaryPage';
import { Team } from '@/types/cricket';

interface MatchData {
  team1: Team;
  team2: Team;
  venue: string;
  overs: number;
  tossWinner: Team;
  tossDecision: 'bat' | 'bowl';
}

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('/');
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [matchSummary, setMatchSummary] = useState<MatchSummaryData | null>(null);

  const handleNavigate = (path: string) => {
    // Route external paths to react-router
    if (path === '/teams' || path.startsWith('/teams/') || path === '/join-team' || path.startsWith('/auth/')) {
      navigate(path);
      return;
    }
    setCurrentPath(path);
  };

  const handleStartMatch = (data: MatchData) => {
    setMatchData(data);
    setCurrentPath('/score');
  };

  const handleEndMatch = (summary: MatchSummaryData) => {
    setMatchSummary(summary);
    setCurrentPath('/match-summary');
  };

  const handleNewMatch = () => {
    setMatchData(null);
    setMatchSummary(null);
    setCurrentPath('/match-wizard');
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={handleNavigate} />;
      case '/score':
        return (
          <ScoringPage 
            onBack={() => handleNavigate('/')} 
            onEndMatch={handleEndMatch}
            matchData={matchData} 
          />
        );
      case '/match-wizard':
        return (
          <MatchWizardPage
            onBack={() => handleNavigate('/')}
            onStartMatch={handleStartMatch}
          />
        );
      case '/match-summary':
        return matchSummary ? (
          <MatchSummaryPage
            onBack={() => handleNavigate('/')}
            onNewMatch={handleNewMatch}
            matchSummary={matchSummary}
          />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        );
      case '/tournaments':
        return <TournamentsPage onNavigate={handleNavigate} />;
      case '/profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Hide bottom nav on certain routes and when using sidebar
  const hideBottomNav = currentPath === '/score' || currentPath === '/match-wizard' || currentPath === '/match-summary';

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
      {/* Only show bottom nav on mobile, sidebar handles desktop navigation */}
      {!hideBottomNav && (
        <div className="md:hidden">
          <BottomNav currentPath={currentPath} onNavigate={handleNavigate} />
        </div>
      )}
    </div>
  );
};

export default Index;

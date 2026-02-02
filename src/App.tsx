import { Toaster } from "@/components/ui/toaster"; // HMR Trigger
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import JoinTeamPage from "./pages/JoinTeamPage";
import TeamsPage from "./pages/TeamsPage";
import CreateTeamPage from "./pages/CreateTeamPage";
import TeamDetailsPage from "./pages/TeamDetailsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import MatchHistoryPage from "./pages/MatchHistoryPage";
import NotificationsPage from "./pages/NotificationsPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";
import CreateTournamentPage from "./pages/CreateTournamentPage";
import TournamentDetailsPage from "./pages/TournamentDetailsPage";
import TournamentsPage from "./pages/TournamentsPage";
import ProfilePage from "./pages/ProfilePage";
import ScheduleMatchPage from "./pages/ScheduleMatchPage";
import MatchLobbyPage from "./pages/MatchLobbyPage";
import LookingPage from "./pages/LookingPage";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import CreateTournamentPageOrg from "./pages/organizer/CreateTournamentPage";
import GroundsPage from "./pages/organizer/GroundsPage";
import AddGroundPage from "./pages/organizer/AddGroundPage";
import TournamentManagePage from "./pages/organizer/TournamentManagePage";
import MyCricketPage from "./pages/MyCricketPage";
import BallCategoryPage from "./pages/BallCategoryPage";
import NetworkPage from "./pages/NetworkPage";
import ActivityFeedPage from "./pages/ActivityFeedPage";
import ChallengeDashboard from "./components/match/ChallengeDashboard";
import OrganizerPlayerManagementPage from "./pages/organizer/OrganizerPlayerManagementPage";
import AdminVerificationDashboard from "./pages/admin/AdminVerificationDashboard";
import CSVManagerPage from "./pages/CSVManagerPage";

const queryClient = new QueryClient();

// Wrapper to conditionally show sidebar
function AppRoutes() {
  const location = useLocation();

  // Hide sidebar on auth pages
  const hideSidebarPaths = ['/auth/signin', '/auth/signup', '/auth/verify-otp'];
  const showSidebar = !hideSidebarPaths.some(path => location.pathname.startsWith(path));

  const navigate = useNavigate();
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <AppLayout showSidebar={showSidebar}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/feed" element={<ActivityFeedPage />} />
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        <Route path="/auth/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/join-team" element={<JoinTeamPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/teams/create" element={<CreateTeamPage />} />
        <Route path="/teams/:teamId" element={<TeamDetailsPage />} />
        <Route path="/tournaments" element={<TournamentsPage onNavigate={handleNavigate} />} />
        <Route path="/tournaments/create" element={<CreateTournamentPage />} />
        <Route path="/tournaments/:tournamentId" element={<TournamentDetailsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage onNavigate={handleNavigate} />} />
        <Route path="/leaderboard/:type" element={<LeaderboardPage onNavigate={handleNavigate} />} />
        <Route path="/my-cricket" element={<MyCricketPage />} />
        <Route path="/matches/ball/:ballType" element={<BallCategoryPage />} />
        <Route path="/matches" element={<MatchHistoryPage onNavigate={handleNavigate} />} />
        <Route path="/notifications" element={<NotificationsPage onNavigate={handleNavigate} />} />
        <Route path="/player/:playerId" element={<PlayerProfilePage onNavigate={handleNavigate} />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/schedule-match" element={<ScheduleMatchPage />} />
        <Route path="/match/:matchId" element={<MatchLobbyPage />} />
        <Route path="/looking" element={<LookingPage />} />
        <Route path="/challenges" element={<ChallengeDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/organizer/create-tournament" element={<CreateTournamentPageOrg />} />
        <Route path="/organizer/grounds" element={<GroundsPage />} />
        <Route path="/organizer/grounds/add" element={<AddGroundPage />} />
        <Route path="/organizer/tournament/:tournamentId" element={<TournamentManagePage />} />
        <Route path="/organizer/player-management" element={<OrganizerPlayerManagementPage />} />
        <Route path="/admin/verification" element={<AdminVerificationDashboard />} />
        <Route path="/csv-manager" element={<CSVManagerPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

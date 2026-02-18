import { toast } from 'sonner';
import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Trophy,
  History,
  Medal,
  Bell,
  User,
  UserPlus,
  Plus,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Zap,
  Box,
  Circle,
  Dribbble,
  LayoutList,
  LayoutDashboard,
  ShoppingBag,
  Info,
  Briefcase
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import BottomNav from './BottomNav';

const mainNavItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Teams', url: '/teams', icon: Users },
  { title: 'Shop', url: '/shop', icon: ShoppingBag },
  { title: 'Tournaments', url: '/tournaments', icon: Trophy },
  { title: 'Matches', url: '/matches', icon: History },
  { title: 'Player Leaderboard', url: '/leaderboard/players', icon: Medal },
  { title: 'Team Leaderboard', url: '/leaderboard/teams', icon: Trophy },
  { title: 'My Cricket', url: '/my-cricket', icon: LayoutDashboard },
];

const ballTypeItems = [
  { title: 'All Matches', url: '/matches/ball/all', icon: LayoutList },
  { title: 'Tennis Ball', url: '/matches/ball/tennis', icon: Dribbble },
  { title: 'Box Cricket', url: '/matches/ball/box', icon: Box },
  { title: 'Leather Ball', url: '/matches/ball/leather', icon: Circle },
  { title: 'Stitch Ball', url: '/matches/ball/stitch', icon: Zap },
];

const quickActions = [
  { title: 'Create Team', url: '/teams/create', icon: Plus },
  { title: 'Join Team', url: '/join-team', icon: UserPlus },
  { title: 'Create Tournament', url: '/tournaments/create', icon: Trophy },
  { title: 'Schedule Match', url: '/schedule-match', icon: Calendar },
];

const companyNavItems = [
  { title: 'About Us', url: '/about', icon: Info },
  { title: 'Services', url: '/services', icon: Briefcase },
  { title: 'Our Team', url: '/team', icon: Users },
];

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!showSidebar) {
    return <>{children}</>;
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/auth/login');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleNavClick = (url: string) => {
    navigate(url);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Header with Logo */}
      <div className="h-20 flex items-center px-6 border-b border-border/40">
        <div className={cn(
          "flex items-center gap-4 w-full",
          collapsed && "justify-center px-0"
        )}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="font-bold text-xl tracking-tight text-foreground">cric.netrik</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Pro Scorer</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
        )}
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <button
              key={item.title}
              onClick={() => handleNavClick(item.url)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group relative overflow-hidden",
                "hover:bg-primary/5 hover:text-primary",
                collapsed && "justify-center px-3",
                isActive(item.url)
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary hover:text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive(item.url) ? "text-primary-foreground" : "group-hover:text-primary")} />
              {!collapsed && <span className="font-medium">{item.title}</span>}

              {isActive(item.url) && !collapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
              )}
            </button>
          ))}

          {/* Notifications */}
          <button
            onClick={() => handleNavClick('/notifications')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
              "hover:bg-muted/50",
              collapsed && "justify-center px-2",
              isActive('/notifications') && "bg-primary/10 text-primary font-medium"
            )}
          >
            <div className="relative">
              <Bell className={cn("w-5 h-5 shrink-0", isActive('/notifications') && "text-primary")} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            )}
          </button>
        </nav>

        {/* Cricket Categories */}
        <div className="mt-6">
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Cricket Categories
            </p>
          )}
          <nav className="space-y-1">
            {ballTypeItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavClick(item.url)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left group relative overflow-hidden",
                  "hover:bg-primary/5 hover:text-primary",
                  collapsed && "justify-center px-3",
                  isActive(item.url)
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive(item.url) ? "text-primary" : "group-hover:text-primary")} />
                {!collapsed && <span className="text-sm">{item.title}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Actions */}
        {!collapsed && (
          <div className="mt-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Quick Actions
            </p>
            <nav className="space-y-1">
              {quickActions.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleNavClick(item.url)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-muted/50 text-muted-foreground text-left"
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{item.title}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
        {/* Company Section */}
        <div className="mt-6">
          {!collapsed && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Company
            </p>
          )}
          <nav className="space-y-1">
            {companyNavItems.map((item) => (
              <button
                key={item.title}
                onClick={() => handleNavClick(item.url)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-left group relative overflow-hidden",
                  "hover:bg-primary/5 hover:text-primary",
                  collapsed && "justify-center px-3",
                  isActive(item.url)
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive(item.url) ? "text-primary" : "group-hover:text-primary")} />
                {!collapsed && <span className="text-sm">{item.title}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer with Profile */}
      <div className="p-2 border-t border-border mt-auto">
        {user ? (
          <>
            <button
              onClick={() => handleNavClick('/profile')}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all text-left",
                collapsed && "justify-center"
              )}
            >
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={(user as any)?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {getInitials(user?.fullName || 'U')}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </button>
            {!collapsed && (
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-sm">Sign Out</span>
              </Button>
            )}
          </>
        ) : (
          <button
            onClick={() => handleNavClick('/auth/signin')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
              "hover:bg-muted/50",
              collapsed && "justify-center"
            )}
          >
            <User className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-500 ease-in-out shrink-0 relative z-20 shadow-xl",
          collapsed ? "w-20" : "w-72"
        )}
      >
        <SidebarContent />
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-8 -right-3 w-8 h-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 z-50 group"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </aside>

      {/* Mobile Header and Sheet */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex lg:hidden items-center h-14 px-4 border-b border-border bg-card sticky top-0 z-40">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">cric.netrik</span>
          </div>
        </header>



        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Bottom Navigation for Mobile */}
        <div className="lg:hidden">
          <BottomNav currentPath={location.pathname} onNavigate={handleNavClick} />
        </div>
      </div>
    </div>
  );
}

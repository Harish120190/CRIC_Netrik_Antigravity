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
  Calendar
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
  { title: 'Tournaments', url: '/tournaments', icon: Trophy },
  { title: 'Matches', url: '/matches', icon: History },
  { title: 'Leaderboard', url: '/leaderboard', icon: Medal },
];

const quickActions = [
  { title: 'Create Team', url: '/teams/create', icon: Plus },
  { title: 'Join Team', url: '/join-team', icon: UserPlus },
  { title: 'Create Tournament', url: '/tournaments/create', icon: Trophy },
  { title: 'Schedule Match', url: '/schedule-match', icon: Calendar },
];

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
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
    await signOut();
    navigate('/auth/signin');
  };

  const handleNavClick = (url: string) => {
    navigate(url);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Header with Logo */}
      <div className="p-4 border-b border-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">CricNest</span>
              <span className="text-xs text-muted-foreground">Cricket Scoring</span>
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
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                "hover:bg-muted/50",
                collapsed && "justify-center px-2",
                isActive(item.url) && "bg-primary/10 text-primary font-medium"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive(item.url) && "text-primary")} />
              {!collapsed && <span>{item.title}</span>}
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
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {getInitials(profile?.full_name || 'U')}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </button>
            {!collapsed && (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg transition-all hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-sm">Sign Out</span>
              </button>
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
          "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0 relative",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors z-10"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
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
            <span className="font-semibold text-foreground">CricNest</span>
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

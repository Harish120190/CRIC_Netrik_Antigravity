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
  LogOut
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

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
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();

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

  return (
    <Sidebar 
      className={cn(
        "border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      collapsible="icon"
    >
      {/* Header with Logo */}
      <SidebarHeader className="p-4">
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
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                        "hover:bg-muted/50",
                        collapsed && "justify-center px-2"
                      )}
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className={cn("w-5 h-5 shrink-0", isActive(item.url) && "text-primary")} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Notifications with badge */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/notifications')}
                  tooltip={collapsed ? 'Notifications' : undefined}
                >
                  <NavLink
                    to="/notifications"
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      "hover:bg-muted/50",
                      collapsed && "justify-center px-2"
                    )}
                    activeClassName="bg-primary/10 text-primary font-medium"
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
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {quickActions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-muted/50 text-muted-foreground"
                        activeClassName="bg-primary/10 text-primary"
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="text-sm">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer with Profile */}
      <SidebarFooter className="p-2 mt-auto border-t border-border">
        {user ? (
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all cursor-pointer",
            collapsed && "justify-center"
          )}
          onClick={() => navigate('/profile')}
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
          </div>
        ) : (
          <SidebarMenuButton
            asChild
            tooltip={collapsed ? 'Sign In' : undefined}
          >
            <NavLink
              to="/auth/signin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                "hover:bg-muted/50",
                collapsed && "justify-center"
              )}
              activeClassName="bg-primary/10 text-primary"
            >
              <User className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Sign In</span>}
            </NavLink>
          </SidebarMenuButton>
        )}

        {user && !collapsed && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg transition-all hover:bg-destructive/10 text-muted-foreground hover:text-destructive w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm">Sign Out</span>
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

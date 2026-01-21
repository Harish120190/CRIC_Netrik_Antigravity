import React from 'react';
import { Bell, BellOff, Check, CheckCheck, Trophy, Users, MessageCircle, Award, UserPlus } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationsPageProps {
  onNavigate: (path: string) => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Trophy className="w-5 h-5 text-primary" />;
      case 'match_reminder':
        return <Bell className="w-5 h-5 text-orange-500" />;
      case 'tournament_invite':
        return <Trophy className="w-5 h-5 text-purple-500" />;
      case 'tournament_registration':
      case 'tournament_registration_response':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'team':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'badge':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification data
    if (notification.data?.match_id) {
      onNavigate(`/match/${notification.data.match_id}`);
    } else if (notification.data?.team_id) {
      onNavigate(`/teams/${notification.data.team_id}`);
    } else if (notification.data?.player_id) {
      onNavigate(`/player/${notification.data.player_id}`);
    }
  };

  const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => (
    <button
      onClick={() => handleNotificationClick(notification)}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-xl transition-all text-left",
        notification.read
          ? "bg-card"
          : "bg-primary/5 border border-primary/20"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
        notification.read ? "bg-muted" : "bg-primary/10"
      )}>
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium line-clamp-1",
          !notification.read && "text-foreground"
        )}>
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Notifications" />

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Header Actions */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 && 's'}
            </p>
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-1">
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-card rounded-xl">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <BellOff className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm mt-1">You'll be notified about match updates, team invites, and more</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;

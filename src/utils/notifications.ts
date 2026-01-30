import { generateUUID } from '@/services/mockDatabase';

const NOTIFICATION_STORAGE_KEY = 'cric_hub_notifications';

export interface NotificationPayload {
    type: 'match_start' | 'wicket' | 'milestone' | 'result';
    title: string;
    message: string;
    data?: any;
}

export const triggerGlobalNotification = (payload: NotificationPayload) => {
    // In a real app, this would be a server-side push notification.
    // In our mock environment, we simulate this by adding notifications for ALL users
    // who have the corresponding preference enabled.

    try {
        const usersJson = localStorage.getItem('cric_hub_users');
        const users = usersJson ? JSON.parse(usersJson) : [];

        const notificationsJson = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];

        const newNotifications = users.map((user: any) => {
            const prefs = user.notificationPreferences || {
                matchStart: true,
                wickets: true,
                milestones: true,
                results: true,
            };

            let shouldNotify = false;
            if (payload.type === 'match_start' && prefs.matchStart) shouldNotify = true;
            if (payload.type === 'wicket' && prefs.wickets) shouldNotify = true;
            if (payload.type === 'milestone' && prefs.milestones) shouldNotify = true;
            if (payload.type === 'result' && prefs.results) shouldNotify = true;

            if (shouldNotify) {
                return {
                    id: generateUUID(),
                    user_id: user.id,
                    type: payload.type,
                    title: payload.title,
                    message: payload.message,
                    data: payload.data || {},
                    read: false,
                    created_at: new Date().toISOString()
                };
            }
            return null;
        }).filter(Boolean);

        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify([...notifications, ...newNotifications]));

        // Dispatch a storage event so other tabs/hooks can react if needed
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error('Error triggering global notifications:', error);
    }
};

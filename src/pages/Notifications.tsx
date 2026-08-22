import React from 'react';
import { NotificationData } from '../lib/api';
import { NotificationCenter } from '../components/NotificationCenter';

interface NotificationsPageProps {
  notifications: NotificationData[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Notifications & Alerts</h2>
        <p className="text-xs text-slate-400 mt-0.5">Real-time alerts for customer responses, friction spikes, and AI insights</p>
      </div>

      <NotificationCenter
        notifications={notifications}
        onMarkRead={onMarkRead}
        onMarkAllRead={onMarkAllRead}
      />
    </div>
  );
};

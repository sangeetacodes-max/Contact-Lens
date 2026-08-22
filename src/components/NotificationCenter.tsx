import React from 'react';
import { NotificationData } from '../lib/api';
import { Bell, Check, CheckCheck, MessageSquare, Sparkles, AlertCircle, Info } from 'lucide-react';

interface NotificationCenterProps {
  notifications: NotificationData[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead
}) => {
  const unread = notifications.filter(n => !n.read);

  const getIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'response':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'ai_insight':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'trigger_alert':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Notifications</h3>
          {unread.length > 0 && (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
              {unread.length} new
            </span>
          )}
        </div>
        {unread.length > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80 mt-2">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`py-3.5 flex items-start justify-between gap-3 transition ${
                notif.read ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{notif.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
                    {new Date(notif.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  type="button"
                  onClick={() => onMarkRead(notif.id)}
                  className="text-slate-500 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

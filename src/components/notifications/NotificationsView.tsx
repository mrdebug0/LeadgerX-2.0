import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CreditCard,
  Check,
} from 'lucide-react';
import { AppNotification } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { api } from '../../api/client';

export const NotificationsView: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread business updates`
              : 'All notifications caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleMarkAllRead}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Loading alerts...
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Payment receipts, bill scan results, and Udhaar due alerts will appear here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                n.read ? 'bg-white hover:bg-slate-50/60' : 'bg-blue-50/30 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    n.type === 'payment'
                      ? 'bg-emerald-100 text-emerald-700'
                      : n.type === 'udhaar'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {n.type === 'payment' ? (
                    <CreditCard className="w-4 h-4" />
                  ) : n.type === 'udhaar' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-xs sm:text-sm font-bold ${
                        n.read ? 'text-slate-800' : 'text-slate-900'
                      }`}
                    >
                      {n.title}
                    </h3>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

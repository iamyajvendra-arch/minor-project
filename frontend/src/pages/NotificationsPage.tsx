import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Header } from '../components/Header';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-cs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#EBF3FA] text-[#005A9C]">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold text-[#1E293B]">Notifications &amp; Activity</h1>
              <p className="text-xs text-[#64748B]">Status updates, dispatch notices, and resolution alerts</p>
            </div>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs text-[#005A9C] font-semibold hover:underline"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-cs divide-y divide-[#E2E8F0] overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-xs text-[#64748B]">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#64748B]">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                  n.is_read ? 'bg-white' : 'bg-[#F4F6F9]'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-[#1E293B]">{n.title}</h4>
                  <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-[#64748B]/70 mt-1 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-[#005A9C] mt-1.5 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

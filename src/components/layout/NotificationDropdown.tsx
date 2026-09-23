import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ExternalLink, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNotificationStore } from '../../store/notificationStore';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount } = useNotificationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-emerald-600 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
        title="सूचना / Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold leading-none text-white bg-orange-500 rounded-full border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-[calc(100vw-32px)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 z-[80] overflow-hidden animate-in fade-in-50 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h3 className="font-bold text-sm">सूचना (Notifications)</h3>
              {unreadCount > 0 && (
                <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} नवीन
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-white/90 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>वाचले</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-gray-800">कोणत्याही नवीन सूचना नाहीत</p>
                <p className="text-xs text-gray-500 mt-1">सर्व सूचना अद्ययावत आहेत (You are all caught up!)</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 px-4 flex gap-3 transition-colors cursor-pointer hover:bg-gray-50 ${
                    !notif.read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="shrink-0 mt-1">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        !notif.read ? 'bg-orange-500 shadow-sm' : 'bg-transparent'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-bold truncate ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs px-4">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <span>सर्व सूचना पहा (View All)</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <span className="text-gray-400 text-[11px]">{notifications.length} एकूण सूचना</span>
          </div>
        </div>
      )}
    </div>
  );
}

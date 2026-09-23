import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { notifications, unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="h-6 w-6 text-emerald-600" /> Notifications
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-4 flex gap-4 transition-colors ${!notif.read ? 'bg-emerald-50/50' : 'hover:bg-gray-50'}`}
              onClick={() => {
                if (!notif.read) markAsRead(notif.id);
                if (notif.actionUrl) navigate(notif.actionUrl);
              }}
            >
              <div className="shrink-0 mt-1">
                <div className={`h-2 w-2 rounded-full ${!notif.read ? 'bg-orange-500' : 'bg-transparent'}`}></div>
              </div>
              <div className="flex-1 cursor-pointer">
                <h4 className={`text-sm font-bold ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

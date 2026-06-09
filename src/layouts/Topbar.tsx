import { useState, useEffect } from 'react';
import { Bell, Menu, Search, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/ui/AvatarGroup';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useNotificationStore } from '../store/notificationStore';

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function Topbar({ onToggleSidebar, sidebarCollapsed }: TopbarProps) {
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [time, setTime] = useState(new Date());

  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (!user) return null;

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border-subtle flex items-center px-4 gap-3 sticky top-0 z-40 transition-colors duration-200">
      {/* Toggle sidebar */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-xl hover:bg-surface-raised text-content-muted hover:text-content transition-colors"
        aria-label={sidebarCollapsed ? 'Ouvrir menu' : 'Réduire menu'}
      >
        <Menu size={18} />
      </button>

      {/* Search bar */}
      <div className={`flex-1 max-w-xs transition-all duration-200 ${searchOpen ? 'opacity-100' : 'opacity-100'}`}>
        {searchOpen ? (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              autoFocus
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Rechercher dans CAMPUS…"
              className="w-full pl-9 pr-9 py-2 text-sm bg-app border border-border rounded-xl text-content focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              onBlur={() => { setSearchOpen(false); setSearchVal(''); }}
            />
            <button onClick={() => { setSearchOpen(false); setSearchVal(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 text-sm text-content-muted bg-app border border-border rounded-xl px-3 py-2 hover:border-border transition-colors w-full"
          >
            <Search size={14} />
            <span>Rechercher…</span>
          </button>
        )}
      </div>

      {/* Real-time Date and Time */}
      <div className="hidden md:flex items-center gap-2 text-xs text-content-secondary bg-app border border-border-subtle rounded-xl px-3 py-2 font-medium">
        <span className="capitalize">{formattedDate}</span>
        <span className="text-content-muted">|</span>
        <span className="text-indigo-500 dark:text-indigo-400 font-bold font-mono">{formattedTime}</span>
      </div>

      <div className="flex-grow" />

      <ThemeToggle />

      {/* Notifications */}
      <div className="dropdown dropdown-end">
        <button
          tabIndex={0}
          className="relative p-2 rounded-xl hover:bg-surface-raised text-content-muted hover:text-content transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <div
          tabIndex={0}
          className="dropdown-content bg-surface rounded-2xl shadow-xl border border-border w-80 mt-2 z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
            <h4 className="text-sm font-semibold text-content">Notifications</h4>
            {unreadCount > 0 && (
              <span className="text-xs text-indigo-600 font-medium">{unreadCount} non lues</span>
            )}
          </div>
          <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-content-muted">
                Aucune notification
              </div>
            ) : (
              notifications.map((notif) => {
                const dateStr = notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '—';

                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-raised transition-colors cursor-pointer ${
                      !notif.read ? 'bg-indigo-50/30' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      notif.read
                        ? 'bg-surface-muted'
                        : notif.type === 'error' ? 'bg-red-500'
                        : notif.type === 'warning' ? 'bg-amber-500'
                        : notif.type === 'success' ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content truncate">{notif.title}</p>
                      <p className="text-xs text-content-secondary mt-0.5 truncate">{notif.message}</p>
                      <p className="text-xs text-content-muted mt-1">{dateStr}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 py-3 border-t border-border-subtle">
            <button
              onClick={markAllAsRead}
              className="text-xs text-indigo-500 hover:text-indigo-400 font-medium w-full text-center"
            >
              Marquer tout comme lu
            </button>
          </div>
        </div>
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-2.5 pl-2">
        <Avatar name={user.name} size="sm" />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-content leading-none">{user.name.split(' ')[0]}</p>
        </div>
      </div>
    </header>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Search, X, BookOpen, Users, FileText, Trash2, Mic } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/ui/AvatarGroup';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useNotificationStore } from '../store/notificationStore';
import { useRealtimeDataStore } from '../store/realtimeDataStore';
import { useNavigate } from 'react-router-dom';
import { navigationByRole } from '../constants/navigation';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export default function Topbar({ onToggleSidebar, sidebarCollapsed }: TopbarProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [time, setTime] = useState(new Date());

  const { isListening, isSupported, startListening, stopListening } = useSpeechToText({
    onResult: (text) => {
      setSearchVal(text);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
  });

  const { notifications, markAsRead, markAllAsRead, removeNotification, removeAllNotifications } = useNotificationStore();
  const { students, teachers, courses } = useRealtimeDataStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString(language === 'en' ? 'en-US' : 'fr-FR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  if (!user) return null;

  // --- OMNISEARCH LOGIC ---
  const searchResults = (() => {
    if (!searchVal.trim()) return null;
    const term = searchVal.toLowerCase();
    const results: any[] = [];
    
    // 1. Pages/Sections
    const navSections = navigationByRole[user.role] || [];
    navSections.forEach(section => {
      section.items.forEach(item => {
        if (item.label.toLowerCase().includes(term)) {
          results.push({ type: 'Page', label: item.label, path: item.path, icon: item.icon });
        }
      });
    });

    // 2. Étudiants
    students.forEach(s => {
      if (s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term) || (s.studentId && s.studentId.toLowerCase().includes(term))) {
        results.push({ type: 'Étudiant', label: `${s.name} (${s.studentId || s.email})`, data: s });
      }
    });

    // 3. Professeurs
    teachers.forEach(t => {
      if (t.name.toLowerCase().includes(term) || t.email.toLowerCase().includes(term)) {
        results.push({ type: 'Professeur', label: `${t.name} (${t.specialite || t.email})`, data: t });
      }
    });

    // 4. Cours
    courses.forEach(c => {
      if (c.title.toLowerCase().includes(term) || c.code.toLowerCase().includes(term)) {
        results.push({ type: 'Cours', label: `${c.title} [${c.code}]`, data: c });
      }
    });

    return results.slice(0, 8);
  })();

  const handleResultClick = (res: any) => {
    setSearchOpen(false);
    setSearchVal('');
    if (res.type === 'Page') {
      navigate(res.path);
    } else if (res.type === 'Étudiant') {
      const path = user.role === 'TEACHER' ? '/app/enseignant/etudiants' : '/app/admin/etudiants';
      navigate(path, { state: { search: res.data.name } });
    } else if (res.type === 'Professeur') {
      navigate('/app/admin/enseignants', { state: { search: res.data.name } });
    } else if (res.type === 'Cours') {
      const path = user.role === 'STUDENT' ? '/app/etudiant/cours' : user.role === 'TEACHER' ? '/app/enseignant/cours' : '/app/admin/cours';
      navigate(path, { state: { search: res.data.code } });
    }
  };

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border-subtle flex items-center px-4 gap-3 sticky top-0 z-40 transition-colors duration-200">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-xl hover:bg-surface-raised text-content-muted hover:text-content transition-colors"
        aria-label={sidebarCollapsed ? (language === 'en' ? 'Open menu' : 'Ouvrir menu') : (language === 'en' ? 'Collapse menu' : 'Réduire menu')}
      >
        <Menu size={18} />
      </button>

      {/* OmniSearch bar */}
      <div className={`flex-1 max-w-xl transition-all duration-200 relative ${searchOpen ? 'opacity-100' : 'opacity-100'}`}>
        {searchOpen ? (
          <div>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              ref={searchInputRef}
              autoFocus
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder={t('topbar.search_placeholder')}
              className="w-full pl-9 pr-16 py-2 text-sm bg-app border border-border rounded-xl text-content focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
            {isSupported && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={isListening ? stopListening : startListening}
                className={`absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                  isListening
                    ? 'text-red-500 bg-red-50 dark:bg-red-950/30 animate-pulse'
                    : 'text-content-muted hover:text-content hover:bg-surface-raised'
                }`}
                title={isListening ? "Arrêter la dictée" : "Recherche vocale"}
              >
                <Mic size={14} />
              </button>
            )}
            <button onClick={() => { setSearchOpen(false); setSearchVal(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content">
              <X size={14} />
            </button>

            {/* OmniSearch Dropdown */}
            {searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
                <div className="max-h-[300px] overflow-y-auto py-2">
                  {searchResults.map((res, idx) => (
                    <div 
                      key={idx} 
                      onMouseDown={(e) => { e.preventDefault(); handleResultClick(res); }}
                      className="px-4 py-2 hover:bg-surface-raised cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        {res.type === 'Page' ? (res.icon ? <res.icon size={16} /> : <FileText size={16} />) : 
                         res.type === 'Étudiant' ? <Users size={16} /> :
                         res.type === 'Professeur' ? <Users size={16} /> :
                         <BookOpen size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-content truncate">{res.label}</p>
                        <p className="text-xs text-content-muted">{res.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {searchResults && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 p-4 text-center">
                <p className="text-sm text-content-muted">{t('topbar.no_results')} "{searchVal}"</p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 text-sm text-content-muted bg-app border border-border rounded-xl px-3 py-2 hover:border-border transition-colors w-full sm:max-w-xs"
          >
            <Search size={14} />
            <span>{t('topbar.search_trigger')}</span>
            <span className="ml-auto text-[10px] font-mono bg-surface-muted px-1.5 py-0.5 rounded border border-border-subtle">Ctrl+K</span>
          </button>
        )}
      </div>

      {/* Keyboard Shortcut Hook */}
      {(() => {
        useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
              e.preventDefault();
              setSearchOpen(true);
            } else if (e.key === 'Escape' && searchOpen) {
              setSearchOpen(false);
            }
          };
          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
        }, [searchOpen]);
        return null;
      })()}

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
          aria-label={t('topbar.notifications')}
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
            <h4 className="text-sm font-semibold text-content">{t('topbar.notifications')}</h4>
            {unreadCount > 0 && (
              <span className="text-xs text-indigo-600 font-medium">{unreadCount} {t('topbar.unread')}</span>
            )}
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-content-muted">
                {t('topbar.no_notif')}
              </div>
            ) : (
              notifications.map((notif) => {
                const dateStr = notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString(language === 'en' ? 'en-US' : 'fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '—';

                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-surface-raised transition-colors cursor-pointer group/notif ${
                      !notif.read ? 'bg-indigo-50/30' : ''
                    }`}
                    onClick={() => markAsRead(notif.id)}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notif.id);
                      }}
                      className="p-1 rounded-md text-content-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover/notif:opacity-100 transition-opacity"
                      title={t('topbar.delete')}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className="px-4 py-3 border-t border-border-subtle flex gap-2 justify-between">
            <button
              onClick={markAllAsRead}
              className="text-xs text-indigo-500 hover:text-indigo-400 font-medium"
            >
              {t('topbar.mark_all_read')}
            </button>
            {notifications.length > 0 && (
              <button
                onClick={removeAllNotifications}
                className="text-xs text-red-500 hover:text-red-400 font-medium"
              >
                {t('topbar.clear_all')}
              </button>
            )}
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

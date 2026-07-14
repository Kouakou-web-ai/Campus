import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Search, X, BookOpen, Users, FileText, Trash2, Mic } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/ui/AvatarGroup';
import ThemeToggle from '../components/shared/ThemeToggle';
import OfflineStatusIndicator from '../components/shared/OfflineStatusIndicator';
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
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

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
              className="w-full pl-9 pr-16 py-2 text-base md:text-sm bg-app border border-border rounded-xl text-content focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
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
            className="flex items-center gap-2 text-sm text-content-muted bg-app border border-border rounded-xl px-3 py-2 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors w-full sm:max-w-xs"
          >
            <Search size={14} />
            <span>{t('topbar.search_trigger')}</span>
            <span className="ml-auto text-[10px] font-mono bg-surface-muted px-1.5 py-0.5 rounded border border-border-subtle">Ctrl+K</span>
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

      <OfflineStatusIndicator />

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
                    onClick={() => {
                      markAsRead(notif.id);
                      if (notif.metadata) {
                        setSelectedNotif(notif);
                      }
                    }}
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
      <div className="hidden sm:flex items-center gap-2.5 pl-2 pr-2 sm:pr-0 mr-2 sm:mr-0">
        <Avatar name={user.name} size="sm" />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-content leading-none">{user.name.split(' ')[0]}</p>
        </div>
      </div>
      {/* Notification Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800 shadow-2xl relative animate-fade-up text-slate-850 dark:text-slate-150">
            <button
              onClick={() => setSelectedNotif(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                selectedNotif.metadata.type === 'evaluation' ? 'bg-amber-500' : 'bg-indigo-500'
              }`}>
                {selectedNotif.metadata.type === 'evaluation' ? '⭐' : '💡'}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{selectedNotif.title}</h3>
                <p className="text-xs text-slate-400">
                  Reçu le {new Date(selectedNotif.metadata.submittedAt || selectedNotif.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Contrib Info */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Auteur</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                    {selectedNotif.metadata.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedNotif.metadata.userName}</p>
                    <p className="text-[10px] text-indigo-650 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded-full inline-block font-semibold mt-0.5">
                      {selectedNotif.metadata.userRole === 'PARENT' ? 'Parent d\'élève' : 'Étudiant'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Evaluation Details */}
              {selectedNotif.metadata.type === 'evaluation' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">Note Moyenne attribuée :</span>
                    <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 font-mono">{selectedNotif.metadata.average} / 5</span>
                  </div>
                  
                  {selectedNotif.metadata.ratings && (
                    <div className="space-y-2.5">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Détail des critères</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { key: 'enseignement', label: "Enseignement" },
                          { key: 'infrastructures', label: "Infrastructures" },
                          { key: 'administration', label: "Administration" },
                          { key: 'services', label: "Services" }
                        ].map(c => {
                          const rating = selectedNotif.metadata.ratings[c.key] || 0;
                          return (
                            <div key={c.key} className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 p-2.5 border border-slate-100/60 dark:border-slate-800 rounded-xl">
                              <span className="text-slate-550 dark:text-slate-400 font-medium truncate">{c.label}</span>
                              <span className="font-bold text-amber-500 flex items-center gap-0.5 ml-1">
                                {rating} ★
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avis / Commentaire</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                      &ldquo;{selectedNotif.metadata.comment}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Suggestion Details */}
              {selectedNotif.metadata.type === 'suggestion' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Thématique</span>
                      <span className="inline-block text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-3 py-1.5 rounded-xl">
                        {selectedNotif.metadata.category}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Objet</span>
                      <span className="block text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedNotif.metadata.subject}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Détails de la suggestion</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed whitespace-pre-line">
                      {selectedNotif.metadata.content}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

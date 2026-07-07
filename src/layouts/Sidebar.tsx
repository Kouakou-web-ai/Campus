import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Settings, ChevronDown, GraduationCap, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { navigationByRole, roleLabels } from '../constants/navigation';
import { Avatar } from '../components/ui/AvatarGroup';
import { useRegistrationStore } from '../store/registrationStore';
import { useRealtimeDataStore } from '../store/realtimeDataStore';
import { useChatStore } from '../store/chatStore';
import { ToastSuccess, ToastError } from '../controllers/Toast-emitter';
import { useTranslation } from '../hooks/useTranslation';
import { labelToKeyMap, sectionToKeyMap } from '../constants/translations';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const { user, logout, deleteAccount } = useAuthStore();
  const location = useLocation();
  const { t } = useTranslation();


  const handleDeleteAccount = async () => {
    if (window.confirm(t('nav.delete_confirm'))) {
      try {
        await deleteAccount();
        ToastSuccess(t('nav.delete_success'));
      } catch (err: any) {
        ToastError(err.message || t('nav.delete_error'));
      }
    }
  };

  const { requests, subscribe: subscribeReg, teardown: teardownReg } = useRegistrationStore();
  const { universities, transactions, grades, students, teachers } = useRealtimeDataStore();
  const { subscribeToAllUserChats, totalUnreadCount } = useChatStore();


  useEffect(() => {
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'UNIVERSITY_ADMIN')) {
      subscribeReg();
      return () => teardownReg();
    }
  }, [user, subscribeReg, teardownReg]);

  useEffect(() => {
    if (user && (user.role === 'STUDENT' || user.role === 'TEACHER') && user.universityId) {
      const allUsers = [
        ...students.map(s => ({
          uid: s.id,
          id: s.id,
          name: s.name,
          prenom: s.name ? s.name.split(' ')[0] : '',
          nom: s.name ? s.name.split(' ').slice(1).join(' ') : '',
          email: s.email,
          role: 'STUDENT' as const,
          status: s.status,
          universityId: s.universityId
        })),
        ...teachers.map(t => ({
          uid: t.id,
          id: t.id,
          name: t.name,
          prenom: t.name ? t.name.split(' ')[0] : '',
          nom: t.name ? t.name.split(' ').slice(1).join(' ') : '',
          email: t.email,
          role: 'TEACHER' as const,
          status: t.status,
          universityId: t.universityId
        }))
      ];
      const unsub = subscribeToAllUserChats(user.id, user.role, user.universityId, allUsers);
      return () => unsub();
    }
  }, [user, students, teachers, subscribeToAllUserChats]);

  if (!user) return null;

  const navSections = navigationByRole[user.role] ?? [];
  const roleLabel = t(`role.${user.role}`, roleLabels[user.role]);

  const isActive = (path: string) => {
    if (path === '/super-admin' || path === '/admin' || path === '/enseignant' || path === '/etudiant' || path === '/parent') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`h-screen flex flex-col bg-surface border-r border-border-subtle transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-border-subtle ${collapsed ? 'justify-center px-3' : ''}`}>
        <img src="/images/logo-original.png" alt="Logo" className="w-9 h-9 rounded-xl flex-shrink-0 shadow-md object-cover" />
        {!collapsed && (
          <div>
            <span className="font-heading font-bold text-content text-lg leading-none">CAMPUS</span>
            <p className="text-xs text-content-muted mt-0.5">{roleLabel}</p>
          </div>
        )}
      </div>


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.title && !collapsed && (
              <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest px-2 mb-2">
                {t(sectionToKeyMap[section.title] || section.title)}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                let badgeValue: string | undefined = undefined;

                if (user.role === 'SUPER_ADMIN') {
                  if (item.path === '/app/super-admin/demandes') {
                    const count = requests.filter(r => r.role === 'UNIVERSITY_ADMIN' && r.status === 'pending').length;
                    if (count > 0) badgeValue = `(${count})`;
                  } else if (item.path === '/app/super-admin/universites') {
                    const count = universities.filter(u => u.status === 'en_attente').length;
                    if (count > 0) badgeValue = `(${count})`;
                  }
                } else if (user.role === 'UNIVERSITY_ADMIN') {
                  if (item.path === '/app/admin/demandes') {
                    const count = requests.filter(r => r.universityId === user.universityId && r.status === 'pending').length;
                    if (count > 0) badgeValue = `(${count})`;
                  } else if (item.path === '/app/admin/finance') {
                    const count = transactions.filter(t => t.status === 'en_attente').length;
                    if (count > 0) badgeValue = `(${count})`;
                  }
                } else if (user.role === 'STUDENT') {
                  if (item.path === '/app/etudiant/paiements') {
                    // Count unpaid/late transactions
                    const count = transactions.filter(t => t.status === 'en_retard' || t.status === 'en_attente').length;
                    if (count > 0) badgeValue = `(${count})`;
                  }
                } else if (user.role === 'PARENT') {
                  if (item.path === '/app/parent/suivi') {
                    const count = transactions.filter(t => t.status === 'en_retard' || t.status === 'en_attente').length;
                    if (count > 0) badgeValue = `(${count})`;
                  }
                }

                if (item.path === '/app/messagerie') {
                  if (totalUnreadCount > 0) {
                    badgeValue = `(${totalUnreadCount})`;
                  }
                }

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={collapsed ? t(labelToKeyMap[item.label] || item.label) : undefined}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        active
                          ? 'bg-indigo-50 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-content-secondary hover:bg-surface-raised hover:text-content'
                      } ${collapsed ? 'justify-center' : 'hover:translate-x-1'}`}
                    >
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <Icon
                          size={18}
                          className={`flex-shrink-0 transition-colors ${
                            active ? 'text-indigo-500 dark:text-indigo-400' : 'text-content-muted group-hover:text-content-secondary'
                          }`}
                        />
                        {badgeValue && collapsed && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border border-white rounded-full animate-pulse z-10" />
                        )}
                      </div>
                      {!collapsed && (
                        <span className="flex-1">{t(labelToKeyMap[item.label] || item.label)}</span>
                      )}
                      {!collapsed && badgeValue && (
                        <span className="text-xs font-bold text-red-500 animate-pulse ml-auto">
                          {badgeValue}
                        </span>
                      )}
                      {active && !collapsed && !badgeValue && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 ml-auto" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer user */}
      <div className={`border-t border-border-subtle p-3 ${collapsed ? '' : ''}`}>
        {!collapsed ? (
          <div className="dropdown dropdown-top w-full">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-raised cursor-pointer transition-colors w-full"
            >
              <Avatar name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content truncate">{user.name}</p>
                <p className="text-xs text-content-muted truncate">{user.email}</p>
              </div>
              <ChevronDown size={14} className="text-content-muted flex-shrink-0" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-sm bg-surface rounded-xl shadow-xl border border-border w-52 mb-2 z-50 p-2"
            >
              <li>
                <Link to="/app/parametres" className="flex items-center gap-2 text-content-secondary font-medium">
                  <Settings size={14} /> {t('nav.settings')}
                </Link>
              </li>
              <li>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 w-full text-left font-medium"
                >
                  <Trash2 size={14} /> {t('nav.delete_account')}
                </button>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-50 w-full text-left font-medium"
                >
                  <LogOut size={14} /> {t('nav.logout')}
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 rounded-xl hover:bg-red-50 text-content-muted hover:text-red-500 transition-colors"
            title={t('nav.logout')}
          >
            <LogOut size={18} />
          </button>
        )}
      </div>

    </aside>
  );
}

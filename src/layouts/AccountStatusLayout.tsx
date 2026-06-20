import { Outlet, Link } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from '../components/shared/ThemeToggle';

export default function AccountStatusLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-app flex flex-col transition-colors duration-200">
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/images/logo-original.png" alt="Campus Logo" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-heading font-bold text-lg text-content">CAMPUS</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => logout()}
              className="btn btn-ghost btn-sm gap-2 text-content-secondary"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {user && (
            <p className="text-center text-xs text-content-muted mb-4">
              Connecté en tant que {user.email}
            </p>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

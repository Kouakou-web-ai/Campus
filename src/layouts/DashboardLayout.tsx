import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../store/authStore';
import { useRealtimeDataStore } from '../store/realtimeDataStore';
import { db } from '../../firebase-config';
import { ref, update } from 'firebase/database';
import { ToastSuccess, ToastError } from '../controllers/Toast-emitter';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();
  const { subscribeToUniversity, subscribeToSuperAdmin } = useRealtimeDataStore();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'SUPER_ADMIN') {
      const unsub = subscribeToSuperAdmin();
      return () => unsub();
    } else if (user.universityId) {
      const unsub = subscribeToUniversity(user.universityId);
      return () => unsub();
    }
  }, [user, subscribeToUniversity, subscribeToSuperAdmin]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const { updateUserProfile } = useAuthStore();

  if (user && user.mustChangePassword) {
    const handleForcePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword.length < 6) {
        ToastError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
      if (newPassword !== confirmPassword) {
        ToastError("Les mots de passe ne correspondent pas.");
        return;
      }

      setChangingPassword(true);
      try {
        if (!user.tempPassword) {
          throw new Error("Mot de passe temporaire introuvable.");
        }

        await updateUserProfile({
          newPassword: newPassword,
        });

        await update(ref(db, `utilisateurs/${user.id}`), {
          mustChangePassword: false,
          tempPassword: null
        });

        ToastSuccess("Mot de passe mis à jour avec succès !");
        await useAuthStore.getState().refreshUserProfile();
      } catch (err: any) {
        console.error(err);
        ToastError(err.message || "Erreur lors du changement de mot de passe.");
      } finally {
        setChangingPassword(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative animate-fade-up">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-950 dark:text-white mb-2">Changement de mot de passe obligatoire</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Vous êtes connecté avec un mot de passe temporaire. Veuillez configurer votre nouveau mot de passe personnalisé pour sécuriser et accéder à votre espace.
          </p>

          <form onSubmit={handleForcePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  placeholder="Confirmer votre mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-3 bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 mt-4"
            >
              {changingPassword ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Mise à jour en cours…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Sécuriser mon compte
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-app transition-colors duration-200">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsed={collapsed} />
      </div>

      {/* Sidebar — mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 lg:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onToggleSidebar={() => {
            if (window.innerWidth >= 1024) {
              setCollapsed(c => !c);
            } else {
              setMobileOpen(o => !o);
            }
          }}
          sidebarCollapsed={collapsed}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-6 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

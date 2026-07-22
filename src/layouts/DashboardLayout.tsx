import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuthStore } from '../store/authStore';
import { useRealtimeDataStore } from '../store/realtimeDataStore';
import { db } from '../../firebase-config';
import { ref, update } from 'firebase/database';
import { ToastSuccess, ToastError } from '../controllers/Toast-emitter';
import { Shield, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { sendRealEmail } from '../services/emailSender';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();
  const { 
    subscribeToUniversity, 
    subscribeToSuperAdmin, 
    systemAnnouncement,
    courses,
    updateCourse,
    currentUniversity
  } = useRealtimeDataStore();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'SUPER_ADMIN') {
      const unsub = subscribeToSuperAdmin();
      return () => unsub();
    } else if (user.role === 'UNIVERSITY_ADMIN') {
      const unsubSuper = subscribeToSuperAdmin();
      const unsubUniv = user.universityId ? subscribeToUniversity(user.universityId) : () => {};
      return () => {
        unsubSuper();
        unsubUniv();
      };
    } else if (user.universityId) {
      const unsub = subscribeToUniversity(user.universityId);
      return () => unsub();
    }
  }, [user?.universityId, user?.role, subscribeToUniversity, subscribeToSuperAdmin]);

  // Initialisation de la surveillance de connectivité réseau et de rejeu de file + rappels d'abonnement
  useEffect(() => {
    let cleanup = () => {};
    import('../store/syncStore').then(({ useSyncStore }) => {
      cleanup = useSyncStore.getState().initConnectionMonitoring();
    });
    import('../services/subscriptionNotifier').then(({ checkAndSendSubscriptionReminders }) => {
      checkAndSendSubscriptionReminders().catch(err => console.error("Erreur rappels abonnements:", err));
    });
    return () => cleanup();
  }, []);

  // Real-time automatic course status transition based on calendar clock
  useEffect(() => {
    const universityId = user?.universityId;
    if (!universityId || !courses || courses.length === 0) return;

    const checkCourseStatuses = async () => {
      const now = new Date();
      for (const course of courses) {
        if (!course || !course.date || !course.startTime || !course.duration) continue;

        try {
          const startDateTime = new Date(`${course.date}T${course.startTime}:00`);
          if (isNaN(startDateTime.getTime())) continue;

          const durationHours = course.duration || 2;
          const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

          let calculatedStatus: 'planifie' | 'en_cours' | 'termine' = 'planifie';
          if (now < startDateTime) {
            calculatedStatus = 'planifie';
          } else if (now >= startDateTime && now <= endDateTime) {
            calculatedStatus = 'en_cours';
          } else {
            calculatedStatus = 'termine';
          }

          const isWriter = user?.role === 'SUPER_ADMIN' || 
                           user?.role === 'UNIVERSITY_ADMIN' || 
                           (user?.role === 'TEACHER' && course.teacherId === user.id);

          if (course.status !== calculatedStatus && isWriter) {
            await updateCourse(universityId, course.id, { status: calculatedStatus });
          }
        } catch (err) {
          console.error("Failed to transition course status in real-time:", err);
        }
      }
    };

    checkCourseStatuses();
    const interval = setInterval(checkCourseStatuses, 10000);
    return () => clearInterval(interval);
  }, [courses, user?.universityId, updateCourse]);

  // Subscription expiration and warning alerts logic
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || user.role === 'SUPER_ADMIN' || !user.universityId || !currentUniversity) {
        setCheckingSubscription(false);
        return;
      }

      try {
        const creationDateStr = currentUniversity.createdAt || new Date().toISOString().split('T')[0];
        const creationDate = new Date(creationDateStr);
        const today = new Date();
        const diffTime = today.getTime() - creationDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 30 days trial period limit
        if (diffDays > 30) {
          setIsSubscriptionExpired(true);
        } else {
          setIsSubscriptionExpired(false);
          
          // Send warning email at exactly J-7 (between 23 and 29 days of existence)
          if (diffDays >= 23 && diffDays <= 30) {
            const warningSentKey = `warning_email_sent_${user.universityId}`;
            const isSent = localStorage.getItem(warningSentKey);
            if (!isSent && currentUniversity.adminEmail) {
              const daysLeft = 30 - diffDays;
              const loginUrl = `${window.location.origin}/tarifs`;
              
              await sendRealEmail(
                currentUniversity.adminEmail,
                "⚠️ Avertissement : Expiration de votre essai CAMPUS sous peu",
                `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                   <h2 style="color: #ea580c;">Renouvellement d'abonnement requis</h2>
                   <p>Bonjour <strong>${currentUniversity.adminName || 'Administrateur'}</strong>,</p>
                   <p>L'essai gratuit de 30 jours pour votre université <strong>${currentUniversity.name}</strong> expire dans <strong>${daysLeft} jours</strong>.</p>
                   <p>Passé ce délai, l'accès à la plateforme pour vos étudiants, enseignants et gestionnaires sera automatiquement suspendu.</p>
                   <p style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 12px; border-radius: 6px; margin: 16px 0; color: #9a3412; font-size: 13px;">
                     Veuillez mettre à jour votre forfait ou choisir un abonnement payant pour éviter toute interruption de service.
                   </p>
                   <p style="margin: 24px 0; text-align: center;">
                     <a href="${loginUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Voir les abonnements</a>
                   </p>
                   <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                   <p style="color: #64748b; font-size: 11px;">L'équipe CAMPUS</p>
                 </div>`
              );
              localStorage.setItem(warningSentKey, 'true');
            }
          }
        }
      } catch (err) {
        console.error("Subscription verification failed:", err);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user, currentUniversity]);

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

  // Account Expired Modal Overlay
  if (isSubscriptionExpired && !checkingSubscription) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 px-4">
        <div className="bg-slate-900 rounded-3xl p-8 max-w-md w-full border border-slate-800 shadow-2xl text-center animate-fade-up">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 mx-auto">
            <ShieldAlert size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Abonnement expiré</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            La période d'essai gratuit ou de validité d'abonnement pour l'établissement <strong>{currentUniversity?.name || 'CAMPUS'}</strong> a expiré (limite de 30 jours).
            Veuillez contacter le Super Administrateur de CAMPUS ou renouveler votre offre pour réactiver l'accès.
          </p>
          {user?.role === 'UNIVERSITY_ADMIN' ? (
            <a
              href="/tarifs"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold block transition-colors text-center"
            >
              Mettre à niveau l'abonnement
            </a>
          ) : (
            <p className="text-xs text-amber-500 font-bold">
              Veuillez notifier l'administration de votre établissement.
            </p>
          )}
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
        {systemAnnouncement?.active && (
          <div className={`py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 border-b transition-all ${
            systemAnnouncement.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
              : systemAnnouncement.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
              : systemAnnouncement.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
              : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'
          }`}>
            <span>📢 {systemAnnouncement.message}</span>
          </div>
        )}

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


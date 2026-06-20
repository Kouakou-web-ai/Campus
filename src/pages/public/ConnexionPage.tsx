import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Lock, LogIn, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getPostLoginPath } from '../../constants/accountStatus';
import { ToastError, ToastSuccess } from '../../controllers/Toast-emitter';
import { findInvitedUserByEmail } from '../../services/invitationService';

export default function ConnexionPage() {
  const { loginWithFirebase, loginWithGoogle, sendPasswordReset, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [activationEmail, setActivationEmail] = useState<string | null>(null);

  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      ToastError("Veuillez saisir votre adresse email.");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      ToastSuccess("Un email de réinitialisation vous a été envoyé !");
      setShowResetModal(false);
      setResetEmail('');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        ToastError("Aucun compte n'existe avec cette adresse email.");
      } else {
        ToastError(err.message || "Impossible d'envoyer l'email de réinitialisation.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  const from = (location.state as { from?: Location })?.from?.pathname;

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      ToastSuccess("Connexion réussie !");
      const updatedUser = useAuthStore.getState().user;
      if (updatedUser) {
        const dest = from && updatedUser.status === 'active' ? from : getPostLoginPath(updatedUser);
        navigate(dest, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      ToastError("Échec de la connexion Google.");
    }
  };

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      ToastError("Veuillez renseigner votre adresse email.");
      return;
    }

    try {
      setActivationEmail(null);
      const invitedUser = await findInvitedUserByEmail(email);
      if (invitedUser) {
        const invitedEmail = invitedUser.profile.email || email;
        setActivationEmail(invitedEmail);
        ToastSuccess("Compte pré-enregistré trouvé. Créez votre mot de passe pour l'activer.");
        return;
      }

      if (!password) {
        ToastError("Veuillez renseigner votre mot de passe.");
        return;
      }

      await loginWithFirebase(email, password);
      ToastSuccess("Connexion réussie !");

      const updatedUser = useAuthStore.getState().user;
      if (updatedUser) {
        const dest = from && updatedUser.status === 'active' ? from : getPostLoginPath(updatedUser);
        navigate(dest, { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        ToastError("Adresse email ou mot de passe incorrect.");
      } else {
        ToastError(err.message || "Une erreur s'est produite lors de la connexion.");
      }
    }
  };

  return (
    <div className="animate-fade-up max-w-md mx-auto">
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/images/logo-original.png" alt="Campus Logo" className="w-11 h-11 rounded-2xl shadow-lg object-cover" />
          <span className="font-heading font-black text-2xl tracking-tight text-slate-900">CAMPUS</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Espace de Connexion</h2>
        <p className="text-slate-400 text-sm mt-1">Saisissez vos accès pour accéder à votre tableau de bord.</p>
      </div>

      <form onSubmit={handleRealLogin} className="space-y-8 bg-white p-10 rounded-3xl border border-slate-100/80 shadow-xl shadow-slate-100/50">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse email</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="adresse@universite.ci"
              required
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Mot de passe</label>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {activationEmail && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
            <p className="font-bold">Compte étudiant pré-enregistré</p>
            <p className="mt-1 text-indigo-700">
              Votre établissement a déjà créé votre dossier. Activez votre accès avec votre mot de passe.
            </p>
            <Link
              to={`/activation-compte?email=${encodeURIComponent(activationEmail)}`}
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
            >
              Créer mon mot de passe
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-100"
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Connexion en cours…
            </>
          ) : (
            <>
              <LogIn size={16} />
              Se connecter
            </>
          )}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-xs text-slate-300">ou</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.45-1.89l1.23-.95z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.18-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuer avec Google
        </button>

        <p className="text-center text-sm text-slate-400 pt-2">
          Nouveau sur CAMPUS ?{' '}
          <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
            Créer un compte
          </Link>
        </p>
      </form>

      {/* Modal Réinitialisation de mot de passe */}
      {showResetModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-surface max-w-sm rounded-3xl border border-border-subtle shadow-2xl p-6 relative">
            <h3 className="font-bold text-lg text-content">Mot de passe oublié ?</h3>
            <p className="py-2.5 text-xs text-content-secondary leading-relaxed">
              Saisissez votre adresse e-mail. Nous vous enverrons un lien de réinitialisation.
            </p>
            <form onSubmit={handlePasswordResetSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-content-secondary uppercase tracking-wider">Adresse email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-content-muted pointer-events-none" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="adresse@universite.ci"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border rounded-xl text-xs text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="modal-action gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetEmail('');
                  }}
                  className="btn btn-sm btn-ghost rounded-xl text-xs text-content-secondary font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn btn-sm bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold border-none"
                >
                  {resetLoading ? <span className="loading loading-spinner loading-xs" /> : 'Envoyer le lien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

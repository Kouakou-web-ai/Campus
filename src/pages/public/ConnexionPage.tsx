import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Lock, LogIn, Mail } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getPostLoginPath } from '../../constants/accountStatus';
import { ToastError, ToastSuccess } from '../../controllers/Toast-emitter';
import { findInvitedUserByEmail } from '../../services/invitationService';

export default function ConnexionPage() {
  const { loginWithFirebase, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [activationEmail, setActivationEmail] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname;

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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <GraduationCap size={22} className="text-white" />
          </div>
          <span className="font-heading font-black text-2xl tracking-tight text-slate-900">CAMPUS</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Espace de Connexion</h2>
        <p className="text-slate-400 text-sm mt-1">Saisissez vos accès pour accéder à votre tableau de bord.</p>
      </div>

      <form onSubmit={handleRealLogin} className="space-y-6 bg-white p-10 rounded-3xl border border-slate-100/80 shadow-xl shadow-slate-100/50">
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
            <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Oublié ?
            </a>
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

        <p className="text-center text-sm text-slate-400">
          Nouveau sur CAMPUS ?{' '}
          <Link to="/signup" className="text-indigo-600 font-bold hover:underline">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}

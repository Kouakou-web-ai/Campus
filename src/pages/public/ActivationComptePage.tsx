import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Lock, Mail, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ToastError, ToastSuccess } from '../../controllers/Toast-emitter';
import { findInvitedUserByEmail, type InvitedUser } from '../../services/invitationService';

export default function ActivationComptePage() {
  const { activateInvitedAccount, loading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [invite, setInvite] = useState<InvitedUser | null>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);
  const [inviteChecked, setInviteChecked] = useState(false);

  useEffect(() => {
    if (!emailParam) {
      setInviteChecked(true);
      return;
    }

    let cancelled = false;

    const loadInvite = async () => {
      setCheckingInvite(true);
      try {
        const foundInvite = await findInvitedUserByEmail(emailParam);
        if (!cancelled) {
          setInvite(foundInvite);
          setInviteChecked(true);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          ToastError("Impossible de vérifier cette invitation.");
          setInviteChecked(true);
        }
      } finally {
        if (!cancelled) setCheckingInvite(false);
      }
    };

    loadInvite();

    return () => {
      cancelled = true;
    };
  }, [emailParam]);

  const handleFindInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      ToastError("Veuillez saisir votre adresse email.");
      return;
    }

    setCheckingInvite(true);
    setInviteChecked(false);
    try {
      const foundInvite = await findInvitedUserByEmail(email);
      setInvite(foundInvite);
      setInviteChecked(true);
      if (!foundInvite) {
        ToastError("Aucune invitation active trouvée pour cet email.");
      }
    } catch (err) {
      console.error(err);
      ToastError("Impossible de vérifier cette invitation.");
    } finally {
      setCheckingInvite(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) {
      ToastError("Invitation introuvable.");
      return;
    }
    if (password.length < 6) {
      ToastError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      ToastError("Les mots de passe ne correspondent pas.");
      return;
    }

    const profile = invite.profile;
    try {
      await activateInvitedAccount(
        profile.email || email,
        password,
        profile.prenom || '',
        profile.nom || '',
        profile.telephone || '',
        profile.adresse || '',
        profile.universityId,
        invite.uid,
      );
      ToastSuccess("Compte activé. Vérifiez votre email, puis connectez-vous.");
      navigate('/connexion', { replace: true });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        ToastError("Cet email possède déjà un compte. Connectez-vous directement.");
        navigate('/connexion', { replace: true });
        return;
      }
      ToastError(err.message || "Erreur lors de l'activation du compte.");
    }
  };

  const canShowPasswordForm = invite && !checkingInvite;

  return (
    <div className="animate-fade-up max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/images/logo-original.png" alt="Campus Logo" className="w-11 h-11 rounded-2xl shadow-lg object-cover" />
          <span className="font-heading font-black text-2xl tracking-tight text-content">CAMPUS</span>
        </div>
        <h2 className="text-2xl font-bold text-content tracking-tight">Activation du compte</h2>
        <p className="text-content-secondary text-sm mt-1">Choisissez votre mot de passe pour finaliser votre accès.</p>
      </div>

      <div className="space-y-6 bg-surface p-8 sm:p-10 rounded-3xl border border-border shadow-xl shadow-indigo-500/5">
        {!invite && (
          <form onSubmit={handleFindInvite} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Adresse email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4.5 h-4.5 text-content-muted pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="adresse@universite.ci"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-app border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={checkingInvite}
              className="w-full py-3 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {checkingInvite ? <span className="loading loading-spinner loading-sm" /> : <UserCheck size={16} />}
              Vérifier mon invitation
            </button>
          </form>
        )}

        {inviteChecked && !checkingInvite && !invite && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300">
            Aucun compte invité trouvé. Vérifiez l'email donné à votre établissement.
          </div>
        )}

        {canShowPasswordForm && (
          <form onSubmit={handleActivate} className="space-y-5">
            <div className="rounded-2xl border border-indigo-150 bg-indigo-50 dark:bg-indigo-950/20 p-4 text-sm text-indigo-800 dark:text-indigo-300">
              Invitation trouvée pour <strong>{invite.profile.email}</strong>.
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-content-muted pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  required
                  className="w-full pl-11 pr-10 py-3 bg-app border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content transition-colors"
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Confirmer</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Retapez le mot de passe"
                required
                className="w-full px-4 py-3 bg-app border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-100/10"
            >
              {loading ? <span className="loading loading-spinner loading-sm" /> : <UserCheck size={16} />}
              Activer mon compte
            </button>
          </form>
        )}

        <p className="text-center text-sm text-content-secondary">
          Déjà activé ?{' '}
          <Link to="/connexion" className="text-indigo-600 font-bold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

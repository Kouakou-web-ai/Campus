import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Lock, LogIn, Mail, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getPostLoginPath } from '../../constants/accountStatus';
import { ToastError, ToastSuccess } from '../../controllers/Toast-emitter';
import { findInvitedUserByEmail } from '../../services/invitationService';
import { db } from '../../../firebase-config';
import { ref, get, query, orderByChild, equalTo } from 'firebase/database';

export default function ConnexionPage() {
  const { loginWithFirebase, loginWithGoogle, sendPasswordReset, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [activationEmail, setActivationEmail] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [isParent, setIsParent] = useState(false);
  const [childMatricule, setChildMatricule] = useState('');

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
    setLocalLoading(true);
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
      setLocalLoading(false);
      ToastError("Échec de la connexion Google.");
    }
  };

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      ToastError("Veuillez renseigner votre adresse email.");
      return;
    }

    setLocalLoading(true);
    try {
      setActivationEmail(null);
      const invitedUser = await findInvitedUserByEmail(email);
      if (invitedUser) {
        const invitedEmail = invitedUser.profile.email || email;
        setActivationEmail(invitedEmail);
        ToastSuccess("Compte pré-enregistré trouvé. Créez votre mot de passe pour l'activer.");
        setLocalLoading(false);
        return;
      }

      if (!password) {
        ToastError("Veuillez renseigner votre mot de passe.");
        setLocalLoading(false);
        return;
      }

      // Si connexion parent, valider le matricule de l'enfant d'abord
      if (isParent) {
        if (!childMatricule) {
          ToastError("Veuillez saisir le matricule de votre enfant.");
          setLocalLoading(false);
          return;
        }

        // 1. Rechercher le parent par email
        const usersRef = ref(db, 'utilisateurs');
        const emailQuery = query(usersRef, orderByChild('email'), equalTo(email.trim().toLowerCase()));
        const userSnapshot = await get(emailQuery);

        if (!userSnapshot.exists()) {
          ToastError("Aucun compte parent trouvé avec cette adresse email.");
          setLocalLoading(false);
          return;
        }

        const userData = Object.values(userSnapshot.val())[0] as any;
        if (userData.role !== 'PARENT') {
          ToastError("Cet e-mail n'est pas associé à un compte parent.");
          setLocalLoading(false);
          return;
        }

        // 2. Vérifier le matricule de l'enfant
        let childMatched = false;
        if (userData.enfants) {
          for (const childUid of Object.keys(userData.enfants)) {
            const childRef = ref(db, `universites/${userData.universityId}/etudiants/${childUid}`);
            const childSnap = await get(childRef);
            if (childSnap.exists() && childSnap.val().studentId?.trim().toLowerCase() === childMatricule.trim().toLowerCase()) {
              childMatched = true;
              break;
            }
          }
        }

        if (!childMatched) {
          ToastError("Le matricule saisi ne correspond pas à un enfant lié à ce compte parent.");
          setLocalLoading(false);
          return;
        }
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
      setLocalLoading(false);
      if (err.code === 'auth/invalid-credential') {
        ToastError("Adresse email ou mot de passe incorrect.");
      } else {
        ToastError(err.message || "Une erreur s'est produite lors de la connexion.");
      }
    }
  };

  return (
    <>
      {/* Bouton Retour */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-surface/80 backdrop-blur-md border border-border hover:bg-surface-raised text-content-secondary hover:text-content text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm active:scale-95 cursor-pointer z-50 animate-fade-down"
      >
        <ArrowLeft size={14} />
        Retour
      </button>
      <div className="animate-fade-up max-w-md mx-auto">
        <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/images/logo-original.png" alt="Campus Logo" className="w-11 h-11 rounded-2xl shadow-lg object-cover" />
          <span className="font-heading font-black text-2xl tracking-tight text-content">CAMPUS</span>
        </div>
        <h2 className="text-2xl font-bold text-content tracking-tight">Espace de Connexion</h2>
        <p className="text-content-secondary text-sm mt-1">Saisissez vos accès pour accéder à votre tableau de bord.</p>
      </div>

      <form onSubmit={handleRealLogin} className="space-y-8 bg-surface p-10 rounded-3xl border border-border shadow-xl shadow-indigo-500/5">
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
              className="w-full pl-11 pr-4 py-3 bg-app border border-border rounded-xl text-base md:text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Mot de passe</label>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
            >
              Mot de passe oublié ?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-content-muted pointer-events-none" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-11 pr-10 py-3 bg-app border border-border rounded-xl text-base md:text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
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
          disabled={localLoading || loading}
          className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-100/10"
        >
          {localLoading || loading ? (
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



        <p className="text-center text-sm text-content-secondary pt-2">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-raised border border-border rounded-xl text-base md:text-xs text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
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
    </>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, User, Mail, Phone, MapPin, Lock, UserPlus } from 'lucide-react';
import { useAuthStore, type UserRole } from '../../store/authStore';
import { ToastError, ToastSuccess } from '../../controllers/Toast-emitter';
import { mockUniversities } from '../../constants/mockData';
import { ref, get } from 'firebase/database';
import { db } from '../../../firebase-config';
import { getPostLoginPath } from '../../constants/accountStatus';

export default function InscriptionPage() {
  const { signupWithFirebase, loginWithGoogle, activateInvitedAccount, loading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [universityId, setUniversityId] = useState('univ-ufhb');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [filiere, setFiliere] = useState('Informatique');
  const [annee, setAnnee] = useState(1);
  const [specialite, setSpecialite] = useState('');

  const [isInvited, setIsInvited] = useState(false);
  const [invitedUid, setInvitedUid] = useState('');
  const [checkingInvite, setCheckingInvite] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      checkIfEmailIsInvited(emailParam);
    }
  }, [searchParams]);

  const checkIfEmailIsInvited = async (targetEmail: string) => {
    if (!targetEmail) return;
    setCheckingInvite(true);
    try {
      const usersRef = ref(db, 'utilisateurs');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const invitedUser = Object.entries(data).find(
          ([uid, u]: [string, any]) => u && u.email?.toLowerCase() === targetEmail.toLowerCase() && u.status === 'invited'
        );
        if (invitedUser) {
          const [uid, userProfile] = invitedUser as [string, any];
          setIsInvited(true);
          setInvitedUid(uid);
          setPrenom(userProfile.prenom || '');
          setNom(userProfile.nom || '');
          setTelephone(userProfile.telephone || '');
          setAdresse(userProfile.adresse || '');
          setRole(userProfile.role || 'STUDENT');
          setUniversityId(userProfile.universityId || 'univ-ufhb');
          ToastSuccess("Invitation détectée ! Veuillez choisir un mot de passe pour activer votre compte.");
        }
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de l'invitation:", err);
    } finally {
      setCheckingInvite(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      ToastSuccess("Connexion réussie via Google !");
      const updatedUser = useAuthStore.getState().user;
      if (updatedUser) {
        navigate(getPostLoginPath(updatedUser), { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      ToastError("Échec de l'inscription via Google.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !prenom || !nom || !telephone || !adresse) {
      ToastError("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    if (password.length < 6) {
      ToastError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    try {
      if (isInvited) {
        await activateInvitedAccount(email, password, prenom, nom, telephone, adresse, universityId, invitedUid);
        ToastSuccess("Compte activé avec succès ! Un e-mail de validation vous a été envoyé. Veuillez valider votre e-mail avant de vous connecter.");
        navigate('/connexion');
        return;
      }

      if (role === 'UNIVERSITY_ADMIN') {
        const usersRef = ref(db, 'utilisateurs');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const hasAdmin = Object.values(usersData).some(
            (u: any) =>
              u &&
              u.universityId === universityId &&
              u.role === 'UNIVERSITY_ADMIN' &&
              (u.status === 'active' || u.status === 'pending')
          );
          if (hasAdmin) {
            ToastError("Un compte administrateur est déjà actif ou en attente de validation pour cette université.");
            return;
          }
        }
      }

      await signupWithFirebase(
        email,
        password,
        prenom,
        nom,
        telephone,
        adresse,
        role,
        universityId,
        role === 'STUDENT' ? filiere : undefined,
        role === 'STUDENT' ? Number(annee) : undefined
      );
      ToastSuccess("Compte créé avec succès ! Veuillez d'abord valider votre adresse e-mail via le lien envoyé, puis votre compte sera activé après validation par l'administration.");
      navigate('/connexion');
    } catch (err: any) {
      console.error(err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          ToastError("Cet e-mail est déjà utilisé. Connectez-vous plutôt.");
          break;
        case 'auth/weak-password':
          ToastError("Mot de passe trop faible (6 caractères minimum).");
          break;
        case 'auth/invalid-email':
          ToastError("Adresse e-mail invalide.");
          break;
        default:
          ToastError(err.message || "Erreur lors de la création du compte. Réessayez.");
      }
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-12 px-4 overflow-hidden">
      {/* Premium background gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 animate-fade-up">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/images/logo-original.png" alt="Campus Logo" className="w-12 h-12 rounded-2xl shadow-lg object-cover" />
            <span className="font-heading font-black text-2xl tracking-tight text-content">CAMPUS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-content tracking-tight">Inscription Établissement</h2>
          <p className="text-content-secondary text-sm mt-1.5">Créez votre profil universitaire sur CAMPUS.</p>
        </div>

        {/* Form Container */}
        <form 
          onSubmit={handleSignup} 
          className="space-y-8 bg-surface border border-border-subtle p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-100/5 dark:shadow-none transition-colors"
        >
          {/* Invitation Banner */}
          {isInvited && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl flex items-start gap-3 text-indigo-800 dark:text-indigo-200">
              <img src="/images/logo-original.png" alt="Campus Logo" className="w-8 h-8 rounded-lg shrink-0 mt-0.5 object-cover" />
              <div className="text-xs">
                <p className="font-bold text-sm mb-0.5">Invitation Académique Détectée</p>
                <p className="leading-relaxed">
                  Votre établissement vous a déjà inscrit sur la plateforme CAMPUS. Veuillez configurer votre mot de passe pour activer votre compte.
                </p>
              </div>
            </div>
          )}

          {/* Prénom & Nom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Prénom</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4.5 h-4.5 text-content-muted pointer-events-none" />
                <input
                  type="text"
                  value={prenom}
                  onChange={e => setPrenom(e.target.value)}
                  placeholder="Stéphane"
                  required
                  readOnly={isInvited}
                  className="w-full pl-11 pr-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 read-only:opacity-80 read-only:cursor-not-allowed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Nom</label>
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Koffi Yao"
                required
                readOnly={isInvited}
                className="w-full px-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 read-only:opacity-80 read-only:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email */}
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
                readOnly={isInvited}
                className="w-full pl-11 pr-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 read-only:opacity-80 read-only:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Téléphone</label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 w-4.5 h-4.5 text-content-muted pointer-events-none" />
              <input
                type="tel"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Adresse de résidence</label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 w-4.5 h-4.5 text-content-muted pointer-events-none" />
              <input
                type="text"
                value={adresse}
                onChange={e => setAdresse(e.target.value)}
                placeholder="Cocody, Abidjan"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* Rôle & Université */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Rôle</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                disabled={isInvited}
                className="w-full px-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                <option value="STUDENT">Étudiant</option>
                <option value="TEACHER">Enseignant</option>
                <option value="UNIVERSITY_ADMIN">Administrateur</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Université</label>
              <select
                value={universityId}
                onChange={e => setUniversityId(e.target.value)}
                disabled={isInvited}
                className="w-full px-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {mockUniversities.map(u => (
                  <option key={u.id} value={u.id}>{u.name.split(' (')[0]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Student / Teacher fields */}
          {role === 'STUDENT' && !isInvited && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-down">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Filière</label>
                <select
                  value={filiere}
                  onChange={e => setFiliere(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                >
                  <option value="Informatique">Informatique</option>
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Économie">Économie</option>
                  <option value="Droit">Droit</option>
                  <option value="Physique">Physique</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Année d'étude</label>
                <select
                  value={annee}
                  onChange={e => setAnnee(Number(e.target.value))}
                  className="w-full px-4 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
                >
                  <option value={1}>1ère année (Licence 1)</option>
                  <option value={2}>2ème année (Licence 2)</option>
                  <option value={3}>3ème année (Licence 3)</option>
                  <option value={4}>4ème année (Master 1)</option>
                </select>
              </div>
            </div>
          )}

          {/* Mot de passe */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-content-secondary uppercase tracking-wider">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-content-muted pointer-events-none" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-10 py-3.5 bg-surface-raised border border-border rounded-xl text-sm text-content placeholder-content-muted focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Bouton d'activation / inscription */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg mt-4"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                {isInvited ? "Activation du compte…" : "Création du compte…"}
              </>
            ) : (
              <>
                <UserPlus size={16} />
                {isInvited ? "Activer mon compte" : "S'inscrire"}
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-border-subtle"></div>
            <span className="text-xs text-content-muted">ou</span>
            <div className="flex-1 h-px bg-border-subtle"></div>
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
            S'inscrire avec Google
          </button>

          <p className="text-center text-sm text-content-secondary pt-2">
            Déjà inscrit ?{' '}
            <Link to="/connexion" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

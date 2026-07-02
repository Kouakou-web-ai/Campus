import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import PageHeader from '../../components/ui/PageHeader';
import { User, Shield, Sun, Moon, Save, Loader2, Key, Smartphone, Copy, Check, Plus } from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { useTranslation } from '../../hooks/useTranslation';
import { useThemeStore } from '../../store/themeStore';
import { auth } from '../../../firebase-config';
import axios from 'axios';

export default function ParametresProfil() {
  const { user, updateUserProfile, refreshUserProfile, loading } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const { mode, setMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'profil' | 'securite' | 'preferences'>('profil');

  // MFA states
  const [mfaActive, setMfaActive] = useState(!!user?.mfaEnabled);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [verifyingMfa, setVerifyingMfa] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getInitials = (nameStr: string) => {
    if (!nameStr) return '';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let dataToUpdate: any = {};
      let needsUpdate = false;

      // Check Profil tab changes
      if (activeTab === 'profil' && name !== user?.name) {
        if (name.trim().length < 2) {
          ToastError(t('settings.name_too_short'));
          return;
        }
        dataToUpdate.name = name.trim();
        needsUpdate = true;
      }

      // Check Security tab changes
      if (activeTab === 'securite') {
        if (user?.role === 'STUDENT') {
          ToastError("Les étudiants ne sont pas autorisés à modifier leur mot de passe.");
          return;
        }
        if (currentPassword && newPassword) {
          if (newPassword !== confirmPassword) {
            ToastError(t('settings.security.password_mismatch'));
            return;
          }
          if (newPassword.length < 6) {
            ToastError(t('settings.security.password_too_short'));
            return;
          }
          dataToUpdate.currentPassword = currentPassword;
          dataToUpdate.newPassword = newPassword;
          needsUpdate = true;
        } else if (currentPassword || newPassword || confirmPassword) {
          ToastError(t('settings.security.password_required'));
          return;
        }
      }

      // Save to server
      if (needsUpdate) {
        if (updateUserProfile) {
          await updateUserProfile(dataToUpdate);
        } else {
          // Just simulate delay
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Reset password fields after success
      if (dataToUpdate.newPassword) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      ToastSuccess(t('settings.success'));
    } catch (err: any) {
      ToastError(err.message || t('settings.error'));
    }
  };
  const handleToggle2FA = async () => {
    if (mfaActive) {
      if (window.confirm("Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ? Votre compte sera moins sécurisé.")) {
        try {
          const fbUser = auth.currentUser;
          if (fbUser) {
            const token = await fbUser.getIdToken();
            const dbUrl = import.meta.env.VITE_databaseURL;
            await axios.patch(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
              mfaEnabled: false
            });
            ToastSuccess("Authentification à deux facteurs désactivée.");
            setMfaActive(false);
            await refreshUserProfile();
          }
        } catch (err) {
          ToastError("Erreur lors de la désactivation du 2FA.");
        }
      }
    } else {
      setMfaCode('');
      setMfaModalOpen(true);
    }
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      ToastError("Veuillez saisir un code à 6 chiffres.");
      return;
    }
    
    setVerifyingMfa(true);
    try {
      const fbUser = auth.currentUser;
      if (fbUser) {
        const token = await fbUser.getIdToken();
        const dbUrl = import.meta.env.VITE_databaseURL;
        await axios.patch(`${dbUrl}/utilisateurs/${fbUser.uid}.json?auth=${token}`, {
          mfaEnabled: true
        });
        ToastSuccess("L'authentification à deux facteurs (2FA) a été activée avec succès !");
        setMfaActive(true);
        setMfaModalOpen(false);
        await refreshUserProfile();
      }
    } catch (err) {
      ToastError("Erreur lors de la validation du code.");
    } finally {
      setVerifyingMfa(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
    setCopied(true);
    ToastSuccess("Clé de secours copiée !");
    setTimeout(() => setCopied(false), 2000);
  };
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 page-transition">
      <PageHeader 
        title={t('settings.title')} 
        description={t('settings.description')}
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation des paramètres */}
        <div className="md:w-64 flex-shrink-0">
          <div className="card-premium overflow-hidden">
            <ul className="menu bg-base-100/50 w-full p-2 gap-1">
              <li>
                <a 
                  className={`${activeTab === 'profil' ? 'active bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}`}
                  onClick={() => setActiveTab('profil')}
                >
                  <User size={18} /> {t('settings.tab.profil')}
                </a>
              </li>
              {user.role !== 'STUDENT' && (
                <li>
                  <a 
                    className={`${activeTab === 'securite' ? 'active bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}`}
                    onClick={() => setActiveTab('securite')}
                  >
                    <Shield size={18} /> {t('settings.tab.securite')}
                  </a>
                </li>
              )}
              <li>
                <a 
                  className={`${activeTab === 'preferences' ? 'active bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <Sun size={18} /> {t('settings.tab.preferences')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1">
          <div className="card-premium p-6">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Onglet Profil */}
              {activeTab === 'profil' && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-lg font-semibold border-b border-border-subtle pb-2">{t('settings.profile.info')}</h3>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-md">
                        <span className="text-3xl font-bold">{getInitials(name)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text">{t('settings.profile.name')}</span></label>
                      <input 
                        type="text" 
                        className="input input-bordered input-premium w-full" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">{t('settings.profile.email')}</span></label>
                      <input type="email" className="input input-bordered input-premium w-full bg-surface-muted" value={user.email} disabled />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">{t('settings.profile.role')}</span></label>
                      <input type="text" className="input input-bordered input-premium w-full bg-surface-muted" value={t(`role.${user.role}`, user.role.replace('_', ' '))} disabled />
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Sécurité */}
              {activeTab === 'securite' && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-lg font-semibold border-b border-border-subtle pb-2">{t('settings.security.title')}</h3>
                  
                  <div className="form-control max-w-md">
                    <label className="label"><span className="label-text">{t('settings.security.current_password')}</span></label>
                    <input 
                      type="password" 
                      className="input input-bordered input-premium w-full" 
                      placeholder="••••••••" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-control max-w-md">
                    <label className="label"><span className="label-text">{t('settings.security.new_password')}</span></label>
                    <input 
                      type="password" 
                      className="input input-bordered input-premium w-full" 
                      placeholder="••••••••" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-control max-w-md">
                    <label className="label"><span className="label-text">{t('settings.security.confirm_password')}</span></label>
                    <input 
                      type="password" 
                      className="input input-bordered input-premium w-full" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  {/* Authentification à deux facteurs */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Smartphone size={16} className="text-indigo-600 dark:text-indigo-400" />
                          Authentification à deux facteurs (2FA)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xl">
                          Sécurisez votre compte en exigeant un code de validation à usage unique (Google Authenticator, etc.) en plus de votre mot de passe.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${mfaActive ? 'badge-success text-white' : 'badge-ghost'} badge-sm font-bold`}>
                          {mfaActive ? 'Actif' : 'Inactif'}
                        </span>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary toggle-sm"
                          checked={mfaActive}
                          onChange={handleToggle2FA}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Préférences */}
              {activeTab === 'preferences' && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-lg font-semibold border-b border-border-subtle pb-2">{t('settings.preferences.title')}</h3>
                  
                  <div className="form-control max-w-md mb-4">
                    <label className="label"><span className="label-text font-medium">{t('settings.preferences.language')}</span></label>
                    <select 
                      className="select select-bordered select-premium w-full"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                    >
                      <option value="fr">Français (France)</option>
                      <option value="en">English (UK)</option>
                    </select>
                  </div>

                  <div className="form-control max-w-md">
                    <label className="label"><span className="label-text font-medium">{t('settings.preferences.theme')}</span></label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="theme" 
                          className="radio radio-primary" 
                          value="light" 
                          checked={mode === 'light'}
                          onChange={() => setMode('light')}
                        />
                        <Sun size={16} /> {t('settings.preferences.theme.light')}
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="theme" 
                          className="radio radio-primary" 
                          value="dark" 
                          checked={mode === 'dark'}
                          onChange={() => setMode('dark')}
                        />
                        <Moon size={16} /> {t('settings.preferences.theme.dark')}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-border-subtle mt-8">
                <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {loading ? t('settings.profile.saving') : t('settings.profile.save')}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Modale d'activation 2FA */}
      {mfaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setMfaModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Plus className="rotate-45" size={18} />
            </button>

            <form onSubmit={handleConfirm2FA} className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Configurer le 2FA</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Suivez les étapes ci-dessous avec votre application d'authentification (Google Authenticator, Authy, etc.).
                </p>
              </div>

              {/* QR Code SVG */}
              <div className="flex justify-center py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <svg width="130" height="130" viewBox="0 0 140 140" className="bg-white p-2 rounded-2xl shadow-sm border border-slate-150">
                  <rect x="10" y="10" width="30" height="30" fill="#312e81" rx="4" />
                  <rect x="15" y="15" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="20" y="20" width="10" height="10" fill="#312e81" rx="1" />
                  
                  <rect x="100" y="10" width="30" height="30" fill="#312e81" rx="4" />
                  <rect x="105" y="15" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="110" y="20" width="10" height="10" fill="#312e81" rx="1" />
                  
                  <rect x="10" y="100" width="30" height="30" fill="#312e81" rx="4" />
                  <rect x="15" y="105" width="20" height="20" fill="#ffffff" rx="2" />
                  <rect x="20" y="110" width="10" height="10" fill="#312e81" rx="1" />

                  <rect x="50" y="10" width="10" height="10" fill="#4f46e5" rx="1" />
                  <rect x="60" y="20" width="10" height="10" fill="#4f46e5" rx="1" />
                  <rect x="70" y="10" width="20" height="10" fill="#4f46e5" rx="1" />
                  <rect x="50" y="30" width="10" height="20" fill="#312e81" rx="1" />
                  <rect x="80" y="30" width="10" height="10" fill="#4f46e5" rx="1" />
                  
                  <rect x="10" y="50" width="20" height="10" fill="#312e81" rx="1" />
                  <rect x="40" y="50" width="30" height="10" fill="#4f46e5" rx="1" />
                  <rect x="80" y="50" width="20" height="20" fill="#312e81" rx="1" />
                  <rect x="110" y="50" width="10" height="10" fill="#4f46e5" rx="1" />
                  
                  <rect x="10" y="70" width="10" height="10" fill="#4f46e5" rx="1" />
                  <rect x="30" y="70" width="20" height="10" fill="#312e81" rx="1" />
                  <rect x="60" y="70" width="15" height="15" fill="#4f46e5" rx="1" />
                  <rect x="120" y="70" width="10" height="20" fill="#312e81" rx="1" />

                  <rect x="90" y="80" width="20" height="10" fill="#4f46e5" rx="1" />
                  
                  <rect x="50" y="100" width="10" height="30" fill="#312e81" rx="1" />
                  <rect x="70" y="100" width="20" height="10" fill="#4f46e5" rx="1" />
                  <rect x="70" y="115" width="10" height="15" fill="#312e81" rx="1" />
                  <rect x="90" y="110" width="10" height="20" fill="#4f46e5" rx="1" />
                  <rect x="110" y="100" width="20" height="10" fill="#312e81" rx="1" />
                  <rect x="110" y="120" width="10" height="10" fill="#4f46e5" rx="1" />
                </svg>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-semibold">Clé manuelle</span>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">JBSWY3DPEHPK3PXP</code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1.5 text-slate-400 hover:text-indigo-650 rounded-lg hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-150 dark:hover:border-slate-800 transition-all flex-shrink-0"
                    title="Copier"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code de validation</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Ex: 123456"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="input input-bordered input-premium w-full px-3 py-2.5 text-center text-lg font-bold font-mono tracking-widest"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMfaModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={verifyingMfa}
                  className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-650 dark:bg-slate-800 dark:hover:bg-indigo-600 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {verifyingMfa && <Loader2 size={12} className="animate-spin" />}
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

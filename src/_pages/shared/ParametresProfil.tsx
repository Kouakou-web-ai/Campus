import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import PageHeader from '../../components/ui/PageHeader';
import { User, Shield, Sun, Moon, Save, Loader2 } from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { useTranslation } from '../../hooks/useTranslation';
import { useThemeStore } from '../../store/themeStore';

export default function ParametresProfil() {
  const { user, updateUserProfile, loading } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const { mode, setMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'profil' | 'securite' | 'preferences'>('profil');

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
    </div>
  );
}

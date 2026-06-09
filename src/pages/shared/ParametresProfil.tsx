import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import PageHeader from '../../components/ui/PageHeader';
import { User, Shield, Bell, Moon, Sun, Save, CheckCircle, Loader2 } from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

export default function ParametresProfil() {
  const { user, updateUserProfile, loading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profil' | 'securite' | 'notifications' | 'preferences'>('profil');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences states
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  
  // Notifications states
  const [notifEmails, setNotifEmails] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);

  // Load preferences from localStorage if any
  useEffect(() => {
    const savedTheme = localStorage.getItem('campus-theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    if (user) {
      const savedNotifs = localStorage.getItem(`campus-notifs-${user.id}`);
      if (savedNotifs) {
        const parsed = JSON.parse(savedNotifs);
        setNotifEmails(parsed.emails ?? true);
        setNotifMessages(parsed.messages ?? true);
      }
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let dataToUpdate: any = {};
      let needsUpdate = false;

      // Check Profil tab changes
      if (activeTab === 'profil' && name !== user?.name) {
        if (name.trim().length < 2) {
          ToastError('Le nom doit contenir au moins 2 caractères.');
          return;
        }
        dataToUpdate.name = name.trim();
        needsUpdate = true;
      }

      // Check Security tab changes
      if (activeTab === 'securite') {
        if (currentPassword && newPassword) {
          if (newPassword !== confirmPassword) {
            ToastError('Les nouveaux mots de passe ne correspondent pas.');
            return;
          }
          if (newPassword.length < 6) {
            ToastError('Le nouveau mot de passe doit faire au moins 6 caractères.');
            return;
          }
          dataToUpdate.currentPassword = currentPassword;
          dataToUpdate.newPassword = newPassword;
          needsUpdate = true;
        } else if (currentPassword || newPassword || confirmPassword) {
          ToastError('Veuillez remplir tous les champs de mot de passe pour le modifier.');
          return;
        }
      }

      // Check Preferences
      if (activeTab === 'preferences') {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (theme !== currentTheme) {
          dataToUpdate.theme = theme;
          needsUpdate = true;
        }
      }

      // Save to server
      if (needsUpdate) {
        if (updateUserProfile) {
          await updateUserProfile(dataToUpdate);
        } else {
          // If in mock mode (no updateUserProfile available, or just mocking)
          if (dataToUpdate.theme) {
            document.documentElement.setAttribute('data-theme', dataToUpdate.theme);
            localStorage.setItem('campus-theme', dataToUpdate.theme);
          }
          // Just simulate delay
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Save local notifications
      if (activeTab === 'notifications' && user) {
        localStorage.setItem(`campus-notifs-${user.id}`, JSON.stringify({
          emails: notifEmails,
          messages: notifMessages
        }));
      }

      // Reset password fields after success
      if (dataToUpdate.newPassword) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      ToastSuccess('Paramètres sauvegardés avec succès.');
    } catch (err: any) {
      ToastError(err.message || 'Erreur lors de la sauvegarde.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 page-transition">
      <PageHeader 
        title="Paramètres" 
        description="Gérez vos informations personnelles, votre sécurité et vos préférences."
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
                  <User size={18} /> Mon Profil
                </a>
              </li>
              <li>
                <a 
                  className={`${activeTab === 'securite' ? 'active bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}`}
                  onClick={() => setActiveTab('securite')}
                >
                  <Shield size={18} /> Sécurité
                </a>
              </li>
              <li>
                <a 
                  className={`${activeTab === 'notifications' ? 'active bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell size={18} /> Notifications
                </a>
              </li>
              <li>
                <a 
                  className={`${activeTab === 'preferences' ? 'active bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : ''}`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <Sun size={18} /> Préférences
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
                  <h3 className="text-lg font-semibold border-b border-border-subtle pb-2">Informations Personnelles</h3>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="avatar placeholder">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full w-24 shadow-md">
                        <span className="text-3xl">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <div>
                      <button type="button" className="btn btn-sm btn-outline mb-2">Changer la photo</button>
                      <p className="text-xs text-content-muted">Format JPG, GIF ou PNG. Taille max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text">Nom complet</span></label>
                      <input 
                        type="text" 
                        className="input input-bordered input-premium w-full" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">Adresse Email</span></label>
                      <input type="email" className="input input-bordered input-premium w-full bg-surface-muted" value={user.email} disabled />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">Rôle</span></label>
                      <input type="text" className="input input-bordered input-premium w-full bg-surface-muted" value={user.role.replace('_', ' ')} disabled />
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Sécurité */}
              {activeTab === 'securite' && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-lg font-semibold border-b border-border-subtle pb-2">Sécurité du Compte</h3>
                  
                  <div className="form-control max-w-md">
                    <label className="label"><span className="label-text">Mot de passe actuel</span></label>
                    <input 
                      type="password" 
                      className="input input-bordered input-premium w-full" 
                      placeholder="••••••••" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-control max-w-md">
                    <label className="label"><span className="label-text">Nouveau mot de passe</span></label>
                    <input 
                      type="password" 
                      className="input input-bordered input-premium w-full" 
                      placeholder="••••••••" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-control max-w-md">
                    <label className="label"><span className="label-text">Confirmer le nouveau mot de passe</span></label>
                    <input 
                      type="password" 
                      className="input input-bordered input-premium w-full" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="divider-gradient my-6"></div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Authentification à deux facteurs (A2F)</h4>
                      <p className="text-sm text-content-muted">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                    </div>
                    <button type="button" className="btn btn-outline btn-sm">Activer A2F</button>
                  </div>
                </div>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-lg font-semibold border-b border-border-subtle pb-2">Préférences de Notification</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-surface-raised transition-colors">
                      <div>
                        <span className="font-medium">Emails de plateforme</span>
                        <p className="text-xs text-content-muted">Recevoir des mises à jour sur l'application.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={notifEmails}
                        onChange={(e) => setNotifEmails(e.target.checked)}
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-surface-raised transition-colors">
                      <div>
                        <span className="font-medium">Messages directs</span>
                        <p className="text-xs text-content-muted">Être notifié lors de la réception d'un nouveau message.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={notifMessages}
                        onChange={(e) => setNotifMessages(e.target.checked)}
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-surface-raised transition-colors opacity-70">
                      <div>
                        <span className="font-medium">Alertes de sécurité</span>
                        <p className="text-xs text-content-muted">M'avertir des connexions suspectes.</p>
                      </div>
                      <input type="checkbox" className="toggle toggle-primary" checked disabled />
                    </label>
                  </div>
                </div>
              )}

              {/* Onglet Préférences */}
              {activeTab === 'preferences' && (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-lg font-semibold border-b border-border-subtle pb-2">Préférences d'Affichage</h3>
                  
                  <div className="form-control max-w-md mb-4">
                    <label className="label"><span className="label-text font-medium">Langue</span></label>
                    <select className="select select-bordered select-premium w-full">
                      <option value="fr">Français (France)</option>
                      <option value="en" disabled>Anglais (Bientôt)</option>
                    </select>
                  </div>

                  <div className="form-control max-w-md">
                    <label className="label"><span className="label-text font-medium">Thème</span></label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="theme" 
                          className="radio radio-primary" 
                          value="light" 
                          checked={theme === 'light'}
                          onChange={() => setTheme('light')}
                        />
                        <Sun size={16} /> Clair
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="theme" 
                          className="radio radio-primary" 
                          value="dark" 
                          checked={theme === 'dark'}
                          onChange={() => setTheme('dark')}
                        />
                        <Moon size={16} /> Sombre
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-border-subtle mt-8">
                <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

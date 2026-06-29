import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Globe, CreditCard, ShieldAlert, Users, BookOpen, FileText, DollarSign, Trash2, ShieldCheck, User } from 'lucide-react';
import type { University } from '../../types';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import StatusBadge from './StatusBadge';

interface UniversityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string | null;
}

const PLAN_FEATURES = {
  starter: {
    name: 'Starter',
    price: '50 000 FCFA / mois',
    quota: '500 étudiants',
    features: ['Accès aux fonctionnalités de base', 'Support par email']
  },
  pro: {
    name: 'Pro',
    price: '100 000 FCFA / mois',
    quota: '5 000 étudiants',
    features: ['Toutes les fonctionnalités', 'Support prioritaire 24/7', 'Messagerie intégrée']
  },
  enterprise: {
    name: 'Entreprise',
    price: 'Sur devis',
    quota: 'Étudiants illimités',
    features: ['Infrastructure dédiée', 'Support ultra-prioritaire dédié', 'Fonctionnalités sur-mesure']
  }
};

export default function UniversityManagementModal({ isOpen, onClose, universityId }: UniversityManagementModalProps) {
  const { universities, updateUniversity, deleteUniversity } = useRealtimeDataStore();
  const [activeTab, setActiveTab] = useState<'info' | 'plan' | 'admin' | 'danger'>('info');
  
  // Find current university from store
  const u = universities.find(univ => univ.id === universityId);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [plan, setPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [status, setStatus] = useState<any>('actif');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when university changes
  useEffect(() => {
    if (u) {
      setName(u.name || '');
      setCity(u.city || '');
      setCountry(u.country || '');
      setPlan(u.plan || 'pro');
      setStatus(u.status || 'actif');
      setAdminName(u.adminName || '');
      setAdminEmail(u.adminEmail || '');
      setDeleteConfirmName('');
    }
  }, [u, universityId]);

  if (!isOpen || !u) return null;

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !country.trim()) {
      ToastError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    setIsSaving(true);
    try {
      await updateUniversity(u.id, { name, city, country });
      ToastSuccess('Informations générales mises à jour avec succès !');
    } catch (err: any) {
      ToastError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePlan = async (newPlan: 'starter' | 'pro' | 'enterprise') => {
    setIsSaving(true);
    try {
      await updateUniversity(u.id, { plan: newPlan });
      setPlan(newPlan);
      ToastSuccess(`Plan d'abonnement mis à jour vers ${PLAN_FEATURES[newPlan].name} !`);
    } catch (err: any) {
      ToastError(err.message || 'Erreur lors du changement de plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: any) => {
    setIsSaving(true);
    try {
      await updateUniversity(u.id, { status: newStatus });
      setStatus(newStatus);
      ToastSuccess(`Statut d'accès configuré sur : ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      ToastError(err.message || 'Erreur lors du changement de statut.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      ToastError('Veuillez renseigner le nom et l\'email de l\'administrateur.');
      return;
    }
    setIsSaving(true);
    try {
      await updateUniversity(u.id, { adminName, adminEmail });
      ToastSuccess('Administrateur principal mis à jour avec succès !');
    } catch (err: any) {
      ToastError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmName !== u.name) {
      ToastError('Le nom saisi ne correspond pas exactemement au nom de l\'établissement.');
      return;
    }
    if (!window.confirm(`Êtes-vous absolument sûr de vouloir détruire définitivement l'université ${u.name} et toutes ses données associées ? Cette action est irréversible.`)) {
      return;
    }
    setIsSaving(true);
    try {
      await deleteUniversity(u.id);
      ToastSuccess(`L'université ${u.name} a été supprimée avec succès.`);
      onClose();
    } catch (err: any) {
      ToastError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setIsSaving(false);
    }
  };

  const occupancy = u.studentsCount > 0 ? Math.min(100, Math.round((u.studentsCount / (u.plan === 'starter' ? 500 : u.plan === 'pro' ? 5000 : 999999)) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
            {u.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">{u.name}</h3>
              <div className="flex justify-center gap-1.5">
                <StatusBadge status={u.status} />
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 flex items-center">
                  {u.plan}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
              <MapPin size={14} className="text-slate-400" /> {u.city}, {u.country}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 my-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Building2 size={16} /> Détails
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'plan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <CreditCard size={16} /> Formules
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'admin' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={16} /> Admin
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'danger' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-red-500'
            }`}
          >
            <ShieldAlert size={16} /> Sécurité
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-4">
          {/* TAB 1: INFO & LIVE STATISTICS */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Form Info */}
              <form onSubmit={handleUpdateDetails} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom officiel</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pays</label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSaving && <span className="loading loading-spinner loading-xs"></span>}
                    Sauvegarder
                  </button>
                </div>
              </form>

              {/* Live Statistics Grid */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  Statistiques d'utilisation en direct
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 text-xs font-medium">Étudiants inscrits</span>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{u.studentsCount.toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Quota d'étudiants</span>
                        <span className="font-semibold">{occupancy}%</span>
                      </div>
                      <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${occupancy}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 text-xs font-medium">Enseignants</span>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{u.teachersCount}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-auto">Membres du corps professoral</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 text-xs font-medium">Cours créés</span>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{u.coursCount || 0}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-auto">Matières & enseignements</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 text-xs font-medium">Devoirs publiés</span>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{u.devoirsCount || 0}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-auto">Évaluations actives</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-400 text-xs font-medium">Fichiers stockés</span>
                      <p className="text-2xl font-bold text-slate-800 mt-1">{u.ressourcesCount || 0}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-auto">Ressources & documents</p>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50 flex flex-col justify-between">
                    <div>
                      <span className="text-emerald-600 text-xs font-medium">Transactions</span>
                      <p className="text-xl font-bold text-emerald-800 mt-1 truncate">{(u.transactionsCount || 0).toLocaleString('fr-FR')}</p>
                    </div>
                    <p className="text-[10px] text-emerald-500 mt-auto">Paiements de scolarité</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLANS & BILLING */}
          {activeTab === 'plan' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Sélectionner une formule d'abonnement</h4>
              <p className="text-xs text-slate-400">Le changement de plan met immédiatement à jour la formule de facturation mensuelle de la plateforme.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {(Object.keys(PLAN_FEATURES) as Array<keyof typeof PLAN_FEATURES>).map(key => {
                  const item = PLAN_FEATURES[key];
                  const isCurrent = plan === key;

                  return (
                    <div
                      key={key}
                      onClick={() => !isSaving && !isCurrent && handleUpdatePlan(key)}
                      className={`card-premium p-5 cursor-pointer transition-all border-2 text-center flex flex-col ${
                        isCurrent
                          ? 'border-indigo-600 bg-indigo-50/20'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.name}</span>
                      <p className="text-lg font-extrabold text-slate-900 mt-2">{item.price}</p>
                      <p className="text-[11px] text-indigo-600 font-semibold mt-1">{item.quota}</p>
                      
                      <div className="my-4 border-t border-slate-100 pt-4 flex-1">
                        <ul className="text-left space-y-1.5">
                          {item.features.map((f, fi) => (
                            <li key={fi} className="text-[10px] text-slate-500 flex items-center gap-1">
                              <span className="text-indigo-500">✓</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <button
                        disabled={isSaving || isCurrent}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white cursor-default'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isCurrent ? 'Actuel' : 'Choisir'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADMINISTRATEUR & ACCÈS */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              {/* Form Admin */}
              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Administrateur principal</h4>
                <p className="text-xs text-slate-400">Ces informations identifient la personne gérant l'administration locale de l'établissement.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom complet</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={e => setAdminName(e.target.value)}
                      placeholder="ex: Dr. Bakary Koné"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adresse e-mail</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="ex: b.kone@univ.ci"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isSaving && <span className="loading loading-spinner loading-xs"></span>}
                    Sauvegarder l'administrateur
                  </button>
                </div>
              </form>

              {/* Status and access control */}
              <div className="border-t border-slate-100 pt-6">
                <h4 className="text-sm font-bold text-slate-800 mb-1">Statut d'accès global</h4>
                <p className="text-xs text-slate-400 mb-4">Le changement de statut s'applique immédiatement sur tous les comptes d'utilisateurs rattachés.</p>
                
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleUpdateStatus('actif')}
                    disabled={isSaving || status === 'actif'}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      status === 'actif'
                        ? 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-300'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <ShieldCheck size={14} /> Activer l'accès
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('suspendu')}
                    disabled={isSaving || status === 'suspendu'}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      status === 'suspendu'
                        ? 'bg-red-100 text-red-700 font-bold border border-red-300 shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-transparent'
                    }`}
                  >
                    <ShieldAlert size={14} /> Suspendre l'accès
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('en_attente')}
                    disabled={isSaving || status === 'en_attente'}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      status === 'en_attente'
                        ? 'bg-amber-100 text-amber-700 font-bold border border-amber-300'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
                    }`}
                  >
                    <X size={14} /> Mettre en attente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="space-y-4 bg-red-50/50 rounded-2xl p-5 border border-red-100">
              <h4 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                <Trash2 size={16} /> Zone de danger
              </h4>
              <p className="text-xs text-red-600 leading-relaxed">
                La suppression d'un établissement supprime définitivement tous ses enregistrements dans le système : étudiants, enseignants, cours, documents administratifs et transactions financières. Cette opération ne peut en aucun cas être annulée.
              </p>
              
              <form onSubmit={handleDelete} className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                  Saisir le nom de l'université pour valider
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteConfirmName}
                    onChange={e => setDeleteConfirmName(e.target.value)}
                    placeholder={u.name}
                    className="flex-1 px-3.5 py-2 bg-white border border-red-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-red-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSaving || deleteConfirmName !== u.name}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

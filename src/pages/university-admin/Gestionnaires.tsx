import React, { useState } from 'react';
import { Plus, Trash2, Mail, ShieldCheck, UserPlus, Key, Copy, Check, Clock } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SearchBar from '../../components/ui/SearchBar';
import { Avatar } from '../../components/ui/AvatarGroup';
import type { Gestionnaire, TableColumn } from '../../types';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

export default function Gestionnaires() {
  const { user } = useAuthStore();
  const { gestionnaires, addGestionnaire, updateGestionnaire, deleteGestionnaire, loading } = useRealtimeDataStore();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'tous' | 'FINANCE_MANAGER' | 'STUDENT_MANAGER' | 'TEACHER_MANAGER'>('tous');
  const [modalOpen, setModalOpen] = useState(false);
  
  // Delegation states
  const [delegationModalOpen, setDelegationModalOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Gestionnaire | null>(null);
  const [delegationDuration, setDelegationDuration] = useState<'1h' | '4h' | '1d' | '1w' | 'custom'>('1h');
  const [customExpiry, setCustomExpiry] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'FINANCE_MANAGER' | 'STUDENT_MANAGER' | 'TEACHER_MANAGER'>('FINANCE_MANAGER');
  const [submitting, setSubmitting] = useState(false);

  // Generated credentials state
  const [generatedCreds, setGeneratedCreds] = useState<{
    email: string;
    name: string;
    tempPassword: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleDelete = async (uid: string) => {
    if (!user?.universityId) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce gestionnaire ? Il perdra immédiatement tous ses accès.")) {
      try {
        await deleteGestionnaire(user.universityId, uid);
        ToastSuccess("Gestionnaire supprimé avec succès.");
      } catch (err) {
        ToastError("Erreur lors de la suppression.");
      }
    }
  };

  const handleOpenDelegationModal = (manager: Gestionnaire) => {
    setSelectedManager(manager);
    setDelegationDuration('1h');
    setCustomExpiry('');
    setDelegationModalOpen(true);
  };

  const handleDelegationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !user?.universityId || !selectedManager) return;

    let expiresAt = '';
    const now = new Date();
    
    if (delegationDuration === '1h') {
      expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    } else if (delegationDuration === '4h') {
      expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
    } else if (delegationDuration === '1d') {
      expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    } else if (delegationDuration === '1w') {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (delegationDuration === 'custom') {
      if (!customExpiry) {
        ToastError("Veuillez sélectionner une date et heure d'expiration.");
        return;
      }
      const customDate = new Date(customExpiry);
      if (customDate <= now) {
        ToastError("La date d'expiration doit être dans le futur.");
        return;
      }
      expiresAt = customDate.toISOString();
    }

    try {
      await updateGestionnaire(user.universityId, selectedManager.id, {
        delegation: {
          active: true,
          expiresAt,
          originalRole: selectedManager.role,
          delegatedBy: user.id
        }
      } as any);
      ToastSuccess(`Accès Admin délégués avec succès à ${selectedManager.name}.`);
      setDelegationModalOpen(false);
      setSelectedManager(null);
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de la délégation des accès.");
    }
  };

  const handleRevokeDelegation = async (manager: Gestionnaire) => {
    if (!user?.universityId) return;
    if (window.confirm(`Êtes-vous sûr de vouloir révoquer immédiatement la délégation d'accès Admin pour ${manager.name} ?`)) {
      try {
        await updateGestionnaire(user.universityId, manager.id, {
          delegation: null as any
        });
        ToastSuccess(`Délégation d'accès Admin révoquée pour ${manager.name}.`);
      } catch (err) {
        console.error(err);
        ToastError("Erreur lors de la révocation.");
      }
    }
  };

  const handleCopyPassword = () => {
    if (generatedCreds) {
      navigator.clipboard.writeText(generatedCreds.tempPassword);
      setCopied(true);
      ToastSuccess("Mot de passe temporaire copié !");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!name.trim() || !email.trim()) {
      ToastError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await addGestionnaire(user.universityId, {
        name: name.trim(),
        email: email.trim(),
        role
      });
      setGeneratedCreds({
        name: name.trim(),
        email: email.trim(),
        tempPassword: res.tempPassword
      });
      ToastSuccess("Gestionnaire créé avec succès !");
      setName('');
      setEmail('');
      setRole('FINANCE_MANAGER');
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'FINANCE_MANAGER':
        return 'Gestionnaire Financier';
      case 'STUDENT_MANAGER':
        return 'Gestionnaire Étudiants';
      case 'TEACHER_MANAGER':
        return 'Gestionnaire Enseignants';
      default:
        return r;
    }
  };

  const columns: TableColumn<Gestionnaire>[] = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle Délégué',
      sortable: true,
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-750 border border-indigo-100">
          <ShieldCheck size={12} />
          {getRoleLabel(String(v))}
        </span>
      ),
    },
    {
      key: 'delegation',
      label: 'Accès Admin',
      render: (_, row) => {
        const isDelegated = row.delegation?.active && new Date(row.delegation.expiresAt) > new Date();
        if (isDelegated) {
          const timeLeft = new Date(row.delegation!.expiresAt).getTime() - new Date().getTime();
          const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
          const minsLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          
          let displayTime = '';
          if (hoursLeft > 24) {
            displayTime = `${Math.floor(hoursLeft / 24)}j ${hoursLeft % 24}h`;
          } else if (hoursLeft > 0) {
            displayTime = `${hoursLeft}h ${minsLeft}m`;
          } else {
            displayTime = `${minsLeft}m`;
          }

          return (
            <div className="flex flex-col">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 w-fit">
                <Clock size={10} />
                Actif
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Reste : {displayTime}</span>
            </div>
          );
        }
        return (
          <span className="text-xs text-slate-400 italic">Non délégué</span>
        );
      }
    },
    {
      key: 'createdAt',
      label: 'Date d\'affectation',
      sortable: true,
      render: (v) => <span className="text-xs text-slate-500">{new Date(String(v)).toLocaleDateString('fr-FR')}</span>,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (v) => <StatusBadge status={v as never} />,
    },
    {
      key: 'id',
      label: '',
      render: (_, row) => {
        const isDelegated = row.delegation?.active && new Date(row.delegation.expiresAt) > new Date();
        return (
          <div className="flex items-center gap-2 justify-end">
            {isDelegated ? (
              <button
                onClick={() => handleRevokeDelegation(row)}
                className="p-1.5 text-amber-600 hover:text-red-650 hover:bg-amber-50 rounded-lg transition-all"
                title="Révoquer l'accès Admin"
              >
                <Key size={14} className="fill-amber-100" />
              </button>
            ) : (
              <button
                onClick={() => handleOpenDelegationModal(row)}
                className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-lg transition-all"
                title="Déléguer des accès Admin"
              >
                <Key size={14} />
              </button>
            )}
            <a href={`mailto:${row.email}`} className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-lg transition-all" title="Contacter par e-mail">
              <Mail size={14} />
            </a>
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
              title="Supprimer la délégation"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  const filtered = (gestionnaires || []).filter(g => {
    if (!g) return false;
    const searchLower = search.toLowerCase();
    const matchesSearch = g.name.toLowerCase().includes(searchLower) || g.email.toLowerCase().includes(searchLower);
    const matchesRole = filterRole === 'tous' || g.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const countFinance = (gestionnaires || []).filter(g => g.role === 'FINANCE_MANAGER').length;
  const countStudents = (gestionnaires || []).filter(g => g.role === 'STUDENT_MANAGER').length;
  const countTeachers = (gestionnaires || []).filter(g => g.role === 'TEACHER_MANAGER').length;

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Délégation de gestion"
        description="Créez des rôles restreints et affectez du personnel pour gérer la finance, les étudiants ou les enseignants."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Gestionnaires' }]}
        actions={
          <button onClick={() => { setGeneratedCreds(null); setModalOpen(true); }} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5">
            <Plus size={14} />
            Désigner un gestionnaire
          </button>
        }
      />

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total délégués" value={(gestionnaires || []).length} icon={<ShieldCheck size={20} className="text-indigo-600" />} gradient="bg-indigo-50" />
        <StatCard title="Gestionnaires Finance" value={countFinance} icon={<Plus size={20} className="text-emerald-600" />} gradient="bg-emerald-50" />
        <StatCard title="Gestionnaires Étudiants" value={countStudents} icon={<UserPlus size={20} className="text-blue-600" />} gradient="bg-blue-50" />
        <StatCard title="Gestionnaires Enseignants" value={countTeachers} icon={<UserPlus size={20} className="text-violet-600" />} gradient="bg-violet-50" />
      </div>

      <div className="card-premium overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-slate-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Chercher un nom, email…" className="w-full sm:w-64" />
          <select value={filterRole} onChange={(e: any) => setFilterRole(e.target.value)} className="input-premium px-3 py-2 text-sm">
            <option value="tous">Tous les rôles</option>
            <option value="FINANCE_MANAGER">Gestionnaire Financier</option>
            <option value="STUDENT_MANAGER">Gestionnaire Étudiants</option>
            <option value="TEACHER_MANAGER">Gestionnaire Enseignants</option>
          </select>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} gestionnaire(s)</span>
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          emptyMessage="Aucun gestionnaire désigné pour le moment."
        />
      </div>

      {/* Modal d'ajout */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Plus className="rotate-45" size={18} />
            </button>

            {!generatedCreds ? (
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Désigner un gestionnaire</h3>
                  <p className="text-xs text-slate-500 mt-1">Créez un accès sécurisé avec droits restreints.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kouamé Konan Marc"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-premium w-full px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: m.kouame@univ-ufhb.ci"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium w-full px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle délégué</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="input-premium w-full px-3 py-2.5 text-sm"
                  >
                    <option value="FINANCE_MANAGER">Gestionnaire Financier (Finance uniquement)</option>
                    <option value="STUDENT_MANAGER">Gestionnaire Étudiants (Étudiants uniquement)</option>
                    <option value="TEACHER_MANAGER">Gestionnaire Enseignants (Enseignants uniquement)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting && <span className="loading loading-spinner loading-xs" />}
                    Générer les accès
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5 text-center">
                <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Compte créé avec succès !</h3>
                  <p className="text-xs text-slate-500 mt-1">Transmettez ces informations sécurisées à <strong>{generatedCreds.name}</strong>.</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl text-left border border-slate-100 space-y-2.5">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Identifiant / Email</span>
                    <strong className="text-xs text-slate-800 break-all">{generatedCreds.email}</strong>
                  </div>
                  <div className="relative">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Mot de passe temporaire</span>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <code className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200 text-indigo-650 tracking-wider">
                        {generatedCreds.tempPassword}
                      </code>
                      <button
                        onClick={handleCopyPassword}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-all flex-shrink-0"
                        title="Copier"
                      >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal italic">
                  Note : Le mot de passe devra obligatoirement être modifié lors de la première connexion.
                </p>

                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Délégation */}
      {delegationModalOpen && selectedManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => { setDelegationModalOpen(false); setSelectedManager(null); }}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-50 rounded-xl transition-all"
            >
              <Plus className="rotate-45" size={18} />
            </button>

            <form onSubmit={handleDelegationSubmit} className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Déléguer l'accès Administrateur</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Permettez à <strong>{selectedManager.name}</strong> d'accéder à l'intégralité de votre compte administrateur pour une période déterminée.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Durée de la délégation</label>
                <select
                  value={delegationDuration}
                  onChange={(e: any) => setDelegationDuration(e.target.value)}
                  className="input-premium w-full px-3 py-2.5 text-sm"
                >
                  <option value="1h">1 Heure</option>
                  <option value="4h">4 Heures</option>
                  <option value="1d">1 Jour</option>
                  <option value="1w">1 Semaine</option>
                  <option value="custom">Date et heure personnalisées</option>
                </select>
              </div>

              {delegationDuration === 'custom' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date et heure de fin</label>
                  <input
                    type="datetime-local"
                    required
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    className="input-premium w-full px-3 py-2.5 text-sm"
                  />
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2.5">
                <Clock size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-amber-850 leading-normal">
                  Une fois cette période écoulée, {selectedManager.name} perdra automatiquement tous les droits d'administration et retrouvera ses accès restreints d'origine.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => { setDelegationModalOpen(false); setSelectedManager(null); }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-indigo-650 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  Activer la délégation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

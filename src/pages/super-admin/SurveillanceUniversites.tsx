import { useState } from 'react';
import { Search, Filter, Plus, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressRing from '../../components/ui/ProgressRing';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import type { University } from '../../types';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import UniversityManagementModal from '../../components/ui/UniversityManagementModal';

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-slate-100 text-slate-600',
  pro: 'bg-indigo-100 text-indigo-700',
  enterprise: 'bg-amber-100 text-amber-700',
};

function UnivCard({ u, onManage }: { u: University; onManage: (id: string) => void }) {
  const occupancy = u.studentsCount > 0 ? Math.min(100, Math.round((u.studentsCount / (u.plan === 'starter' ? 500 : u.plan === 'pro' ? 5000 : 999999)) * 100)) : 0;

  return (
    <div className="card-premium p-6 group hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
            {u.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm leading-tight">{u.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">{u.city} · {u.country}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={u.status} />
          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${PLAN_COLORS[u.plan]}`}>
            {u.plan === 'enterprise' ? 'entreprise' : u.plan}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-slate-800">{u.studentsCount.toLocaleString('fr-FR')}</div>
          <div className="text-xs text-slate-400">Étudiants</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-slate-800">{u.teachersCount}</div>
          <div className="text-xs text-slate-400">Enseignants</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center">
          <div className="text-sm font-bold text-emerald-700 truncate">{u.mrr.toLocaleString('fr-FR')} FCFA</div>
          <div className="text-[10px] text-emerald-500">Abonnement</div>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-4 bg-slate-50/50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
        <span className="text-slate-400">Admin :</span>
        <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={u.adminName || 'Non assigné'}>
          {u.adminName || 'Non assigné'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Occupation quota</span>
            <span className="font-semibold">{occupancy}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                occupancy > 90 ? 'bg-red-400' : occupancy > 70 ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>
        <ProgressRing
          value={occupancy}
          size={44}
          strokeWidth={4}
          color={occupancy > 90 ? '#ef4444' : occupancy > 70 ? '#f59e0b' : '#6366f1'}
          className="ml-4 flex-shrink-0"
        />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <span className="text-xs text-slate-400">Depuis le {new Date(u.createdAt).toLocaleDateString('fr-FR')}</span>
        <button
          onClick={() => onManage(u.id)}
          className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
        >
          Gérer →
        </button>
      </div>
    </div>
  );
}

export default function SurveillanceUniversites() {
  const { universities, addUniversity, loading } = useRealtimeDataStore();
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('tous');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnivId, setSelectedUnivId] = useState<string | null>(null);

  // Form states for new university
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('Abidjan');
  const [newPlan, setNewPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');

  const filtered = universities.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.city.toLowerCase().includes(search.toLowerCase());
    const matchPlan = filterPlan === 'tous' || u.plan === filterPlan;
    const matchStatus = filterStatus === 'tous' || u.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      ToastError("Veuillez renseigner le nom de l'université.");
      return;
    }
    try {
      await addUniversity({
        name: newName,
        city: newCity,
        country: "Côte d'Ivoire",
        plan: newPlan,
        status: 'actif',
        studentsCount: 0,
        teachersCount: 0,
        mrr: newPlan === 'enterprise' ? 250000 : newPlan === 'pro' ? 100000 : 50000,
        createdAt: new Date().toISOString().split('T')[0]
      });
      ToastSuccess("Université ajoutée avec succès !");
      setNewName('');
      setModalOpen(false);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de l'ajout.");
    }
  };

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
        title="Surveillance universités"
        description="Monitoring en temps réel de tous les établissements partenaires"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Universités' }]}
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5">
            <Plus size={14} />
            Nouvelle université
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une université…"
            className="input-premium w-full pl-9 pr-4 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterPlan}
            onChange={e => setFilterPlan(e.target.value)}
            className="input-premium px-3 py-2 text-sm"
          >
            <option value="tous">Tous les plans</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Entreprise</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input-premium px-3 py-2 text-sm"
          >
            <option value="tous">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="en_attente">En attente</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-slate-400 flex items-center">
          {filtered.length} université{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grid universités */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <p className="text-slate-400 text-sm">Aucune université trouvée. Cliquez sur "Nouvelle université" pour en ajouter une.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(u => (
            <UnivCard key={u.id} u={u} onManage={setSelectedUnivId} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Ajouter une université</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom de l'établissement</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="ex: Université Polytechnique de Man"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ville</label>
                <select
                  value={newCity}
                  onChange={e => setNewCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Abidjan">Abidjan</option>
                  <option value="Yamoussoukro">Yamoussoukro</option>
                  <option value="Bouaké">Bouaké</option>
                  <option value="Daloa">Daloa</option>
                  <option value="Korhogo">Korhogo</option>
                  <option value="Man">Man</option>
                  <option value="San Pédro">San Pédro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plan d'abonnement</label>
                <select
                  value={newPlan}
                  onChange={e => setNewPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="starter">Starter (50 000 FCFA / mois)</option>
                  <option value="pro">Pro (100 000 FCFA / mois)</option>
                  <option value="enterprise">Entreprise (Sur devis)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <Plus size={16} />
                Enregistrer l'établissement
              </button>
            </form>
          </div>
        </div>
      )}

      <UniversityManagementModal
        isOpen={selectedUnivId !== null}
        onClose={() => setSelectedUnivId(null)}
        universityId={selectedUnivId}
      />
    </div>
  );
}

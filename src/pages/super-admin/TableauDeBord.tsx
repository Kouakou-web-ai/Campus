import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, TrendingUp, AlertCircle, Megaphone } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import ThreeDCard from '../../components/ui/ThreeDCard';
import UniversityManagementModal from '../../components/ui/UniversityManagementModal';
import { ref, update, remove } from 'firebase/database';
import { db } from '../../../firebase-config';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

// STATS will be defined dynamically inside the component

// STATS will be defined dynamically inside the component

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; name: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold">{p.value.toLocaleString('fr-FR')} FCFA</span>
        </div>
      ))}
    </div>
  );
};

export default function SuperAdminDashboard() {
  const { universities, revenueData, systemAnnouncement, loading } = useRealtimeDataStore();
  const [selectedUnivId, setSelectedUnivId] = useState<string | null>(null);

  // States for system announcement
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementType, setAnnouncementType] = useState<'info' | 'warning' | 'error' | 'success'>('info');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  useEffect(() => {
    if (systemAnnouncement) {
      setAnnouncementMsg(systemAnnouncement.message || '');
      setAnnouncementType(systemAnnouncement.type || 'info');
      setAnnouncementActive(systemAnnouncement.active || false);
    }
  }, [systemAnnouncement]);

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    try {
      await update(ref(db, 'annonces_globales'), {
        message: announcementMsg,
        type: announcementType,
        active: announcementActive,
        updatedAt: new Date().toISOString()
      });
      ToastSuccess("Annonce globale mise à jour avec succès !");
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer définitivement cette annonce ?")) return;
    setSavingAnnouncement(true);
    try {
      await remove(ref(db, 'annonces_globales'));
      setAnnouncementMsg('');
      setAnnouncementActive(false);
      ToastSuccess("Annonce globale supprimée avec succès !");
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de la suppression.");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const totalMRR = universities.reduce((sum, u) => sum + u.mrr, 0);
  const totalARR = totalMRR * 12;
  const totalStudents = universities.reduce((sum, u) => sum + u.studentsCount, 0);
  const activeUnivs = universities.filter(u => u.status === 'actif').length;

  const STATS = [
    { title: 'Universités actives', value: activeUnivs, change: 0, trend: 'neutral' as const, icon: <Building2 size={20} className="text-violet-600" />, gradient: 'bg-violet-100' },
    { title: 'Revenus totaux', value: `${totalMRR.toLocaleString('fr-FR')} FCFA`, change: 0, trend: 'neutral' as const, icon: <TrendingUp size={20} className="text-emerald-600" />, gradient: 'bg-emerald-100' },
    { title: 'Projections annuelles', value: `${totalARR.toLocaleString('fr-FR')} FCFA`, change: 0, trend: 'neutral' as const, icon: <TrendingUp size={20} className="text-indigo-600" />, gradient: 'bg-indigo-100' },
  ];

  // Sort universities by createdAt descending to show recent activity
  const sortedUnivsForActivity = [...universities]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  const dynamicActivities = sortedUnivsForActivity.map(u => ({
    icon: '🏫',
    text: `${u.name} s'est inscrite au plan ${u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}`,
    time: u.createdAt ? `Le ${new Date(u.createdAt).toLocaleDateString('fr-FR')}` : 'Récemment'
  }));

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6 relative z-10">
      {/* Grille 3D arrière-plan subtile pour look SaaS premium */}
      <div className="absolute inset-0 three-d-grid opacity-[0.04] pointer-events-none -z-10" />
      <PageHeader
        title="Vue globale"
        description="Supervision de toutes les universités CAMPUS en temps réel"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Tableau de bord' }]}
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {STATS.map((s, i) => (
          <ThreeDCard key={i} maxTilt={8} className={`delay-${i * 75}`}>
            <StatCard {...s} />
          </ThreeDCard>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart revenus */}
        <ChartCard
          title="Évolution des revenus"
          subtitle="Revenus réels vs objectif — 12 mois"
          className="lg:col-span-2"
          actions={
            <select className="text-xs text-slate-500 border-0 bg-transparent focus:outline-none">
              <option>2026</option>
              <option>2025</option>
            </select>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="objectifGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000000}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
              <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenusGrad)" />
              <Area type="monotone" dataKey="objectif" name="Objectif" stroke="#10b981" strokeWidth={2} strokeDasharray="5 3" fill="url(#objectifGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Activity feed */}
        <ChartCard title="Activité récente" subtitle="Derniers événements">
          <div className="space-y-3">
            {dynamicActivities.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">Aucune activité récente</p>
            ) : (
              dynamicActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">{a.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>

      {/* Grid: Bar chart + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart by plan */}
        <ChartCard
          title="Revenus par plan d'abonnement"
          subtitle="Répartition mensuelle — 6 derniers mois"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData.slice(-6)} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000000}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenus" name="Total revenus" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Global System Announcement Card */}
        <ChartCard
          title="Annonce globale système"
          subtitle="Diffuser un message à tous les utilisateurs"
          className="lg:col-span-1"
        >
          <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message d'annonce</label>
              <textarea
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
                placeholder="Ex: Maintenance système ce soir de 22h à minuit..."
                required
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type / Niveau</label>
                <select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value as any)}
                  className="select select-bordered select-xs w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs h-8 rounded-lg"
                >
                  <option value="info">💡 Information</option>
                  <option value="warning">⚠️ Avertissement</option>
                  <option value="error">🚨 Critique</option>
                  <option value="success">🎉 Succès</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="label cursor-pointer p-0 h-8 flex justify-between bg-slate-50 dark:bg-slate-950 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actif</span>
                  <input
                    type="checkbox"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="toggle toggle-xs toggle-primary"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={savingAnnouncement}
                className="flex-1 btn btn-xs btn-primary rounded-lg font-bold flex items-center justify-center gap-1 h-8"
              >
                {savingAnnouncement ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <Megaphone size={12} />
                    Mettre à jour
                  </>
                )}
              </button>
              
              {systemAnnouncement && (
                <button
                  type="button"
                  onClick={handleDeleteAnnouncement}
                  disabled={savingAnnouncement}
                  className="btn btn-xs btn-error btn-outline rounded-lg font-bold flex items-center justify-center h-8 px-3"
                  title="Supprimer définitivement l'annonce"
                >
                  Supprimer
                </button>
              )}
            </div>
          </form>
        </ChartCard>
      </div>

      {/* Universities table */}
      <div className="card-premium overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Universités sous gestion</h3>
            <p className="text-xs text-slate-400 mt-0.5">Toutes les universités avec leur statut actuel</p>
          </div>
          <Link to="/app/super-admin/universites" className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Université</th>
                <th>Ville</th>
                <th>Plan</th>
                <th>Administrateur</th>
                <th>Statut</th>
                <th className="text-right">Étudiants</th>
                <th className="text-right">Abonnement</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(u => (
                <tr
                  key={u.id}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  onClick={() => setSelectedUnivId(u.id)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800 text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-sm text-slate-500">{u.city}</td>
                  <td>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      u.plan === 'enterprise' ? 'bg-amber-100 text-amber-700'
                      : u.plan === 'pro' ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.plan === 'enterprise' ? 'Entreprise' : u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                    </span>
                  </td>
                  <td className="text-sm font-medium text-slate-600">
                    {u.adminName || <span className="text-slate-300">Non assigné</span>}
                  </td>
                  <td><StatusBadge status={u.status} /></td>
                  <td className="text-right text-sm font-medium text-slate-700">
                    {u.studentsCount.toLocaleString('fr-FR')}
                  </td>
                  <td className="text-right text-sm font-semibold text-emerald-600">
                    {u.mrr.toLocaleString('fr-FR')} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UniversityManagementModal
        isOpen={selectedUnivId !== null}
        onClose={() => setSelectedUnivId(null)}
        universityId={selectedUnivId}
      />
    </div>
  );
}

import { Users, Building2, TrendingUp, AlertCircle } from 'lucide-react';
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
  const { universities, revenueData, loading } = useRealtimeDataStore();

  const totalMRR = universities.reduce((sum, u) => sum + u.mrr, 0);
  const totalStudents = universities.reduce((sum, u) => sum + u.studentsCount, 0);
  const activeUnivs = universities.filter(u => u.status === 'actif').length;

  const STATS = [
    { title: 'Universités actives', value: activeUnivs, change: 0, trend: 'neutral' as const, icon: <Building2 size={20} className="text-violet-600" />, gradient: 'bg-violet-100' },
    { title: 'Revenus totaux', value: `${totalMRR.toLocaleString('fr-FR')} FCFA`, change: 0, trend: 'neutral' as const, icon: <TrendingUp size={20} className="text-emerald-600" />, gradient: 'bg-emerald-100' },
    { title: 'Étudiants gérés', value: totalStudents, change: 0, trend: 'neutral' as const, icon: <Users size={20} className="text-blue-600" />, gradient: 'bg-blue-100' },
    { title: 'Tickets ouverts', value: 0, change: 0, trend: 'neutral' as const, icon: <AlertCircle size={20} className="text-slate-400" />, gradient: 'bg-slate-100' },
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
        actions={
          <button className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5">
            <TrendingUp size={14} />
            Rapport mensuel
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
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

      {/* Bar chart by plan */}
      <ChartCard
        title="Revenus par plan d'abonnement"
        subtitle="Répartition mensuelle — 6 derniers mois"
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

      {/* Universities table */}
      <div className="card-premium overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Universités sous gestion</h3>
            <p className="text-xs text-slate-400 mt-0.5">Toutes les universités avec leur statut actuel</p>
          </div>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            Voir tout →
          </button>
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
                <th className="text-right">MRR</th>
              </tr>
            </thead>
            <tbody>
              {universities.map(u => (
                <tr key={u.id} className="cursor-pointer">
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
    </div>
  );
}

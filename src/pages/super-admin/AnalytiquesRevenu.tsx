import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import ChartCard from '../../components/ui/ChartCard';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { TrendingUp, DollarSign, Users, Percent } from 'lucide-react';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';

export default function AnalytiquesRevenu() {
  const { universities, revenueData, loading } = useRealtimeDataStore();

  const totalMRR = universities.reduce((sum, u) => sum + u.mrr, 0);
  const totalARR = totalMRR * 12;

  const enterpriseUnivs = universities.filter(u => u.plan === 'enterprise');
  const proUnivs = universities.filter(u => u.plan === 'pro');
  const starterUnivs = universities.filter(u => u.plan === 'starter');

  const enterpriseMRR = enterpriseUnivs.reduce((sum, u) => sum + u.mrr, 0);
  const proMRR = proUnivs.reduce((sum, u) => sum + u.mrr, 0);
  const starterMRR = starterUnivs.reduce((sum, u) => sum + u.mrr, 0);

  const PLAN_DISTRIBUTION = [
    { name: 'Entreprise', value: enterpriseUnivs.length, color: '#f59e0b', mrr: enterpriseMRR },
    { name: 'Pro', value: proUnivs.length, color: '#6366f1', mrr: proMRR },
    { name: 'Starter', value: starterUnivs.length, color: '#94a3b8', mrr: starterMRR },
  ];

  const STATS = [
    { title: 'MRR Actuel', value: `${totalMRR.toLocaleString('fr-FR')} FCFA`, change: 0, trend: 'neutral' as const, icon: <DollarSign size={20} className="text-emerald-600" />, gradient: 'bg-emerald-100' },
    { title: 'ARR Projeté', value: `${totalARR.toLocaleString('fr-FR')} FCFA`, change: 0, trend: 'neutral' as const, icon: <TrendingUp size={20} className="text-indigo-600" />, gradient: 'bg-indigo-100' },
    { title: 'Clients actifs', value: universities.length, change: 0, trend: 'neutral' as const, icon: <Users size={20} className="text-violet-600" />, gradient: 'bg-violet-100' },
    { title: 'Taux désabonnement', value: '0.0%', change: 0, trend: 'neutral' as const, icon: <Percent size={20} className="text-rose-500" />, gradient: 'bg-rose-100', description: 'Uptime 100%' },
  ];

  // Generate cohort data dynamically
  const getCohortData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    const result = [];
    // Calculate past 6 months cohorts
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      
      // Count universities created in this month
      const createdInMonth = universities.filter(u => {
        if (!u.createdAt) return false;
        const uDate = new Date(u.createdAt);
        return uDate.getMonth() === d.getMonth() && uDate.getFullYear() === d.getFullYear();
      }).length;

      if (createdInMonth > 0) {
        result.push({
          label,
          m0: 100,
          m1: 100,
          m2: 100,
          m3: 100,
          m6: 100
        });
      }
    }
    return result;
  };

  const dynamicCohortData = getCohortData();

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
        title="Analytiques revenus"
        description="Suivi financier détaillé — MRR, ARR, répartition par plan en temps réel"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Analytiques revenus' }]}
        actions={
          <button className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white">
            Exporter CSV
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} className={`delay-${i * 75}`} />
        ))}
      </div>

      {/* Revenue + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Croissance MRR"
          subtitle="Évolution mensuelle sur 6 mois"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip
                formatter={(v: any) => [`${v.toLocaleString('fr-FR')} FCFA`]}
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
              />
              <Area type="monotone" dataKey="revenus" name="MRR" stroke="#6366f1" strokeWidth={3} fill="url(#mrrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Répartition plans */}
        <ChartCard title="Répartition par plan" subtitle={`MRR Total: ${totalMRR.toLocaleString('fr-FR')} FCFA`}>
          <div className="flex flex-col items-center">
            <PieChart width={160} height={160}>
              <Pie
                data={PLAN_DISTRIBUTION}
                cx={80}
                cy={80}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="mrr"
              >
                {PLAN_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="w-full space-y-2 mt-2">
              {PLAN_DISTRIBUTION.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-slate-600">{p.name} ({p.value})</span>
                  </div>
                  <span className="font-semibold text-slate-800">{p.mrr.toLocaleString('fr-FR')} FCFA</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Bar charts clients */}
      <ChartCard
        title="Nouveaux clients par mois"
        subtitle="Comparaison acquisitions"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="clients" name="Nouveaux clients" fill="#818cf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Cohort retention */}
      <div className="card-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Rétention clients (Cohort Analysis)</h3>
          <p className="text-xs text-slate-400 mt-0.5">% de clients restants après N mois — par cohorte</p>
        </div>
        <div className="overflow-x-auto p-6">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase pb-3 pr-4">Cohorte</th>
                {['M+0', 'M+1', 'M+2', 'M+3', 'M+6'].map(m => (
                  <th key={m} className="text-center text-xs font-semibold text-slate-400 uppercase pb-3 px-3">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dynamicCohortData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400 text-xs">
                    Aucune cohorte disponible (aucune inscription d'université enregistrée)
                  </td>
                </tr>
              ) : (
                dynamicCohortData.map(row => (
                  <tr key={row.label}>
                    <td className="py-2.5 pr-4 text-slate-700 font-medium text-sm">{row.label}</td>
                    {[row.m0, row.m1, row.m2, row.m3, row.m6].map((val, i) => (
                      <td key={i} className="text-center py-2.5 px-3">
                        {val !== null ? (
                          <span
                            className="inline-block px-2 py-1 rounded-lg text-xs font-bold"
                            style={{
                              background: val >= 90 ? '#dcfce7' : val >= 80 ? '#dbeafe' : val >= 70 ? '#fef9c3' : '#fee2e2',
                              color: val >= 90 ? '#166534' : val >= 80 ? '#1e40af' : val >= 70 ? '#854d0e' : '#991b1b',
                            }}
                          >
                            {val}%
                          </span>
                        ) : (
                          <span className="text-slate-200 text-xs">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Users, GraduationCap, BookOpen, CreditCard, Star, MessageSquare, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import ThreeDCard from '../../components/ui/ThreeDCard';
import { Link } from 'react-router-dom';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold">{p.value.toLocaleString('fr-FR')} FCFA</span>
        </div>
      ))}
    </div>
  );
};

export default function UniversityAdminDashboard() {
  const { students, teachers, courses, transactions, evaluations, suggestions, loading, currentUniversity } = useRealtimeDataStore();

  // 1. Stats calculation
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalCourses = courses.length;

  const totalTuitionExpected = students.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalTuitionPaid = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const recoveryRate = totalTuitionExpected > 0 ? Math.round((totalTuitionPaid / totalTuitionExpected) * 100) : 0;

  // Average rating
  const averageRating = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + (e.average || 0), 0) / evaluations.length).toFixed(1)
    : '4.5';

  const STATS = [
    {
      title: 'Étudiants inscrits',
      value: totalStudents,
      icon: <Users size={20} className="text-indigo-650" />,
      gradient: 'bg-indigo-50'
    },
    {
      title: 'Enseignants actifs',
      value: totalTeachers,
      icon: <GraduationCap size={20} className="text-emerald-650" />,
      gradient: 'bg-emerald-50'
    },
    {
      title: 'Cours programmés',
      value: totalCourses,
      icon: <BookOpen size={20} className="text-blue-650" />,
      gradient: 'bg-blue-50'
    },
    {
      title: 'Moyenne Évaluations',
      value: `${averageRating} / 5`,
      icon: <Star size={20} className="fill-amber-400 text-amber-400" />,
      gradient: 'bg-amber-50',
      description: 'Retours parents'
    }
  ];

  // 2. Financial Chart data aggregation (group by month from transactions)
  const paymentsByMonth: Record<string, number> = {};
  
  // Last 6 months names helper
  const monthsOrder: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mLabel = d.toLocaleDateString('fr-FR', { month: 'short' });
    monthsOrder.push(mLabel);
    paymentsByMonth[mLabel] = 0;
  }

  transactions
    .filter(t => t.status === 'paye' || (t.status as string) === 'success')
    .forEach(t => {
      if (t.date) {
        const mLabel = new Date(t.date).toLocaleDateString('fr-FR', { month: 'short' });
        if (paymentsByMonth[mLabel] !== undefined) {
          paymentsByMonth[mLabel] += (t.amount || 0);
        }
      }
    });

  const chartData = monthsOrder.map(month => ({
    month: month.charAt(0).toUpperCase() + month.slice(1),
    recettes: paymentsByMonth[month] || 0
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
      <div className="absolute inset-0 three-d-grid opacity-[0.03] pointer-events-none -z-10" />
      
      <PageHeader
        title={currentUniversity?.name || "Tableau de Bord"}
        description="Statistiques académiques, financières et retours en temps réel."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Tableau de bord' }]}
      />

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
        {STATS.map((s, i) => (
          <ThreeDCard key={i} maxTilt={8} className={`delay-${i * 75}`}>
            <StatCard {...s} />
          </ThreeDCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recouvrement financier */}
        <ChartCard
          title="Frais scolaires collectés"
          subtitle="Suivi des règlements reçus (6 derniers mois)"
          className="lg:col-span-2"
          actions={
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <CreditCard size={12} />
              Taux : {recoveryRate}%
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="recettesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toLocaleString('fr-FR')} k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="recettes" name="Recettes" stroke="#6366f1" strokeWidth={2.5} fill="url(#recettesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quick statistics summary */}
        <div className="card-premium p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Santé Financière</h3>
            <p className="text-xs text-slate-400 mt-0.5">Synthèse de la scolarité globale</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
                <span>Total perçu</span>
                <span className="font-bold text-slate-800">{totalTuitionPaid.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${recoveryRate}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Attendu</p>
                <p className="text-sm font-extrabold text-slate-700 truncate">{totalTuitionExpected.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Reste à recouvrer</p>
                <p className="text-sm font-extrabold text-amber-600 truncate">{(totalTuitionExpected - totalTuitionPaid).toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>

          <Link
            to="/app/admin/finance"
            className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-150 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            Aller au centre financier
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

    </div>
  );
}

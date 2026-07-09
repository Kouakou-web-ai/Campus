import { useState } from 'react';
import { Users, GraduationCap, BookOpen, CreditCard, Star, MessageSquare, TrendingUp, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import ThreeDCard from '../../components/ui/ThreeDCard';
import { Link } from 'react-router-dom';
import { hasFeatureAccess } from '../../lib/subscription';

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
  const { students, teachers, courses, transactions, evaluations, suggestions, loading, currentUniversity, grades } = useRealtimeDataStore();

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

  // Global success stats calculation
  const gradedItems = grades.filter(g => typeof g.note === 'number');
  const averageGrade = gradedItems.length > 0
    ? parseFloat((gradedItems.reduce((sum, g) => sum + (g.note || 0), 0) / gradedItems.length).toFixed(2))
    : 0;
  const passingGrades = gradedItems.filter(g => (g.note ?? 0) >= 10);
  const passingRate = gradedItems.length > 0
    ? parseFloat(((passingGrades.length / gradedItems.length) * 100).toFixed(1))
    : 0;
  const failingRate = gradedItems.length > 0
    ? parseFloat((100 - passingRate).toFixed(1))
    : 0;

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

  const hasFinance = hasFeatureAccess(currentUniversity, 'hasFinance');
  const hasStats = true;

  const visibleStats = STATS.filter((_, idx) => {
    if (idx === 3) return hasStats;
    return true;
  });

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
        {visibleStats.map((s, i) => (
          <ThreeDCard key={i} maxTilt={8} className={`delay-${i * 75}`}>
            <StatCard {...s} />
          </ThreeDCard>
        ))}
      </div>

      {hasFinance ? (
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
      ) : (
        <div className="card-premium p-8 text-center max-w-2xl mx-auto space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-405 flex items-center justify-center mx-auto">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Gestion Financière & Règlements</h3>
            <p className="text-xs text-slate-550 dark:text-slate-450 mt-2 leading-relaxed">
              Le suivi de la scolarité et les paiements mobiles ne sont pas inclus dans le plan Gratuit. 
              Passez à la formule Starter ou Pro pour débloquer ces fonctionnalités et automatiser vos rentrées financières.
            </p>
          </div>
          <Link to="/tarifs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-indigo-650 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all shadow-md">
            Découvrir les offres
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Statistiques de Réussite de l'Établissement (Always visual, blurred overlay for Free/Starter) */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="relative border border-slate-200 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Statistiques de Réussite Globales</h3>
              <p className="text-xs text-slate-400 mt-0.5">Taux de réussite et moyenne générale par classe</p>
            </div>
            <span className="badge badge-primary badge-sm font-semibold uppercase tracking-wider">Abonnement Pro</span>
          </div>

          {/* Success stats calculated in real-time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Moyenne Générale</span>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {averageGrade > 0 ? `${averageGrade.toFixed(2)} / 20` : 'N/A'}
              </span>
              <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Calculé en temps réel</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Taux de Passage</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {gradedItems.length > 0 ? `${passingRate} %` : 'N/A'}
              </span>
              <div className="text-[10px] text-slate-400 font-semibold mt-1">Objectif cible : 90 %</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl">
              <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Taux de Redoublement</span>
              <span className="text-3xl font-black text-rose-500">
                {gradedItems.length > 0 ? `${failingRate} %` : 'N/A'}
              </span>
              <div className="text-[10px] text-slate-400 font-semibold mt-1">Moyenne inférieure à 10/20</div>
            </div>
          </div>

          {/* Locked overlay for Free/Starter */}
          {!hasStats && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-3">
                <Lock size={20} />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">Analyses de Réussite Verrouillées</h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 max-w-sm leading-relaxed mb-4">
                Découvrez le taux de réussite global et suivez les performances académiques détaillées de votre établissement en souscrivant au plan Pro.
              </p>
              <Link to="/tarifs" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-md">
                Mettre à niveau
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

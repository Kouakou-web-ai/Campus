import { useState } from 'react';
import Bulletins from './Bulletins';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import ChartCard from '../../components/ui/ChartCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Plus, X } from 'lucide-react';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

export default function CentreFinancier() {
  const [activeTab, setActiveTab] = useState<'finance' | 'bulletins'>('finance');
  const { user } = useAuthStore();
  const { transactions, students, addTransaction, updateStudent, currentUniversity, loading } = useRealtimeDataStore();
  const [modalOpen, setModalOpen] = useState(false);

  const getBudgetDistribution = () => {
    const categories: Record<string, { count: number; color: string }> = {
      'Scolarité': { count: 0, color: '#6366f1' },
      'Inscription': { count: 0, color: '#10b981' },
      'Bibliothèque': { count: 0, color: '#f59e0b' },
      'Autre': { count: 0, color: '#94a3b8' }
    };

    let total = 0;
    transactions.forEach(t => {
      if (t.status !== 'paye') return;
      let matched = false;
      Object.keys(categories).forEach(cat => {
        if (t.type.toLowerCase().includes(cat.toLowerCase())) {
          categories[cat].count += t.amount;
          total += t.amount;
          matched = true;
        }
      });
      if (!matched) {
        categories['Autre'].count += t.amount;
        total += t.amount;
      }
    });

    if (total === 0) {
      return Object.entries(categories).map(([name, val]) => ({
        name,
        value: 0,
        color: val.color,
        amount: 0
      }));
    }

    return Object.entries(categories).map(([name, val]) => ({
      name,
      value: Math.round((val.count / total) * 100),
      color: val.color,
      amount: val.count
    }));
  };

  const BUDGET_DISTRIBUTION = getBudgetDistribution();

  // Form states for new payment
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [paymentType, setPaymentType] = useState('Frais de scolarité S1');
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money');
  const [amount, setAmount] = useState(150000);

  const budgetTotal = students.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const recettesPerceptes = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const impayes = Math.max(0, budgetTotal - recettesPerceptes);
  const tauxRecouvrement = budgetTotal > 0 ? Math.round((recettesPerceptes / budgetTotal) * 100) : 0;

  const STATS = [
    { title: 'Budget total attendu', value: `${budgetTotal.toLocaleString('fr-FR')} FCFA`, icon: <DollarSign size={20} className="text-indigo-600" />, gradient: 'bg-indigo-100' },
    { title: 'Recettes perçues', value: `${recettesPerceptes.toLocaleString('fr-FR')} FCFA`, icon: <TrendingUp size={20} className="text-emerald-600" />, gradient: 'bg-emerald-100' },
    { title: 'Impayés', value: `${impayes.toLocaleString('fr-FR')} FCFA`, icon: <AlertCircle size={20} className="text-red-500" />, gradient: 'bg-red-100' },
    { title: 'Taux recouvrement', value: `${tauxRecouvrement}%`, icon: <CheckCircle size={20} className="text-amber-600" />, gradient: 'bg-amber-100' },
  ];

  // Group transaction revenues by month starting from the creation month of the university
  const getMonthlyData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    
    // Start from currentUniversity.createdAt, or fallback to 5 months ago
    const startStr = currentUniversity?.createdAt || new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
    const start = new Date(startStr);
    
    const result = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    
    while (current <= now) {
      const mLabel = months[current.getMonth()];
      const mNum = current.getMonth();
      const year = current.getFullYear();

      // Find transactions in this month
      const monthlyTrans = transactions.filter(t => {
        if (!t.date) return false;
        const tDate = new Date(t.date);
        return tDate.getMonth() === mNum && tDate.getFullYear() === year && t.status === 'paye';
      });

      const totalRecettes = monthlyTrans.reduce((sum, t) => sum + (t.amount || 0), 0);
      result.push({
        month: `${mLabel} ${year.toString().slice(-2)}`,
        recettes: totalRecettes,
        depenses: Math.round(totalRecettes * 0.75),
      });

      current.setMonth(current.getMonth() + 1);
    }
    return result;
  };

  const MONTHLY_DATA = getMonthlyData();

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!selectedStudentId) {
      ToastError("Veuillez choisir un étudiant.");
      return;
    }
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    try {
      // Add payment transaction
      await addTransaction(user.universityId, {
        studentName: student.name,
        type: paymentType,
        method: paymentMethod,
        date: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        status: 'paye'
      });

      // Update student paid amount
      const currentPaid = student.paidAmount || 0;
      await updateStudent(user.universityId, student.id, {
        paidAmount: currentPaid + Number(amount)
      });

      ToastSuccess("Paiement enregistré avec succès !");
      setModalOpen(false);
      setSelectedStudentId('');
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de l'enregistrement.");
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
        title="Centre financier"
        description="Pilotage budgétaire et suivi des paiements de l'université en temps réel"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Finances' }]}
        actions={
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              Rapport PDF
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5">
              <Plus size={14} />
              Enregistrer paiement
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="tabs tabs-boxed bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-fit">
        <button
          className={`tab tab-sm rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'finance' ? 'tab-active bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'
          }`}
          onClick={() => setActiveTab('finance')}
        >
          💰 Tableau de bord financier
        </button>
        <button
          className={`tab tab-sm rounded-xl font-semibold text-xs transition-all ${
            activeTab === 'bulletins' ? 'tab-active bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-500'
          }`}
          onClick={() => setActiveTab('bulletins')}
        >
          📋 Bulletins & Signatures
        </button>
      </div>

      {activeTab === 'bulletins' ? (
        <Bulletins hideHeader={true} />
      ) : (
        <>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} className={`delay-${i * 75}`} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Recettes vs Dépenses" subtitle="6 derniers mois" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={MONTHLY_DATA} barGap={4} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toLocaleString('fr-FR')} kF`} />
              <Tooltip
                formatter={(v: any) => [`${v.toLocaleString('fr-FR')} FCFA`]}
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
              />
              <Bar dataKey="recettes" name="Recettes" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="depenses" name="Dépenses" fill="#94a3b8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Répartition budget */}
        <ChartCard title="Répartition budget" subtitle="Par catégorie">
          <div className="flex flex-col items-center">
            <PieChart width={160} height={160}>
              <Pie data={BUDGET_DISTRIBUTION} cx={80} cy={80} innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {BUDGET_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="w-full space-y-1.5 mt-2">
              {BUDGET_DISTRIBUTION.map(b => (
                <div key={b.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                    <span className="text-slate-600">{b.name}</span>
                  </div>
                  <span className="font-semibold text-slate-700">{b.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Indicateur impayés discret */}
      {impayes > 0 && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl px-5 py-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-red-700 dark:text-red-400">{impayes.toLocaleString('fr-FR')} FCFA de créances impayées</span>
        </div>
      )}

      {/* Transactions récentes */}
      <div className="card-premium overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Transactions récentes</h3>
          <button className="text-sm text-indigo-600 font-medium">Tout voir →</button>
        </div>
        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">Aucune transaction enregistrée</div>
          ) : (
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>Type</th>
                  <th>Méthode</th>
                  <th>Date</th>
                  <th className="text-right">Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className="font-medium text-slate-800 text-sm">{t.studentName}</td>
                    <td className="text-sm text-slate-500">{t.type}</td>
                    <td className="text-sm text-slate-500">{t.method}</td>
                    <td className="text-sm text-slate-500">{t.date ? new Date(t.date).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="text-right font-bold text-sm text-slate-800">{t.amount.toLocaleString('fr-FR')} FCFA</td>
                    <td><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
        </>
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
            <h3 className="text-xl font-bold text-slate-800 mb-6">Enregistrer un paiement</h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Choisir l'étudiant</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Sélectionner un étudiant…</option>
                  {students.map(s => {
                    const remaining = (s.totalAmount || 0) - (s.paidAmount || 0);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentId}) — Reste: {remaining.toLocaleString('fr-FR')} F
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type de paiement</label>
                <select
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Frais de scolarité S1">Frais de scolarité S1</option>
                  <option value="Frais de scolarité S2">Frais de scolarité S2</option>
                  <option value="Frais de scolarité annuel">Frais de scolarité annuel</option>
                  <option value="Frais de bibliothèque">Frais de bibliothèque</option>
                  <option value="Acompte inscription">Acompte inscription</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Montant (FCFA)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Mode de règlement</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Mobile Money">Mobile Money (Orange/MTN/Wave)</option>
                    <option value="Virement">Virement bancaire</option>
                    <option value="Chèque">Chèque bancaire</option>
                    <option value="Espèces">Espèces</option>
                    <option value="Carte">Carte bancaire</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <Plus size={16} />
                Valider l'encaissement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

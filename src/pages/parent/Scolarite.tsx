import { useState, useEffect } from 'react';
import { CreditCard, Download, AlertCircle, Link2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { exportReceiptPDF } from '../../services/pdfService';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { ref, onValue, off, set } from 'firebase/database';
import { db } from '../../../firebase-config';

export default function Scolarite() {
  const { user } = useAuthStore();
  const { students, transactions, addTransaction, updateStudent, loading } = useRealtimeDataStore();

  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [operator, setOperator] = useState<'wave' | 'orange' | 'mtn'>('wave');
  const [phone, setPhone] = useState(user?.telephone || '');
  const [processing, setProcessing] = useState(false);

  // Subscribe to parent's linked children in Firebase
  useEffect(() => {
    if (!user) return;
    const enfantsRef = ref(db, `utilisateurs/${user.id}/enfants`);
    const unsub = onValue(enfantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLinkedIds(Object.keys(data));
      } else {
        setLinkedIds([]);
      }
    });
    return () => off(enfantsRef, 'value', unsub);
  }, [user]);

  const myChildren = students.filter(s => linkedIds.includes(s.id));

  useEffect(() => {
    if (myChildren.length > 0 && !selectedStudentId) {
      setSelectedStudentId(myChildren[0].id);
    }
  }, [myChildren, selectedStudentId]);

  const student = myChildren.find(s => s.id === selectedStudentId);

  const totalAmount = student ? student.totalAmount || 0 : 0;
  const paidAmount = student ? student.paidAmount || 0 : 0;
  const remainingAmount = totalAmount - paidAmount;
  const paidPercent = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

  // Filter student transactions
  const studentTrans = transactions.filter(t => t.studentName === student?.name);

  // Generate dynamic milestones
  const PAYMENT_SCHEDULE = [
    { label: 'Acompte inscription (20%)', amount: Math.round(totalAmount * 0.2), dueDate: '2025-09-01', status: paidAmount >= totalAmount * 0.2 ? 'paye' as const : 'en_attente' as const },
    { label: 'Semestre 1 — Solde (40%)', amount: Math.round(totalAmount * 0.4), dueDate: '2025-12-01', status: paidAmount >= totalAmount * 0.6 ? 'paye' as const : 'en_attente' as const },
    { label: 'Semestre 2 — Solde (40%)', amount: Math.round(totalAmount * 0.4), dueDate: '2026-04-01', status: paidAmount >= totalAmount ? 'paye' as const : 'en_attente' as const },
  ];

  const nextPayment = PAYMENT_SCHEDULE.find(p => p.status === 'en_attente');
  const daysUntilNext = nextPayment
    ? Math.ceil((new Date(nextPayment.dueDate).getTime() - Date.now()) / 86400000)
    : null;

  const handleSimulatePayment = async () => {
    if (!user || !student || !nextPayment) return;
    setProcessing(true);
    try {
      const amountToPay = nextPayment.amount;

      // 1. Add real transaction record under university node
      await addTransaction(student.universityId, {
        studentName: student.name,
        type: nextPayment.label,
        method: `${operator.toUpperCase()} Money`,
        date: new Date().toISOString().split('T')[0],
        amount: amountToPay,
        status: 'paye'
      });

      // 2. Increment paidAmount on student profile
      await updateStudent(student.universityId, student.id, {
        paidAmount: (student.paidAmount || 0) + amountToPay
      });

      ToastSuccess("Paiement effectué avec succès par Mobile Money !");
      setPayModalOpen(false);
    } catch (e: any) {
      ToastError("Échec du paiement.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  if (myChildren.length === 0) {
    return (
      <div className="page-transition space-y-6">
        <PageHeader
          title="Scolarité & Finances"
          description="Gérez les paiements de vos enfants"
          breadcrumbs={[{ label: 'Parent' }, { label: 'Scolarité' }]}
        />
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-md max-w-lg mx-auto">
          <Link2 className="mx-auto text-indigo-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800">Aucun enfant lié</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-6">
            Vous devez d'abord lier un enfant depuis la page "Suivi enfant" pour voir sa scolarité.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Scolarité & Finances"
        description="Suivi financier et paiements de la scolarité"
        breadcrumbs={[{ label: 'Parent' }, { label: 'Scolarité' }]}
      />

      {/* Child selection dropdown - ONLY visible if parent has multiple children */}
      {myChildren.length > 1 && (
        <div className="card-premium p-4 flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-600 flex-shrink-0">Sélectionner un enfant :</label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(e.target.value)}
            className="input-premium flex-1 max-w-xs px-3 py-2 text-sm"
          >
            {myChildren.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
            ))}
          </select>
        </div>
      )}

      {/* Solde card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(at 80% 20%, rgba(99,102,241,0.5) 0, transparent 50%)' }}
        />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1 w-full">
            <p className="text-slate-400 text-sm mb-1">Frais de scolarité annuels - {student?.name}</p>
            <div className="text-4xl font-extrabold font-heading">{totalAmount.toLocaleString('fr-FR')} FCFA</div>
            <div className="flex items-center gap-6 mt-4 flex-wrap">
              <div>
                <div className="text-lg font-bold text-emerald-400">{paidAmount.toLocaleString('fr-FR')} FCFA</div>
                <div className="text-xs text-slate-400">Payé</div>
              </div>
              <div className="w-px h-8 bg-slate-700 hidden sm:block" />
              <div>
                <div className="text-lg font-bold text-slate-300">{remainingAmount.toLocaleString('fr-FR')} FCFA</div>
                <div className="text-xs text-slate-400">Restant</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Progression paiement</span>
                <span className="text-white font-semibold">{paidPercent}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
            </div>
          </div>

          {nextPayment && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 flex-shrink-0 text-center w-full md:w-auto min-w-48">
              <p className="text-slate-400 text-xs mb-2">Prochaine échéance</p>
              <div className="text-xl font-bold text-white mb-1">{nextPayment.amount.toLocaleString('fr-FR')} FCFA</div>
              <p className="text-xs text-slate-300">{new Date(nextPayment.dueDate).toLocaleDateString('fr-FR')}</p>
              {daysUntilNext !== null && daysUntilNext < 30 && (
                <div className={`mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${daysUntilNext < 7 ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  Dans {daysUntilNext} jours
                </div>
              )}
              <button 
                onClick={() => setPayModalOpen(true)}
                className="mt-3 w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CreditCard size={12} />
                Payer maintenant (Mobile Money)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert */}
      {nextPayment && daysUntilNext !== null && daysUntilNext < 30 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>Rappel :</strong> Votre prochain paiement de {nextPayment.amount.toLocaleString('fr-FR')} FCFA est dû le{' '}
            {new Date(nextPayment.dueDate).toLocaleDateString('fr-FR')}.
          </p>
        </div>
      )}

      {/* Échéancier */}
      <div className="card-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Échéancier de paiement</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {PAYMENT_SCHEDULE.map((payment, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 flex-wrap sm:flex-nowrap">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                payment.status === 'paye' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {payment.status === 'paye' ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 text-sm truncate">{payment.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Échéance : {new Date(payment.dueDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-800 text-sm">{payment.amount.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <StatusBadge status={payment.status} />
              {payment.status === 'paye' && (
                <button 
                  onClick={() => exportReceiptPDF(
                    student?.name || 'Étudiant',
                    `PAY-${payment.dueDate}`,
                    payment.amount,
                    payment.dueDate,
                    payment.label,
                    0
                  )}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0" 
                  title="Télécharger reçu"
                >
                  <Download size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="card-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Historique des versements</h3>
        </div>
        
        {studentTrans.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Aucun versement enregistré.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Méthode</th>
                  <th>Date</th>
                  <th className="text-right">Montant</th>
                  <th>Statut</th>
                  <th className="text-right">Reçu</th>
                </tr>
              </thead>
              <tbody>
                {studentTrans.map(t => (
                  <tr key={t.id}>
                    <td className="text-sm font-semibold text-slate-700">{t.type}</td>
                    <td className="text-sm text-slate-500">{t.method}</td>
                    <td className="text-sm text-slate-500">{t.date ? new Date(t.date).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="text-right font-bold text-emerald-600">{t.amount.toLocaleString('fr-FR')} FCFA</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="text-right">
                      {t.status === 'paye' && (
                        <button
                          onClick={() => exportReceiptPDF(
                            student?.name || 'Étudiant',
                            t.id,
                            t.amount,
                            t.date || new Date().toISOString(),
                            t.type,
                            remainingAmount
                          )}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Télécharger Reçu"
                        >
                          <Download size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Money Sandbox Simulator Modal */}
      {payModalOpen && nextPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative animate-fade-up">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Simulateur Mobile Money</h3>
            <p className="text-xs text-slate-500 mb-6">Simulation de paiement sécurisée sans passerelle réelle.</p>
            
            {/* Amount details */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Montant à régler</span>
              <p className="text-xl font-extrabold text-slate-800">{nextPayment.amount.toLocaleString('fr-FR')} FCFA</p>
              <p className="text-xs text-slate-500 mt-1">{nextPayment.label}</p>
            </div>

            {/* Operator select */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Opérateur</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'wave', label: 'Wave', color: 'border-cyan-400 bg-cyan-50/30 text-cyan-600' },
                    { id: 'orange', label: 'Orange', color: 'border-orange-400 bg-orange-50/30 text-orange-600' },
                    { id: 'mtn', label: 'MTN', color: 'border-yellow-400 bg-yellow-50/30 text-yellow-600' }
                  ].map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setOperator(op.id as any)}
                      className={`py-3 px-2 border-2 rounded-xl text-xs font-bold transition-all ${
                        operator === op.id ? op.color : 'border-slate-100 hover:bg-slate-50 text-slate-500'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Numéro de téléphone</label>
                <input
                  type="tel"
                  placeholder="07 00 00 00 00"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalOpen(false)}
                  disabled={processing}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={processing || !phone.trim()}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {processing ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    'Confirmer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

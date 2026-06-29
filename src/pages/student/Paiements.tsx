import { useState } from 'react';
import { Download } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { exportReceiptPDF } from '../../services/pdfService';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

export default function Paiements() {
  const { user } = useAuthStore();
  const { students, transactions, addTransaction, updateStudent, loading } = useRealtimeDataStore();



  const student = students.find(s => s.id === user?.id);
  const totalAmount = student ? student.totalAmount || 0 : 0;
  const paidAmount = student ? student.paidAmount || 0 : 0;
  const remainingAmount = totalAmount - paidAmount;
  const paidPercent = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;

  // Filter student transactions
  const studentTrans = transactions.filter(t => t.studentName === user?.name);



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
        title="Paiements & Scolarité"
        description="Suivi de vos paiements et échéances de scolarité en temps réel"
        breadcrumbs={[{ label: 'Étudiant' }, { label: 'Paiements' }]}
      />

      {/* Solde card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(at 80% 20%, rgba(99,102,241,0.5) 0, transparent 50%)' }}
        />
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-1 w-full">
            <p className="text-slate-400 text-sm mb-1">Frais de scolarité annuels</p>
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
                            user?.name || 'Étudiant',
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


    </div>
  );
}

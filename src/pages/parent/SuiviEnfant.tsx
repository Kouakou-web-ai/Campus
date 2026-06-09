import { useState, useEffect } from 'react';
import { Eye, BookOpen, CreditCard, Phone, User, Plus, X, Link2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import ProgressRing from '../../components/ui/ProgressRing';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ref, onValue, off, set } from 'firebase/database';
import { db } from '../../../firebase-config';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

export default function SuiviEnfant() {
  const { user } = useAuthStore();
  const { students, grades, transactions, assignments, currentUniversity } = useRealtimeDataStore();
  
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [matriculeInput, setMatriculeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [linking, setLinking] = useState(false);

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

  const child = myChildren.find(s => s.id === selectedStudentId);

  // Calculate child details if selected
  const childAverage = child ? child.average || 0 : 0;
  const childPaidPercent = child && child.totalAmount > 0 
    ? Math.min(100, Math.round((child.paidAmount / child.totalAmount) * 100))
    : 0;

  // Filter child grades
  const childGrades = child ? grades.filter(g => g.studentId === child.id && g.note !== undefined) : [];
  
  // Filter child transactions
  const childTransactions = child ? transactions.filter(t => t.studentName === child.name) : [];

  // Generate activities based on real database records
  const activities: { icon: string; text: string; time: string }[] = [];
  if (child) {
    childGrades.forEach(g => {
      activities.push({
        icon: '📝',
        text: `Note reçue — ${g.appreciation || 'Évaluation'} : ${g.note}/20 dans ${g.studentName}`,
        time: 'Récemment'
      });
    });
    childTransactions.forEach(t => {
      activities.push({
        icon: '💳',
        text: `Paiement enregistré — ${t.type} (${t.amount.toLocaleString('fr-FR')} FCFA)`,
        time: t.date ? new Date(t.date).toLocaleDateString('fr-FR') : 'Récemment'
      });
    });
  }

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Find student matching Matricule and Email
    const matchedStudent = students.find(
      s => s.studentId === matriculeInput.trim() && 
           s.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (!matchedStudent) {
      ToastError("Aucun élève trouvé avec ce matricule et cette adresse e-mail.");
      return;
    }

    setLinking(true);
    try {
      await set(ref(db, `utilisateurs/${user.id}/enfants/${matchedStudent.id}`), true);
      ToastSuccess(`${matchedStudent.name} a été lié à votre compte avec succès !`);
      setSelectedStudentId(matchedStudent.id);
      setMatriculeInput('');
      setEmailInput('');
      setLinkModalOpen(false);
    } catch (err) {
      ToastError("Erreur lors de la liaison de l'élève.");
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Suivi de l'enfant"
        description="Tableau de bord parental — Contrôle et suivi académique en temps réel"
        breadcrumbs={[{ label: 'Parent' }, { label: 'Suivi enfant' }]}
        actions={
          myChildren.length > 0 ? (
            <button 
              onClick={() => setLinkModalOpen(true)}
              className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5"
            >
              <Plus size={14} />
              Lier un autre enfant
            </button>
          ) : undefined
        }
      />

      {myChildren.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-md max-w-lg mx-auto">
          <Link2 className="mx-auto text-indigo-500 mb-4 animate-pulse" size={48} />
          <h3 className="text-lg font-bold text-slate-800">Lier le compte de votre enfant</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-6">
            Saisissez les informations officielles fournies par l'administration universitaire pour commencer le suivi académique.
          </p>
          
          <form onSubmit={handleLinkChild} className="px-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Matricule Étudiant</label>
              <input
                type="text"
                placeholder="ETU-YYYY-XXXX"
                value={matriculeInput}
                onChange={e => setMatriculeInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adresse Email de l'élève</label>
              <input
                type="email"
                placeholder="etudiant@ecole.fr"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={linking}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {linking ? <span className="loading loading-spinner loading-xs" /> : 'Lier mon enfant'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Child selection dropdown */}
          <div className="card-premium p-4 flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-600 flex-shrink-0">Sélectionner votre enfant :</label>
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

          {child && (
            <>
              {/* Profile card enfant */}
              <div className="card-premium p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100 animate-fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl">
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">{child.name}</h2>
                    <p className="text-slate-500 text-sm">{child.filiere} · {child.annee}ème année · {currentUniversity?.name || 'CAMPUS Établissement'}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Étudiant actif
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-indigo-600 font-semibold border border-indigo-200 bg-white px-4 py-2 rounded-xl hover:bg-indigo-50 transition-colors w-fit">
                    <Phone size={14} />
                    Contacter conseiller
                  </button>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-premium p-5 flex flex-col items-center text-center">
                  <ProgressRing value={Math.round((childAverage / 20) * 100)} size={70} color="#6366f1" />
                  <p className="text-sm font-semibold text-slate-700 mt-2">{childAverage.toFixed(1)}/20</p>
                  <p className="text-xs text-slate-400">Moyenne générale</p>
                </div>
                <div className="card-premium p-5 flex flex-col items-center text-center">
                  <ProgressRing value={100 - (child.absences || 0) * 5} size={70} color="#10b981" />
                  <p className="text-sm font-semibold text-slate-700 mt-2">{100 - (child.absences || 0) * 5}%</p>
                  <p className="text-xs text-slate-400">Assiduité</p>
                </div>
                <div className="card-premium p-5 flex flex-col items-center text-center">
                  <div className="w-[70px] h-[70px] rounded-full bg-amber-100 flex items-center justify-center">
                    <BookOpen size={28} className="text-amber-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mt-2">{assignments.filter(a => a.status === 'publie').length}</p>
                  <p className="text-xs text-slate-400">Devoirs en attente</p>
                </div>
                <div className="card-premium p-5 flex flex-col items-center text-center">
                  <ProgressRing value={childPaidPercent} size={70} color="#f59e0b" />
                  <p className="text-sm font-semibold text-slate-700 mt-2">{childPaidPercent}%</p>
                  <p className="text-xs text-slate-400">Scolarité payée</p>
                </div>
              </div>

              {/* Alertes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(child.absences || 0) > 3 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h4 className="font-semibold text-amber-800 text-sm">Attention requise</h4>
                        <p className="text-xs text-amber-600 mt-1">
                          Plusieurs absences ({child.absences}) signalées ce semestre. Veuillez contacter l'administration.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <h4 className="font-semibold text-emerald-800 text-sm">Assiduité exemplaire</h4>
                        <p className="text-xs text-emerald-600 mt-1">
                          Votre enfant suit rigoureusement l'ensemble des cours programmés.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">Statut facturation</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Scolarité versée: {child.paidAmount.toLocaleString('fr-FR')} F sur {child.totalAmount.toLocaleString('fr-FR')} F.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activité récente */}
              <div className="card-premium overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800">Activité récente de l'étudiant</h3>
                  <Eye size={15} className="text-slate-300" />
                </div>
                {activities.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">Aucune activité enregistrée.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {activities.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                        <span className="text-lg flex-shrink-0">{a.icon}</span>
                        <p className="flex-1 text-sm text-slate-700">{a.text}</p>
                        <span className="text-xs text-slate-400 flex-shrink-0">{a.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Linking Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setLinkModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Lier un autre enfant</h3>
            <p className="text-xs text-slate-500 mb-6">Saisissez le matricule et e-mail de l'élève à lier.</p>
            
            <form onSubmit={handleLinkChild} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Matricule Étudiant</label>
                <input
                  type="text"
                  placeholder="ETU-YYYY-XXXX"
                  value={matriculeInput}
                  onChange={e => setMatriculeInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adresse Email de l'élève</label>
                <input
                  type="email"
                  placeholder="etudiant@ecole.fr"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={linking}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 mt-2"
              >
                {linking ? <span className="loading loading-spinner loading-xs" /> : 'Confirmer la liaison'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

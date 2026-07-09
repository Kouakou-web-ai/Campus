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
  const { students, grades, transactions, assignments, currentUniversity, appels, courses } = useRealtimeDataStore();
  
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
  const childGrades = child ? grades.filter(g => g.studentId === child.id && g.note !== undefined && g.submitted === true) : [];
  
  // Filter child transactions
  const childTransactions = child ? transactions.filter(t => t.studentName === child.name) : [];

  // Reconstruct detailed absences history for selected child & calculate attendance rate dynamically
  const childAbsencesList: any[] = [];
  let totalCalls = 0;
  let childAbsencesCount = 0;
  if (child && appels) {
    Object.entries(appels).forEach(([courseId, dates]: [string, any]) => {
      const course = courses.find(c => c.id === courseId);
      if (dates) {
        Object.entries(dates).forEach(([dateKey, studentsList]: [string, any]) => {
          if (studentsList && studentsList[child.id]) {
            totalCalls++;
            const record = studentsList[child.id];
            if (record.status === 'absent_justifie' || record.status === 'absent_non_justifie') {
              childAbsencesCount++;
              childAbsencesList.push({
                id: `${courseId}-${dateKey}-${child.id}`,
                studentName: child.name,
                courseTitle: course ? course.title : 'Cours',
                courseCode: course ? course.code : 'CODE',
                date: dateKey,
                duration: '2 heures',
                status: record.status,
                justified: record.status === 'absent_justifie'
              });
            }
          }
        });
      }
    });
  }
  // Sort absences by date descending
  childAbsencesList.sort((a, b) => b.date.localeCompare(a.date));

  const childAttendanceRate = totalCalls > 0
    ? Math.round(((totalCalls - childAbsencesCount) / totalCalls) * 100)
    : 0;

  // Generate activities based on real database records
  const activities: { icon: string; text: string; time: string }[] = [];
  if (child) {
    childGrades.forEach(g => {
      const course = courses.find(c => c.id === g.courseId);
      activities.push({
        icon: '📝',
        text: `Note reçue : ${g.note}/20 dans ${course ? course.title : 'Matière'}`,
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

  // Get active warnings/alerts for linked children (absences > 3, average grade < 10, unpaid tuition)
  const getChildAlerts = (c: any) => {
    const alertsList: { type: 'warning' | 'danger' | 'info'; title: string; desc: string; icon: string }[] = [];
    if ((c.absences || 0) > 3) {
      alertsList.push({
        type: 'warning',
        title: `Absences élevées — ${c.name}`,
        desc: `Attention : Plusieurs absences (${c.absences}) signalées ce semestre. Veuillez contacter le secrétariat.`,
        icon: '⚠️'
      });
    }
    if ((c.average || 0) > 0 && (c.average || 0) < 10) {
      alertsList.push({
        type: 'danger',
        title: `Difficultés académiques — ${c.name}`,
        desc: `La moyenne générale est de ${c.average.toFixed(1)}/20. Un suivi pédagogique est vivement conseillé.`,
        icon: '📉'
      });
    }
    if ((c.paidAmount || 0) < (c.totalAmount || 0)) {
      const rest = (c.totalAmount || 0) - (c.paidAmount || 0);
      alertsList.push({
        type: 'info',
        title: `Scolarité incomplète — ${c.name}`,
        desc: `Des frais de scolarité restent impayés (${rest.toLocaleString('fr-FR')} FCFA restants).`,
        icon: '💳'
      });
    }
    return alertsList;
  };

  const allAlerts = myChildren.flatMap(c => getChildAlerts(c));

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
          {/* Child selection dropdown - ONLY visible if parent has multiple children */}
          {myChildren.length > 1 && (
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
          )}

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
                  <ProgressRing value={childAttendanceRate} size={70} color="#10b981" />
                  <p className="text-sm font-semibold text-slate-700 mt-2">{childAttendanceRate}%</p>
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

              {/* Aggregated Alerts Section for all children */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Alertes de scolarité</h3>
                {allAlerts.length === 0 ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-800 flex items-start gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <h4 className="font-bold text-sm">Situation en ordre</h4>
                      <p className="text-xs mt-1">Aucune alerte signalée pour vos enfants. Assiduité, notes et scolarité sont à jour.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allAlerts.map((alert, idx) => (
                      <div 
                        key={idx} 
                        className={`border rounded-2xl p-5 ${
                          alert.type === 'danger' 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : alert.type === 'warning'
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-blue-50 border-blue-200 text-blue-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{alert.icon}</span>
                          <div>
                            <h4 className="font-bold text-sm">{alert.title}</h4>
                            <p className="text-xs mt-1">{alert.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Historique détaillé des absences */}
              <div className="card-premium overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-800">Historique détaillé des absences</h3>
                  <span className="badge badge-sm badge-ghost font-semibold">{childAbsencesList.length} absence(s)</span>
                </div>
                {childAbsencesList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Aucune absence enregistrée pour {child.name}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full table-premium">
                      <thead>
                        <tr>
                          <th>Étudiant</th>
                          <th>Date</th>
                          <th>Matière</th>
                          <th className="text-center">Durée</th>
                          <th className="text-right">Justification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {childAbsencesList.map((abs) => (
                          <tr key={abs.id}>
                            <td className="font-semibold text-slate-800 text-sm">{abs.studentName}</td>
                            <td className="text-slate-655 text-sm">{new Date(abs.date).toLocaleDateString('fr-FR')}</td>
                            <td>
                              <p className="font-medium text-slate-850 text-sm">{abs.courseTitle}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{abs.courseCode}</p>
                            </td>
                            <td className="text-center text-sm text-slate-500">{abs.duration}</td>
                            <td className="text-right">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                abs.justified 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                  : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {abs.justified ? 'Justifiée' : 'Non justifiée'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

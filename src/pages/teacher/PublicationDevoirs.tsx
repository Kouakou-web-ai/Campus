import { useState } from 'react';
import { Plus, Users, Calendar, FileText, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

export default function PublicationDevoirs() {
  const { user } = useAuthStore();
  const { assignments, courses, students, addAssignment, loading } = useRealtimeDataStore();
  const [filter, setFilter] = useState('tous');
  const [modalOpen, setModalOpen] = useState(false); // keep name same or adjust: modalOpen state is used below

  const myCourses = courses.filter(c => c.teacherId === user?.id);
  const myCoursesIds = myCourses.map(c => c.id);
  const myAssignments = assignments.filter(a => myCoursesIds.includes(a.courseId));

  // Form states for new assignment
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [maxGrade, setMaxGrade] = useState(20);
  const [status, setStatus] = useState<'publie' | 'brouillon'>('publie');

  const filtered = filter === 'tous'
    ? myAssignments
    : myAssignments.filter(a => a.status === filter);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!title || !courseId || !dueDate) {
      ToastError("Veuillez remplir les champs obligatoires.");
      return;
    }
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    try {
      await addAssignment(user.universityId, {
        title,
        courseId,
        courseTitle: course.title,
        dueDate,
        status,
        submissionsCount: 0,
        studentsCount: students.length || 0,
        description,
        maxGrade: Number(maxGrade)
      });

      ToastSuccess("Devoir publié avec succès !");
      setTitle('');
      setDueDate('');
      setDescription('');
      setModalOpen(false);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de la publication.");
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
        title="Publication des devoirs"
        description="Gérez et publiez les devoirs pour vos cours en temps réel"
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Devoirs' }]}
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5">
            <Plus size={14} />
            Nouveau devoir
          </button>
        }
      />

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: myAssignments.length, color: 'text-slate-700' },
          { label: 'Publiés', value: myAssignments.filter(a => a.status === 'publie').length, color: 'text-indigo-600' },
          { label: 'Brouillons', value: myAssignments.filter(a => a.status === 'brouillon').length, color: 'text-amber-600' },
          { label: 'Terminés', value: myAssignments.filter(a => a.status === 'termine').length, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="card-premium p-4 text-center animate-fade-up">
            <div className={`text-2xl font-bold font-heading ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['tous', 'brouillon', 'publie', 'termine'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-200'
            }`}
          >
            {{ tous: 'Tous', brouillon: '📝 Brouillons', publie: '✅ Publiés', termine: '🏁 Terminés' }[f]}
          </button>
        ))}
      </div>

      {/* Liste devoirs */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun devoir"
          description="Créez votre premier devoir pour commencer."
          action={
            <button onClick={() => setModalOpen(true)} className="btn-gradient text-sm px-4 py-2 rounded-full text-white">
              Créer un devoir
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(assignment => {
            const studsCount = assignment.studentsCount || students.length || 1;
            const progress = Math.round(((assignment.submissionsCount || 0) / studsCount) * 100);
            const daysLeft = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / 86400000);

            return (
              <div key={assignment.id} className="card-premium p-5 group animate-fade-up">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm">{assignment.title}</h3>
                        <StatusBadge status={assignment.status} />
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{assignment.courseTitle}</p>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{assignment.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar size={12} />
                      {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
                      {daysLeft > 0 && daysLeft < 7 && (
                        <span className="text-red-500 font-semibold">({daysLeft}j)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users size={12} />
                      {assignment.submissionsCount || 0}/{studsCount} rendus
                    </div>
                    <span className="text-xs font-medium text-slate-600">/{assignment.maxGrade} pts</span>
                  </div>
                </div>

                {assignment.status === 'publie' && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span>Taux de remise</span>
                      <span className={`font-semibold ${progress === 100 ? 'text-emerald-600' : progress > 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
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
            <h3 className="text-xl font-bold text-slate-800 mb-6">Nouveau devoir</h3>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Titre de l'évaluation</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="ex: TP Noté — Tri rapide"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Associer à un cours</label>
                <select
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Sélectionner le cours…</option>
                  {myCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date limite de rendu</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Note maximale (Barème)</label>
                  <input
                    type="number"
                    value={maxGrade}
                    onChange={e => setMaxGrade(Number(e.target.value))}
                    min={1}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description / Consignes</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Saisissez les instructions pour les étudiants..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Statut initial</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="publie">Publié immédiatement</option>
                  <option value="brouillon">Brouillon</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <Plus size={16} />
                Publier le devoir
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

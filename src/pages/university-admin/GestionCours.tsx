import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Users, Clock, Plus, X, Trash2, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import type { Course, StatusType } from '../../types';

const COLUMNS: Array<StatusType> = ['planifie', 'en_cours', 'termine'];
const COLUMN_LABELS: Record<string, string> = {
  planifie: '📅 Planifié',
  en_cours: '🔄 En cours',
  termine: '✅ Terminé',
};
const COLUMN_COLORS: Record<string, string> = {
  planifie: 'bg-violet-50 border-violet-200',
  en_cours: 'bg-sky-50 border-sky-200',
  termine: 'bg-emerald-50 border-emerald-200',
};

function CourseCard({ course, onDelete }: { course: Course; onDelete: (id: string) => void }) {
  const max = course.studentsMax || 60;
  const enrolled = course.studentsEnrolled || 0;
  const pct = Math.min(100, Math.round((enrolled / max) * 100));

  return (
    <div className="card-premium p-4 group animate-fade-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{course.code}</span>
          <h4 className="font-semibold text-slate-900 text-sm mt-0.5 leading-tight">{course.title}</h4>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge status={course.status} />
          <button
            onClick={() => onDelete(course.id)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer le cours"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-3">{course.teacher || 'Aucun enseignant assigné'}</p>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
        <span className="flex items-center gap-1">
          <Users size={11} /> {enrolled}/{max}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} /> {course.date} à {course.startTime} ({course.duration}h)
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={11} /> {course.credits || 0} Crédits
        </span>
      </div>

      {/* Inscription bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Inscriptions</span>
          <span className={pct >= 90 ? 'text-red-500 font-semibold' : 'text-slate-500'}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-indigo-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {course.status === 'en_cours' && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progression</span>
            <span>{course.progress || 0}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full" style={{ width: `${course.progress || 0}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function GestionCours() {
  const { user } = useAuthStore();
  const {
    courses,
    teachers,
    scheduleEvents,
    addCourse,
    deleteCourse,
    addScheduleEvent,
    loading,
    filieres,
    classes,
    addFiliere,
    deleteFiliere,
    addClass,
    deleteClass
  } = useRealtimeDataStore();

  const handleDeleteCourse = async (courseId: string) => {
    if (!user?.universityId) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ? Cette action supprimera également sa planification dans l'emploi du temps.")) {
      try {
        await deleteCourse(user.universityId, courseId);
        ToastSuccess("Cours supprimé avec succès.");
      } catch (err) {
        ToastError("Erreur lors de la suppression du cours.");
      }
    }
  };

  const location = useLocation();
  const [search, setSearch] = useState(location.state?.search || '');
  const [filterSemester, setFilterSemester] = useState<number | 'tous'>('tous');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
    }
  }, [location.state?.search]);

  // Form states
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [filiere, setFiliere] = useState('');
  const [semester, setSemester] = useState(1);
  const [credits, setCredits] = useState(4);
  const [studentsMax, setStudentsMax] = useState(60);

  // Tab state
  const [activeTab, setActiveTab] = useState<'courses' | 'filieres' | 'classes'>('courses');

  // Filières states & actions
  const [newFiliereName, setNewFiliereName] = useState('');

  const handleAddFiliereSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFiliereName.trim() || !user?.universityId) return;
    try {
      await addFiliere(user.universityId, newFiliereName.trim());
      ToastSuccess("Filière ajoutée avec succès.");
      setNewFiliereName('');
    } catch (err) {
      ToastError("Impossible d'ajouter la filière.");
    }
  };

  const handleDeleteFiliereClick = async (name: string) => {
    if (!user?.universityId) return;
    if (window.confirm(`Voulez-vous vraiment supprimer la filière "${name}" ?`)) {
      try {
        await deleteFiliere(user.universityId, name);
        ToastSuccess("Filière supprimée.");
      } catch (err) {
        ToastError("Impossible de supprimer la filière.");
      }
    }
  };

  // Classes states & actions
  const [newClassName, setNewClassName] = useState('');
  const [newClassFiliere, setNewClassFiliere] = useState('');
  const [newClassAnnee, setNewClassAnnee] = useState(1);

  useEffect(() => {
    if (filieres.length > 0) {
      if (!filiere) setFiliere(filieres[0]);
      if (!newClassFiliere) setNewClassFiliere(filieres[0]);
    }
  }, [filieres, filiere, newClassFiliere]);

  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassFiliere || !user?.universityId) {
      ToastError("Veuillez renseigner tous les champs de la classe.");
      return;
    }
    try {
      await addClass(user.universityId, {
        name: newClassName.trim(),
        filiere: newClassFiliere,
        annee: Number(newClassAnnee)
      });
      ToastSuccess("Classe ajoutée avec succès.");
      setNewClassName('');
    } catch (err) {
      ToastError("Impossible d'ajouter la classe.");
    }
  };

  const handleDeleteClassClick = async (classId: string) => {
    if (!user?.universityId) return;
    if (window.confirm("Voulez-vous vraiment supprimer cette classe ?")) {
      try {
        await deleteClass(user.universityId, classId);
        ToastSuccess("Classe supprimée.");
      } catch (err) {
        ToastError("Impossible de supprimer la classe.");
      }
    }
  };
  
  // Structured scheduling states
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(''); // HH:MM
  const [duration, setDuration] = useState(2); // hours
  const [room, setRoom] = useState('Salle 101');

  const filtered = courses.filter(c => {
    if (!c) return false;
    if (filterSemester !== 'tous' && c.semester !== filterSemester) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      if (!(c.title.toLowerCase().includes(term) || c.code.toLowerCase().includes(term))) return false;
    }
    return true;
  });

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!title || !code || !date || !startTime) {
      ToastError("Veuillez remplir les champs obligatoires (Titre, Code, Date, Heure).");
      return;
    }
    try {
      const selectedTeacher = teachers.find(t => t.id === teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.name : '—';

      // Timetable conflict detection
      for (const event of scheduleEvents) {
        if (event.date === date) {
          const eventStartHour = parseInt(event.startTime.split(':')[0] || '0', 10);
          const eventEndHour = eventStartHour + Number(event.durationHours || 2);
          
          const newStartHour = parseInt(startTime.split(':')[0] || '0', 10);
          const newEndHour = newStartHour + Number(duration);

          // Overlap check
          if (newStartHour < eventEndHour && eventStartHour < newEndHour) {
            // 1. Teacher conflict
            if (teacherId && selectedTeacher && event.teacher === selectedTeacher.name) {
              ToastError(`Conflit Enseignant : ${selectedTeacher.name} a déjà le cours "${event.title}" programmé le ${date} de ${eventStartHour}h à ${eventEndHour}h !`);
              return;
            }
            // 2. Room conflict
            if (event.room === room) {
              ToastError(`Conflit Salle : La salle "${room}" est déjà occupée pour le cours "${event.title}" le ${date} de ${eventStartHour}h à ${eventEndHour}h !`);
              return;
            }
            // 3. Class conflict
            const relatedCourse = courses.find(c => c.code === event.courseCode);
            if (relatedCourse && relatedCourse.filiere === filiere && relatedCourse.semester === semester) {
              ToastError(`Conflit Classe : Les étudiants de "${filiere}" (Semestre ${semester}) ont déjà le cours "${event.title}" le ${date} de ${eventStartHour}h à ${eventEndHour}h !`);
              return;
            }
          }
        }
      }



      // 1. Add course record
      await addCourse(user.universityId, {
        title,
        code,
        teacher: teacherName,
        teacherId: teacherId || '',
        filiere,
        semester: Number(semester),
        credits: Number(credits),
        studentsEnrolled: 0,
        studentsMax: Number(studentsMax),
        status: 'planifie',
        date,
        startTime,
        duration: Number(duration),
        progress: 0
      });

      // 2. Add timetable event
      const colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#8b5cf6'];
      const color = colors[courses.length % colors.length];

      await addScheduleEvent(user.universityId, {
        title,
        courseCode: code,
        room,
        teacher: teacherName,
        date,
        startTime,
        durationHours: Number(duration),
        color
      });

      if (selectedTeacher) {
        await useRealtimeDataStore.getState().addSimulatedEmail(user.universityId, {
          to: selectedTeacher.email,
          recipientName: selectedTeacher.name,
          subject: `Nouveau cours programmé : ${title}`,
          body: `Bonjour ${selectedTeacher.name},\n\nNous vous informons qu'un nouveau cours de "${title}" (${code}) vous a été affecté par l'administration.\n\nPlanning : Le ${date} à ${startTime} pour une durée de ${duration}h en salle "${room}".\n\nCordialement,\nL'administration académique`,
          type: 'schedule'
        });
      }

      ToastSuccess("Cours créé avec succès !");
      setTitle('');
      setCode('');
      setDate('');
      setStartTime('');
      setModalOpen(false);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de l'ajout.");
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
        title="Gestion des cours"
        description="Organisation et suivi de tous les cours par semestre en temps réel"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Cours' }]}
        actions={
          activeTab === 'courses' ? (
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-48 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Chercher un cours..."
                  className="input-premium px-3 py-2 pl-9 text-sm w-full"
                />
              </div>
              <select
                value={filterSemester}
                onChange={e => setFilterSemester(e.target.value === 'tous' ? 'tous' : Number(e.target.value))}
                className="input-premium px-3 py-2 text-sm"
              >
                <option value="tous">Tous semestres</option>
                <option value={1}>Semestre 1</option>
                <option value={2}>Semestre 2</option>
              </select>
              <button onClick={() => setModalOpen(true)} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5 whitespace-nowrap">
                <Plus size={14} />
                Nouveau cours
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Sleek Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Cours & Planning
        </button>
        <button
          onClick={() => setActiveTab('filieres')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'filieres'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Filières
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'classes'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Classes
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const colCourses = filtered.filter(c => c.status === col);
            return (
              <div key={col} className={`rounded-2xl border p-4 ${COLUMN_COLORS[col]}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700 text-sm">{COLUMN_LABELS[col]}</h3>
                  <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {colCourses.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {colCourses.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm bg-white/50 rounded-xl border border-dashed border-slate-200">Aucun cours</div>
                  ) : (
                    colCourses.map(course => (
                      <CourseCard key={course.id} course={course} onDelete={handleDeleteCourse} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'filieres' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Ajouter une filière</h3>
            <form onSubmit={handleAddFiliereSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom de la filière</label>
                <input
                  type="text"
                  value={newFiliereName}
                  onChange={e => setNewFiliereName(e.target.value)}
                  placeholder="ex: Génie Logiciel"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors">
                <Plus size={16} />
                Ajouter
              </button>
            </form>
          </div>

          <div className="md:col-span-2 card-premium p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Filières enregistrées</h3>
            {filieres.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Aucune filière enregistrée.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filieres.map(f => (
                  <div key={f} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{f}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteFiliereClick(f)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Supprimer la filière"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Ajouter une classe</h3>
            <form onSubmit={handleAddClassSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom de la classe</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="ex: Licence 3 Génie Logiciel"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Filière</label>
                <select
                  value={newClassFiliere}
                  onChange={e => setNewClassFiliere(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {filieres.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Année d'étude</label>
                <select
                  value={newClassAnnee}
                  onChange={e => setNewClassAnnee(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1ère année (Licence 1)</option>
                  <option value={2}>2ème année (Licence 2)</option>
                  <option value={3}>3ème année (Licence 3)</option>
                  <option value={4}>4ème année (Master 1)</option>
                  <option value={5}>5ème année (Master 2)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors">
                <Plus size={16} />
                Ajouter la classe
              </button>
            </form>
          </div>

          <div className="md:col-span-2 card-premium p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Classes enregistrées</h3>
            {classes.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Aucune classe enregistrée.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full text-slate-800 dark:text-slate-200">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th>Nom</th>
                      <th>Filière</th>
                      <th>Année</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(c => (
                      <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                        <td className="font-semibold text-slate-950 dark:text-slate-100">{c.name}</td>
                        <td>{c.filiere}</td>
                        <td>{c.annee}e année</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteClassClick(c.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                            title="Supprimer la classe"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Nouveau cours</h3>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Intitulé du cours</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="ex: Méthodes Numériques"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Code du cours</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="ex: MATH-202"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Crédits</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={e => setCredits(Number(e.target.value))}
                    min={1}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Enseignant</label>
                <select
                  value={teacherId}
                  onChange={e => setTeacherId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Sélectionner un enseignant…</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialite})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Filière</label>
                  <select
                    value={filiere}
                    onChange={e => setFiliere(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    {filieres.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Semestre</label>
                  <select
                    value={semester}
                    onChange={e => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>Semestre 1</option>
                    <option value={2}>Semestre 2</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Max Étudiants</label>
                  <input
                    type="number"
                    value={studentsMax}
                    onChange={e => setStudentsMax(Number(e.target.value))}
                    min={1}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Salle de classe</label>
                  <select
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Salle 101">Salle 101</option>
                    <option value="Salle 102">Salle 102</option>
                    <option value="Salle 103">Salle 103</option>
                    <option value="Amphithéâtre A">Amphithéâtre A</option>
                    <option value="Amphithéâtre B">Amphithéâtre B</option>
                    <option value="Labo Informatique">Labo Informatique</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Créneau de planification</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">Heure de début</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-semibold mb-1">Durée</label>
                    <select
                      value={duration}
                      onChange={e => setDuration(Number(e.target.value))}
                      className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                    >
                      <option value={1}>1 heure</option>
                      <option value={2}>2 heures</option>
                      <option value={3}>3 heures</option>
                      <option value={4}>4 heures</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <Plus size={16} />
                Créer le cours
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BookOpen, Users, Clock, Plus, X, Trash2, Search, Edit, Save } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import type { Course, StatusType, Class, Student } from '../../types';

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

function CourseCard({ 
  course, 
  onDelete, 
  onEdit, 
  classes, 
  students 
}: { 
  course: Course; 
  onDelete: (id: string) => void; 
  onEdit: (course: Course) => void; 
  classes: Class[]; 
  students: Student[] 
}) {
  const max = course.studentsMax || 60;
  const enrolled = course.classeId 
    ? students.filter(s => s.classeId === course.classeId).length 
    : course.studentsEnrolled || 0;
  const classObj = course.classeId ? classes.find(c => c.id === course.classeId) : null;

  return (
    <div className="card-premium p-3 group animate-fade-up border border-slate-100 dark:border-slate-800/60 shadow-sm bg-white dark:bg-slate-900/50">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{course.code}</span>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-0.5 leading-tight">{course.title}</h4>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <StatusBadge status={course.status} />
          <button
            onClick={() => onEdit(course)}
            className="p-1 text-slate-450 hover:text-indigo-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Modifier le cours"
          >
            <Edit size={11} />
          </button>
          <button
            onClick={() => onDelete(course.id)}
            className="p-1 text-slate-455 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors"
            title="Supprimer le cours"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {classObj && (
          <span className="inline-block bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/40">
            🏫 {classObj.name}
          </span>
        )}
        {course.room && (
          <span className="inline-block bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[9px] font-medium px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
            📍 {course.room}
          </span>
        )}
      </div>

      <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-2.5">{course.teacher || 'Aucun enseignant'}</p>

      <div className="flex items-center gap-2.5 text-[10px] text-slate-400 dark:text-slate-500 mb-2.5 flex-wrap">
        <span className="flex items-center gap-1">
          <Users size={10} /> {enrolled}/{max}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={10} /> {course.date} à {course.startTime} ({course.duration}h)
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={10} /> {course.credits || 0} Coeff.
        </span>
      </div>
    </div>
  );
}

export default function GestionCours() {
  const { user } = useAuthStore();
  const {
    courses,
    teachers,
    students,
    scheduleEvents,
    addCourse,
    deleteCourse,
    addScheduleEvent,
    loading,
    filieres,
    classes,
    salles,
    addFiliere,
    deleteFiliere,
    addClass,
    deleteClass,
    addSalle,
    deleteSalle
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
  const [activeView, setActiveView] = useState<'board' | 'schedule'>('board');

  const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8h-19h

  const parsedEvents = (scheduleEvents || []).map(event => {
    let dayOfWeek = 0;
    if (event.date) {
      const d = new Date(event.date);
      const day = d.getDay();
      dayOfWeek = day === 0 ? 0 : day - 1; // Map Monday-Friday to 0-4
    } else if (event.dayOfWeek !== undefined) {
      dayOfWeek = event.dayOfWeek;
    }

    let startHour = 8;
    if (event.startTime) {
      startHour = parseInt(event.startTime.split(':')[0] || '8', 10);
    } else if (event.startHour !== undefined) {
      startHour = event.startHour;
    }

    return {
      ...event,
      dayOfWeek,
      startHour
    };
  });

  const getWeekDayDate = (dayIndex: number) => {
    const current = new Date();
    const currentDay = current.getDay(); // 0 is Sunday, 1 is Monday...
    const distance = (dayIndex + 1) - currentDay;
    const targetDate = new Date(current);
    targetDate.setDate(current.getDate() + distance);
    return targetDate.toISOString().split('T')[0];
  };

  const handleCellClick = (dayIdx: number, hour: number) => {
    setDate(getWeekDayDate(dayIdx));
    setStartTime(`${String(hour).padStart(2, '0')}:00`);
    setModalOpen(true);
  };

  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
    }
  }, [location.state?.search]);

  // Form states
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [filiere, setFiliere] = useState('');
  const [semester, setSemester] = useState(1);
  const [credits, setCredits] = useState(4);
  const [studentsMax, setStudentsMax] = useState(60);
  const [courseClasseId, setCourseClasseId] = useState('');

  const handleEditClick = (course: Course) => {
    setTitle(course.title);
    setCode(course.code);
    setTeacherId(course.teacherId || '');
    setFiliere(course.filiere || '');
    setSemester(course.semester || 1);
    setCredits(course.credits || 4);
    setStudentsMax(course.studentsMax || 60);
    setCourseClasseId(course.classeId || '');
    setRoom(course.room || '');
    setDate(course.date || '');
    setStartTime(course.startTime || '');
    setDuration(course.duration || 2);
    setEditingCourseId(course.id);
    setModalOpen(true);
  };

  const handleNewCourseClick = () => {
    setTitle('');
    setCode('');
    setTeacherId('');
    setFiliere(classes[0]?.filiere || '');
    setSemester(1);
    setCredits(4);
    setStudentsMax(60);
    setCourseClasseId(classes[0]?.id || '');
    setRoom(salles[0] || 'Salle 101');
    setDate('');
    setStartTime('');
    setDuration(2);
    setEditingCourseId(null);
    setModalOpen(true);
  };

  useEffect(() => {
    if (classes.length > 0 && !courseClasseId) {
      setCourseClasseId(classes[0].id);
    }
  }, [classes, courseClasseId]);

  useEffect(() => {
    if (courseClasseId) {
      const selectedClass = classes.find(c => c.id === courseClasseId);
      if (selectedClass) {
        setFiliere(selectedClass.filiere);
      }
    }
  }, [courseClasseId, classes]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'courses' | 'filieres' | 'classes' | 'salles'>('courses');

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

  // Salles states & actions
  const [newSalleName, setNewSalleName] = useState('');

  const handleAddSalleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalleName.trim() || !user?.universityId) return;
    try {
      await addSalle(user.universityId, newSalleName.trim());
      ToastSuccess("Salle ajoutée avec succès.");
      setNewSalleName('');
    } catch (err) {
      ToastError("Impossible d'ajouter la salle.");
    }
  };

  const handleDeleteSalleClick = async (name: string) => {
    if (!user?.universityId) return;
    if (window.confirm(`Voulez-vous vraiment supprimer la salle "${name}" ?`)) {
      try {
        await deleteSalle(user.universityId, name);
        ToastSuccess("Salle supprimée.");
      } catch (err) {
        ToastError("Impossible de supprimer la salle.");
      }
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
  const [room, setRoom] = useState('');

  useEffect(() => {
    if (salles && salles.length > 0) {
      if (!room) setRoom(salles[0]);
    } else {
      if (!room) setRoom('Salle 101');
    }
  }, [salles, room]);

  const filtered = courses.filter(c => {
    if (!c) return false;
    if (filterSemester !== 'tous' && c.semester !== filterSemester) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      if (!(c.title.toLowerCase().includes(term) || c.code.toLowerCase().includes(term))) return false;
    }
    return true;
  });

  const handleAddOrEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!title || !code || !date || !startTime || !courseClasseId) {
      ToastError("Veuillez remplir les champs obligatoires (Titre, Code, Classe, Date, Heure).");
      return;
    }
    try {
      const selectedTeacher = teachers.find(t => t.id === teacherId);
      const teacherName = selectedTeacher ? selectedTeacher.name : '—';

      // Timetable conflict detection
      for (const event of scheduleEvents) {
        // Ignore checking against self if editing
        const relatedCourse = courses.find(c => c.code === event.courseCode);
        if (editingCourseId && relatedCourse && relatedCourse.id === editingCourseId) {
          continue;
        }

        if (event.date === date) {
          const eventStartHour = parseInt((event.startTime || '08:00').split(':')[0] || '0', 10);
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
            if (relatedCourse && relatedCourse.filiere === filiere && relatedCourse.semester === semester) {
              ToastError(`Conflit Classe : Les étudiants de "${filiere}" (Semestre ${semester}) ont déjà le cours "${event.title}" le ${date} de ${eventStartHour}h à ${eventEndHour}h !`);
              return;
            }
          }
        }
      }

      const initialEnrolledCount = students.filter(s => s.classeId === courseClasseId).length;

      if (editingCourseId) {
        // Edit flow
        await useRealtimeDataStore.getState().updateCourse(user.universityId, editingCourseId, {
          title,
          code,
          teacher: teacherName,
          teacherId: teacherId || '',
          filiere,
          classeId: courseClasseId,
          semester: Number(semester),
          credits: Number(credits),
          studentsEnrolled: initialEnrolledCount,
          studentsMax: Number(studentsMax),
          date,
          startTime,
          duration: Number(duration),
          room
        });
        ToastSuccess("Cours modifié avec succès !");
      } else {
        // Create flow
        await addCourse(user.universityId, {
          title,
          code,
          teacher: teacherName,
          teacherId: teacherId || '',
          filiere,
          classeId: courseClasseId,
          semester: Number(semester),
          credits: Number(credits),
          studentsEnrolled: initialEnrolledCount,
          studentsMax: Number(studentsMax),
          status: 'planifie',
          date,
          startTime,
          duration: Number(duration),
          progress: 0,
          room
        });

        // Add timetable event
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
      }

      setTitle('');
      setCode('');
      setTeacherId('');
      setDate('');
      setStartTime('');
      setCourseClasseId(classes[0]?.id || '');
      setEditingCourseId(null);
      setModalOpen(false);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de la configuration du cours.");
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
              <button
                onClick={() => setActiveView(activeView === 'board' ? 'schedule' : 'board')}
                className="btn btn-outline btn-xs h-9 text-xs px-3 rounded-xl border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {activeView === 'board' ? '📅 Emploi du temps' : '📋 Vue Kanban'}
              </button>
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
              <button onClick={handleNewCourseClick} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5 whitespace-nowrap">
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
        <button
          onClick={() => setActiveTab('salles')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'salles'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Salles
        </button>
      </div>

      {activeTab === 'courses' && activeView === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
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
                      <CourseCard key={course.id} course={course} onDelete={handleDeleteCourse} onEdit={handleEditClick} classes={classes} students={students} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'courses' && activeView === 'schedule' && (
        <div className="card-premium overflow-hidden animate-fade-in bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Planification Visuelle</span>
            <span className="text-[10px] text-indigo-500 font-semibold">💡 Astuce : Cliquez sur un carreau vide pour planifier directement à ce créneau.</span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header jours */}
              <div className="grid grid-cols-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/20">
                <div className="p-3 text-xs text-slate-400 font-bold text-center">Heure</div>
                {DAYS.map((day, i) => (
                  <div key={i} className="p-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{day}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{getWeekDayDate(i)}</p>
                  </div>
                ))}
              </div>

              {/* Grid heures */}
              <div className="relative">
                {HOURS.map(hour => (
                  <div key={hour} className="grid grid-cols-6 border-b border-slate-50 dark:border-slate-850 min-h-14">
                    <div className="p-2 text-xs text-slate-400 dark:text-slate-500 text-right pr-3 pt-2 border-r border-slate-100 dark:border-slate-800 bg-slate-50/10 font-semibold">
                      {String(hour).padStart(2, '0')}h00
                    </div>
                    {DAYS.map((_, dayIdx) => {
                      const events = parsedEvents.filter(
                        e => e.dayOfWeek === dayIdx && e.startHour === hour
                      );
                      return (
                        <div
                          key={dayIdx}
                          onClick={() => {
                            if (events.length === 0) {
                              handleCellClick(dayIdx, hour);
                            }
                          }}
                          className={`border-l border-slate-50 dark:border-slate-850 p-1 relative min-h-[56px] transition-colors ${
                            events.length === 0 
                              ? 'cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/10' 
                              : ''
                          }`}
                        >
                          {events.map(event => {
                            const courseObj = courses.find(c => c && c.code === event.courseCode);
                            return (
                              <div
                                key={event.id}
                                className="rounded-xl p-2 text-white select-none shadow-sm flex flex-col justify-between"
                                style={{
                                  background: event.color || '#6366f1',
                                  minHeight: `${(event.durationHours || 2) * 56 - 8}px`,
                                  position: 'absolute',
                                  top: '4px',
                                  left: '4px',
                                  right: '4px',
                                  zIndex: 10
                                }}
                              >
                                <div>
                                  <div className="flex justify-between items-start">
                                    <p className="font-semibold text-[10px] leading-tight truncate mr-1">{event.title}</p>
                                    {courseObj && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditClick(courseObj);
                                        }}
                                        className="text-white/80 hover:text-white transition-opacity p-0.5 flex-shrink-0"
                                        title="Modifier le cours"
                                      >
                                        <Edit size={10} />
                                      </button>
                                    )}
                                  </div>
                                  {event.teacher && (
                                    <p className="text-white/80 text-[8px] mt-0.5 truncate">{event.teacher}</p>
                                  )}
                                </div>
                                <div className="flex justify-between items-end mt-1">
                                  <span className="text-white/70 text-[8px] truncate">{event.room}</span>
                                  <span className="text-white/60 text-[8px]">
                                    {event.startHour}h – {event.startHour + (event.durationHours || 2)}h
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {events.length === 0 && (
                            <div className="opacity-0 hover:opacity-100 absolute inset-0 flex items-center justify-center bg-indigo-50/60 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold transition-all">
                              + Planifier
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                  list="class-name-suggestions"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  placeholder="ex: Licence 3 Génie Logiciel"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <datalist id="class-name-suggestions">
                  <option value="Licence 1" />
                  <option value="Licence 2" />
                  <option value="Licence 3" />
                  <option value="Master 1" />
                  <option value="Master 2" />
                </datalist>
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
                <input
                  type="number"
                  min={1}
                  list="class-annee-suggestions"
                  value={newClassAnnee}
                  onChange={e => setNewClassAnnee(Number(e.target.value))}
                  placeholder="ex: 1"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <datalist id="class-annee-suggestions">
                  <option value={1} />
                  <option value={2} />
                  <option value={3} />
                  <option value={4} />
                  <option value={5} />
                </datalist>
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

      {activeTab === 'salles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 h-fit">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Ajouter une salle</h3>
            <form onSubmit={handleAddSalleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom de la salle / Amphi</label>
                <input
                  type="text"
                  list="salles-names-list"
                  value={newSalleName}
                  onChange={e => setNewSalleName(e.target.value)}
                  placeholder="ex: Amphi 1"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <datalist id="salles-names-list">
                  <option value="Amphi 1" />
                  <option value="Amphithéâtre A" />
                  <option value="Amphithéâtre B" />
                  <option value="Salle 101" />
                  <option value="Salle 102" />
                  <option value="Salle de TD 1" />
                </datalist>
              </div>
              <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors">
                <Plus size={16} />
                Ajouter la salle
              </button>
            </form>
          </div>

          <div className="md:col-span-2 card-premium p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Salles enregistrées</h3>
            {salles.length === 0 ? (
              <div className="text-center py-12 text-slate-400">Aucune salle enregistrée.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {salles.map(s => (
                  <div key={s} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{s}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSalleClick(s)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      title="Supprimer la salle"
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
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              {editingCourseId ? 'Modifier le cours' : 'Nouveau cours'}
            </h3>
            <form onSubmit={handleAddOrEditCourse} className="space-y-4">
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
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Classe concernée</label>
                <select
                  value={courseClasseId}
                  onChange={e => setCourseClasseId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Sélectionner une classe…</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Filière</label>
                  <input
                    type="text"
                    value={filiere || 'Sélectionnez une classe'}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 focus:outline-none cursor-not-allowed"
                  />
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
                  <input
                    type="text"
                    list="salles-suggestions"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="ex: Amphi 1"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <datalist id="salles-suggestions">
                    {salles.map(s => (
                      <option key={s} value={s} />
                    ))}
                    {salles.length === 0 && (
                      <>
                        <option value="Amphi 1" />
                        <option value="Amphithéâtre A" />
                        <option value="Amphithéâtre B" />
                        <option value="Salle 101" />
                        <option value="Salle 102" />
                        <option value="Labo Informatique" />
                      </>
                    )}
                  </datalist>
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
                {editingCourseId ? <Save size={16} /> : <Plus size={16} />}
                {editingCourseId ? 'Enregistrer les modifications' : 'Créer le cours'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

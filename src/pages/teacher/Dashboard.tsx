import PageHeader from '../../components/ui/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { FileText, Users, BookOpen, ClipboardList } from 'lucide-react';

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const {
    courses,
    students,
    assignments,
    scheduleEvents,
    loading
  } = useRealtimeDataStore();

  const myCourses = courses.filter((c) => c.teacherId === user?.id);
  const myCourseIds = myCourses.map((c) => c.id);
  const myFilieres = [...new Set(myCourses.map((c) => c.filiere))];

  // Calculate copies to grade (sum of submissions count from assignments assigned to teacher's courses)
  const myAssignments = assignments.filter((a) => myCourseIds.includes(a.courseId));
  const totalSubmissions = myAssignments.reduce((sum, a) => sum + (a.submissionsCount || 0), 0);

  // Filter students who are in the same filière as the teacher's courses
  const myStudents = students.filter((s) => myFilieres.includes(s.filiere));
  const totalStudentsCount = myStudents.length;

  // Filter teacher's schedule events
  const myEvents = scheduleEvents.filter(event => {
    const course = myCourses.find(c => c.code === event.courseCode);
    return !!course || event.teacher === user?.name;
  });

  const getNextEvent = () => {
    if (myEvents.length === 0) return null;
    const now = new Date();
    // Monday is 0, Sunday is 6
    const currentDayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const currentHour = now.getHours();

    const sortedEvents = [...myEvents].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startHour - b.startHour;
    });

    const nextToday = sortedEvents.find(
      e => e.dayOfWeek === currentDayOfWeek && e.startHour > currentHour
    );
    if (nextToday) return nextToday;

    const nextThisWeek = sortedEvents.find(e => e.dayOfWeek > currentDayOfWeek);
    if (nextThisWeek) return nextThisWeek;

    return sortedEvents[0];
  };

  const nextEvent = getNextEvent();
  const DAYS_SHORT = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const scheduleStr = nextEvent 
    ? `${DAYS_SHORT[nextEvent.dayOfWeek]} à ${nextEvent.startHour}h`
    : 'À programmer';

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 page-transition">
      <PageHeader
        title="Espace Enseignant"
        description="Bienvenue sur votre espace professeur. Suivez vos cours, devoirs et évaluations en temps réel."
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Tableau de bord' }]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Prochain Cours */}
        <div className="card-premium p-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white border-none relative overflow-hidden flex flex-col justify-between min-h-36 shadow-lg">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-200 to-transparent pointer-events-none" />
          <div>
            <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Prochain Cours</p>
            <h3 className="text-xl font-bold mt-1.5 truncate">
              {nextEvent ? nextEvent.title : 'Aucun cours'}
            </h3>
          </div>
          <div className="flex justify-between items-center text-xs mt-4 border-t border-white/20 pt-3 text-indigo-100">
            <span>{nextEvent ? nextEvent.courseCode : '—'}</span>
            <span className="bg-white/10 px-2 py-0.5 rounded-md font-semibold font-mono">
              {scheduleStr}
            </span>
          </div>
        </div>

        {/* Card 2: Copies à corriger */}
        <div className="card-premium p-5 flex flex-col justify-between min-h-36">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Copies à corriger</p>
              <p className="text-3xl font-extrabold text-slate-800">{totalSubmissions}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-50 pt-2.5">Toutes matières confondues</p>
        </div>

        {/* Card 3: Étudiants encadrés */}
        <div className="card-premium p-5 flex flex-col justify-between min-h-36">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Étudiants encadrés</p>
              <p className="text-3xl font-extrabold text-slate-800">{totalStudentsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-50 pt-2.5">Dans vos filières actives</p>
        </div>

        {/* Card 4: Total cours */}
        <div className="card-premium p-5 flex flex-col justify-between min-h-36">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cours enseignés</p>
              <p className="text-3xl font-extrabold text-slate-800">{myCourses.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-50 pt-2.5">Semestre en cours</p>
        </div>
      </div>

      {/* Courses List */}
      <div className="card-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">Programme de vos cours</h3>
          <ClipboardList size={16} className="text-slate-300" />
        </div>
        {myCourses.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Aucun cours ne vous a été attribué par l'administration de l'établissement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Intitulé du cours</th>
                  <th>Filière</th>
                  <th>Créneau Horaire</th>
                  <th className="text-center">Effectif Max</th>
                </tr>
              </thead>
              <tbody>
                {myCourses.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono font-bold text-xs text-indigo-600">{c.code}</td>
                    <td className="font-medium text-slate-800 text-sm">{c.title}</td>
                    <td className="text-slate-600 text-sm">{c.filiere}</td>
                    <td>
                      <span className="bg-slate-100 text-slate-600 font-medium text-xs px-2.5 py-1 rounded-lg">
                        {c.schedule || 'À programmer'}
                      </span>
                    </td>
                    <td className="text-center text-sm text-slate-500">{c.studentsMax || 60}</td>
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

export default TeacherDashboard;

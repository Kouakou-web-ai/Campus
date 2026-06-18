import { useState } from 'react';
import { BookOpen, Clock, AlertCircle, Bell, GraduationCap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import ProgressRing from '../../components/ui/ProgressRing';
import LearningQuiz from '../../components/student/LearningQuiz';
import ConsultationCahierTextes from '../../components/student/ConsultationCahierTextes';
import StudentQuizzes from '../../components/student/StudentQuizzes';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const COURSE_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];

export default function PortailApprentissage() {
  const { user } = useAuthStore();
  const { courses, assignments, scheduleEvents, grades, announcements, loading, students } = useRealtimeDataStore();
  const [activeTab, setActiveTab] = useState<'cours' | 'cahier' | 'quizzes'>('cours');

  const activeCourses = courses.filter(c => c.status === 'en_cours');
  const pendingAssignments = assignments.filter(a => a.status === 'publie');
  const nextEvent = scheduleEvents[0];

  // Find student profile to get matricule (studentId)
  const currentStudent = students.find(s => s.id === user?.id);
  const studentId = currentStudent?.studentId || 'Non défini';

  // Calculate student average note
  const studentGrades = grades.filter(g => g.studentId === user?.id && g.note !== undefined);
  const averageNote = studentGrades.length > 0
    ? (studentGrades.reduce((sum, g) => sum + (g.note ?? 0), 0) / studentGrades.length).toFixed(1)
    : '—';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
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
      {/* Hero greeting */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(at 80% 20%, rgba(255,255,255,0.3) 0, transparent 50%)' }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {greeting()}, {user?.name.split(' ')[0]} 👋
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 mb-2 mt-1">
              <p className="text-indigo-200 text-sm">Espace étudiant — Suivi de votre apprentissage en temps réel</p>
              <span className="bg-white/20 text-white font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border border-white/10 shadow-sm select-all" title="Cliquez pour copier le matricule">
                Matricule : {studentId}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{activeCourses.length}</div>
                <div className="text-xs text-indigo-200">Cours actifs</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold">{pendingAssignments.length}</div>
                <div className="text-xs text-indigo-200">Devoirs à rendre</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold">{averageNote}</div>
                <div className="text-xs text-indigo-200">Moyenne générale</div>
              </div>
            </div>
          </div>
          <ProgressRing
            value={activeCourses.length > 0 ? Math.round((activeCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / activeCourses.length)) : 0}
            size={100}
            strokeWidth={8}
            color="rgba(255,255,255,0.8)"
            label="Moyenne"
            sublabel="progression"
            className="flex-shrink-0 hidden md:flex [&_span]:text-white"
          />
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('cours')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'cours'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Mes cours & Agenda
        </button>
        <button
          onClick={() => setActiveTab('cahier')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'cahier'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Cahier de textes
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'quizzes'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Auto-évaluation & Quiz
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'cours' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cours en cours */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Mes cours actifs</h2>
              
              {activeCourses.length === 0 ? (
                <div className="card-premium p-8 text-center bg-white border border-slate-100">
                  <BookOpen className="mx-auto text-slate-300 mb-2" size={36} />
                  <p className="text-slate-400 text-sm">Vous n'avez aucun cours actif programmé pour le moment.</p>
                </div>
              ) : (
                activeCourses.map((course, i) => (
                  <div key={course.id} className="card-premium p-6 group cursor-pointer animate-fade-up">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${COURSE_COLORS[i % COURSE_COLORS.length]} flex items-center justify-center flex-shrink-0`}>
                        <BookOpen size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{course.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{course.teacher} · {course.code}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-indigo-600">{course.progress || 0}%</span>
                        <p className="text-xs text-slate-400">avancement</p>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${COURSE_COLORS[i % COURSE_COLORS.length]}`}
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
      
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Prochain cours */}
              <div className="card-premium p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Clock size={14} className="text-indigo-500" />
                  Prochain cours
                </h3>
                {nextEvent ? (
                  <div className="bg-indigo-50 rounded-2xl p-4 animate-fade-up">
                    <p className="font-bold text-indigo-800 text-sm truncate">{nextEvent.title}</p>
                    <p className="text-xs text-indigo-500 mt-1">{nextEvent.room} · {DAYS[nextEvent.dayOfWeek] || 'Jour'} {nextEvent.startHour}h</p>
                    <div className="mt-3 text-xs font-semibold text-indigo-600">
                      {nextEvent.startHour}h00 – {nextEvent.startHour + nextEvent.durationHours}h00
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs text-center py-4 bg-slate-50 rounded-xl">Aucun cours planifié aujourd'hui</p>
                )}
              </div>
      
              {/* Devoirs à rendre */}
              <div className="card-premium p-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-400" />
                  Devoirs à rendre
                </h3>
                {pendingAssignments.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-4 bg-slate-50 rounded-xl">Aucun devoir en attente</p>
                ) : (
                  <div className="space-y-2.5">
                    {pendingAssignments.slice(0, 3).map(a => {
                      const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
                      return (
                        <div key={a.id} className="flex items-center gap-2.5 animate-fade-up">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${daysLeft <= 3 ? 'bg-red-400' : 'bg-amber-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{a.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{a.courseTitle}</p>
                          </div>
                          <span className={`text-[10px] font-bold flex-shrink-0 px-2 py-0.5 rounded-full ${daysLeft <= 3 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                            {daysLeft > 0 ? `J-${daysLeft}` : 'Dépassé'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Annonces */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Bell size={15} className="text-slate-400" />
              Annonces de l'établissement
            </h2>
            <div className="space-y-2.5">
              {announcements.length === 0 ? (
                <div className="card-premium p-6 text-center text-slate-400 text-xs">
                  Aucune annonce de l'établissement pour le moment.
                </div>
              ) : (
                announcements.map(a => (
                  <div
                    key={a.id}
                    className={`card-premium p-4 border-l-4 ${
                      a.type === 'warning' ? 'border-l-amber-400' : a.type === 'success' ? 'border-l-emerald-400' : 'border-l-indigo-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{a.message}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{a.date || 'Récemment'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'cahier' && (
        <ConsultationCahierTextes />
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <StudentQuizzes />
          <LearningQuiz />
        </div>
      )}
    </div>
  );
}

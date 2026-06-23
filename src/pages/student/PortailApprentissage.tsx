import { useState } from 'react';
import { BookOpen, Clock, AlertCircle, Bell, GraduationCap, FileText, Eye, Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import ProgressRing from '../../components/ui/ProgressRing';
import LearningQuiz from '../../components/student/LearningQuiz';
import ConsultationCahierTextes from '../../components/student/ConsultationCahierTextes';
import StudentQuizzes from '../../components/student/StudentQuizzes';
import { ToastSuccess } from '../../controllers/Toast-emitter';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const COURSE_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];

export default function PortailApprentissage() {
  const { user } = useAuthStore();
  const { courses, assignments, scheduleEvents, grades, announcements, loading, students, resources } = useRealtimeDataStore();
  const [activeTab, setActiveTab] = useState<'cours' | 'cahier' | 'quizzes' | 'documents'>('cours');

  // PDF Viewer states
  const [selectedPdf, setSelectedPdf] = useState<any | null>(null);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfZoom, setPdfZoom] = useState(100);

  const activeCourses = courses.filter(c => c.status === 'en_cours');
  const pendingAssignments = assignments.filter(a => a.status === 'publie');
  const nextEvent = scheduleEvents[0];

  // Find student profile to get matricule (studentId)
  const currentStudent = students.find(s => s.id === user?.id);
  const studentId = currentStudent?.studentId || 'Non défini';

  // Filter student-related courses and PDFs
  const studentCourses = courses.filter(c => c.filiere === currentStudent?.filiere);
  const studentCourseIds = studentCourses.map(c => c.id);
  const studentPdfResources = resources.filter(res => res.type === 'pdf' && studentCourseIds.includes(res.courseId));

  const handleOpenPdf = (pdf: any) => {
    setSelectedPdf(pdf);
    setPdfPage(1);
    setPdfZoom(100);
  };

  const handleDownloadSimulatedPdf = () => {
    ToastSuccess("Téléchargement simulé du PDF démarré.");
  };

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
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Documents de cours
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

      {activeTab === 'documents' && (
        <div className="space-y-6 animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800">Mes documents de cours PDF</h2>
          <p className="text-xs text-slate-400 mt-0.5">Retrouvez l'ensemble des polycopiés et supports envoyés par vos enseignants.</p>

          {studentPdfResources.length === 0 ? (
            <div className="card-premium p-12 text-center bg-white border border-slate-100 max-w-lg mx-auto">
              <FileText className="mx-auto text-slate-350 mb-3" size={48} />
              <h3 className="font-bold text-slate-700">Aucun document partagé</h3>
              <p className="text-slate-400 text-sm mt-1">Vos enseignants n'ont pas encore publié de documents PDF pour vos cours actuels.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentPdfResources.map((res) => (
                <div key={res.id} className="card-premium p-5 flex flex-col justify-between h-44 hover:shadow-lg transition-all animate-fade-up bg-white">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                        <FileText size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        {res.size || '1.5 Mo'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mt-3.5 line-clamp-1" title={res.title}>
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{res.courseTitle}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-3">
                    <span className="text-[10px] text-slate-400">Reçu le {res.uploadedAt}</span>
                    <button
                      onClick={() => handleOpenPdf(res)}
                      className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                    >
                      <Eye size={12} />
                      Ouvrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODALE DE LECTURE PDF PREMIUM */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 md:p-6 overflow-hidden">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl w-full max-w-5xl h-[85vh] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col relative animate-fade-up">
            
            {/* Top Toolbar */}
            <div className="bg-white dark:bg-slate-950 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center rounded-t-3xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-lg">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base truncate max-w-xs md:max-w-md">
                    {selectedPdf.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">{selectedPdf.courseTitle}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3.5">
                {/* Navigation pages */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  <button 
                    onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                    disabled={pdfPage === 1}
                    className="p-1 text-slate-500 hover:text-slate-850 dark:hover:text-white disabled:opacity-30 rounded-md"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-650 dark:text-slate-350 min-w-10 text-center">
                    {pdfPage} / 3
                  </span>
                  <button 
                    onClick={() => setPdfPage(p => Math.min(3, p + 1))}
                    disabled={pdfPage === 3}
                    className="p-1 text-slate-500 hover:text-slate-855 dark:hover:text-white disabled:opacity-30 rounded-md"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Zoom */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg font-mono">
                  <span>Zoom: {pdfZoom}%</span>
                </div>

                {/* Download (Simulated) */}
                <button
                  onClick={handleDownloadSimulatedPdf}
                  className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 hover:text-indigo-650 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                  title="Télécharger le fichier"
                >
                  <Download size={16} />
                </button>

                {/* Close */}
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 hover:bg-rose-100 rounded-xl transition-all"
                  title="Fermer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Document Content Split Layout */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Sidebar Outline (Sommaire) */}
              <div className="hidden md:block w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Sommaire du cours</h4>
                <div className="space-y-1">
                  {[
                    { page: 1, title: "1. Introduction & Prérequis" },
                    { page: 2, title: "2. Concepts & Algorithmes Clefs" },
                    { page: 3, title: "3. Exercices & Cas d'Étude" }
                  ].map(outline => (
                    <button
                      key={outline.page}
                      onClick={() => setPdfPage(outline.page)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                        pdfPage === outline.page
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 text-[10px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {outline.page}
                      </span>
                      <span className="truncate">{outline.title}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-400 space-y-1">
                  <p><strong>Support de cours officiel</strong></p>
                  <p>Université Félix Houphouët-Boigny</p>
                  <p>Département Sciences & Tech</p>
                </div>
              </div>

              {/* PDF Sheet display */}
              <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-slate-200 dark:bg-slate-900">
                <div 
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg shadow-lg w-full max-w-2xl min-h-[70vh] p-8 md:p-12 text-left relative flex flex-col justify-between font-serif text-slate-800 dark:text-slate-200"
                  style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top center' }}
                >
                  {/* Top stamp header */}
                  <div className="flex justify-between items-center text-[10px] font-sans text-slate-400 border-b border-slate-100 pb-3 mb-6">
                    <span className="uppercase tracking-wider">CAMPUS POLYCOPIÉ DE COURS</span>
                    <span>Page {pdfPage} sur 3</span>
                  </div>

                  {/* Main content body based on page */}
                  <div className="flex-1 space-y-4">
                    {pdfPage === 1 && (
                      <div className="animate-fade-in space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white border-b-2 border-indigo-500 pb-2 mb-4">
                          Chapitre 1 : Introduction et Fondations
                        </h2>
                        <p className="leading-relaxed text-sm">
                          Ce document constitue le polycopié de référence pour l'apprentissage du module. Les thématiques traitées abordent la conception méthodologique, l'optimisation des structures logiques de programmation et les schémas d'architectures modernes de bases de données distribuées.
                        </p>
                        <p className="leading-relaxed text-sm">
                          Il est attendu de chaque étudiant qu'il lise rigoureusement cette documentation afin d'assimiler les paradigmes fondamentaux. Les séances de travaux pratiques s'appuieront sur ces fondements de conception.
                        </p>
                        <h3 className="text-base font-bold font-sans text-slate-800 dark:text-slate-300 mt-6 mb-2">Objectifs d'apprentissage :</h3>
                        <ul className="list-disc pl-5 text-sm space-y-2 leading-relaxed font-sans">
                          <li>Comprendre les principes théoriques de structuration de données complexes.</li>
                          <li>Analyser la complexité en temps et en espace mémoire (Notation de Landau Big-O).</li>
                          <li>Appliquer les bonnes pratiques d'architectures logicielles SaaS à haute performance.</li>
                        </ul>
                      </div>
                    )}

                    {pdfPage === 2 && (
                      <div className="animate-fade-in space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white border-b-2 border-indigo-500 pb-2 mb-4">
                          Chapitre 2 : Concepts & Algorithmes Avancés
                        </h2>
                        <p className="leading-relaxed text-sm">
                          Dans cette section, nous abordons l'implémentation pratique des structures auto-équilibrantes (arbres AVL, Rouge-Noir) et des mécanismes de routage de paquets sur les graphes orientés via l'algorithme de Dijkstra.
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-650 dark:text-indigo-400 space-y-1 my-4">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">// Exemple d'algorithme récursif de Tri Rapide (QuickSort)</p>
                          <p><span className="text-pink-500">function</span> quickSort(arr) &#123;</p>
                          <p className="pl-4">if (arr.length &lt;= 1) return arr;</p>
                          <p className="pl-4"><span className="text-pink-500">const</span> pivot = arr[arr.length - 1];</p>
                          <p className="pl-4"><span className="text-pink-500">const</span> left = arr.filter(x =&gt; x &lt; pivot);</p>
                          <p className="pl-4"><span className="text-pink-500">const</span> right = arr.filter(x =&gt; x &gt; pivot);</p>
                          <p className="pl-4">return [...quickSort(left), pivot, ...quickSort(right)];</p>
                          <p>&#125;</p>
                        </div>
                        <p className="leading-relaxed text-sm">
                          L'analyse computationnelle du tri rapide met en évidence une complexité temporelle moyenne de <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">O(N log N)</code>, s'avérant très performante sur des jeux de données distribués.
                        </p>
                      </div>
                    )}

                    {pdfPage === 3 && (
                      <div className="animate-fade-in space-y-4">
                        <h2 className="text-2xl font-bold font-sans text-slate-900 dark:text-white border-b-2 border-indigo-500 pb-2 mb-4">
                          Chapitre 3 : Cas Pratiques et Exercices
                        </h2>
                        <p className="leading-relaxed text-sm">
                          Cette partie vous propose une série d'exercices d'auto-évaluation à réaliser avant la prochaine séance de cours magistral en amphi.
                        </p>
                        
                        <div className="space-y-3.5 mt-6 font-sans">
                          <div className="border border-indigo-100 dark:border-indigo-900/40 p-4 rounded-xl bg-indigo-50/20">
                            <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Exercice 1 : Complexité Temporelle</h4>
                            <p className="text-xs text-slate-650 dark:text-slate-350">
                              Démontrer mathématiquement la complexité du pire des cas (Worst Case) pour le tri rapide en cas de mauvaise sélection de pivot. Quelle structure de données permet de contourner cette faille ?
                            </p>
                          </div>
                          
                          <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Exercice 2 : Requêtes SQL complexes</h4>
                            <p className="text-xs text-slate-650 dark:text-slate-350">
                              Écrire une requête SQL optimisée utilisant des agrégations complexes et des fonctions de fenêtrage (Window Functions) pour extraire le classement par moyenne des étudiants de chaque filière académique.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer stamp sheet */}
                  <div className="flex justify-between items-center text-[9px] font-sans text-slate-400 border-t border-slate-100 pt-3 mt-6">
                    <span>CAMPUS SYSTEM · SÉCURISÉ</span>
                    <span>Fichier PDF Authentique</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

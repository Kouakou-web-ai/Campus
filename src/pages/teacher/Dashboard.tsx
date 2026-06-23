import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { FileText, Users, BookOpen, ClipboardList, Plus, Trash2, UploadCloud, FileUp } from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const {
    courses,
    students,
    assignments,
    scheduleEvents,
    resources,
    addResource,
    deleteResource,
    loading
  } = useRealtimeDataStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents'>('dashboard');

  // Form states for uploading resources
  const [docTitle, setDocTitle] = useState('');
  const [docCourseId, setDocCourseId] = useState('');
  const [docSize, setDocSize] = useState('1.5 Mo');
  const [isUploading, setIsUploading] = useState(false);

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

  // Filter resources (PDFs) uploaded by this teacher
  const myResources = resources.filter(res => myCourseIds.includes(res.courseId));

  const getNextEvent = () => {
    if (myEvents.length === 0) return null;
    const now = new Date();
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

  const handlePublishResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!docCourseId) {
      ToastError("Veuillez sélectionner un cours.");
      return;
    }
    if (!docTitle.trim()) {
      ToastError("Veuillez entrer un titre de document.");
      return;
    }

    setIsUploading(true);
    try {
      const selectedCourse = myCourses.find(c => c.id === docCourseId);
      
      await addResource(user.universityId, {
        title: docTitle.trim().endsWith('.pdf') ? docTitle.trim() : `${docTitle.trim()}.pdf`,
        type: 'pdf',
        courseId: docCourseId,
        courseTitle: selectedCourse ? selectedCourse.title : 'Cours',
        size: docSize,
        uploadedAt: new Date().toISOString().split('T')[0],
        downloadCount: 0
      });

      ToastSuccess("Document de cours publié avec succès !");
      setDocTitle('');
      setDocCourseId('');
    } catch (err: any) {
      ToastError("Erreur lors de la publication du document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (resId: string) => {
    if (!user?.universityId) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteResource(user.universityId, resId);
        ToastSuccess("Document supprimé avec succès.");
      } catch (err) {
        ToastError("Erreur lors de la suppression.");
      }
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
    <div className="space-y-6 page-transition">
      <PageHeader
        title="Espace Enseignant"
        description="Bienvenue sur votre espace professeur. Suivez vos cours, devoirs et évaluations en temps réel."
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Tableau de bord' }]}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'documents'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Documents de cours (PDF)
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
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
        </>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire de publication */}
          <div className="lg:col-span-1">
            <div className="card-premium p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-150">
                <FileUp size={18} className="text-indigo-600" />
                Publier un document de cours
              </h3>
              
              <form onSubmit={handlePublishResource} className="space-y-4 text-left">
                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold text-slate-600 text-xs">Cours concerné</span></label>
                  <select
                    className="select select-bordered select-premium w-full text-sm"
                    value={docCourseId}
                    onChange={(e) => setDocCourseId(e.target.value)}
                    required
                  >
                    <option value="">-- Choisir un cours --</option>
                    {myCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold text-slate-600 text-xs">Titre du document</span></label>
                  <input
                    type="text"
                    placeholder="ex: Chapitre 1 - Introduction à l'algorithmique"
                    className="input input-bordered input-premium w-full text-sm"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label"><span className="label-text font-semibold text-slate-600 text-xs">Taille fictive du fichier</span></label>
                  <select
                    className="select select-bordered select-premium w-full text-sm"
                    value={docSize}
                    onChange={(e) => setDocSize(e.target.value)}
                  >
                    <option value="1.2 Mo">1.2 Mo</option>
                    <option value="2.5 Mo">2.5 Mo</option>
                    <option value="4.8 Mo">4.8 Mo</option>
                    <option value="820 Ko">820 Ko</option>
                  </select>
                </div>

                {/* Simulated File upload dropzone */}
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 cursor-pointer">
                  <UploadCloud className="mx-auto text-indigo-400 mb-2" size={32} />
                  <p className="text-xs font-semibold text-slate-600">Simuler le fichier PDF</p>
                  <p className="text-[10px] text-slate-400 mt-1">Le document PDF sera généré et lisible par les étudiants.</p>
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="btn btn-primary w-full gap-2 rounded-xl text-sm"
                >
                  {isUploading ? <span className="loading loading-spinner loading-xs" /> : <Plus size={16} />}
                  Envoyer aux étudiants
                </button>
              </form>
            </div>
          </div>

          {/* Liste des documents déjà publiés */}
          <div className="lg:col-span-2">
            <div className="card-premium overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">Documents publiés</h3>
                <span className="badge badge-sm badge-indigo">{myResources.length} PDF(s)</span>
              </div>
              {myResources.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm bg-white">
                  <FileText className="mx-auto text-slate-200 mb-3" size={40} />
                  Vous n'avez publié aucun document de cours pour le moment.
                </div>
              ) : (
                <div className="overflow-x-auto bg-white">
                  <table className="w-full table-premium">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Cours</th>
                        <th className="text-center">Taille</th>
                        <th className="text-center">Téléchargements</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myResources.map(res => (
                        <tr key={res.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 bg-red-50 text-red-500 rounded-lg"><FileText size={16} /></span>
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{res.title}</p>
                                <p className="text-[10px] text-slate-400">Publié le {res.uploadedAt}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-slate-600 text-sm font-medium">{res.courseTitle}</td>
                          <td className="text-center text-xs text-slate-500">{res.size || '—'}</td>
                          <td className="text-center text-xs font-bold text-slate-700">{res.downloadCount || 0}</td>
                          <td className="text-right">
                            <button
                              onClick={() => handleDeleteResource(res.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors active:scale-95"
                              title="Supprimer ce document"
                            >
                              <Trash2 size={16} />
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
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;

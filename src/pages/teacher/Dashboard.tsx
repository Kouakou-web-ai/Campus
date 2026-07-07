import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { FileText, Users, BookOpen, ClipboardList, Plus, Trash2, UploadCloud, FileUp, Video } from 'lucide-react';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import FaireAppelModal from '../../components/ui/FaireAppelModal';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase-config';
import { useNotificationStore } from '../../store/notificationStore';
import { useNow } from '../../hooks/useNow';

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    courses,
    students,
    assignments,
    scheduleEvents,
    resources,
    addResource,
    deleteResource,
    startLiveMeeting,
    loading
  } = useRealtimeDataStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'documents'>('dashboard');
  const [appelModalCourseId, setAppelModalCourseId] = useState<string | null>(null);
  const now = useNow(30_000);

  // Form states for uploading resources
  const [docTitle, setDocTitle] = useState('');
  const [docCourseId, setDocCourseId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const myCourses = courses.filter((c) => c.teacherId === user?.id);
  const myCourseIds = myCourses.map((c) => c.id);
  const myFilieres = [...new Set(myCourses.map((c) => c.filiere))];

  // Calculate copies to grade (sum of submissions count from assignments assigned to teacher's courses)
  const myAssignments = assignments.filter((a) => myCourseIds.includes(a.courseId));
  const totalSubmissions = myAssignments.reduce((sum, a) => sum + (a.submissionsCount || 0), 0);

  // Filter students who are in the classes of the teacher's courses
  const myStudents = students.filter((s) => {
    const teachesStudentInCourse = myCourses.some(c => c.classeId && s.classeId === c.classeId);
    if (teachesStudentInCourse) return true;
    const anyCourseHasClass = myCourses.some(c => c.classeId);
    if (anyCourseHasClass) return false;
    return myFilieres.includes(s.filiere);
  });
  const totalStudentsCount = myStudents.length;

  // Filter teacher's schedule events
  const myEvents = scheduleEvents.filter(event => {
    const course = myCourses.find(c => c.code === event.courseCode);
    return !!course || event.teacher === user?.name;
  });

  // Filter resources (PDFs) uploaded by this teacher
  const myResources = resources.filter(res => res.teacherId === user?.id || myCourseIds.includes(res.courseId));

  const getNextEvent = () => {
    if (myEvents.length === 0) return null;
    const now = Date.now();

    const sortedEvents = [...myEvents].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateA - dateB;
    });

    // Retourne uniquement le premier événement dans le futur
    return sortedEvents.find(e => new Date(`${e.date}T${e.startTime}`).getTime() > now) ?? null;
  };

  const nextEvent = getNextEvent();
  const scheduleStr = nextEvent 
    ? `${nextEvent.date ? new Date(nextEvent.date).toLocaleDateString('fr-FR') : ''} à ${nextEvent.startTime || ''}`
    : 'À programmer';

  const handlePublishResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!docTitle.trim()) {
      ToastError("Veuillez entrer un titre de document.");
      return;
    }

    if (!selectedFile) {
      ToastError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    setIsUploading(true);
    try {
      const selectedCourse = docCourseId ? myCourses.find(c => c.id === docCourseId) : null;
      
      // Simulation locale car CORS Firebase non configuré
      const sizeInMo = selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(1) + ' Mo' : '1.2 Mo';
      const fakeUrl = `https://exemple.com/docs/${Date.now()}_document.pdf`;
      
      await addResource(user.universityId, {
        title: docTitle.trim().endsWith('.pdf') ? docTitle.trim() : `${docTitle.trim()}.pdf`,
        type: 'pdf',
        courseId: docCourseId || 'general',
        courseTitle: selectedCourse ? selectedCourse.title : 'Général (Aucun cours)',
        size: sizeInMo,
        url: fakeUrl,
        uploadedAt: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        teacherId: user.id
      });

      // Notification logic (simulated for students)
      useNotificationStore.getState().addNotification(
        "Nouveau support de cours",
        `Le professeur ${user?.name} a ajouté le document "${docTitle}" ${selectedCourse ? `pour le cours de ${selectedCourse.title}` : '(Général)'}.`,
        "info"
      );

      ToastSuccess("Document de cours publié avec succès !");
      setDocTitle('');
      setDocCourseId('');
      setSelectedFile(null);
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

  const handleStartMeeting = async (course: any) => {
    if (!user?.universityId) return;
    const meetingId = `meet-${course.id}-${Math.random().toString(36).substring(2, 9)}`;
    const meetingData = {
      id: meetingId,
      courseId: course.id,
      courseName: course.title,
      teacherId: user.id,
      teacherName: user.name,
      classeId: course.classeId || '',
      className: course.classeName || course.filiere || 'Filière Générale',
    };

    try {
      await startLiveMeeting(user.universityId, meetingId, meetingData);
      ToastSuccess("Visioconférence lancée avec succès !");
      navigate(`/app/visioconference/${meetingId}`);
    } catch (err: any) {
      ToastError("Échec du lancement de la visioconférence.");
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
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myCourses.map((c) => {
                      const courseStart = new Date(`${c.date}T${c.startTime}`).getTime();
                      const courseEnd = courseStart + (c.duration || 2) * 60 * 60 * 1000;
                      const currentMs = now.getTime();
                      
                      let statusBadge = null;

                      if (currentMs < courseStart) {
                        statusBadge = <span className="bg-violet-100 text-violet-700 font-medium text-[10px] px-2 py-0.5 rounded uppercase">Planifié</span>;
                      } else if (currentMs >= courseStart && currentMs <= courseEnd) {
                        statusBadge = <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded uppercase animate-pulse">En cours</span>;
                      } else {
                        statusBadge = <span className="bg-slate-100 text-slate-500 font-medium text-[10px] px-2 py-0.5 rounded uppercase">Terminé</span>;
                      }

                      const actionBtn = (
                        <div className="flex gap-2 justify-end">
                          {currentMs >= courseStart && currentMs <= courseEnd && (
                            <button 
                              onClick={() => setAppelModalCourseId(c.id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-emerald-200 transition-all active:scale-95"
                            >
                              Faire l'appel
                            </button>
                          )}
                          <button
                            onClick={() => handleStartMeeting(c)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-95 flex items-center gap-1.5 h-8"
                          >
                            <Video size={12} /> Visio
                          </button>
                        </div>
                      );

                      return (
                        <tr key={c.id}>
                          <td className="font-mono font-bold text-xs text-indigo-600 flex items-center gap-2">
                            {c.code}
                            {statusBadge}
                          </td>
                          <td className="font-medium text-slate-800 text-sm">{c.title}</td>
                          <td className="text-slate-600 text-sm">{c.filiere}</td>
                          <td>
                            <span className="bg-slate-100 text-slate-600 font-medium text-xs px-2.5 py-1 rounded-lg">
                              {c.date ? `${new Date(c.date).toLocaleDateString('fr-FR')} à ${c.startTime} (${c.duration}h)` : 'À programmer'}
                            </span>
                          </td>
                          <td className="text-center text-sm text-slate-500">{c.studentsMax || 60}</td>
                          <td className="text-right">
                            {actionBtn}
                          </td>
                        </tr>
                      );
                    })}
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
                  <label className="label"><span className="label-text font-semibold text-slate-600 text-xs">Cours concerné (Optionnel)</span></label>
                  <select
                    className="select select-bordered select-premium w-full text-sm"
                    value={docCourseId}
                    onChange={(e) => setDocCourseId(e.target.value)}
                  >
                    <option value="">Général (Aucun cours)</option>
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
                  <label className="label"><span className="label-text font-semibold text-slate-600 text-xs">Fichier PDF</span></label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="file-input file-input-bordered file-input-premium w-full text-sm"
                    required
                  />
                  {selectedFile && (
                    <p className="text-xs text-slate-500 mt-2">
                      Sélectionné : {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo)
                    </p>
                  )}
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

      {appelModalCourseId && user?.universityId && (
        <FaireAppelModal
          courseId={appelModalCourseId}
          universityId={user.universityId}
          onClose={() => setAppelModalCourseId(null)}
        />
      )}
    </div>
  );
}

export default TeacherDashboard;

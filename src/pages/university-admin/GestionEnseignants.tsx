import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Star, BookOpen, Users, Clock, Mail, Plus, Upload, X, Trash2, Search, CheckCircle, UserPlus, Copy } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import { Avatar } from '../../components/ui/AvatarGroup';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { notifyUserAccountAccess } from '../../services/emailSender';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import ImportModal from '../../components/ui/ImportModal';
import TeacherProfileModal from '../../components/ui/TeacherProfileModal';

export default function GestionEnseignants() {
  const { user } = useAuthStore();
  const { teachers, courses, students, addTeacher, deleteTeacher, loading, classes, currentUniversity } = useRealtimeDataStore();

  const handleDelete = async (teacherId: string) => {
    if (!user?.universityId) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible et supprimera également son compte utilisateur.")) {
      try {
        await deleteTeacher(user.universityId, teacherId);
        ToastSuccess("Enseignant supprimé avec succès.");
      } catch (err) {
        ToastError("Erreur lors de la suppression.");
      }
    }
  };
  const location = useLocation();
  const [search, setSearch] = useState(location.state?.search || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<any | null>(null);
  const [generatedCreds, setGeneratedCreds] = useState<{tempTeacherPassword: string; teacherEmail: string; teacherName: string} | null>(null);

  useEffect(() => {
    if (location.state?.search) {
      setSearch(location.state.search);
    }
  }, [location.state?.search]);

  // Form states for new teacher
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialite, setSpecialite] = useState('Informatique');
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [selectedClassId, setSelectedClassId] = useState('');

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!name || !email) {
      ToastError("Veuillez remplir les champs obligatoires.");
      return;
    }
    try {
      const matchedClass = classes.find(c => c.id === selectedClassId);
      const classPayload = matchedClass ? {
        classeId: selectedClassId,
        classeName: matchedClass.name
      } : {};

      const creds = await addTeacher(user.universityId, {
        name,
        email,
        specialite,
        hoursPerWeek: Number(hoursPerWeek),
        status: 'actif',
        rating: 5.0,
        coursCount: 0,
        studentsCount: 0,
        ...classPayload
      });
      ToastSuccess("Enseignant ajouté avec succès !");

      const uniName = currentUniversity?.name;
      if (creds && creds.tempTeacherPassword) {
        notifyUserAccountAccess({
          name: name.trim(),
          email: email.trim(),
          password: creds.tempTeacherPassword,
          role: 'teacher',
          uniName
        }).catch(err => console.error("Erreur email accès enseignant:", err));
      }

      setGeneratedCreds(creds);
      setName('');
      setEmail('');
      setSelectedClassId('');
      setModalOpen(false);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de l'ajout.");
    }
  };

  const handleImportTeachers = async (items: any[]) => {
    if (!user?.universityId) return;
    try {
      for (const item of items) {
        await addTeacher(user.universityId, {
          name: item.name,
          email: item.email,
          specialite: item.specialite,
          hoursPerWeek: Number(item.hoursPerWeek || 15),
          status: 'actif',
          rating: 5.0,
          coursCount: 0,
          studentsCount: 0
        });
      }
      ToastSuccess("Tous les enseignants ont été importés et les invitations envoyées.");
    } catch (err: any) {
      ToastError("Une erreur est survenue lors de l'importation.");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  const teachersWithStats = teachers.map(t => {
    if (!t) return null;
    const teacherCourses = courses.filter(c => c.teacherId === t.id);
    const teacherFilieres = [...new Set(teacherCourses.map(c => c.filiere))];
    const teacherStudents = students.filter(s => {
      const teachesStudentInCourse = teacherCourses.some(c => c.classeId && s.classeId === c.classeId);
      if (teachesStudentInCourse) return true;
      const anyCourseHasClass = teacherCourses.some(c => c.classeId);
      if (anyCourseHasClass) return false;
      return (t.classeId && s.classeId === t.classeId) || teacherFilieres.includes(s.filiere);
    });
    return {
      ...t,
      coursCount: teacherCourses.length,
      studentsCount: teacherStudents.length,
      courses: teacherCourses,
      students: teacherStudents
    };
  }).filter(Boolean) as any[];

  const activeTeachers = teachersWithStats.filter(t => t.status === 'actif').length;
  const totalCourses = teachersWithStats.reduce((s, t) => s + t.coursCount, 0);
  const totalStudents = teachersWithStats.reduce((s, t) => s + t.studentsCount, 0);

  const filteredTeachers = teachersWithStats.filter(t => {
    const term = search.toLowerCase();
    return (t.name?.toLowerCase() || '').includes(term) || (t.email?.toLowerCase() || '').includes(term);
  });

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Gestion des enseignants"
        description="Vue d'ensemble du corps professoral en temps réel"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Enseignants' }]}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Upload size={14} />
              Importer liste
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold text-white flex items-center gap-1.5">
              <Plus size={14} />
              Ajouter enseignant
            </button>
          </div>
        }
      />

      {/* Stat rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total enseignants', value: teachers.length, color: 'text-indigo-600' },
          { label: 'Actifs', value: activeTeachers, color: 'text-emerald-600' },
          { label: 'Cours actifs', value: totalCourses, color: 'text-blue-600' },
          { label: 'Étudiants encadrés', value: totalStudents, color: 'text-violet-600' },
        ].map(stat => (
          <div key={stat.label} className="card-premium p-5 animate-fade-up">
            <div className={`text-2xl font-bold font-heading ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredTeachers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100/80 shadow-md">
          <Users className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-slate-700">Aucun enseignant</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">Aucun enseignant trouvé pour cette recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {filteredTeachers.map(teacher => (
            <div key={teacher.id} className="card-premium p-6 group animate-fade-up">
              <div className="flex items-start gap-4">
                <Avatar name={teacher.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{teacher.name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{teacher.specialite}</p>
                      {teacher.classeName && (
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 border border-indigo-100">
                          🏫 {teacher.classeName}
                        </span>
                      )}
                    </div>
                    <StatusBadge status={teacher.status} />
                  </div>


                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <BookOpen size={14} className="text-indigo-400 mx-auto mb-1" />
                  <div className="text-base font-bold text-slate-800">{teacher.coursCount}</div>
                  <div className="text-xs text-slate-400">Cours</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <Users size={14} className="text-emerald-400 mx-auto mb-1" />
                  <div className="text-base font-bold text-slate-800">{teacher.studentsCount}</div>
                  <div className="text-xs text-slate-400">Étudiants</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <Clock size={14} className="text-violet-400 mx-auto mb-1" />
                  <div className="text-base font-bold text-slate-800">{teacher.hoursPerWeek}h</div>
                  <div className="text-xs text-slate-400">/semaine</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400 flex-1 truncate">{teacher.email}</span>
                <a
                  href={`mailto:${teacher.email}`}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Envoyer un e-mail"
                >
                  <Mail size={14} />
                </a>
                <button
                  onClick={() => handleDelete(teacher.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setSelectedTeacherForProfile(teacher)}
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 px-3 py-1.5 bg-indigo-50 rounded-lg transition-colors"
                >
                  Voir profil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-up animate-duration-300">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Ajouter un enseignant</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Dr. Konan Kouadio Jules"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adresse Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ex: jules.konan@univ.ci"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Spécialité / Discipline</label>
                <input
                  type="text"
                  value={specialite}
                  onChange={e => setSpecialite(e.target.value)}
                  placeholder="ex: Algorithmique, Intelligence Artificielle"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Heures d'enseignement hebdomadaires</label>
                <input
                  type="number"
                  value={hoursPerWeek}
                  onChange={e => setHoursPerWeek(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Classe affectée (Optionnel)</label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Aucune classe assignée</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.filiere})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                <Plus size={16} />
                Enregistrer l'enseignant
              </button>
            </form>
          </div>
        </div>
      )}

      {importModalOpen && (
        <ImportModal
          type="teacher"
          onClose={() => setImportModalOpen(false)}
          onImport={handleImportTeachers}
        />
      )}

      <TeacherProfileModal
        isOpen={selectedTeacherForProfile !== null}
        onClose={() => setSelectedTeacherForProfile(null)}
        teacher={selectedTeacherForProfile}
      />

      {/* Credentials Modal */}
      {generatedCreds && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-6 mx-auto">
              <CheckCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Compte créé avec succès</h3>
            <p className="text-center text-slate-500 text-sm mb-6">
              Les identifiants temporaires ont été générés. Ils expireront dans 7 jours. Veuillez les transmettre à l'enseignant.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <UserPlus size={16} className="text-indigo-600" /> Accès Enseignant
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center"><span className="text-slate-500">Nom :</span><span className="font-medium text-slate-800">{generatedCreds.teacherName}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">Email :</span><span className="font-medium text-slate-800">{generatedCreds.teacherEmail}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500">Mot de passe provisoire :</span><span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{generatedCreds.tempTeacherPassword}</span></div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  const text = `Accès Enseignant\nNom : ${generatedCreds.teacherName}\nEmail : ${generatedCreds.teacherEmail}\nMot de passe provisoire : ${generatedCreds.tempTeacherPassword}`;
                  
                  const fallbackCopyTextToClipboard = (text: string) => {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.top = "0";
                    textArea.style.left = "0";
                    textArea.style.position = "fixed";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                      const successful = document.execCommand('copy');
                      if (successful) ToastSuccess("Identifiants copiés dans le presse-papier");
                      else ToastError("Échec de la copie");
                    } catch (err) {
                      ToastError("Échec de la copie");
                    }
                    document.body.removeChild(textArea);
                  };

                  if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(() => {
                      ToastSuccess("Identifiants copiés dans le presse-papier");
                    }).catch(() => {
                      fallbackCopyTextToClipboard(text);
                    });
                  } else {
                    fallbackCopyTextToClipboard(text);
                  }
                }}
                className="w-full py-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={16} /> Copier
              </button>
              <button
                onClick={() => setGeneratedCreds(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

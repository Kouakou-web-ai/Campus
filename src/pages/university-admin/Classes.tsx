import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { Users, GraduationCap, Plus, Trash2, ShieldAlert, Library, X, RefreshCw } from 'lucide-react';
import type { Class } from '../../types';

export default function Classes() {
  const { user } = useAuthStore();
  const { classes, students, teachers, updateTeacher, addClass, deleteClass, loading } = useRealtimeDataStore();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');

  // Modal states for creating a new class
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassFiliere, setNewClassFiliere] = useState('');
  const [newClassAnnee, setNewClassAnnee] = useState(1);

  // Modal states for assigning a teacher
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Modal states for replacing a teacher
  const [showReplaceTeacherModal, setShowReplaceTeacherModal] = useState(false);
  const [teacherToReplaceId, setTeacherToReplaceId] = useState('');
  const [replacementTeacherId, setReplacementTeacherId] = useState('');

  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Filter students and teachers of the selected class
  const classStudents = students.filter(s => s.classeId === selectedClassId);
  const classTeachers = teachers.filter(t => t.classeId === selectedClassId);

  // Teachers not in this class to select for assignment
  const availableTeachers = teachers.filter(t => t.classeId !== selectedClassId);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId) return;
    if (!newClassName.trim() || !newClassFiliere.trim()) {
      ToastError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      await addClass(user.universityId, {
        name: newClassName.trim(),
        filiere: newClassFiliere.trim(),
        annee: Number(newClassAnnee),
      });
      ToastSuccess("Classe créée avec succès !");
      setShowAddClassModal(false);
      setNewClassName('');
      setNewClassFiliere('');
      setNewClassAnnee(1);
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de la création de la classe.");
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!user?.universityId) return;
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ? Cette action détachera également tous les étudiants et enseignants de cette classe.")) {
      try {
        // 1. Detach teachers
        const classTeachersToDetach = teachers.filter(t => t.classeId === classId);
        for (const t of classTeachersToDetach) {
          await updateTeacher(user.universityId, t.id, { classeId: '', classeName: '' });
        }
        
        // 2. Delete Class node
        await deleteClass(user.universityId, classId);
        
        ToastSuccess("Classe supprimée avec succès.");
        if (selectedClassId === classId) {
          setSelectedClassId(null);
        }
      } catch (err: any) {
        console.error(err);
        ToastError("Erreur lors de la suppression de la classe.");
      }
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId || !selectedClassId || !selectedClass) return;
    if (!selectedTeacherId) {
      ToastError("Veuillez sélectionner un enseignant.");
      return;
    }

    const teacher = teachers.find(t => t.id === selectedTeacherId);
    if (!teacher) return;

    try {
      await updateTeacher(user.universityId, selectedTeacherId, {
        classeId: selectedClassId,
        classeName: selectedClass.name,
      });
      ToastSuccess(`Enseignant ${teacher.name} affecté à la classe ${selectedClass.name}.`);
      setShowAssignTeacherModal(false);
      setSelectedTeacherId('');
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de l'affectation de l'enseignant.");
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!user?.universityId || !selectedClass) return;
    if (window.confirm(`Détacher cet enseignant de la classe ${selectedClass.name} ?`)) {
      try {
        await updateTeacher(user.universityId, teacherId, {
          classeId: '',
          classeName: '',
        });
        ToastSuccess("Enseignant détaché de la classe avec succès.");
      } catch (err: any) {
        console.error(err);
        ToastError("Erreur lors du détachement de l'enseignant.");
      }
    }
  };

  const handleReplaceTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.universityId || !selectedClassId || !selectedClass || !teacherToReplaceId || !replacementTeacherId) return;

    const oldTeacher = teachers.find(t => t.id === teacherToReplaceId);
    const newTeacher = teachers.find(t => t.id === replacementTeacherId);
    if (!oldTeacher || !newTeacher) return;

    try {
      // 1. Detach old teacher
      await updateTeacher(user.universityId, teacherToReplaceId, {
        classeId: '',
        classeName: '',
      });
      // 2. Attach new teacher
      await updateTeacher(user.universityId, replacementTeacherId, {
        classeId: selectedClassId,
        classeName: selectedClass.name,
      });

      ToastSuccess(`Remplacement réussi : ${newTeacher.name} remplace ${oldTeacher.name}.`);
      setShowReplaceTeacherModal(false);
      setTeacherToReplaceId('');
      setReplacementTeacherId('');
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors du remplacement de l'enseignant.");
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
        title="Gestion des Classes"
        description="Consultez les effectifs par classe et gérez les affectations des enseignants."
        breadcrumbs={[{ label: 'Administration' }, { label: 'Classes' }]}
        actions={
          <button
            onClick={() => setShowAddClassModal(true)}
            className="btn btn-primary rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
          >
            <Plus size={16} /> Nouvelle Classe
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Classes List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Classes ({classes.length})</h3>
          {classes.length === 0 ? (
            <div className="card-premium p-8 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <Library className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={36} />
              <p className="text-slate-400 text-sm">Aucune classe enregistrée pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((cls) => {
                const isActive = selectedClassId === cls.id;
                const studCount = students.filter(s => s.classeId === cls.id).length;
                const teachCount = teachers.filter(t => t.classeId === cls.id).length;
                
                return (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`card-premium p-4 cursor-pointer transition-all duration-200 border flex items-center justify-between group ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20'
                        : 'border-slate-100 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight flex items-center gap-2">
                        🏫 {cls.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        Filière : {cls.filiere} · Année {cls.annee}
                      </p>
                      <div className="flex gap-3 mt-2">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                          <Users size={10} /> {studCount} élèves
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <GraduationCap size={10} /> {teachCount} profs
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(cls.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer la classe"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Class Details View */}
        <div className="lg:col-span-2">
          {selectedClass ? (
            <div className="card-premium p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <span className="inline-block bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                    Classe Sélectionnée
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🏫 {selectedClass.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Filière : {selectedClass.filiere} · Niveau d'année : {selectedClass.annee}
                  </p>
                </div>
                
                {activeTab === 'teachers' && (
                  <button
                    onClick={() => setShowAssignTeacherModal(true)}
                    className="btn btn-sm btn-outline border-indigo-200 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl"
                  >
                    <Plus size={14} /> Affecter Enseignant
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 text-sm font-semibold">
                <button
                  onClick={() => setActiveTab('students')}
                  className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'students'
                      ? 'border-indigo-50 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Users size={16} /> Étudiants ({classStudents.length})
                </button>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === 'teachers'
                      ? 'border-indigo-50 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <GraduationCap size={16} /> Enseignants Affectés ({classTeachers.length})
                </button>
              </div>

              {/* Tab content */}
              {activeTab === 'students' ? (
                <div className="space-y-4">
                  {classStudents.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <Users className="mx-auto text-slate-350 dark:text-slate-700 mb-2" size={32} />
                      <p className="text-slate-400 text-xs font-medium">Aucun étudiant assigné à cette classe.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Nom complet</th>
                            <th>Matricule</th>
                            <th>Email</th>
                            <th className="text-center">Statut</th>
                            <th className="text-right">Moyenne</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classStudents.map((stud) => (
                            <tr key={stud.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="avatar placeholder">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      <span className="text-xs font-bold">{stud.name.charAt(0)}</span>
                                    </div>
                                  </div>
                                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{stud.name}</span>
                                </div>
                              </td>
                              <td className="font-mono text-xs text-slate-500">{stud.studentId}</td>
                              <td className="text-xs text-slate-400">{stud.email}</td>
                              <td className="text-center">
                                <span className={`badge badge-xs text-[10px] font-bold py-1 px-2 ${
                                  stud.status === 'actif' ? 'badge-success text-white' : 'badge-ghost text-slate-400'
                                }`}>
                                  {stud.status}
                                </span>
                              </td>
                              <td className="text-right font-bold text-xs text-indigo-600 dark:text-indigo-400">{stud.average || '—'}/20</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {classTeachers.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <GraduationCap className="mx-auto text-slate-350 dark:text-slate-700 mb-2" size={32} />
                      <p className="text-slate-400 text-xs font-medium">Aucun enseignant affecté à cette classe.</p>
                      <button
                        onClick={() => setShowAssignTeacherModal(true)}
                        className="btn btn-xs btn-primary rounded-lg mt-3"
                      >
                        Affecter un enseignant
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {classTeachers.map((teach) => (
                        <div key={teach.id} className="card-premium p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                              <GraduationCap size={20} />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-950 dark:text-white text-sm leading-tight">{teach.name}</h5>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">📚 {teach.specialite}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{teach.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setTeacherToReplaceId(teach.id);
                                setShowReplaceTeacherModal(true);
                              }}
                              className="btn btn-ghost btn-xs text-indigo-650 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 rounded-lg flex items-center gap-1"
                              title="Remplacer cet enseignant"
                            >
                              <RefreshCw size={12} /> Remplacer
                            </button>
                            <button
                              onClick={() => handleRemoveTeacher(teach.id)}
                              className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                              title="Détacher de la classe"
                            >
                              Retirer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card-premium p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <Library className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Sélectionnez une classe</h4>
              <p className="text-slate-400 text-xs mt-1">
                Choisissez une classe dans la liste latérale pour afficher et gérer son effectif et ses affectations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Class */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setShowAddClassModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Library className="text-indigo-500" size={20} />
              Créer une nouvelle Classe
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Ajoutez une classe académique à votre établissement.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nom de la classe</label>
                <input
                  type="text"
                  placeholder="Ex: Licence 3 Informatique"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  required
                  className="input input-bordered input-sm w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filière d'enseignement</label>
                <input
                  type="text"
                  placeholder="Ex: Informatique"
                  value={newClassFiliere}
                  onChange={(e) => setNewClassFiliere(e.target.value)}
                  required
                  className="input input-bordered input-sm w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Année académique (ex: 1, 2, 3)</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={newClassAnnee}
                  onChange={(e) => setNewClassAnnee(Number(e.target.value))}
                  required
                  className="input input-bordered input-sm w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm h-10 rounded-xl"
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="btn btn-sm btn-ghost rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary rounded-xl px-4"
                >
                  Créer la classe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Teacher */}
      {showAssignTeacherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => setShowAssignTeacherModal(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <GraduationCap className="text-indigo-500" size={20} />
              Affecter un Enseignant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Sélectionnez un enseignant à affecter à la classe <strong>{selectedClass?.name}</strong>.
            </p>

            <form onSubmit={handleAssignTeacher} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enseignant & Spécialité</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  required
                  className="select select-bordered select-sm w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm h-10 rounded-xl"
                >
                  <option value="">Sélectionnez un enseignant...</option>
                  {availableTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      👨‍🏫 {t.name} ({t.specialite})
                    </option>
                  ))}
                </select>
              </div>

              {availableTeachers.length === 0 && (
                <p className="text-[10px] text-amber-500 flex items-center gap-1 font-semibold">
                  <ShieldAlert size={12} /> Tous les enseignants de l'université sont déjà affectés à cette classe !
                </p>
              )}

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignTeacherModal(false)}
                  className="btn btn-sm btn-ghost rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={availableTeachers.length === 0}
                  className="btn btn-sm btn-primary rounded-xl px-4"
                >
                  Affecter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Replace Teacher */}
      {showReplaceTeacherModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => {
                setShowReplaceTeacherModal(false);
                setTeacherToReplaceId('');
                setReplacementTeacherId('');
              }}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <RefreshCw className="text-indigo-500" size={20} />
              Remplacer un Enseignant
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Sélectionnez un enseignant remplaçant pour la classe <strong>{selectedClass?.name}</strong>.
            </p>

            <form onSubmit={handleReplaceTeacher} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nouvel Enseignant & Spécialité</label>
                <select
                  value={replacementTeacherId}
                  onChange={(e) => setReplacementTeacherId(e.target.value)}
                  required
                  className="select select-bordered select-sm w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm h-10 rounded-xl"
                >
                  <option value="">Sélectionnez un remplaçant...</option>
                  {availableTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      👨‍🏫 {t.name} ({t.specialite})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplaceTeacherModal(false);
                    setTeacherToReplaceId('');
                    setReplacementTeacherId('');
                  }}
                  className="btn btn-sm btn-ghost rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={availableTeachers.length === 0}
                  className="btn btn-sm btn-primary rounded-xl px-4"
                >
                  Remplacer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

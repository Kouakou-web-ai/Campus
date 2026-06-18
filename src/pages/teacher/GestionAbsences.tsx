import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, AlertTriangle, Check, X } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { Avatar } from '../../components/ui/AvatarGroup';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { db } from '../../../firebase-config';
import { ref, onValue, set } from 'firebase/database';

export default function GestionAbsences() {
  const { user } = useAuthStore();
  const { courses, students, updateStudent, addSimulatedEmail, loading } = useRealtimeDataStore();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [reportingStudentId, setReportingStudentId] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Calls for today
  const [appels, setAppels] = useState<Record<string, { status: 'present' | 'absent_justifie' | 'absent_non_justifie', updatedAt: string }>>({});

  const myCourses = courses.filter((c) => c.teacherId === user?.id);

  // Initialize selected course when courses load
  useEffect(() => {
    if (myCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(myCourses[0].id);
    }
  }, [myCourses, selectedCourseId]);

  // Subscribe to today's call data
  useEffect(() => {
    if (!user?.universityId || !selectedCourseId) return;
    const dateKey = new Date().toISOString().split('T')[0];
    const appelsRef = ref(db, `universites/${user.universityId}/appels/${selectedCourseId}/${dateKey}`);
    const unsub = onValue(appelsRef, (snapshot) => {
      setAppels(snapshot.val() || {});
    });
    return () => unsub();
  }, [user?.universityId, selectedCourseId]);

  const course = myCourses.find((c) => c.id === selectedCourseId);
  // Filter students by course's filiere
  const courseStudents = course ? students.filter((s) => s.filiere === course.filiere) : [];

  const handleMarkPresent = async (studentId: string) => {
    const universityId = user?.universityId;
    if (!universityId || !selectedCourseId) return;

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const dateKey = new Date().toISOString().split('T')[0];
    const prevStatus = appels[studentId]?.status;

    // If already present, do nothing
    if (prevStatus === 'present') return;

    setReportingStudentId(studentId);
    try {
      // If student was previously marked absent non justifié, we decrement their cumulative count
      if (prevStatus === 'absent_non_justifie') {
        const currentAbsences = student.absences || 0;
        const newAbsences = Math.max(0, currentAbsences - 1);
        await updateStudent(universityId, studentId, { absences: newAbsences });
      }

      // Update call status in Firebase
      const callRef = ref(db, `universites/${universityId}/appels/${selectedCourseId}/${dateKey}/${studentId}`);
      await set(callRef, {
        status: 'present',
        updatedAt: new Date().toISOString()
      });

      ToastSuccess(`${student.name} marqué(e) présent(e).`);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors du marquage.");
    } finally {
      setReportingStudentId(null);
    }
  };

  const handleMarkAbsent = async (studentId: string, type: 'justifie' | 'non_justifie') => {
    const universityId = user?.universityId;
    if (!universityId || !selectedCourseId) return;

    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const dateKey = new Date().toISOString().split('T')[0];
    const prevStatus = appels[studentId]?.status;
    const isJustified = type === 'justifie';
    const newStatus = isJustified ? 'absent_justifie' : 'absent_non_justifie';

    // If same status, do nothing
    if (prevStatus === newStatus) {
      setModalOpen(false);
      setActiveStudentId(null);
      return;
    }

    setReportingStudentId(studentId);
    try {
      let currentAbsences = student.absences || 0;
      let newAbsences = currentAbsences;

      if (prevStatus === 'absent_non_justifie' && isJustified) {
        // transitioning from non_justified to justified -> decrement
        newAbsences = Math.max(0, currentAbsences - 1);
      } else if (prevStatus !== 'absent_non_justifie' && !isJustified) {
        // transitioning from something else to non_justified -> increment
        newAbsences = currentAbsences + 1;
      }

      if (newAbsences !== currentAbsences) {
        await updateStudent(universityId, studentId, { absences: newAbsences });
      }

      // Update call status in Firebase
      const callRef = ref(db, `universites/${universityId}/appels/${selectedCourseId}/${dateKey}/${studentId}`);
      await set(callRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Send email simulation
      const parentEmail = `parent.${student.email}`;
      if (isJustified) {
        await addSimulatedEmail(universityId, {
          to: parentEmail,
          recipientName: `Parent de ${student.name}`,
          subject: `⚠️ Absence Justifiée : ${student.name} — ${course?.title || 'Cours'}`,
          body: `Bonjour,\n\nNous vous informons que l'absence de votre enfant ${student.name} au cours de "${course?.title || 'Cours'}" (${course?.code || 'CODE'}) aujourd'hui, le ${new Date().toLocaleDateString('fr-FR')}, a été notée comme JUSTIFIÉE par l'enseignant M./Mme ${user?.name || 'Enseignant'}.\n\nTotal des absences cumulées : ${newAbsences} absence(s).\n\nCordialement,\nLe Secrétariat Académique`,
          type: 'absence'
        });
        ToastSuccess(`Absence justifiée notée pour ${student.name}. Parent notifié.`);
      } else {
        await addSimulatedEmail(universityId, {
          to: parentEmail,
          recipientName: `Parent de ${student.name}`,
          subject: `⚠️ Alerte Absence Non Justifiée : ${student.name} — ${course?.title || 'Cours'}`,
          body: `Bonjour,\n\nNous vous informons que votre enfant ${student.name} a été signalé ABSENT (NON JUSTIFIÉ) au cours de "${course?.title || 'Cours'}" (${course?.code || 'CODE'}) aujourd'hui, le ${new Date().toLocaleDateString('fr-FR')} par l'enseignant M./Mme ${user?.name || 'Enseignant'}.\n\nTotal des absences cumulées : ${newAbsences} absence(s).\n\nPour toute contestation, veuillez contacter le secrétariat académique.\n\nCordialement,\nLe Secrétariat Académique`,
          type: 'absence'
        });
        ToastSuccess(`Absence non justifiée notée pour ${student.name}. Parent alerté.`);
      }
    } catch (err: any) {
      ToastError(err.message || "Erreur lors du marquage.");
    } finally {
      setReportingStudentId(null);
      setModalOpen(false);
      setActiveStudentId(null);
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
        title="Feuille d'appel"
        description="Enregistrez les présences et absences des étudiants en temps réel pour chaque cours."
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Feuille d\'appel' }]}
      />

      {myCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-md">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-slate-700">Aucun cours assigné</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto mt-1">
            Les cours configurés par l'administration apparaîtront ici.
          </p>
        </div>
      ) : (
        <>
          {/* Course Selector */}
          <div className="card-premium p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm font-semibold text-slate-600 flex-shrink-0">Cours :</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="input-premium flex-1 md:w-64 px-3 py-2 text-sm"
              >
                {myCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title} ({c.filiere})
                  </option>
                ))}
              </select>
            </div>
            {course && (
              <div className="md:ml-auto flex items-center gap-2 text-xs md:text-sm text-slate-500">
                <span>Filière : <strong className="text-slate-800">{course.filiere}</strong></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-1" />
                <span>Effectif : <strong className="text-indigo-650">{courseStudents.length} étudiants</strong></span>
              </div>
            )}
          </div>

          {courseStudents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <p className="text-slate-400 text-sm">Aucun étudiant inscrit dans cette filière.</p>
            </div>
          ) : (
            <div className="card-premium overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-base font-semibold text-slate-800">Appel du jour — {new Date().toLocaleDateString('fr-FR')}</h3>
                <span className="text-xs font-medium text-slate-400">Présence obligatoire</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-premium">
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Matricule</th>
                      <th className="text-center">Absences cumulées</th>
                      <th className="text-center">Présence aujourd'hui</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStudents.map((student) => {
                      const totalAbsences = student.absences || 0;
                      const studentAppel = appels[student.id];
                      const status = studentAppel?.status;

                      return (
                        <tr key={student.id}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <Avatar name={student.name} size="sm" />
                              <span className="font-medium text-slate-800 text-sm">{student.name}</span>
                            </div>
                          </td>
                          <td className="font-mono text-xs text-slate-500">{student.studentId}</td>
                          <td className="text-center font-bold text-sm text-slate-700">
                            {totalAbsences}
                          </td>
                          <td className="text-center">
                            {status === 'present' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <Check size={10} /> Présent
                              </span>
                            ) : status === 'absent_justifie' ? (
                              <span className="inline-flex items-center justify-center font-bold text-xs h-6 w-6 rounded-full bg-amber-100 text-amber-700 border border-amber-250 shadow-sm" title="Absent Justifié (j)">
                                j
                              </span>
                            ) : status === 'absent_non_justifie' ? (
                              <span className="inline-flex items-center justify-center font-bold text-xs h-6 w-6 rounded-full bg-rose-100 text-rose-700 border border-rose-250 shadow-sm" title="Absent Non Justifié (n)">
                                n
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Non marqué</span>
                            )}
                          </td>
                          <td className="text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleMarkPresent(student.id)}
                                disabled={reportingStudentId !== null}
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                                  status === 'present'
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                                }`}
                              >
                                {reportingStudentId === student.id && status === undefined ? (
                                  <span className="loading loading-spinner loading-xs" />
                                ) : (
                                  <>
                                    <Check size={12} />
                                    Présent
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  setActiveStudentId(student.id);
                                  setModalOpen(true);
                                }}
                                disabled={reportingStudentId !== null}
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 ${
                                  status === 'absent_justifie' || status === 'absent_non_justifie'
                                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                                    : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                                }`}
                              >
                                <X size={12} />
                                Absent
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modale de justification d'absence */}
      {modalOpen && activeStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-100 shadow-2xl relative animate-fade-up">
            <button
              onClick={() => {
                setModalOpen(false);
                setActiveStudentId(null);
              }}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4 animate-bounce">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Signaler une absence</h3>
              <p className="text-slate-500 text-sm mb-6">
                Veuillez indiquer si l'absence de <strong className="text-slate-700">{students.find(s => s.id === activeStudentId)?.name}</strong> est justifiée ou non.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleMarkAbsent(activeStudentId, 'justifie')}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="bg-white/20 text-white font-bold h-5 w-5 rounded-full flex items-center justify-center text-xs font-mono">j</span>
                  Absence Justifiée
                </button>
                <button
                  onClick={() => handleMarkAbsent(activeStudentId, 'non_justifie')}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-all active:scale-98 shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="bg-white/20 text-white font-bold h-5 w-5 rounded-full flex items-center justify-center text-xs font-mono">n</span>
                  Absence Non Justifiée
                </button>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setActiveStudentId(null);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-sm transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

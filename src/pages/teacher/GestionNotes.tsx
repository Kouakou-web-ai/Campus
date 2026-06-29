import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import ChartCard from '../../components/ui/ChartCard';
import { Avatar } from '../../components/ui/AvatarGroup';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { Check, Download, Send, BookOpen } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

export default function GestionNotes() {
  const { user } = useAuthStore();
  const { courses, students, grades, addGrade, updateGrade, addSimulatedEmail, loading } = useRealtimeDataStore();
  const [selectedCourse, setSelectedCourse] = useState('');
  
  const myCourses = courses.filter(c => c.teacherId === user?.id);

  // Local state for editing grades
  // Maps studentId -> { gradeId?: string, note?: number, appreciation?: string, submitted: boolean }
  const [localGrades, setLocalGrades] = useState<Record<string, { gradeId?: string; note?: number; appreciation?: string; submitted: boolean }>>({});
  const [saved, setSaved] = useState(false);

  // Initialize selected course when courses load
  useEffect(() => {
    if (myCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(myCourses[0].id);
    }
  }, [myCourses, selectedCourse]);

  const course = myCourses.find(c => c.id === selectedCourse);
  const courseStudents = useMemo(() => {
    return course ? students.filter(s => s.filiere === course.filiere) : [];
  }, [course, students]);

  // Load existing grades into local state when selected course or grades list change
  useEffect(() => {
    if (!selectedCourse) return;
    
    const initialMap: typeof localGrades = {};
    
    // Default: every student has no grade
    courseStudents.forEach(s => {
      initialMap[s.id] = {
        note: undefined,
        appreciation: '',
        submitted: false
      };
    });

    // Populate with existing grades from the database
    grades.forEach(g => {
      if (g.courseId === selectedCourse) {
        initialMap[g.studentId] = {
          gradeId: g.id,
          note: g.note,
          appreciation: g.appreciation || '',
          submitted: g.submitted
        };
      }
    });

    setLocalGrades(initialMap);
    setSaved(false);
  }, [selectedCourse, grades, courseStudents]);

  const updateNote = (studentId: string, noteStr: string) => {
    const val = noteStr === '' ? undefined : parseFloat(noteStr);
    setLocalGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note: val !== undefined && !isNaN(val) ? Math.min(20, Math.max(0, val)) : undefined
      }
    }));
    setSaved(false);
  };

  const updateAppreciation = (studentId: string, appreciation: string) => {
    setLocalGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        appreciation
      }
    }));
    setSaved(false);
  };

  const handlePublishGrades = async () => {
    const universityId = user?.universityId;
    if (!universityId || !selectedCourse) return;
    
    try {
      const promises = Object.keys(localGrades).map(async (studentId) => {
        const local = localGrades[studentId];
        const student = students.find(s => s.id === studentId);
        if (!student) return;

        // Skip if no note entered
        if (local.note === undefined) return;

        if (local.gradeId) {
          // Update existing
          await updateGrade(universityId, local.gradeId, {
            note: local.note,
            appreciation: local.appreciation,
            submitted: true
          });
        } else {
          // Create new
          await addGrade(universityId, {
            studentId,
            studentName: student.name,
            courseId: selectedCourse,
            note: local.note,
            appreciation: local.appreciation,
            submitted: true
          });
        }

        // Pousser email simulé
        await addSimulatedEmail(universityId, {
          to: student.email,
          recipientName: student.name,
          subject: `Nouvelle note publiée : ${course?.title || 'Cours'}`,
          body: `Bonjour ${student.name},\n\nNous vous informons que votre note pour le cours de "${course?.title || 'Cours'}" (${course?.code || 'CODE'}) a été publiée par votre enseignant M./Mme ${course?.teacher || 'Enseignant'}.\n\nNote obtenue : ${local.note}/20\nAppréciation : ${local.appreciation || 'Non spécifiée'}\n\nVous pouvez vous connecter à votre portail CAMPUS pour voir l'historique complet.\n\nCordialement,\nLe Secrétariat Académique`,
          type: 'grade'
        });
      });

      await Promise.all(promises);

      // Notification globale (simulée pour les étudiants)
      useNotificationStore.getState().addNotification(
        "Nouvelle note publiée",
        `Le professeur ${user?.name} a publié les notes pour le cours de ${course?.title}. Vous pouvez consulter vos résultats dans votre espace.`,
        "success"
      );

      ToastSuccess("Notes publiées avec succès !");
      setSaved(true);
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de la publication.");
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  // Calculate statistics
  const enteredGrades = Object.values(localGrades).filter(lg => lg.note !== undefined);
  const avg = enteredGrades.length > 0
    ? (enteredGrades.reduce((sum, lg) => sum + (lg.note ?? 0), 0) / enteredGrades.length).toFixed(1)
    : '—';

  // Compute distribution
  const getDistributionData = () => {
    const ranges = [
      { range: '0-5', count: 0, color: '#ef4444' },
      { range: '5-9', count: 0, color: '#f97316' },
      { range: '10-12', count: 0, color: '#f59e0b' },
      { range: '13-15', count: 0, color: '#84cc16' },
      { range: '16-18', count: 0, color: '#10b981' },
      { range: '19-20', count: 0, color: '#6366f1' },
    ];

    enteredGrades.forEach(g => {
      const n = g.note ?? 0;
      if (n < 5) ranges[0].count++;
      else if (n < 10) ranges[1].count++;
      else if (n < 13) ranges[2].count++;
      else if (n < 16) ranges[3].count++;
      else if (n < 19) ranges[4].count++;
      else ranges[5].count++;
    });

    return ranges;
  };

  const distData = getDistributionData();

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Gestion des notes"
        description="Saisie et publication des évaluations en temps réel"
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Notes' }]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
              <Download size={14} /> Exporter
            </button>
            <button
              onClick={handlePublishGrades}
              disabled={enteredGrades.length === 0}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full font-semibold transition-all ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'btn-gradient text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {saved ? <><Check size={14} /> Enregistré</> : <><Send size={14} /> Publier les notes</>}
            </button>
          </div>
        }
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
          {/* Course selector */}
          <div className="card-premium p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm font-semibold text-slate-600 flex-shrink-0">Cours :</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="input-premium flex-1 md:w-64 px-3 py-2 text-sm"
              >
                {myCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                ))}
              </select>
            </div>
            {course && (
              <div className="md:ml-auto flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-500">
                <span>Moyenne classe : <strong className="text-indigo-600">{avg}/20</strong></span>
                <span>Évalués : <strong className="text-slate-800">{enteredGrades.length}/{courseStudents.length}</strong></span>
              </div>
            )}
          </div>

          {courseStudents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
              <p className="text-slate-400 text-sm">Aucun étudiant inscrit dans cette filière pour saisir des notes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Table notes */}
              <div className="lg:col-span-2 card-premium overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-800">Notes étudiants</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-premium">
                    <thead>
                      <tr>
                        <th>Étudiant</th>
                        <th className="text-center w-24">Note /20</th>
                        <th>Appréciation</th>
                        <th className="text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStudents.map(student => {
                        const local = localGrades[student.id] || { note: undefined, appreciation: '', submitted: false };
                        return (
                          <tr key={student.id}>
                            <td>
                              <div className="flex items-center gap-2.5">
                                <Avatar name={student.name} size="sm" />
                                <div>
                                  <p className="font-medium text-slate-800 text-sm">{student.name}</p>
                                  <p className="text-[10px] text-slate-400">{student.studentId}</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={0.5}
                                value={local.note !== undefined ? local.note : ''}
                                onChange={e => updateNote(student.id, e.target.value)}
                                placeholder="—"
                                className={`w-16 text-center input-premium py-1.5 text-sm font-bold ${
                                  local.note !== undefined
                                    ? local.note >= 14 ? 'text-emerald-600' : local.note >= 10 ? 'text-amber-600' : 'text-red-500'
                                    : 'text-slate-400'
                                }`}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                value={local.appreciation || ''}
                                onChange={e => updateAppreciation(student.id, e.target.value)}
                                placeholder="ex: Excellent travail"
                                className="w-full bg-slate-50 border-0 focus:bg-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 text-slate-700"
                              />
                            </td>
                            <td className="text-center">
                              {local.submitted ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                  <Check size={12} /> Publié
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Non publié</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Distribution */}
              <ChartCard title="Distribution des notes" subtitle="Répartition classe">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={distData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                    <Bar dataKey="count" name="Étudiants" radius={[4, 4, 0, 0]}>
                      {distData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-indigo-600">{avg}</div>
                    <div className="text-xs text-slate-400">Moyenne</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-emerald-600">
                      {enteredGrades.filter(g => (g.note ?? 0) >= 10).length}/{enteredGrades.length}
                    </div>
                    <div className="text-xs text-slate-400">Moyenne &gt;= 10</div>
                  </div>
                </div>
              </ChartCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
  const { courses, students, grades, addGrade, updateGrade, addSimulatedEmail, loading, teachers } = useRealtimeDataStore();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filterSemester, setFilterSemester] = useState<number | 'tous'>('tous');
  
  const myCourses = courses.filter(c => c.teacherId === user?.id && (filterSemester === 'tous' || c.semester === filterSemester));
  const teacherProfile = teachers.find(t => t.id === user?.id);

  // Local state for editing grades
  const [localGrades, setLocalGrades] = useState<Record<string, {
    gradeId?: string;
    classNotes: number[];
    examNotes: number[];
    note?: number;
    appreciation?: string;
    submitted: boolean;
  }>>({});
  const [saved, setSaved] = useState(false);

  // Initialize selected course when courses load
  useEffect(() => {
    if (myCourses.length > 0 && !selectedCourse) {
      setSelectedCourse(myCourses[0].id);
    }
  }, [myCourses, selectedCourse]);

  const course = myCourses.find(c => c.id === selectedCourse);
  const courseStudents = useMemo(() => {
    if (!course) return [];
    return students.filter(s => {
      if (course.classeId) {
        return s.classeId === course.classeId;
      }
      return teacherProfile?.classeId ? s.classeId === teacherProfile.classeId : s.filiere === course.filiere;
    });
  }, [course, students, teacherProfile?.classeId]);

  // Load existing grades into local state when selected course or grades list change
  useEffect(() => {
    if (!selectedCourse) return;
    
    const initialMap: typeof localGrades = {};
    
    // Default: every student has no grade
    courseStudents.forEach(s => {
      initialMap[s.id] = {
        classNotes: [],
        examNotes: [],
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
          classNotes: g.classNotes || (g.classNote !== undefined ? [g.classNote] : []),
          examNotes: g.examNotes || (g.examNote !== undefined ? [g.examNote] : []),
          note: g.note,
          appreciation: g.appreciation || '',
          submitted: g.submitted
        };
      }
    });

    setLocalGrades(initialMap);
    setSaved(false);
  }, [selectedCourse, grades, courseStudents]);

  const calculateAutoAverage = (classNote?: number, examNote?: number) => {
    if (classNote === undefined && examNote === undefined) return undefined;
    const cNote = classNote ?? 10;
    const eNote = examNote ?? 10;
    return parseFloat((cNote * 0.4 + eNote * 0.6).toFixed(2));
  };

  const handleUpdateSpecificClassNote = (studentId: string, idx: number, valStr: string) => {
    const val = valStr === '' ? 0 : parseFloat(valStr);
    const checkedVal = !isNaN(val) ? Math.min(20, Math.max(0, val)) : 0;
    
    setLocalGrades(prev => {
      const current = prev[studentId] || { classNotes: [], examNotes: [], submitted: false, appreciation: '' };
      const nextClassNotes = [...(current.classNotes || [])];
      nextClassNotes[idx] = checkedVal;
      
      const classNoteAvg = nextClassNotes.length > 0 
        ? parseFloat((nextClassNotes.reduce((s, n) => s + n, 0) / nextClassNotes.length).toFixed(2)) 
        : undefined;
        
      const examNoteAvg = current.examNotes && current.examNotes.length > 0
        ? parseFloat((current.examNotes.reduce((s, n) => s + n, 0) / current.examNotes.length).toFixed(2))
        : undefined;
        
      const note = calculateAutoAverage(classNoteAvg, examNoteAvg);
      
      return {
        ...prev,
        [studentId]: {
          ...current,
          classNotes: nextClassNotes,
          note
        }
      };
    });
    setSaved(false);
  };

  const handleAddClassNotePlaceholder = (studentId: string) => {
    setLocalGrades(prev => {
      const current = prev[studentId] || { classNotes: [], examNotes: [], submitted: false, appreciation: '' };
      const nextClassNotes = [...(current.classNotes || []), 10]; // default to 10
      
      const classNoteAvg = parseFloat((nextClassNotes.reduce((s, n) => s + n, 0) / nextClassNotes.length).toFixed(2));
      const examNoteAvg = current.examNotes && current.examNotes.length > 0
        ? parseFloat((current.examNotes.reduce((s, n) => s + n, 0) / current.examNotes.length).toFixed(2))
        : undefined;
        
      const note = calculateAutoAverage(classNoteAvg, examNoteAvg);
      
      return {
        ...prev,
        [studentId]: {
          ...current,
          classNotes: nextClassNotes,
          note
        }
      };
    });
    setSaved(false);
  };

  const handleRemoveClassNote = (studentId: string, idx: number) => {
    setLocalGrades(prev => {
      const current = prev[studentId] || { classNotes: [], examNotes: [], submitted: false, appreciation: '' };
      const nextClassNotes = (current.classNotes || []).filter((_, i) => i !== idx);
      
      const classNoteAvg = nextClassNotes.length > 0 
        ? parseFloat((nextClassNotes.reduce((s, n) => s + n, 0) / nextClassNotes.length).toFixed(2)) 
        : undefined;
        
      const examNoteAvg = current.examNotes && current.examNotes.length > 0
        ? parseFloat((current.examNotes.reduce((s, n) => s + n, 0) / current.examNotes.length).toFixed(2))
        : undefined;
        
      const note = calculateAutoAverage(classNoteAvg, examNoteAvg);
      
      return {
        ...prev,
        [studentId]: {
          ...current,
          classNotes: nextClassNotes,
          note
        }
      };
    });
    setSaved(false);
  };

  const handleUpdateSpecificExamNote = (studentId: string, idx: number, valStr: string) => {
    const val = valStr === '' ? 0 : parseFloat(valStr);
    const checkedVal = !isNaN(val) ? Math.min(20, Math.max(0, val)) : 0;
    
    setLocalGrades(prev => {
      const current = prev[studentId] || { classNotes: [], examNotes: [], submitted: false, appreciation: '' };
      const nextExamNotes = [...(current.examNotes || [])];
      nextExamNotes[idx] = checkedVal;
      
      const classNoteAvg = current.classNotes && current.classNotes.length > 0
        ? parseFloat((current.classNotes.reduce((s, n) => s + n, 0) / current.classNotes.length).toFixed(2))
        : undefined;
        
      const examNoteAvg = nextExamNotes.length > 0
        ? parseFloat((nextExamNotes.reduce((s, n) => s + n, 0) / nextExamNotes.length).toFixed(2))
        : undefined;
        
      const note = calculateAutoAverage(classNoteAvg, examNoteAvg);
      
      return {
        ...prev,
        [studentId]: {
          ...current,
          examNotes: nextExamNotes,
          note
        }
      };
    });
    setSaved(false);
  };

  const handleAddExamNotePlaceholder = (studentId: string) => {
    setLocalGrades(prev => {
      const current = prev[studentId] || { classNotes: [], examNotes: [], submitted: false, appreciation: '' };
      const nextExamNotes = [...(current.examNotes || []), 10]; // default to 10
      
      const classNoteAvg = current.classNotes && current.classNotes.length > 0
        ? parseFloat((current.classNotes.reduce((s, n) => s + n, 0) / current.classNotes.length).toFixed(2))
        : undefined;
        
      const examNoteAvg = parseFloat((nextExamNotes.reduce((s, n) => s + n, 0) / nextExamNotes.length).toFixed(2));
      const note = calculateAutoAverage(classNoteAvg, examNoteAvg);
      
      return {
        ...prev,
        [studentId]: {
          ...current,
          examNotes: nextExamNotes,
          note
        }
      };
    });
    setSaved(false);
  };

  const handleRemoveExamNote = (studentId: string, idx: number) => {
    setLocalGrades(prev => {
      const current = prev[studentId] || { classNotes: [], examNotes: [], submitted: false, appreciation: '' };
      const nextExamNotes = (current.examNotes || []).filter((_, i) => i !== idx);
      
      const classNoteAvg = current.classNotes && current.classNotes.length > 0
        ? parseFloat((current.classNotes.reduce((s, n) => s + n, 0) / current.classNotes.length).toFixed(2))
        : undefined;
        
      const examNoteAvg = nextExamNotes.length > 0
        ? parseFloat((nextExamNotes.reduce((s, n) => s + n, 0) / nextExamNotes.length).toFixed(2))
        : undefined;
        
      const note = calculateAutoAverage(classNoteAvg, examNoteAvg);
      
      return {
        ...prev,
        [studentId]: {
          ...current,
          examNotes: nextExamNotes,
          note
        }
      };
    });
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

        // Calculate averages for storage
        const classNoteAvg = local.classNotes && local.classNotes.length > 0
          ? parseFloat((local.classNotes.reduce((s, n) => s + n, 0) / local.classNotes.length).toFixed(2))
          : undefined;
        const examNoteAvg = local.examNotes && local.examNotes.length > 0
          ? parseFloat((local.examNotes.reduce((s, n) => s + n, 0) / local.examNotes.length).toFixed(2))
          : undefined;

        if (local.gradeId) {
          // Update existing
          await updateGrade(universityId, local.gradeId, {
            classNotes: local.classNotes,
            examNotes: local.examNotes,
            classNote: classNoteAvg,
            examNote: examNoteAvg,
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
            classNotes: local.classNotes,
            examNotes: local.examNotes,
            classNote: classNoteAvg,
            examNote: examNoteAvg,
            note: local.note,
            appreciation: local.appreciation,
            submitted: true
          });
        }

        const classNoteText = classNoteAvg !== undefined ? `${classNoteAvg}/20` : 'Non spécifiée';
        const examNoteText = examNoteAvg !== undefined ? `${examNoteAvg}/20` : 'Non spécifiée';
        const averageText = local.note !== undefined ? `${local.note.toFixed(2)}/20` : 'Non spécifiée';

        // Pousser email simulé
        await addSimulatedEmail(universityId, {
          to: student.email,
          recipientName: student.name,
          subject: `Nouvelle note publiée : ${course?.title || 'Cours'}`,
          body: `Bonjour ${student.name},\n\nNous vous informons que vos notes pour le cours de "${course?.title || 'Cours'}" (${course?.code || 'CODE'}) ont été publiées par votre enseignant M./Mme ${teacherProfile?.name || 'Enseignant'}.\n\nDétails des notes :\n- Note de classe : ${classNoteText}\n- Note d'examen : ${examNoteText}\n- Moyenne générale du cours : ${averageText}\n\nAppréciation : ${local.appreciation || 'Non spécifiée'}\n\nVous pouvez vous connecter à votre portail CAMPUS pour voir l'historique complet.\n\nCordialement,\nLe Secrétariat Académique`,
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

  const handleUnpublishGrades = async () => {
    const universityId = user?.universityId;
    if (!universityId || !selectedCourse) return;

    try {
      const promises = Object.keys(localGrades).map(async (studentId) => {
        const local = localGrades[studentId];
        if (!local.gradeId) return;

        await updateGrade(universityId, local.gradeId, {
          submitted: false
        });
      });

      await Promise.all(promises);
      ToastSuccess("Publication des notes annulée avec succès ! Les notes sont à présent en brouillon.");
      setSaved(false);

      setLocalGrades(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(studentId => {
          next[studentId] = {
            ...next[studentId],
            submitted: false
          };
        });
        return next;
      });
    } catch (err: any) {
      ToastError(err.message || "Erreur lors de l'annulation de la publication.");
    }
  };

  const hasPublishedGrades = Object.values(localGrades).some(lg => lg.submitted);

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
            {hasPublishedGrades && (
              <button
                type="button"
                onClick={handleUnpublishGrades}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all no-print"
              >
                Annuler la publication
              </button>
            )}
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
              <label className="text-sm font-semibold text-slate-600 flex-shrink-0">Semestre :</label>
              <select
                value={filterSemester}
                onChange={e => {
                  const val = e.target.value;
                  setFilterSemester(val === 'tous' ? 'tous' : parseInt(val));
                  setSelectedCourse('');
                }}
                className="input-premium flex-1 md:w-44 px-3 py-2 text-sm"
              >
                <option value="tous">Tous les semestres</option>
                <option value="1">Semestre 1</option>
                <option value="2">Semestre 2</option>
                <option value="3">Semestre 3</option>
                <option value="4">Semestre 4</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-sm font-semibold text-slate-600 flex-shrink-0">Cours :</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                className="input-premium flex-1 md:w-64 px-3 py-2 text-sm"
              >
                {myCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.title} (S{c.semester || 1})</option>
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
                        <th className="text-center w-52">Notes de Classe</th>
                        <th className="text-center w-52">Notes d'Examen</th>
                        <th className="text-center w-24">Moyenne</th>
                        <th>Appréciation</th>
                        <th className="text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStudents.map(student => {
                        const local = localGrades[student.id] || { classNotes: [], examNotes: [], note: undefined, appreciation: '', submitted: false };
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
                              <div className="flex flex-wrap items-center justify-center gap-1.5 min-w-[120px]">
                                {local.classNotes && local.classNotes.map((note, idx) => (
                                  <div key={idx} className="relative group">
                                    <input
                                      type="number"
                                      min={0}
                                      max={20}
                                      step={0.25}
                                      value={note === undefined ? '' : note}
                                      disabled={local.submitted}
                                      onChange={(e) => handleUpdateSpecificClassNote(student.id, idx, e.target.value)}
                                      className="w-11 px-1 py-1 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-xs font-bold focus:outline-none focus:border-indigo-500"
                                    />
                                    {!local.submitted && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveClassNote(student.id, idx)}
                                        className="absolute -top-1.5 -right-1.5 text-[8px] text-rose-500 bg-white dark:bg-slate-850 rounded-full border border-slate-200 dark:border-slate-750 w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Supprimer"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {!local.submitted && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddClassNotePlaceholder(student.id)}
                                    className="btn btn-xs btn-ghost btn-circle text-slate-400 hover:text-indigo-650 flex items-center justify-center"
                                    title="Ajouter"
                                  >
                                    +
                                  </button>
                                )}
                                {(!local.classNotes || local.classNotes.length === 0) && (
                                  <span className="text-[10px] text-slate-400 italic">Vide</span>
                                )}
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="flex flex-wrap items-center justify-center gap-1.5 min-w-[120px]">
                                {local.examNotes && local.examNotes.map((note, idx) => (
                                  <div key={idx} className="relative group">
                                    <input
                                      type="number"
                                      min={0}
                                      max={20}
                                      step={0.25}
                                      value={note === undefined ? '' : note}
                                      disabled={local.submitted}
                                      onChange={(e) => handleUpdateSpecificExamNote(student.id, idx, e.target.value)}
                                      className="w-11 px-1 py-1 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-xs font-bold focus:outline-none focus:border-indigo-500"
                                    />
                                    {!local.submitted && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveExamNote(student.id, idx)}
                                        className="absolute -top-1.5 -right-1.5 text-[8px] text-rose-500 bg-white dark:bg-slate-850 rounded-full border border-slate-200 dark:border-slate-750 w-3 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Supprimer"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {!local.submitted && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddExamNotePlaceholder(student.id)}
                                    className="btn btn-xs btn-ghost btn-circle text-slate-400 hover:text-indigo-600 flex items-center justify-center"
                                    title="Ajouter"
                                  >
                                    +
                                  </button>
                                )}
                                {(!local.examNotes || local.examNotes.length === 0) && (
                                  <span className="text-[10px] text-slate-400 italic">Vide</span>
                                )}
                              </div>
                            </td>
                            <td className="text-center">
                              {local.note !== undefined ? (
                                <span className={`font-bold text-sm ${local.note >= 10 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                  {local.note.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td>
                              <input
                                type="text"
                                value={local.appreciation || ''}
                                onChange={e => updateAppreciation(student.id, e.target.value)}
                                placeholder="ex: Excellent travail"
                                className="w-full bg-slate-50 border-0 focus:bg-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300 text-slate-700 dark:text-slate-200"
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

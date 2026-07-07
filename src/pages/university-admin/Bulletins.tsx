import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { Save, Award, Library, Printer } from 'lucide-react';


// ─── Grille d'appréciation automatique ───────────────────────────────────────
const getAppreciation = (note: number): string => {
  if (note >= 18) return 'Excellent';
  if (note >= 16) return 'Très bien';
  if (note >= 14) return 'Bien';
  if (note >= 12) return 'Assez bien';
  if (note >= 10) return 'Passable';
  if (note >= 8)  return 'Insuffisant';
  return 'Très insuffisant';
};

export default function Bulletins({ hideHeader = false }: { hideHeader?: boolean }) {
  const { user } = useAuthStore();
  const { classes, students, courses, grades, currentUniversity, addGrade, updateGrade, loading } = useRealtimeDataStore();

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const [localGrades, setLocalGrades] = useState<Record<string, {
    gradeId?: string;
    classNote?: number;
    examNote?: number;
    manualNote?: number;
    isManual: boolean;
    appreciation: string;
  }>>({});

  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [isAdvancedEdit, setIsAdvancedEdit] = useState(false);
  const [sheetCustomTexts, setSheetCustomTexts] = useState({
    republique: "RÉPUBLIQUE DE CÔTE D'IVOIRE",
    ministere: "MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE",
    titre: "BULLETIN DE NOTES SEMESTRIEL",
    periode: "Semestre 1 · Année Académique 2025-2026",
    labelNom: "Nom & Prénoms :",
    labelMatricule: "Matricule :",
    labelClasse: "Classe :",
    labelFiliere: "Filière / Spécialité :",
    labelDate: "Date d'édition :",
    labelStatut: "Statut :",
    labelDecision: "Décision du Jury",
    studentName: "",
    studentId: "",
    studentFiliere: "",
    studentClasse: "",
    studentDate: "",
    studentStatut: "Officiel",
    decisionValue: "",
    universityName: "",
    universityLocation: "",
    overallAverage: ""
  });

  const calculateAutoAverage = (classNote?: number, examNote?: number) => {
    if (classNote === undefined && examNote === undefined) return undefined;
    const cNote = classNote ?? 10;
    const eNote = examNote ?? 10;
    return parseFloat((cNote * 0.4 + eNote * 0.6).toFixed(2));
  };

  const filteredStudents = students.filter(s => !selectedClassId || s.classeId === selectedClassId);
  const activeStudent = students.find(s => s.id === selectedStudentId);

  const studentCourses = courses.filter(c => {
    if (!activeStudent) return false;
    if (activeStudent.classeId && c.classeId) {
      return c.classeId === activeStudent.classeId;
    }
    return c.filiere === activeStudent.filiere;
  });

  useEffect(() => {
    if (!selectedStudentId) {
      setLocalGrades({});
      return;
    }
    const newLocalGrades: typeof localGrades = {};
    studentCourses.forEach(c => {
      newLocalGrades[c.id] = {
        classNote: undefined,
        examNote: undefined,
        manualNote: undefined,
        isManual: false,
        appreciation: ''
      };
    });
    grades.forEach(g => {
      if (g.studentId === selectedStudentId && newLocalGrades[g.courseId]) {
        let autoAppreciation = g.appreciation || '';
        const cNote = g.classNote;
        const eNote = g.examNote;
        const mNote = g.manualNote;
        const isManual = g.isManual || false;
        let finalNote: number | undefined;
        if (isManual && mNote !== undefined) {
          finalNote = mNote;
        } else if (cNote !== undefined || eNote !== undefined) {
          finalNote = parseFloat(((cNote ?? 10) * 0.4 + (eNote ?? 10) * 0.6).toFixed(2));
        }
        if (finalNote !== undefined) {
          autoAppreciation = getAppreciation(finalNote);
        }
        newLocalGrades[g.courseId] = {
          gradeId: g.id,
          classNote: g.classNote,
          examNote: g.examNote,
          manualNote: g.manualNote,
          isManual: g.isManual || false,
          appreciation: autoAppreciation
        };
      }
    });
    setLocalGrades(newLocalGrades);
  }, [selectedStudentId, grades]);

  // ─── Recalcule automatiquement l'appréciation à chaque changement de note ──
  const recalcAppreciation = useCallback(
    (current: typeof localGrades[string], newClassNote?: number, newExamNote?: number, newManualNote?: number, isManual?: boolean): string => {
      const cNote = newClassNote ?? current.classNote;
      const eNote = newExamNote ?? current.examNote;
      const mNote = newManualNote ?? current.manualNote;
      const manual = isManual ?? current.isManual;
      let finalNote: number | undefined;
      if (manual && mNote !== undefined) {
        finalNote = mNote;
      } else if (cNote !== undefined || eNote !== undefined) {
        finalNote = parseFloat(((cNote ?? 10) * 0.4 + (eNote ?? 10) * 0.6).toFixed(2));
      }
      return finalNote !== undefined ? getAppreciation(finalNote) : '';
    },
    []
  );

  const updateClassNote = (courseId: string, valStr: string) => {
    const val = valStr === '' ? undefined : parseFloat(valStr);
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      const clamped = val !== undefined && !isNaN(val) ? Math.min(20, Math.max(0, val)) : undefined;
      return {
        ...prev,
        [courseId]: {
          ...current,
          classNote: clamped,
          appreciation: recalcAppreciation(current, clamped, undefined)
        }
      };
    });
  };

  const updateExamNote = (courseId: string, valStr: string) => {
    const val = valStr === '' ? undefined : parseFloat(valStr);
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      const clamped = val !== undefined && !isNaN(val) ? Math.min(20, Math.max(0, val)) : undefined;
      return {
        ...prev,
        [courseId]: {
          ...current,
          examNote: clamped,
          appreciation: recalcAppreciation(current, undefined, clamped)
        }
      };
    });
  };

  const updateManualNote = (courseId: string, valStr: string) => {
    const val = valStr === '' ? undefined : parseFloat(valStr);
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      const clamped = val !== undefined && !isNaN(val) ? Math.min(20, Math.max(0, val)) : undefined;
      return {
        ...prev,
        [courseId]: {
          ...current,
          manualNote: clamped,
          isManual: val !== undefined,
          appreciation: recalcAppreciation(current, undefined, undefined, clamped, val !== undefined)
        }
      };
    });
  };

  const toggleManualOverride = (courseId: string, forceAuto = false) => {
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      const newIsManual = forceAuto ? false : !current.isManual;
      const newManual = forceAuto ? undefined : current.manualNote;
      return {
        ...prev,
        [courseId]: {
          ...current,
          isManual: newIsManual,
          manualNote: newManual,
          appreciation: recalcAppreciation(current, undefined, undefined, newManual, newIsManual)
        }
      };
    });
  };

  const handleSaveBulletins = async () => {
    const univId = user?.universityId;
    if (!univId || !selectedStudentId || !activeStudent) return;
    setSaving(true);
    try {
      const promises = Object.keys(localGrades).map(async (courseId) => {
        const local = localGrades[courseId];
        const course = studentCourses.find(c => c.id === courseId);
        if (!course) return;
        const auto = calculateAutoAverage(local.classNote, local.examNote);
        const finalAverage = local.isManual ? (local.manualNote ?? auto ?? 10) : (auto ?? 10);
        const gradePayload = {
          studentId: selectedStudentId,
          studentName: activeStudent.name,
          courseId,
          classNote: local.classNote,
          examNote: local.examNote,
          manualNote: local.manualNote,
          isManual: local.isManual,
          note: finalAverage,
          appreciation: local.appreciation,
          submitted: true
        };
        if (local.gradeId) {
          await updateGrade(univId, local.gradeId, gradePayload);
        } else {
          await addGrade(univId, gradePayload);
        }
      });
      await Promise.all(promises);

      let totalSum = 0;
      let count = 0;
      Object.keys(localGrades).forEach((courseId) => {
        const local = localGrades[courseId];
        const auto = calculateAutoAverage(local.classNote, local.examNote);
        const isGraded = local.isManual ? local.manualNote !== undefined : auto !== undefined;
        if (isGraded) {
          const finalAverage = local.isManual ? (local.manualNote ?? auto ?? 0) : (auto ?? 0);
          totalSum += finalAverage;
          count++;
        }
      });

      if (isAdvancedEdit) {
        await useRealtimeDataStore.getState().updateStudent(univId, selectedStudentId, {
          name: sheetCustomTexts.studentName,
          studentId: sheetCustomTexts.studentId,
          filiere: sheetCustomTexts.studentFiliere,
          average: parseFloat(sheetCustomTexts.overallAverage) || 0
        });
      } else {
        const overallAvg = count >= 2 ? parseFloat((totalSum / count).toFixed(2)) : 0;
        await useRealtimeDataStore.getState().updateStudent(univId, selectedStudentId, {
          average: overallAvg
        });
      }
      ToastSuccess("Bulletin de notes sauvegardé avec succès !");
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de la sauvegarde du bulletin.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (activeStudent) {
      let totalLocalSum = 0;
      let localCount = 0;
      Object.keys(localGrades).forEach((courseId) => {
        const local = localGrades[courseId];
        const auto = calculateAutoAverage(local?.classNote, local?.examNote);
        const isGraded = local?.isManual ? local?.manualNote !== undefined : auto !== undefined;
        if (isGraded) {
          const finalAverage = local?.isManual ? (local?.manualNote ?? auto ?? 0) : (auto ?? 0);
          totalLocalSum += finalAverage;
          localCount++;
        }
      });
      const isTeacher = user?.role === 'TEACHER';
      const avgVal = (localCount >= 2 && !isTeacher) ? totalLocalSum / localCount : 0;
      const overallAvgText = (localCount >= 2 && !isTeacher) ? (avgVal >= 10 ? 'Admis(e)' : 'Ajourné(e)') : '';
      const calculatedAvg = (localCount >= 2 && !isTeacher) ? avgVal.toFixed(2) : '';

      setSheetCustomTexts(prev => ({
        ...prev,
        studentName: activeStudent.name,
        studentId: activeStudent.studentId,
        studentFiliere: activeStudent.filiere,
        studentClasse: classes.find(c => c.id === activeStudent.classeId)?.name || activeStudent.classeId || 'Générale',
        studentDate: new Date().toLocaleDateString('fr-FR'),
        decisionValue: overallAvgText,
        universityName: currentUniversity?.name || "Établissement Enseignement Supérieur",
        universityLocation: `${currentUniversity?.city || 'Abidjan'}, ${currentUniversity?.country || "Côte d'Ivoire"}`,
        overallAverage: prev.overallAverage && (isAdvancedEdit || isTeacher) ? prev.overallAverage : calculatedAvg
      }));
    }
  }, [
    activeStudent,
    localGrades,
    currentUniversity,
    classes,
    isAdvancedEdit,
  ]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  let totalLocalSum = 0;
  let localCount = 0;
  Object.keys(localGrades).forEach((courseId) => {
    const local = localGrades[courseId];
    const auto = calculateAutoAverage(local.classNote, local.examNote);
    const isGraded = local.isManual ? local.manualNote !== undefined : auto !== undefined;
    if (isGraded) {
      const finalAverage = local.isManual ? (local.manualNote ?? auto ?? 0) : (auto ?? 0);
      totalLocalSum += finalAverage;
      localCount++;
    }
  });
  const isTeacher = user?.role === 'TEACHER';
  const overallLocalAvg = (localCount >= 2 && !isTeacher) ? (totalLocalSum / localCount).toFixed(2) : '';

  return (
    <div className="page-transition space-y-6">
      {!hideHeader && (
        <PageHeader
          title="Saisie des Bulletins de Notes"
          description="Consultez et modifiez les notes de classe, notes d'examen et moyennes des étudiants."
          breadcrumbs={[{ label: 'Administration' }, { label: 'Bulletins' }]}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Selection sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card-premium p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtres de Sélection</h4>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">Classe</label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedStudentId('');
                }}
                className="select select-bordered select-sm w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none"
              >
                <option value="">Toutes les classes...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    🏫 {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider">Étudiant ({filteredStudents.length})</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="select select-bordered select-sm w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none"
              >
                <option value="">Sélectionnez un étudiant...</option>
                {filteredStudents.map((stud) => (
                  <option key={stud.id} value={stud.id}>
                    👤 {stud.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report Card */}
        <div className="lg:col-span-3">
          {activeStudent ? (
            <div className="space-y-6">
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .print-area, .print-area * { visibility: visible; }
                  .print-area {
                    position: absolute; left: 0; top: 0; width: 100%;
                    padding: 0 !important; margin: 0 !important;
                    border: none !important; box-shadow: none !important;
                    background-color: white !important; color: black !important;
                  }
                  .no-print { display: none !important; }
                  .border-double-print { border: 4px double black !important; }
                  input.borderless-input { border: none !important; color: black !important; }
                }
              `}</style>

              {/* Action Toolbar */}
              <div className="card-premium p-4 flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex items-center gap-3">
                  <span className="badge badge-indigo text-xs font-bold py-2.5 px-3">Mode Aperçu & Édition</span>
                  <span className="text-xs text-slate-400">Double-cliquez pour forcer la moyenne ou utilisez l'Édition Avancée.</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Zoom controls */}
                  <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 gap-2">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest pl-1">Zoom :</span>
                    <button
                      type="button"
                      onClick={() => setZoom(prev => Math.max(0.5, prev - 0.05))}
                      className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all active:scale-90"
                    >-</button>
                    <button
                      type="button"
                      onClick={() => setZoom(0.85)}
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline min-w-10 text-center"
                    >{Math.round(zoom * 100)}%</button>
                    <button
                      type="button"
                      onClick={() => setZoom(prev => Math.min(1.5, prev + 0.05))}
                      className="w-6 h-6 flex items-center justify-center rounded-lg bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all active:scale-90"
                    >+</button>
                  </div>

                  {user?.role === 'UNIVERSITY_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => setIsAdvancedEdit(prev => !prev)}
                      className={`btn btn-xs rounded-lg font-bold flex items-center gap-1.5 h-8 px-3 transition-all ${
                        isAdvancedEdit
                           ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
                           : 'btn-outline btn-slate'
                      }`}
                    >
                      ✏️ Édition Avancée
                    </button>
                  )}

                  <button
                    onClick={() => window.print()}
                    className="btn btn-xs btn-outline btn-slate rounded-lg font-bold flex items-center gap-1.5 h-8 px-3"
                  >
                    <Printer size={13} /> Imprimer / PDF
                  </button>
                  <button
                    onClick={handleSaveBulletins}
                    disabled={saving || studentCourses.length === 0}
                    className="btn btn-xs btn-primary rounded-lg font-bold flex items-center gap-1.5 h-8 px-4"
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <><Save size={13} /> Sauvegarder</>
                    )}
                  </button>
                </div>
              </div>

              {/* Zoomable Viewport */}
              <div className="w-full overflow-auto max-h-[850px] bg-slate-100 dark:bg-slate-950/40 rounded-3xl p-4 flex justify-center border border-slate-200 dark:border-slate-850 no-print">
                <div
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', minWidth: '800px', height: `${zoom * 1150}px` }}
                  className="transition-transform duration-200"
                >
                  {/* Report Card Sheet */}
                  <div className="print-area border-4 border-double border-slate-350 dark:border-slate-800 p-8 sm:p-10 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-3xl shadow-xl max-w-4xl border-double-print">

                    {/* Header */}
                    <div className="text-center space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
                      <input
                        type="text"
                        value={sheetCustomTexts.republique}
                        disabled={!isAdvancedEdit}
                        onChange={e => setSheetCustomTexts(prev => ({ ...prev, republique: e.target.value }))}
                        className={`text-center font-bold uppercase tracking-widest leading-none bg-transparent w-full text-[9px] borderless-input focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                      />
                      <input
                        type="text"
                        value={sheetCustomTexts.ministere}
                        disabled={!isAdvancedEdit}
                        onChange={e => setSheetCustomTexts(prev => ({ ...prev, ministere: e.target.value }))}
                        className={`text-center font-bold uppercase tracking-wider leading-none bg-transparent w-full text-[8px] borderless-input focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                      />

                      <div className="py-2 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-1">
                          <Library size={22} />
                        </div>
                        <input
                          type="text"
                          value={sheetCustomTexts.universityName}
                          disabled={!isAdvancedEdit}
                          onChange={e => setSheetCustomTexts(prev => ({ ...prev, universityName: e.target.value }))}
                          className={`text-center font-black tracking-widest uppercase font-sans bg-transparent w-full text-base borderless-input focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                        />
                        <input
                          type="text"
                          value={sheetCustomTexts.universityLocation}
                          disabled={!isAdvancedEdit}
                          onChange={e => setSheetCustomTexts(prev => ({ ...prev, universityLocation: e.target.value }))}
                          className={`text-center font-semibold italic mt-0.5 bg-transparent w-full text-[10px] borderless-input focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                        />
                      </div>

                      <div className="pt-2">
                        <input
                          type="text"
                          value={sheetCustomTexts.titre}
                          disabled={!isAdvancedEdit}
                          onChange={e => setSheetCustomTexts(prev => ({ ...prev, titre: e.target.value }))}
                          className={`text-center font-serif font-bold underline underline-offset-4 tracking-wide uppercase bg-transparent w-full text-base borderless-input focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                        />
                        <input
                          type="text"
                          value={sheetCustomTexts.periode}
                          disabled={!isAdvancedEdit}
                          onChange={e => setSheetCustomTexts(prev => ({ ...prev, periode: e.target.value }))}
                          className={`text-center font-bold uppercase tracking-wider mt-1.5 bg-transparent w-full text-[10px] borderless-input focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                        />
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left text-xs mb-6 bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="space-y-1.5">
                        {[
                          { label: 'labelNom', value: 'studentName' },
                          { label: 'labelMatricule', value: 'studentId' },
                          { label: 'labelClasse', value: 'studentClasse' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={(sheetCustomTexts as any)[label]}
                              disabled={!isAdvancedEdit}
                              onChange={e => setSheetCustomTexts(prev => ({ ...prev, [label]: e.target.value }))}
                              className={`font-bold bg-transparent borderless-input w-28 text-slate-700 dark:text-slate-350 focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                            />
                            <input
                              type="text"
                              value={(sheetCustomTexts as any)[value]}
                              disabled={!isAdvancedEdit}
                              onChange={e => setSheetCustomTexts(prev => ({ ...prev, [value]: e.target.value }))}
                              className={`bg-transparent borderless-input flex-1 text-slate-500 dark:text-slate-400 font-semibold focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
                        {[
                          { label: 'labelFiliere', value: 'studentFiliere' },
                          { label: 'labelDate', value: 'studentDate' },
                          { label: 'labelStatut', value: 'studentStatut' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={(sheetCustomTexts as any)[label]}
                              disabled={!isAdvancedEdit}
                              onChange={e => setSheetCustomTexts(prev => ({ ...prev, [label]: e.target.value }))}
                              className={`font-bold bg-transparent borderless-input w-36 text-slate-700 dark:text-slate-350 focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                            />
                            <input
                              type="text"
                              value={(sheetCustomTexts as any)[value]}
                              disabled={!isAdvancedEdit}
                              onChange={e => setSheetCustomTexts(prev => ({ ...prev, [value]: e.target.value }))}
                              className={`bg-transparent borderless-input flex-1 text-slate-500 dark:text-slate-400 font-semibold focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Grades Table */}
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-800 dark:border-slate-300 text-slate-700 dark:text-slate-300">
                            <th className="text-left py-2 font-bold uppercase tracking-wider">Matière</th>
                            <th className="text-center py-2 font-bold uppercase tracking-wider w-12">Coeff.</th>
                            <th className="text-center py-2 font-bold uppercase tracking-wider w-20">Note Classe</th>
                            <th className="text-center py-2 font-bold uppercase tracking-wider w-20">Note Examen</th>
                            <th className="text-center py-2 font-bold uppercase tracking-wider w-16">Moyenne</th>
                            <th className="text-left py-2 pl-2 font-bold uppercase tracking-wider">Appréciation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                          {studentCourses.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                                Aucune matière trouvée pour cet étudiant.
                              </td>
                            </tr>
                          ) : (
                            studentCourses.map((course) => {
                              const local = localGrades[course.id] || { isManual: false, appreciation: '' };
                              const auto = calculateAutoAverage(local.classNote, local.examNote);
                              const displayAvg = local.isManual ? local.manualNote : auto;
                              const avgColor = displayAvg === undefined ? 'text-slate-400'
                                : displayAvg >= 14 ? 'text-emerald-600 font-bold'
                                : displayAvg >= 10 ? 'text-amber-600 font-bold'
                                : 'text-rose-600 font-bold';

                              return (
                                <tr key={course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30">
                                  <td className="py-2 pr-2">
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">{course.title}</div>
                                    {course.teacher && (
                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                        {course.teacher}
                                      </div>
                                    )}
                                  </td>
                                  <td className="text-center py-2 font-mono text-slate-600 dark:text-slate-400">
                                    {course.credits || 1}
                                  </td>
                                  <td className="text-center py-2">
                                    {isAdvancedEdit || user?.role === 'TEACHER' || user?.role === 'UNIVERSITY_ADMIN' ? (
                                      <input
                                        type="number"
                                        min={0} max={20} step={0.5}
                                        value={local.classNote ?? ''}
                                        onChange={e => updateClassNote(course.id, e.target.value)}
                                        disabled={local.isManual}
                                        className="w-16 text-center border border-slate-200 dark:border-slate-800 rounded-lg px-1.5 py-1 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                                      />
                                    ) : (
                                      <span>{local.classNote !== undefined ? `${local.classNote}/20` : '—'}</span>
                                    )}
                                  </td>
                                  <td className="text-center py-2">
                                    {isAdvancedEdit || user?.role === 'TEACHER' || user?.role === 'UNIVERSITY_ADMIN' ? (
                                      <input
                                        type="number"
                                        min={0} max={20} step={0.5}
                                        value={local.examNote ?? ''}
                                        onChange={e => updateExamNote(course.id, e.target.value)}
                                        disabled={local.isManual}
                                        className="w-16 text-center border border-slate-200 dark:border-slate-800 rounded-lg px-1.5 py-1 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500 disabled:opacity-40"
                                      />
                                    ) : (
                                      <span>{local.examNote !== undefined ? `${local.examNote}/20` : '—'}</span>
                                    )}
                                  </td>
                                  <td className={`text-center py-2 ${avgColor}`}>
                                    {local.isManual ? (
                                      <input
                                        type="number"
                                        min={0} max={20} step={0.01}
                                        value={local.manualNote ?? ''}
                                        onChange={e => updateManualNote(course.id, e.target.value)}
                                        className="w-14 text-center border-2 border-amber-400 rounded-lg px-1 py-0.5 text-xs bg-amber-50 dark:bg-amber-950/20 focus:outline-none font-bold text-amber-800"
                                        onDoubleClick={() => toggleManualOverride(course.id, true)}
                                        title="Double-clic pour revenir au calcul automatique"
                                      />
                                    ) : (
                                      <span
                                        onDoubleClick={() => (isAdvancedEdit || user?.role === 'TEACHER' || user?.role === 'UNIVERSITY_ADMIN') && toggleManualOverride(course.id)}
                                        title={(isAdvancedEdit || user?.role === 'TEACHER') ? "Double-clic pour forcer la moyenne" : ""}
                                        className={(isAdvancedEdit || user?.role === 'TEACHER') ? "cursor-pointer hover:underline" : ""}
                                      >
                                        {displayAvg !== undefined ? `${displayAvg}/20` : '—'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 pl-2">
                                    <span
                                      className={`text-xs font-medium italic ${
                                        local.appreciation === 'Excellent' ? 'text-emerald-600 dark:text-emerald-400'
                                        : local.appreciation === 'Très bien' ? 'text-teal-600 dark:text-teal-400'
                                        : local.appreciation === 'Bien' ? 'text-indigo-600 dark:text-indigo-400'
                                        : local.appreciation === 'Assez bien' ? 'text-sky-600 dark:text-sky-400'
                                        : local.appreciation === 'Passable' ? 'text-amber-600 dark:text-amber-400'
                                        : local.appreciation === 'Insuffisant' ? 'text-orange-600 dark:text-orange-400'
                                        : local.appreciation === 'Très insuffisant' ? 'text-rose-600 dark:text-rose-400'
                                        : 'text-slate-400'
                                      }`}
                                    >
                                      {local.appreciation || '—'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary / Overall Average */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 mb-6">
                      <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Moyenne Générale</p>
                            {isAdvancedEdit || isTeacher ? (
                              <input
                                type="text"
                                value={sheetCustomTexts.overallAverage}
                                onChange={e => setSheetCustomTexts(prev => ({ ...prev, overallAverage: e.target.value }))}
                                className="text-2xl font-extrabold text-indigo-600 bg-transparent border-b border-dashed border-indigo-300 focus:outline-none w-24 mt-1"
                              />
                            ) : (
                              <p className={`text-2xl font-extrabold mt-1 ${overallLocalAvg ? 'text-indigo-600' : 'text-slate-300'}`}>
                                {overallLocalAvg ? `${overallLocalAvg}/20` : '— /20'}
                              </p>
                            )}
                            {overallLocalAvg && (
                              <p className={`text-xs font-semibold mt-1.5 italic ${
                                parseFloat(overallLocalAvg) >= 16 ? 'text-emerald-600 dark:text-emerald-400'
                                : parseFloat(overallLocalAvg) >= 12 ? 'text-indigo-600 dark:text-indigo-400'
                                : parseFloat(overallLocalAvg) >= 10 ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                              }`}>
                                {getAppreciation(parseFloat(overallLocalAvg))}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                          <input
                            type="text"
                            value={sheetCustomTexts.labelDecision}
                            disabled={!isAdvancedEdit}
                            onChange={e => setSheetCustomTexts(prev => ({ ...prev, labelDecision: e.target.value }))}
                            className={`bg-transparent borderless-input focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                          />
                        </p>
                        {isAdvancedEdit || isTeacher ? (
                          <input
                            type="text"
                            value={sheetCustomTexts.decisionValue}
                            onChange={e => setSheetCustomTexts(prev => ({ ...prev, decisionValue: e.target.value }))}
                            className={`text-xs font-black uppercase tracking-wider bg-transparent borderless-input focus:outline-none ${
                              sheetCustomTexts.decisionValue.toLowerCase().includes('admis')
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-450'
                            } ${isAdvancedEdit || isTeacher ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                          />
                        ) : (
                          <span className={`text-xs font-black uppercase tracking-wider ${
                            sheetCustomTexts.decisionValue.toLowerCase().includes('admis')
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : sheetCustomTexts.decisionValue
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-400 font-bold italic'
                          }`}>
                            {sheetCustomTexts.decisionValue || '—'}
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-premium p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <Award className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48} />
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Sélectionnez un étudiant</h4>
              <p className="text-slate-400 text-xs mt-1">
                Choisissez une classe puis un étudiant dans le menu latéral pour afficher et saisir son bulletin de notes académique.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

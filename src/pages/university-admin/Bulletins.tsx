import { useState, useEffect } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { Save, Award, Library, Printer } from 'lucide-react';
import { sendRealEmail } from '../../services/emailSender';
import { db } from '../../../firebase-config';
import { ref, get } from 'firebase/database';

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
    teacherSignature?: string;
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
    labelSignature1: "Responsable de la scolarité",
    labelSignature2: "Chef de département",
    studentName: "",
    studentId: "",
    studentFiliere: "",
    studentClasse: "",
    studentDate: "",
    studentStatut: "Officiel",
    decisionValue: "",
    universityName: "",
    universityLocation: "",
    signatureSecretariat: "",
    signatureRecteur: "",
    overallAverage: ""
  });

  const [signingCourseId, setSigningCourseId] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTarget, setSignatureTarget] = useState<{
    type: 'course' | 'secretariat' | 'recteur';
    courseId?: string;
  } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const getCanvasContext = () => {
    const canvas = document.getElementById('signature-canvas') as HTMLCanvasElement | null;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const res = getCanvasContext();
    if (!res) return;
    const { canvas, ctx } = res;
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setLastPosition({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const res = getCanvasContext();
    if (!res) return;
    const { canvas, ctx } = res;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPosition({ x, y });
  };

  const stopDrawing = () => setIsDrawing(false);

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const res = getCanvasContext();
    if (!res) return;
    const { canvas, ctx } = res;
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setLastPosition({ x, y });
    if (e.cancelable) e.preventDefault();
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const res = getCanvasContext();
    if (!res) return;
    const { canvas, ctx } = res;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPosition({ x, y });
    if (e.cancelable) e.preventDefault();
  };

  const clearCanvas = () => {
    const res = getCanvasContext();
    if (!res) return;
    const { canvas, ctx } = res;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isCanvasBlank = (canvas: HTMLCanvasElement) => {
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    return canvas.toDataURL() === blank.toDataURL();
  };

  const calculateAutoAverage = (classNote?: number, examNote?: number) => {
    if (classNote === undefined && examNote === undefined) return undefined;
    const cNote = classNote ?? 10;
    const eNote = examNote ?? 10;
    return parseFloat((cNote * 0.4 + eNote * 0.6).toFixed(2));
  };

  const saveCanvasSignature = async () => {
    const res = getCanvasContext();
    if (!res || !signatureTarget) return;
    const { canvas } = res;
    const isEmpty = isCanvasBlank(canvas);
    if (isEmpty) {
      ToastError("Veuillez dessiner votre signature avant d'enregistrer.");
      return;
    }
    const base64Data = canvas.toDataURL('image/png');
    const univId = user?.universityId;
    if (!univId || !selectedStudentId) return;
    try {
      if (signatureTarget.type === 'course') {
        const courseId = signatureTarget.courseId!;
        const local = localGrades[courseId];
        if (!local) return;
        const auto = calculateAutoAverage(local.classNote, local.examNote);
        const finalAverage = local.isManual ? (local.manualNote ?? auto ?? 10) : (auto ?? 10);
        const payload = {
          studentId: selectedStudentId,
          studentName: activeStudent?.name || '',
          courseId,
          classNote: local.classNote || 0,
          examNote: local.examNote || 0,
          manualNote: local.manualNote,
          isManual: local.isManual,
          note: finalAverage,
          appreciation: local.appreciation,
          submitted: true,
          teacherSignature: base64Data
        };
        if (local.gradeId) {
          await updateGrade(univId, local.gradeId, payload);
        } else {
          await addGrade(univId, payload);
        }
      } else {
        const type = signatureTarget.type;
        const updatedSigs = {
          ...(activeStudent?.signatures || {}),
          [type]: base64Data
        };
        await useRealtimeDataStore.getState().updateStudent(univId, selectedStudentId, {
          signatures: updatedSigs
        } as any);
      }
      ToastSuccess("Signature enregistrée et apposée avec succès !");
      setShowSignatureModal(false);
      setSignatureTarget(null);
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de l'enregistrement de la signature.");
    }
  };

  const handleClearOfficialSignature = async (type: 'secretariat' | 'recteur') => {
    const univId = user?.universityId;
    if (!univId || !selectedStudentId || !activeStudent) return;
    try {
      const updatedSigs = {
        ...(activeStudent.signatures || {}),
        [type]: ""
      };
      await useRealtimeDataStore.getState().updateStudent(univId, selectedStudentId, {
        signatures: updatedSigs
      } as any);
      ToastSuccess("Signature officielle effacée avec succès !");
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de la suppression de la signature.");
    }
  };

  const handleClearCourseSignature = async (courseId: string) => {
    const univId = user?.universityId;
    if (!univId || !selectedStudentId) return;
    const local = localGrades[courseId];
    if (!local) return;
    try {
      const payload = {
        studentId: selectedStudentId,
        studentName: activeStudent?.name || '',
        courseId,
        classNote: local.classNote || 0,
        examNote: local.examNote || 0,
        manualNote: local.manualNote,
        isManual: local.isManual,
        note: local.isManual ? (local.manualNote ?? 10) : calculateAutoAverage(local.classNote, local.examNote) ?? 10,
        appreciation: local.appreciation,
        submitted: true,
        teacherSignature: ""
      };
      if (local.gradeId) {
        await updateGrade(univId, local.gradeId, payload);
      } else {
        await addGrade(univId, payload);
      }
      ToastSuccess("Signature de la matière effacée avec succès !");
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de la suppression.");
    }
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
        appreciation: '',
        teacherSignature: ''
      };
    });
    grades.forEach(g => {
      if (g.studentId === selectedStudentId && newLocalGrades[g.courseId]) {
        newLocalGrades[g.courseId] = {
          gradeId: g.id,
          classNote: g.classNote,
          examNote: g.examNote,
          manualNote: g.manualNote,
          isManual: g.isManual || false,
          appreciation: g.appreciation || '',
          teacherSignature: g.teacherSignature || ''
        };
      }
    });
    setLocalGrades(newLocalGrades);
  }, [selectedStudentId, grades]);

  const updateClassNote = (courseId: string, valStr: string) => {
    const val = valStr === '' ? undefined : parseFloat(valStr);
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      return {
        ...prev,
        [courseId]: {
          ...current,
          classNote: val !== undefined && !isNaN(val) ? Math.min(20, Math.max(0, val)) : undefined
        }
      };
    });
  };

  const updateExamNote = (courseId: string, valStr: string) => {
    const val = valStr === '' ? undefined : parseFloat(valStr);
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      return {
        ...prev,
        [courseId]: {
          ...current,
          examNote: val !== undefined && !isNaN(val) ? Math.min(20, Math.max(0, val)) : undefined
        }
      };
    });
  };

  const updateManualNote = (courseId: string, valStr: string) => {
    const val = valStr === '' ? undefined : parseFloat(valStr);
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      return {
        ...prev,
        [courseId]: {
          ...current,
          manualNote: val !== undefined && !isNaN(val) ? Math.min(20, Math.max(0, val)) : undefined,
          isManual: val !== undefined
        }
      };
    });
  };

  const toggleManualOverride = (courseId: string, forceAuto = false) => {
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      return {
        ...prev,
        [courseId]: {
          ...current,
          isManual: forceAuto ? false : !current.isManual,
          manualNote: forceAuto ? undefined : current.manualNote
        }
      };
    });
  };

  const updateAppreciation = (courseId: string, text: string) => {
    setLocalGrades(prev => {
      const current = prev[courseId] || { isManual: false, appreciation: '' };
      return { ...prev, [courseId]: { ...current, appreciation: text } };
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

  const handleSignOfficial = async (type: 'secretariat' | 'recteur') => {
    const univId = user?.universityId;
    if (!univId || !selectedStudentId || !activeStudent) return;
    try {
      const dateStr = new Date().toLocaleDateString('fr-FR');
      const sigValue = type === 'secretariat'
        ? `Signé par le Secrétariat le ${dateStr}`
        : `Signé par le Chef de département le ${dateStr}`;
      const updatedSigs = {
        ...(activeStudent.signatures || {}),
        [type]: sigValue
      };
      await useRealtimeDataStore.getState().updateStudent(univId, selectedStudentId, {
        signatures: updatedSigs
      } as any);
      ToastSuccess("Bulletin signé avec succès !");

      if (type === 'recteur') {
        try {
          if (activeStudent.email) {
            await sendRealEmail(
              activeStudent.email,
              "Votre bulletin de notes est disponible - CAMPUS",
              `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                 <h2 style="color: #4f46e5;">Votre bulletin est disponible</h2>
                 <p>Bonjour <strong>${activeStudent.name}</strong>,</p>
                 <p>Nous vous informons que votre bulletin de notes pour le semestre en cours a été signé officiellement par la direction et est désormais disponible sur votre espace CAMPUS.</p>
                 <p style="background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; font-weight: bold; color: #1e293b;">
                   Moyenne Générale : ${activeStudent.average || 'En attente'}/20
                 </p>
                 <p style="margin: 24px 0; text-align: center;">
                   <a href="${window.location.origin}/connexion" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Accéder à mon espace</a>
                 </p>
                 <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                 <p style="color: #64748b; font-size: 11px;">L'administration académique</p>
               </div>`
            );
          }

          const usersRef = ref(db, 'utilisateurs');
          const usersSnap = await get(usersRef);
          if (usersSnap.exists()) {
            const allUsers = usersSnap.val();
            const parent = Object.values(allUsers).find(
              (u: any) => u && u.role === 'PARENT' && u.enfants && u.enfants[selectedStudentId]
            ) as any;
            if (parent && parent.email) {
              await sendRealEmail(
                parent.email,
                `Bulletin de notes disponible - ${activeStudent.name}`,
                `<div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                   <h2 style="color: #4f46e5;">Bulletin disponible pour votre enfant</h2>
                   <p>Bonjour <strong>${parent.prenom || ''} ${parent.nom || ''}</strong>,</p>
                   <p>Le bulletin de notes du semestre en cours pour votre enfant <strong>${activeStudent.name}</strong> a été signé officiellement et est disponible sur votre portail de suivi parent CAMPUS.</p>
                   <p style="background-color: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 13px; font-weight: bold; color: #1e293b;">
                     Moyenne Générale de l'étudiant(e) : ${activeStudent.average || 'En attente'}/20
                   </p>
                   <p style="margin: 24px 0; text-align: center;">
                     <a href="${window.location.origin}/connexion" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">Accéder au portail Parent</a>
                   </p>
                   <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                   <p style="color: #64748b; font-size: 11px;">L'administration académique</p>
                 </div>`
              );
            }
          }
        } catch (mailErr) {
          console.error("Erreur lors de la notification mail de bulletin:", mailErr);
        }
      }
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de la signature.");
    }
  };

  const handleSignCourse = async (courseId: string) => {
    const univId = user?.universityId;
    if (!univId || !selectedStudentId) return;
    const local = localGrades[courseId];
    if (!local) return;
    setSigningCourseId(courseId);
    try {
      const dateStr = new Date().toLocaleDateString('fr-FR');
      const sigValue = `Signé par Prof. ${user?.name} le ${dateStr}`;
      const auto = calculateAutoAverage(local.classNote, local.examNote);
      const finalAverage = local.isManual ? (local.manualNote ?? auto ?? 10) : (auto ?? 10);
      const payload = {
        studentId: selectedStudentId,
        studentName: activeStudent?.name || '',
        courseId,
        classNote: local.classNote || 0,
        examNote: local.examNote || 0,
        manualNote: local.manualNote,
        isManual: local.isManual,
        note: finalAverage,
        appreciation: local.appreciation,
        submitted: true,
        teacherSignature: sigValue
      };
      if (local.gradeId) {
        await updateGrade(univId, local.gradeId, payload);
      } else {
        await addGrade(univId, payload);
      }
      ToastSuccess("Matière signée avec succès !");
    } catch (err: any) {
      console.error(err);
      ToastError("Erreur lors de la signature.");
    } finally {
      setSigningCourseId('');
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
        signatureSecretariat: activeStudent.signatures?.secretariat || "",
        signatureRecteur: activeStudent.signatures?.recteur || "",
        overallAverage: prev.overallAverage && (isAdvancedEdit || isTeacher) ? prev.overallAverage : calculatedAvg
      }));
    }
  }, [activeStudent, localGrades, currentUniversity, classes, isAdvancedEdit]);

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

  const canSignDept = user?.role === 'UNIVERSITY_ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';
  const canSignScolarite = user?.role === 'FINANCE_MANAGER';

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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Classe</label>
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
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Étudiant ({filteredStudents.length})</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="select select-bordered select-sm w-full bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none"
              >
                <option value="">Sélectionnez un étudiant...</option>
                {filteredStudents.map((stud) => (
                  <option key={stud.id} value={stud.id}>
                    👤 {stud.name} ({stud.studentId})
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
                            <th className="text-left py-2 font-bold uppercase tracking-wider">Appréciation</th>
                            {(user?.role === 'TEACHER' || user?.role === 'UNIVERSITY_ADMIN') && (
                              <th className="text-center py-2 font-bold uppercase tracking-wider w-24 no-print">Signature</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                          {studentCourses.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-8 text-slate-400 italic">
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
                                    <div className="font-semibold text-slate-800 dark:text-slate-200">{course.name}</div>
                                    {course.teacherId && (
                                      <div className="text-[10px] text-slate-400 mt-0.5">
                                        {course.teacherId}
                                      </div>
                                    )}
                                  </td>
                                  <td className="text-center py-2 font-mono text-slate-600 dark:text-slate-400">
                                    {course.coefficient || 1}
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
                                    {isAdvancedEdit || user?.role === 'TEACHER' || user?.role === 'UNIVERSITY_ADMIN' ? (
                                      <input
                                        type="text"
                                        value={local.appreciation}
                                        onChange={e => updateAppreciation(course.id, e.target.value)}
                                        placeholder="Appréciation..."
                                        className="w-full border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs bg-white dark:bg-slate-900 focus:outline-none focus:border-indigo-500"
                                      />
                                    ) : (
                                      <span className="text-slate-500 italic">{local.appreciation || '—'}</span>
                                    )}
                                  </td>
                                  {(user?.role === 'TEACHER' || user?.role === 'UNIVERSITY_ADMIN') && (
                                    <td className="text-center py-2 no-print">
                                      {local.teacherSignature ? (
                                        <div className="flex flex-col items-center gap-1">
                                          {local.teacherSignature.startsWith('data:image/') ? (
                                            <img
                                              src={local.teacherSignature}
                                              alt="Signature enseignant"
                                              className="max-h-8 max-w-[80px] object-contain dark:invert"
                                            />
                                          ) : (
                                            <span className="text-[9px] text-indigo-600 italic font-serif">✍️ Signé</span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => handleClearCourseSignature(course.id)}
                                            className="text-[9px] text-rose-600 hover:text-rose-800 font-bold underline"
                                          >
                                            Effacer
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSignatureTarget({ type: 'course', courseId: course.id });
                                            setShowSignatureModal(true);
                                          }}
                                          disabled={signingCourseId === course.id}
                                          className="btn btn-xs btn-outline btn-indigo rounded-lg px-2 h-6 text-[10px] font-bold"
                                        >
                                          {signingCourseId === course.id ? (
                                            <span className="loading loading-spinner loading-xs" />
                                          ) : 'Signer ✍️'}
                                        </button>
                                      )}
                                    </td>
                                  )}
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
                          <span className="text-slate-400 font-bold text-xs italic">—</span>
                        )}
                      </div>
                    </div>

                    {/* Signatures Footer */}
                    <div className="grid grid-cols-2 gap-8 pt-10 mt-10 border-t border-slate-100 dark:border-slate-900 text-xs">
                      {/* Signature 1 — Responsable de la scolarité */}
                      <div className="text-center space-y-4">
                        <input
                          type="text"
                          value={sheetCustomTexts.labelSignature1}
                          disabled={!isAdvancedEdit}
                          onChange={e => setSheetCustomTexts(prev => ({ ...prev, labelSignature1: e.target.value }))}
                          className={`font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider text-center bg-transparent borderless-input w-full focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                        />
                        {sheetCustomTexts.signatureSecretariat ? (
                          <div className="flex flex-col items-center gap-1.5 py-1">
                            {sheetCustomTexts.signatureSecretariat.startsWith('data:image/') ? (
                              <img
                                src={sheetCustomTexts.signatureSecretariat}
                                alt="Signature Responsable scolarité"
                                className="max-h-12 max-w-[150px] object-contain dark:invert"
                              />
                            ) : (
                              <span className="font-serif italic text-indigo-650 text-xs bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 px-3 py-1 rounded">
                                ✍️ {sheetCustomTexts.signatureSecretariat}
                              </span>
                            )}
                            {canSignScolarite && (
                              <button
                                type="button"
                                onClick={() => handleClearOfficialSignature('secretariat')}
                                className="text-[9px] text-rose-600 hover:text-rose-800 font-bold underline no-print"
                                title="Effacer la signature"
                              >
                                Effacer
                              </button>
                            )}
                          </div>
                        ) : (
                          canSignScolarite ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSignatureTarget({ type: 'secretariat' });
                                setShowSignatureModal(true);
                              }}
                              className="btn btn-xs btn-outline btn-indigo rounded-lg px-3 h-7 no-print font-bold"
                            >
                              Signer ✍️
                            </button>
                          ) : (
                            <div className="w-24 h-12 mx-auto border border-dashed border-slate-200 dark:border-slate-800 rounded flex items-center justify-center opacity-40 italic text-[10px]">
                              Signature
                            </div>
                          )
                        )}
                      </div>

                      {/* Signature 2 — Chef de département */}
                      <div className="text-center space-y-4">
                        <input
                          type="text"
                          value={sheetCustomTexts.labelSignature2}
                          disabled={!isAdvancedEdit}
                          onChange={e => setSheetCustomTexts(prev => ({ ...prev, labelSignature2: e.target.value }))}
                          className={`font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider text-center bg-transparent borderless-input w-full focus:outline-none ${isAdvancedEdit ? 'border border-dashed border-slate-300 dark:border-slate-700' : 'border-none'}`}
                        />
                        {sheetCustomTexts.signatureRecteur ? (
                          <div className="flex flex-col items-center gap-1.5 py-1">
                            {sheetCustomTexts.signatureRecteur.startsWith('data:image/') ? (
                              <img
                                src={sheetCustomTexts.signatureRecteur}
                                alt="Signature Chef de département"
                                className="max-h-12 max-w-[150px] object-contain dark:invert"
                              />
                            ) : (
                              <span className="font-serif italic text-indigo-650 text-xs bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 px-3 py-1 rounded">
                                ✍️ {sheetCustomTexts.signatureRecteur}
                              </span>
                            )}
                            {canSignDept && (
                              <button
                                type="button"
                                onClick={() => handleClearOfficialSignature('recteur')}
                                className="text-[9px] text-rose-600 hover:text-rose-800 font-bold underline no-print"
                                title="Effacer la signature"
                              >
                                Effacer
                              </button>
                            )}
                          </div>
                        ) : (
                          canSignDept ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSignatureTarget({ type: 'recteur' });
                                setShowSignatureModal(true);
                              }}
                              className="btn btn-xs btn-outline btn-indigo rounded-lg px-3 h-7 no-print font-bold"
                            >
                              Signer ✍️
                            </button>
                          ) : (
                            <div className="w-24 h-12 mx-auto border border-dashed border-slate-200 dark:border-slate-800 rounded flex items-center justify-center opacity-40 italic text-[10px]">
                              Cachet officiel
                            </div>
                          )
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

      {/* Signature Pad Modal */}
      {showSignatureModal && (
        <div className="modal modal-open no-print">
          <div className="modal-box max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              ✍️ Apposer votre signature réelle
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Dessinez votre signature dans le cadre ci-dessous à l'aide de votre souris ou de votre écran tactile.
            </p>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <canvas
                id="signature-canvas"
                width={400}
                height={200}
                className="cursor-crosshair w-full h-[200px]"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawingTouch}
                onTouchMove={drawTouch}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className="modal-action flex justify-between mt-6">
              <button
                type="button"
                onClick={clearCanvas}
                className="btn btn-sm btn-ghost text-xs font-bold"
              >
                Effacer
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignatureModal(false);
                    setSignatureTarget(null);
                  }}
                  className="btn btn-sm btn-outline text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={saveCanvasSignature}
                  className="btn btn-sm btn-primary text-xs font-bold px-4"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

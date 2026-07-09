import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

interface NoterDevoirModalProps {
  assignmentId: string;
  universityId: string;
  onClose: () => void;
}

export default function NoterDevoirModal({ assignmentId, universityId, onClose }: NoterDevoirModalProps) {
  const { students, assignments, courses, updateAssignment, addGrade, grades: realtimeGrades, updateGrade } = useRealtimeDataStore();
  const assignment = assignments.find(a => a.id === assignmentId);
  const course = courses.find(c => c.id === assignment?.courseId);
  const courseStudents = students.filter(s => s.filiere === course?.filiere);

  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState<Record<string, number>>({});

  useEffect(() => {
    // Si des notes existaient déjà sur le devoir, on pourrait les charger ici.
    // Pour simplifier, on permet la saisie ou la mise à jour directe (les devoirs n'ont pas encore de table de soumission dédiée dans cette v1)
    setGrades({});
  }, [assignmentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const submittedCount = Object.keys(grades).length;
      
      // Save grades by appending them to the main student grade's classNotes
      const promises = Object.entries(grades).map(async ([studentId, note]) => {
        const student = students.find(s => s.id === studentId);
        if (student && course) {
          const existingGrade = realtimeGrades.find(g => g.studentId === studentId && g.courseId === course.id);
          
          const newClassNotes = existingGrade && existingGrade.classNotes
            ? [...existingGrade.classNotes, note]
            : existingGrade && existingGrade.classNote !== undefined
              ? [existingGrade.classNote, note]
              : [note];
          
          const classNoteAvg = parseFloat((newClassNotes.reduce((s, n) => s + n, 0) / newClassNotes.length).toFixed(2));
          const examNoteAvg = existingGrade && existingGrade.examNotes && existingGrade.examNotes.length > 0
            ? parseFloat((existingGrade.examNotes.reduce((s, n) => s + n, 0) / existingGrade.examNotes.length).toFixed(2))
            : existingGrade && existingGrade.examNote !== undefined
              ? existingGrade.examNote
              : undefined;
              
          let finalNote = undefined;
          if (classNoteAvg !== undefined || examNoteAvg !== undefined) {
            const cNote = classNoteAvg ?? 10;
            const eNote = examNoteAvg ?? 10;
            finalNote = parseFloat((cNote * 0.4 + eNote * 0.6).toFixed(2));
          }
          
          if (existingGrade) {
            await updateGrade(universityId, existingGrade.id, {
              classNotes: newClassNotes,
              classNote: classNoteAvg,
              note: finalNote,
              submitted: true,
              teacherId: course.teacherId || ''
            });
          } else {
            await addGrade(universityId, {
              studentId,
              studentName: student.name,
              courseId: course.id,
              classNotes: newClassNotes,
              classNote: classNoteAvg,
              note: finalNote,
              submitted: true,
              teacherId: course.teacherId || ''
            });
          }
        }
      });
      await Promise.all(promises);

      await updateAssignment(universityId, assignmentId, {
        status: 'termine',
        submissionsCount: submittedCount,
        grades: grades
      });

      ToastSuccess(`Notes enregistrées avec succès (${submittedCount} étudiants).`);
      onClose();
    } catch (err: any) {
      console.error("Save grades error:", err);
      ToastError(`Erreur: ${err.message || "lors de l'enregistrement des notes."}`);
    } finally {
      setSaving(false);
    }
  };

  if (!assignment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full border border-slate-100 shadow-2xl relative animate-fade-up max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="mb-6 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800">Saisie des notes : {assignment.title}</h3>
          <p className="text-sm text-slate-500 mt-1">
            Cours : <span className="font-semibold text-indigo-600">{assignment.courseTitle}</span>
          </p>
          <p className="text-xs text-slate-400">Barème : / {assignment.maxGrade} pts</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-2 text-xs font-bold text-slate-500 uppercase">Étudiant</th>
                <th className="pb-2 text-xs font-bold text-slate-500 uppercase text-center w-32">Note / {assignment.maxGrade}</th>
              </tr>
            </thead>
            <tbody>
              {courseStudents.map(student => (
                <tr key={student.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                    <p className="text-xs text-slate-400">{student.studentId}</p>
                  </td>
                  <td className="py-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={assignment.maxGrade}
                      step={0.5}
                      value={grades[student.id] !== undefined ? grades[student.id] : ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (isNaN(val)) {
                          const newGrades = { ...grades };
                          delete newGrades[student.id];
                          setGrades(newGrades);
                        } else {
                          setGrades({ ...grades, [student.id]: Math.min(assignment.maxGrade, Math.max(0, val)) });
                        }
                      }}
                      className="w-20 text-center input input-bordered input-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm font-bold text-indigo-700 bg-white"
                      placeholder="—"
                    />
                  </td>
                </tr>
              ))}
              {courseStudents.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-8 text-slate-400 text-sm">
                    Aucun étudiant inscrit à ce cours.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving || courseStudents.length === 0}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <span className="loading loading-spinner loading-xs" /> : <CheckCircle size={16} />}
            Enregistrer & Clôturer
          </button>
        </div>
      </div>
    </div>
  );
}

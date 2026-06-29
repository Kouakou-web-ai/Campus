import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';

interface FaireAppelModalProps {
  courseId: string;
  universityId: string;
  onClose: () => void;
}

export default function FaireAppelModal({ courseId, universityId, onClose }: FaireAppelModalProps) {
  const { students, courses, markAttendance, addTransaction, updateStudent } = useRealtimeDataStore();
  const course = courses.find(c => c.id === courseId);
  const courseStudents = students.filter(s => s.filiere === course?.filiere);

  const [attendances, setAttendances] = useState<Record<string, 'present' | 'absent' | 'retard'>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialise avec "present" par défaut
    const initial: Record<string, 'present' | 'absent' | 'retard'> = {};
    courseStudents.forEach(s => {
      initial[s.id] = 'present';
    });
    setAttendances(initial);
  }, [courseStudents]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Pour chaque étudiant, on enregistre l'appel
      const promises = Object.entries(attendances).map(async ([studentId, status]) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
          await markAttendance(universityId, courseId, {
            studentId,
            studentName: student.name,
            status,
            markedAt: new Date().toISOString()
          });
          // Si absent, incrémenter les absences de l'étudiant
          if (status === 'absent') {
            await updateStudent(universityId, studentId, {
              absences: (student.absences || 0) + 1
            });
          }
        }
      });
      await Promise.all(promises);
      ToastSuccess("L'appel a été enregistré avec succès !");
      onClose();
    } catch (err: any) {
      ToastError("Erreur lors de l'enregistrement de l'appel.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl relative animate-fade-up max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <X size={18} />
        </button>
        
        <div className="mb-6 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800">Faire l'appel</h3>
          <p className="text-sm text-slate-500 mt-1">
            Cours : <span className="font-semibold text-indigo-600">{course?.title} ({course?.code})</span>
          </p>
          <p className="text-xs text-slate-400">Date du cours : {course?.date} à {course?.startTime}</p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 mb-6">
          <div className="space-y-3">
            {courseStudents.map(student => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.studentId}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setAttendances(prev => ({ ...prev, [student.id]: 'present' }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                      attendances[student.id] === 'present' 
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle size={14} />
                    Présent
                  </button>
                  <button
                    onClick={() => setAttendances(prev => ({ ...prev, [student.id]: 'retard' }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                      attendances[student.id] === 'retard' 
                        ? 'bg-amber-100 text-amber-700 shadow-sm' 
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <Clock size={14} />
                    Retard
                  </button>
                  <button
                    onClick={() => setAttendances(prev => ({ ...prev, [student.id]: 'absent' }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                      attendances[student.id] === 'absent' 
                        ? 'bg-red-100 text-red-700 shadow-sm' 
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle size={14} />
                    Absent
                  </button>
                </div>
              </div>
            ))}
            {courseStudents.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Aucun étudiant inscrit dans cette filière ({course?.filiere}).
              </div>
            )}
          </div>
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
            Enregistrer l'appel
          </button>
        </div>
      </div>
    </div>
  );
}

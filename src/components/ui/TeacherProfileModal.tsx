import React, { useState } from 'react';
import { X, BookOpen, Users, Clock, Mail, Star, Award } from 'lucide-react';
import type { Teacher, Course, Student } from '../../types';
import StatusBadge from './StatusBadge';
import { Avatar } from './AvatarGroup';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { ToastSuccess, ToastError } from '../../controllers/Toast-emitter';
import { useNow, getCourseProgress, getCourseStatus } from '../../hooks/useNow';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: (Teacher & { courses: Course[]; students: Student[] }) | null;
}

export default function TeacherProfileModal({ isOpen, onClose, teacher }: TeacherProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'students'>('info');
  const { user } = useAuthStore();
  const { courses: allCourses, assignTeacherToCourse } = useRealtimeDataStore();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const now = useNow(30_000);

  if (!isOpen || !teacher) return null;

  const unassignedCourses = allCourses.filter(
    (c) => c.universityId === user?.universityId && c.teacherId !== teacher.id
  );

  const handleAssignCourse = async () => {
    if (!selectedCourseId || !user?.universityId) return;
    setAssigning(true);
    try {
      await assignTeacherToCourse(user.universityId, teacher.id, teacher.name, selectedCourseId);
      ToastSuccess("L'enseignant a été affecté au cours avec succès.");
      setSelectedCourseId('');
    } catch (err) {
      ToastError("Impossible d'affecter l'enseignant.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-fade-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-100">
          <Avatar name={teacher.name} size="lg" />
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">{teacher.name}</h3>
              <div className="flex justify-center">
                <StatusBadge status={teacher.status} />
              </div>
            </div>
            <p className="text-sm text-indigo-600 font-medium mt-1">{teacher.specialite}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 my-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Détails
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'courses' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Cours ({teacher.coursCount})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'students' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Étudiants ({teacher.studentsCount})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="space-y-4">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-premium p-4 bg-slate-50 border-none">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact</p>
                <div className="flex items-center gap-2 mt-2">
                  <Mail size={16} className="text-indigo-500" />
                  <a href={`mailto:${teacher.email}`} className="text-sm text-slate-700 hover:underline break-all">
                    {teacher.email}
                  </a>
                </div>
              </div>
              <div className="card-premium p-4 bg-slate-50 border-none">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Heures de cours</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={16} className="text-indigo-500" />
                  <span className="text-sm text-slate-700">{teacher.hoursPerWeek} heures / semaine</span>
                </div>
              </div>
              <div className="card-premium p-4 bg-slate-50 border-none">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Discipline principale</p>
                <div className="flex items-center gap-2 mt-2">
                  <Award size={16} className="text-indigo-500" />
                  <span className="text-sm text-slate-700">{teacher.specialite}</span>
                </div>
              </div>
              <div className="card-premium p-4 bg-slate-50 border-none">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Identifiant de l'enseignant</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-sm text-slate-600">{teacher.id}</span>
                </div>
              </div>
              {teacher.classeName && (
                <div className="card-premium p-4 bg-slate-50 border-none">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Classe affectée</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-slate-700">🏫 {teacher.classeName}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-3">
              {user?.role === 'UNIVERSITY_ADMIN' && unassignedCourses.length > 0 && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-end gap-3 mb-4">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Affecter à un nouveau cours
                    </label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Sélectionner un cours…</option>
                      {unassignedCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAssignCourse}
                    disabled={!selectedCourseId || assigning}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-60"
                  >
                    Affecter
                  </button>
                </div>
              )}
              {teacher.courses.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">Aucun cours attribué à cet enseignant.</p>
              ) : (
                teacher.courses.map((course) => {
                  // Calcul progression temps réel
                  const scheduledCourse = course as Course & { startHour?: number; durationHours?: number };
                  const parsedStartHour = course.startTime ? parseInt(String(course.startTime).split(':')[0], 10) : undefined;
                  const startHour = scheduledCourse.startHour ?? (
                    typeof parsedStartHour === 'number' && Number.isFinite(parsedStartHour) ? parsedStartHour : 8
                  );
                  const duration = scheduledCourse.durationHours ?? (course.duration ? course.duration / 60 : 2);
                  const status = getCourseStatus(now, course.date, startHour, duration);
                  const liveProgress = status === 'termine'
                    ? 100
                    : status === 'en_cours'
                    ? getCourseProgress(now, course.date, startHour, duration)
                    : (course.progress || 0);

                  const progressColor = status === 'termine'
                    ? 'bg-emerald-500'
                    : status === 'en_cours'
                    ? 'bg-indigo-500'
                    : 'bg-slate-300';

                  return (
                  <div key={course.id} className="card-premium p-4 bg-slate-50 border-none">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{course.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{course.code} · {course.filiere}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-lg">
                          Semestre {course.semester}
                        </span>
                        {status === 'termine' && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">✅ Terminé</span>
                        )}
                        {status === 'en_cours' && (
                          <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded-full border border-orange-200 animate-pulse">● En cours</span>
                        )}
                      </div>
                    </div>
                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progression du cours</span>
                        <span className="font-semibold text-slate-600">{liveProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${progressColor}`}
                          style={{ width: `${liveProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-2">
              {teacher.students.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">Aucun étudiant dans ses filières.</p>
              ) : (
                <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 pr-1">
                  {teacher.students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{student.name}</p>
                        <p className="text-xs text-slate-400 font-mono truncate">{student.studentId} · {student.filiere}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        student.status === 'actif' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {student.status === 'actif' ? 'Actif' : student.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, BookOpen, Users, Clock, Mail, Star, Award } from 'lucide-react';
import type { Teacher, Course, Student } from '../../types';
import StatusBadge from './StatusBadge';
import { Avatar } from './AvatarGroup';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: (Teacher & { courses: Course[]; students: Student[] }) | null;
}

export default function TeacherProfileModal({ isOpen, onClose, teacher }: TeacherProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'courses' | 'students'>('info');

  if (!isOpen || !teacher) return null;

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
            <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(teacher.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                />
              ))}
              <span className="text-xs text-slate-500 ml-1">{teacher.rating.toFixed(1)}/5</span>
            </div>
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
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-3">
              {teacher.courses.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">Aucun cours attribué à cet enseignant.</p>
              ) : (
                teacher.courses.map((course) => (
                  <div key={course.id} className="card-premium p-4 bg-slate-50 border-none">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{course.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{course.code} · {course.filiere}</p>
                      </div>
                      <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-lg">
                        Semestre {course.semester}
                      </span>
                    </div>
                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progression du cours</span>
                        <span className="font-semibold text-slate-600">{course.progress || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.progress || 0}%` }} />
                      </div>
                    </div>
                  </div>
                ))
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

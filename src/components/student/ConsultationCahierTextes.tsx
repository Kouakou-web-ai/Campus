import React, { useState } from 'react';
import { BookOpen, Calendar, User, FileText, Download, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import EmptyState from '../ui/EmptyState';

export default function ConsultationCahierTextes() {
  const { user } = useAuthStore();
  const { courses, cahierDeTextes, loading, students } = useRealtimeDataStore();
  const [selectedCourse, setSelectedCourse] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');

  // Find student profile to get filiere
  const currentStudent = students.find((s) => s.id === user?.id || s.email === user?.email);
  const studentFiliere = currentStudent?.filiere || user?.filiere || 'Informatique';

  // Get student's courses based on their filière
  const studentCourses = courses.filter((c) => c.filiere === studentFiliere);
  const studentCourseIds = studentCourses.map((c) => c.id);

  // Filter cahier de textes entries that belong to the student's courses
  const myEntries = cahierDeTextes.filter((entry) => studentCourseIds.includes(entry.courseId));

  // Filter by selected course and search term
  const filteredEntries = myEntries
    .filter((entry) => selectedCourse === 'tous' || entry.courseId === selectedCourse)
    .filter(
      (entry) =>
        entry.lessonTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Sort by date descending
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <span className="loading loading-spinner loading-md text-indigo-600"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-premium p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="text-indigo-500" size={16} />
            <span>Cahier de Textes Numérique</span>
          </h3>
          <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">
            Filière : {studentFiliere}
          </span>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un sujet, contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full sm:w-auto input-premium px-3 py-2 text-xs"
          >
            <option value="tous">Tous les cours</option>
            {studentCourses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Cahier de textes vide"
          description="Aucune séance de cours n'a été consignée par vos professeurs pour le moment."
        />
      ) : (
        <div className="relative border-l-2 border-indigo-150 pl-4 sm:pl-6 ml-4 space-y-8 py-2">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="relative animate-fade-up">
              {/* Dot on the vertical timeline line */}
              <div className="absolute -left-[25px] sm:-left-[33px] top-1.5 w-4.5 h-4.5 rounded-full bg-white border-4 border-indigo-500 flex items-center justify-center shadow-sm" />

              <div className="card-premium p-5 hover:shadow-lg transition-shadow bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {entry.courseCode || 'COURS'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {entry.lessonTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400">{entry.courseTitle}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1 text-[11px] text-slate-450">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar size={12} className="text-slate-400" />
                      {new Date(entry.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-slate-400" />
                      Prof. {entry.teacherName || 'Enseignant'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">
                  {entry.summary}
                </div>

                {/* Attachments / Homework links if present */}
                {(entry.attachmentUrl || entry.homeworkTitle) && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-2">
                    {entry.attachmentUrl && (
                      <a
                        href={entry.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download size={11} />
                        Télécharger : {entry.attachmentName || 'Support de cours'}
                      </a>
                    )}
                    {entry.homeworkTitle && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
                        <FileText size={11} />
                        Devoir associé : {entry.homeworkTitle}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

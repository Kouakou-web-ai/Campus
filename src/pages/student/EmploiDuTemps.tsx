import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { useNow, getCourseStatus } from '../../hooks/useNow';
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8h-19h

export default function EmploiDuTemps() {
  const { user } = useAuthStore();
  const { scheduleEvents, students, courses, loading } = useRealtimeDataStore();
  const [view] = useState<'semaine'>('semaine');
  const now = useNow(30_000);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  // Find logged-in student profile
  const studentProfile = students.find(s => s.id === user?.id);

  // Filter events by student's class (prioritized) or filiere & academic year
  const filteredEvents = scheduleEvents.filter(event => {
    if (!studentProfile) return true;
    
    // Find course of this event to match its class/filiere
    const course = courses.find(c => c.code === event.courseCode);
    if (!course) {
      // Fallback: match by title keywords if course doesn't match
      return event.title.toLowerCase().includes(studentProfile.filiere.toLowerCase());
    }

    // Match by class if both class information exists
    if (studentProfile.classeId && course.classeId) {
      return course.classeId === studentProfile.classeId;
    }

    const filiereMatches = course.filiere.toLowerCase() === studentProfile.filiere.toLowerCase();
    
    // Semesters 1-2 = Year 1, Semesters 3-4 = Year 2, Semesters 5-6 = Year 3
    const studentYear = studentProfile.annee || 1;
    const courseSemester = course.semester || 1;
    const courseYear = Math.ceil(courseSemester / 2);
    
    const yearMatches = courseYear === studentYear;

    return filiereMatches && yearMatches;
  });

  // Parse dynamic attributes (dayOfWeek, startHour) if they are missing from Firebase nodes
  const parsedEvents = filteredEvents.map(event => {
    let dayOfWeek = event.dayOfWeek;
    if (dayOfWeek === undefined && event.date) {
      // getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
      const day = new Date(event.date).getDay();
      // map to 0: Monday, 1: Tuesday, ..., 4: Friday
      dayOfWeek = day === 0 ? 6 : day - 1;
    }
    let startHour = event.startHour;
    if (startHour === undefined && event.startTime) {
      startHour = parseInt(event.startTime.split(':')[0], 10);
    }
    return {
      ...event,
      dayOfWeek: dayOfWeek ?? 0,
      startHour: startHour ?? 8
    };
  });

  // Calculate distinct subjects from schedule for legend
  const distinctSubjectsMap: Record<string, string> = {};
  parsedEvents.forEach(e => {
    distinctSubjectsMap[e.title] = e.color || '#6366f1';
  });
  const legendItems = Object.entries(distinctSubjectsMap);

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Emploi du temps"
        description="Planning de la semaine en cours mis à jour en temps réel"
        breadcrumbs={[{ label: 'Étudiant' }, { label: 'Emploi du temps' }]}
        actions={
          <button className="text-sm text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            Exporter ICS
          </button>
        }
      />

      {/* Calendar grid */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header jours */}
            <div className="grid grid-cols-6 border-b border-slate-100 bg-slate-50/50">
              <div className="p-3" />
              {DAYS.map((day, i) => (
                <div key={i} className="p-3 text-center border-l border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase">{day.slice(0, 3)}</p>
                </div>
              ))}
            </div>

            {/* Grid heures */}
            <div className="relative">
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-6 border-b border-slate-50 min-h-14">
                  <div className="p-2 text-xs text-slate-400 text-right pr-3 pt-1 border-r border-slate-100 bg-slate-50/20">
                    {hour}h
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const events = parsedEvents.filter(
                      e => e.dayOfWeek === dayIdx && e.startHour === hour
                    );
                    return (
                      <div key={dayIdx} className="border-l border-slate-50 p-1 relative min-h-[56px]">
                        {events.map(event => (
                          <div
                            key={event.id}
                            className="rounded-xl p-2 cursor-pointer hover:opacity-90 transition-opacity group text-white select-none animate-fade-up shadow-sm flex flex-col justify-between"
                            style={{
                              background: event.color || '#6366f1',
                              minHeight: `${(event.durationHours || 2) * 56 - 8}px`,
                              position: 'absolute',
                              top: '4px',
                              left: '4px',
                              right: '4px',
                              zIndex: 10
                            }}
                          >
                            <div>
                              <p className="font-semibold text-xs leading-tight truncate">{event.title}</p>
                              {event.teacher && (
                                <p className="text-white/80 text-[10px] mt-0.5 truncate">{event.teacher}</p>
                              )}
                              {/* Badge statut temps réel */}
                              {(() => {
                                const status = getCourseStatus(now, event.date, event.startHour ?? 8, event.durationHours || 2);
                                if (status === 'termine') return (
                                  <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[8px] font-bold text-white border border-white/30">
                                    ✅ Terminé
                                  </span>
                                );
                                if (status === 'en_cours') return (
                                  <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-full bg-orange-400/80 text-[8px] font-bold text-white animate-pulse">
                                    ● En cours
                                  </span>
                                );
                                return null;
                              })()}
                            </div>
                            <div>
                              <p className="text-white/70 text-[9px] truncate">{event.room}</p>
                              <p className="text-white/60 text-[8px] mt-0.5">
                                {event.startHour}h – {event.startHour + (event.durationHours || 2)}h
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      {legendItems.length > 0 && (
        <div className="flex items-center gap-4 flex-wrap p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Légende :</p>
          {legendItems.map(([title, color]) => (
            <div key={title} className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
              {title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

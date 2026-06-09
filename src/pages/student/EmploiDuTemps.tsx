import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8h-19h

export default function EmploiDuTemps() {
  const { user } = useAuthStore();
  const { scheduleEvents, students, courses, loading } = useRealtimeDataStore();
  const [view] = useState<'semaine'>('semaine');

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  // Find logged-in student profile
  const studentProfile = students.find(s => s.id === user?.id);

  // Filter events by student's filiere & academic year
  const filteredEvents = scheduleEvents.filter(event => {
    if (!studentProfile) return true;
    
    // Find course of this event to match its filiere
    const course = courses.find(c => c.code === event.courseCode);
    if (!course) {
      // Fallback: match by title keywords if course doesn't match
      return event.title.toLowerCase().includes(studentProfile.filiere.toLowerCase());
    }

    const filiereMatches = course.filiere.toLowerCase() === studentProfile.filiere.toLowerCase();
    
    // Semesters 1-2 = Year 1, Semesters 3-4 = Year 2, Semesters 5-6 = Year 3
    const studentYear = studentProfile.annee || 1;
    const courseSemester = course.semester || 1;
    const courseYear = Math.ceil(courseSemester / 2);
    
    const yearMatches = courseYear === studentYear;

    return filiereMatches && yearMatches;
  });

  // Calculate distinct subjects from schedule for legend
  const distinctSubjectsMap: Record<string, string> = {};
  filteredEvents.forEach(e => {
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
                    const events = filteredEvents.filter(
                      e => e.dayOfWeek === dayIdx && e.startHour === hour
                    );
                    return (
                      <div key={dayIdx} className="border-l border-slate-50 p-1 relative min-h-[56px]">
                        {events.map(event => (
                          <div
                            key={event.id}
                            className="rounded-xl p-2 cursor-pointer hover:opacity-90 transition-opacity group text-white select-none animate-fade-up shadow-sm"
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
                            <p className="font-semibold text-xs leading-tight truncate">{event.title}</p>
                            <p className="text-white/70 text-[10px] mt-1 truncate">{event.room}</p>
                            <p className="text-white/60 text-[9px] mt-0.5">
                              {event.startHour}h – {event.startHour + (event.durationHours || 2)}h
                            </p>
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

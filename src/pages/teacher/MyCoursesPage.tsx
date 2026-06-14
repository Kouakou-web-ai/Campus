import { useState } from 'react';
import { BookOpen, Users, Clock, BarChart3, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import ProgressRing from '../../components/ui/ProgressRing';

interface TeacherCourse {
  id: string;
  title: string;
  code: string;
  filiere: string;
  semester: number;
  credits: number;
  studentsEnrolled: number;
  studentsMax: number;
  progress: number;
  schedule: string;
  status: 'en_cours' | 'planifie' | 'termine';
}

const MOCK_COURSES: TeacherCourse[] = [
  { id: '1', title: 'Algorithmique & Structures de Données', code: 'INF-201', filiere: 'Informatique', semester: 1, credits: 6, studentsEnrolled: 120, studentsMax: 150, progress: 65, schedule: 'Lun/Mer 08:00-10:00', status: 'en_cours' },
  { id: '2', title: 'Architecture Logicielle', code: 'INF-401', filiere: 'Génie Logiciel', semester: 1, credits: 4, studentsEnrolled: 45, studentsMax: 50, progress: 72, schedule: 'Mar/Jeu 14:00-16:00', status: 'en_cours' },
  { id: '3', title: 'Intelligence Artificielle', code: 'INF-501', filiere: 'Informatique', semester: 2, credits: 5, studentsEnrolled: 80, studentsMax: 100, progress: 30, schedule: 'Ven 10:00-13:00', status: 'en_cours' },
  { id: '4', title: 'Bases de Données Avancées', code: 'INF-302', filiere: 'Informatique', semester: 1, credits: 4, studentsEnrolled: 95, studentsMax: 120, progress: 88, schedule: 'Mer 14:00-17:00', status: 'en_cours' },
  { id: '5', title: 'Compilation', code: 'INF-410', filiere: 'Informatique', semester: 2, credits: 3, studentsEnrolled: 0, studentsMax: 40, progress: 0, schedule: 'Non planifié', status: 'planifie' },
  { id: '6', title: 'Réseaux & Protocoles', code: 'INF-310', filiere: 'Réseaux', semester: 1, credits: 5, studentsEnrolled: 60, studentsMax: 60, progress: 100, schedule: 'Lun/Jeu 10:00-12:00', status: 'termine' },
];

const STATUS_STYLES: Record<string, { label: string; class: string }> = {
  en_cours: { label: 'En cours', class: 'bg-sky-50 text-sky-700 border-sky-200' },
  planifie: { label: 'Planifié', class: 'bg-violet-50 text-violet-700 border-violet-200' },
  termine: { label: 'Terminé', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function MyCoursesPage() {
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('tous');

  const filtered = MOCK_COURSES.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
    const matchSemester = filterSemester === 'tous' || c.semester === Number(filterSemester);
    return matchSearch && matchSemester;
  });

  const totalStudents = MOCK_COURSES.reduce((s, c) => s + c.studentsEnrolled, 0);
  const totalCredits = MOCK_COURSES.reduce((s, c) => s + c.credits, 0);
  const avgProgress = Math.round(MOCK_COURSES.filter((c) => c.status === 'en_cours').reduce((s, c) => s + c.progress, 0) / MOCK_COURSES.filter((c) => c.status === 'en_cours').length);

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Mes cours enseignés"
        description="Gérez le contenu et suivez la progression de vos matières."
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Mes Cours' }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Cours actifs" value={MOCK_COURSES.filter((c) => c.status === 'en_cours').length} icon={<BookOpen size={20} className="text-indigo-600" />} gradient="bg-indigo-100" />
        <StatCard title="Total étudiants" value={totalStudents} icon={<Users size={20} className="text-emerald-600" />} gradient="bg-emerald-100" trend={5} trendLabel="vs mois dernier" />
        <StatCard title="Crédits ECTS" value={totalCredits} icon={<BarChart3 size={20} className="text-amber-600" />} gradient="bg-amber-100" />
        <StatCard title="Progression moy." value={`${avgProgress}%`} icon={<Clock size={20} className="text-sky-600" />} gradient="bg-sky-100" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un cours…"
            className="input-premium w-full pl-9 pr-4 py-2 text-sm"
          />
        </div>
        <select
          value={filterSemester}
          onChange={(e) => setFilterSemester(e.target.value)}
          className="input-premium px-3 py-2 text-sm"
        >
          <option value="tous">Tous semestres</option>
          <option value="1">Semestre 1</option>
          <option value="2">Semestre 2</option>
        </select>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} cours</span>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((course) => (
          <Card key={course.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{course.code}</span>
                  <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${STATUS_STYLES[course.status].class}`}>
                    {STATUS_STYLES[course.status].label}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm leading-tight">{course.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{course.filiere} · S{course.semester} · {course.credits} ECTS</p>
              </div>
              <ProgressRing value={course.progress} size={56} strokeWidth={5} />
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Users size={13} /> {course.studentsEnrolled}/{course.studentsMax}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {course.schedule}</span>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-surface-raised p-4 rounded-full mb-4">
            <BookOpen className="w-10 h-10 text-content-muted" />
          </div>
          <h3 className="text-lg font-semibold text-content mb-2">Aucun cours trouvé</h3>
          <p className="text-content-secondary max-w-sm">Modifiez vos filtres pour afficher d'autres résultats.</p>
        </div>
      )}
    </div>
  );
}
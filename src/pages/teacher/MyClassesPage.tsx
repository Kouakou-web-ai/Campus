import { useState } from 'react';
import { Users, BookOpen, Award, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import SearchBar from '../../components/ui/SearchBar';

interface ClassGroup {
  id: string;
  name: string;
  level: string;
  subject: string;
  effectif: number;
  averageGrade: number;
  passRate: number;
  schedule: string;
  students: { name: string; average: number; status: 'actif' | 'en_attente' }[];
}

const MOCK_CLASSES: ClassGroup[] = [
  {
    id: '1', name: 'Master 1 Informatique — TD A', level: 'Master 1', subject: 'Algorithmique', effectif: 28, averageGrade: 13.5, passRate: 82, schedule: 'Lun 10:15-12:15',
    students: [
      { name: 'Yao Kouassi Serge', average: 16.2, status: 'actif' },
      { name: 'Aya Konaté', average: 14.8, status: 'actif' },
      { name: 'Moussa Diallo', average: 11.3, status: 'actif' },
      { name: 'Aminata Touré', average: 15.1, status: 'actif' },
      { name: 'Jean-Marc Brou', average: 9.4, status: 'en_attente' },
    ],
  },
  {
    id: '2', name: 'Master 1 Informatique — TD B', level: 'Master 1', subject: 'Algorithmique', effectif: 30, averageGrade: 12.8, passRate: 77, schedule: 'Mar 10:15-12:15',
    students: [
      { name: 'Fatou Sylla', average: 14.0, status: 'actif' },
      { name: 'Ibrahim Koné', average: 12.5, status: 'actif' },
      { name: 'Marie Assou', average: 10.2, status: 'actif' },
    ],
  },
  {
    id: '3', name: 'Master 2 Génie Logiciel', level: 'Master 2', subject: 'Architecture Logicielle', effectif: 15, averageGrade: 14.7, passRate: 93, schedule: 'Jeu 14:00-16:00',
    students: [
      { name: 'Paul Eba', average: 17.3, status: 'actif' },
      { name: 'Claire N\'Guessan', average: 15.8, status: 'actif' },
    ],
  },
  {
    id: '4', name: 'Licence 3 Informatique — TP1', level: 'Licence 3', subject: 'Bases de Données Avancées', effectif: 24, averageGrade: 11.9, passRate: 67, schedule: 'Mer 14:00-17:00',
    students: [
      { name: 'Adama Cissé', average: 13.5, status: 'actif' },
      { name: 'Koffi Amani', average: 8.7, status: 'actif' },
    ],
  },
  {
    id: '5', name: 'Licence 3 Réseaux', level: 'Licence 3', subject: 'Réseaux & Protocoles', effectif: 32, averageGrade: 13.1, passRate: 78, schedule: 'Ven 08:00-10:00',
    students: [
      { name: 'Oumar Bamba', average: 14.2, status: 'actif' },
    ],
  },
];

export default function MyClassesPage() {
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('tous');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const subjects = [...new Set(MOCK_CLASSES.map((c) => c.subject))];

  const filtered = MOCK_CLASSES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === 'tous' || c.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const totalStudents = MOCK_CLASSES.reduce((s, c) => s + c.effectif, 0);
  const avgGrade = MOCK_CLASSES.reduce((s, c) => s + c.averageGrade, 0) / MOCK_CLASSES.length;
  const avgPassRate = Math.round(MOCK_CLASSES.reduce((s, c) => s + c.passRate, 0) / MOCK_CLASSES.length);

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Mes classes & groupes"
        description="Liste des étudiants sous votre supervision académique."
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Mes Classes' }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Groupes" value={MOCK_CLASSES.length} icon={<Users size={20} className="text-indigo-600" />} gradient="bg-indigo-100" />
        <StatCard title="Total étudiants" value={totalStudents} icon={<BookOpen size={20} className="text-emerald-600" />} gradient="bg-emerald-100" />
        <StatCard title="Moyenne générale" value={`${avgGrade.toFixed(1)}/20`} icon={<Award size={20} className="text-amber-600" />} gradient="bg-amber-100" />
        <StatCard title="Taux de réussite" value={`${avgPassRate}%`} icon={<Eye size={20} className="text-sky-600" />} gradient="bg-sky-100" />
      </div>

      <div className="card-premium overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-slate-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Chercher classe, matière…" className="w-full sm:w-64" />
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="input-premium px-3 py-2 text-sm">
            <option value="tous">Toutes matières</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-400">{filtered.length} groupe(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-premium">
            <thead>
              <tr>
                <th>Classe / TD</th>
                <th>Matière</th>
                <th>Effectif</th>
                <th>Moyenne</th>
                <th>Réussite</th>
                <th>Horaire</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cls) => (
                <>
                  <tr key={cls.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === cls.id ? null : cls.id)}>
                    <td>
                      <div>
                        <p className="font-semibold text-sm text-slate-800">{cls.name}</p>
                        <p className="text-xs text-slate-400">{cls.level}</p>
                      </div>
                    </td>
                    <td className="text-sm text-slate-600">{cls.subject}</td>
                    <td>
                      <span className="flex items-center gap-1 text-sm text-slate-700"><Users size={14} /> {cls.effectif}</span>
                    </td>
                    <td>
                      <span className={`font-bold text-sm ${cls.averageGrade >= 14 ? 'text-emerald-600' : cls.averageGrade >= 10 ? 'text-amber-600' : 'text-red-500'}`}>
                        {cls.averageGrade.toFixed(1)}/20
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 min-w-20">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                          <div
                            className={`h-full rounded-full ${cls.passRate >= 80 ? 'bg-emerald-400' : cls.passRate >= 60 ? 'bg-amber-400' : 'bg-red-400'}`}
                            style={{ width: `${cls.passRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{cls.passRate}%</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500">{cls.schedule}</td>
                    <td>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                        {expandedId === cls.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === cls.id && (
                    <tr key={`${cls.id}-detail`}>
                      <td colSpan={7} className="bg-slate-50/50 px-8 py-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {cls.students.map((st, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                              <span className="text-sm font-medium text-slate-700">{st.name}</span>
                              <span className={`text-xs font-bold ${st.average >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {st.average.toFixed(1)}/20
                              </span>
                            </div>
                          ))}
                          {cls.students.length < cls.effectif && (
                            <div className="flex items-center justify-center p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-400">
                              + {cls.effectif - cls.students.length} autres étudiants
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { BookOpen, FolderCheck, MessageSquare, Clock, Users, TrendingUp, FileText, Calendar } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';

interface RecentSubmission {
  id: string;
  studentName: string;
  assignment: string;
  course: string;
  date: string;
  status: 'rendu' | 'en_retard' | 'corrigé';
}

interface ScheduleItem {
  id: string;
  time: string;
  course: string;
  room: string;
  type: 'CM' | 'TD' | 'TP';
  students: number;
}

const MOCK_SUBMISSIONS: RecentSubmission[] = [
  { id: '1', studentName: 'Yao Kouassi Serge', assignment: 'TP Arbres Binaires', course: 'Algorithmique', date: '11/06/2026 08:45', status: 'rendu' },
  { id: '2', studentName: 'Aya Konaté', assignment: 'Projet React', course: 'Architecture Logicielle', date: '10/06/2026 23:59', status: 'en_retard' },
  { id: '3', studentName: 'Moussa Diallo', assignment: 'Examen MI-Parcours', course: 'Algorithmique', date: '10/06/2026 14:00', status: 'corrigé' },
  { id: '4', studentName: 'Aminata Touré', assignment: 'TP Design Patterns', course: 'Architecture Logicielle', date: '09/06/2026 16:30', status: 'rendu' },
  { id: '5', studentName: 'Jean-Marc Brou', assignment: 'TP Arbres Binaires', course: 'Algorithmique', date: '09/06/2026 10:15', status: 'corrigé' },
];

const MOCK_SCHEDULE: ScheduleItem[] = [
  { id: '1', time: '08:00 – 10:00', course: 'Algorithmique', room: 'Amphi A', type: 'CM', students: 120 },
  { id: '2', time: '10:15 – 12:15', course: 'Algorithmique', room: 'Salle 104', type: 'TD', students: 28 },
  { id: '3', time: '14:00 – 16:00', course: 'Architecture Logicielle', room: 'Labo Info 2', type: 'TP', students: 15 },
];

const ACTIVITIES = [
  { text: 'Moussa Diallo a rendu « Projet React »', time: 'Il y a 2h', color: 'bg-emerald-500' },
  { text: 'Nouveau message de Aya Konaté', time: 'Il y a 3h', color: 'bg-indigo-500' },
  { text: 'Note ajoutée : Serge Yao — 16/20', time: 'Hier, 18:30', color: 'bg-amber-500' },
  { text: '3 nouveaux inscrits au cours Algorithmique', time: 'Hier, 09:00', color: 'bg-sky-500' },
];

const STATUS_STYLES: Record<string, string> = {
  rendu: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  en_retard: 'bg-red-50 text-red-700 border-red-200',
  corrigé: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const STATUS_LABELS: Record<string, string> = {
  rendu: 'Rendu',
  en_retard: 'En retard',
  corrigé: 'Corrigé',
};

const TYPE_STYLES: Record<string, string> = {
  CM: 'bg-indigo-100 text-indigo-700',
  TD: 'bg-amber-100 text-amber-700',
  TP: 'bg-emerald-100 text-emerald-700',
};

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'submissions'>('schedule');

  const STATS = [
    { title: 'Cours actifs', value: 4, icon: <BookOpen size={20} className="text-indigo-600" />, gradient: 'bg-indigo-100', trend: 1, trendLabel: 'ce semestre' },
    { title: 'Devoirs en attente', value: 18, icon: <FolderCheck size={20} className="text-amber-600" />, gradient: 'bg-amber-100', trend: -3, trendLabel: 'vs semaine dernière' },
    { title: 'Nouveaux messages', value: 7, icon: <MessageSquare size={20} className="text-sky-600" />, gradient: 'bg-sky-100' },
    { title: 'Heures / semaine', value: '24h', icon: <Clock size={20} className="text-emerald-600" />, gradient: 'bg-emerald-100', trend: 2, trendLabel: 'vs semaine dernière' },
  ];

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Espace Enseignant"
        description="Bienvenue. Suivez vos cours, travaux et interactions."
        breadcrumbs={[{ label: 'Enseignant' }, { label: 'Tableau de bord' }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed bg-surface-raised p-1 w-full max-w-md">
        <button
          type="button"
          role="tab"
          className={`tab flex-1 gap-2 ${activeTab === 'schedule' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <Calendar size={16} />
          Aujourd'hui
        </button>
        <button
          type="button"
          role="tab"
          className={`tab flex-1 gap-2 ${activeTab === 'submissions' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <FileText size={16} />
          Rendus récents
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {activeTab === 'schedule' ? (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Planning du jour</h3>
                <span className="text-xs text-slate-400">Mercredi 11 Juin 2026</span>
              </div>
              <div className="space-y-3">
                {MOCK_SCHEDULE.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="flex flex-col items-center w-20 flex-shrink-0">
                      <span className="text-sm font-bold text-slate-800">{item.time.split('–')[0].trim()}</span>
                      <span className="text-xs text-slate-400">{item.time.split('–')[1]?.trim()}</span>
                    </div>
                    <div className="w-px h-10 bg-slate-200" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-800">{item.course}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLES[item.type]}`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{item.room}</span>
                        <span className="flex items-center gap-1"><Users size={12} /> {item.students}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Derniers travaux rendus</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-premium">
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Devoir</th>
                      <th>Cours</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_SUBMISSIONS.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="font-medium text-slate-800 text-sm">{sub.studentName}</td>
                        <td className="text-sm text-slate-600">{sub.assignment}</td>
                        <td className="text-sm text-slate-500">{sub.course}</td>
                        <td className="text-xs text-slate-400">{sub.date}</td>
                        <td>
                          <span className={`inline-flex items-center text-xs font-semibold border rounded-full px-2 py-0.5 ${STATUS_STYLES[sub.status]}`}>
                            {STATUS_LABELS[sub.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Activity feed */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-900">Activité récente</h3>
          </div>
          <div className="space-y-4">
            {ACTIVITIES.map((act, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${act.color}`} />
                <div>
                  <p className="text-sm text-slate-700">{act.text}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
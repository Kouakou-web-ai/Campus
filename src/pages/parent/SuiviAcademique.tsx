import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import ChartCard from '../../components/ui/ChartCard';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { Award, Link2 } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../../../firebase-config';

const getMentionColor = (note: number) => {
  if (note >= 16) return 'text-violet-600 bg-violet-50';
  if (note >= 14) return 'text-emerald-600 bg-emerald-50';
  if (note >= 12) return 'text-blue-600 bg-blue-50';
  if (note >= 10) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

export default function SuiviAcademique() {
  const { user } = useAuthStore();
  const { students, grades, courses } = useRealtimeDataStore();
  const [linkedIds, setLinkedIds] = useState<string[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Subscribe to parent's linked children in Firebase
  useEffect(() => {
    if (!user) return;
    const enfantsRef = ref(db, `utilisateurs/${user.id}/enfants`);
    const unsub = onValue(enfantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLinkedIds(Object.keys(data));
      } else {
        setLinkedIds([]);
      }
    });
    return () => off(enfantsRef, 'value', unsub);
  }, [user]);

  const myChildren = students.filter(s => linkedIds.includes(s.id));

  useEffect(() => {
    if (myChildren.length > 0 && !selectedStudentId) {
      setSelectedStudentId(myChildren[0].id);
    }
  }, [myChildren, selectedStudentId]);

  const child = myChildren.find(s => s.id === selectedStudentId);

  // Filter child grades
  const childGrades = child ? grades.filter(g => g.studentId === child.id && g.note !== undefined) : [];
  
  const subjects = childGrades.map((g) => {
    const course = courses.find(c => c.id === g.courseId);
    const note = g.note ?? 0;
    
    let mention = 'Insuffisant';
    if (note >= 16) mention = 'Très Bien';
    else if (note >= 14) mention = 'Bien';
    else if (note >= 12) mention = 'Assez Bien';
    else if (note >= 10) mention = 'Passable';

    return {
      name: course ? course.title : 'Matière',
      code: course ? course.code : 'CODE-000',
      note,
      coeff: course ? course.credits || 4 : 4,
      semester: course ? course.semester || 1 : 1,
      mention
    };
  });

  const totalCoeff = subjects.reduce((sum, sub) => sum + sub.coeff, 0);
  const weightedAvg = totalCoeff > 0 
    ? (subjects.reduce((sum, sub) => sum + sub.note * sub.coeff, 0) / totalCoeff)
    : 0;

  const maxNote = subjects.length > 0 ? Math.max(...subjects.map(s => s.note)) : 0;
  const minNote = subjects.length > 0 ? Math.min(...subjects.map(s => s.note)) : 0;

  // Radar data
  const radarData = subjects.map(s => ({
    subject: s.code || s.name.slice(0, 5),
    score: s.note
  }));

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Suivi académique"
        description="Résultats et progression académique de votre enfant en temps réel"
        breadcrumbs={[{ label: 'Parent' }, { label: 'Académique' }]}
      />

      {myChildren.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-md max-w-lg mx-auto animate-fade-up">
          <Link2 className="mx-auto text-indigo-500 mb-4 animate-bounce" size={48} />
          <h3 className="text-lg font-bold text-slate-800">Aucun enfant lié</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 mb-6">
            Veuillez d'abord lier le compte de votre enfant avec son matricule et son adresse e-mail.
          </p>
          <Link
            to="/app/parent"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5 rounded-xl transition-colors shadow-md"
          >
            Lier un enfant
          </Link>
        </div>
      ) : (
        <>
          {/* Child selection dropdown - ONLY visible if multiple children exist */}
          {myChildren.length > 1 && (
            <div className="card-premium p-4 flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600 flex-shrink-0">Sélectionner votre enfant :</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="input-premium flex-1 max-w-xs px-3 py-2 text-sm"
              >
                {myChildren.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>
                ))}
              </select>
            </div>
          )}

          {child && (
            <>
              {subjects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                  <p className="text-slate-400 text-sm">Aucune note n'a encore été publiée pour cet étudiant.</p>
                </div>
              ) : (
                <>
                  {/* Résumé */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up">
                    {[
                      { label: 'Moyenne générale', value: `${weightedAvg.toFixed(2)}/20`, color: 'text-indigo-600' },
                      { label: 'Matières validées', value: `${subjects.filter(s => s.note >= 10).length}/${subjects.length}`, color: 'text-emerald-600' },
                      { label: 'Meilleure note', value: `${maxNote}/20`, color: 'text-violet-600' },
                      { label: 'Note minimale', value: `${minNote}/20`, color: 'text-amber-600' },
                    ].map(stat => (
                      <div key={stat.label} className="card-premium p-5 text-center">
                        <div className={`text-2xl font-bold font-heading ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 gap-4 animate-fade-up">
                    <ChartCard title="Profil de compétences" subtitle="Par matière — Semestre actuel">
                      <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                          <Radar name="Notes" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartCard>
                  </div>

                  {/* Détail matières */}
                  <div className="card-premium overflow-hidden animate-fade-up">
                    <div className="px-6 py-4 border-b border-slate-100">
                      <h3 className="text-base font-semibold text-slate-800">Détail par matière</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {subjects.map((sub, i) => {
                        const pct = (sub.note / 20) * 100;
                        return (
                          <div key={i} className="flex items-center gap-4 px-6 py-4 flex-wrap sm:flex-nowrap">
                            <div className="w-48 flex-shrink-0">
                              <p className="text-sm font-semibold text-slate-700">{sub.name}</p>
                              <p className="text-[10px] text-slate-400">Semestre {sub.semester} · Coeff. {sub.coeff} · {sub.code}</p>
                            </div>
                            <div className="flex-1 min-w-[150px]">
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${sub.note >= 14 ? 'bg-emerald-400' : sub.note >= 10 ? 'bg-amber-400' : 'bg-red-400'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-auto">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getMentionColor(sub.note)}`}>
                                {sub.mention}
                              </span>
                              <span className={`text-sm font-bold w-12 text-right ${
                                sub.note >= 14 ? 'text-emerald-600' : sub.note >= 10 ? 'text-amber-600' : 'text-red-500'
                              }`}>
                                {sub.note}/20
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

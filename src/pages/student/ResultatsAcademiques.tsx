import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import ChartCard from '../../components/ui/ChartCard';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { exportBulletinPDF } from '../../services/pdfService';

const getMentionColor = (note: number) => {
  if (note >= 16) return 'text-violet-600 bg-violet-50';
  if (note >= 14) return 'text-emerald-600 bg-emerald-50';
  if (note >= 12) return 'text-blue-600 bg-blue-50';
  if (note >= 10) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

export default function ResultatsAcademiques() {
  const { user } = useAuthStore();
  const { grades, courses, students, currentUniversity, loading } = useRealtimeDataStore();

  const studentProfile = students.find(s => s.id === user?.id);

  const studentGrades = grades.filter(g => g.studentId === user?.id && g.note !== undefined);
  
  const subjects = studentGrades.map((g) => {
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
      mention
    };
  });

  const totalCoeff = subjects.reduce((sum, sub) => sum + sub.coeff, 0);
  const weightedAvg = totalCoeff > 0 
    ? (subjects.reduce((sum, sub) => sum + sub.note * sub.coeff, 0) / totalCoeff)
    : 0;

  const totalCredits = subjects.filter(s => s.note >= 10).reduce((sum, s) => sum + s.coeff, 0);

  // Radar data
  const radarData = subjects.map(s => ({
    subject: s.code || s.name.slice(0, 5),
    score: s.note
  }));

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <span className="loading loading-spinner loading-lg text-indigo-600"></span>
      </div>
    );
  }

  return (
    <div className="page-transition space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-bulletin, #printable-bulletin * {
            visibility: visible;
          }
          #printable-bulletin {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      <PageHeader
        title="Résultats académiques"
        description="Bulletin de notes et progression académique en temps réel"
        breadcrumbs={[{ label: 'Étudiant' }, { label: 'Résultats' }]}
        actions={
          <button 
            onClick={() => exportBulletinPDF(
              studentProfile?.name || user?.name || 'Étudiant',
              studentProfile?.studentId || 'Matricule',
              studentProfile?.filiere || 'Informatique',
              1, // semestre
              subjects.map(s => ({
                subject: s.name,
                value: s.note,
                coefficient: s.coeff
              }))
            )}
            className="text-sm font-semibold text-white bg-indigo-600 border border-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-1.5 active:scale-95"
          >
            Télécharger bulletin PDF
          </button>
        }
      />

      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-md">
          <p className="text-slate-400 text-sm">Vos notes n'ont pas encore été publiées par vos enseignants.</p>
        </div>
      ) : (
        <>
          {/* Moyenne hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-premium p-6 text-center bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100 col-span-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Moyenne générale</p>
              <div className="text-5xl font-extrabold font-heading gradient-text">{weightedAvg.toFixed(2)}</div>
              <div className="text-slate-400 text-sm mt-1">/20</div>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Mention {weightedAvg >= 16 ? 'Très Bien' : weightedAvg >= 14 ? 'Bien' : weightedAvg >= 12 ? 'Assez Bien' : weightedAvg >= 10 ? 'Passable' : 'Insuffisant'}
              </div>
            </div>
            <div className="card-premium p-5 text-center flex flex-col justify-center">
              <p className="text-xs text-slate-400 mb-1">Crédits validés</p>
              <div className="text-3xl font-bold text-slate-800">{totalCredits} / {totalCoeff}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">✓ Semestre en cours</div>
            </div>
            <div className="card-premium p-5 text-center flex flex-col justify-center">
              <p className="text-xs text-slate-400 mb-1">Statut académique</p>
              <div className="text-2xl font-bold text-slate-800">{weightedAvg >= 10 ? 'Admis' : 'En attente'}</div>
              <p className="text-xs text-slate-400 mt-1">Moyenne de validation: 10/20</p>
            </div>
          </div>

          {/* Notes table */}
          <div className="card-premium overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">Détail des notes</h3>
            </div>
            <table className="w-full table-premium">
              <thead>
                <tr>
                  <th>Matière</th>
                  <th className="text-center">Coeff. (Crédits)</th>
                  <th className="text-center">Note</th>
                  <th>Mention</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, i) => (
                  <tr key={i}>
                    <td>
                      <p className="font-medium text-slate-800 text-sm">{sub.name}</p>
                      <p className="text-xs text-slate-400">{sub.code}</p>
                    </td>
                    <td className="text-center text-sm text-slate-500">{sub.coeff}</td>
                    <td className="text-center">
                      <span className={`font-bold text-lg ${sub.note >= 14 ? 'text-emerald-600' : sub.note >= 10 ? 'text-amber-600' : 'text-red-500'}`}>
                        {sub.note}
                      </span>
                      <span className="text-slate-400 text-sm">/20</span>
                    </td>
                    <td>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getMentionColor(sub.note)}`}>
                        {sub.mention}
                      </span>
                    </td>
                    <td>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div
                          className={`h-full rounded-full ${sub.note >= 14 ? 'bg-emerald-400' : sub.note >= 10 ? 'bg-amber-400' : 'bg-red-400'}`}
                          style={{ width: `${(sub.note / 20) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4">
            <ChartCard title="Compétences par matière" subtitle="Radar de performance">
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Radar name="Notes" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}

      {/* Hidden bulletin template for print */}
      <div id="printable-bulletin" className="hidden print:block p-10 bg-white border border-slate-200 rounded-3xl font-sans text-slate-800 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wider uppercase font-heading">{currentUniversity?.name || 'CAMPUS Établissement'}</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{currentUniversity?.city}, {currentUniversity?.country}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-extrabold text-slate-950 font-heading">BULLETIN DE NOTES</h2>
            <p className="text-xs text-slate-500">Semestre en cours · {new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Info élève */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Étudiant</p>
            <p className="font-bold text-slate-800 mt-0.5">{studentProfile?.name || user?.name}</p>
            <p className="text-xs text-slate-500">N° Matricule : {studentProfile?.studentId || 'ETU-2026-8291'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cursus académique</p>
            <p className="font-semibold text-slate-800 mt-0.5">{studentProfile?.filiere || 'Informatique'}</p>
            <p className="text-xs text-slate-500">Année d'étude : {studentProfile?.annee || 1}ère année</p>
          </div>
        </div>

        {/* Tableau des notes */}
        <table className="w-full text-sm border-collapse mt-6">
          <thead>
            <tr className="border-b border-slate-400 text-slate-500 uppercase text-xs font-bold">
              <th className="text-left py-2">Matière</th>
              <th className="text-center py-2">Coeff / Crédits</th>
              <th className="text-center py-2">Note /20</th>
              <th className="text-right py-2">Mention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {subjects.map((sub, idx) => (
              <tr key={idx} className="py-2 text-slate-700">
                <td className="py-3 font-semibold text-slate-900">{sub.name}</td>
                <td className="text-center py-3">{sub.coeff}</td>
                <td className="text-center py-3 font-bold text-slate-950">{sub.note}</td>
                <td className="text-right py-3 font-medium text-slate-800">{sub.mention}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Synthèse finale */}
        <div className="border-t-2 border-slate-900 pt-4 flex justify-between items-center bg-slate-50 p-4 rounded-2xl mt-6">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Statut Académique</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">
              {weightedAvg >= 10 ? 'ADMIS' : 'AJOURNÉ'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Moyenne Générale</p>
            <p className="text-3xl font-extrabold text-indigo-600 mt-0.5">{weightedAvg.toFixed(2)}/20</p>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-10 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-bold uppercase tracking-wider text-slate-500">Le Secrétariat Académique</p>
            <p className="text-slate-400 mt-8 font-mono">[ Signature & Cachet Numérique ]</p>
          </div>
          <div className="text-right">
            <p className="font-bold uppercase tracking-wider text-slate-500">La Direction</p>
            <p className="text-slate-400 mt-8 font-mono">[ Signé numériquement ]</p>
          </div>
        </div>
      </div>
    </div>
  );
}

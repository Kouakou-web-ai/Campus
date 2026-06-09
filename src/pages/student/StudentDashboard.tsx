import { BookOpen, Trophy, CreditCard } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mon Espace Étudiant</h1>
      <p className="text-base-content/70">Accédez rapidement à vos cours et notes récents.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body">
            <BookOpen className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-bold text-sm">Cours Inscrits</h3>
            <p className="text-2xl font-extrabold">6 cours</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body">
            <Trophy className="w-8 h-8 text-success mb-2" />
            <h3 className="font-bold text-sm">Moyenne Générale</h3>
            <p className="text-2xl font-extrabold">15.2 / 20</p>
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body">
            <CreditCard className="w-8 h-8 text-warning mb-2" />
            <h3 className="font-bold text-sm">Prochaine Échéance</h3>
            <p className="text-lg font-bold">1 200 000 FCFA (01/09)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
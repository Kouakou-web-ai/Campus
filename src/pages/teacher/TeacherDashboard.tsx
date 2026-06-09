import { BookOpen, FolderCheck, MessageSquare } from 'lucide-react';

export default function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Espace Enseignant</h1>
      <p className="text-base-content/70">Bienvenue. Suivez vos cours et travaux à corriger.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-300 shadow hover-scale">
          <div className="card-body flex-row items-center gap-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <div>
              <p className="text-xs text-base-content/50">Mes Cours Actifs</p>
              <p className="font-extrabold text-2xl">4</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow hover-scale">
          <div className="card-body flex-row items-center gap-4">
            <FolderCheck className="w-10 h-10 text-secondary" />
            <div>
              <p className="text-xs text-base-content/50">Devoirs en attente</p>
              <p className="font-extrabold text-2xl">18</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow hover-scale">
          <div className="card-body flex-row items-center gap-4">
            <MessageSquare className="w-10 h-10 text-accent" />
            <div>
              <p className="text-xs text-base-content/50">Nouveaux messages</p>
              <p className="font-extrabold text-2xl">3</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
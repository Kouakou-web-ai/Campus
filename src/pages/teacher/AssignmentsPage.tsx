import { Plus } from 'lucide-react';

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Travaux à Rendre</h1>
          <p className="text-base-content/70">Consultez les devoirs créés et les rendus.</p>
        </div>
        <button className="btn btn-primary gap-2"><Plus /> Créer un devoir</button>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow">
        <div className="card-body">
          <h2 className="card-title font-bold">Projet React Clean Architecture</h2>
          <p className="text-sm text-base-content/70">Rendus : 12 / 28 étudiants | Date limite : 25 Juin 2026</p>
        </div>
      </div>
    </div>
  );
}
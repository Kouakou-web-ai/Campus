import { FolderPlus } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bibliothèque de Ressources</h1>
          <p className="text-base-content/70">Déposez vos PDF de cours, tutoriels, et diapositives.</p>
        </div>
        <button className="btn btn-primary gap-2"><FolderPlus /> Ajouter un fichier</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body">
            <h2 className="card-title font-bold text-sm">Introduction_Arbres_Binaires.pdf</h2>
            <p className="text-xs text-base-content/50">Taille: 2.4 Mo | Téléchargé le 01/06/2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
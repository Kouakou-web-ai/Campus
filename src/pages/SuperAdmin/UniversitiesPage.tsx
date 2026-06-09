import { Building2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';

export function UniversitiesPage() {
  const mockUniversities = [
    { id: 'univ-1', name: 'Université Sorbonne Paris', domain: 'sorbonne.campus.fr', students: 1240, status: 'Active' },
    { id: 'univ-2', name: 'Université de Lyon', domain: 'lyon.campus.fr', students: 850, status: 'Active' },
    { id: 'univ-3', name: 'HEC Montréal Branch', domain: 'hec.campus.fr', students: 620, status: 'Pending' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Gestion des Universités" description="Configurez et gérez les instances universitaires." />
        <Button className="gap-2"><Plus className="w-4 h-4" /> Ajouter une université</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mockUniversities.map((univ) => (
          <Card key={univ.id} className="hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">{univ.name}</h2>
                  <p className="text-xs text-slate-400">{univ.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div>
                  <p className="text-xs text-slate-400">Étudiants</p>
                  <p className="font-semibold text-sm text-slate-700">{univ.students}</p>
                </div>
                <span className={`badge ${univ.status === 'Active' ? 'badge-success' : 'badge-warning'} badge-sm`}>
                  {univ.status}
                </span>
                <Button variant="error" size="sm" className="btn-square"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
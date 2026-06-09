import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { User, Receipt, FileText } from 'lucide-react';

export function ParentDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Espace Parents" 
          description="Suivi de la scolarité de vos enfants."
        />
        <select className="select select-bordered max-w-xs focus:select-primary" defaultValue="jean">
          <option value="jean">Jean Dupont</option>
          <option value="marie">Marie Dupont</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Moyenne (Jean)" value="14.5/20" icon={FileText} />
        <StatCard title="Absences (Ce mois)" value="0" icon={User} />
        <StatCard title="Frais de scolarité" value="À jour" icon={Receipt} />
      </div>

      <Card className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">Dernières factures</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="bg-slate-50">Date</th>
                <th className="bg-slate-50">Description</th>
                <th className="bg-slate-50">Montant</th>
                <th className="bg-slate-50">Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01/09/2026</td>
                <td className="font-medium text-slate-800">Frais d'inscription - Semestre 1</td>
                <td>2 500 000 FCFA</td>
                <td><span className="badge badge-success badge-sm badge-outline">Payé</span></td>
              </tr>
              <tr>
                <td>01/10/2026</td>
                <td className="font-medium text-slate-800">Assurance Universitaire</td>
                <td>150 000 FCFA</td>
                <td><span className="badge badge-success badge-sm badge-outline">Payé</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

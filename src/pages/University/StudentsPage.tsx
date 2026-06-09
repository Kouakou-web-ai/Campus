import { Plus } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';

export function StudentsPage() {
  const students = [
    { name: 'Alice Martin', email: 'alice.martin@campus.fr', course: 'Master 1 Informatique', year: '2025-2026' },
    { name: 'Bob Dubois', email: 'bob.dubois@campus.fr', course: 'Licence 3 Mathématiques', year: '2025-2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader title="Registre des Étudiants" description="Gérez l'inscription des étudiants de l'établissement." />
        <Button className="gap-2"><Plus className="w-4 h-4" /> Inscrire</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table 
          data={students}
          columns={[
            { header: 'Nom', accessorKey: 'name', cell: (r: any) => <span className="font-semibold">{r.name}</span> },
            { header: 'Email', accessorKey: 'email' },
            { header: 'Filière', accessorKey: 'course' },
            { header: 'Année Académique', accessorKey: 'year' },
          ]}
        />
      </div>
    </div>
  );
}
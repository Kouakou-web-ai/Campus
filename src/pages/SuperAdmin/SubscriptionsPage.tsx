import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';

export function SubscriptionsPage() {
  const plans = [
    { name: 'Standard', price: '299 000 FCFA', clients: 12, status: 'Actif' },
    { name: 'Pro', price: '599 000 FCFA', clients: 10, status: 'Actif' },
    { name: 'Entreprise', price: 'Sur mesure', clients: 2, status: 'Actif' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion des Abonnements" description="Définissez les forfaits de facturation récurrente." />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table 
          data={plans} 
          columns={[
            { header: 'Forfait', accessorKey: 'name', cell: (row: any) => <span className="font-semibold">{row.name}</span> },
            { header: 'Tarif mensuel', accessorKey: 'price' },
            { header: 'Clients inscrits', accessorKey: 'clients' },
            { header: 'Statut', accessorKey: 'status', cell: (row: any) => <span className="badge badge-success badge-sm">{row.status}</span> },
          ]}
        />
      </div>
    </div>
  );
}
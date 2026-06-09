import { PageHeader } from '../../components/ui/PageHeader';
import { Table } from '../../components/ui/Table';

export function AuditLogsPage() {
  const logs = [
    { id: 1, action: 'Connexion Super Admin', user: 'admin@campus.fr', ip: '192.168.1.1', date: '2026-06-07 08:30:11' },
    { id: 2, action: 'Création Université de Lyon', user: 'admin@campus.fr', ip: '192.168.1.1', date: '2026-06-06 14:12:00' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Logs d'audit" description="Traces de sécurité des administrateurs et du système." />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table 
          data={logs} 
          columns={[
            { header: 'Action', accessorKey: 'action', cell: (r: any) => <span className="font-semibold text-slate-800">{r.action}</span> },
            { header: 'Utilisateur', accessorKey: 'user' },
            { header: 'IP', accessorKey: 'ip', cell: (r: any) => <code>{r.ip}</code> },
            { header: 'Date', accessorKey: 'date' },
          ]}
        />
      </div>
    </div>
  );
}
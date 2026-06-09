import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Table } from '../../components/ui/Table';
import { Building2, Users, Coins, Activity } from 'lucide-react';

export function SuperAdminDashboard() {
  const tenants = [
    { id: 1, name: 'Université de Paris', plan: 'Enterprise', users: 15420, status: 'Actif', revenue: '12 500 000 FCFA' },
    { id: 2, name: 'Stanford University', plan: 'Premium', users: 8300, status: 'Actif', revenue: '9 800 000 FCFA' },
    { id: 3, name: 'MIT', plan: 'Enterprise', users: 11200, status: 'Actif', revenue: '14 200 000 FCFA' },
  ];

  const columns = [
    { header: 'Université', accessorKey: 'name', cell: (row: any) => <span className="font-semibold text-slate-800">{row.name}</span> },
    { header: 'Plan', accessorKey: 'plan', cell: (row: any) => <span className="badge badge-primary badge-sm">{row.plan}</span> },
    { header: 'Utilisateurs actifs', accessorKey: 'users' },
    { header: 'Revenu Mensuel', accessorKey: 'revenue', cell: (row: any) => <span className="text-success font-medium">{row.revenue}</span> },
    { header: 'Statut', accessorKey: 'status', cell: (row: any) => <span className="badge badge-success badge-sm badge-outline">{row.status}</span> },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Vue d'ensemble Super Admin" 
        description="Gérez l'ensemble des universités clientes de votre SaaS multi-tenant."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Universités Actives" value="124" icon={Building2} trend={12} trendLabel="vs mois dernier" />
        <StatCard title="Revenu Récurrent (MRR)" value="142 500 000 FCFA" icon={Coins} trend={8.5} trendLabel="vs mois dernier" />
        <StatCard title="Total Utilisateurs" value="842.5K" icon={Users} trend={15} trendLabel="vs mois dernier" />
        <StatCard title="Uptime Système" value="99.99%" icon={Activity} />
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Dernières Universités Ajoutées</h3>
          <button className="btn btn-ghost btn-sm text-primary">Voir tout</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <Table data={tenants} columns={columns} />
        </div>
      </div>
    </div>
  );
}

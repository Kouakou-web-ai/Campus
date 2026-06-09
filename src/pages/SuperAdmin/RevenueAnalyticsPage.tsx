import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Coins, TrendingUp, Users } from 'lucide-react';

export function RevenueAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analyses des Revenus" description="Statistiques financières et analytiques de l'infrastructure SaaS." />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Revenu récurrent annuel (ARR)" value="780 000 000 FCFA" icon={Coins} trend={14} trendLabel="vs mois dernier" />
        <StatCard title="Valeur moyenne de contrat" value="599 000 FCFA" icon={TrendingUp} />
        <StatCard title="Total abonnés" value="24" icon={Users} trend={2} trendLabel="nouveaux abonnements" />
      </div>
    </div>
  );
}
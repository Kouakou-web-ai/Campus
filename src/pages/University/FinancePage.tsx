import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { CreditCard, Shield, TrendingUp } from 'lucide-react';

export function FinancePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Suivi Financier" description="Suivi du recouvrement des frais de scolarité." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-slate-500">Total Facturé</p>
          <p className="text-3xl font-bold mt-1 text-primary">124 000 000 FCFA</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Total Recouvré</p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">98 000 000 FCFA</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Restant à Percevoir</p>
          <p className="text-3xl font-bold mt-1 text-amber-500">26 000 000 FCFA</p>
        </Card>
      </div>
    </div>
  );
}
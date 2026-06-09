import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Rapports Généraux" description="Exportez les rapports administratifs et financiers." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Inscriptions & Admission</h3>
            <p className="text-sm text-slate-500 mt-1">Dossier PDF récapitulant les taux d'inscriptions annuels.</p>
          </div>
          <Button variant="outline" size="sm" className="mt-4">Télécharger</Button>
        </Card>
      </div>
    </div>
  );
}
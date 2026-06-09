import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Ajustez les paramètres système du portail SaaS." />
      
      <Card className="max-w-xl">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Sauvegardé !'); }}>
          <div className="form-control">
            <label className="label cursor-pointer flex justify-between items-center">
              <span className="label-text font-medium text-slate-700">Mode Maintenance</span>
              <input type="checkbox" className="toggle toggle-primary" />
            </label>
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text">Nom du service</span></label>
            <input type="text" defaultValue="CAMPUS SaaS" className="input input-bordered w-full" />
          </div>
          <Button type="submit" className="w-full">Mettre à jour</Button>
        </form>
      </Card>
    </div>
  );
}
import { Mail } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function TeachersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Enseignants" description="Consultez le dossier et l'affectation du corps professoral." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Dr. Paul Martin</h2>
            <p className="text-sm text-slate-500">Département Informatique</p>
          </div>
          <Button variant="outline" size="sm" className="mt-4 gap-2 w-full">
            <Mail className="w-4 h-4" /> Contacter
          </Button>
        </Card>
      </div>
    </div>
  );
}
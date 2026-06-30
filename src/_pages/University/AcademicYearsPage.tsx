import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';

export function AcademicYearsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Années Académiques" description="Gérez et ouvrez les exercices scolaires." />
      <Card className="max-w-md">
        <h3 className="font-bold text-slate-800 mb-4">Exercices programmés</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span>2025-2026</span>
            <span className="badge badge-success badge-sm">Active</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span>2024-2025</span>
            <span className="badge badge-slate badge-sm">Clôturée</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
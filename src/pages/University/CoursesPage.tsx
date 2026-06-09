import { BookOpen } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';

export function CoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Catalogue des Cours" description="Administration des matières ouvertes." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary"><BookOpen /></div>
          <div>
            <h3 className="font-bold text-slate-800">Algorithmique</h3>
            <p className="text-sm text-slate-500">INF101 | 6 Crédits ECTS</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
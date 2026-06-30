import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { GraduationCap, BookOpen, AlertCircle, TrendingUp } from 'lucide-react';

export function UniversityDashboard() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Vue d'ensemble Université" 
        description="Gérez les étudiants, professeurs et cours de votre établissement."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Étudiants Inscrits" value="15,420" icon={GraduationCap} trend={3.2} />
        <StatCard title="Professeurs Actifs" value="432" icon={BookOpen} trend={1.5} />
        <StatCard title="Taux de Réussite" value="87.5%" icon={TrendingUp} trend={2.1} />
        <StatCard title="Alertes Absences" value="24" icon={AlertCircle} trend={-5} trendLabel="en baisse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-96 flex items-center justify-center">
          <p className="text-slate-400">Graphique des inscriptions (Espace pour Recharts/Chart.js)</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Dernières Notifications</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Nouvelle inscription</p>
                <p className="text-xs text-slate-500">Jean Dupont a complété son dossier.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-warning flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Alerte paiement</p>
                <p className="text-xs text-slate-500">3 factures en retard de plus de 30 jours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

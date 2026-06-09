import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { GraduationCap, Clock, Award, Book } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export function StudentDashboard() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Espace Étudiant" 
        description="Retrouvez vos cours, notes et actualités."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Moyenne Générale" value="14.5/20" icon={Award} trend={0.5} trendLabel="en hausse" />
        <StatCard title="Prochain Examen" value="Dans 3 j" icon={Clock} />
        <StatCard title="Cours Validés" value="12/15" icon={GraduationCap} />
        <StatCard title="Absences" value="0" icon={Book} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Dernières Notes</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100">
              <span className="font-medium">Mathématiques Avancées</span>
              <span className="badge badge-success">16/20</span>
            </li>
            <li className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100">
              <span className="font-medium">Physique Quantique</span>
              <span className="badge badge-warning">11/20</span>
            </li>
          </ul>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-slate-900">Emploi du temps</h3>
          <div className="space-y-4">
             <div className="flex gap-4">
                <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      8h
                   </div>
                   <div className="w-px h-full bg-slate-200 mt-2"></div>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                   <div className="font-semibold text-slate-900">Algèbre Linéaire</div>
                   <div className="text-sm text-slate-500">Amphi A - 08:00 à 10:00</div>
                </div>
             </div>
             
             <div className="flex gap-4">
                <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
                      10h
                   </div>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div className="font-semibold text-slate-900">Travaux Dirigés</div>
                   <div className="text-sm text-slate-500">Salle 104 - 10:15 à 12:15</div>
                </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

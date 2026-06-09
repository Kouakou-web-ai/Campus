import { TrendingUp, CreditCard, Bell } from 'lucide-react';

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Espace Parents</h1>
      <p className="text-base-content/70">Suivez l'activité et le statut financier de vos enfants.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body flex-row items-center gap-4">
            <TrendingUp className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-base-content/50">Progression d'Alice</p>
              <p className="font-extrabold text-lg">15.2 / 20</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body flex-row items-center gap-4">
            <CreditCard className="w-8 h-8 text-success" />
            <div>
              <p className="text-xs text-base-content/50">Frais de scolarité</p>
              <p className="font-extrabold text-sm text-warning">1 200 000 FCFA Restant</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-300 shadow">
          <div className="card-body flex-row items-center gap-4">
            <Bell className="w-8 h-8 text-accent" />
            <div>
              <p className="text-xs text-base-content/50">Alertes Récents</p>
              <p className="font-extrabold text-sm">2 Non-lues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
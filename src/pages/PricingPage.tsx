import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function PricingPage() {
  return (
    <div className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-heading">Des tarifs transparents pour toutes les tailles</h1>
        <p className="text-slate-500 text-lg">Choisissez le forfait adapté aux besoins de votre établissement.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-xl mb-4">Standard</h2>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-slate-900">299 000 FCFA</span>
              <span className="text-slate-500">/mois</span>
            </div>
            <p className="text-sm text-slate-500 mb-6">Idéal pour les petites écoles indépendantes.</p>
            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Jusqu'à 500 étudiants</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Supports de cours de base</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 1 Université incluse</li>
            </ul>
          </div>
          <Link to="/onboarding"><Button variant="outline" className="w-full">S'inscrire</Button></Link>
        </Card>

        <Card className="border-2 border-primary relative flex flex-col justify-between">
          <div className="badge badge-primary absolute top-4 right-4">Populaire</div>
          <div>
            <h2 className="font-bold text-xl mb-4 text-primary">Pro</h2>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-slate-900">599 000 FCFA</span>
              <span className="text-slate-500">/mois</span>
            </div>
            <p className="text-sm text-slate-500 mb-6">Parfait pour les universités régionales en croissance.</p>
            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Jusqu'à 5000 étudiants</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Module E-learning complet</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Statistiques financières avancées</li>
            </ul>
          </div>
          <Link to="/onboarding"><Button className="w-full shadow-lg">Commencer l'essai pro</Button></Link>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-xl mb-4">Entreprise</h2>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-slate-900">Sur mesure</span>
            </div>
            <p className="text-sm text-slate-500 mb-6">Pour les grands réseaux d'universités nationales.</p>
            <ul className="space-y-3 mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Étudiants illimités</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Multi-Tenant personnalisé</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Support prioritaire 24/7</li>
            </ul>
          </div>
          <Link to="/contact"><Button variant="outline" className="w-full">Contacter l'équipe</Button></Link>
        </Card>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Star, Building2, ArrowRight } from 'lucide-react';
import ThreeDCard from '../../components/ui/ThreeDCard';
import RevealOnScroll from '../../components/ui/RevealOnScroll';

const PLANS = [
  {
    name: 'Gratuit',
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Pour découvrir la plateforme avec vos premières classes.',
    color: 'from-sky-450 to-blue-500',
    badge: 'Essai illimité',
    features: [
      'Gestion des cours et des classes',
      'Suivi simple des notes',
      'Emploi du temps en ligne',
    ],
    notIncluded: ['Paiements par Mobile Money', 'Statistiques de réussite de l\'établissement', 'Accompagnement personnalisé'],
  },
  {
    name: 'Starter',
    icon: Zap,
    monthlyPrice: 50000,
    annualPrice: 40000,
    description: 'Idéal pour les petits établissements qui débutent.',
    color: 'from-slate-500 to-slate-700',
    badge: null,
    features: [
      'Gestion pour 500 élèves',
      'Suivi complet des cours',
      'Feuille d\'appel numérique',
      'Suivi des règlements de scolarité',
    ],
    notIncluded: ['Statistiques de réussite de l\'établissement', 'Liaison avec outils externes', 'Garantie de fonctionnement permanent'],
  },
  {
    name: 'Pro',
    icon: Star,
    monthlyPrice: 100000,
    annualPrice: 80000,
    description: 'Pour les établissements en pleine croissance.',
    color: 'from-indigo-500 to-violet-600',
    badge: 'Le plus populaire',
    features: [
      'Gestion pour 5 000 élèves',
      'Toutes les options du plan Starter',
      'Statistiques de réussite de l\'établissement',
      'Rapports d\'activité détaillés',
      'Liaison avec vos outils externes',
      'Assistance prioritaire 24h/24',
      'Accompagnement personnalisé au démarrage',
    ],
    notIncluded: ['Garantie de fonctionnement permanent', 'Serveur dédié sécurisé'],
  },
  {
    name: 'premium',
    icon: Building2,
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Solutions sur mesure pour les grandes institutions.',
    color: 'from-amber-500 to-orange-600',
    badge: null,
    features: [
      'Élèves illimités',
      'Toutes les options du plan Pro',
      'Serveur dédié sécurisé',
      'Garantie de fonctionnement permanent',
      'Liaison sur mesure avec vos outils',
      'Conseiller dédié personnel',
      'Formation de vos équipes incluse',
    ],
    notIncluded: [],
  },
];

export default function PrixPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="py-20">
      {/* Header */}
      <div className="text-center mb-16 px-4">
        <span className="inline-block text-indigo-600 font-semibold text-sm mb-3">Tarifs</span>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
          Simple, transparent, <span className="gradient-text">sans surprise</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
          Commencez gratuitement. Évoluez selon vos besoins.
        </p>

        {/* Toggle mensuel/annuel */}
        <div className="inline-flex items-center gap-3 bg-slate-100 rounded-full p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !annual ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              annual ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            Annuel
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-8 sm:px-12 lg:px-16 mt-24 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan, idx) => {
            const Icon = plan.icon;
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const isPopular = plan.badge === 'Le plus populaire';

            return (
              <RevealOnScroll key={plan.name} delay={idx * 120} direction="up">
              <ThreeDCard maxTilt={14} scale={1.03} className="h-full">
              <div
                className={`relative rounded-3xl overflow-visible transition-all duration-300 h-full ${
                  isPopular
                    ? 'gradient-border-animated shadow-2xl shadow-indigo-200'
                    : 'bg-white border border-slate-200 shadow-sm hover:shadow-xl'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                )}

                {/* Inner colored content for Pro card */}
                <div className={`h-full rounded-3xl ${isPopular ? 'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white' : ''}`}>
                <div className="p-6">
                  {plan.badge && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4 ${
                      isPopular
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {plan.badge}
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 ${isPopular ? 'opacity-80' : ''}`}>
                    <Icon size={22} className="text-white" />
                  </div>

                  <h3 className={`text-lg font-bold mb-1 ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mb-6 ${isPopular ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>

                  {/* Prix */}
                  <div className="mb-6">
                    {plan.name === 'premium' ? (
                      <div className={`text-2xl font-extrabold font-heading ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                        &nbsp;
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className={`text-xl sm:text-2xl font-extrabold font-heading ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                          {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
                        </span>
                        {price > 0 && (
                          <span className={`text-xs ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                            /mois
                          </span>
                        )}
                      </div>
                    )}
                    {annual && price > 0 && (
                      <p className={`text-[10px] mt-1 ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                        Facturé annuellement · {(price * 12).toLocaleString('fr-FR')} FCFA/an
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to="/connexion"
                    className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl font-semibold text-xs transition-all group mb-6 ${
                      isPopular
                        ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                        : 'bg-slate-900 text-white hover:bg-indigo-600'
                    }`}
                  >
                    <span className="text-center leading-snug">
                      {plan.name === 'premium' ? 'Nous contacter' : plan.name === 'Gratuit' ? 'Inscrivez votre université gratuitement' : 'Commencer l\'essai'}
                    </span>
                    <ArrowRight size={15} className="flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-xs ${isPopular ? 'text-indigo-100' : 'text-slate-600'}`}>
                        <Check size={14} className={`mt-0.5 flex-shrink-0 ${isPopular ? 'text-white' : 'text-emerald-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                </div>{/* end inner wrapper */}
              </div>
              </ThreeDCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </div>
  );
}

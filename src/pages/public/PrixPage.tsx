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
      'Jusqu\'à 50 étudiants',
      'Gestion basique des classes',
      '1 enseignant connecté',
      'Support par forum public',
    ],
    notIncluded: ['Suivi des présences', 'Paiements Mobile Money', 'Support email'],
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
      'Jusqu\'à 500 étudiants',
      'Gestion des cours',
      'Suivi des présences',
      'Paiements basiques',
      'Support email',
    ],
    notIncluded: ['Analytiques avancées', 'API accès', 'SLA garanti'],
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
      'Jusqu\'à 5 000 étudiants',
      'Toutes les fonctionnalités Starter',
      'Analytiques avancées',
      'Rapports personnalisés',
      'API REST complète',
      'Support prioritaire 24/7',
      'Onboarding dédié',
    ],
    notIncluded: ['SLA 99.99%', 'Infrastructure dédiée'],
  },
  {
    name: 'Entreprise',
    icon: Building2,
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Solutions sur mesure pour les grandes institutions.',
    color: 'from-amber-500 to-orange-600',
    badge: 'Sur devis',
    features: [
      'Étudiants illimités',
      'Toutes les fonctionnalités Pro',
      'Infrastructure dédiée',
      'SLA 99.99% garanti',
      'Intégrations sur mesure',
      'Customer Success Manager',
      'Formation équipe incluse',
    ],
    notIncluded: [],
  },
];

const FAQ_PRICING = [
  { q: 'Puis-je changer de plan à tout moment ?', a: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. La facturation est ajustée au prorata.' },
  { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le prix affiché est tout inclus. Aucune surprise sur votre facture.' },
  { q: 'Comment fonctionne l\'essai gratuit ?', a: '14 jours d\'accès complet au plan Pro, sans carte bancaire requise.' },
  { q: 'Puis-je importer mes données existantes ?', a: 'Oui, notre équipe vous accompagne dans la migration depuis votre système actuel.' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 mb-12">
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
                <div className="p-8">
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

                  <h3 className={`text-xl font-bold mb-1 ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${isPopular ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>

                  {/* Prix */}
                  <div className="mb-6">
                    {plan.name === 'Entreprise' ? (
                      <div className={`text-3xl font-extrabold font-heading ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                        Sur devis
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-extrabold font-heading ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                          {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
                        </span>
                        {price > 0 && (
                          <span className={`text-sm ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                            /mois
                          </span>
                        )}
                      </div>
                    )}
                    {annual && price > 0 && (
                      <p className={`text-xs mt-1 ${isPopular ? 'text-indigo-200' : 'text-slate-400'}`}>
                        Facturé annuellement · {(price * 12).toLocaleString('fr-FR')} FCFA/an
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    to="/connexion"
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold text-sm transition-all group mb-6 ${
                      isPopular
                        ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                        : 'bg-slate-900 text-white hover:bg-indigo-600'
                    }`}
                  >
                    {plan.name === 'Entreprise' ? 'Nous contacter' : plan.name === 'Gratuit' ? 'Commencer gratuitement' : 'Commencer l\'essai'}
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  {/* Features */}
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${isPopular ? 'text-indigo-100' : 'text-slate-600'}`}>
                        <Check size={15} className={`mt-0.5 flex-shrink-0 ${isPopular ? 'text-white' : 'text-emerald-500'}`} />
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

      {/* FAQ */}
      <div className="w-full flex justify-center my-24">
        <div className="w-full max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-12">Questions fréquentes</h2>
          <div className="space-y-4 flex flex-col items-center">
            {FAQ_PRICING.map((item) => (
              <details key={item.q} className="card-premium group relative w-full text-center">
                <summary className="flex items-center justify-center px-6 py-4 cursor-pointer list-none">
                  <span className="text-sm font-semibold text-slate-800 text-center">{item.q}</span>
                  <span className="text-slate-400 group-open:rotate-90 transition-transform text-lg absolute right-6">›</span>
                </summary>
                <div className="px-6 pb-4 text-center flex justify-center">
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

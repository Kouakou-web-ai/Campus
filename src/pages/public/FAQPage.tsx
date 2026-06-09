import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    name: 'Général',
    items: [
      { q: 'Qu\'est-ce que CAMPUS ?', a: 'CAMPUS est une plateforme SaaS de gestion universitaire tout-en-un. Elle centralise la gestion des étudiants, enseignants, cours, emplois du temps et finances dans une interface moderne.' },
      { q: 'CAMPUS est-il adapté à ma taille d\'université ?', a: 'Oui. CAMPUS s\'adapte aux établissements de 100 à 100 000+ étudiants grâce à son architecture multi-tenant scalable.' },
      { q: 'Proposez-vous un essai gratuit ?', a: 'Absolument ! 14 jours d\'accès complet au plan Pro, sans carte bancaire. Aucun engagement.' },
    ],
  },
  {
    name: 'Technique',
    items: [
      { q: 'Comment mes données sont-elles sécurisées ?', a: 'CAMPUS utilise Firebase avec un chiffrement AES-256. Les données de chaque université sont strictement isolées via une architecture multi-tenant.' },
      { q: 'CAMPUS fonctionne-t-il sur mobile ?', a: 'Oui, CAMPUS est entièrement responsive. Une PWA est également disponible pour une expérience native sur mobile.' },
      { q: 'Proposez-vous une API ?', a: 'Oui, une API REST complète est disponible sur les plans Pro et Enterprise avec documentation OpenAPI.' },
      { q: 'Quelle est la disponibilité garantie ?', a: 'Nous garantissons un uptime de 99.9% sur Pro et 99.99% sur Enterprise avec monitoring 24/7.' },
    ],
  },
  {
    name: 'Facturation',
    items: [
      { q: 'Quels modes de paiement acceptez-vous ?', a: 'Carte bancaire (Visa, Mastercard, Amex), virement bancaire, et facture sur 30 jours pour les Enterprise.' },
      { q: 'Puis-je annuler à tout moment ?', a: 'Oui. Aucun engagement. Résiliez à tout moment depuis votre espace admin. Vos données sont exportables.' },
      { q: 'Y a-t-il des frais d\'installation ?', a: 'Non, l\'installation est incluse dans tous les plans. Un onboarding dédié est offert sur le plan Pro+.' },
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Général');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const currentCat = FAQ_CATEGORIES.find(c => c.name === activeCategory);
  const filteredItems = search
    ? FAQ_CATEGORIES.flatMap(c => c.items).filter(
        item =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
      )
    : currentCat?.items ?? [];

  return (
    <div className="py-20">
      {/* Header */}
      <div className="text-center mb-12 px-4">
        <span className="inline-block text-indigo-600 font-semibold text-sm mb-3">FAQ</span>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
          Questions <span className="gradient-text">fréquentes</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8">
          Tout ce que vous devez savoir sur CAMPUS. Vous ne trouvez pas la réponse ? Contactez-nous.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenIndex(null); }}
            placeholder="Chercher une question…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm transition-all"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Categories */}
        {!search && (
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => { setActiveCategory(cat.name); setOpenIndex(null); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.name
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                }`}
              >
                {cat.name}
                <span className={`ml-1.5 text-xs ${activeCategory === cat.name ? 'text-indigo-200' : 'text-slate-400'}`}>
                  ({cat.items.length})
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>Aucune question trouvée pour "{search}"</p>
            </div>
          ) : (
            filteredItems.map((item, i) => (
              <div
                key={i}
                className="card-premium overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800 pr-4">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === i ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-5 border-t border-slate-100 pt-3">
                    <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* CTA support */}
        <div className="mt-16 card-premium p-8 text-center bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-slate-500 text-sm mb-6">Notre équipe est disponible 24/7 pour vous aider.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="/contact" className="btn-gradient text-sm px-6 py-2.5 rounded-full font-semibold text-white">
              Contacter le support
            </a>
            <a href="mailto:support@campus.fr" className="text-sm text-indigo-600 font-medium hover:underline">
              support@campus.fr
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

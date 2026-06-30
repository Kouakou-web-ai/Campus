import { useState } from 'react';
import { Mail, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const APP_FAQS = [
  {
    q: "Comment inscrire mon établissement et importer les étudiants ?",
    a: "L'inscription se fait en quelques minutes depuis notre espace public. Une fois connecté, vous pouvez importer rapidement vos listes d'étudiants, d'enseignants et de classes à l'aide de notre outil d'importation Excel/CSV intelligent pour démarrer immédiatement."
  },
  {
    q: "Comment s'effectue le règlement de la scolarité par Mobile Money ?",
    a: "CAMPUS intègre de manière sécurisée les principaux services de Mobile Money (Wave, Orange Money, MTN). Les parents et les étudiants peuvent payer directement en ligne, et l'administration suit l'état de recouvrement en temps réel sur le tableau de bord financier."
  },
  {
    q: "Qu'est-ce que le cahier de textes numérique pour les enseignants ?",
    a: "C'est un espace collaboratif dans lequel les enseignants consignent le déroulement des séances, partagent des ressources pédagogiques ou publient des devoirs, ce qui permet aux étudiants et aux parents de suivre la progression des cours."
  },
  {
    q: "Comment les parents d'élèves suivent-ils la scolarité de leur enfant ?",
    a: "Le portail Parent donne un accès direct aux bulletins de notes, aux devoirs publiés, au calendrier et aux relevés d'absences ou de retards. Les parents disposent ainsi d'un suivi académique complet et transparent."
  },
  {
    q: "Le système gère-t-il automatiquement le calcul des moyennes ?",
    a: "Oui. Dès que les enseignants saisissent les notes, le système calcule instantanément les moyennes générales et par matière en fonction des coefficients définis par l'établissement, ce qui simplifie grandement l'édition des bulletins."
  },
  {
    q: "Comment garantissez-vous la sécurité et le cloisonnement multi-tenant ?",
    a: "Notre infrastructure multi-tenant et nos règles de sécurité Firebase isolent hermétiquement les bases de données de chaque université. Aucun utilisateur extérieur ou membre d'un autre établissement ne peut accéder à vos données."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="py-24 sm:py-32 bg-app min-h-screen text-content flex flex-col items-center justify-start transition-colors duration-200">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto px-6 mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
          <HelpCircle size={12} />
          Centre d'Aide
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-content tracking-tight">
          Questions <span className="gradient-text">Fréquentes</span>
        </h1>
        <p className="text-sm sm:text-base text-content-secondary leading-relaxed max-w-lg mx-auto">
          Retrouvez les réponses aux questions les plus courantes sur le fonctionnement de CAMPUS et ses fonctionnalités clés.
        </p>
      </div>

      {/* Accordions */}
      <div className="max-w-2xl w-full px-6 space-y-4">
        {APP_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index}
              className="collapse collapse-arrow bg-surface border border-border rounded-2xl shadow-sm transition-all duration-300"
            >
              <input 
                type="radio" 
                name="faq-accordion" 
                checked={isOpen}
                onChange={() => setOpenIndex(isOpen ? null : index)}
                className="cursor-pointer"
              />
              <div className="collapse-title text-sm sm:text-base font-bold text-content text-center py-5 px-6">
                {faq.q}
              </div>
              <div className="collapse-content px-6 pb-6 text-center border-t border-border/40 pt-4">
                <p className="text-xs sm:text-sm text-content-secondary leading-relaxed max-w-md mx-auto">
                  {faq.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Support */}
      <div className="mt-20 max-w-md w-full px-6">
        <div className="bg-surface border border-border p-8 rounded-3xl text-center shadow-lg shadow-indigo-500/5 space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-content">Vous avez d'autres questions ?</h3>
            <p className="text-xs text-content-secondary leading-relaxed max-w-xs mx-auto">
              Notre équipe d'assistance locale est disponible pour vous accompagner et planifier une démonstration personnalisée.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              to="/contact" 
              className="btn-gradient text-xs px-5 py-2.5 rounded-full font-semibold text-white flex items-center gap-1.5 justify-center w-full sm:w-auto"
            >
              Contacter le support
              <ArrowRight size={12} />
            </Link>
            <a 
              href="mailto:truixk@gmail.com" 
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline py-2"
            >
              truixk@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

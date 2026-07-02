import React from 'react';
import { Shield, FileText, CreditCard, Lock, Scale, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ConditionsPage() {
  const lastUpdate = '01 Juillet 2026';

  const sections = [
    {
      id: 'preambule',
      icon: <Globe className="w-5 h-5 text-indigo-500" />,
      title: '1. Préambule et Champ d\'Application',
      content: `La plateforme CAMPUS est un logiciel de gestion universitaire conçu pour moderniser et simplifier la gestion administrative, académique, pédagogique et financière des établissements d'enseignement supérieur. Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme par l'ensemble des utilisateurs (administrateurs, enseignants, étudiants, parents). L'accès à la plateforme est conditionné par l'acceptation sans réserve des présentes conditions.`
    },
    {
      id: 'editeur',
      icon: <Scale className="w-5 h-5 text-indigo-500" />,
      title: '2. Mentions Légales et Éditeur',
      content: `La plateforme CAMPUS est éditée sous la réglementation en vigueur en République de Côte d'Ivoire. 
      Conformément à la Loi n° 2013-546 du 30 juillet 2013 relative aux transactions électroniques, les utilisateurs de la plateforme sont informés de l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi. Les serveurs de la plateforme sont sécurisés et hébergés conformément aux normes de sécurité internationales, garantissant la continuité du service public ou privé universitaire en Côte d'Ivoire et dans la sous-région UEMOA.`
    },
    {
      id: 'roles',
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      title: '3. Accès aux Services et Gestion des Rôles',
      content: `L'application attribue des profils d'accès stricts pour éviter toute fuite de données :
      • Administrateur Universitaire : Gestion complète du tenant, des inscriptions, de la configuration financière et des enseignants.
      • Enseignant : Saisie des notes, publication des devoirs, gestion des absences.
      • Étudiant : Consultation des notes, cours, devoirs et paiement en ligne de la scolarité.
      • Parent : Suivi académique et financier exclusif de son enfant.
      Chaque utilisateur est responsable de la confidentialité de ses identifiants. Toute activité réalisée sous un compte utilisateur est réputée être effectuée par le titulaire légitime du compte.`
    },
    {
      id: 'donnees',
      icon: <Shield className="w-5 h-5 text-indigo-500" />,
      title: '4. Protection des Données (Loi Ivoirienne & ARTCI)',
      content: `CAMPUS attache une importance cruciale à la protection des données nominatives. Conformément à la Loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en Côte d'Ivoire :
      • Autorité de Régulation : Les traitements de données effectués par la plateforme s'inscrivent dans le cadre des déclarations et autorisations requises auprès de l'ARTCI (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire).
      • Droits des Utilisateurs : Tout utilisateur dispose d'un droit d'accès, de rectification, d'opposition et de suppression des données le concernant, qu'il peut exercer en contactant l'administration de son université ou notre support technique.
      • Non-Partage : Aucune donnée nominative (notes, coordonnées scolaires, états financiers) n'est partagée avec des tiers en dehors du tenant de l'université concernée.`
    },
    {
      id: 'finances',
      icon: <CreditCard className="w-5 h-5 text-indigo-500" />,
      title: '5. Transactions Financières et Services de Paiement',
      content: `Le paiement des frais de scolarité et autres frais annexes via la plateforme CAMPUS s'effectue par l'intermédiaire de solutions de paiement agréées en Côte d'Ivoire (Mobile Money Orange, MTN, Moov, Wave, et cartes bancaires locales). 
      Les opérations financières sont encadrées par la réglementation relative aux services de paiement de la Banque Centrale des États de l'Afrique de l'Ouest (BCEAO). L'éditeur de CAMPUS n'agit que comme intermédiaire technique et ne stocke aucune coordonnée bancaire ou secrète de transaction sur ses propres infrastructures.`
    },
    {
      id: 'cybercriminalite',
      icon: <Lock className="w-5 h-5 text-indigo-500" />,
      title: '6. Sécurité et Lutte contre la Cybercriminalité',
      content: `L'accès frauduleux, la falsification de notes, l'altération des relevés de présence ou le sabotage de la plateforme sont passibles de poursuites judiciaires. 
      Conformément à la Loi n° 2013-451 du 19 juin 2013 relative à la lutte contre la cybercriminalité en Côte d'Ivoire, toute tentative de contournement des mesures de protection technique (Role Guards, injection de code, usurpation d'identifiants administratifs) fera l'objet d'une plainte auprès de la PLCC (Plateforme de Lutte Contre la Cybercriminalité).`
    },
    {
      id: 'litiges',
      icon: <Scale className="w-5 h-5 text-indigo-500" />,
      title: '7. Droit Applicable et Juridiction Compétente',
      content: `Les présentes CGU sont régies par les lois et règlements de la République de Côte d'Ivoire. 
      Tout litige relatif à leur validité, leur interprétation ou leur éécution, qui ne pourrait être résolu à l'amiable, sera soumis à la compétence exclusive des tribunaux d'Abidjan, nonobstant pluralité de défendeurs ou appel en garantie.`
    }
  ];

  return (
    <div className="py-20 sm:py-28 bg-app min-h-screen text-content transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-16">
        
        {/* Fil d'ariane & Retour */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>

        {/* En-tête */}
        <div className="border-b border-border pb-12 mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Conditions Générales <span className="gradient-text">d'Utilisation</span>
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary">
            Dernière mise à jour : <span className="font-semibold text-content">{lastUpdate}</span> • Conforme aux réglementations de la République de Côte d'Ivoire
          </p>
        </div>

        {/* Corps de la page */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Sommaire fixe à gauche sur grand écran */}
          <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-4">Sommaire</h4>
            <nav className="space-y-3">
              {sections.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  className="block text-xs font-medium text-content-secondary hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
                >
                  {sec.title.substring(3)}
                </a>
              ))}
            </nav>
            
            <div className="mt-8 pt-8 border-t border-border/60">
              <div className="bg-surface border border-border p-5 rounded-2xl space-y-3">
                <p className="text-[11px] text-content-secondary leading-relaxed">
                  Besoin d'assistance concernant les présentes conditions ?
                </p>
                <Link to="/contact" className="btn btn-primary btn-xs w-full rounded-xl normal-case font-bold">
                  Nous écrire
                </Link>
              </div>
            </div>
          </div>

          {/* Contenu textuel à droite */}
          <div className="lg:col-span-3 space-y-12">
            {sections.map((sec) => (
              <section key={sec.id} id={sec.id} className="scroll-mt-28 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40">
                    {sec.icon}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-content tracking-tight">
                    {sec.title}
                  </h2>
                </div>
                <div className="bg-surface border border-border/80 rounded-2xl p-6 sm:p-8 shadow-sm">
                  <p className="text-xs sm:text-sm text-content-secondary leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
              </section>
            ))}

            {/* Disclaimer de fin */}
            <div className="bg-warning/10 border border-warning/20 p-6 rounded-2xl text-center space-y-2 mt-8">
              <h3 className="text-xs sm:text-sm font-bold text-warning-content">Information d'Acceptation</h3>
              <p className="text-[11px] sm:text-xs text-content-secondary max-w-xl mx-auto leading-relaxed">
                En accédant à la plateforme ou en continuant à naviguer sur l'application CAMPUS, vous certifiez avoir pris connaissance et accepté sans réserve les présentes conditions de service.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { Shield, Eye, Lock, RefreshCw, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ConfidentialitePage() {
  const lastUpdate = '01 Juillet 2026';

  return (
    <div className="py-20 sm:py-28 bg-app min-h-screen text-content transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        
        {/* Retour */}
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
        </div>

        {/* En-tête */}
        <div className="border-b border-border pb-10 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Politique de <span className="gradient-text">Confidentialité</span>
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary">
            Dernière mise à jour : <span className="font-semibold text-content">{lastUpdate}</span> • Conforme à la Loi n° 2013-450 de la République de Côte d'Ivoire
          </p>
        </div>

        {/* Contenu */}
        <div className="space-y-10">
          
          {/* Introduction */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40">
                <Shield className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-content">1. Engagement de Confidentialité</h2>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                CAMPUS s'engage à assurer la protection de la vie privée et des données à caractère personnel de tous ses utilisateurs (administrateurs scolaires, enseignants, étudiants, parents). Les traitements de données personnelles réalisés sur la plateforme sont effectués en stricte conformité avec la Loi n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en Côte d'Ivoire.
              </p>
            </div>
          </section>

          {/* Données collectées */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40">
                <Eye className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-content">2. Données Collectées et Finalité</h2>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Pour assurer les besoins de la gestion universitaire, les données suivantes sont collectées par votre établissement d'enseignement :
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-content-secondary space-y-2 leading-relaxed">
                <li>**Informations d'identité :** Noms, prénoms, adresses, emails, numéros de téléphone.</li>
                <li>**Données scolaires :** Classes, inscriptions, notes, bulletins, retards et relevés d'absences.</li>
                <li>**Données de facturation :** Suivi des versements de scolarité, montants payés et reliquats financiers (les détails des transactions financières par Mobile Money ne transitent que par des passerelles de paiement externes sécurisées).</li>
              </ul>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed pt-2 border-t border-border/50">
                **Finalité exclusive :** La gestion administrative, comptable et le suivi pédagogique interne à l'établissement. Aucun profilage ou usage publicitaire n'est réalisé.
              </p>
            </div>
          </section>

          {/* Sécurité */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40">
                <Lock className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-content">3. Sécurité et Droits d'Accès (ARTCI)</h2>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Les données d'un établissement d'enseignement sont rigoureusement cloisonnées au sein de sa base de données et ne peuvent faire l'objet de fuites ou de visibilité par un autre établissement.
              </p>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Conformément à la réglementation de l'**ARTCI** (Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire), vous disposez des droits suivants concernant vos données nominatives :
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-content-secondary space-y-2 leading-relaxed">
                <li>Droit d'accès et de consultation de vos informations scolaires et personnelles.</li>
                <li>Droit de rectification en cas d'erreur ou d'omission.</li>
                <li>Droit à la limitation du traitement ou droit d'opposition pour des motifs légitimes.</li>
              </ul>
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed pt-2 border-t border-border/50">
                Pour exercer vos droits, vous pouvez vous adresser à l'administrateur système de votre université ou envoyer une demande écrite à l'adresse support de l'éditeur : **Truixk@gmail.com**.
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}

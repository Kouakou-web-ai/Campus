import React from 'react';
import { Scale, ShieldCheck, Mail, Phone, MapPin, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MentionsPage() {
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
            Mentions <span className="gradient-text">Légales</span>
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary">
            Dernière mise à jour : <span className="font-semibold text-content">{lastUpdate}</span> • Conformément à la législation de Côte d'Ivoire
          </p>
        </div>

        {/* Contenu */}
        <div className="space-y-10">
          
          {/* Éditeur */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40">
                <Globe className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-content">1. Éditeur de la Plateforme</h2>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-4">
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                La plateforme **CAMPUS** est conçue, développée et éditée par :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-content-secondary">
                  <Scale size={16} className="text-indigo-500 shrink-0" />
                  <span>**TRUIX dev**</span>
                </div>
                <div className="flex items-center gap-2 text-content-secondary">
                  <MapPin size={16} className="text-indigo-500 shrink-0" />
                  <span>Abidjan, Koumassi, Côte d'Ivoire</span>
                </div>
                <div className="flex items-center gap-2 text-content-secondary">
                  <Phone size={16} className="text-indigo-500 shrink-0" />
                  <span>+225 01 72 64 91 10</span>
                </div>
                <div className="flex items-center gap-2 text-content-secondary">
                  <Mail size={16} className="text-indigo-500 shrink-0" />
                  <span>truixk@gmail.com</span>
                </div>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed pt-2 border-t border-border/50">
                **Registre du Commerce et du Crédit Mobilier (RCCM) :** CI-ABJ-03-2026-B16-00000 <br />
                **Directeur de la Publication :** L'équipe de Direction Générale CAMPUS.
              </p>
            </div>
          </section>

          {/* Hébergeur */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-content">2. Hébergement de la Plateforme</h2>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-3">
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                Les serveurs de CAMPUS assurant le stockage sécurisé des bases de données et des applications sont hébergés sur des infrastructures hautement sécurisées en conformité avec les réglementations en vigueur sur la souveraineté numérique locale.
              </p>
              <p className="text-xs text-content-secondary leading-relaxed font-semibold">
                Infrastructures de serveurs cloud certifiées ISO/IEC 27001, SOC 1/2, avec sauvegardes régulières externalisées.
              </p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950/40">
                <Scale className="w-5 h-5 text-indigo-500" />
              </div>
              <h2 className="text-xl font-bold text-content">3. Propriété Intellectuelle</h2>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
              <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
                La structure générale de la plateforme CAMPUS ainsi que les textes, graphiques, logos, designs, codes sources, icônes et images sont la propriété exclusive de CAMPUS ou ont fait l'objet d'une autorisation d'utilisation. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable.
              </p>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}

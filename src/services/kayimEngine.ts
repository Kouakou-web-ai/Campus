// ============================================
// MOTEUR IA & RAG LOCAL DE KAYIM (CAMPUS SaaS)
// ============================================

import { KAYIM_KNOWLEDGE_BASE } from '../constants/kayimKnowledge';
import type { KayimChatMessage, KayimProcedure, KayimFAQ, KayimErrorSolution, KayimActionButton } from '../types/kayim';
import type { UserRole } from '../store/authStore';

export interface SearchMatchResult {
  procedure?: KayimProcedure;
  faq?: KayimFAQ;
  error?: KayimErrorSolution;
  score: number;
}

/**
 * Mots vides (stop words) en français à ignorer pour éviter le bruit
 */
const FRENCH_STOP_WORDS = new Set([
  'comment', 'faire', 'pour', 'avec', 'dans', 'sont', 'quel', 'quels', 'quelle', 'quelles',
  'est', 'cest', 'c’est', 'tout', 'plus', 'avoir', 'etre', 'votre', 'notre', 'nous', 'vous',
  'mon', 'ma', 'mes', 'son', 'sa', 'ses', 'des', 'les', 'une', 'un', 'que', 'qui', 'aux',
  'par', 'sur', 'parce', 'quoi', 'quand', 'ou', 'dans', 'en', 'au', 'du', 'de', 'la',
  'le', 'ne', 'pas', 'si', 'se', 'sa', 'ce', 'cet', 'cette', 'ces', 'vers', 'chez',
  'avez', 'etes', 'fait', 'font', 'tous', 'toutes', 'peux', 'peut', 'peuvent', 'dis',
  'donne', 'moi', 'explication', 'expliquer', 'savoir', 'voir', 'voulais', 'veux', 'besoin',
  'dire', 'gens', 'type', 'types', 'peut-on', 'puis-je', 'est-ce'
]);

/**
 * Normalise un texte (sans majuscules, accents, ni ponctuation)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Extrait les mots significatifs
 */
function extractMeaningfulWords(text: string): string[] {
  const norm = normalizeText(text);
  return norm
    .split(/\s+/)
    .filter((w) => w.length > 1 && !FRENCH_STOP_WORDS.has(w));
}

/**
 * Mots d'actions spécifiques à fort impact pour vérifier l'adéquation d'intention
 */
const INTENT_ACTION_WORDS = [
  'resilier', 'resiliation', 'annuler', 'annulation', 'rembourser', 'remboursement',
  'creer', 'creation', 'supprimer', 'suppression', 'saisir', 'payer', 'paiement',
  'reinitialiser', 'oublie', 'valider', 'editer', 'imprimer', 'signer', 'signature'
];

/**
 * Recherche hybride RAG dans la base de connaissances KAYIM selon le rôle de l'utilisateur
 */
export function queryKayimKnowledge(query: string, userRole: UserRole): SearchMatchResult[] {
  const normQuery = normalizeText(query);
  const meaningfulWords = extractMeaningfulWords(query);

  if (meaningfulWords.length === 0) return [];

  // Déterminer si l'utilisateur demande une action spécifique (ex: annuler, résilier, créer, etc.)
  const queryActionWords = meaningfulWords.filter((w) => INTENT_ACTION_WORDS.includes(w));

  const results: SearchMatchResult[] = [];

  for (const module of KAYIM_KNOWLEDGE_BASE.modules) {
    // 1. Procédures
    for (const proc of module.procedures) {
      if (!proc.roles.includes('ALL') && !proc.roles.includes(userRole)) continue;

      let score = 0;
      const titleNorm = normalizeText(proc.title);
      const descNorm = normalizeText(proc.description);
      const allProcKeywords = proc.keywords.map((k) => normalizeText(k));

      // Si l'utilisateur demande une action spécifique (ex: résilier/annuler), la procédure doit correspondre
      if (queryActionWords.length > 0) {
        const matchesAction = queryActionWords.some(
          (act) => titleNorm.includes(act) || descNorm.includes(act) || allProcKeywords.includes(act)
        );
        if (!matchesAction) continue; // Ignorer les procédures qui ne traitent pas cette action !
      }

      for (const word of meaningfulWords) {
        if (allProcKeywords.includes(word)) score += 10;
        if (titleNorm.includes(word)) score += 6;
        if (descNorm.includes(word)) score += 3;
      }

      if (score >= 8) {
        results.push({ procedure: proc, score });
      }
    }

    // 2. FAQ
    for (const faq of module.faq) {
      if (!faq.rolesAllowed.includes('ALL') && !faq.rolesAllowed.includes(userRole)) continue;

      let score = 0;
      const qNorm = normalizeText(faq.question);
      const aNorm = normalizeText(faq.answer);
      const allFaqKeywords = faq.keywords.map((k) => normalizeText(k));

      if (queryActionWords.length > 0) {
        const matchesAction = queryActionWords.some(
          (act) => qNorm.includes(act) || aNorm.includes(act) || allFaqKeywords.includes(act)
        );
        if (!matchesAction) continue;
      }

      for (const word of meaningfulWords) {
        if (allFaqKeywords.includes(word)) score += 10;
        if (qNorm.includes(word)) score += 6;
        if (aNorm.includes(word)) score += 2;
      }

      if (score >= 8) {
        results.push({ faq, score });
      }
    }

    // 3. Erreurs
    for (const err of module.errors) {
      if (!err.roles.includes('ALL') && !err.roles.includes(userRole)) continue;

      let score = 0;
      const msgNorm = normalizeText(err.messagePattern);
      const causeNorm = normalizeText(err.cause);

      for (const word of meaningfulWords) {
        if (msgNorm.includes(word)) score += 8;
        if (causeNorm.includes(word)) score += 4;
      }

      if (score >= 8) {
        results.push({ error: err, score });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Génère la réponse rédigée de KAYIM avec actions et étapes pas à pas
 */
export async function generateKayimResponse(
  userQuery: string,
  userRole: UserRole,
  userName?: string
): Promise<Partial<KayimChatMessage>> {
  const normQuery = normalizeText(userQuery);
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Auteur / Créateur de l'application
  const authorKeywords = [
    'auteur', 'createur', 'developpeur', 'fondateur', 'qui a fait', 
    'qui a cree', 'qui t a cree', 'qui t a fait', 'kouakou', 'mondesire', 
    'ismael', 'concepteur', 'qui est l auteur', 'qui a developpe'
  ];
  if (authorKeywords.some((kw) => normQuery.includes(kw))) {
    return {
      sender: 'kayim',
      timestamp: now,
      text: `L'application **CAMPUS** a été entièrement conçue et développée par **KOUAKOU ATSE ISMAEL MONDESIRE**.\n\n👨‍💻 **À propos de l'auteur :**\n• **Spécialités :** Développeur Full Stack & Mobile, Expert IA & Automatisation\n• **Compétences Design :** Création de visuels et d'interfaces de niveau SaaS Premium\n📍 **Localisation :** Abidjan, Côte d'Ivoire.`,
      actionButtons: [
        { label: '📞 Contact Auteur & Support', url: '/contact' }
      ]
    };
  }

  // 2. Salutations simples
  if (['bonjour', 'salut', 'coucou', 'hello', 'bonsoir', 'hey'].some((g) => normQuery === g || normQuery.startsWith(g + ' '))) {
    return {
      sender: 'kayim',
      timestamp: now,
      text: `Bonjour ${userName ? userName : ''} 👋, je suis KAYIM, votre assistant intelligent sur CAMPUS. Que souhaitez-vous savoir ou réaliser aujourd'hui ?`,
      actionButtons: getRoleQuickActions(userRole)
    };
  }

  // 3. Recherche RAG dans la base de connaissances
  const matches = queryKayimKnowledge(userQuery, userRole);
  const bestMatch = matches[0];

  if (bestMatch && bestMatch.score >= 8) {
    if (bestMatch.procedure) {
      const p = bestMatch.procedure;
      let text = `Voici les étapes à suivre pour **${p.title}** :\n\n`;
      p.steps.forEach((s) => {
        text += `**Étape ${s.stepNumber} : ${s.title}**\n${s.description}${s.uiLocation ? ` _(Emplacement : ${s.uiLocation})_` : ''}\n\n`;
      });

      const buttons: KayimActionButton[] = [];
      if (p.suggestedUrl) {
        buttons.push({ label: `Accéder à : ${p.title}`, url: p.suggestedUrl });
      }

      return {
        sender: 'kayim',
        timestamp: now,
        text: text.trim(),
        steps: p.steps,
        actionButtons: buttons
      };
    }

    if (bestMatch.faq) {
      const f = bestMatch.faq;
      const buttons: KayimActionButton[] = [];
      if (f.suggestedUrl) {
        buttons.push({ label: 'Ouvrir la page dédiée', url: f.suggestedUrl });
      }

      return {
        sender: 'kayim',
        timestamp: now,
        text: `**${f.question}**\n\n${f.answer}`,
        actionButtons: buttons
      };
    }

    if (bestMatch.error) {
      const e = bestMatch.error;
      let text = `⚠️ **Résolution de l'erreur : ${e.errorCode}**\n\n**Cause possible :** ${e.cause}\n\n**Étapes de solution :**\n`;
      e.solutionSteps.forEach((s, idx) => {
        text += `${idx + 1}. ${s}\n`;
      });
      return {
        sender: 'kayim',
        timestamp: now,
        text: text.trim(),
        isError: true
      };
    }
  }

  // 4. FALLBACK STRICT : Si la question n'a pas de réponse dans la base de connaissances,
  // KAYIM le dit clairement et réoriente vers le mail truixk@gmail.com et le formulaire de contact !
  return {
    sender: 'kayim',
    timestamp: now,
    text: `Désolé, je n'ai pas la réponse à cette question dans ma base de connaissances.\n\nJe vous invite à contacter notre service client pour obtenir une assistance personnalisée :\n• 📧 **Par e-mail :** truixk@gmail.com\n• 📝 **Via le formulaire :** Vous pouvez remplir le formulaire de contact sur la page [Contact](/contact).`,
    actionButtons: [
      { label: '📧 Écrire à truixk@gmail.com', url: 'mailto:truixk@gmail.com' },
      { label: '📝 Formulaire de Contact', url: '/contact' }
    ]
  };
}

/**
 * Boutons de raccourcis d'actions selon le rôle
 */
export function getRoleQuickActions(role: UserRole): KayimActionButton[] {
  switch (role) {
    case 'SUPER_ADMIN':
      return [
        { label: '📊 Tableau de Bord', url: '/app/super-admin' },
        { label: '🏛️ Universités', url: '/app/super-admin/universites' },
        { label: '💳 Offres & Tarifs', url: '/tarifs' }
      ];
    case 'UNIVERSITY_ADMIN':
      return [
        { label: '👥 Gestion Étudiants', url: '/app/admin/etudiants' },
        { label: '👨‍🏫 Gestion Enseignants', url: '/app/admin/enseignants' },
        { label: '💳 Offres & Abonnements', url: '/tarifs' }
      ];
    case 'STUDENT_MANAGER':
      return [
        { label: '📝 Gestion Inscriptions', url: '/app/admin/etudiants' },
        { label: '📜 Bulletins & Notes', url: '/app/admin/bulletins' }
      ];
    case 'FINANCE_MANAGER':
      return [
        { label: '💳 Centre Financier', url: '/app/admin/finance' },
        { label: '💳 Grille des Tarifs', url: '/tarifs' }
      ];
    case 'TEACHER':
      return [
        { label: '📝 Saisir les notes', url: '/app/enseignant/notes' },
        { label: '📋 Prise d\'Appel', url: '/app/enseignant/absences' },
        { label: '📚 Devoirs & Cours', url: '/app/enseignant/devoirs' }
      ];
    case 'STUDENT':
      return [
        { label: '📊 Consulter mes notes', url: '/app/etudiant/notes' },
        { label: '📅 Emploi du temps', url: '/app/etudiant/planning' },
        { label: '💳 Payer ma scolarité', url: '/app/etudiant/paiements' }
      ];
    case 'PARENT':
      return [
        { label: '👨‍🎓 Suivi de mon enfant', url: '/app/parent/suivi' },
        { label: '📊 Relevé académique', url: '/app/parent/academique' },
        { label: '💳 Régler la scolarité', url: '/app/parent/scolarite' }
      ];
    default:
      return [
        { label: '💳 Offres & Tarifs', url: '/tarifs' },
        { label: '🔑 Se Connecter', url: '/connexion' },
        { label: '📞 Contact Support', url: '/contact' }
      ];
  }
}



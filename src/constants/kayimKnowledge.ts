// ============================================
// BASE DE CONNAISSANCES OFFICIELLE DE KAYIM (CAMPUS SaaS)
// ============================================

import type { KayimKnowledgeBase } from '../types/kayim';

export const KAYIM_KNOWLEDGE_BASE: KayimKnowledgeBase = {
  version: '1.0.0',
  lastUpdated: '2026-07-23',
  modules: [
    // ----------------------------------------------------
    // MODULE 1 : AUTHENTIFICATION & COMPTES
    // ----------------------------------------------------
    {
      moduleId: 'mod-auth-accounts',
      name: 'Authentification & Compte',
      category: 'AUTH',
      description: 'Création de compte, connexion, réinitialisation de mot de passe et activation d\'invitations.',
      targetRoles: ['ALL'],
      procedures: [
        {
          id: "proc-reset-password",
          title: "Réinitialiser son mot de passe",
          description: "Procédure d'oubli de mot de passe en ligne.",
          roles: ["ALL"],
          suggestedUrl: "/connexion",
          keywords: ["mot de passe", "oublié", "réinitialiser", "connexion", "accès"],
          steps: [
            { stepNumber: 1, title: "Page de connexion", description: "Rendez-vous sur la page de connexion de la plateforme.", uiLocation: "/connexion" },
            { stepNumber: 2, title: "Lien Mot de passe oublié", description: "Cliquez sur 'Mot de passe oublié ?' situé sous le champ de saisie du mot de passe.", uiLocation: "Lien sous le formulaire" },
            { stepNumber: 3, title: "Saisie de l'email", description: "Entrez votre adresse e-mail institutionnelle puis cliquez sur 'Envoyer'.", uiLocation: "Formulaire de réinitialisation" },
            { stepNumber: 4, title: "Vérification email", description: "Ouvrez l'email reçu et cliquez sur le lien sécurisé pour définir votre nouveau mot de passe.", uiLocation: "Boîte de réception Email" }
          ]
        },
        {
          id: "proc-create-student-account",
          title: "Créer un compte étudiant (Administrateur)",
          description: "Enregistrement d'un nouvel étudiant par l'administration ou la scolarité.",
          roles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "STUDENT_MANAGER"],
          suggestedUrl: "/app/admin/etudiants",
          keywords: ["créer", "compte", "étudiant", "inscription", "ajouter"],
          steps: [
            { stepNumber: 1, title: "Espace Administration", description: "Connectez-vous avec vos identifiants d'administrateur ou gestionnaire.", uiLocation: "/connexion" },
            { stepNumber: 2, title: "Menu Étudiants", description: "Ouvrez le menu 'Gestion des Utilisateurs' > 'Étudiants'.", uiLocation: "Sidebar > Étudiants" },
            { stepNumber: 3, title: "Formulaire de création", description: "Cliquez sur le bouton '+ Créer un étudiant'.", uiLocation: "Bouton supérieur droit" },
            { stepNumber: 4, title: "Remplissage des champs", description: "Renseignez le nom, prénom, email, matricule, filière, niveau et classe.", uiLocation: "Modale Formulaire" },
            { stepNumber: 5, title: "Validation", description: "Cliquez sur 'Enregistrer'. Le système génère automatiquement les identifiants et notifie l'étudiant.", uiLocation: "Bouton Enregistrer" }
          ]
        },
        {
          id: "proc-create-teacher-account",
          title: "Créer un compte enseignant",
          description: "Ajout d'un nouvel enseignant dans l'établissement.",
          roles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "TEACHER_MANAGER"],
          suggestedUrl: "/app/admin/enseignants",
          keywords: ["enseignant", "professeur", "compte", "créer", "ajouter"],
          steps: [
            { stepNumber: 1, title: "Menu Enseignants", description: "Rendez-vous dans la rubrique 'Enseignants' du tableau de bord.", uiLocation: "Sidebar > Enseignants" },
            { stepNumber: 2, title: "Bouton Ajouter", description: "Cliquez sur '+ Ajouter un enseignant'.", uiLocation: "Haut de page" },
            { stepNumber: 3, title: "Saisie des données", description: "Saisissez les coordonnées, la spécialité et la classe attribuée.", uiLocation: "Formulaire Enseignant" },
            { stepNumber: 4, title: "Enregistrement", description: "Validez la création. Un email avec mot de passe temporaire est généré.", uiLocation: "Bouton Valider" }
          ]
        }
      ],
      faq: [
        {
          id: "faq-author-creator",
          question: "Qui est l'auteur / créateur de l'application CAMPUS ?",
          answer: "L'application **CAMPUS** a été entièrement conçue et développée par **KOUAKOU ATSE ISMAEL MONDESIRE**.\n\n👨‍💻 **Profil de l'auteur :**\n• **Expertise :** Développeur Full Stack & Mobile, Spécialiste IA & Automatisation.\n• **Design Visuel :** Compétences avancées en UI/UX et création de visuels SaaS Premium.\n📍 **Localisation :** Abidjan, Côte d'Ivoire.",
          rolesAllowed: ["ALL"],
          keywords: ["auteur", "créateur", "développeur", "fondateur", "développé", "créé", "kouakou", "mondesire", "ismael", "concepteur", "qui a fait", "qui t'a créé"],
          suggestedUrl: "/contact"
        },
        {
          id: "faq-after-account-creation",
          question: "Que se passe-t-il après la création du compte ?",
          answer: "Une fois le compte créé : 1. Le compte est enregistré dans le système. 2. Les identifiants sont générés. 3. L'utilisateur reçoit un e-mail de confirmation. 4. Dès activation, l'utilisateur peut se connecter à son tableau de bord personnalisé.",
          rolesAllowed: ["ALL"],
          keywords: ["après", "création", "identifiants", "activation"]
        },
        {
          id: "faq-google-login",
          question: "Puis-je me connecter avec Google ?",
          answer: "Oui, la connexion Google est disponible pour les étudiants, enseignants et parents. Attention : le compte Super Administrateur requiert une connexion classique par e-mail et mot de passe pour des raisons de sécurité.",
          rolesAllowed: ["ALL"],
          keywords: ["google", "sso", "connexion"]
        },
        {
          id: "faq-email-already-exists",
          question: "Que faire si mon adresse email est déjà enregistrée ?",
          answer: "Si votre adresse email est déjà utilisée dans le système :\n1. Vérifiez si vous possédez déjà un compte actif.\n2. Si vous avez oublié votre mot de passe, utilisez la procédure de réinitialisation de mot de passe.\n3. En cas de doute, contactez le service administratif ou notre support.",
          rolesAllowed: ["ALL"],
          keywords: ["email", "adresse", "déjà", "utilisée", "compte existant"],
          suggestedUrl: "/connexion"
        }
      ],
      errors: []
    },

    // ----------------------------------------------------
    // MODULE 2 : INSCRIPTIONS & GESTION SCOLAIRE
    // ----------------------------------------------------
    {
      moduleId: 'mod-scolarite-inscriptions',
      name: 'Scolarité & Inscriptions',
      category: 'INSCRIPTIONS',
      description: 'Enregistrement des candidatures, validation des inscriptions et édition des cartes.',
      targetRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'STUDENT_MANAGER', 'STUDENT'],
      procedures: [
        {
          id: "proc-validate-registration",
          title: "Valider une demande d'inscription",
          description: "Traitement et validation d'une candidature étudiante par la scolarité.",
          roles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "STUDENT_MANAGER"],
          suggestedUrl: "/app/admin/etudiants",
          keywords: ["valider", "inscription", "dossier", "candidature", "accepter"],
          steps: [
            { stepNumber: 1, title: "Menu Demandes d'Inscription", description: "Naviguez vers 'Gestion des Étudiants'.", uiLocation: "Sidebar > Étudiants" },
            { stepNumber: 2, title: "Consultation du dossier", description: "Cliquez sur une demande en attente pour analyser les pièces jointes.", uiLocation: "Tableau des étudiants" },
            { stepNumber: 3, title: "Décision", description: "Cliquez sur 'Approuver' ou 'Rejeter' en motivant le choix si nécessaire.", uiLocation: "Boutons d'action" }
          ]
        },
        {
          id: "proc-print-student-card",
          title: "Éditer une carte étudiante",
          description: "Génération et impression de la carte officielle avec QR Code.",
          roles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "STUDENT_MANAGER"],
          suggestedUrl: "/app/admin/etudiants",
          keywords: ["carte", "étudiante", "imprimer", "éditer", "qr code"],
          steps: [
            { stepNumber: 1, title: "Section Cartes Étudiantes", description: "Allez dans 'Gestion des Étudiants'.", uiLocation: "Sidebar > Étudiants" },
            { stepNumber: 2, title: "Sélection de l'étudiant", description: "Recherchez l'étudiant par son nom ou son matricule.", uiLocation: "Barre de recherche" },
            { stepNumber: 3, title: "Génération PDF", description: "Cliquez sur 'Générer la Carte PDF' pour télécharger le fichier prêt à l'impression.", uiLocation: "Bouton Télécharger Carte" }
          ]
        }
      ],
      faq: [
        {
          id: "faq-student-status",
          question: "Quels sont les différents statuts d'un étudiant ?",
          answer: "Un étudiant peut avoir les statuts suivants : Actif (inscrit régulièrement), En attente (dossier non validé), Suspendu (frais impayés ou mesure disciplinaire) ou Terminé (diplômé).",
          rolesAllowed: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "STUDENT_MANAGER", "TEACHER"],
          keywords: ["statut", "actif", "suspendu", "attente"]
        }
      ],
      errors: []
    },

    // ----------------------------------------------------
    // MODULE 3 : EVALUATIONS & NOTES
    // ----------------------------------------------------
    {
      moduleId: 'mod-evaluations-notes',
      name: 'Notes & Évaluations',
      category: 'NOTES_EVALUATIONS',
      description: 'Saisie des notes, bulletins de notes, coefficients et appréciations.',
      targetRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
      procedures: [
        {
          id: "proc-enter-grades",
          title: "Saisir les notes d'une classe",
          description: "Saisie et publication des notes de devoirs ou d'examens par l'enseignant.",
          roles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN", "TEACHER"],
          suggestedUrl: "/app/enseignant/notes",
          keywords: ["saisir", "notes", "évaluation", "examen", "bulletin", "moyenne"],
          steps: [
            { stepNumber: 1, title: "Espace Notes", description: "Accédez à la rubrique 'Gestion des Notes'.", uiLocation: "Sidebar > Gestion des Notes" },
            { stepNumber: 2, title: "Filtre Cours & Classe", description: "Sélectionnez votre matière et la classe correspondante.", uiLocation: "Sélecteur déroulant" },
            { stepNumber: 3, title: "Entrée des notes", description: "Remplissez les notes pour chaque étudiant dans le tableau.", uiLocation: "Champs texte du tableau" },
            { stepNumber: 4, title: "Validation", description: "Cliquez sur 'Valider et Publier'.", uiLocation: "Bouton Valider" }
          ]
        },
        {
          id: "proc-view-student-report",
          title: "Consulter son bulletin de notes",
          description: "Consultation du relevé de notes par l'étudiant ou le parent.",
          roles: ["STUDENT", "PARENT"],
          suggestedUrl: "/app/etudiant/notes",
          keywords: ["bulletin", "relevé", "notes", "moyenne", "semestre"],
          steps: [
            { stepNumber: 1, title: "Menu Mes Notes", description: "Cliquez sur 'Résultats Académiques' ou 'Suivi Académique'.", uiLocation: "Sidebar > Notes" },
            { stepNumber: 2, title: "Choix du semestre", description: "Sélectionnez le semestre désiré (ex: Semestre 1).", uiLocation: "Onglets des semestres" },
            { stepNumber: 3, title: "Téléchargement PDF", description: "Cliquez sur 'Télécharger le bulletin officiel' pour obtenir la version signée.", uiLocation: "Bouton PDF" }
          ]
        }
      ],
      faq: [
        {
          id: "faq-grade-signature",
          question: "Qui doit signer les bulletins de notes ?",
          answer: "Le bulletin comporte 3 emplacements de signatures électroniques stricts : 1. L'Enseignant (signe uniquement ses propres cours enseignant). 2. Le Chef de Département / Admin (signe l'emplacement bas 'Chef de Département'). 3. Le Responsable de Scolarité / Finance (signe l'emplacement bas 'Responsable de Scolarité'). Une fois votre signature enregistrée dans votre profil, elle s'applique automatiquement sur vos zones autorisées.",
          rolesAllowed: ["ALL"],
          keywords: ["signature", "bulletin", "responsable", "signaturer", "professeur", "département", "scolarité"]
        }
      ],
      errors: []
    },

    // ----------------------------------------------------
    // MODULE 4 : FINANCES & PAIEMENTS
    // ----------------------------------------------------
    {
      moduleId: 'mod-finances-payments',
      name: 'Finances & Scolarité',
      category: 'PAIEMENTS_FINANCES',
      description: 'Paiement de la scolarité, reçus, échéanciers et suivi des impayés.',
      targetRoles: ['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'FINANCE_MANAGER', 'STUDENT', 'PARENT'],
      procedures: [
        {
          id: "proc-pay-tuition",
          title: "Effectuer un paiement de scolarité",
          description: "Règlement des frais d'études en ligne ou enregistrement par le gestionnaire.",
          roles: ["FINANCE_MANAGER", "STUDENT", "PARENT"],
          suggestedUrl: "/app/etudiant/paiements",
          keywords: ["payer", "scolarité", "frais", "tranche", "recette", "carte"],
          steps: [
            { stepNumber: 1, title: "Espace Finances", description: "Ouvrez l'onglet 'Paiements & Scolarité'.", uiLocation: "Sidebar > Paiements" },
            { stepNumber: 2, title: "Sélection de la tranche", description: "Choisissez la tranche de scolarité à régler.", uiLocation: "Liste des échéances" },
            { stepNumber: 3, title: "Mode de paiement", description: "Sélectionnez le mode de paiement (Carte Bancaire, Mobile Money ou Virement).", uiLocation: "Formulaire de paiement" },
            { stepNumber: 4, title: "Obtention du reçu", description: "Une fois le paiement validé, téléchargez votre reçu officiel imprimable.", uiLocation: "Bouton Reçu PDF" }
          ]
        }
      ],
      faq: [
        {
          id: "faq-payment-receipt",
          question: "Où trouver mes reçus de paiement ?",
          answer: "Vos reçus sont disponibles immédiatement après validation dans 'Paiements & Scolarité' > 'Historique des transactions' > Cliquez sur 'Télécharger le reçu'.",
          rolesAllowed: ["STUDENT", "PARENT", "FINANCE_MANAGER"],
          keywords: ["reçu", "facture", "historique", "preuve"]
        }
      ],
      errors: []
    },

    // ----------------------------------------------------
    // MODULE 5 : EMPLOI DU TEMPS & PRESENCES
    // ----------------------------------------------------
    {
      moduleId: 'mod-schedule-attendance',
      name: 'Emploi du Temps & Présences',
      category: 'EMPLOI_DU_TEMPS',
      description: 'Consultation des plannings, visioconférence et suivi des absences.',
      targetRoles: ['ALL'],
      procedures: [
        {
          id: "proc-view-schedule",
          title: "Consulter son emploi du temps",
          description: "Visualisation des cours et des salles attribuées.",
          roles: ["ALL"],
          suggestedUrl: "/app/etudiant/planning",
          keywords: ["emploi du temps", "planning", "cours", "salle", "horaire"],
          steps: [
            { stepNumber: 1, title: "Menu Emploi du Temps", description: "Rendez-vous dans la section 'Emploi du Temps'.", uiLocation: "Sidebar > Emploi du Temps" },
            { stepNumber: 2, title: "Vue Semaine/Mois", description: "Basculez entre la vue hebdomadaire et mensuelle.", uiLocation: "Sélecteur de vue supérieur" }
          ]
        },
        {
          id: "proc-take-attendance",
          title: "Faire l'appel en classe (Enseignant)",
          description: "Prise de présence en temps réel pendant un cours.",
          roles: ["TEACHER"],
          suggestedUrl: "/app/enseignant/absences",
          keywords: ["appel", "présence", "absence", "retard", "étudiants"],
          steps: [
            { stepNumber: 1, title: "Menu Prise de Présence", description: "Allez dans 'Gestion des Absences'.", uiLocation: "Sidebar > Absences" },
            { stepNumber: 2, title: "Sélection du cours", description: "Choisissez le cours actif du jour.", uiLocation: "Liste des cours" },
            { stepNumber: 3, title: "Marquage des statuts", description: "Cochez 'Présent', 'Absent' ou 'Retard' pour chaque élève.", uiLocation: "Matrice d'appel" },
            { stepNumber: 4, title: "Enregistrement", description: "Cliquez sur 'Enregistrer l'appel'.", uiLocation: "Bouton Enregistrer" }
          ]
        }
      ],
      faq: [
        {
          id: "faq-parent-child-link",
          question: "Comment relier un compte parent à un enfant ?",
          answer: "En tant que parent : 1. Accédez à 'Mon Profil' > 'Mes Enfants'. 2. Saisissez le Matricule officiel et le Code de Liaison fourni par la scolarité. 3. Validez l'association.",
          rolesAllowed: ["PARENT", "STUDENT_MANAGER"],
          keywords: ["parent", "enfant", "lier", "associer", "matricule"]
        }
      ],
      errors: []
    },

    // ----------------------------------------------------
    // MODULE 6 : TARIFS & ABONNEMENTS
    // ----------------------------------------------------
    {
      moduleId: 'mod-pricing-subscriptions',
      name: 'Tarifs & Offres d\'Abonnement',
      category: 'TARIFS_ABONNEMENTS',
      description: 'Présentation des offres d\'abonnement, formules tarifaires (Gratuit, Starter, Pro, Premium), souscription pas à pas, avantages et limites.',
      targetRoles: ['ALL'],
      procedures: [
        {
          id: "proc-choose-plan",
          title: "Comment souscrire aux abonnements et offres CAMPUS ?",
          description: "Procédure pas à pas pour s'abonner et choisir la formule adaptée à votre établissement.",
          roles: ["ALL"],
          suggestedUrl: "/tarifs",
          keywords: ["souscrire", "abonnement", "abonnements", "s'abonner", "sabonner", "tarif", "tarifs", "prix", "formule", "formules", "payer", "offre", "offres", "demarche"],
          steps: [
            { stepNumber: 1, title: "Accéder à la page Tarifs", description: "Rendez-vous sur la page officielle des offres et tarifs de la plateforme CAMPUS.", uiLocation: "/tarifs" },
            { stepNumber: 2, title: "Choisir la fréquence de facturation", description: "Sélectionnez le mode 'Mensuel' ou 'Annuel'. La facturation annuelle vous fait bénéficier de 20% de réduction (2 mois gratuits par an).", uiLocation: "Sélecteur Mensuel / Annuel" },
            { stepNumber: 3, title: "Sélectionner votre formule", description: "Comparez les plans disponibles (Gratuit, Starter 50 000 FCFA/mois, Pro 100 000 FCFA/mois ou Premium Sur Mesure) selon la taille de votre université.", uiLocation: "Cartes des Tarifs" },
            { stepNumber: 4, title: "Cliquer sur le bouton d'inscription", description: "Cliquez sur 'Commencer l'essai', 'Inscrivez votre université' ou 'Nous contacter' pour le plan Premium.", uiLocation: "Bouton principal sous la carte" },
            { stepNumber: 5, title: "Finaliser l'enregistrement", description: "Remplissez les informations de votre établissement et validez le paiement ou l'enregistrement.", uiLocation: "Formulaire d'inscription" }
          ]
        },
        {
          id: "proc-upgrade-subscription",
          title: "Changer ou faire évoluer son offre d'abonnement",
          description: "Procédure pour passer à une offre supérieure (ex: de Starter à Pro).",
          roles: ["SUPER_ADMIN", "UNIVERSITY_ADMIN"],
          suggestedUrl: "/app/super-admin/universites",
          keywords: ["évoluer", "changer", "passer", "upgrade", "pro", "premium", "modifier abonnement"],
          steps: [
            { stepNumber: 1, title: "Espace Administration", description: "Connectez-vous à votre compte administrateur.", uiLocation: "/connexion" },
            { stepNumber: 2, title: "Gestion des Universités", description: "Accédez à la section 'Surveillance Universités' ou 'Paramètres de l'établissement'.", uiLocation: "Sidebar > Administration" },
            { stepNumber: 3, title: "Choix de la nouvelle offre", description: "Sélectionnez la formule souhaitée et validez le changement.", uiLocation: "Onglet Abonnement" }
          ]
        }
      ],
      faq: [
        {
          id: "faq-subscription-advantages-limits",
          question: "Quels sont les avantages et les limites des différents types d'abonnement ?",
          answer: "CAMPUS propose **4 types d'abonnements** avec leurs avantages et leurs limites :\n\n🎁 **1. Plan Gratuit (0 FCFA)** :\n• **Avantages :** Essai illimité sans engagement, idéal pour démarrer. Inclut la gestion des cours, des classes, le suivi simple des notes et l'emploi du temps en ligne.\n• **Limites :** Pas de paiements par Mobile Money/Carte bancaire, pas de statistiques globales de l'établissement, pas d'accompagnement personnalisé.\n\n🚀 **2. Plan Starter (50 000 FCFA/mois ou 40 000 FCFA/mois en annuel -20%)** :\n• **Avantages :** Conçu pour les petits établissements. Inclut jusqu'à 500 étudiants, le suivi complet des cours, la feuille d'appel numérique et la gestion des règlements de scolarité avec reçus.\n• **Limites :** Plafond strict à 500 étudiants, pas de statistiques de réussite globales, pas d'intégration API avec outils externes, pas de SLA garanti.\n\n⭐ **3. Plan Pro - Le plus populaire (100 000 FCFA/mois ou 80 000 FCFA/mois en annuel -20%)** :\n• **Avantages :** Pour les universités en croissance. Inclut jusqu'à 5 000 étudiants, toutes les fonctionnalités Starter, les statistiques de réussite de l'établissement, les rapports d'activité détaillés, la liaison API/outils externes, l'assistance prioritaire 24h/24 et l'accompagnement personnalisé au démarrage.\n• **Limites :** Plafond à 5 000 étudiants (passer au Premium au-delà), hébergement cloud partagé haut de gamme (non dédié).\n\n👑 **4. Plan Premium (Sur Mesure / Sur Devis)** :\n• **Avantages :** Pour les grandes institutions. Nombre d'étudiants illimité, toutes les options du plan Pro, serveur dédié sécurisé, garantie de fonctionnement permanent (SLA 99.9%), liaison sur mesure, conseiller dédié personnel et formation sur site des équipes.\n• **Limites :** Nécessite une étude personnalisée et un devis sur mesure avec l'équipe commerciale.",
          rolesAllowed: ["ALL"],
          keywords: ["avantages", "limites", "avantage", "limite", "differents", "types", "type", "abonnement", "abonnements", "comparatif", "details", "differences", "difference", "starter", "pro", "premium", "gratuit"],
          suggestedUrl: "/tarifs"
        },
        {
          id: "faq-how-to-subscribe",
          question: "Comment faire pour s'abonner aux différentes offres ?",
          answer: "Pour s'abonner à l'une des offres CAMPUS :\n1. Rendez-vous sur la page **[Offres & Tarifs](/tarifs)**.\n2. Choisissez la périodicité : **Mensuel** ou **Annuel** (bénéficiez de 20% de réduction en annuel, soit 2 mois offerts).\n3. Pour les plans **Gratuit**, **Starter** ou **Pro**, cliquez sur le bouton de souscription sous l'offre souhaitée et remplissez les informations de votre établissement.\n4. Pour le plan **Premium**, cliquez sur « Nous contacter » ou complétez le **[Formulaire de contact](/contact)**.\n\n💳 Les paiements s'effectuent par Mobile Money (Orange, MTN, Moov, Wave), Carte Bancaire ou Virement.",
          rolesAllowed: ["ALL"],
          keywords: ["comment", "s'abonner", "sabonner", "souscrire", "souscription", "faire pour s'abonner", "comment faire", "s'abonner aux offres", "moyen de paiement"],
          suggestedUrl: "/tarifs"
        },
        {
          id: "faq-pricing-details",
          question: "Quels sont les différents tarifs et plans d'abonnement ?",
          answer: "Les tarifs des abonnements CAMPUS sont transparents et adaptés :\n\n• **Plan Gratuit :** 0 FCFA (Essai illimité pour découvrir)\n• **Plan Starter :** 50 000 FCFA/mois (ou 40 000 FCFA/mois en annuel -20%)\n• **Plan Pro (Populaire) :** 100 000 FCFA/mois (ou 80 000 FCFA/mois en annuel -20%)\n• **Plan Premium :** Sur mesure / sur devis (étudiants illimités & serveur dédié)\n\n💡 *En annuel, vous économisez 20% sur la facture totale !*",
          rolesAllowed: ["ALL"],
          keywords: ["tarif", "tarifs", "prix", "combien", "fcfa", "cout", "coute"],
          suggestedUrl: "/tarifs"
        },
        {
          id: "faq-annual-discount",
          question: "Comment fonctionne la réduction de 20% sur l'abonnement annuel ?",
          answer: "En choisissant la facturation annuelle :\n• Plan Starter passe à **40 000 FCFA/mois** (soit 480 000 FCFA/an au lieu de 600 000 FCFA).\n• Plan Pro passe à **80 000 FCFA/mois** (soit 960 000 FCFA/an au lieu de 1 200 000 FCFA).\nVous économisez 2 mois d'abonnement par an !",
          rolesAllowed: ["ALL"],
          keywords: ["reduction", "remise", "annuel", "mensuel", "20%", "economie"],
          suggestedUrl: "/tarifs"
        },
        {
          id: "faq-subscription-cancelation",
          question: "Comment résilier ou annuler un abonnement ?",
          answer: "Pour toute demande de modification ou de résiliation de votre abonnement :\n• Vous pouvez écrire directement à notre service client à **truixk@gmail.com**.\n• Ou envoyer votre demande via le **[Formulaire de Contact](/contact)**.\n\nNos équipes traitent les demandes de résiliation sous 24h à 48h sans frais cachés.",
          rolesAllowed: ["ALL"],
          keywords: ["resilier", "resiliation", "annuler", "annulation", "arret", "arreter", "remboursement", "rembourser", "stop", "stopper"],
          suggestedUrl: "/contact"
        }
      ],
      errors: []
    },

    // ----------------------------------------------------
    // MODULE 7 : PAGES LÉGALES & RÉGLEMENTATION
    // ----------------------------------------------------
    {
      moduleId: 'mod-legal-compliance',
      name: 'Mentions Légales, CGU & Confidentialité',
      category: 'LEGAL',
      description: 'Informations juridiques, conditions d\'utilisation, éditeur TRUIX dev, conformité ARTCI et politique de confidentialité.',
      targetRoles: ['ALL'],
      procedures: [],
      faq: [
        {
          id: "faq-mentions-legales",
          question: "Que contiennent les Mentions Légales et qui est l'éditeur ?",
          answer: "📌 **Mentions Légales (Mise à jour : 01 Juillet 2026)** :\n\n• **Éditeur de la plateforme :** TRUIX dev\n• **Siège :** Abidjan, Koumassi, Côte d'Ivoire\n• **Téléphone :** +225 01 72 64 91 10\n• **Email :** truixk@gmail.com\n• **RCCM :** CI-ABJ-03-2026-B16-00000\n• **Hébergement :** Serveurs cloud certifiés ISO/IEC 27001 & SOC 1/2 avec souveraineté numérique locale.\n• **Propriété Intellectuelle :** Code source, logos et graphismes exclusifs à TRUIX dev / CAMPUS.",
          rolesAllowed: ["ALL"],
          keywords: ["mentions", "legales", "editeur", "truix", "rccm", "adresse", "telephone", "immatriculation", "hebergeur"],
          suggestedUrl: "/mentions-legales"
        },
        {
          id: "faq-cgu-conditions",
          question: "Quelles sont les Conditions Générales d'Utilisation (CGU) ?",
          answer: "📜 **Conditions Générales d'Utilisation (CGU)** :\n\n• **Cadre Légal :** Régies par la Loi n° 2013-546 (transactions électroniques) et la Loi n° 2013-451 (cybercriminalité PLCC) en Côte d'Ivoire.\n• **Gestion des Rôles :** Accès cloisonnés stricts par profil (Admin, Enseignant, Étudiant, Parent).\n• **Paiements Sécurisés :** Transactions encadrées par les normes BCEAO (Mobile Money Orange, MTN, Moov, Wave, Carte bancaire).\n• **Compétence juridique :** Tribunaux d'Abidjan.",
          rolesAllowed: ["ALL"],
          keywords: ["conditions", "cgu", "utilisation", "reglement", "lois", "plcc", "bceao", "tribunal", "abidjan"],
          suggestedUrl: "/conditions"
        },
        {
          id: "faq-confidentialite-donnees",
          question: "Comment sont protégées mes données personnelles (Confidentialité) ?",
          answer: "🔒 **Politique de Confidentialité & ARTCI** :\n\n• **Conformité :** Respect de la Loi n° 2013-450 relative à la protection des données à caractère personnel sous le contrôle de l'ARTCI.\n• **Multi-Tenant Étanche :** Aucune fuite ni partage de données entre universités.\n• **Aucun Profilage Publicitaire :** Vos données ne sont jamais vendues ni exploitées à des fins commerciales.\n• **Vos Droits :** Droit d'accès, rectification et suppression en écrivant à truixk@gmail.com.",
          rolesAllowed: ["ALL"],
          keywords: ["confidentialite", "donnees", "vie privee", "artci", "protection", "securite", "rgpd", "loi 2013"],
          suggestedUrl: "/confidentialite"
        }
      ],
      errors: []
    }
  ]
};


---
trigger: always_on
---

# RÈGLES OBLIGATOIRES DU PROJET

## Langue

L'intégralité de l'application doit être en français.

Cela inclut :

* Menus
* Boutons
* Tableaux
* Formulaires
* Messages d'erreur
* Messages de succès
* Notifications
* Tooltips
* Placeholders
* Dashboards
* Modales
* Emails simulés
* Pages publiques

Aucun texte visible par l'utilisateur ne doit être en anglais.

Les noms techniques internes peuvent rester en anglais uniquement pour le code.

---

## Stack Technique Obligatoire

Frontend :

* React.js
* TypeScript
* TailwindCSS
* DaisyUI
* Zustand
* React Router DOM
* React Hook Form
* Zod
* Lucide React

Package Manager :

* pnpm

Backend :

* Firebase Authentication
* Firebase Realtime Database

Interdictions :

* JavaScript pur
* CSS pur
* Bootstrap
* Material UI
* Chakra UI
* Redux

---

## Architecture

Respecter une architecture professionnelle scalable.

Utiliser :

* pages/
* components/
* layouts/
* routes/
* hooks/
* store/
* services/
* types/
* constants/
* lib/

Les composants doivent être réutilisables.

Aucune duplication de code.

---

## Design

Le design doit être de niveau SaaS Premium.

Inspirations :

* Stripe
* Linear
* Notion
* Framer
* Vercel

Interdictions :

* Interfaces vieillottes
* Design administratif classique
* Interfaces scolaires datées
* Couleurs agressives
* Pages surchargées

Objectifs :

* Moderne
* Premium
* Minimaliste
* Élégant
* Professionnel
* Responsive

---

## Responsive

Tous les écrans doivent fonctionner sur :

* Mobile
* Tablette
* Desktop

Mobile First obligatoire.

---

## DaisyUI

Utiliser DaisyUI dès qu'un composant existe.

Priorité :

* card
* table
* modal
* drawer
* dropdown
* navbar
* menu
* badge
* alert
* toast
* tabs

Ne pas recréer inutilement un composant déjà fourni par DaisyUI.

---

## Accessibilité

Respecter :

* Contraste suffisant
* Navigation clavier
* Labels de formulaires
* États focus visibles
* Responsive accessible

---

## Performance

Optimiser systématiquement :

* Lazy Loading
* Code Splitting
* Dynamic Imports
* Memoization lorsque nécessaire

Ne jamais charger inutilement toutes les pages.

---

## Qualité du Code

TypeScript strict obligatoire.

Interdictions :

* any
* code mort
* composants de plus de 300 lignes
* logique métier directement dans les pages

Créer :

* hooks personnalisés
* composants réutilisables
* services dédiés

---

## Gestion des États

Utiliser Zustand.

Créer plusieurs stores spécialisés :

* authStore
* universityStore
* studentStore
* teacherStore
* financeStore
* notificationStore

Ne pas créer un store géant unique.

---

## Sécurité Frontend

Ne jamais exposer :

* clés Firebase
* secrets
* tokens sensibles

Implémenter :

* Protected Routes
* Role Guards
* Gestion des permissions

---

## Expérience Utilisateur

Chaque page doit contenir :

* Loading State
* Empty State
* Error State
* Success State

Aucune page vide.

---

## Multi-Tenant

Toutes les interfaces doivent être conçues pour un SaaS multi-universités.

Les données doivent toujours être filtrées selon :

* universityId
* tenantId

Aucune fuite visuelle ou logique entre universités.

---

## Livraison

Chaque page générée doit être :

* Complète
* Fonctionnelle
* Responsive
* Typée TypeScript
* Compatible DaisyUI
* Compatible TailwindCSS
* Compatible React Router
* Compatible Zustand

Le résultat attendu est une application SaaS universitaire de niveau production prête pour une démonstration professionnelle.

# 🧠 Mémoire de l'Agent — CAMPUS SaaS

Ce fichier sert de mémoire persistante pour suivre l'état d'avancement des fonctionnalités intelligentes ajoutées au projet CAMPUS.

---

## 📅 Derniere mise à jour
- **Date** : 10 juin 2026
- **État général** : Phase 1 commencée, fondations analytiques posées.

---

## 🛠️ Ce qui a été fait

### 1. Audit complet du projet
- Analyse de la structure (React, TypeScript, Zustand, Firebase, DaisyUI, TailwindCSS).
- Identification des manques dans les dashboards (KPI statiques), les notifications (uniquement en mémoire sans persistance Firebase), et la recherche (OmniSearch basique).

### 2. Planification & Suivi
- Création du plan d'implémentation en 3 phases dans les artifacts :
  - Plan d'implémentation : [implementation_plan.md](file:///C:/Users/Asus/.gemini/antigravity-ide/brain/b58bdeb1-fe6a-40c0-a8aa-7e361fdca262/implementation_plan.md)
  - Liste des tâches : [task.md](file:///C:/Users/Asus/.gemini/antigravity-ide/brain/b58bdeb1-fe6a-40c0-a8aa-7e361fdca262/task.md)

### 3. Fondations Analytiques (Moteur de Décision)
- **Design Tokens de Graphiques** : Création de [chartTheme.ts](file:///c:/Users/Asus/OneDrive/Bureau/CAMPUS/src/constants/chartTheme.ts) contenant les palettes de couleurs DaisyUI/Tailwind, les dégradés pour graphiques en aire, les seuils de performance et les labels de tendances en français.
- **Moteur de Tendances** : Création de [trendEngine.ts](file:///c:/Users/Asus/OneDrive/Bureau/CAMPUS/src/lib/analytics/trendEngine.ts) contenant :
  - `calculateTrend` : calcul du pourcentage et direction de tendance (hausse, baisse, neutre) entre deux périodes.
  - `calculateSeriesTrend` : calcul sur une série temporelle glissante.
  - `detectAnomalies` : détection statistique des anomalies (> 2 écarts-types).
  - `getPerformanceLevel` : classification de la performance étudiante.
  - `calculateClassWeather` : score composite et météo de la classe (☀️, 🌤️, ⛅, 🌧️, ⛈️).
  - `detectStudentRisk` : algorithme multicritère pour détecter les étudiants en difficulté (notes, absences, impayés).

---

## 🚀 Prochaines étapes immédiates (Phase 1)

1. **Hook Zustand / Realtime Bridge** :
   - Créer `src/hooks/useSmartStats.ts` pour brancher le `trendEngine` sur les données du `realtimeDataStore`.
2. **Intégration Dashboard** :
   - Remplacer les statistiques statiques (change/trend) dans le tableau de bord Super Admin, Enseignant, et Étudiant par les données calculées dynamiquement.
3. **Persistance des Notifications** :
   - Modifier `src/store/notificationStore.ts` pour s'abonner et persister les notifications dans Firebase.
   - Créer `src/services/notificationTriggerService.ts` pour lever des notifications automatiques (ex: note publiée, devoir proche).
4. **Composants Graphiques Premium** :
   - Créer les composants `RadarCompetences.tsx`, `CourbeProgression.tsx`, `DonutGauge.tsx` et `HeatmapGrid.tsx`.
   - Mettre à jour le dashboard étudiant avec ces nouveaux graphiques interactifs.
5. **Recherche Globale Fuzzy** :
   - Améliorer l'OmniSearch actuel de la Topbar avec une recherche floue (fuzzy search) locale et navigation clavier complète.
6. **Pipeline Admissions Kanban (HubSpot Style)** :
   - Ajouter un composant Kanban drag-and-drop et s'y connecter dans `DemandesInscription.tsx`.
7. **Fiche Profil Étudiant 360° (Notion Style)** :
   - Créer `StudentProfile360.tsx` et l'intégrer pour ouverture depuis la table de gestion des étudiants.
8. **Assistant d'Emploi du Temps anti-conflits (Vercel Style)** :
   - Créer `scheduleConflictResolver.ts` et ajouter le panneau d'assistant interactif dans `GestionCours.tsx`.


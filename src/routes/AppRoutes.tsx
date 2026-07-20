import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';
import AccountStatusGuard from './AccountStatusGuard';
import AccountStatusRoute from './AccountStatusRoute';
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import AccountStatusLayout from '../layouts/AccountStatusLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingState from '../components/ui/LoadingState';
import SubscriptionGuard from '../components/shared/SubscriptionGuard';
// Helper pour recharger automatiquement la page si le chargement d'un chunk échoue (ex: après recompilation/déploiement)
function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    try {
      const component = await componentImport();
      sessionStorage.removeItem('chunk-reload-retry');
      return component;
    } catch (error) {
      console.error("Échec du chargement du composant, tentative de rechargement...", error);
      const hasReloaded = sessionStorage.getItem('chunk-reload-retry');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk-reload-retry', 'true');
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

// ─── Public pages ─────────────────────────────────────────────────────────────
const LandingPage      = lazyWithRetry(() => import('../pages/public/LandingPage'));
const PrixPage         = lazyWithRetry(() => import('../pages/public/PrixPage'));
const FAQPage          = lazyWithRetry(() => import('../pages/public/FAQPage'));
const ContactPage      = lazyWithRetry(() => import('../pages/public/ContactPage'));
const ConditionsPage   = lazyWithRetry(() => import('../pages/public/ConditionsPage'));
const MentionsPage     = lazyWithRetry(() => import('../pages/public/MentionsPage'));
const ConfidentialitePage = lazyWithRetry(() => import('../pages/public/ConfidentialitePage'));
const ConnexionPage    = lazyWithRetry(() => import('../pages/public/ConnexionPage'));
const InscriptionPage  = lazyWithRetry(() => import('../pages/public/InscriptionPage'));
const ActivationComptePage = lazyWithRetry(() => import('../pages/public/ActivationComptePage'));
const NotFoundPage     = lazyWithRetry(() => import('../pages/NotFoundPage'));

// ─── Super Admin ──────────────────────────────────────────────────────────────
const SuperAdminDashboard      = lazyWithRetry(() => import('../pages/super-admin/TableauDeBord'));
const AnalytiquesRevenu        = lazyWithRetry(() => import('../pages/super-admin/AnalytiquesRevenu'));
const SurveillanceUniversites  = lazyWithRetry(() => import('../pages/super-admin/SurveillanceUniversites'));
const DemandesAdministrateurs  = lazyWithRetry(() => import('../pages/super-admin/DemandesAdministrateurs'));

// ─── University Admin ─────────────────────────────────────────────────────────
const UniversityAdminDashboard = lazyWithRetry(() => import('../pages/university-admin/TableauDeBord'));
const GestionEtudiants    = lazyWithRetry(() => import('../pages/university-admin/GestionEtudiants'));
const DemandesInscription = lazyWithRetry(() => import('../pages/university-admin/DemandesInscription'));
const GestionEnseignants  = lazyWithRetry(() => import('../pages/university-admin/GestionEnseignants'));
const GestionCours        = lazyWithRetry(() => import('../pages/university-admin/GestionCours'));
const CentreFinancier     = lazyWithRetry(() => import('../pages/university-admin/CentreFinancier'));
const Gestionnaires       = lazyWithRetry(() => import('../pages/university-admin/Gestionnaires'));
const Classes             = lazyWithRetry(() => import('../pages/university-admin/Classes'));
const Bulletins           = lazyWithRetry(() => import('../pages/university-admin/Bulletins'));

// ─── Teacher ──────────────────────────────────────────────────────────────────
const TeacherDashboard       = lazyWithRetry(() => import('../pages/teacher/Dashboard').then(m => ({ default: m.TeacherDashboard })));
const GestionNotes           = lazyWithRetry(() => import('../pages/teacher/GestionNotes'));
const PublicationDevoirs     = lazyWithRetry(() => import('../pages/teacher/PublicationDevoirs'));
const GestionAbsences        = lazyWithRetry(() => import('../pages/teacher/GestionAbsences'));
const EmailsSimules          = lazyWithRetry(() => import('../pages/shared/EmailsSimules'));
const ParametresProfil       = lazyWithRetry(() => import('../pages/shared/ParametresProfil'));
const Visioconference        = lazyWithRetry(() => import('../pages/shared/Visioconference'));
const EvaluationSuggestions  = lazyWithRetry(() => import('../pages/shared/EvaluationSuggestions'));

// ─── Student ──────────────────────────────────────────────────────────────────
const PortailApprentissage   = lazyWithRetry(() => import('../pages/student/PortailApprentissage'));
const ResultatsAcademiques   = lazyWithRetry(() => import('../pages/student/ResultatsAcademiques'));
const Paiements              = lazyWithRetry(() => import('../pages/student/Paiements'));
const EmploiDuTemps          = lazyWithRetry(() => import('../pages/student/EmploiDuTemps'));

// ─── Parent ───────────────────────────────────────────────────────────────────
const SuiviEnfant     = lazyWithRetry(() => import('../pages/parent/SuiviEnfant'));
const SuiviAcademique = lazyWithRetry(() => import('../pages/parent/SuiviAcademique'));
const Scolarite       = lazyWithRetry(() => import('../pages/parent/Scolarite'));

// ─── Account status ───────────────────────────────────────────────────────────
const AccountPendingPage   = lazyWithRetry(() => import('../pages/account/AccountPendingPage'));
const AccountRejectedPage  = lazyWithRetry(() => import('../pages/account/AccountRejectedPage'));
const AccountSuspendedPage = lazyWithRetry(() => import('../pages/account/AccountSuspendedPage'));

// Loading fallback
const Loader = () => <LoadingState message="Chargement de la page…" />;

function AnimatedRoutes() {
  const location = useLocation();
  
  useEffect(() => {
    const ROUTE_TITLES: Record<string, string> = {
      '/': 'CAMPUS - Plateforme de Gestion Universitaire Tout-en-Un',
      '/tarifs': 'Offres & Tarifs',
      '/faq': 'Foire Aux Questions',
      '/contact': 'Contactez-nous',
      '/conditions': "Conditions Générales d'Utilisation",
      '/mentions-legales': 'Mentions Légales',
      '/confidentialite': 'Politique de Confidentialité',
      '/signup': 'Créer un Compte',
      '/connexion': 'Connexion',
      '/activation-compte': 'Activation de Compte',
      '/app/super-admin': 'Tableau de Bord Super Admin',
      '/app/super-admin/revenus': 'Analytiques Revenu',
      '/app/super-admin/universites': 'Surveillance Universités',
      '/app/super-admin/demandes': 'Demandes Administrateurs',
      '/app/admin': 'Tableau de Bord Administration',
      '/app/admin/cours': 'Gestion des Cours',
      '/app/admin/gestionnaires': 'Gestion des Collaborateurs',
      '/app/admin/classes': 'Gestion des Classes',
      '/app/admin/bulletins': 'Bulletins & Notes',
      '/app/admin/etudiants': 'Gestion des Étudiants',
      '/app/admin/enseignants': 'Gestion des Enseignants',
      '/app/admin/finance': 'Centre Financier',
      '/app/enseignant': 'Portail Enseignant',
      '/app/enseignant/notes': 'Gestion des Notes',
      '/app/enseignant/devoirs': 'Publication des Devoirs',
      '/app/enseignant/absences': 'Gestion des Absences',
      '/app/etudiant': 'Portail Étudiant',
      '/app/etudiant/notes': 'Résultats Académiques',
      '/app/etudiant/paiements': 'Règlements & Scolarité',
      '/app/etudiant/planning': 'Mon Emploi du Temps',
      '/app/parent': 'Suivi Enfant',
      '/app/parent/scolarite': 'Règlements Scolarité',
      '/app/parent/academique': 'Suivi Académique Enfant',
      '/app/parametres': 'Paramètres Profil',
      '/app/evaluation-suggestions': 'Évaluations & Suggestions',
    };

    const pathname = location.pathname;
    let title = ROUTE_TITLES[pathname];

    if (!title) {
      if (pathname.startsWith('/app/visioconference/')) {
        title = 'Visioconférence';
      } else {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length > 0) {
          const last = segments[segments.length - 1];
          title = last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
        }
      }
    }

    document.title = pathname === '/' ? ROUTE_TITLES['/'] : (title ? `${title} | CAMPUS` : 'CAMPUS');
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full"
      >
        <Routes location={location}>
          {/* ── Public ──────────────────────────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/"              element={<LandingPage />} />
            <Route path="/tarifs"        element={<PrixPage />} />
            <Route path="/faq"           element={<FAQPage />} />
            <Route path="/contact"       element={<ContactPage />} />
            <Route path="/conditions"    element={<ConditionsPage />} />
            <Route path="/mentions-legales" element={<MentionsPage />} />
            <Route path="/confidentialite" element={<ConfidentialitePage />} />
            <Route path="/signup"        element={<InscriptionPage />} />
          </Route>

          {/* ── Auth layout ─────────────────────────────────────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/connexion" element={<ConnexionPage />} />
            <Route path="/activation-compte" element={<ActivationComptePage />} />
          </Route>

          {/* ── Account status (authenticated, no dashboard) ─────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AccountStatusLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/account-pending"
              element={
                <AccountStatusRoute requiredStatus="pending">
                  <AccountPendingPage />
                </AccountStatusRoute>
              }
            />
            <Route
              path="/account-rejected"
              element={
                <AccountStatusRoute requiredStatus="rejected">
                  <AccountRejectedPage />
                </AccountStatusRoute>
              }
            />
            <Route
              path="/account-suspended"
              element={
                <AccountStatusRoute requiredStatus="suspended">
                  <AccountSuspendedPage />
                </AccountStatusRoute>
              }
            />
          </Route>

          {/* ── Protected dashboard ─────────────────────────────────────── */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AccountStatusGuard>
                  <DashboardLayout />
                </AccountStatusGuard>
              </ProtectedRoute>
            }
          >
            {/* Super Admin */}
            <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN']} />}>
              <Route path="super-admin"              element={<SuperAdminDashboard />} />
              <Route path="super-admin/revenus"      element={<AnalytiquesRevenu />} />
              <Route path="super-admin/universites"  element={<SurveillanceUniversites />} />
              <Route path="super-admin/demandes"     element={<DemandesAdministrateurs />} />
              {/* <Route path="super-admin/emails"       element={<EmailsSimules />} /> */}
            </Route>

            {/* University Admin & Managers */}
            <Route element={<RoleGuard allowedRoles={['UNIVERSITY_ADMIN']} />}>
              <Route path="admin"              element={<UniversityAdminDashboard />} />
              <Route path="admin/cours"       element={<GestionCours />} />
              <Route path="admin/gestionnaires" element={
                <SubscriptionGuard feature="hasGestionnaires" label="Gestion des Collaborateurs">
                  <Gestionnaires />
                </SubscriptionGuard>
              } />
              <Route path="admin/classes"      element={<Classes />} />
            </Route>
            <Route element={<RoleGuard allowedRoles={['UNIVERSITY_ADMIN', 'TEACHER']} />}>
              <Route path="admin/bulletins"    element={<Bulletins />} />
            </Route>
            <Route element={<RoleGuard allowedRoles={['UNIVERSITY_ADMIN', 'STUDENT_MANAGER']} />}>
              <Route path="admin/etudiants"   element={<GestionEtudiants />} />
            </Route>
            <Route element={<RoleGuard allowedRoles={['UNIVERSITY_ADMIN', 'TEACHER_MANAGER']} />}>
              <Route path="admin/enseignants" element={<GestionEnseignants />} />
            </Route>
            <Route element={<RoleGuard allowedRoles={['UNIVERSITY_ADMIN', 'FINANCE_MANAGER']} />}>
              <Route path="admin/finance"     element={
                <SubscriptionGuard feature="hasFinance" label="Centre Financier & Règlements">
                  <CentreFinancier />
                </SubscriptionGuard>
              } />
            </Route>

            {/* Teacher */}
            <Route element={<RoleGuard allowedRoles={['TEACHER']} />}>
              <Route path="enseignant"           element={<TeacherDashboard />} />
              <Route path="enseignant/notes"     element={<GestionNotes />} />
              <Route path="enseignant/devoirs"   element={
                <SubscriptionGuard feature="hasDevoirs" label="Publication des Devoirs">
                  <PublicationDevoirs />
                </SubscriptionGuard>
              } />
              <Route path="enseignant/absences"  element={
                <SubscriptionGuard feature="hasAbsences" label="Feuille d'Appel Numérique">
                  <GestionAbsences />
                </SubscriptionGuard>
              } />
            </Route>

            {/* Student */}
            <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
              <Route path="etudiant"          element={<PortailApprentissage />} />
              <Route path="etudiant/cours"    element={<PortailApprentissage />} />
              <Route path="etudiant/notes"    element={<ResultatsAcademiques />} />
              <Route path="etudiant/paiements" element={
                <SubscriptionGuard feature="hasFinance" label="Paiements en Ligne">
                  <Paiements />
                </SubscriptionGuard>
              } />
              <Route path="etudiant/planning" element={<EmploiDuTemps />} />
            </Route>

            {/* Parent */}
            <Route element={<RoleGuard allowedRoles={['PARENT']} />}>
              <Route path="parent"            element={<SuiviEnfant />} />
              <Route path="parent/suivi"      element={<SuiviEnfant />} />
              <Route path="parent/scolarite"  element={
                <SubscriptionGuard feature="hasFinance" label="Règlements Scolarité">
                  <Scolarite />
                </SubscriptionGuard>
              } />
              <Route path="parent/academique" element={<SuiviAcademique />} />
            </Route>

            {/* Paramètres partagés pour tous les rôles */}
            <Route path="parametres" element={<ParametresProfil />} />
            <Route path="visioconference/:meetingId" element={<Visioconference />} />

            {/* Évaluation & Suggestions partagé Parent & Admin */}
            <Route element={<RoleGuard allowedRoles={['PARENT', 'UNIVERSITY_ADMIN']} />}>
              <Route path="evaluation-suggestions" element={<EvaluationSuggestions />} />
            </Route>
          </Route>

          {/* Catch-all → 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

const routesPrefetchMap: Record<string, () => Promise<any>> = {
  '/': () => import('../pages/public/LandingPage'),
  '/tarifs': () => import('../pages/public/PrixPage'),
  '/faq': () => import('../pages/public/FAQPage'),
  '/contact': () => import('../pages/public/ContactPage'),
  '/app/super-admin': () => import('../pages/super-admin/TableauDeBord'),
  '/app/super-admin/revenus': () => import('../pages/super-admin/AnalytiquesRevenu'),
  '/app/super-admin/universites': () => import('../pages/super-admin/SurveillanceUniversites'),
  '/app/super-admin/demandes': () => import('../pages/super-admin/DemandesAdministrateurs'),
  '/app/admin': () => import('../pages/university-admin/TableauDeBord'),
  '/app/admin/cours': () => import('../pages/university-admin/GestionCours'),
  '/app/admin/etudiants': () => import('../pages/university-admin/GestionEtudiants'),
  '/app/admin/enseignants': () => import('../pages/university-admin/GestionEnseignants'),
  '/app/admin/finance': () => import('../pages/university-admin/CentreFinancier'),
  '/app/admin/classes': () => import('../pages/university-admin/Classes'),
  '/app/admin/bulletins': () => import('../pages/university-admin/Bulletins'),
  '/app/admin/gestionnaires': () => import('../pages/university-admin/Gestionnaires'),
  '/app/enseignant': () => import('../pages/teacher/Dashboard'),
  '/app/enseignant/notes': () => import('../pages/teacher/GestionNotes'),
  '/app/enseignant/devoirs': () => import('../pages/teacher/PublicationDevoirs'),
  '/app/enseignant/absences': () => import('../pages/teacher/GestionAbsences'),
  '/app/etudiant': () => import('../pages/student/PortailApprentissage'),
  '/app/etudiant/notes': () => import('../pages/student/ResultatsAcademiques'),
  '/app/etudiant/paiements': () => import('../pages/student/Paiements'),
  '/app/etudiant/planning': () => import('../pages/student/EmploiDuTemps'),
  '/app/parent': () => import('../pages/parent/SuiviEnfant'),
  '/app/parent/suivi': () => import('../pages/parent/SuiviEnfant'),
  '/app/parent/scolarite': () => import('../pages/parent/Scolarite'),
  '/app/parent/academique': () => import('../pages/parent/SuiviAcademique'),
  '/app/parametres': () => import('../pages/shared/ParametresProfil'),
};

export function prefetchRoute(path: string) {
  const loader = routesPrefetchMap[path];
  if (loader) {
    loader().catch(() => {});
  }
}

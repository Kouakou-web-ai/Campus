import React, { Suspense } from 'react';
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

// ─── Public pages ─────────────────────────────────────────────────────────────
const LandingPage      = React.lazy(() => import('../pages/public/LandingPage'));
const PrixPage         = React.lazy(() => import('../pages/public/PrixPage'));
const FAQPage          = React.lazy(() => import('../pages/public/FAQPage'));
const ContactPage      = React.lazy(() => import('../pages/public/ContactPage'));
const ConditionsPage   = React.lazy(() => import('../pages/public/ConditionsPage'));
const MentionsPage     = React.lazy(() => import('../pages/public/MentionsPage'));
const ConfidentialitePage = React.lazy(() => import('../pages/public/ConfidentialitePage'));
const ConnexionPage    = React.lazy(() => import('../pages/public/ConnexionPage'));
const InscriptionPage  = React.lazy(() => import('../pages/public/InscriptionPage'));
const ActivationComptePage = React.lazy(() => import('../pages/public/ActivationComptePage'));
const NotFoundPage     = React.lazy(() => import('../pages/NotFoundPage'));

// ─── Super Admin ──────────────────────────────────────────────────────────────
const SuperAdminDashboard      = React.lazy(() => import('../pages/super-admin/TableauDeBord'));
const AnalytiquesRevenu        = React.lazy(() => import('../pages/super-admin/AnalytiquesRevenu'));
const SurveillanceUniversites  = React.lazy(() => import('../pages/super-admin/SurveillanceUniversites'));
const DemandesAdministrateurs  = React.lazy(() => import('../pages/super-admin/DemandesAdministrateurs'));

// ─── University Admin ─────────────────────────────────────────────────────────
const UniversityAdminDashboard = React.lazy(() => import('../pages/university-admin/TableauDeBord'));
const GestionEtudiants    = React.lazy(() => import('../pages/university-admin/GestionEtudiants'));
const DemandesInscription = React.lazy(() => import('../pages/university-admin/DemandesInscription'));
const GestionEnseignants  = React.lazy(() => import('../pages/university-admin/GestionEnseignants'));
const GestionCours        = React.lazy(() => import('../pages/university-admin/GestionCours'));
const CentreFinancier     = React.lazy(() => import('../pages/university-admin/CentreFinancier'));
const Gestionnaires       = React.lazy(() => import('../pages/university-admin/Gestionnaires'));
const Classes             = React.lazy(() => import('../pages/university-admin/Classes'));
const Bulletins           = React.lazy(() => import('../pages/university-admin/Bulletins'));

// ─── Teacher ──────────────────────────────────────────────────────────────────
const TeacherDashboard       = React.lazy(() => import('../pages/teacher/Dashboard').then(m => ({ default: m.TeacherDashboard })));
const GestionNotes           = React.lazy(() => import('../pages/teacher/GestionNotes'));
const PublicationDevoirs     = React.lazy(() => import('../pages/teacher/PublicationDevoirs'));
const GestionAbsences        = React.lazy(() => import('../pages/teacher/GestionAbsences'));
const EmailsSimules          = React.lazy(() => import('../pages/shared/EmailsSimules'));
const ParametresProfil       = React.lazy(() => import('../pages/shared/ParametresProfil'));
const Visioconference        = React.lazy(() => import('../pages/shared/Visioconference'));
const EvaluationSuggestions  = React.lazy(() => import('../pages/shared/EvaluationSuggestions'));

// ─── Student ──────────────────────────────────────────────────────────────────
const PortailApprentissage   = React.lazy(() => import('../pages/student/PortailApprentissage'));
const ResultatsAcademiques   = React.lazy(() => import('../pages/student/ResultatsAcademiques'));
const Paiements              = React.lazy(() => import('../pages/student/Paiements'));
const EmploiDuTemps          = React.lazy(() => import('../pages/student/EmploiDuTemps'));

// ─── Parent ───────────────────────────────────────────────────────────────────
const SuiviEnfant     = React.lazy(() => import('../pages/parent/SuiviEnfant'));
const SuiviAcademique = React.lazy(() => import('../pages/parent/SuiviAcademique'));
const Scolarite       = React.lazy(() => import('../pages/parent/Scolarite'));

// ─── Account status ───────────────────────────────────────────────────────────
const AccountPendingPage   = React.lazy(() => import('../pages/account/AccountPendingPage'));
const AccountRejectedPage  = React.lazy(() => import('../pages/account/AccountRejectedPage'));
const AccountSuspendedPage = React.lazy(() => import('../pages/account/AccountSuspendedPage'));

// Loading fallback
const Loader = () => <LoadingState message="Chargement de la page…" />;

function AnimatedRoutes() {
  const location = useLocation();
  
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
              <Route path="admin/gestionnaires" element={<Gestionnaires />} />
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
              <Route path="admin/finance"     element={<CentreFinancier />} />
            </Route>

            {/* Teacher */}
            <Route element={<RoleGuard allowedRoles={['TEACHER']} />}>
              <Route path="enseignant"           element={<TeacherDashboard />} />
              <Route path="enseignant/notes"     element={<GestionNotes />} />
              <Route path="enseignant/devoirs"   element={<PublicationDevoirs />} />
              <Route path="enseignant/absences"  element={<GestionAbsences />} />
            </Route>

            {/* Student */}
            <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
              <Route path="etudiant"          element={<PortailApprentissage />} />
              <Route path="etudiant/cours"    element={<PortailApprentissage />} />
              <Route path="etudiant/notes"    element={<ResultatsAcademiques />} />
              <Route path="etudiant/paiements" element={<Paiements />} />
              <Route path="etudiant/planning" element={<EmploiDuTemps />} />
            </Route>

            {/* Parent */}
            <Route element={<RoleGuard allowedRoles={['PARENT']} />}>
              <Route path="parent"            element={<SuiviEnfant />} />
              <Route path="parent/suivi"      element={<SuiviEnfant />} />
              <Route path="parent/scolarite"  element={<Scolarite />} />
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

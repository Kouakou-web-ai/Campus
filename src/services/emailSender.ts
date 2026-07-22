import { ref, push } from 'firebase/database';
import { db } from '../../firebase-config';
import {
  templateNewUniversityRegistration,
  templateUniversityStatusUpdate,
  templateSpamConfirmationNotice,
  templateUserAccountCreated,
  templateSubscriptionReminder,
} from './emailTemplates';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  createdAt: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

const SUPER_ADMIN_EMAIL = "superadmin@campus-app.com"; // Email par défaut pour les alertes Super Admin

/**
 * Met en file d'attente un e-mail dans Firebase Realtime Database
 * pour qu'il soit envoyé réellement par le service Node.js local (Nodemailer).
 */
export async function sendRealEmail(to: string, subject: string, html: string) {
  if (!to || !to.trim()) {
    console.warn("[EmailSender] Tentative d'envoi d'email annulée: destinataire vide.");
    return;
  }
  try {
    const mailsRef = ref(db, 'mails_a_envoyer');
    const payload: EmailPayload = {
      to: to.trim(),
      subject: subject.trim(),
      html,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    await push(mailsRef, payload);
    console.log(`[EmailSender] Email mis en file d'attente pour ${to} : "${subject}"`);
  } catch (error) {
    console.error("[EmailSender] Erreur lors de la mise en file d'attente de l'email:", error);
  }
}

/**
 * Envoie une alerte au Super Admin lorsqu'une université s'inscrit
 */
export async function notifySuperAdminNewUniversity(uniData: { name: string; email: string; phone?: string; adminName: string }) {
  const html = templateNewUniversityRegistration(uniData);
  await sendRealEmail(SUPER_ADMIN_EMAIL, `[CAMPUS] Nouvelle inscription d'université : ${uniData.name}`, html);
}

/**
 * Envoie une notification à l'université lorsque son statut change (validée, suspendue, supprimée)
 */
export async function notifyUniversityStatusUpdate(uniEmail: string, uniName: string, status: 'validated' | 'suspended' | 'rejected' | 'deleted', reason?: string) {
  const html = templateUniversityStatusUpdate(uniName, status, reason);
  const subjects: Record<string, string> = {
    validated: `[CAMPUS] Félicitations ! Votre université "${uniName}" a été validée`,
    suspended: `[CAMPUS] Attention : Votre compte université "${uniName}" est suspendu`,
    rejected: `[CAMPUS] Statut de votre compte université "${uniName}"`,
    deleted: `[CAMPUS] Fermeture du compte université "${uniName}"`,
  };
  await sendRealEmail(uniEmail, subjects[status] || `[CAMPUS] Mise à jour du statut de ${uniName}`, html);
}

/**
 * Notification lors de l'envoi d'email de confirmation (Spam warning)
 */
export async function notifyEmailConfirmationSpamNotice(userEmail: string, verificationLink?: string) {
  const html = templateSpamConfirmationNotice(userEmail, verificationLink);
  await sendRealEmail(userEmail, `[CAMPUS] Confirmation d'email - Vérifiez vos spams`, html);
}

/**
 * Envoie les identifiants d'accès d'un utilisateur (Étudiant, Parent, Enseignant, Gestionnaire)
 */
export async function notifyUserAccountAccess(data: { name: string; email: string; password?: string; role: string; uniName?: string; loginUrl?: string }) {
  const html = templateUserAccountCreated(data);
  const roleNames: Record<string, string> = {
    student: "Étudiant",
    parent: "Parent",
    teacher: "Enseignant",
    manager: "Gestionnaire",
  };
  const roleTitle = roleNames[data.role] || "Utilisateur";
  await sendRealEmail(data.email, `[CAMPUS] Vos accès à la plateforme (${roleTitle})`, html);
}

/**
 * Envoie un rappel d'expiration d'abonnement (J-7, J-5, J-1, Jour J)
 */
export async function notifySubscriptionReminder(uniEmail: string, uniName: string, daysRemaining: number) {
  const html = templateSubscriptionReminder(uniName, daysRemaining);
  const subject = daysRemaining === 0 
    ? `[CAMPUS - URGENT] Votre abonnement expire aujourd'hui !`
    : `[CAMPUS] Rappel : Votre abonnement expire dans ${daysRemaining} jour(s)`;
  await sendRealEmail(uniEmail, subject, html);
}

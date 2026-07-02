import { ref, push } from 'firebase/database';
import { db } from '../../firebase-config';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  createdAt: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

/**
 * Met en file d'attente un e-mail dans Firebase Realtime Database
 * pour qu'il soit envoyé réellement par le service Node.js local (Nodemailer).
 */
export async function sendRealEmail(to: string, subject: string, html: string) {
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

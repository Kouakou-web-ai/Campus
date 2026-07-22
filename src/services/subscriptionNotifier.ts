import { ref, get } from 'firebase/database';
import { db } from '../../firebase-config';
import { notifySubscriptionReminder } from './emailSender';

/**
 * Vérifie toutes les universités inscrites dans la base de données et calcule
 * l'échéance de leur abonnement pour envoyer les rappels par email :
 * - 7 jours avant
 * - 5 jours avant
 * - 1 jour avant (La veille)
 * - 0 jours (Le jour J)
 */
export async function checkAndSendSubscriptionReminders() {
  try {
    const univsRef = ref(db, 'universites');
    const snapshot = await get(univsRef);
    if (!snapshot.exists()) return;

    const universitiesData = snapshot.val();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const [id, uni] of Object.entries<any>(universitiesData)) {
      if (!uni || !uni.adminEmail) continue;

      const expiryDateStr = uni.subscriptionExpiresAt || uni.expiryDate;
      if (!expiryDateStr) continue;

      const expiryDate = new Date(expiryDateStr);
      expiryDate.setHours(0, 0, 0, 0);

      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Envoyer l'email si l'échéance correspond exactement à 7, 5, 1 ou 0 jours
      if ([7, 5, 1, 0].includes(diffDays)) {
        const uniName = uni.branding?.name || uni.name || id;
        console.log(`[SubscriptionNotifier] Notification d'échéance (${diffDays}j) envoyée à ${uni.adminEmail} pour ${uniName}`);
        await notifySubscriptionReminder(uni.adminEmail, uniName, diffDays);
      }
    }
  } catch (error) {
    console.error("[SubscriptionNotifier] Erreur lors de la vérification des abonnements:", error);
  }
}

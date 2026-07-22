export const APP_NAME = "CAMPUS";
export const APP_URL = typeof window !== 'undefined' ? window.location.origin : "https://campus-app.com";

export function getBaseEmailLayout(contentHtml: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
        .body { padding: 30px 25px; line-height: 1.6; font-size: 15px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 15px; margin-bottom: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
        .info-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .warning-box { background-color: #fefce8; border-left: 4px solid #eab308; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .credentials-box { background-color: #f1f5f9; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 8px; font-family: monospace; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${APP_NAME}</h1>
        </div>
        <div class="body">
          ${contentHtml}
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} ${APP_NAME} SaaS Universitaire. Tous droits réservés.
        </div>
      </div>
    </body>
    </html>
  `;
}

// 1. Super Admin notification pour nouvelle université
export function templateNewUniversityRegistration(uniData: { name: string; email: string; phone?: string; adminName: string }) {
  const content = `
    <h2>Nouvelle inscription d'établissement !</h2>
    <p>Une nouvelle université vient de soumettre une demande d'inscription sur la plateforme.</p>
    <div class="info-box">
      <p><strong>Nom de l'établissement :</strong> ${uniData.name}</p>
      <p><strong>Administrateur :</strong> ${uniData.adminName}</p>
      <p><strong>Email :</strong> ${uniData.email}</p>
      <p><strong>Téléphone :</strong> ${uniData.phone || 'Non renseigné'}</p>
    </div>
    <p>Veuillez vous connecter à votre espace Super Admin pour examiner et valider cette demande.</p>
    <a href="${APP_URL}/super-admin/demandes" class="btn">Examiner la demande</a>
  `;
  return getBaseEmailLayout(content, "Nouvelle inscription d'établissement");
}

// 2. Statut Université (Validé, Suspendu, Supprimé/Résilié)
export function templateUniversityStatusUpdate(uniName: string, status: 'validated' | 'suspended' | 'rejected' | 'deleted', reason?: string) {
  let title = "";
  let message = "";
  let badgeClass = "info-box";

  if (status === 'validated') {
    title = "Votre compte établissement a été validé 🎉";
    message = `<p>Félicitations ! Votre demande d'inscription pour <strong>${uniName}</strong> a été validée par notre équipe.</p>
               <p>Vous pouvez dès à présent accéder à votre espace d'administration universitaire et configurer votre plateforme.</p>
               <a href="${APP_URL}/connexion" class="btn">Se connecter à l'espace Admin</a>`;
  } else if (status === 'suspended') {
    title = "Avis de suspension de votre compte";
    badgeClass = "warning-box";
    message = `<p>Votre compte établissement <strong>${uniName}</strong> a été temporairement suspendu.</p>
               ${reason ? `<p><strong>Raison :</strong> ${reason}</p>` : ''}
               <p>Veuillez contacter le support ou la direction si vous pensez qu'il s'agit d'une erreur.</p>`;
  } else {
    title = "Information concernant votre compte établissement";
    message = `<p>Votre compte établissement <strong>${uniName}</strong> a été désactivé ou supprimé de la plateforme.</p>
               ${reason ? `<p><strong>Motif :</strong> ${reason}</p>` : ''}`;
  }

  const content = `
    <h2>${title}</h2>
    <div class="${badgeClass}">
      ${message}
    </div>
  `;
  return getBaseEmailLayout(content, title);
}

// 3. Email explicatif Spam/Confirmation
export function templateSpamConfirmationNotice(userEmail: string, verificationLink?: string) {
  const content = `
    <h2>Vérification de votre adresse e-mail</h2>
    <p>Bonjour,</p>
    <p>Un e-mail de confirmation vient d'être envoyé à l'adresse <strong>${userEmail}</strong>.</p>
    <div class="warning-box">
      <p>⚠️ <strong>Important :</strong> Si vous ne trouvez pas le mail dans votre boîte de réception principale, <strong>veuillez vérifier votre dossier SPAM / Courriers indésirables</strong>.</p>
    </div>
    <p>Pensez à ajouter notre adresse à vos contacts pour recevoir vos notifications de cours et d'examens sans interruption.</p>
    ${verificationLink ? `<a href="${verificationLink}" class="btn">Confirmer mon e-mail</a>` : ''}
  `;
  return getBaseEmailLayout(content, "Vérification d'email - Pensez aux Spams");
}

// 4. Création compte Utilisateur (Étudiant, Parent, Enseignant, Gestionnaire)
export function templateUserAccountCreated(data: { name: string; email: string; password?: string; role: string; uniName?: string; loginUrl?: string }) {
  const roleLabels: Record<string, string> = {
    student: "Étudiant",
    parent: "Parent / Tuteur",
    teacher: "Enseignant",
    manager: "Gestionnaire d'établissement"
  };
  const roleName = roleLabels[data.role] || data.role;

  const content = `
    <h2>Bienvenue sur ${APP_NAME} !</h2>
    <p>Bonjour <strong>${data.name}</strong>,</p>
    <p>Votre compte <strong>${roleName}</strong> a été créé ${data.uniName ? `par l'établissement <strong>${data.uniName}</strong>` : ''}.</p>
    <p>Voici vos accès pour vous connecter à la plateforme :</p>
    <div class="credentials-box">
      <p><strong>Identifiant / Email :</strong> ${data.email}</p>
      ${data.password ? `<p><strong>Mot de passe temporaire :</strong> ${data.password}</p>` : ''}
    </div>
    <p>Pour des raisons de sécurité, nous vous recommandons de modifier votre mot de passe dès votre première connexion.</p>
    <a href="${data.loginUrl || `${APP_URL}/connexion`}" class="btn">Accéder à mon espace</a>
  `;
  return getBaseEmailLayout(content, `Vos accès ${roleName} - ${APP_NAME}`);
}

// 5. Rappels d'abonnement (J-7, J-5, J-1, Jour J)
export function templateSubscriptionReminder(uniName: string, daysRemaining: number) {
  let text = "";
  if (daysRemaining === 7) text = "expire dans <strong>7 jours</strong>";
  else if (daysRemaining === 5) text = "expire dans <strong>5 jours</strong>";
  else if (daysRemaining === 1) text = "expire <strong>demain</strong>";
  else if (daysRemaining === 0) text = "expire <strong>aujourd'hui</strong>";
  else text = `expire dans <strong>${daysRemaining} jours</strong>`;

  const content = `
    <h2>Rappel du renouvellement de votre abonnement</h2>
    <p>Bonjour Admin de <strong>${uniName}</strong>,</p>
    <p>Votre abonnement à la plateforme CAMPUS ${text}.</p>
    <div class="warning-box">
      <p>Pour éviter toute interruption de service pour vos enseignants et étudiants, veuillez renouveler votre formule dès maintenant.</p>
    </div>
    <p>Découvrez nos formules adaptées et réabonnez-vous directement via notre page de tarifs :</p>
    <a href="${APP_URL}/tarifs" class="btn">Renouveler mon abonnement</a>
  `;
  return getBaseEmailLayout(content, `Rappel Abonnement ${APP_NAME} - ${daysRemaining === 0 ? 'Jour J' : `${daysRemaining} jours restants`}`);
}

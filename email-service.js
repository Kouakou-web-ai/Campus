import fs from 'fs';
import path from 'path';
import readline from 'readline';
import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// 1. Charger le fichier .env
const envPath = path.resolve('.env');
if (!fs.existsSync(envPath)) {
  console.error("Erreur: Le fichier .env est introuvable à la racine.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (parts) {
    let value = parts[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[parts[1]] = value.trim();
  }
});

const firebaseConfig = {
  apiKey: env.VITE_apikey,
  authDomain: env.VITE_authDomain,
  databaseURL: env.VITE_databaseURL,
  projectId: env.VITE_projectId,
  storageBucket: env.VITE_storageBucket,
  messagingSenderId: env.VITE_messagingSenderId,
  appId: env.VITE_appId
};

// Config Nodemailer de l'utilisateur
const EMAIL_USER = 'Truixk@gmail.com';
const EMAIL_PASS = 'vvnu khqa yjam fvzn'; // App Password Gmail

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

async function start() {
  console.log("=== Service d'Envoi d'Emails CAMPUS (Nodemailer) ===\n");
  console.log("Connexion à Firebase...");

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const auth = getAuth(app);

  let authenticated = false;

  // Tenter de s'authentifier avec les accès du Super Admin si demandés par les règles de la DB
  try {
    console.log("Vérification des droits d'accès à la base de données...");
    // Essayer de lire de manière anonyme pour tester les permissions
    // Si la DB a des règles strictes (.read = auth != null), cela va lever une erreur
    const testRef = ref(db, 'mails_a_envoyer');
    // On va lancer l'écoute en temps réel
    listenToEmails(db);
    authenticated = true;
  } catch (err) {
    console.log("Authentification requise pour lire la base de données.");
  }

  if (!authenticated) {
    const password = await askQuestion("Entrez le mot de passe du Super Admin (Truixk@gmail.com) pour Firebase : ");
    if (!password) {
      console.error("Mot de passe requis pour démarrer le service.");
      process.exit(1);
    }

    try {
      console.log("Connexion Firebase Auth...");
      await signInWithEmailAndPassword(auth, EMAIL_USER, password);
      console.log("Authentifié avec succès !");
      listenToEmails(db);
    } catch (authErr) {
      console.error("Échec de l'authentification Firebase :", authErr.message);
      process.exit(1);
    }
  }
}

function listenToEmails(db) {
  console.log("\nService à l'écoute des nouveaux e-mails sur /mails_a_envoyer...");
  const mailsRef = ref(db, 'mails_a_envoyer');

  onValue(mailsRef, (snapshot) => {
    if (!snapshot.exists()) return;

    const data = snapshot.val();
    Object.entries(data).forEach(async ([mailId, mailData]) => {
      if (mailData.status === 'pending') {
        await processEmail(db, mailId, mailData);
      }
    });
  }, (error) => {
    // Si une erreur de permission survient en cours d'écoute
    if (error.code === 'PERMISSION_DENIED') {
      console.error("\n[Erreur] Permission refusée. Le service doit s'authentifier.");
      restartWithAuth(db);
    } else {
      console.error("[Erreur de base de données] :", error);
    }
  });
}

async function restartWithAuth(db) {
  // Relancer le flux d'invite de mot de passe
  console.log("Tentative de reconnexion avec authentification...");
  const auth = getAuth();
  const password = await askQuestion("Entrez le mot de passe du Super Admin (Truixk@gmail.com) pour Firebase : ");
  if (!password) {
    console.error("Mot de passe requis pour continuer.");
    process.exit(1);
  }
  try {
    await signInWithEmailAndPassword(auth, EMAIL_USER, password);
    console.log("Authentifié ! Reprise de l'écoute...");
    listenToEmails(db);
  } catch (err) {
    console.error("Mot de passe incorrect.");
    process.exit(1);
  }
}

async function processEmail(db, mailId, mailData) {
  console.log(`\n[Nouveau Mail] Traitement de l'email pour: ${mailData.to} - Sujet: "${mailData.subject}"`);

  // Mettre immédiatement l'e-mail à l'état d'envoi en cours pour éviter les envois doublons
  await update(ref(db, `mails_a_envoyer/${mailId}`), {
    status: 'sending'
  });

  const mailOptions = {
    from: `"CAMPUS" <${EMAIL_USER}>`,
    to: mailData.to,
    subject: mailData.subject,
    html: mailData.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Succès] Email envoyé avec succès ! ID: ${info.messageId}`);
    
    // Mettre à jour dans Firebase
    await update(ref(db, `mails_a_envoyer/${mailId}`), {
      status: 'sent',
      sentAt: new Date().toISOString(),
      messageId: info.messageId
    });
  } catch (error) {
    console.error(`[Échec] Erreur d'envoi à ${mailData.to}:`, error.message);
    
    // Mettre à jour l'erreur dans Firebase
    await update(ref(db, `mails_a_envoyer/${mailId}`), {
      status: 'failed',
      error: error.message,
      failedAt: new Date().toISOString()
    });
  }
}

start().catch(err => {
  console.error("Erreur critique du service d'emails :", err);
});

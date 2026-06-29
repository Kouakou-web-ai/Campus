import fs from 'fs';
import path from 'path';
import readline from 'readline';

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

async function main() {
  console.log("=== Création / Restauration du Super Administrateur CAMPUS ===\n");
  
  // 1. Lire le fichier .env
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    console.error("Erreur: Le fichier .env est introuvable.");
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const parts = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (parts) {
      let value = parts[2] || '';
      // Retirer les guillemets si présents
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      env[parts[1]] = value.trim();
    }
  });

  const apiKey = env.VITE_apikey;
  const databaseURL = env.VITE_databaseURL;

  if (!apiKey || !databaseURL) {
    console.error("Erreur: VITE_apikey ou VITE_databaseURL absent du fichier .env");
    process.exit(1);
  }

  // 2. Demander les informations de connexion ou lire les arguments
  let email, password, prenom, nom;
  if (process.argv.length >= 4) {
    email = process.argv[2].trim();
    password = process.argv[3].trim();
    prenom = process.argv[4] ? process.argv[4].trim() : "Super";
    nom = process.argv[5] ? process.argv[5].trim() : "Admin";
  } else {
    email = (await askQuestion("Entrez l'adresse email du Super Admin : ")).trim();
    if (!email) {
      console.error("L'adresse email est requise.");
      process.exit(1);
    }

    password = (await askQuestion("Entrez le mot de passe (min. 6 caractères) : ")).trim();
    if (!password || password.length < 6) {
      console.error("Le mot de passe doit contenir au moins 6 caractères.");
      process.exit(1);
    }

    prenom = (await askQuestion("Prénom (par défaut 'Super') : ")).trim() || "Super";
    nom = (await askQuestion("Nom (par défaut 'Admin') : ")).trim() || "Admin";
  }

  console.log("\nTentative de création du compte dans Firebase Auth...");

  // 3. Créer l'utilisateur dans Firebase Auth via l'API REST
  const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true
    })
  });

  let authData = await authResponse.json();

  if (!authResponse.ok) {
    if (authData.error && authData.error.message === 'EMAIL_EXISTS') {
      console.log("Le compte d'authentification existe déjà dans Firebase Auth.");
      console.log("Tentative de connexion avec le mot de passe fourni pour récupérer le UID existant...");
      
      const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
      const signInResponse = await fetch(signInUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      });
      
      const signInData = await signInResponse.json();
      if (!signInResponse.ok) {
        console.error("Erreur de connexion :", signInData.error ? signInData.error.message : "Erreur inconnue");
        console.error("\nSi le compte existe dans Firebase Auth mais a un mot de passe différent, veuillez utiliser ce mot de passe ou le réinitialiser/le supprimer d'abord dans la console Firebase.");
        process.exit(1);
      }
      authData = signInData;
    } else {
      console.error("Erreur lors de la création de l'utilisateur :", authData.error ? authData.error.message : "Erreur inconnue");
      process.exit(1);
    }
  }

  const uid = authData.localId;
  const idToken = authData.idToken;

  console.log(`Utilisateur Firebase Auth OK. UID : ${uid}`);
  console.log("Écriture des informations de rôle dans la base de données Realtime...");

  // 4. Écrire dans la base de données Realtime
  const dbUrl = `${databaseURL}/utilisateurs/${uid}.json?auth=${idToken}`;
  const dbPayload = {
    prenom,
    nom,
    email: email.toLowerCase(),
    role: "SUPER_ADMIN",
    status: "active",
    uid,
    universityId: null,
    createdDate: new Date().toISOString()
  };

  const dbResponse = await fetch(dbUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dbPayload)
  });

  if (!dbResponse.ok) {
    const dbErr = await dbResponse.text();
    console.error("Erreur lors de l'écriture dans la base de données :", dbErr);
    process.exit(1);
  }

  console.log("\n=======================================================");
  console.log("  SUCCÈS : Le compte Super Administrateur a été configuré !");
  console.log(`  Email : ${email}`);
  console.log(`  Rôle  : SUPER_ADMIN`);
  console.log(`  Statut: active`);
  console.log("=======================================================");
  console.log("\nVous pouvez maintenant vous connecter sur l'application.");
}

main().catch(err => {
  console.error("Une erreur inattendue est survenue :", err);
});

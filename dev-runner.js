import { spawn } from 'child_process';

console.log("Démarrage simultané de Vite et du service d'emails...");

const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });
const email = spawn('node', ['email-service.js'], { stdio: 'inherit', shell: true });

const cleanup = () => {
  console.log("\nArrêt des services...");
  vite.kill();
  email.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

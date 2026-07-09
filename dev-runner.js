import { spawn } from 'child_process';

console.log("Démarrage simultané de Next.js et du service d'emails...");

const nextDev = spawn('npx', ['next', 'dev'], { stdio: 'inherit', shell: true });
const email = spawn('node', ['email-service.js'], { stdio: 'inherit', shell: true });

const cleanup = () => {
  console.log("\nArrêt des services...");
  nextDev.kill();
  email.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

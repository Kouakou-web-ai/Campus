import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// En-mémoire simple pour le rate limiting au niveau de l'Edge (persiste durant la vie de l'instance Edge / Serverless)
const ipRequestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requêtes par minute maximum par IP

// Le nettoyage a été déplacé en inline dans le middleware car setInterval est interdit dans l'Edge runtime.

// Liste des User-Agents de scrapers/outils d'attaque à bloquer.
// IMPORTANT : on ne bloque QUE des outils clairement malveillants ou de scraping commercial.
// On NE bloque PLUS headless/puppeteer/playwright/curl/python/axios/postman car :
//  - Vercel utilise un navigateur headless pour générer les captures d'écran de déploiement
//  - Playwright/Puppeteer sont utilisés pour vos propres tests E2E et le monitoring (Speed Insights, etc.)
//  - curl/postman/axios servent aussi à des appels serveur-à-serveur légitimes (ex: vos webhooks n8n)
const BLOCKED_USER_AGENTS_PATTERNS = [
  /sqlmap/i,
  /nmap/i,
  /nikto/i,
  /dirbuster/i,
  /masscan/i,
  /zgrab/i,
  /nuclei/i,
  // Scrapers SEO commerciaux agressifs (pas les moteurs de recherche légitimes)
  /mj12bot/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /dotbot/i,
  /rogerbot/i,
  /exabot/i,
];

// User-Agents toujours autorisés même s'ils matchent un pattern ci-dessus (whitelist explicite)
const ALLOWED_USER_AGENTS = [
  /googlebot/i,
  /bingbot/i,
  /vercel/i, // outils internes Vercel (screenshot, edge functions, monitoring)
];

// Chemins d'attaque ou de scan de vulnérabilités courants à bloquer directement
// (resserré pour éviter les faux positifs : "admin" et "sql" seuls étaient trop larges
// et pouvaient bloquer des routes légitimes comme /admin-dashboard ou /sql-report)
const SUSPICIOUS_PATHS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/wp-admin/i,
  /^\/wp-login/i,
  /^\/xmlrpc\.php/i,
  /^\/phpinfo/i,
  /^\/\.aws/i,
  /^\/\.ssh/i,
];

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || (request as any).ip || 'unknown-ip';
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // 1. Détection et blocage des chemins d'attaques suspectes
  for (const pathPattern of SUSPICIOUS_PATHS) {
    if (pathPattern.test(pathname)) {
      console.warn(`[SECURITE] Requête suspecte bloquée: ${pathname} depuis l'IP ${ip}`);
      return new NextResponse(
        JSON.stringify({ error: 'Accès interdit - Activité suspecte détectée' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. Détection et blocage de scrapers via le User-Agent (liste resserrée, whitelist appliquée en premier)
  const isAllowedAgent = ALLOWED_USER_AGENTS.some((pattern) => pattern.test(userAgent));
  if (!isAllowedAgent) {
    const isBlockedAgent = BLOCKED_USER_AGENTS_PATTERNS.some((pattern) => pattern.test(userAgent));
    if (isBlockedAgent) {
      console.warn(`[SECURITE] Scraping détecté et bloqué. User-Agent: "${userAgent}" | IP: ${ip}`);
      return new NextResponse(
        JSON.stringify({ error: 'Scraping interdit sur cette plateforme.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 3. Détection des en-têtes détournées / usurpées ou d'attaques Edge Loops
  const vercelSignature = request.headers.get('x-vercel-signature');
  if (vercelSignature && vercelSignature.length > 500) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 4. Rate Limiting local (uniquement si l'IP est connue)
  if (ip !== 'unknown-ip') {
    const now = Date.now();
    
    // Nettoyage inline périodique pour éviter fuite mémoire sans setInterval (interdit dans l'Edge runtime)
    if (ipRequestCounts.size > 200) {
      for (const [key, data] of ipRequestCounts.entries()) {
        if (now - data.lastReset > RATE_LIMIT_WINDOW_MS) {
          ipRequestCounts.delete(key);
        }
      }
    }

    const rateData = ipRequestCounts.get(ip);

    if (!rateData) {
      ipRequestCounts.set(ip, { count: 1, lastReset: now });
    } else {
      if (now - rateData.lastReset > RATE_LIMIT_WINDOW_MS) {
        rateData.count = 1;
        rateData.lastReset = now;
      } else {
        rateData.count += 1;
        if (rateData.count > MAX_REQUESTS_PER_WINDOW) {
          console.warn(`[SECURITE] Rate limit dépassé pour l'IP ${ip} (${rateData.count} requêtes/min)`);
          return new NextResponse(
            JSON.stringify({ error: 'Trop de requêtes. Veuillez ralentir.' }),
            { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
          );
        }
      }
    }
  }

  // 5. Injection des En-têtes HTTP de Sécurité
  const response = NextResponse.next();
  const headers = response.headers;

  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.googleusercontent.com https://*.firebaseusercontent.com https://images.unsplash.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.googleapis.com wss://*.firebaseio.com https://*.firebaseio.com wss://*.firebasedatabase.app https://*.firebasedatabase.app https://*.firebase.google.com https://formsubmit.co https://vitals.vercel-insights.com;
    frame-src 'self' https://*.firebaseapp.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  headers.set('Content-Security-Policy', cspHeader);

  return response;
}

// Configurer le middleware pour s'exécuter sur toutes les routes sauf ressources statiques
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|manifest.json|sw.js).*)',
  ],
};
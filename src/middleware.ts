import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// En-mémoire simple pour le rate limiting au niveau de l'Edge (persiste durant la vie de l'instance Edge / Serverless)
const ipRequestCounts = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120; // 120 requêtes par minute maximum par IP

// Nettoyage régulier pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCounts.entries()) {
    if (now - data.lastReset > RATE_LIMIT_WINDOW_MS) {
      ipRequestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000); // toutes les 5 minutes

// Liste des User-Agents de bots et scrapers bloqués
const BLOCKED_USER_AGENTS_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scrap/i,
  /headless/i,
  /curl/i,
  /wget/i,
  /python/i,
  /axios/i,
  /go-http-client/i,
  /selenium/i,
  /playwright/i,
  /puppeteer/i,
  /apache-httpclient/i,
  /postman/i,
  /nmap/i,
  /sqlmap/i,
  /dirbuster/i,
  /nikto/i,
  /mj12bot/i,
  /ahrefs/i,
  /semrush/i,
  /dotbot/i,
  /rogerbot/i,
  /exabot/i,
  /loader\.io/i,
];

// Chemins d'attaque ou de scan de vulnérabilités courants à bloquer directement
const SUSPICIOUS_PATHS = [
  /\/\.env/i,
  /\/\.git/i,
  /wp-admin/i,
  /wp-login/i,
  /xmlrpc\.php/i,
  /config\.php/i,
  /phpinfo/i,
  /sql/i,
  /admin/i,
  /setup/i,
  /backup/i,
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

  // 2. Détection et blocage de scrapers via le User-Agent
  // On ignore certains bots légitimes nécessaires (comme Googlebot, Bingbot s'ils sont nécessaires, mais ici on bloque strictement si demandé)
  const isBlockedAgent = BLOCKED_USER_AGENTS_PATTERNS.some((pattern) => pattern.test(userAgent));
  if (isBlockedAgent && !userAgent.includes('Googlebot') && !userAgent.includes('Bingbot')) {
    console.warn(`[SECURITE] Scraping détecté et bloqué. User-Agent: "${userAgent}" | IP: ${ip}`);
    return new NextResponse(
      JSON.stringify({ error: 'Scraping interdit sur cette plateforme.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Détection des en-têtes Vercel détournées / usurpées ou d'attaques Edge Loops
  // S'assurer qu'aucun client externe ne simule des en-têtes système sensibles comme x-vercel-id internes invalides
  const vercelSignature = request.headers.get('x-vercel-signature');
  if (vercelSignature && vercelSignature.length > 500) {
    // Risque de buffer overflow / attaque d'en-tête
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 4. Rate Limiting local
  if (ip !== 'unknown-ip') {
    const now = Date.now();
    const rateData = ipRequestCounts.get(ip);

    if (!rateData) {
      ipRequestCounts.set(ip, { count: 1, lastReset: now });
    } else {
      if (now - rateData.lastReset > RATE_LIMIT_WINDOW_MS) {
        // Nouvelle fenêtre
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

  // Clickjacking protection
  headers.set('X-Frame-Options', 'DENY');
  
  // MIME sniffing protection
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // XSS protection
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HSTS)
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy (CSP)
  // Autorise Firebase, Google Auth, et les connexions d'APIs nécessaires
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.googleusercontent.com https://*.firebaseusercontent.com https://images.unsplash.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.googleapis.com wss://*.firebaseio.com https://*.firebaseio.com https://*.firebase.google.com;
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
    /*
     * Match all request paths except for the ones starting with:
     * - api (si vous voulez exclure ou gérer différemment)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (local images folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|manifest.json|sw.js).*)',
  ],
};

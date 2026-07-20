import type { Metadata } from 'next';
import ClientApp from './ClientApp';

type Props = {
  params: Promise<{ slug?: string[] }>;
};

// Métadonnées uniques et descriptives pour les pages publiques en français
const METADATA_MAP: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'CAMPUS - Plateforme de Gestion Universitaire Tout-en-Un',
    description: 'Centralisez la scolarité, gérez les inscriptions, pilotez le budget et suivez les notes de votre établissement en un clin d\'œil.',
  },
  '/tarifs': {
    title: 'Offres & Tarifs - CAMPUS',
    description: 'Découvrez nos formules d\'abonnement adaptées à la taille de votre université ou établissement d\'enseignement supérieur.',
  },
  '/faq': {
    title: 'Foire Aux Questions - CAMPUS',
    description: 'Trouvez des réponses claires sur la mise en place de la plateforme, la sécurité des données et les fonctionnalités de CAMPUS.',
  },
  '/contact': {
    title: 'Contactez-nous - CAMPUS',
    description: 'Demandez une démonstration personnalisée ou posez vos questions à l\'équipe CAMPUS. Nous vous répondons sous 24h.',
  },
  '/conditions': {
    title: 'Conditions Générales d\'Utilisation - CAMPUS',
    description: 'Consultez les conditions générales régissant l\'utilisation de la plateforme de gestion universitaire CAMPUS.',
  },
  '/mentions-legales': {
    title: 'Mentions Légales - CAMPUS',
    description: 'Informations juridiques sur l\'éditeur, l\'hébergeur et la propriété intellectuelle de moncampus.online.',
  },
  '/confidentialite': {
    title: 'Politique de Confidentialité - CAMPUS',
    description: 'Consultez notre politique de protection des données personnelles pour les universités, enseignants et étudiants.',
  },
  '/signup': {
    title: 'Créer un Compte - CAMPUS',
    description: 'Inscrivez votre établissement et commencez à moderniser votre gestion universitaire dès aujourd\'hui.',
  },
  '/connexion': {
    title: 'Connexion - Espace Universitaire CAMPUS',
    description: 'Accédez à votre espace sécurisé en tant qu\'administrateur, enseignant, étudiant ou parent d\'élève.',
  },
  '/activation-compte': {
    title: 'Activation de Compte - CAMPUS',
    description: 'Activez votre compte utilisateur pour accéder à votre espace universitaire sur CAMPUS.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || [];
  const path = `/${slug.join('/')}`;

  // Protection contre le crawl des pages privées/dashboard/status
  const isPrivateRoute = 
    path.startsWith('/app') || 
    path.startsWith('/dashboard') || 
    path.startsWith('/admin') ||
    path.startsWith('/super-admin') ||
    path.startsWith('/enseignant') ||
    path.startsWith('/etudiant') ||
    path.startsWith('/parent') ||
    path.startsWith('/account-pending') ||
    path.startsWith('/account-rejected') ||
    path.startsWith('/account-suspended');

  if (isPrivateRoute) {
    return {
      title: {
        absolute: 'Espace Sécurisé - CAMPUS',
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const meta = METADATA_MAP[path] || METADATA_MAP['/'];
  const fullUrl = `https://www.moncampus.online${path === '/' ? '' : path}`;

  return {
    title: {
      absolute: meta.title,
    },
    description: meta.description,
    metadataBase: new URL('https://www.moncampus.online'),
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: fullUrl,
      type: 'website',
      locale: 'fr_FR',
      siteName: 'CAMPUS',
      images: [
        {
          url: 'https://www.moncampus.online/images/logo-original.png',
          width: 1200,
          height: 630,
          alt: 'CAMPUS - Plateforme de Gestion Universitaire',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: ['https://www.moncampus.online/images/logo-original.png'],
    },
  };
}

export default function CatchAllPage() {
  return <ClientApp />;
}

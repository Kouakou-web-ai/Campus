import { Outlet, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../components/shared/ThemeToggle';

const NAV_LINKS = [
  { label: 'Accueil', path: '/' },
  { label: 'Tarifs', path: '/tarifs' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-surface transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-content">CAMPUS</span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'bg-surface-raised text-content'
                      : 'text-content-secondary hover:text-content hover:bg-app'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle variant="dropdown" />
              <Link
                to="/connexion"
                className="text-sm font-medium text-content-secondary hover:text-content transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/connexion"
                className="btn-gradient text-sm px-4 py-2 rounded-full font-semibold"
              >
                Démarrer gratuitement
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-1">
              <ThemeToggle />
            <button
              className="p-2 rounded-lg text-content-muted hover:bg-surface-raised transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border-subtle bg-surface px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-medium text-content-secondary hover:bg-app hover:text-content transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Link
                to="/connexion"
                className="block text-center text-sm font-medium text-content-secondary border border-border rounded-xl px-4 py-2.5 hover:bg-app transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/connexion"
                className="block text-center btn-gradient text-sm px-4 py-2.5 rounded-xl font-semibold"
              >
                Démarrer gratuitement
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <GraduationCap size={18} className="text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-white">CAMPUS</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                La plateforme SaaS qui modernise la gestion universitaire.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Produit</h5>
              <ul className="space-y-2.5 text-sm">
                {['Fonctionnalités', 'Tarifs', 'Changelog', 'Roadmap'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Ressources</h5>
              <ul className="space-y-2.5 text-sm">
                {['Documentation', 'API', 'Guides', 'Support'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Légal</h5>
              <ul className="space-y-2.5 text-sm">
                {['Confidentialité', 'CGU', 'Cookies', 'RGPD'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">© 2024 CAMPUS SaaS. Tous droits réservés.</p>
            <p className="text-sm text-slate-600">Conçu pour l'excellence universitaire 🎓</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

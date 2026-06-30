import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, Search, Mic } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../components/shared/ThemeToggle';
import { useSpeechToText } from '../hooks/useSpeechToText';

const PUBLIC_SECTIONS = [
  { label: 'Accueil', path: '/', synonyms: ['accueil', 'home', 'principal', 'début'] },
  { label: 'Tarifs', path: '/tarifs', synonyms: ['tarifs', 'prix', 'tarification', 'pricing'] },
  { label: 'FAQ', path: '/faq', synonyms: ['faq', 'questions', 'aide', 'foire aux questions'] },
  { label: 'Contact', path: '/contact', synonyms: ['contact', 'support', 'message', 'contacter'] },
  { label: 'Connexion', path: '/connexion', synonyms: ['connexion', 'login', 'se connecter'] },
  { label: 'Inscription', path: '/signup', synonyms: ['inscription', 'creer compte', 'signup', 's\'inscrire'] },
];

const NAV_LINKS = [
  { label: 'Accueil', path: '/' },
  { label: 'Tarifs', path: '/tarifs' },
  { label: 'FAQ', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleVoiceMatch = (text: string) => {
    const cleanText = text.toLowerCase().trim();
    const match = PUBLIC_SECTIONS.find(
      (sec) =>
        sec.label.toLowerCase() === cleanText ||
        sec.synonyms.some((syn) => cleanText.includes(syn))
    );
    if (match) {
      navigate(match.path);
      setSearchOpen(false);
      setSearchVal('');
    } else {
      setSearchVal(text);
      setSearchOpen(true);
    }
  };

  const { isListening, isSupported, startListening, stopListening } = useSpeechToText({
    onResult: (text) => {
      handleVoiceMatch(text);
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src="/images/logo-original.png" alt="Campus Logo" className="w-9 h-9 rounded-xl shadow-md transition-transform group-hover:scale-105 object-cover" />
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

            {/* Desktop search */}
            <div className="hidden md:flex items-center relative ml-2">
              {searchOpen ? (
                <div className="flex items-center relative z-10">
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-40 pl-8 pr-12 py-1 text-xs bg-surface-raised border border-border rounded-lg text-content focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    autoFocus
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  />
                  <Search size={12} className="absolute left-2.5 text-content-muted" />
                  {isSupported && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={isListening ? stopListening : startListening}
                      className={`absolute right-7 p-1 rounded transition-colors ${
                        isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-content-muted hover:text-content hover:bg-app'
                      }`}
                      title="Dictée vocale"
                    >
                      <Mic size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchVal(''); }}
                    className="absolute right-2 text-content-muted hover:text-content"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg text-content-muted hover:bg-surface-raised transition-colors flex items-center gap-1.5 text-xs font-medium"
                  title="Rechercher"
                >
                  <Search size={14} />
                  {isSupported && <Mic size={14} className="text-indigo-500" />}
                </button>
              )}

              {/* Desktop Dropdown Results */}
              {searchOpen && searchVal.trim() !== '' && (
                <div className="absolute top-full right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden w-48 z-50 py-1">
                  {PUBLIC_SECTIONS.filter(
                    (sec) =>
                      sec.label.toLowerCase().includes(searchVal.toLowerCase()) ||
                      sec.synonyms.some((syn) => syn.includes(searchVal.toLowerCase()))
                  ).map((sec) => (
                    <Link
                      key={sec.path}
                      to={sec.path}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navigate(sec.path);
                        setSearchOpen(false);
                        setSearchVal('');
                      }}
                      className="block px-4 py-2 text-xs font-medium text-content hover:bg-surface-raised transition-colors"
                    >
                      {sec.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

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
              <button
                onClick={() => setSearchOpen(o => !o)}
                className={`p-2 rounded-lg transition-colors ${
                  searchOpen ? 'text-indigo-600 bg-surface-raised' : 'text-content-muted hover:bg-surface-raised'
                }`}
                aria-label="Rechercher"
              >
                <Search size={18} />
              </button>
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

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="md:hidden border-t border-border-subtle bg-surface px-4 py-2 relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Rechercher une section..."
                className="w-full pl-8 pr-12 py-1.5 text-xs bg-surface-raised border border-border rounded-lg text-content focus:outline-none"
                autoFocus
              />
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-content-muted" />
              {isSupported && (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-7 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                    isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-content-muted hover:text-content'
                  }`}
                >
                  <Mic size={12} />
                </button>
              )}
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchVal(''); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
              >
                <X size={12} />
              </button>
            </div>
            {/* Mobile Dropdown Results */}
            {searchVal.trim() !== '' && (
              <div className="absolute top-full left-0 right-0 bg-surface border-b border-border shadow-lg z-50 py-1">
                {PUBLIC_SECTIONS.filter(
                  (sec) =>
                    sec.label.toLowerCase().includes(searchVal.toLowerCase()) ||
                    sec.synonyms.some((syn) => syn.includes(searchVal.toLowerCase()))
                ).map((sec) => (
                  <Link
                    key={sec.path}
                    to={sec.path}
                    onClick={() => {
                      navigate(sec.path);
                      setSearchOpen(false);
                      setSearchVal('');
                    }}
                    className="block px-6 py-2.5 text-xs font-medium text-content hover:bg-surface-raised transition-colors"
                  >
                    {sec.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

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
      <footer className="bg-slate-900 dark:bg-surface border-t border-slate-800 dark:border-border-subtle text-slate-400 py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 xl:px-28">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/images/logo-original.png" alt="Campus Logo" className="w-9 h-9 rounded-xl object-cover" />
                <span className="font-heading font-bold text-xl text-white">CAMPUS</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                La plateforme qui modernise la gestion universitaire.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Navigation</h5>
              <ul className="space-y-2.5 text-sm">
                {NAV_LINKS.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Accès</h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/connexion" className="hover:text-white transition-colors">
                    Connexion
                  </Link>
                </li>
                <li>
                  <Link to="/connexion" className="hover:text-white transition-colors">
                    Démarrer gratuitement
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-white mb-4">Légal</h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">© {new Date().getFullYear()} CAMPUS. Tous droits réservés.</p>
            <p className="text-sm text-slate-600">Conçu pour l'excellence universitaire 🎓</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

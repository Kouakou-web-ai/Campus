import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import ThemeToggle from '../components/shared/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-app transition-colors duration-200">
      {/* Panel gauche — déco */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        {/* Mesh gradient */}
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(at 20% 30%, rgba(255,255,255,0.2) 0, transparent 50%),
              radial-gradient(at 80% 70%, rgba(255,255,255,0.1) 0, transparent 50%)`,
          }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-heading font-bold text-2xl text-white">CAMPUS</span>
          </Link>

          {/* Tagline */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                La gestion universitaire{' '}
                <span className="text-white/70">réinventée</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-sm">
                Une plateforme premium pour piloter vos universités avec précision et élégance.
              </p>
            </div>
          </div>

          <div />
        </div>
      </div>

      {/* Panel droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
          <ThemeToggle variant="dropdown" />
        </div>
        <div className="w-full max-w-md">

          <Outlet />
        </div>
      </div>
    </div>
  );
}

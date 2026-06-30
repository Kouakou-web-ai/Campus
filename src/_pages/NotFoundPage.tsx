import { Link } from 'react-router-dom';
import { Home, MessageCircle } from 'lucide-react';
const FLOATING_SHAPES = [
  { size: 80, top: '10%', left: '5%', delay: 0, duration: 6, color: 'bg-indigo-200/30' },
  { size: 50, top: '20%', right: '10%', delay: 1, duration: 7, color: 'bg-violet-200/30' },
  { size: 120, bottom: '15%', left: '8%', delay: 0.5, duration: 8, color: 'bg-purple-200/20' },
  { size: 60, bottom: '25%', right: '5%', delay: 2, duration: 6.5, color: 'bg-indigo-300/20' },
];

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/30">
      {/* Floating background shapes */}
      {FLOATING_SHAPES.map((shape, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${shape.color} pointer-events-none`}
          style={{
            width: shape.size,
            height: shape.size,
            top: shape.top,
            left: (shape as { left?: string }).left,
            right: (shape as { right?: string }).right,
            bottom: (shape as { bottom?: string }).bottom,
            animation: `float-3d ${shape.duration}s ease-in-out infinite`,
            animationDelay: `${shape.delay}s`,
          }}
        />
      ))}

      {/* Gradient blob */}
      <div
        className="absolute w-[600px] h-[600px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
          animation: 'blob-morph 8s ease-in-out infinite',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* 404 giant number */}
        <div className="relative mb-6 select-none">
          <span
            className="text-[6rem] sm:text-[_5rem] font-extrabold font-heading leading-none gradient-text"
            style={{
              WebkitTextStroke: '2px transparent',
              filter: 'drop-shadow(0 0 60px rgba(99,102,241,0.25))',
              animation: 'float-3d 5s ease-in-out infinite',
            }}
          >
            404
          </span>
          {/* Ghost circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-full border-2 border-indigo-200/40 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
          Page introuvable
        </h1>
        <p className="text-slate-500 text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Oups ! Cette page n'existe pas ou a été déplacée. Retournez à l'accueil pour continuer votre navigation.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="btn-gradient text-white p-2 rounded-2xl font-semibold flex items-center gap-2 group shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <Home size={18} />
            Retour à l'accueil
          </Link>
          <Link
            to="/contact"
            className="flex items-center gap-2 text-slate-600 font-semibold hover:text-indigo-600 transition-colors px-6 py-3.5 rounded-2xl hover:bg-slate-100 w-full sm:w-auto justify-center"
          >
            <MessageCircle size={18} />
            Contacter le support
          </Link>
        </div>

        {/* Fun emoji */}
        <div className="mt-12 text-5xl" style={{ animation: 'float 2s ease-in-out infinite' }}>
          🎓
        </div>
      </div>
    </div>
  );
}

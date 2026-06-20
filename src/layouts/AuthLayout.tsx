import { Outlet, Link } from 'react-router-dom';
import { GraduationCap, Wallet, ShieldCheck, Landmark } from 'lucide-react';
import ThemeToggle from '../components/shared/ThemeToggle';
import ParticlesBackground from '../components/ui/ParticlesBackground';
import { useThemeStore } from '../store/themeStore';

export default function AuthLayout() {
  const { mode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <div className="min-h-screen flex bg-app transition-colors duration-200">
      {/* Local custom animation styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes draw-ring {
          0% {
            stroke-dashoffset: 94.2;
          }
          45%, 75% {
            stroke-dashoffset: 23.5;
          }
          100% {
            stroke-dashoffset: 94.2;
          }
        }
        @keyframes fill-payment {
          0% {
            width: 0%;
          }
          45%, 75% {
            width: 78%;
          }
          100% {
            width: 0%;
          }
        }
        @keyframes float-mockup {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}} />

      {/* Panel gauche — déco premium adaptatif */}
      <div 
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 select-none transition-colors duration-300 ${
          isDark ? 'bg-slate-50 border-r border-slate-200/80' : 'bg-slate-950'
        }`}
      >
        {/* Animated background blobs for mesh gradient */}
        <div className={`absolute top-[-10%] left-[-10%] w-[65%] h-[65%] rounded-full blur-[130px] animate-pulse duration-[8s] ${
          isDark ? 'bg-indigo-600/5' : 'bg-indigo-600/15'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[65%] h-[65%] rounded-full blur-[130px] animate-pulse duration-[10s] delay-1000 ${
          isDark ? 'bg-violet-600/5' : 'bg-violet-600/15'
        }`} />

        {/* Constellations background */}
        <ParticlesBackground 
          count={45} 
          color={isDark ? '99, 102, 241' : '99, 102, 241'} 
          className={isDark ? 'opacity-20' : 'opacity-40'} 
        />

        {/* Logo header */}
        <Link to="/" className="flex items-center gap-3 z-10">
          <img src="/images/logo-original.png" alt="Campus Logo" className="w-10 h-10 rounded-xl shadow-lg object-cover" />
          <span className={`font-heading font-black text-2xl tracking-wider ${isDark ? 'text-slate-900' : 'text-white'}`}>CAMPUS</span>
        </Link>

        {/* Center: Brand tagline and animated mockup */}
        <div className="my-auto space-y-8 z-10 w-full max-w-md">
          {/* Welcome Text block */}
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isDark ? 'bg-indigo-100 border border-indigo-200 text-indigo-700' : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-indigo-600' : 'bg-indigo-400'}`} />
              Écosystème Universitaire
            </div>
            <h2 className={`text-4xl font-extrabold leading-tight tracking-tight ${isDark ? 'text-slate-900' : 'text-white'}`}>
              L'écosystème numérique <br />
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                de votre établissement
              </span>
            </h2>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Une interface unifiée reliant étudiants, enseignants, parents et administrateurs pour piloter la scolarité, les cours, les notes et les paiements en parfaite synergie.
            </p>
          </div>

          {/* Animated Mockup Window */}
          <div 
            className={`w-full border rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${
              isDark ? 'bg-white/80 border-slate-200/80 shadow-indigo-100/50' : 'bg-slate-900/60 border-slate-800/80'
            }`}
            style={{ animation: 'float-mockup 5s ease-in-out infinite' }}
          >
            {/* Window control header */}
            <div className={`flex items-center gap-1.5 mb-4 border-b pb-3 ${
              isDark ? 'border-slate-200/60' : 'border-slate-800/50'
            }`}>
              <span className="w-2 h-2 rounded-full bg-red-500/60" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
              <span className="w-2 h-2 rounded-full bg-green-500/60" />
              <span className="text-[10px] text-slate-500 font-mono ml-2">campus-dashboard.io</span>
            </div>

            {/* Dashboard widgets */}
            <div className="space-y-3">
              {/* Widget: Taux de paiement de scolarité (No text, pure animation) */}
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isDark ? 'bg-slate-50/50 border-slate-200/60' : 'bg-slate-950/40 border-slate-800/50'
              }`}>
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${
                      isDark ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      <Landmark size={11} />
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-bold ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}>Scolarité</span>
                  </div>
                  
                  {/* Animated horizontal representation of payments */}
                  <div className="space-y-1.5">
                    {/* Paid portion bar */}
                    <div className={`h-2 rounded-full overflow-hidden relative ${
                      isDark ? 'bg-slate-200/60' : 'bg-slate-800/60'
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        style={{
                          width: '78%',
                          animation: 'fill-payment 4s ease-in-out infinite'
                        }}
                      />
                    </div>
                    
                    {/* Small floating items showing flow */}
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                    </div>
                  </div>
                </div>

                {/* Circular Ring Gauge (No text inside, just a glowing, pulsing currency icon in the center) */}
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke={isDark ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.05)'} strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="3.2"
                      strokeDasharray="94.2"
                      strokeDashoffset="94.2"
                      strokeLinecap="round"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        animation: 'draw-ring 4s ease-in-out infinite'
                      }}
                    />
                  </svg>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md animate-pulse ${
                    isDark ? 'bg-slate-100 text-emerald-600' : 'bg-slate-900 text-emerald-400'
                  }`}>
                    <Wallet size={14} />
                  </div>
                </div>
              </div>

              {/* Widget: Espace sécurisé */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-slate-50/50 border-slate-200/60 text-slate-700' : 'bg-slate-950/40 border-slate-800/50 text-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${
                    isDark ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <ShieldCheck size={11} />
                  </div>
                  <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>Portail sécurisé actif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer branding/copyright info */}
        <div className={`flex justify-between items-center text-xs z-10 ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span>© {new Date().getFullYear()} CAMPUS SaaS</span>
          <div className="flex gap-4">
            <Link to="/tarifs" className={`transition-colors ${isDark ? 'hover:text-indigo-600' : 'hover:text-slate-300'}`}>Tarifs</Link>
            <Link to="/contact" className={`transition-colors ${isDark ? 'hover:text-indigo-600' : 'hover:text-slate-300'}`}>Support</Link>
          </div>
        </div>
      </div>

      {/* Panel droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
        <ParticlesBackground className="opacity-30 dark:opacity-20" />
        <div className="w-full max-w-md z-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

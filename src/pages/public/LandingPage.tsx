import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Users, BookOpen,
  BarChart3, Shield, Zap, Globe, ChevronRight, Play,
} from 'lucide-react';
import ThreeDCard from '../../components/ui/ThreeDCard';
import ParticlesBackground from '../../components/ui/ParticlesBackground';
import RevealOnScroll from '../../components/ui/RevealOnScroll';
import { useTypewriter } from '../../hooks/useTypewriter';
import { motion } from 'framer-motion';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

const FEATURES = [
  {
    icon: Users,
    title: 'Gestion Étudiants',
    description: 'Suivi complet des dossiers, notes, présences et paiements avec des dashboards en temps réel adaptés au système ivoirien.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: BarChart3,
    title: 'Analytiques Financières',
    description: 'Tableaux de bord financiers en FCFA avec graphiques interactifs de scolarité et rapports exportables.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Shield,
    title: 'Sécurité & Confidentialité',
    description: 'Architecture robuste isolant hermétiquement les données de votre établissement avec authentification stricte par rôles.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Zap,
    title: 'Ultra Rapide & Fluide',
    description: 'Interface réactive avec chargement instantané, optimisée pour des milliers d\'étudiants et d\'enseignants.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Globe,
    title: 'Accessible Partout',
    description: 'Accès depuis n\'importe quel appareil — mobile, tablette ou desktop. Idéal pour les connexions mobiles.',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  {
    icon: BookOpen,
    title: 'Bulletins & Résultats',
    description: 'Génération et gestion des bulletins de notes semestriels avec saisie des notes, calcul automatique des moyennes et appréciations.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
];

const ROLE_PORTALS = [
  {
    id: 'admin',
    role: 'Administrateur',
    headline: 'Pilotage & Comptabilité',
    icon: Shield,
    description: 'Centralisez la scolarité, gérez les inscriptions, pilotez le budget et suivez les versements Mobile Money de votre établissement en un coup d\'œil.'
  },
  {
    id: 'enseignant',
    role: 'Enseignant',
    headline: 'Cahier de textes & Notes',
    icon: BookOpen,
    description: 'Saisissez les notes, gérez le cahier de textes numérique, suivez les présences en classe et communiquez avec vos étudiants facilement.'
  },
  {
    id: 'etudiant',
    role: 'Étudiant',
    headline: 'Notes & Scolarité',
    icon: Users,
    description: 'Consultez vos notes en ligne, suivez votre emploi du temps et réglez vos frais de scolarité de manière sécurisée par Mobile Money (Wave, Orange, MTN).'
  },
  {
    id: 'parent',
    role: 'Parent d\'élève',
    headline: 'Suivi Académique',
    icon: Zap,
    description: 'Suivez la scolarité de vos enfants : alertes instantanées de retards ou absences, évolution des notes, bulletins et règlements financiers.'
  }
];

const PARTNERS = [
  'Université Félix Houphouët-Boigny (UFHB)',
  'INP-HB Yamoussoukro',
  'Université Alassane Ouattara (UAO)',
  'Université Virtuelle de Côte d\'Ivoire (UVCI)',
  'Université Nangui Abrogoua (UNA)',
  'Université Jean Lorougnon Guédé (UJLG)',
  'Université Péléforo Gon Coulibaly (UPGC)',
];

const STEPS = [
  { num: '01', title: 'Inscrivez votre établissement', desc: 'Créez l\'espace numérique de votre université en quelques minutes.' },
  { num: '02', title: 'Importez les listes', desc: 'Importez vos étudiants, enseignants et cours en un clic via Excel ou API.' },
  { num: '03', title: 'Pilotez en temps réel', desc: 'Suivez la scolarité, les notes et les paiements Mobile Money instantanément.' },
];

export default function LandingPage() {
  const [activeRoleTab, setActiveRoleTab] = useState(0);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);

  const { text: typewriterText } = useTypewriter({
    words: ['votre université', 'vos étudiants', 'vos cours'],
    typeSpeed: 70,
    deleteSpeed: 40,
    pauseTime: 2200,
  });

  useEffect(() => {
    if (isAutoPlayPaused) return;

    const interval = setInterval(() => {
      setActiveRoleTab((tab) => (tab + 1) % ROLE_PORTALS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlayPaused]);

  useEffect(() => {
    if (!isAutoPlayPaused) return;

    const timeout = setTimeout(() => {
      setIsAutoPlayPaused(false);
    }, 8000);

    return () => clearTimeout(timeout);
  }, [isAutoPlayPaused]);

  return (
    <div className="overflow-hidden">
      {/* ============ HERO ============ */}
      <section className="relative min-h-screen flex items-center hero-mesh py-24 overflow-hidden">
        {/* Background Grille Plate (carreaux subtils) */}
        <div className="absolute inset-0 flat-grid pointer-events-none" />



        {/* Particles */}
        <ParticlesBackground count={55} color="99,102,241" />

        {/* Morphing blob */}
        <div
          className="blob-morph absolute pointer-events-none opacity-30"
          style={{
            width: 500,
            height: 500,
            top: '5%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(168,85,247,0.2) 60%, transparent 80%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Decorative elements */}
        <motion.div 
          animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-10 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" 
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 xl:px-20 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Text content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }} 
              className="lg:col-span-7 text-center lg:text-left space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/50 text-indigo-700 text-sm font-semibold px-4 py-1.5 rounded-full transform hover:scale-105 transition-all duration-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                Spécialement adapté aux établissements d'enseignement 🇨🇮
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Avec CAMPUS, pilotez
                <br />
                <span className="gradient-text inline-block whitespace-nowrap">
                  {typewriterText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>

              <p className="text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Révolutionnez la gestion de votre université : centralisez les dossiers académiques, automatisez le suivi pédagogique et connectez instantanément l'administration, les enseignants, les étudiants et les parents.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/connexion"
                  className="btn-gradient text-white px-8 py-4 rounded-2xl text-base font-semibold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group w-full sm:w-auto text-center justify-center"
                >
                  Démarrer gratuitement
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-2.5 text-slate-600 font-semibold hover:text-indigo-600 transition-all duration-300 group px-5 py-4 rounded-2xl hover:bg-slate-50"
                >
                  Contactez-nous
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Hero Image with 3D Effect & Floating Badges */}
            <div className="lg:col-span-5 flex justify-center items-center animate-scale-in delay-200">
              <div className="relative w-full max-w-lg p-6">
                
                {/* Background Glow behind the image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />

                {/* Floating Badge: Université */}
                <div className="absolute -top-4 left-2 sm:-left-6 bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-100/80 dark:border-slate-800/80 p-3 rounded-2xl flex items-center gap-2.5 animate-float z-20 hover:scale-105 transition-all duration-300 cursor-default">
                  <span className="text-xl">🏛️</span>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Espace</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">Admin-Université</p>
                  </div>
                </div>

                {/* Floating Badge: Enseignants */}
                <div className="absolute -top-12 right-2 sm:right-0 bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-100/80 dark:border-slate-800/80 p-3 rounded-2xl flex items-center gap-2.5 animate-float delay-500 z-20 hover:scale-105 transition-all duration-300 cursor-default">
                  <span className="text-xl">👨‍🏫</span>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Espace</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">Enseignants</p>
                  </div>
                </div>

                {/* Floating Badge: Étudiants */}
                <div className="absolute bottom-20 right-2 sm:-right-6 bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-100/80 dark:border-slate-800/80 p-3 rounded-2xl flex items-center gap-2.5 animate-float delay-700 z-20 hover:scale-105 transition-all duration-300 cursor-default">
                  <span className="text-xl">🎓</span>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Espace</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">Étudiants</p>
                  </div>
                </div>

                {/* Floating Badge: Parents */}
                <div className="absolute bottom-4 left-2 sm:-left-6 bg-white/95 dark:bg-slate-900/95 shadow-xl border border-slate-100/80 dark:border-slate-800/80 p-3 rounded-2xl flex items-center gap-2.5 animate-float delay-1000 z-20 hover:scale-105 transition-all duration-300 cursor-default">
                  <span className="text-xl">👥</span>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Espace</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-white">Parents</p>
                  </div>
                </div>

                {/* 3D Tilt Wrapper */}
                <ThreeDCard maxTilt={8} scale={1.01} className="relative z-10">
                  <div className="relative rounded-3xl overflow-visible p-2">
                    <img 
                      src="/images/students-hero.png" 
                      alt="Illustration CAMPUS" 
                      className="w-full h-auto object-contain max-h-[450px] drop-shadow-2xl"
                    />
                  </div>
                </ThreeDCard>
                
              </div>
            </div>
          </div>

          {/* Interactive Preview Mockup with 3D Tilt Wrapper */}
          <div className="mt-24 relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-app via-transparent to-transparent z-10 pointer-events-none bottom-0 h-1/3" />
            <ThreeDCard className="max-w-5xl mx-auto shadow-2xl" scale={1.01} maxTilt={6}>
              <div className="glass-card p-4 hover:shadow-indigo-100/50 hover:border-indigo-200/50 transition-all duration-500">
                <div className="bg-slate-50/50 rounded-2xl p-6 min-h-64 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aperçu Tableau de bord</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {[
                      { label: 'Étudiants Actifs', num: 64200, suffix: '', color: 'bg-indigo-500', desc: 'Votre Espace' },
                      { label: 'Cours programmés', num: 1240, suffix: '', color: 'bg-emerald-500', desc: 'Semestre 1' },
                      { label: 'Frais de scolarité', num: 12.4, suffix: 'M FCFA', color: 'bg-violet-500', desc: 'Scolarités perçues' },
                      { label: 'Taux de réussite', num: 92.4, suffix: '%', color: 'bg-amber-500', desc: 'Moyenne générale' },
                    ].map((stat, idx) => (
                      <div key={stat.label} className="glass-stat p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5" style={{ animationDelay: `${idx * 0.8}s` }}>
                        <div className="flex justify-between items-start mb-3">
                          <div className={`w-8 h-8 ${stat.color} rounded-xl flex items-center justify-center text-white font-bold text-xs`}>
                            {idx + 1}
                          </div>
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{stat.desc}</span>
                        </div>
                        <div className="text-xl font-bold text-slate-800 tracking-tight">
                          <AnimatedCounter value={stat.num} suffix={stat.suffix} />
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ThreeDCard>
          </div>
        </div>
      </section>
      {/* ============ PORTAILS INTERACTIFS (SÉLECTEUR DE RÔLES) ============ */}
      <section className="py-12 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
        {/* Style block for autoplay progress bar */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}} />

        {/* Decorative background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse duration-[8000ms]" />
          <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse duration-[6000ms]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 xl:px-28 relative z-10">
          <div className="text-center mb-8">
            <span className="inline-block text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-2">
              Une plateforme, 4 espaces dédiés
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Des portails adaptés à chaque acteur de votre établissement
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Chaque utilisateur dispose d'une interface sur mesure pour collaborer efficacement en temps réel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Role selectors */}
            <div className="lg:col-span-5 space-y-3">
              {ROLE_PORTALS.map((portal, idx) => {
                const isActive = activeRoleTab === idx;
                return (
                  <button
                    key={portal.id}
                    onClick={() => {
                      setActiveRoleTab(idx);
                      setIsAutoPlayPaused(true);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group flex gap-3 ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 shadow-xl shadow-indigo-500/5'
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-850/40 border-slate-100/50 dark:border-slate-800/10'
                    }`}
                  >
                    {/* Active dynamic indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-500" />
                    )}

                    <div className={`p-2 rounded-lg h-fit ${
                      isActive
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }`}>
                      <portal.icon size={18} />
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <h3 className={`font-bold text-sm ${
                          isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {portal.role}
                        </h3>
                        {isActive && !isAutoPlayPaused && (
                          <div className="w-10 h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 dark:bg-indigo-500 origin-left animate-[progress_5s_linear_forwards]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{portal.headline}</p>
                      {isActive && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 pt-1.5 animate-fade-in leading-relaxed">
                          {portal.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column: Dashboard Mockup Visualization */}
            <div className="lg:col-span-7 h-[340px] relative">
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col">
                {/* Mockup Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/60 text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                    Interface : {ROLE_PORTALS[activeRoleTab].role}
                  </div>
                </div>

                {/* Tab Specific Mockup Content */}
                <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
                  {activeRoleTab === 0 && (
                    // Mockup Administrateur (Centre Financier)
                    <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-200">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Budget attendu</p>
                          <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">124.5M F</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Recettes perçues</p>
                          <p className="text-xs font-extrabold text-slate-800 dark:text-white mt-0.5">98.2M F</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Recouvrement</p>
                          <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">79%</p>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold">Transactions récentes</p>
                          <span className="text-[9px] text-indigo-600 font-semibold cursor-pointer">Tout voir →</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">Koffi Kouamé Axel</p>
                              <p className="text-[8px] text-slate-400">Mobile Money · Scolarité S1</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">150 000 F</p>
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-[8px] font-bold">Payé</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60">
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">Awa Diop</p>
                              <p className="text-[8px] text-slate-400">Virement · Inscription</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">250 000 F</p>
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-[8px] font-bold">Payé</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeRoleTab === 1 && (
                    // Mockup Enseignant (Espace Enseignant)
                    <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-200">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Copies à corriger</p>
                          <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">14</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Étudiants encadrés</p>
                          <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">182</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Cours enseignés</p>
                          <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">3</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 space-y-2">
                        <p className="text-xs font-bold">Programme de vos cours</p>
                        <div className="overflow-x-auto text-[10px]">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                                <th className="pb-1 font-bold">Code</th>
                                <th className="pb-1 font-bold">Intitulé</th>
                                <th className="pb-1 font-bold">Filière</th>
                                <th className="pb-1 font-bold">Horaire</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40">
                              <tr>
                                <td className="py-1.5 font-mono text-indigo-600 font-bold">GL-201</td>
                                <td className="py-1.5 font-medium">Génie Logiciel</td>
                                <td className="py-1.5 text-slate-500">Licence 2</td>
                                <td className="py-1.5 text-slate-500">Lun 08:00 - 10:00</td>
                              </tr>
                              <tr>
                                <td className="py-1.5 font-mono text-indigo-600 font-bold">AL-102</td>
                                <td className="py-1.5 font-medium">Algèbre Linéaire</td>
                                <td className="py-1.5 text-slate-500">Licence 1</td>
                                <td className="py-1.5 text-slate-500">Mer 10:15 - 12:15</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeRoleTab === 2 && (
                    // Mockup Étudiant (Espace Étudiant)
                    <div className="space-y-4 animate-fade-in text-slate-800 dark:text-slate-200">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100/50 dark:border-slate-800/40 text-center">
                          <p className="text-[7px] text-slate-400 font-bold uppercase">Moyenne</p>
                          <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">14.5/20</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100/50 dark:border-slate-800/40 text-center">
                          <p className="text-[7px] text-slate-400 font-bold uppercase">Examen</p>
                          <p className="text-xs font-extrabold mt-0.5">Dans 3 j</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100/50 dark:border-slate-800/40 text-center">
                          <p className="text-[7px] text-slate-400 font-bold uppercase">Validés</p>
                          <p className="text-xs font-extrabold text-emerald-600 mt-0.5">12/15</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100/50 dark:border-slate-800/40 text-center">
                          <p className="text-[7px] text-slate-400 font-bold uppercase">Absences</p>
                          <p className="text-xs font-extrabold text-slate-500 mt-0.5">0</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 space-y-2">
                          <p className="text-[11px] font-bold">Dernières Notes</p>
                          <div className="space-y-1.5 text-[10px]">
                            <div className="flex justify-between items-center p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60">
                              <span className="truncate">Mathématiques</span>
                              <span className="badge badge-success badge-xs font-bold">16/20</span>
                            </div>
                            <div className="flex justify-between items-center p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800/60">
                              <span className="truncate">Physique</span>
                              <span className="badge badge-warning badge-xs font-bold text-amber-800 dark:text-amber-300">11/20</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 space-y-2">
                          <p className="text-[11px] font-bold">Emploi du temps</p>
                          <div className="space-y-1.5 text-[9px]">
                            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                              <p className="font-bold text-slate-800 dark:text-white">Algèbre Linéaire</p>
                              <p className="text-slate-400 mt-0.5">Amphi A · 08:00 - 10:00</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeRoleTab === 3 && (
                    // Mockup Parent (Espace Parents)
                    <div className="space-y-4 animate-fade-in text-slate-850 dark:text-slate-200">
                      <div className="flex justify-between items-center gap-3">
                        <p className="text-[11px] font-bold text-slate-500">Suivi d'élève :</p>
                        <span className="px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-[10px] font-bold">
                          Jean Dupont
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 text-center">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Moyenne (Jean)</p>
                          <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">14.5/20</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 text-center">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Absences</p>
                          <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">0</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 text-center">
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Scolarité</p>
                          <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">À jour</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40 space-y-2">
                        <p className="text-xs font-bold">Dernières factures</p>
                        <div className="overflow-x-auto text-[9px]">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                                <th className="pb-1 font-bold">Date</th>
                                <th className="pb-1 font-bold">Description</th>
                                <th className="pb-1 font-bold">Montant</th>
                                <th className="pb-1 font-bold">Statut</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150 dark:divide-slate-800/40">
                              <tr>
                                <td className="py-1.5">01/09/2026</td>
                                <td className="py-1.5 font-medium">Inscription - S1</td>
                                <td className="py-1.5">2 500 F</td>
                                <td className="py-1.5"><span className="badge badge-success badge-xs">Payé</span></td>
                              </tr>
                              <tr>
                                <td className="py-1.5">01/10/2026</td>
                                <td className="py-1.5 font-medium">Assurance Univ.</td>
                                <td className="py-1.5">150 F</td>
                                <td className="py-1.5"><span className="badge badge-success badge-xs">Payé</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mockup Footer branding */}
                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Données chiffrées en temps réel</span>
                    <span>CAMPUS v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="relative py-24 hero-mesh overflow-hidden">
        {/* Background Grille 3D Linear/Vercel style */}
        <div className="absolute inset-0 three-d-grid opacity-[0.15] pointer-events-none" />

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl animate-pulse duration-3000 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl animate-pulse duration-2000 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 xl:px-28 relative z-10">
          <RevealOnScroll direction="up">
          <div className="text-center mb-16">
            <span className="inline-block text-indigo-600 dark:text-white font-semibold text-sm mb-3">Fonctionnalités</span>
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Une gestion moderne et simplifiée
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Une suite complète d'outils pensés pour répondre aux défis logistiques et financiers des universités ivoiriennes.
            </p>
          </div>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <ThreeDCard
                  key={feat.title}
                  className="animate-fade-up h-full"
                  style={{ animationDelay: `${index * 75}ms` } as React.CSSProperties}
                  maxTilt={12}
                >
                  <div className="card-premium p-6 group cursor-pointer h-full border border-slate-100/80 hover:border-indigo-100 hover:shadow-xl transition-all duration-300">
                    <div className={`w-12 h-12 ${feat.bg} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                      <Icon size={22} className={feat.color} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">{feat.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>

                  </div>
                </ThreeDCard>
              );
            })}
          </div>
        </div>
      </section>




      {/* ============ CTA FINAL ============ */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(at 30% 40%, rgba(255,255,255,0.3) 0, transparent 50%), radial-gradient(at 70% 60%, rgba(255,255,255,0.2) 0, transparent 50%)' }}
        />
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à moderniser votre établissement ?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Faites confiance à CAMPUS pour simplifier la vie de vos étudiants, enseignants et personnels au sein de votre établissement.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/connexion"
              className="bg-white text-indigo-700 font-semibold px-8 py-4 rounded-2xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center gap-2 group"
            >
              Créer un compte d'essai
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-indigo-100 font-semibold transition-colors px-5 py-4 rounded-2xl hover:bg-white/10"
            >
              Prendre rendez-vous →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

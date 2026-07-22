import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';

export default function AppSplash() {
  const authLoading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  
  const dataLoading = useRealtimeDataStore((state) => state.loading);
  const currentUniversity = useRealtimeDataStore((state) => state.currentUniversity);
  const universities = useRealtimeDataStore((state) => state.universities);

  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 1. Timeout de sécurité (3.5 secondes max)
    const timeoutTimer = setTimeout(() => {
      console.log('[AppSplash] Timeout de sécurité déclenché');
      setIsReady(true);
    }, 3500);

    return () => clearTimeout(timeoutTimer);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      // Utilisateur non authentifié : pas de données de tableau de bord à charger, on cache direct
      setIsReady(true);
      return;
    }

    // Utilisateur authentifié : on attend la fin du chargement des données (IndexedDB ou Firebase)
    if (!dataLoading) {
      setIsReady(true);
    }
  }, [authLoading, isAuthenticated, user, dataLoading, currentUniversity, universities]);

  // Gérer l'état de transition pour masquer le composant proprement après le fade-out
  useEffect(() => {
    if (isReady) {
      const exitTimer = setTimeout(() => {
        setShowSplash(false);
      }, 400); // Temps pour finir l'animation de sortie
      return () => clearTimeout(exitTimer);
    }
  }, [isReady]);

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      {showSplash && !isReady && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1C2B45]"
          style={{
            background: 'radial-gradient(circle, #233757 0%, #1C2B45 100%)',
          }}
        >
          <div className="flex flex-col items-center space-y-6">
            {/* Logo avec animation pulse / respiration */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [0.95, 1.05, 0.95],
                opacity: 1
              }}
              transition={{
                scale: {
                  repeat: Infinity,
                  duration: 2.5,
                  ease: 'easeInOut',
                },
                opacity: { duration: 0.5 }
              }}
              className="relative w-28 h-28 flex items-center justify-center"
            >
              {/* Effet halo d'or académique arrière */}
              <div 
                className="absolute inset-0 rounded-3xl bg-[#C8932A] opacity-10 blur-xl animate-pulse"
                style={{ filter: 'blur(20px)' }}
              />
              <img
                src="/images/logo-original.png"
                alt="Logo CampusCI"
                className="w-24 h-24 rounded-2xl shadow-2xl object-cover border border-[#C8932A]/20 relative z-10"
              />
            </motion.div>

            {/* Titre et sous-titre stylisés */}
            <div className="text-center space-y-2 select-none">
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-4xl font-semibold tracking-[0.2em] text-[#C8932A]"
                style={{ fontFamily: "'Newsreader', serif" }}
              >
                CAMPUS
              </motion.h1>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-xs font-light tracking-widest text-slate-400 uppercase"
                style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
              >
                Espace Universitaire Premium
              </motion.p>
            </div>
          </div>

          {/* Indicateur de chargement discret (Academic Gold) */}
          <div className="absolute bottom-16 flex flex-col items-center space-y-2">
            <div className="flex space-x-1.5">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-[#C8932A]"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.9, 1.1, 0.9]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    delay: index * 0.2,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

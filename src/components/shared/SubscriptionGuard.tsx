import React from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRealtimeDataStore } from '../../store/realtimeDataStore';
import { useAuthStore } from '../../store/authStore';
import { hasFeatureAccess } from '../../lib/subscription';
import type { PlanFeatures } from '../../lib/subscription';

interface SubscriptionGuardProps {
  feature: keyof Omit<PlanFeatures, 'studentLimit'>;
  label: string;
  children: React.ReactNode;
}

export default function SubscriptionGuard({ feature, label, children }: SubscriptionGuardProps) {
  const { currentUniversity } = useRealtimeDataStore();
  const { user } = useAuthStore();

  const isAllowed = hasFeatureAccess(currentUniversity, feature);

  if (!isAllowed) {
    const isUnivAdmin = user?.role === 'UNIVERSITY_ADMIN';
    const planName = currentUniversity?.plan 
      ? currentUniversity.plan.charAt(0).toUpperCase() + currentUniversity.plan.slice(1) 
      : 'Gratuit';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 page-transition">
        <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center overflow-hidden">
          {/* Decorative glowing background */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none mb-6 animate-pulse">
            <Lock size={28} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
            Fonctionnalité Premium
          </h2>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-6 uppercase tracking-wider">
            {label}
          </p>

          {/* Details */}
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-md mx-auto">
            Cette fonctionnalité n'est pas disponible avec votre formule d'abonnement actuelle (<span className="font-bold text-slate-700 dark:text-slate-200">{planName}</span>). 
            {isUnivAdmin 
              ? " Passez au forfait supérieur pour débloquer cette option immédiatement et booster votre gestion académique."
              : " Veuillez contacter l'administrateur de votre établissement pour mettre à jour l'offre de votre université."}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {isUnivAdmin ? (
              <>
                <Link
                  to="/tarifs"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-2xl text-xs font-bold transition-all shadow-md group"
                >
                  Découvrir les offres
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-950 rounded-2xl text-xs font-bold transition-all"
                >
                  Contacter le support
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 px-4 py-2.5 rounded-2xl">
                <ShieldAlert size={14} />
                <span>Accès restreint aux administrateurs</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

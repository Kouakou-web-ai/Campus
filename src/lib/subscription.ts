export type SubscriptionPlan = 'gratuit' | 'starter' | 'pro' | 'premium' | 'enterprise';

export interface PlanFeatures {
  studentLimit: number;
  hasFinance: boolean;
  hasAbsences: boolean;
  hasDevoirs: boolean;
  hasGestionnaires: boolean;
  hasStats: boolean;
  hasActivityReports: boolean;
  hasExternalIntegrations: boolean;
  hasDedicatedServer: boolean;
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  gratuit: {
    studentLimit: 100,
    hasFinance: false,
    hasAbsences: false,
    hasDevoirs: false,
    hasGestionnaires: false,
    hasStats: false,
    hasActivityReports: false,
    hasExternalIntegrations: false,
    hasDedicatedServer: false,
  },
  starter: {
    studentLimit: 500,
    hasFinance: true,
    hasAbsences: true,
    hasDevoirs: true,
    hasGestionnaires: true,
    hasStats: false,
    hasActivityReports: false,
    hasExternalIntegrations: false,
    hasDedicatedServer: false,
  },
  pro: {
    studentLimit: 5000,
    hasFinance: true,
    hasAbsences: true,
    hasDevoirs: true,
    hasGestionnaires: true,
    hasStats: true,
    hasActivityReports: true,
    hasExternalIntegrations: true,
    hasDedicatedServer: false,
  },
  premium: {
    studentLimit: Infinity,
    hasFinance: true,
    hasAbsences: true,
    hasDevoirs: true,
    hasGestionnaires: true,
    hasStats: true,
    hasActivityReports: true,
    hasExternalIntegrations: true,
    hasDedicatedServer: true,
  },
  enterprise: {
    studentLimit: Infinity,
    hasFinance: true,
    hasAbsences: true,
    hasDevoirs: true,
    hasGestionnaires: true,
    hasStats: true,
    hasActivityReports: true,
    hasExternalIntegrations: true,
    hasDedicatedServer: true,
  },
};

export function getPlanFeatures(plan: string): PlanFeatures {
  const norm = (plan || 'starter').toLowerCase() as SubscriptionPlan;
  return PLAN_FEATURES[norm] || PLAN_FEATURES.starter;
}

export function hasFeatureAccess(
  university: { plan: string; enforceLimits?: boolean } | null | undefined,
  feature: keyof Omit<PlanFeatures, 'studentLimit'>
): boolean {
  if (!university) return true;
  // Si enforceLimits n'est pas actif (legacy), on donne accès à tout
  if (university.enforceLimits !== true) return true;
  
  const features = getPlanFeatures(university.plan);
  return features[feature] ?? true;
}

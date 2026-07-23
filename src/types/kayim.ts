// ============================================
// TYPES POUR L'AGENT IA KAYIM — CAMPUS SaaS
// ============================================

import type { UserRole } from '../store/authStore';

export type KayimTargetRole = UserRole | 'ALL';

export type KayimCategory =
  | 'AUTH'
  | 'COMPTES'
  | 'INSCRIPTIONS'
  | 'NOTES_EVALUATIONS'
  | 'PAIEMENTS_FINANCES'
  | 'EMPLOI_DU_TEMPS'
  | 'PRESENCES'
  | 'COURS_DOCUMENTS'
  | 'COMMUNICATION'
  | 'CONFIGURATION'
  | 'TARIFS_ABONNEMENTS'
  | 'LEGAL';

export interface KayimStep {
  stepNumber: number;
  title: string;
  description: string;
  uiLocation?: string;
  actionType?: 'CLICK' | 'FILL_FORM' | 'SELECT' | 'VALIDATE';
}

export interface KayimFAQ {
  id: string;
  question: string;
  answer: string;
  rolesAllowed: KayimTargetRole[];
  keywords: string[];
  suggestedUrl?: string;
}

export interface KayimErrorSolution {
  errorCode: string;
  messagePattern: string;
  cause: string;
  solutionSteps: string[];
  roles: KayimTargetRole[];
}

export interface KayimProcedure {
  id: string;
  title: string;
  description: string;
  roles: KayimTargetRole[];
  steps: KayimStep[];
  prerequisites?: string[];
  suggestedUrl?: string;
  keywords: string[];
}

export interface KayimModule {
  moduleId: string;
  name: string;
  category: KayimCategory;
  description: string;
  targetRoles: KayimTargetRole[];
  procedures: KayimProcedure[];
  faq: KayimFAQ[];
  errors: KayimErrorSolution[];
}

export interface KayimKnowledgeBase {
  version: string;
  lastUpdated: string;
  modules: KayimModule[];
}

export interface KayimActionButton {
  label: string;
  url: string;
  icon?: string;
}

export interface KayimChatMessage {
  id: string;
  sender: 'user' | 'kayim';
  text: string;
  timestamp: string;
  roleContext?: UserRole;
  actionButtons?: KayimActionButton[];
  steps?: KayimStep[];
  isError?: boolean;
}

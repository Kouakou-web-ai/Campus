// ============================================
// CHART THEME — Design Tokens pour graphiques
// ============================================

export const CHART_COLORS = {
  primary: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  info: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  neutral: ['#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'],
} as const;

/** Palette ordonnée pour les séries de données catégorielles (max 8 couleurs) */
export const CHART_SERIES_PALETTE = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
] as const;

/** Gradients pour les graphiques en aire */
export const CHART_GRADIENTS = {
  indigo: { start: '#6366f1', startOpacity: 0.25, endOpacity: 0 },
  emerald: { start: '#10b981', startOpacity: 0.2, endOpacity: 0 },
  amber: { start: '#f59e0b', startOpacity: 0.2, endOpacity: 0 },
  red: { start: '#ef4444', startOpacity: 0.15, endOpacity: 0 },
} as const;

/** Seuils de couleur pour les indicateurs de performance */
export const PERFORMANCE_THRESHOLDS = {
  excellent: { min: 16, color: '#10b981', label: 'Excellent', emoji: '🌟' },
  good: { min: 14, color: '#3b82f6', label: 'Bien', emoji: '✅' },
  average: { min: 12, color: '#f59e0b', label: 'Moyen', emoji: '⚠️' },
  belowAverage: { min: 10, color: '#f97316', label: 'Insuffisant', emoji: '📉' },
  critical: { min: 0, color: '#ef4444', label: 'Critique', emoji: '🚨' },
} as const;

/** Labels de tendance contextuels */
export const TREND_LABELS = {
  up: {
    strong: 'Forte hausse',
    moderate: 'En hausse',
    slight: 'Légère hausse',
  },
  down: {
    strong: 'Forte baisse',
    moderate: 'En baisse',
    slight: 'Légère baisse',
  },
  neutral: 'Stable',
} as const;

export type TrendDirection = 'up' | 'down' | 'neutral';
export type TrendIntensity = 'strong' | 'moderate' | 'slight';

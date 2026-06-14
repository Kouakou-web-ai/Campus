// ============================================
// TREND ENGINE — Calcul automatique de tendances
// ============================================
// Ce moteur calcule les deltas entre période actuelle et précédente,
// détecte les anomalies, et génère des labels contextuels en français.

import { TREND_LABELS, PERFORMANCE_THRESHOLDS } from '../../constants/chartTheme';
import type { TrendDirection, TrendIntensity } from '../../constants/chartTheme';

export interface TrendResult {
  /** Direction de la tendance */
  direction: TrendDirection;
  /** Intensité de la tendance */
  intensity: TrendIntensity;
  /** Variation en pourcentage (peut être négatif) */
  percentChange: number;
  /** Variation absolue */
  absoluteChange: number;
  /** Label en français pour l'UI */
  label: string;
  /** Détection d'anomalie (variation > 2 écarts-types) */
  isAnomaly: boolean;
}

export interface SmartStatResult {
  value: string | number;
  trend: TrendDirection;
  change: number;
  trendLabel: string;
  isAnomaly: boolean;
}

/**
 * Calcule la tendance entre deux valeurs.
 * @param current Valeur actuelle
 * @param previous Valeur de la période précédente
 * @param context Contexte optionnel pour le label ("vs mois dernier", "vs semaine dernière")
 */
export function calculateTrend(
  current: number,
  previous: number,
  context = 'vs période précédente'
): TrendResult {
  if (previous === 0 && current === 0) {
    return {
      direction: 'neutral',
      intensity: 'slight',
      percentChange: 0,
      absoluteChange: 0,
      label: TREND_LABELS.neutral,
      isAnomaly: false,
    };
  }

  const absoluteChange = current - previous;
  const percentChange = previous !== 0
    ? Math.round((absoluteChange / previous) * 1000) / 10
    : current > 0 ? 100 : 0;

  const absPercent = Math.abs(percentChange);

  let direction: TrendDirection;
  if (percentChange > 0.5) direction = 'up';
  else if (percentChange < -0.5) direction = 'down';
  else direction = 'neutral';

  let intensity: TrendIntensity;
  if (absPercent >= 20) intensity = 'strong';
  else if (absPercent >= 5) intensity = 'moderate';
  else intensity = 'slight';

  const label = direction === 'neutral'
    ? TREND_LABELS.neutral
    : `${TREND_LABELS[direction][intensity]} ${context}`;

  return {
    direction,
    intensity,
    percentChange,
    absoluteChange,
    label,
    isAnomaly: absPercent >= 50,
  };
}

/**
 * Calcule la tendance sur une série temporelle en comparant les N derniers éléments
 * aux N éléments précédents.
 */
export function calculateSeriesTrend(
  series: number[],
  windowSize = 7,
  context = 'vs période précédente'
): TrendResult {
  if (series.length < windowSize * 2) {
    const recent = series.slice(-Math.max(1, Math.floor(series.length / 2)));
    const older = series.slice(0, Math.max(1, Math.floor(series.length / 2)));
    const recentAvg = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
    const olderAvg = older.reduce((a, b) => a + b, 0) / (older.length || 1);
    return calculateTrend(recentAvg, olderAvg, context);
  }

  const currentWindow = series.slice(-windowSize);
  const previousWindow = series.slice(-windowSize * 2, -windowSize);

  const currentAvg = currentWindow.reduce((a, b) => a + b, 0) / windowSize;
  const previousAvg = previousWindow.reduce((a, b) => a + b, 0) / windowSize;

  return calculateTrend(currentAvg, previousAvg, context);
}

/**
 * Détecte les anomalies dans une série de données.
 * Un point est considéré comme anomalie s'il est > 2 écarts-types de la moyenne.
 */
export function detectAnomalies(series: number[], threshold = 2): number[] {
  if (series.length < 3) return [];

  const mean = series.reduce((a, b) => a + b, 0) / series.length;
  const variance = series.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / series.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  return series
    .map((val, idx) => ({ val, idx }))
    .filter(({ val }) => Math.abs(val - mean) > threshold * stdDev)
    .map(({ idx }) => idx);
}

/**
 * Détermine le niveau de performance d'un étudiant
 */
export function getPerformanceLevel(average: number) {
  if (average >= PERFORMANCE_THRESHOLDS.excellent.min) return PERFORMANCE_THRESHOLDS.excellent;
  if (average >= PERFORMANCE_THRESHOLDS.good.min) return PERFORMANCE_THRESHOLDS.good;
  if (average >= PERFORMANCE_THRESHOLDS.average.min) return PERFORMANCE_THRESHOLDS.average;
  if (average >= PERFORMANCE_THRESHOLDS.belowAverage.min) return PERFORMANCE_THRESHOLDS.belowAverage;
  return PERFORMANCE_THRESHOLDS.critical;
}

/**
 * Calcule la "météo" d'une classe basée sur la moyenne et le taux d'absence.
 */
export interface ClassWeather {
  emoji: string;
  label: string;
  color: string;
  score: number; // 0-100
}

export function calculateClassWeather(
  averageGrade: number,
  absenceRate: number,
  submissionRate: number
): ClassWeather {
  // Score composite pondéré
  const gradeScore = Math.min((averageGrade / 20) * 100, 100);
  const absenceScore = Math.max(100 - absenceRate * 20, 0);
  const submissionScore = submissionRate;

  const score = Math.round(gradeScore * 0.5 + absenceScore * 0.25 + submissionScore * 0.25);

  if (score >= 80) return { emoji: '☀️', label: 'Excellente', color: '#10b981', score };
  if (score >= 65) return { emoji: '🌤️', label: 'Bonne', color: '#3b82f6', score };
  if (score >= 50) return { emoji: '⛅', label: 'Moyenne', color: '#f59e0b', score };
  if (score >= 35) return { emoji: '🌧️', label: 'Préoccupante', color: '#f97316', score };
  return { emoji: '⛈️', label: 'Critique', color: '#ef4444', score };
}

/**
 * Détecte les étudiants à risque basé sur des critères multiples.
 */
export interface StudentRisk {
  studentId: string;
  studentName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  reasons: string[];
  color: string;
}

export function detectStudentRisk(student: {
  id: string;
  name: string;
  average: number;
  absences: number;
  paidAmount: number;
  totalAmount: number;
}): StudentRisk {
  const reasons: string[] = [];
  let riskScore = 0;

  // Critère 1 : Moyenne basse
  if (student.average < 8) {
    riskScore += 40;
    reasons.push(`Moyenne critique : ${student.average}/20`);
  } else if (student.average < 10) {
    riskScore += 25;
    reasons.push(`Moyenne insuffisante : ${student.average}/20`);
  } else if (student.average < 12) {
    riskScore += 10;
    reasons.push(`Moyenne passable : ${student.average}/20`);
  }

  // Critère 2 : Absences élevées
  if (student.absences > 10) {
    riskScore += 30;
    reasons.push(`${student.absences} absences enregistrées`);
  } else if (student.absences > 5) {
    riskScore += 15;
    reasons.push(`${student.absences} absences`);
  } else if (student.absences > 3) {
    riskScore += 5;
    reasons.push(`${student.absences} absences`);
  }

  // Critère 3 : Impayés
  const paymentRate = student.totalAmount > 0
    ? (student.paidAmount / student.totalAmount) * 100
    : 100;
  if (paymentRate < 50) {
    riskScore += 30;
    reasons.push(`Paiement : ${Math.round(paymentRate)}% seulement`);
  } else if (paymentRate < 80) {
    riskScore += 15;
    reasons.push(`Paiement incomplet : ${Math.round(paymentRate)}%`);
  }

  riskScore = Math.min(riskScore, 100);

  let riskLevel: StudentRisk['riskLevel'];
  let color: string;
  if (riskScore >= 70) { riskLevel = 'critical'; color = '#ef4444'; }
  else if (riskScore >= 45) { riskLevel = 'high'; color = '#f97316'; }
  else if (riskScore >= 20) { riskLevel = 'medium'; color = '#f59e0b'; }
  else { riskLevel = 'low'; color = '#10b981'; }

  return {
    studentId: student.id,
    studentName: student.name,
    riskLevel,
    riskScore,
    reasons,
    color,
  };
}

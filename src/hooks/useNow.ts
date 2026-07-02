import { useState, useEffect } from 'react';

/**
 * Retourne l'heure actuelle et se met à jour toutes les `intervalMs` ms.
 * Utilisé pour détecter en temps réel si un cours est "en cours" ou "terminé".
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

/**
 * Calcule le statut d'un événement de cours à partir de l'heure actuelle.
 * Renvoie 'termine' | 'en_cours' | 'a_venir'
 */
export function getCourseStatus(
  now: Date,
  eventDate: string | undefined,
  startHour: number,
  durationHours: number
): 'termine' | 'en_cours' | 'a_venir' {
  if (!eventDate) return 'a_venir';

  // Construire les dates de début et de fin du cours
  const startDate = new Date(eventDate);
  startDate.setHours(startHour, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setHours(startHour + durationHours, 0, 0, 0);

  if (now >= endDate) return 'termine';
  if (now >= startDate && now < endDate) return 'en_cours';
  return 'a_venir';
}

/**
 * Calcule le pourcentage de progression d'un cours en cours.
 * Retourne 0 si pas encore commencé, 100 si terminé.
 */
export function getCourseProgress(
  now: Date,
  eventDate: string | undefined,
  startHour: number,
  durationHours: number
): number {
  if (!eventDate) return 0;

  const startDate = new Date(eventDate);
  startDate.setHours(startHour, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setHours(startHour + durationHours, 0, 0, 0);

  if (now >= endDate) return 100;
  if (now < startDate) return 0;

  const elapsed = now.getTime() - startDate.getTime();
  const total = endDate.getTime() - startDate.getTime();
  return Math.round((elapsed / total) * 100);
}

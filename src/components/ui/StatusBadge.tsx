import type { StatusType } from '../../types';

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  actif: { label: 'Actif', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  inactif: { label: 'Inactif', className: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' },
  suspendu: { label: 'Suspendu', className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20' },
  termine: { label: 'Terminé', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
  brouillon: { label: 'Brouillon', className: 'bg-slate-50 text-slate-650 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
  publie: { label: 'Publié', className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' },
  paye: { label: 'Payé', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
  en_retard: { label: 'En retard', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' },
  annule: { label: 'Annulé', className: 'bg-red-50 text-red-650 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' },
  planifie: { label: 'Planifié', className: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20' },
  en_cours: { label: 'En cours', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20' },
};

interface StatusBadgeProps {
  status: StatusType;
  dot?: boolean;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, dot = true, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-slate-100 text-slate-500 border-slate-200' };

  const dotColors: Record<StatusType, string> = {
    actif: 'bg-emerald-500',
    inactif: 'bg-slate-400',
    en_attente: 'bg-amber-500',
    suspendu: 'bg-orange-500',
    termine: 'bg-blue-500',
    brouillon: 'bg-slate-400',
    publie: 'bg-indigo-500',
    paye: 'bg-emerald-500',
    en_retard: 'bg-red-500',
    annule: 'bg-red-400',
    planifie: 'bg-violet-500',
    en_cours: 'bg-sky-500',
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full ${config.className} ${sizeClass}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[status] ?? 'bg-slate-400'}`} />
      )}
      {config.label}
    </span>
  );
}

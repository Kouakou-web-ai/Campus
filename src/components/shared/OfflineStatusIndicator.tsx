import React from 'react';
import { useSyncStore } from '../../store/syncStore';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Clock } from 'lucide-react';

export default function OfflineStatusIndicator() {
  const { isOnline, isSyncing, syncQueueLength, lastSyncTime } = useSyncStore();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm animate-pulse">
        <WifiOff size={14} />
        <span>Mode hors ligne</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
        <RefreshCw size={14} className="animate-spin" />
        <span>Synchronisation en cours...</span>
      </div>
    );
  }

  if (syncQueueLength > 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
        <Clock size={14} className="animate-pulse" />
        <span>{syncQueueLength} en attente</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 shadow-sm"
      title={lastSyncTime ? `Dernière sync : ${lastSyncTime}` : 'Données synchronisées'}
    >
      <CheckCircle2 size={14} />
      <span className="hidden sm:inline">À jour</span>
    </div>
  );
}

import { create } from 'zustand';
import { db } from '../../firebase-config';
import { ref, set, update, remove } from 'firebase/database';
import { dbLocal } from '../lib/db';
import { ToastSuccess, ToastError } from '../controllers/Toast-emitter';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  syncQueueLength: number;
  lastSyncTime: string | null;
  checkConnection: () => Promise<boolean>;
  initConnectionMonitoring: () => () => void;
  addToQueue: (action: 'set' | 'update' | 'remove', path: string, payload: any) => Promise<void>;
  processQueue: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((setStore, getStore) => {
  let isChecking = false;

  const checkConnectionActual = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (!navigator.onLine) return false;
    
    try {
      // Light ping towards manifest.json to check actual internet connectivity
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);
      
      const res = await fetch('/manifest.json', { 
        method: 'HEAD', 
        cache: 'no-store', 
        signal: controller.signal 
      });
      clearTimeout(id);
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  return {
    isOnline: true,
    isSyncing: false,
    syncQueueLength: 0,
    lastSyncTime: null,

    checkConnection: async () => {
      if (isChecking) return getStore().isOnline;
      isChecking = true;
      const online = await checkConnectionActual();
      const queueItems = await dbLocal.sync_queue.toArray();
      setStore({ 
        isOnline: online, 
        syncQueueLength: queueItems.length 
      });
      isChecking = false;
      return online;
    },

    initConnectionMonitoring: () => {
      if (typeof window === 'undefined') return () => {};

      const updateStatus = async () => {
        const online = await getStore().checkConnection();
        if (online) {
          getStore().processQueue().catch(console.error);
        }
      };

      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);

      // Perform a periodic health check every 15 seconds
      const interval = setInterval(async () => {
        const online = await checkConnectionActual();
        const queueItems = await dbLocal.sync_queue.toArray();
        
        setStore((state) => {
          if (state.isOnline !== online) {
            if (online) {
              getStore().processQueue().catch(console.error);
            }
            return { isOnline: online, syncQueueLength: queueItems.length };
          }
          return { syncQueueLength: queueItems.length };
        });
      }, 15000);

      // Set initial status
      dbLocal.sync_queue.count().then(count => {
        setStore({ syncQueueLength: count });
      });
      updateStatus();

      return () => {
        window.removeEventListener('online', updateStatus);
        window.removeEventListener('offline', updateStatus);
        clearInterval(interval);
      };
    },

    addToQueue: async (action, path, payload) => {
      await dbLocal.sync_queue.add({
        action,
        path,
        payload,
        timestamp: Date.now()
      });
      const count = await dbLocal.sync_queue.count();
      setStore({ syncQueueLength: count });
    },

    processQueue: async () => {
      const state = getStore();
      if (state.isSyncing) return;

      const online = await checkConnectionActual();
      if (!online) {
        setStore({ isOnline: false });
        return;
      }

      const queue = await dbLocal.sync_queue.orderBy('timestamp').toArray();
      if (queue.length === 0) {
        setStore({ isOnline: true, syncQueueLength: 0 });
        return;
      }

      setStore({ isSyncing: true, isOnline: true });
      console.log(`[Sync] Démarrage de la synchronisation de ${queue.length} actions hors ligne.`);

      let successCount = 0;
      let hasError = false;

      for (const item of queue) {
        try {
          const dbRef = ref(db, item.path);
          if (item.action === 'set') {
            await set(dbRef, item.payload);
          } else if (item.action === 'update') {
            await update(dbRef, item.payload);
          } else if (item.action === 'remove') {
            await remove(dbRef);
          }
          
          // Delete from offline queue upon successful write
          if (item.id !== undefined) {
            await dbLocal.sync_queue.delete(item.id);
            successCount++;
          }
        } catch (err: any) {
          console.error(`[Sync] Échec du rejeu pour l'action ${item.action} sur ${item.path}:`, err);
          hasError = true;
          // Stop queue processing on network/server errors to preserve write ordering
          break;
        }
      }

      const remainingCount = await dbLocal.sync_queue.count();
      setStore({ 
        isSyncing: false, 
        syncQueueLength: remainingCount,
        lastSyncTime: successCount > 0 ? new Date().toLocaleTimeString('fr-FR') : state.lastSyncTime
      });

      if (successCount > 0) {
        ToastSuccess(`Synchronisation réussie : ${successCount} modifications synchronisées.`);
      }

      if (hasError) {
        ToastError("Certaines modifications hors ligne n'ont pas pu être synchronisées. Nouvel essai dès que possible.");
      }
    }
  };
});

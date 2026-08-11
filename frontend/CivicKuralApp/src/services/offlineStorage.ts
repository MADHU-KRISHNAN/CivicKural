import apiService, { IssueCategory, PriorityLevel } from './api';

export interface OfflineReport {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority?: PriorityLevel;
  latitude: number;
  longitude: number;
  address?: string;
  citizenId: string;
  photoUrl?: string;
  audioBlob?: string; // Base64 audio representation
  createdAt: string;
}

const STORAGE_KEY = 'civickural_offline_reports_v1';
const DB_NAME = 'CivicKuralOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_reports';

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private isSyncing = false;

  constructor() {
    this.initIndexedDB();
    this.setupSyncListener();
  }

  private initIndexedDB() {
    if (typeof window === 'undefined' || !window.indexedDB) return;

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        // Attempt initial sync if online
        if (navigator.onLine) {
          this.syncOfflineReports();
        }
      };
      request.onerror = () => {
        console.warn('IndexedDB failed to open, fallback to localStorage queue');
      };
    } catch (e) {
      console.warn('IndexedDB init error:', e);
    }
  }

  private setupSyncListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Network connection restored. Auto-syncing offline reports...');
        this.syncOfflineReports();
      });
    }
  }

  // Save report to offline queue
  public async saveOfflineReport(report: Omit<OfflineReport, 'id' | 'createdAt'>): Promise<OfflineReport> {
    const offlineItem: OfflineReport = {
      ...report,
      id: 'offline-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      createdAt: new Date().toISOString(),
    };

    if (this.db) {
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db!.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.put(offlineItem);
          tx.oncomplete = () => {
            this.backupToLocalStorage(offlineItem);
            resolve(offlineItem);
          };
          tx.onerror = () => {
            this.backupToLocalStorage(offlineItem);
            resolve(offlineItem);
          };
        } catch {
          this.backupToLocalStorage(offlineItem);
          resolve(offlineItem);
        }
      });
    } else {
      this.backupToLocalStorage(offlineItem);
      return offlineItem;
    }
  }

  private backupToLocalStorage(item: OfflineReport) {
    const queue = this.getLocalStorageQueue();
    queue.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }

  private getLocalStorageQueue(): OfflineReport[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public async getOfflineQueue(): Promise<OfflineReport[]> {
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db!.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => {
            const dbItems = req.result || [];
            const localItems = this.getLocalStorageQueue();
            // Merge & deduplicate by id
            const map = new Map<string, OfflineReport>();
            [...dbItems, ...localItems].forEach((i) => map.set(i.id, i));
            resolve(Array.from(map.values()));
          };
          req.onerror = () => resolve(this.getLocalStorageQueue());
        } catch {
          resolve(this.getLocalStorageQueue());
        }
      });
    }
    return this.getLocalStorageQueue();
  }

  public async syncOfflineReports(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing || !navigator.onLine) {
      return { synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    try {
      const queue = await this.getOfflineQueue();
      if (queue.length === 0) {
        this.isSyncing = false;
        return { synced: 0, failed: 0 };
      }

      console.log(`🔄 Processing ${queue.length} queued offline report(s)...`);

      for (const item of queue) {
        try {
          const descWithVoice = item.audioBlob
            ? `${item.description}\n\n[🎤 Voice Note Attached]`
            : item.description;

          const res = await apiService.createIssue({
            title: item.title,
            description: descWithVoice,
            category: item.category,
            latitude: item.latitude,
            longitude: item.longitude,
            address: item.address,
            photoUrl: item.photoUrl,
            citizenId: item.citizenId,
          });

          if (res.success) {
            await this.removeOfflineReport(item.id);
            synced++;
          } else {
            failed++;
          }
        } catch (err) {
          console.error(`Failed syncing offline report ${item.id}:`, err);
          failed++;
        }
      }

      if (synced > 0) {
        console.log(`✅ Successfully synced ${synced} offline report(s).`);
      }
    } finally {
      this.isSyncing = false;
    }

    return { synced, failed };
  }

  public async removeOfflineReport(id: string): Promise<void> {
    // Remove from IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
      } catch (e) {
        console.warn('IDB delete error:', e);
      }
    }

    // Remove from localStorage fallback
    const queue = this.getLocalStorageQueue().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  }
}

export const offlineStorage = new OfflineStorageService();
export default offlineStorage;

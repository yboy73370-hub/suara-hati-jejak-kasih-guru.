export type PerformanceMediaKind = 'audio' | 'video';

export type PerformanceMediaSource =
  | 'recorded-audio'
  | 'recorded-video'
  | 'uploaded-audio'
  | 'uploaded-video';

export interface StoredPerformanceRecord {
  id: 'misi5_persembahan_akhir';
  mediaKind: PerformanceMediaKind;
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  fileName: string;
  source: PerformanceMediaSource;
  updatedAt: string;
}

const DB_NAME = 'suara_hati_performance_db';
const DB_VERSION = 1;
const STORE_NAME = 'performances';
const SLOT_KEY = 'misi5_persembahan_akhir';

function openPerformanceDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function savePerformanceMedia(
  record: StoredPerformanceRecord
): Promise<boolean> {
  if (!(record.blob instanceof Blob) || record.blob.size === 0) {
    return false;
  }
  const db = await openPerformanceDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
      tx.oncomplete = () => {
        db.close();
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
}

export async function loadPerformanceMedia(): Promise<StoredPerformanceRecord | null> {
  const db = await openPerformanceDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(SLOT_KEY);
      req.onsuccess = () => {
        const result = req.result as StoredPerformanceRecord | undefined;
        if (result && result.blob instanceof Blob && result.blob.size > 0) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
      tx.oncomplete = () => {
        db.close();
      };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

export async function deletePerformanceMedia(): Promise<void> {
  const db = await openPerformanceDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(SLOT_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      tx.oncomplete = () => {
        db.close();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

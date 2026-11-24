export type RecordingSlotId = 'misi4_rakaman_1' | 'misi4_rakaman_2';

export interface StoredAudioRecord {
  id: RecordingSlotId;
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  fileName: string;
  source: 'recorded' | 'uploaded';
  updatedAt: string;
}

const DB_NAME = 'suara_hati_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

function openAudioDb(): Promise<IDBDatabase | null> {
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
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        resolve(null);
      };
      request.onblocked = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export async function saveAudioRecording(record: StoredAudioRecord): Promise<boolean> {
  if (!(record.blob instanceof Blob) || record.blob.size === 0) {
    return false;
  }
  const db = await openAudioDb();
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

export async function loadAudioRecording(
  id: RecordingSlotId
): Promise<StoredAudioRecord | null> {
  const db = await openAudioDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const result = req.result as StoredAudioRecord | undefined;
        if (
          result &&
          result.blob instanceof Blob &&
          result.blob.size > 0
        ) {
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

export async function deleteAudioRecording(id: RecordingSlotId): Promise<void> {
  const db = await openAudioDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
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

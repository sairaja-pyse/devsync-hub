const DB_NAME    = 'devsync-vault';
const DB_VERSION = 1;
const STORE_NAME = 'resources';
const META_KEY   = 'vault_meta';

export type ResourceCategory =
  | 'Resume'
  | 'Course Notes'
  | 'Screenshots'
  | 'Certificates'
  | 'Reference'
  | 'Other';

export interface ResourceMeta {
  id: string;
  name: string;
  mimeType: string;
  category: ResourceCategory;
  size: number;
  dateAdded: string;
  pinned: boolean;
  thumbnail?: string; // base64 data-URL for images (generated on upload)
}

/* ── IndexedDB helpers ── */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess      = () => resolve(req.result);
    req.onerror        = () => reject(req.error);
  });
}

/* ── Metadata helpers (localStorage — fast, synchronous) ── */

export function getAllMeta(): ResourceMeta[] {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function persistMeta(meta: ResourceMeta[]): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

/* ── Thumbnail generator for images ── */

async function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 320;
      const scale  = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(''); };
    img.src = url;
  });
}

/* ── Public API ── */

export async function saveResource(
  file: File,
  category: ResourceCategory,
): Promise<ResourceMeta> {
  const id = crypto.randomUUID();
  const db = await openDB();

  // Store raw file blob
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });

  const thumbnail = file.type.startsWith('image/')
    ? await generateThumbnail(file)
    : undefined;

  const meta: ResourceMeta = {
    id,
    name: file.name,
    mimeType: file.type,
    category,
    size: file.size,
    dateAdded: new Date().toISOString(),
    pinned: false,
    thumbnail,
  };

  const all = getAllMeta();
  all.unshift(meta);
  persistMeta(all);
  return meta;
}

export async function getResourceBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  });
}

export function updateMeta(id: string, updates: Partial<ResourceMeta>): ResourceMeta[] {
  const all = getAllMeta();
  const idx = all.findIndex((m) => m.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updates };
    persistMeta(all);
  }
  return [...all];
}

export async function deleteResource(id: string): Promise<ResourceMeta[]> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
  const all = getAllMeta().filter((m) => m.id !== id);
  persistMeta(all);
  return all;
}

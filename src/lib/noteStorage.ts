import {
  collection, doc, setDoc, deleteDoc, getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Note {
  id: string;
  title: string;
  contentJson: string;  // TipTap JSON serialized
  contentText: string;  // Plain text for search / preview
  folderId: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  colorClass: string;  // e.g. 'apple-icon-blue'
  isBuiltin?: boolean;
}

export const BUILTIN_FOLDERS: NoteFolder[] = [
  { id: 'personal', name: 'Personal', colorClass: 'apple-icon-blue',   isBuiltin: true },
  { id: 'work',     name: 'Work',     colorClass: 'apple-icon-orange',  isBuiltin: true },
  { id: 'ideas',    name: 'Ideas',    colorClass: 'apple-icon-yellow',  isBuiltin: true },
];

function notesKey(uid: string)   { return `devsync_notes_v1_${uid}`; }
function foldersKey(uid: string) { return `devsync_note_folders_v1_${uid}`; }

// ── localStorage helpers (fast, synchronous — used as local cache) ────────────

export function getAllNotes(uid: string): Note[] {
  try {
    return JSON.parse(localStorage.getItem(notesKey(uid)) ?? '[]');
  } catch {
    return [];
  }
}

export function getAllFolders(uid: string): NoteFolder[] {
  try {
    const raw = localStorage.getItem(foldersKey(uid));
    const custom: NoteFolder[] = raw ? JSON.parse(raw) : [];
    return [...BUILTIN_FOLDERS, ...custom];
  } catch {
    return BUILTIN_FOLDERS;
  }
}

function persistNotes(uid: string, notes: Note[]) {
  localStorage.setItem(notesKey(uid), JSON.stringify(notes));
}

/** Export so Notes page can hydrate cache after Firestore load */
export function cacheNotes(uid: string, notes: Note[]) {
  persistNotes(uid, notes);
}

function persistFolders(uid: string, folders: NoteFolder[]) {
  const custom = folders.filter(f => !BUILTIN_FOLDERS.some(b => b.id === f.id));
  localStorage.setItem(foldersKey(uid), JSON.stringify(custom));
}

export function saveNote(uid: string, note: Note) {
  const notes = getAllNotes(uid);
  const idx = notes.findIndex(n => n.id === note.id);
  if (idx >= 0) notes[idx] = note;
  else notes.push(note);
  persistNotes(uid, notes);
}

export function deleteNote(uid: string, id: string) {
  persistNotes(uid, getAllNotes(uid).filter(n => n.id !== id));
}

export function createNote(folderId = 'personal'): Note {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: '',
    contentJson: '',
    contentText: '',
    folderId,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function saveFolder(uid: string, folder: NoteFolder) {
  const folders = getAllFolders(uid);
  const idx = folders.findIndex(f => f.id === folder.id);
  if (idx >= 0) folders[idx] = folder;
  else folders.push(folder);
  persistFolders(uid, folders);
}

export function deleteFolder(uid: string, id: string) {
  persistFolders(uid, getAllFolders(uid).filter(f => f.id !== id));
  const notes = getAllNotes(uid).map(n =>
    n.folderId === id ? { ...n, folderId: 'personal' } : n
  );
  persistNotes(uid, notes);
}

// ── Firestore sync helpers (async, fire-and-forget — source of truth) ─────────

export async function syncNoteToFirestore(uid: string, note: Note): Promise<void> {
  try {
    await setDoc(doc(db, 'users', uid, 'notes', note.id), note);
  } catch (e) {
    console.warn('[Notes] Firestore sync failed:', e);
  }
}

export async function deleteNoteFromFirestore(uid: string, id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', uid, 'notes', id));
  } catch (e) {
    console.warn('[Notes] Firestore delete failed:', e);
  }
}

export async function loadNotesFromFirestore(uid: string): Promise<Note[]> {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'notes'));
    return snap.docs.map(d => d.data() as Note);
  } catch {
    return [];
  }
}

export async function syncFolderToFirestore(uid: string, folder: NoteFolder): Promise<void> {
  if (folder.isBuiltin) return; // never persist built-ins
  try {
    await setDoc(doc(db, 'users', uid, 'note_folders', folder.id), folder);
  } catch (e) {
    console.warn('[Notes] Firestore folder sync failed:', e);
  }
}

export async function deleteFolderFromFirestore(uid: string, id: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'users', uid, 'note_folders', id));
    // Move notes in this folder to 'personal'
    const notesSnap = await getDocs(collection(db, 'users', uid, 'notes'));
    notesSnap.docs.forEach(d => {
      if ((d.data() as Note).folderId === id) {
        batch.update(d.ref, { folderId: 'personal' });
      }
    });
    await batch.commit();
  } catch (e) {
    console.warn('[Notes] Firestore folder delete failed:', e);
  }
}

export async function loadFoldersFromFirestore(uid: string): Promise<NoteFolder[]> {
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'note_folders'));
    return snap.docs.map(d => d.data() as NoteFolder).filter(f => !f.isBuiltin);
  } catch {
    return [];
  }
}

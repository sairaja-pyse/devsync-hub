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

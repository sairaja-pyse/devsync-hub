import {
  useState, useEffect, useCallback, useRef, useMemo, memo,
} from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { useTheme } from 'next-themes';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import {
  Plus, Trash2, Search, X, Pin, PinOff,
  FolderPlus, ChevronLeft,
  NotebookText, StickyNote, Folder, MoreVertical,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Note, NoteFolder, BUILTIN_FOLDERS,
  getAllNotes, getAllFolders,
  saveNote, deleteNote as persistDeleteNote,
  createNote, saveFolder, deleteFolder as persistDeleteFolder,
  syncNoteToFirestore, deleteNoteFromFirestore, loadNotesFromFirestore,
  syncFolderToFirestore, deleteFolderFromFirestore, loadFoldersFromFirestore,
  cacheNotes,
} from '@/lib/noteStorage';
import { useAuth } from '@/contexts/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const FOLDER_COLOR_OPTIONS = [
  { class: 'apple-icon-blue',   label: 'Blue'   },
  { class: 'apple-icon-green',  label: 'Green'  },
  { class: 'apple-icon-teal',   label: 'Teal'   },
  { class: 'apple-icon-yellow', label: 'Yellow' },
  { class: 'apple-icon-orange', label: 'Orange' },
  { class: 'apple-icon-red',    label: 'Red'    },
  { class: 'apple-icon-pink',   label: 'Pink'   },
  { class: 'apple-icon-purple', label: 'Purple' },
  { class: 'apple-icon-indigo', label: 'Indigo' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNoteDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date))     return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date))  return format(date, 'EEEE');
  return format(date, 'MM/dd/yyyy');
}

// ─── NoteItem ─────────────────────────────────────────────────────────────────

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

const NoteItem = memo(function NoteItem({
  note, isSelected, onSelect, onTogglePin, onDelete,
}: NoteItemProps) {
  const preview = note.contentText.slice(0, 120).replace(/\n+/g, ' ').trim();
  return (
    <div
      onClick={() => onSelect(note.id)}
      className={cn(
        'group px-4 py-3 cursor-pointer transition-all duration-150 relative border-b border-border/40 last:border-0',
        isSelected
          ? 'bg-[#007AFF]/8 dark:bg-[#0A84FF]/10'
          : 'hover:bg-secondary/50',
      )}
    >
      {note.pinned && (
        <Pin className="absolute top-3 right-3 h-3 w-3 text-[#FF9500] fill-[#FF9500]" />
      )}
      <p
        className={cn(
          'text-[14px] font-semibold truncate pr-4',
          isSelected ? 'text-[#007AFF] dark:text-[#0A84FF]' : 'text-foreground',
        )}
        style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }}
      >
        {note.title || 'Untitled'}
      </p>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[11px] text-muted-foreground shrink-0">
          {formatNoteDate(note.updatedAt)}
        </span>
        {preview && (
          <>
            <span className="text-[11px] text-muted-foreground/50">·</span>
            <span className="text-[11px] text-muted-foreground/70 truncate">{preview}</span>
          </>
        )}
      </div>
      <div
        className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex"
        onClick={e => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all">
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onTogglePin(note.id)}>
              {note.pinned
                ? <><PinOff className="h-4 w-4 mr-2" />Unpin</>
                : <><Pin    className="h-4 w-4 mr-2" />Pin Note</>
              }
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(note.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

// ─── FolderItem ───────────────────────────────────────────────────────────────

interface FolderItemProps {
  folder?: NoteFolder;
  isAll?: boolean;
  isActive: boolean;
  count: number;
  onSelect: (id: string) => void;
  onDeleteFolder?: (id: string) => void;
}

const FolderItem = memo(function FolderItem({
  folder, isAll = false, isActive, count, onSelect, onDeleteFolder,
}: FolderItemProps) {
  const id = isAll ? 'all' : folder!.id;
  return (
    <div
      onClick={() => onSelect(id)}
      className={cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150',
        isActive ? 'bg-[#007AFF]/10 dark:bg-[#0A84FF]/15' : 'hover:bg-secondary/60',
      )}
    >
      <div className={cn(
        'h-7 w-7 squircle-xs flex items-center justify-center shrink-0 transition-all',
        isActive ? (isAll ? 'bg-[#8E8E93]' : folder!.colorClass) : 'bg-secondary/80',
      )}>
        {isAll
          ? <NotebookText className={cn('h-3.5 w-3.5', isActive ? 'text-white' : 'text-muted-foreground')} strokeWidth={2} />
          : <Folder className={cn('h-3.5 w-3.5', isActive ? 'text-white' : 'text-muted-foreground')} strokeWidth={isActive ? 2.5 : 2} />
        }
      </div>
      <span
        className={cn(
          'flex-1 text-[14px] font-medium truncate',
          isActive ? 'text-[#007AFF] dark:text-[#0A84FF]' : 'text-foreground/80',
        )}
        style={{ fontFamily: '-apple-system, "SF Pro Text", sans-serif' }}
      >
        {isAll ? 'All Notes' : folder!.name}
      </span>
      <span className="text-[12px] text-muted-foreground/60 tabular-nums">{count}</span>
      {folder && !folder.isBuiltin && !isAll && onDeleteFolder && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
          className="hidden group-hover:flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/50 hover:text-destructive transition-all"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
});

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Notes() {
  const { user } = useAuth();
  const uid = user?.uid ?? 'guest';
  const { resolvedTheme } = useTheme();

  const [notes,   setNotes]   = useState<Note[]>([]);
  const [folders, setFolders] = useState<NoteFolder[]>(BUILTIN_FOLDERS);

  useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid;
    setNotes(getAllNotes(uid));
    setFolders(getAllFolders(uid));
    loadNotesFromFirestore(uid).then(firestoreNotes => {
      if (firestoreNotes.length > 0) {
        cacheNotes(uid, firestoreNotes);
        setNotes(firestoreNotes);
      }
    });
    loadFoldersFromFirestore(uid).then(customFolders => {
      for (const f of customFolders) saveFolder(uid, f);
      setFolders(getAllFolders(uid));
    });
  }, [user?.uid]);

  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedNoteId,   setSelectedNoteId]   = useState<string | null>(null);
  const [search,     setSearch]     = useState('');
  const [noteTitle,  setNoteTitle]  = useState('');
  const [mobileView, setMobileView] = useState<'folders' | 'list' | 'editor'>('list');

  const [showNewFolder,      setShowNewFolder]      = useState(false);
  const [newFolderName,      setNewFolderName]      = useState('');
  const [newFolderColor,     setNewFolderColor]     = useState('apple-icon-blue');
  const [deleteNoteTarget,   setDeleteNoteTarget]   = useState<string | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null);

  // Sidebar visibility (desktop)
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [listOpen,    setListOpen]    = useState(true);

  const titleInputRef  = useRef<HTMLInputElement>(null);
  const saveTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<{ id: string; title: string; contentJson: string; contentText: string } | null>(null);
  // Prevents saving the very first onChange fired by Excalidraw on mount (initial data load)
  const isInitialChangeRef = useRef(true);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedNote = useMemo(
    () => notes.find(n => n.id === selectedNoteId) ?? null,
    [notes, selectedNoteId],
  );

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notes.length };
    for (const n of notes) counts[n.folderId] = (counts[n.folderId] ?? 0) + 1;
    return counts;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let list = selectedFolderId === 'all'
      ? [...notes]
      : notes.filter(n => n.folderId === selectedFolderId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) || n.contentText.toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, selectedFolderId, search]);

  const pinnedNotes   = filteredNotes.filter(n => n.pinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.pinned);

  // ── Auto-save ──────────────────────────────────────────────────────────────
  const flushPendingSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (!pendingSaveRef.current) return;
    const { id, title, contentJson, contentText } = pendingSaveRef.current;
    const now = new Date().toISOString();
    setNotes(prev => {
      const note = prev.find(n => n.id === id);
      if (!note) return prev;
      const updated = { ...note, title, contentJson, contentText, updatedAt: now };
      saveNote(uid, updated);
      if (user?.uid) syncNoteToFirestore(uid, updated);
      return prev.map(n => n.id === id ? updated : n);
    });
  }, [uid, user?.uid]);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushPendingSave, 700);
  }, [flushPendingSave]);

  // ── Note selection → init pendingSaveRef ──────────────────────────────────
  useEffect(() => {
    flushPendingSave();
    isInitialChangeRef.current = true;

    if (!selectedNoteId) {
      pendingSaveRef.current = null;
      setNoteTitle('');
      return;
    }

    const note = getAllNotes(uid).find(n => n.id === selectedNoteId);
    if (!note) return;

    pendingSaveRef.current = {
      id: note.id, title: note.title,
      contentJson: note.contentJson, contentText: note.contentText,
    };
    setNoteTitle(note.title);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId]);

  // ── Excalidraw onChange ────────────────────────────────────────────────────
  const handleExcalidrawChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: readonly any[], appState: any, files: any) => {
      // Skip the first fire — that's just Excalidraw loading the initial data
      if (isInitialChangeRef.current) {
        isInitialChangeRef.current = false;
        return;
      }
      if (!pendingSaveRef.current) return;

      // collaborators is a Map — not JSON-serializable, drop it
      const { collaborators: _c, ...serializableState } = appState;
      const activeCount = elements.filter((e: any) => !e.isDeleted).length;

      pendingSaveRef.current.contentJson = JSON.stringify({ elements, appState: serializableState, files });
      pendingSaveRef.current.contentText = `Canvas · ${activeCount} element${activeCount !== 1 ? 's' : ''}`;
      scheduleSave();
    },
    [scheduleSave],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleNewNote = useCallback(() => {
    const fid  = selectedFolderId === 'all' ? 'personal' : selectedFolderId;
    const note = createNote(fid);
    saveNote(uid, note);
    if (user?.uid) syncNoteToFirestore(uid, note);
    setNotes(prev => [note, ...prev]);
    setSelectedNoteId(note.id);
    if (window.innerWidth < 768) setMobileView('editor');
    setTimeout(() => titleInputRef.current?.focus(), 80);
  }, [selectedFolderId, uid, user?.uid]);

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
    if (window.innerWidth < 768) setMobileView('editor');
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    persistDeleteNote(uid, id);
    if (user?.uid) deleteNoteFromFirestore(uid, id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      pendingSaveRef.current = null;
      if (window.innerWidth < 768) setMobileView('list');
    }
    toast.success('Note deleted');
    setDeleteNoteTarget(null);
  }, [selectedNoteId, uid, user?.uid]);

  const handleTogglePin = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
      const note    = updated.find(n => n.id === id);
      if (note) {
        saveNote(uid, note);
        if (user?.uid) syncNoteToFirestore(uid, note);
      }
      return updated;
    });
  }, [uid, user?.uid]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNoteTitle(val);
    if (pendingSaveRef.current) {
      pendingSaveRef.current.title = val;
      scheduleSave();
    }
  };

  const handleSelectFolder = useCallback((id: string) => {
    setSelectedFolderId(id);
    setSelectedNoteId(null);
    setSearch('');
    if (window.innerWidth < 768) setMobileView('list');
  }, []);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const folder: NoteFolder = {
      id: crypto.randomUUID(),
      name: newFolderName.trim(),
      colorClass: newFolderColor,
    };
    saveFolder(uid, folder);
    if (user?.uid) syncFolderToFirestore(uid, folder);
    setFolders(getAllFolders(uid));
    setNewFolderName('');
    setNewFolderColor('apple-icon-blue');
    setShowNewFolder(false);
    toast.success(`Folder "${folder.name}" created`);
  };

  const handleDeleteFolder = useCallback((id: string) => {
    persistDeleteFolder(uid, id);
    if (user?.uid) deleteFolderFromFirestore(uid, id);
    setFolders(getAllFolders(uid));
    setNotes(getAllNotes(uid));
    if (selectedFolderId === id) setSelectedFolderId('all');
    toast.success('Folder deleted');
    setDeleteFolderTarget(null);
  }, [selectedFolderId, uid, user?.uid]);

  const getInitialData = useCallback((note: Note) => {
    if (!note.contentJson) return undefined;
    try {
      return JSON.parse(note.contentJson);
    } catch {
      return undefined;
    }
  }, []);

  const currentFolderName = selectedFolderId === 'all'
    ? 'All Notes'
    : (folders.find(f => f.id === selectedFolderId)?.name ?? 'Notes');

  const excalidrawTheme = resolvedTheme === 'dark' ? 'dark' : 'light';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in">

      {/* Mobile back bar */}
      {mobileView === 'editor' && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b md:hidden shrink-0">
          <button
            onClick={() => { flushPendingSave(); setMobileView('list'); }}
            className="flex items-center gap-1 text-[#007AFF] text-[15px] font-medium"
          >
            <ChevronLeft className="h-5 w-5" />{currentFolderName}
          </button>
        </div>
      )}
      {mobileView === 'list' && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b md:hidden shrink-0">
          <button
            onClick={() => setMobileView('folders')}
            className="flex items-center gap-1 text-[#007AFF] text-[15px] font-medium"
          >
            <ChevronLeft className="h-5 w-5" />Folders
          </button>
        </div>
      )}

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Folders panel ── */}
        <aside className={cn(
          'flex flex-col border-r shrink-0 apple-vibrancy overflow-hidden transition-all duration-200',
          'border-r-[rgba(60,60,67,0.18)] dark:border-r-[rgba(84,84,88,0.36)]',
          mobileView === 'folders' ? 'flex w-full' : 'hidden',
          foldersOpen ? 'lg:flex lg:w-52' : 'lg:w-0 lg:border-r-0',
        )}>
          <div className="flex items-center justify-between px-4 pt-5 pb-3 min-w-[13rem]">
            <h2 className="text-[22px] font-bold"
              style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.4px' }}>
              Notes
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowNewFolder(true)}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-[#007AFF] hover:bg-[#007AFF]/10 transition-all"
                title="New Folder">
                <FolderPlus className="h-4 w-4" strokeWidth={2} />
              </button>
              <button onClick={() => setFoldersOpen(false)}
                className="h-8 w-8 rounded-xl hidden lg:flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all"
                title="Close folders">
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="px-2 pb-1">
            <FolderItem isAll isActive={selectedFolderId === 'all'}
              count={folderCounts.all ?? 0} onSelect={handleSelectFolder} />
          </div>
          <div className="px-2 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60 px-3 mb-1 mt-2">
              My Folders
            </p>
            {folders.map(folder => (
              <FolderItem
                key={folder.id}
                folder={folder}
                isActive={selectedFolderId === folder.id}
                count={folderCounts[folder.id] ?? 0}
                onSelect={handleSelectFolder}
                onDeleteFolder={(id) => setDeleteFolderTarget(id)}
              />
            ))}
          </div>
        </aside>

        {/* ── Notes list panel ── */}
        <div className={cn(
          'flex flex-col border-r shrink-0 overflow-hidden transition-all duration-200',
          'border-r-[rgba(60,60,67,0.18)] dark:border-r-[rgba(84,84,88,0.36)]',
          mobileView === 'list' ? 'flex w-full' : 'hidden',
          listOpen ? 'md:flex md:w-64 lg:w-72' : 'md:w-0 md:border-r-0',
        )}>
          <div className="px-4 pt-5 pb-3 shrink-0 min-w-[16rem]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[19px] font-bold truncate"
                  style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.3px' }}>
                  {currentFolderName}
                </h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleNewNote}
                  className="h-8 w-8 rounded-xl flex items-center justify-center bg-[#007AFF] text-white hover:bg-[#007AFF]/90 transition-all"
                  style={{ boxShadow: '0 2px 8px rgba(0,122,255,0.35)' }}
                  title="New Note">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <button onClick={() => setListOpen(false)}
                  className="h-8 w-8 rounded-xl hidden md:flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all"
                  title="Close list">
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search notes…"
                className="w-full h-8 pl-8 pr-8 rounded-xl bg-secondary/60 text-[13px] border-0 outline-none focus:ring-1 focus:ring-[#007AFF]/30 placeholder:text-muted-foreground/50 transition-all" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted-foreground/30 flex items-center justify-center">
                  <X className="h-2.5 w-2.5 text-background" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 px-6 text-center">
                <div className="h-12 w-12 squircle-sm bg-secondary/80 flex items-center justify-center opacity-40">
                  <StickyNote className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-[13px] text-muted-foreground/60">
                  {search ? 'No notes match your search' : 'No notes yet. Tap + to create one.'}
                </p>
              </div>
            ) : (
              <>
                {pinnedNotes.length > 0 && (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50 px-4 pt-2 pb-1">
                      Pinned
                    </p>
                    {pinnedNotes.map(note => (
                      <NoteItem key={note.id} note={note}
                        isSelected={note.id === selectedNoteId}
                        onSelect={handleSelectNote}
                        onTogglePin={handleTogglePin}
                        onDelete={(id) => setDeleteNoteTarget(id)}
                      />
                    ))}
                    {unpinnedNotes.length > 0 && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50 px-4 pt-3 pb-1">
                        Notes
                      </p>
                    )}
                  </>
                )}
                {unpinnedNotes.map(note => (
                  <NoteItem key={note.id} note={note}
                    isSelected={note.id === selectedNoteId}
                    onSelect={handleSelectNote}
                    onTogglePin={handleTogglePin}
                    onDelete={(id) => setDeleteNoteTarget(id)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Canvas panel ── */}
        <div className={cn(
          'flex-1 flex flex-col overflow-hidden',
          mobileView === 'editor' ? 'flex' : 'hidden',
          'md:flex',
        )}>
          {!selectedNote ? (
            <div className="flex flex-col h-full">
              {/* Re-open buttons when no note selected */}
              {(!foldersOpen || !listOpen) && (
                <div className="flex items-center gap-1 px-3 py-2 border-b shrink-0">
                  {!foldersOpen && (
                    <button onClick={() => setFoldersOpen(true)}
                      className="h-7 w-7 rounded-lg hidden lg:flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all"
                      title="Open folders">
                      <PanelLeftOpen className="h-4 w-4" />
                    </button>
                  )}
                  {!listOpen && (
                    <button onClick={() => setListOpen(true)}
                      className="h-7 w-7 rounded-lg hidden md:flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all"
                      title="Open note list">
                      <PanelLeftOpen className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-8">
              <div className="h-20 w-20 squircle-lg apple-icon-yellow flex items-center justify-center"
                style={{ boxShadow: '0 8px 24px rgba(255,204,0,0.3)' }}>
                <StickyNote className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[20px] font-bold"
                  style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.3px' }}>
                  No Canvas Selected
                </h3>
                <p className="text-[14px] text-muted-foreground mt-1">
                  Choose a note from the list, or create a new one.
                </p>
              </div>
              <button onClick={handleNewNote}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-[14px] font-semibold hover:bg-[#007AFF]/90 transition-all"
                style={{ boxShadow: '0 4px 12px rgba(0,122,255,0.35)' }}>
                <Plus className="h-4 w-4" strokeWidth={2.5} />New Canvas
              </button>
            </div>
            </div>
          ) : (
            <>
              {/* Title bar */}
              <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0 bg-background/80 backdrop-blur-sm">
                {/* Sidebar re-open buttons (desktop only) */}
                {!foldersOpen && (
                  <button
                    onClick={() => setFoldersOpen(true)}
                    className="h-7 w-7 rounded-lg hidden lg:flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all shrink-0"
                    title="Open folders">
                    <PanelLeftOpen className="h-4 w-4" />
                  </button>
                )}
                {!listOpen && (
                  <button
                    onClick={() => setListOpen(true)}
                    className="h-7 w-7 rounded-lg hidden md:flex items-center justify-center text-muted-foreground hover:bg-secondary transition-all shrink-0"
                    title="Open note list">
                    <PanelLeftOpen className="h-4 w-4" />
                  </button>
                )}

                <input
                  ref={titleInputRef}
                  value={noteTitle}
                  onChange={handleTitleChange}
                  placeholder="Untitled"
                  className="flex-1 bg-transparent text-[17px] font-semibold outline-none placeholder:text-muted-foreground/30 min-w-0"
                  style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.3px' }}
                />
                <span className="text-[12px] text-muted-foreground/50 shrink-0">
                  {formatNoteDate(selectedNote.updatedAt)}
                </span>
                <button
                  onClick={() => handleTogglePin(selectedNote.id)}
                  className={cn('h-7 w-7 rounded-lg flex items-center justify-center transition-all shrink-0',
                    selectedNote.pinned
                      ? 'text-[#FF9500] bg-[#FF9500]/10'
                      : 'text-muted-foreground hover:bg-secondary')}
                  title={selectedNote.pinned ? 'Unpin' : 'Pin'}>
                  <Pin className={cn('h-3.5 w-3.5', selectedNote.pinned && 'fill-current')} strokeWidth={selectedNote.pinned ? 0 : 2} />
                </button>
                <button
                  onClick={() => setDeleteNoteTarget(selectedNote.id)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                  title="Delete">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>

              {/* Excalidraw canvas — absolute inset-0 ensures Excalidraw gets a definite
                  pixel rect so pointer-event coordinates (eraser, laser) are accurate */}
              <div className="flex-1 relative min-h-0">
                <div className="absolute inset-0">
                <Excalidraw
                  key={selectedNote.id}
                  initialData={getInitialData(selectedNote)}
                  onChange={handleExcalidrawChange}
                  theme={excalidrawTheme}
                  UIOptions={{
                    canvasActions: {
                      saveToActiveFile: false,
                      loadScene: false,
                      export: { saveFileToDisk: true },
                    },
                  }}
                />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── New Folder Dialog ── */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>New Folder</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              autoFocus />
            <div>
              <p className="text-[12px] text-muted-foreground mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLOR_OPTIONS.map(opt => (
                  <button key={opt.class} onClick={() => setNewFolderColor(opt.class)}
                    title={opt.label}
                    className={cn('h-8 w-8 rounded-full transition-all', opt.class,
                      newFolderColor === opt.class ? 'ring-2 ring-offset-2 ring-[#007AFF] scale-110' : 'hover:scale-105')} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Note ── */}
      <AlertDialog open={!!deleteNoteTarget} onOpenChange={v => !v && setDeleteNoteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Canvas?</AlertDialogTitle>
            <AlertDialogDescription>This canvas will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteNoteTarget && handleDeleteNote(deleteNoteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Folder ── */}
      <AlertDialog open={!!deleteFolderTarget} onOpenChange={v => !v && setDeleteFolderTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription>Notes inside will be moved to Personal.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFolderTarget && handleDeleteFolder(deleteFolderTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

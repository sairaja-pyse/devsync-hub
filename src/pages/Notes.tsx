import {
  useState, useEffect, useCallback, useRef, useMemo, useReducer, memo,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ListChecks,
  Quote, Code, Minus, Highlighter, Palette,
  Undo2, Redo2,
  Plus, Trash2, Search, X, Pin, PinOff,
  FolderPlus, ChevronLeft, FileCode,
  NotebookText, StickyNote, Folder, MoreVertical,
  ImageIcon, Pencil, Eraser, ChevronDown,
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
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Note, NoteFolder, BUILTIN_FOLDERS,
  getAllNotes, getAllFolders,
  saveNote, deleteNote as persistDeleteNote,
  createNote, saveFolder, deleteFolder as persistDeleteFolder,
} from '@/lib/noteStorage';
import { useAuth } from '@/contexts/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const HIGHLIGHT_COLORS = [
  { label: 'Yellow',  color: 'rgba(255,204,0,0.42)',  dot: '#FFCC00' },
  { label: 'Green',   color: 'rgba(52,199,89,0.38)',  dot: '#34C759' },
  { label: 'Pink',    color: 'rgba(255,45,85,0.3)',   dot: '#FF2D55' },
  { label: 'Purple',  color: 'rgba(175,82,222,0.3)',  dot: '#AF52DE' },
  { label: 'Orange',  color: 'rgba(255,149,0,0.38)',  dot: '#FF9500' },
  { label: 'Blue',    color: 'rgba(0,122,255,0.25)',  dot: '#007AFF' },
];

const TEXT_COLORS = [
  { label: 'Default', color: null,      dot: null       },
  { label: 'Red',     color: '#FF3B30', dot: '#FF3B30'  },
  { label: 'Orange',  color: '#FF9500', dot: '#FF9500'  },
  { label: 'Yellow',  color: '#CC9900', dot: '#FFCC00'  },
  { label: 'Green',   color: '#28A745', dot: '#34C759'  },
  { label: 'Blue',    color: '#007AFF', dot: '#007AFF'  },
  { label: 'Purple',  color: '#AF52DE', dot: '#AF52DE'  },
  { label: 'Pink',    color: '#FF2D55', dot: '#FF2D55'  },
  { label: 'Brown',   color: '#A2845E', dot: '#A2845E'  },
  { label: 'Gray',    color: '#8E8E93', dot: '#8E8E93'  },
];

const SKETCH_COLORS = [
  '#1C1C1E', '#FF3B30', '#FF9500', '#FFCC00',
  '#34C759', '#007AFF', '#AF52DE', '#FF2D55',
];

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

async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX = 900;
        const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Sketch Pad ───────────────────────────────────────────────────────────────

const SKETCH_SIZES = [2, 4, 8, 14];

function SketchPad({
  onInsert, onClose,
}: {
  onInsert: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef   = useRef({ x: 0, y: 0 });
  const [tool,  setTool]  = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#1C1C1E');
  const [size,  setSize]  = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    lastPosRef.current   = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth   = tool === 'eraser' ? size * 4 : size;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.stroke();
    lastPosRef.current = pos;
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleInsert = () => {
    const dataUrl = canvasRef.current!.toDataURL('image/png');
    onInsert(dataUrl);
  };

  return (
    <div className="space-y-3">
      {/* Tools + clear */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setTool('pen')}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all',
              tool === 'pen' ? 'bg-[#007AFF] text-white' : 'bg-secondary text-foreground')}>
            <Pencil className="h-3.5 w-3.5" /> Pen
          </button>
          <button onClick={() => setTool('eraser')}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all',
              tool === 'eraser' ? 'bg-[#007AFF] text-white' : 'bg-secondary text-foreground')}>
            <Eraser className="h-3.5 w-3.5" /> Eraser
          </button>
        </div>
        <button onClick={clearCanvas}
          className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-secondary text-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
          Clear
        </button>
      </div>

      {/* Colors + sizes */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {SKETCH_COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen'); }}
              className={cn('h-7 w-7 rounded-full transition-all shrink-0',
                color === c && tool === 'pen' ? 'ring-2 ring-offset-2 ring-[#007AFF] scale-110' : 'hover:scale-105')}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 ml-1">
          {SKETCH_SIZES.map(s => (
            <button key={s} onClick={() => setSize(s)}
              className={cn('rounded-full bg-foreground/80 transition-all shrink-0',
                size === s ? 'ring-2 ring-offset-2 ring-[#007AFF]' : 'opacity-40 hover:opacity-70')}
              style={{ width: s * 2.5 + 4, height: s * 2.5 + 4 }}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={360}
        className="w-full border border-border rounded-xl cursor-crosshair touch-none bg-white"
        style={{ aspectRatio: '600/360' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleInsert}
          className="bg-[#007AFF] text-white hover:bg-[#007AFF]/90"
          style={{ boxShadow: '0 2px 8px rgba(0,122,255,0.35)' }}>
          Insert Drawing
        </Button>
      </div>
    </div>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

type TipTapEditor = ReturnType<typeof useEditor>;

function TBtn({
  title, active, onApply, children,
}: {
  title: string; active?: boolean; onApply: () => void; children: React.ReactNode;
}) {
  return (
    <button title={title}
      onMouseDown={(e) => { e.preventDefault(); onApply(); }}
      className={cn(
        'h-7 w-7 rounded-lg flex items-center justify-center transition-all shrink-0',
        active
          ? 'bg-[#007AFF]/15 text-[#007AFF] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF]'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}>
      {children}
    </button>
  );
}

function TDivider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

function EditorToolbar({
  editor,
  onImageClick,
  onSketchClick,
}: {
  editor: TipTapEditor;
  onImageClick: () => void;
  onSketchClick: () => void;
}) {
  // Force re-render when editor state changes (active marks, selection, etc.)
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    if (!editor) return;
    const handler = () => forceUpdate();
    editor.on('selectionUpdate', handler);
    editor.on('transaction',     handler);
    return () => {
      editor.off('selectionUpdate', handler);
      editor.off('transaction',     handler);
    };
  }, [editor]);

  if (!editor) return null;
  const ic = 'h-3.5 w-3.5';

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b overflow-x-auto scrollbar-none shrink-0">
      {/* Undo/Redo */}
      <TBtn title="Undo (⌘Z)" onApply={() => editor.chain().focus().undo().run()}>
        <Undo2 className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Redo (⌘⇧Z)" onApply={() => editor.chain().focus().redo().run()}>
        <Redo2 className={ic} strokeWidth={2} />
      </TBtn>
      <TDivider />

      {/* Text style */}
      <TBtn title="Bold (⌘B)" active={editor.isActive('bold')}
        onApply={() => editor.chain().focus().toggleBold().run()}>
        <Bold className={ic} strokeWidth={2.5} />
      </TBtn>
      <TBtn title="Italic (⌘I)" active={editor.isActive('italic')}
        onApply={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Underline (⌘U)" active={editor.isActive('underline')}
        onApply={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Strikethrough" active={editor.isActive('strike')}
        onApply={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className={ic} strokeWidth={2} />
      </TBtn>
      <TDivider />

      {/* Text color picker */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            title="Text Color"
            className="h-7 px-1.5 rounded-lg flex items-center gap-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all shrink-0"
          >
            <Palette className={ic} strokeWidth={2} />
            <div
              className="w-3 h-1.5 rounded-full"
              style={{
                backgroundColor: editor.getAttributes('textStyle').color ?? 'currentColor',
              }}
            />
            <ChevronDown className="h-2.5 w-2.5 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2.5" align="start">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Text Color
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {TEXT_COLORS.map(tc => (
              <button
                key={tc.label}
                title={tc.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (tc.color) editor.chain().focus().setColor(tc.color).run();
                  else          editor.chain().focus().unsetColor().run();
                }}
                className={cn(
                  'h-7 w-7 rounded-lg border flex items-center justify-center transition-all hover:scale-110',
                  tc.dot
                    ? 'border-transparent'
                    : 'border-border',
                )}
                style={{ backgroundColor: tc.dot ?? undefined }}
              >
                {!tc.dot && (
                  <span className="text-[10px] font-bold text-foreground">A</span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Highlight color picker */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            title="Highlight"
            className={cn(
              'h-7 px-1.5 rounded-lg flex items-center gap-0.5 transition-all shrink-0',
              editor.isActive('highlight')
                ? 'bg-[#007AFF]/15 text-[#007AFF] dark:bg-[#0A84FF]/20 dark:text-[#0A84FF]'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            <Highlighter className={ic} strokeWidth={2} />
            <ChevronDown className="h-2.5 w-2.5 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2.5" align="start">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Highlight Color
          </p>
          <div className="flex gap-1.5 mb-2">
            {HIGHLIGHT_COLORS.map(hc => (
              <button
                key={hc.label}
                title={hc.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().setHighlight({ color: hc.color }).run();
                }}
                className="h-7 w-7 rounded-full border-2 border-white/60 transition-all hover:scale-110 shadow-sm"
                style={{ backgroundColor: hc.dot }}
              />
            ))}
          </div>
          <button
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); }}
            className="w-full text-[12px] text-muted-foreground hover:text-destructive transition-colors mt-1 text-left"
          >
            Remove highlight
          </button>
        </PopoverContent>
      </Popover>

      <TDivider />

      {/* Headings */}
      <TBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })}
        onApply={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })}
        onApply={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })}
        onApply={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className={ic} strokeWidth={2} />
      </TBtn>
      <TDivider />

      {/* Lists */}
      <TBtn title="Bullet List" active={editor.isActive('bulletList')}
        onApply={() => editor.chain().focus().toggleBulletList().run()}>
        <List className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Ordered List" active={editor.isActive('orderedList')}
        onApply={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Checklist" active={editor.isActive('taskList')}
        onApply={() => editor.chain().focus().toggleTaskList().run()}>
        <ListChecks className={ic} strokeWidth={2} />
      </TBtn>
      <TDivider />

      {/* Blocks */}
      <TBtn title="Blockquote" active={editor.isActive('blockquote')}
        onApply={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Inline Code" active={editor.isActive('code')}
        onApply={() => editor.chain().focus().toggleCode().run()}>
        <Code className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Code Block" active={editor.isActive('codeBlock')}
        onApply={() => editor.chain().focus().toggleCodeBlock().run()}>
        <FileCode className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Divider Line"
        onApply={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className={ic} strokeWidth={2} />
      </TBtn>
      <TDivider />

      {/* Image + Sketch */}
      <TBtn title="Insert Image" onApply={onImageClick}>
        <ImageIcon className={ic} strokeWidth={2} />
      </TBtn>
      <TBtn title="Sketch / Draw" onApply={onSketchClick}>
        <Pencil className={ic} strokeWidth={2} />
      </TBtn>
    </div>
  );
}

// ─── NoteItem (top-level, memoized) ──────────────────────────────────────────

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

// ─── FolderItem (top-level, memoized) ────────────────────────────────────────

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

  const [notes,    setNotes]    = useState<Note[]>([]);
  const [folders,  setFolders]  = useState<NoteFolder[]>(BUILTIN_FOLDERS);
  useEffect(() => {
    if (!user?.uid) return;
    setNotes(getAllNotes(user.uid));
    setFolders(getAllFolders(user.uid));
  }, [user?.uid]);

  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [selectedNoteId,   setSelectedNoteId]   = useState<string | null>(null);
  const [search,     setSearch]     = useState('');
  const [noteTitle,  setNoteTitle]  = useState('');
  const [mobileView, setMobileView] = useState<'folders' | 'list' | 'editor'>('list');

  // Dialogs
  const [showNewFolder,    setShowNewFolder]    = useState(false);
  const [newFolderName,    setNewFolderName]    = useState('');
  const [newFolderColor,   setNewFolderColor]   = useState('apple-icon-blue');
  const [deleteNoteTarget, setDeleteNoteTarget] = useState<string | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<string | null>(null);
  const [showSketch,       setShowSketch]       = useState(false);

  // Refs
  const titleInputRef    = useRef<HTMLTextAreaElement>(null);
  const imageInputRef    = useRef<HTMLInputElement>(null);
  const saveTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef   = useRef<{ id: string; title: string; contentJson: string; contentText: string } | null>(null);
  const isSettingRef     = useRef(false);

  // ── Derived ──────────────────────────────────────────────────────────────
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

  // ── Auto-save ─────────────────────────────────────────────────────────────
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
      return prev.map(n => n.id === id ? updated : n);
    });
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushPendingSave, 700);
  }, [flushPendingSave]);

  // ── TipTap Editor ─────────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      CharacterCount,
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (isSettingRef.current || !pendingSaveRef.current) return;
      pendingSaveRef.current.contentJson = JSON.stringify(editor.getJSON());
      pendingSaveRef.current.contentText = editor.getText();
      scheduleSave();
    },
    editorProps: {
      attributes: { class: 'notes-editor focus:outline-none' },
    },
  });

  // Load note into editor when selection changes
  useEffect(() => {
    flushPendingSave();
    if (!editor) return;

    if (!selectedNoteId) {
      pendingSaveRef.current = null;
      isSettingRef.current   = true;
      editor.commands.setContent('');
      setNoteTitle('');
      requestAnimationFrame(() => { isSettingRef.current = false; });
      return;
    }

    const note = getAllNotes(uid).find(n => n.id === selectedNoteId);
    if (!note) return;

    pendingSaveRef.current = {
      id: note.id, title: note.title,
      contentJson: note.contentJson, contentText: note.contentText,
    };

    isSettingRef.current = true;
    editor.commands.setContent(note.contentJson ? JSON.parse(note.contentJson) : '', false);
    setNoteTitle(note.title);
    requestAnimationFrame(() => { isSettingRef.current = false; });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId, editor]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNewNote = useCallback(() => {
    const fid  = selectedFolderId === 'all' ? 'personal' : selectedFolderId;
    const note = createNote(fid);
    saveNote(uid, note);
    setNotes(prev => [note, ...prev]);
    setSelectedNoteId(note.id);
    if (window.innerWidth < 768) setMobileView('editor');
    setTimeout(() => titleInputRef.current?.focus(), 80);
  }, [selectedFolderId]);

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
    if (window.innerWidth < 768) setMobileView('editor');
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    persistDeleteNote(uid, id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      pendingSaveRef.current = null;
      if (window.innerWidth < 768) setMobileView('list');
    }
    toast.success('Note deleted');
    setDeleteNoteTarget(null);
  }, [selectedNoteId]);

  const handleTogglePin = useCallback((id: string) => {
    setNotes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
      const note    = updated.find(n => n.id === id);
      if (note) saveNote(uid, note);
      return updated;
    });
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
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
    setFolders(getAllFolders(uid));
    setNewFolderName('');
    setNewFolderColor('apple-icon-blue');
    setShowNewFolder(false);
    toast.success(`Folder "${folder.name}" created`);
  };

  const handleDeleteFolder = useCallback((id: string) => {
    persistDeleteFolder(uid, id);
    setFolders(getAllFolders(uid));
    setNotes(getAllNotes(uid));
    if (selectedFolderId === id) setSelectedFolderId('all');
    toast.success('Folder deleted');
    setDeleteFolderTarget(null);
  }, [selectedFolderId]);

  // Image insert from file
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    try {
      const dataUrl = await compressImageFile(file);
      editor.chain().focus().setImage({ src: dataUrl }).run();
    } catch {
      toast.error('Failed to insert image');
    }
    e.target.value = '';
  };

  // Sketch insert
  const handleSketchInsert = (dataUrl: string) => {
    editor?.chain().focus().setImage({ src: dataUrl }).run();
    setShowSketch(false);
  };

  const wordCount = editor?.storage.characterCount?.words()      ?? 0;
  const charCount = editor?.storage.characterCount?.characters() ?? 0;

  const currentFolderName = selectedFolderId === 'all'
    ? 'All Notes'
    : (folders.find(f => f.id === selectedFolderId)?.name ?? 'Notes');

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in">

      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />

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
          'flex flex-col border-r overflow-y-auto shrink-0 apple-vibrancy',
          'border-r-[rgba(60,60,67,0.18)] dark:border-r-[rgba(84,84,88,0.36)]',
          mobileView === 'folders' ? 'flex w-full' : 'hidden',
          'lg:flex lg:w-52',
        )}>
          <div className="flex items-center justify-between px-4 pt-5 pb-3">
            <h2 className="text-[22px] font-bold"
              style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.4px' }}>
              Notes
            </h2>
            <button onClick={() => setShowNewFolder(true)}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-[#007AFF] hover:bg-[#007AFF]/10 transition-all"
              title="New Folder">
              <FolderPlus className="h-4 w-4" strokeWidth={2} />
            </button>
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
          'flex flex-col border-r shrink-0 overflow-hidden',
          'border-r-[rgba(60,60,67,0.18)] dark:border-r-[rgba(84,84,88,0.36)]',
          mobileView === 'list' ? 'flex w-full' : 'hidden',
          'md:flex md:w-64 lg:w-72',
        )}>
          <div className="px-4 pt-5 pb-3 shrink-0">
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
              <button onClick={handleNewNote}
                className="h-8 w-8 rounded-xl flex items-center justify-center bg-[#007AFF] text-white hover:bg-[#007AFF]/90 transition-all"
                style={{ boxShadow: '0 2px 8px rgba(0,122,255,0.35)' }}
                title="New Note">
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </button>
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

        {/* ── Editor panel ── */}
        <div className={cn(
          'flex-1 flex flex-col overflow-hidden',
          mobileView === 'editor' ? 'flex' : 'hidden',
          'md:flex',
        )}>
          {!selectedNote ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="h-20 w-20 squircle-lg apple-icon-yellow flex items-center justify-center"
                style={{ boxShadow: '0 8px 24px rgba(255,204,0,0.3)' }}>
                <StickyNote className="h-10 w-10 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[20px] font-bold"
                  style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.3px' }}>
                  No Note Selected
                </h3>
                <p className="text-[14px] text-muted-foreground mt-1">
                  Choose a note from the list, or create a new one.
                </p>
              </div>
              <button onClick={handleNewNote}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#007AFF] text-white text-[14px] font-semibold hover:bg-[#007AFF]/90 transition-all"
                style={{ boxShadow: '0 4px 12px rgba(0,122,255,0.35)' }}>
                <Plus className="h-4 w-4" strokeWidth={2.5} />New Note
              </button>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <EditorToolbar
                editor={editor}
                onImageClick={() => imageInputRef.current?.click()}
                onSketchClick={() => setShowSketch(true)}
              />

              {/* Actions bar */}
              <div className="flex items-center justify-between px-4 py-1.5 border-b shrink-0">
                <span className="text-[12px] text-muted-foreground/60">
                  {formatNoteDate(selectedNote.updatedAt)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleTogglePin(selectedNote.id)}
                    className={cn('h-7 w-7 rounded-lg flex items-center justify-center transition-all',
                      selectedNote.pinned
                        ? 'text-[#FF9500] bg-[#FF9500]/10'
                        : 'text-muted-foreground hover:bg-secondary')}
                    title={selectedNote.pinned ? 'Unpin' : 'Pin'}>
                    <Pin className={cn('h-3.5 w-3.5', selectedNote.pinned && 'fill-current')} strokeWidth={selectedNote.pinned ? 0 : 2} />
                  </button>
                  <button
                    onClick={() => setDeleteNoteTarget(selectedNote.id)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                    title="Delete Note">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Title + editor body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <textarea
                  ref={titleInputRef}
                  value={noteTitle}
                  onChange={handleTitleChange}
                  placeholder="Title"
                  rows={1}
                  className="w-full resize-none bg-transparent border-none outline-none text-[28px] font-bold leading-tight placeholder:text-muted-foreground/30 mb-4"
                  style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif', letterSpacing: '-0.5px', overflow: 'hidden' }}
                />
                <EditorContent editor={editor} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-2 border-t shrink-0">
                <span className="text-[11px] text-muted-foreground/50">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} chars
                </span>
                <span className="text-[11px] text-muted-foreground/40">Auto-saved</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Sketch Dialog ── */}
      <Dialog open={showSketch} onOpenChange={setShowSketch}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sketch</DialogTitle>
          </DialogHeader>
          <SketchPad onInsert={handleSketchInsert} onClose={() => setShowSketch(false)} />
        </DialogContent>
      </Dialog>

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
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>This note will be permanently deleted.</AlertDialogDescription>
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

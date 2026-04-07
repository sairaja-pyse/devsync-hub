import { useState, useEffect, useRef } from "react";
import {
  FileText, Image, Upload, Search, LayoutGrid, List,
  Pin, PinOff, Trash2, Download, X, Plus, FolderOpen, BookOpen,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type ResourceMeta,
  type ResourceCategory,
  getAllMeta,
  saveResource,
  getResourceBlob,
  updateMeta,
  deleteResource,
} from "@/lib/resourceStorage";

/* ─── Category config ─── */
export const CATEGORY_STYLES: Record<ResourceCategory, { color: string; bg: string }> = {
  "Resume":       { color: "#007AFF", bg: "rgba(0,122,255,0.10)"   },
  "Course Notes": { color: "#FF9500", bg: "rgba(255,149,0,0.10)"   },
  "Screenshots":  { color: "#34C759", bg: "rgba(52,199,89,0.10)"   },
  "Certificates": { color: "#AF52DE", bg: "rgba(175,82,222,0.10)"  },
  "Reference":    { color: "#5856D6", bg: "rgba(88,86,214,0.10)"   },
  "Other":        { color: "#8E8E93", bg: "rgba(142,142,147,0.10)" },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_STYLES) as ResourceCategory[];

/* ─── Utility ─── */
function formatSize(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/* ─── Upload Dialog ─── */
function UploadDialog({
  onUpload,
  onClose,
}: {
  onUpload: (meta: ResourceMeta) => void;
  onClose: () => void;
}) {
  const [file, setFile]         = useState<File | null>(null);
  const [category, setCategory] = useState<ResourceCategory>("Other");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving]     = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  function accept(f: File) {
    if (f.type.startsWith("image/") || f.type === "application/pdf") {
      setFile(f);
    } else {
      toast.error("Only images and PDFs are supported");
    }
  }

  async function handleSave() {
    if (!file) return;
    setSaving(true);
    try {
      const meta = await saveResource(file, category);
      onUpload(meta);
      toast.success("Saved to vault");
    } catch {
      toast.error("Failed to save file");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative apple-widget w-full max-w-md p-6 space-y-5 animate-spring-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-ios-title3 font-bold"
            style={{ fontFamily: '-apple-system, "SF Pro Display", sans-serif' }}
          >
            Add to Vault
          </h2>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Drop zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-[16px] p-8 text-center cursor-pointer transition-all duration-200",
            dragging
              ? "border-[#007AFF] bg-[rgba(0,122,255,0.05)]"
              : "border-border/60 hover:border-[#007AFF]/50 hover:bg-secondary/30",
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) accept(f); }}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) accept(f); }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              {file.type.startsWith("image/") ? (
                <Image className="h-10 w-10 text-[#34C759]" />
              ) : (
                <FileText className="h-10 w-10 text-[#FF3B30]" />
              )}
              <p className="text-ios-subhead font-semibold text-foreground">{file.name}</p>
              <p className="text-ios-caption1 text-muted-foreground">{formatSize(file.size)}</p>
              <button
                className="text-[#007AFF] text-ios-caption1 font-semibold mt-1"
                onClick={(e) => { e.stopPropagation(); setFile(null); inputRef.current!.value = ""; }}
              >
                Change file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 squircle-sm apple-icon-blue flex items-center justify-center mb-1">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <p className="text-ios-subhead font-semibold text-foreground">Drop file here</p>
              <p className="text-ios-caption1 text-muted-foreground">PDF or Image · tap to browse</p>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2.5">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const s      = CATEGORY_STYLES[cat];
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-full text-ios-caption1 font-semibold transition-all duration-150"
                  style={{
                    border: `1.5px solid ${s.color}`,
                    color:  active ? s.color : `${s.color}88`,
                    background: active ? s.bg : "transparent",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Button
          className="w-full h-11 rounded-[12px] font-semibold text-white"
          style={{ background: "linear-gradient(145deg, #409CFF, #007AFF)" }}
          disabled={!file || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save to Vault"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Preview Modal ─── */
function PreviewModal({
  meta,
  onClose,
  onPin,
  onDelete,
}: {
  meta: ResourceMeta;
  onClose: () => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const s = CATEGORY_STYLES[meta.category];

  useEffect(() => {
    let url = "";
    getResourceBlob(meta.id).then((blob) => {
      if (blob) { url = URL.createObjectURL(blob); setObjectUrl(url); }
      setLoading(false);
    });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [meta.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleDownload() {
    if (!objectUrl) return;
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = meta.name;
    a.click();
  }

  async function handleDelete() {
    await onDelete(meta.id);
    onClose();
  }

  const isImg = meta.mimeType.startsWith("image/");

  const BAR_H = 44;

  return (
    <div className="fixed inset-0 z-50 bg-black" style={{ display: "flex", flexDirection: "column" }}>

      {/* Slim top bar */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 shrink-0 bg-black/80 backdrop-blur-md"
        style={{ height: BAR_H }}
      >
        {/* File icon */}
        <div className="h-7 w-7 squircle-xs flex items-center justify-center shrink-0" style={{ background: s.bg }}>
          {isImg
            ? <Image className="h-3.5 w-3.5" style={{ color: s.color }} />
            : <FileText className="h-3.5 w-3.5" style={{ color: s.color }} />}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white truncate leading-tight">{meta.name}</p>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[11px] font-semibold" style={{ color: s.color }}>{meta.category}</span>
            <span className="text-[11px] text-white/50">·</span>
            <span className="text-[11px] text-white/50">{formatSize(meta.size)}</span>
            <span className="text-[11px] text-white/50">·</span>
            <span className="text-[11px] text-white/50">{formatDate(meta.dateAdded)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            title={meta.pinned ? "Unpin" : "Pin to dashboard"}
            onClick={() => onPin(meta.id)}
          >
            {meta.pinned
              ? <PinOff className="h-4 w-4 text-[#409CFF]" />
              : <Pin    className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            title="Download"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            title="Delete"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-[#FF453A]" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
            title="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Full-screen content — explicit calc height so PDF fills everything */}
      <div style={{ width: "100%", height: `calc(100vh - ${BAR_H}px)` }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-full gap-3 text-white/50">
            <div className="h-8 w-8 rounded-full border-2 border-[#409CFF] border-t-transparent animate-spin" />
            <p className="text-[13px]">Loading…</p>
          </div>
        ) : objectUrl ? (
          isImg ? (
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={objectUrl}
                alt={meta.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
          ) : (
            <object
              data={objectUrl}
              type="application/pdf"
              style={{ width: "100%", height: "100%", display: "block", border: "none" }}
            >
              <div className="flex flex-col items-center justify-center w-full h-full gap-4 text-white/50">
                <FileText className="h-16 w-16 opacity-20" />
                <p className="text-[15px] font-semibold">PDF cannot be displayed</p>
                <button
                  className="text-[#409CFF] text-[13px] font-semibold underline"
                  onClick={handleDownload}
                >
                  Download instead
                </button>
              </div>
            </object>
          )
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-3 text-white/40">
            <FileText className="h-16 w-16 opacity-30" />
            <p className="text-[15px] font-semibold">Could not load file</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Grid Card ─── */
function FileCard({ meta, onClick }: { meta: ResourceMeta; onClick: () => void }) {
  const s     = CATEGORY_STYLES[meta.category];
  const isImg = meta.mimeType.startsWith("image/");

  return (
    <button
      onClick={onClick}
      className="group apple-widget p-0 overflow-hidden text-left hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
    >
      {/* Preview */}
      <div className="relative h-40 overflow-hidden bg-secondary/30">
        {isImg && meta.thumbnail ? (
          <img src={meta.thumbnail} alt={meta.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(145deg, ${s.color}18, ${s.color}08)` }}
          >
            <FileText className="h-16 w-16 opacity-30" style={{ color: s.color }} />
          </div>
        )}
        {meta.pinned && (
          <div
            className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,122,255,0.9)", backdropFilter: "blur(8px)" }}
          >
            <Pin className="h-3 w-3 text-white" fill="white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-ios-subhead font-semibold text-foreground truncate">
          {meta.name.replace(/\.[^.]+$/, "")}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: s.bg, color: s.color }}
          >
            {meta.category}
          </span>
          <span className="text-ios-caption2 text-muted-foreground">{formatSize(meta.size)}</span>
        </div>
      </div>
    </button>
  );
}

/* ─── List Row ─── */
function FileRow({
  meta,
  onClick,
  onPin,
  onDelete,
}: {
  meta: ResourceMeta;
  onClick: () => void;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const s     = CATEGORY_STYLES[meta.category];
  const isImg = meta.mimeType.startsWith("image/");

  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 ios-separator hover:bg-secondary/30 transition-colors">
      {/* Thumbnail / icon */}
      <button onClick={onClick} className="shrink-0">
        {isImg && meta.thumbnail ? (
          <div className="h-11 w-11 rounded-[10px] overflow-hidden">
            <img src={meta.thumbnail} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-11 w-11 squircle-sm flex items-center justify-center" style={{ background: s.bg }}>
            <FileText className="h-5 w-5" style={{ color: s.color }} />
          </div>
        )}
      </button>

      {/* Info */}
      <button onClick={onClick} className="flex-1 min-w-0 text-left">
        <p className="text-ios-subhead font-semibold text-foreground truncate">{meta.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-ios-caption1 font-semibold" style={{ color: s.color }}>{meta.category}</span>
          <span className="text-ios-caption2 text-muted-foreground">·</span>
          <span className="text-ios-caption2 text-muted-foreground">{formatDate(meta.dateAdded)}</span>
          <span className="text-ios-caption2 text-muted-foreground">·</span>
          <span className="text-ios-caption2 text-muted-foreground">{formatSize(meta.size)}</span>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {meta.pinned && <Pin className="h-3.5 w-3.5 text-[#007AFF] mr-0.5" fill="#007AFF" />}
        <Button
          variant="ghost" size="icon"
          className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          title={meta.pinned ? "Unpin" : "Pin"}
          onClick={() => onPin(meta.id)}
        >
          {meta.pinned
            ? <PinOff className="h-3.5 w-3.5 text-[#007AFF]" />
            : <Pin    className="h-3.5 w-3.5 text-muted-foreground" />}
        </Button>
        <Button
          variant="ghost" size="icon"
          className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(meta.id)}
        >
          <Trash2 className="h-3.5 w-3.5 text-[#FF3B30]" />
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ResourceVault() {
  const [resources, setResources] = useState<ResourceMeta[]>(() => getAllMeta());
  const [search,    setSearch]    = useState("");
  const [activeCat, setActiveCat] = useState<ResourceCategory | "All">("All");
  const [viewMode,  setViewMode]  = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const [previewId,  setPreviewId]  = useState<string | null>(null);

  const filtered = resources.filter((r) => {
    const matchCat    = activeCat === "All" || r.category === activeCat;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const previewMeta = resources.find((r) => r.id === previewId) ?? null;

  function handleUploaded(meta: ResourceMeta) {
    setResources(getAllMeta());
    setShowUpload(false);
    setPreviewId(meta.id);
  }

  function handlePin(id: string) {
    const cur     = resources.find((r) => r.id === id);
    const updated = updateMeta(id, { pinned: !cur?.pinned });
    setResources(updated);
    toast.success(cur?.pinned ? "Unpinned from dashboard" : "Pinned to dashboard");
  }

  async function handleDelete(id: string) {
    const updated = await deleteResource(id);
    setResources(updated);
    toast.success("File deleted");
  }

  return (
    <div className="p-4 sm:p-5 lg:p-6 space-y-4 animate-fade-in pb-24 sm:pb-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-foreground leading-tight"
            style={{
              fontFamily: '-apple-system, "SF Pro Display", sans-serif',
              fontSize: "clamp(24px, 4vw, 32px)",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Resource Vault
          </h1>
          <p className="text-ios-subhead text-muted-foreground mt-0.5">
            {resources.length} file{resources.length !== 1 ? "s" : ""}
            {resources.filter((r) => r.pinned).length > 0 && (
              <> · {resources.filter((r) => r.pinned).length} pinned</>
            )}
          </p>
        </div>
        <Button
          className="shrink-0 h-10 px-4 rounded-[12px] font-semibold text-white flex items-center gap-1.5"
          style={{ background: "linear-gradient(145deg, #409CFF, #007AFF)" }}
          onClick={() => setShowUpload(true)}
        >
          <Plus className="h-4 w-4" />
          Add File
        </Button>
      </div>

      {/* ── Search + View toggle ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="pl-10 h-10 rounded-[12px] bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-[#007AFF]/50"
          />
        </div>

        {/* Grid / List toggle */}
        <div className="apple-widget flex items-center gap-1 p-1 shrink-0">
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "h-8 w-8 rounded-[8px] flex items-center justify-center transition-all duration-150",
                viewMode === mode
                  ? "bg-[#007AFF] text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode === "grid"
                ? <LayoutGrid className="h-3.5 w-3.5" />
                : <List       className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category filter pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {(["All", ...ALL_CATEGORIES] as const).map((cat) => {
          const active = activeCat === cat;
          const count  = cat === "All"
            ? resources.length
            : resources.filter((r) => r.category === cat).length;
          const s = cat !== "All" ? CATEGORY_STYLES[cat as ResourceCategory] : null;

          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all duration-150 shrink-0",
                active
                  ? cat === "All"
                    ? "bg-foreground text-background"
                    : ""
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
              style={active && s ? { background: s.bg, color: s.color } : {}}
            >
              {cat}
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: active ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        /* Empty state */
        <div className="apple-widget p-16 flex flex-col items-center justify-center text-center">
          <div
            className="h-20 w-20 squircle-sm flex items-center justify-center mb-4"
            style={{ background: "rgba(0,122,255,0.08)" }}
          >
            <FolderOpen className="h-10 w-10 text-[#007AFF] opacity-40" />
          </div>
          <p
            className="font-bold text-foreground mb-1"
            style={{ fontSize: "20px", fontFamily: '-apple-system, "SF Pro Display", sans-serif' }}
          >
            {resources.length === 0 ? "Your vault is empty" : "No files found"}
          </p>
          <p className="text-ios-subhead text-muted-foreground max-w-xs mt-1">
            {resources.length === 0
              ? "Add your resumes, course notes, and screenshots here to read them anytime"
              : "Try a different search term or category"}
          </p>
          {resources.length === 0 && (
            <Button
              className="mt-5 h-10 px-5 rounded-[12px] font-semibold text-white"
              style={{ background: "linear-gradient(145deg, #409CFF, #007AFF)" }}
              onClick={() => setShowUpload(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add your first file
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((meta) => (
            <FileCard key={meta.id} meta={meta} onClick={() => setPreviewId(meta.id)} />
          ))}
        </div>
      ) : (
        <div className="apple-widget p-0 overflow-hidden">
          {filtered.map((meta) => (
            <FileRow
              key={meta.id}
              meta={meta}
              onClick={() => setPreviewId(meta.id)}
              onPin={handlePin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Upload Dialog ── */}
      {showUpload && (
        <UploadDialog onUpload={handleUploaded} onClose={() => setShowUpload(false)} />
      )}

      {/* ── Preview Modal ── */}
      {previewMeta && (
        <PreviewModal
          meta={previewMeta}
          onClose={() => setPreviewId(null)}
          onPin={handlePin}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/* Export for re-use in Dashboard */
export { BookOpen };

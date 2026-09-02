"use client"

import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Folder,
  FolderOpen,
  FolderPlus,
  File,
  Image,
  Video,
  Music,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Archive,
  Upload,
  Trash2,
  Download,
  Pencil,
  Search,
  ChevronRight,
  ChevronDown,
  Home,
  X,
  Loader2,
  Eye,
  Zap,
  Settings2,
  ArrowUpDown,
  Check,
} from "lucide-react"
import { cn, formatFileSize, formatDate } from "@/lib/utils"
import type { GoogleAccount } from "@/types"

interface DriveItem {
  id: string
  accountId: string
  name: string
  mimeType: string
  size: number
  created_at: string
  modified_at: string
  isFolder: boolean
}

interface Breadcrumb {
  id: string
  name: string
  accountId: string
}

interface FileExplorerProps {
  accounts: GoogleAccount[]
}

interface CategoryStyle {
  Icon: typeof File
  box: string
  iconClass: string
  label: string
}

const categoryStyles: Record<string, CategoryStyle> = {
  folder: {
    Icon: FolderOpen,
    box: "bg-gradient-to-br from-crimson/30 to-crimson/5 border-crimson/40",
    iconClass: "text-[#ff6b85] drop-shadow-[0_0_10px_rgba(255,45,120,0.4)]",
    label: "Folder",
  },
  image: {
    Icon: Image,
    box: "bg-emerald-500/10 border-emerald-500/30",
    iconClass: "text-emerald-400",
    label: "Image",
  },
  video: {
    Icon: Video,
    box: "bg-sky-500/10 border-sky-500/30",
    iconClass: "text-sky-400",
    label: "Video",
  },
  audio: {
    Icon: Music,
    box: "bg-violet-500/10 border-violet-500/30",
    iconClass: "text-violet-400",
    label: "Audio",
  },
  pdf: {
    Icon: FileText,
    box: "bg-red-500/10 border-red-500/30",
    iconClass: "text-red-400",
    label: "PDF",
  },
  document: {
    Icon: FileText,
    box: "bg-blue-500/10 border-blue-500/30",
    iconClass: "text-blue-400",
    label: "Document",
  },
  spreadsheet: {
    Icon: FileSpreadsheet,
    box: "bg-lime-500/10 border-lime-500/30",
    iconClass: "text-lime-400",
    label: "Sheet",
  },
  presentation: {
    Icon: Presentation,
    box: "bg-orange-500/10 border-orange-500/30",
    iconClass: "text-orange-400",
    label: "Slides",
  },
  code: {
    Icon: FileCode,
    box: "bg-fuchsia-500/10 border-fuchsia-500/30",
    iconClass: "text-fuchsia-400",
    label: "Code",
  },
  archive: {
    Icon: Archive,
    box: "bg-amber-500/10 border-amber-500/30",
    iconClass: "text-amber-400",
    label: "Archive",
  },
  file: {
    Icon: File,
    box: "bg-neon-muted border-neon/20",
    iconClass: "text-neon",
    label: "File",
  },
}

function getIconCategory(mimeType: string, isFolder: boolean): string {
  if (isFolder) return "folder"
  const t = mimeType
  if (t.startsWith("image/")) return "image"
  if (t.startsWith("video/")) return "video"
  if (t.startsWith("audio/")) return "audio"
  if (t.includes("pdf")) return "pdf"
  if (t.includes("spreadsheet") || t.includes("excel") || t === "application/vnd.google-apps.spreadsheet") return "spreadsheet"
  if (t.includes("presentation") || t.includes("powerpoint") || t === "application/vnd.google-apps.presentation") return "presentation"
  if (t.includes("zip") || t.includes("rar") || t.includes("tar") || t.includes("compressed") || t.includes("7z")) return "archive"
  if (
    t.includes("json") || t.includes("javascript") || t.includes("typescript") ||
    t.includes("python") || t.includes("html") || t.includes("css") || t.includes("xml") ||
    t.includes("code") || t.includes("go") || t.includes("rust")
  ) return "code"
  if (t.includes("text") || t.includes("document") || t.includes("word") || t.includes("rtf")) return "document"
  return "file"
}

function getCategoryStyle(mimeType: string, isFolder: boolean): CategoryStyle {
  return categoryStyles[getIconCategory(mimeType, isFolder)] ?? categoryStyles.file
}

const SORT_OPTIONS = [
  { key: "name-asc", label: "Name (A–Z)" },
  { key: "name-desc", label: "Name (Z–A)" },
  { key: "modified-desc", label: "Modified (Newest)" },
  { key: "modified-asc", label: "Modified (Oldest)" },
  { key: "size-desc", label: "Size (Largest)" },
  { key: "size-asc", label: "Size (Smallest)" },
  { key: "type", label: "File Type" },
  { key: "account", label: "Drive / Account" },
  { key: "kind", label: "Folders / Files" },
]

export function FileExplorer({ accounts }: FileExplorerProps) {
  const [items, setItems] = useState<DriveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [currentFolderId, setCurrentFolderId] = useState("root")
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false)

  // Preview state
  const [previewItem, setPreviewItem] = useState<DriveItem | null>(null)

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const renameInputRef = useRef<HTMLInputElement>(null)

  // New folder state
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const newFolderRef = useRef<HTMLInputElement>(null)

  // Action loading
  const [actionId, setActionId] = useState<string | null>(null)

  // Sort state
  const [sortKey, setSortKey] = useState<string>("name-asc")
  const [sortOpen, setSortOpen] = useState(false)

  const fetchFiles = useCallback(async (folderId: string, accountId?: string | null) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (folderId && folderId !== "root") params.set("folderId", folderId)
      if (accountId) params.set("accountId", accountId)
      params.set("_t", String(Date.now()))
      const res = await fetch(`/api/drive/files?${params}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      const allItems: DriveItem[] = []
      for (const group of data.results ?? []) {
        for (const f of group.files ?? []) {
          allItems.push(f)
        }
      }
      allItems.sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      setItems(allItems)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchFiles(currentFolderId, currentAccountId)
    }
  }, [currentFolderId, currentAccountId, fetchFiles, searchQuery])

  const doSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ q: searchQuery.trim() })
      if (currentAccountId) params.set("accountId", currentAccountId)
      const res = await fetch(`/api/drive/files?${params}`)
      if (!res.ok) return
      const data = await res.json()
      const allItems: DriveItem[] = []
      for (const group of data.results ?? []) {
        for (const f of group.files ?? []) {
          allItems.push(f)
        }
      }
      allItems.sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      setItems(allItems)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, currentAccountId])

  const navigateToFolder = useCallback((folderId: string, name: string, accountId: string) => {
    setSearchQuery("")
    setBreadcrumbs((prev) => [...prev, { id: folderId, name, accountId }])
    setCurrentFolderId(folderId)
    fetchFiles(folderId, currentAccountId)
  }, [currentAccountId, fetchFiles])

  const handleNavigate = useCallback((item: DriveItem) => {
    navigateToFolder(item.id, item.name, item.accountId)
  }, [navigateToFolder])

  const accountEmailFor = useCallback((accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.account_email
  }, [accounts])

  const navigateToBreadcrumb = useCallback((index: number) => {
    const newCrumbs = breadcrumbs.slice(0, index)
    setBreadcrumbs(newCrumbs)
    setSearchQuery("")
    if (newCrumbs.length === 0) {
      setCurrentFolderId("root")
      fetchFiles("root", currentAccountId)
    } else {
      const target = newCrumbs[newCrumbs.length - 1]
      setCurrentFolderId(target.id)
      fetchFiles(target.id, currentAccountId)
    }
  }, [breadcrumbs, currentAccountId, fetchFiles])

  const switchAccount = useCallback((accountId: string | null) => {
    setCurrentAccountId(accountId)
    setBreadcrumbs([])
    setCurrentFolderId("root")
    setSearchQuery("")
    fetchFiles("root", accountId)
  }, [fetchFiles])

  const sortedItems = useMemo(() => {
    const arr = [...items]
    const accountOf = (id: string) => accounts.find((a) => a.id === id)?.account_email ?? ""
    arr.sort((a, b) => {
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
      switch (sortKey) {
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "modified-desc":
          return (b.modified_at || "").localeCompare(a.modified_at || "")
        case "modified-asc":
          return (a.modified_at || "").localeCompare(b.modified_at || "")
        case "size-desc":
          return b.size - a.size
        case "size-asc":
          return a.size - b.size
        case "type": {
          const ca = getIconCategory(a.mimeType, a.isFolder)
          const cb = getIconCategory(b.mimeType, b.isFolder)
          if (ca === cb) return a.name.localeCompare(b.name)
          return ca.localeCompare(cb)
        }
        case "account": {
          const ea = accountOf(a.accountId).split("@")[0]
          const eb = accountOf(b.accountId).split("@")[0]
          if (ea === eb) return a.name.localeCompare(b.name)
          return ea.localeCompare(eb)
        }
        case "kind":
          return a.isFolder === b.isFolder ? a.name.localeCompare(b.name) : 0
        default:
          return a.name.localeCompare(b.name)
      }
    })
    return arr
  }, [items, sortKey, accounts])

  const handleRename = useCallback(async (item: DriveItem) => {
    if (!renameValue.trim() || renameValue.trim() === item.name) {
      setRenamingId(null)
      return
    }
    setActionId(item.id)
    try {
      const res = await fetch(`/api/drive/files/${item.id}?accountId=${item.accountId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameValue.trim() }),
      })
      if (res.ok) {
        setItems((prev) => prev.map((f) =>
          f.id === item.id ? { ...f, name: renameValue.trim() } : f
        ))
      }
    } finally {
      setRenamingId(null)
      setActionId(null)
    }
  }, [renameValue])

  const handleDelete = useCallback(async (item: DriveItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return
    setActionId(item.id)
    try {
      const res = await fetch(`/api/drive/files/${item.id}?accountId=${item.accountId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setItems((prev) => prev.filter((f) => f.id !== item.id))
      }
    } finally {
      setActionId(null)
    }
  }, [])

  const handleDownload = useCallback((item: DriveItem) => {
    window.open(`/api/drive/files/${item.id}?accountId=${item.accountId}`, "_blank")
  }, [])

  const handleCreateFolder = useCallback(async () => {
    if (!newFolderName.trim()) return
    const targetAccountId = currentAccountId || accounts[0]?.id
    if (!targetAccountId) return
    setActionId("new-folder")
    try {
      const res = await fetch("/api/drive/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: targetAccountId,
          name: newFolderName.trim(),
          parentId: currentFolderId === "root" ? undefined : currentFolderId,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const newFolder: DriveItem = {
          id: data.folder.id,
          accountId: targetAccountId,
          name: data.folder.name,
          mimeType: data.folder.mimeType,
          size: 0,
          created_at: data.folder.createdTime,
          modified_at: data.folder.modifiedTime,
          isFolder: true,
        }
        setItems((prev) => [newFolder, ...prev.filter((f) => !f.isFolder || f.name.localeCompare(newFolder.name) < 0 || f.id === newFolder.id)])
        setCreatingFolder(false)
        setNewFolderName("")
      }
    } finally {
      setActionId(null)
    }
  }, [newFolderName, currentFolderId, currentAccountId, accounts])

  const openRename = useCallback((item: DriveItem) => {
    setRenamingId(item.id)
    setRenameValue(item.name)
    setTimeout(() => renameInputRef.current?.focus(), 50)
  }, [])

  useEffect(() => {
    if (creatingFolder) newFolderRef.current?.focus()
  }, [creatingFolder])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Files</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse and manage your connected Google Drive accounts
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Account filter */}
        <div className="flex items-center gap-1 rounded-2xl bg-surface border border-border p-1.5 flex-wrap max-w-full">
          <button
            onClick={() => switchAccount(null)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              currentAccountId === null
                ? "bg-neon text-bg shadow-[0_0_14px_rgba(255,45,120,0.35)]"
                : "text-zinc-400 hover:text-text hover:bg-surface-hover"
            )}
          >
            All Drives
          </button>
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => switchAccount(a.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all truncate max-w-[150px]",
                currentAccountId === a.id
                  ? "bg-neon text-bg shadow-[0_0_14px_rgba(255,45,120,0.35)]"
                  : "text-zinc-400 hover:text-text hover:bg-surface-hover"
              )}
              title={a.account_email}
            >
              {a.account_email.split("@")[0]}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className={cn(
              "flex items-center gap-2 h-11 px-4 rounded-2xl text-sm font-semibold border transition-all",
              sortOpen
                ? "border-neon/50 bg-surface text-neon shadow-[0_0_16px_rgba(255,45,120,0.2)]"
                : "border-border bg-surface text-zinc-400 hover:text-text hover:border-neon/30"
            )}
            title="Sort items"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "Sort"}</span>
            <span className="sm:hidden">Sort</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", sortOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-13 z-50 w-60 rounded-2xl border-2 border-crimson/40 bg-surface p-2 shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_24px_rgba(167,50,72,0.15)]"
                >
                  <p className="px-3 pt-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                    Sort by
                  </p>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortKey(opt.key); setSortOpen(false) }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-colors",
                        sortKey === opt.key
                          ? "bg-neon-muted text-neon font-semibold"
                          : "text-zinc-400 hover:text-text hover:bg-surface-hover"
                      )}
                    >
                      {opt.label}
                      {sortKey === opt.key && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Search */}
        {searchOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center flex-1 min-w-[200px] sm:min-w-0 gap-1 bg-surface border-2 border-neon/40 rounded-2xl overflow-hidden shadow-[0_0_12px_rgba(255,45,120,0.15)]"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="Search files..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-text outline-none placeholder:text-text-muted"
            />
            <button
              onClick={() => { setSearchQuery(""); setSearchOpen(false); fetchFiles(currentFolderId, currentAccountId) }}
              className="p-2 text-text-muted hover:text-text"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-11 h-11 rounded-2xl text-zinc-400 hover:text-neon hover:bg-surface border border-transparent hover:border-neon/30 transition-all"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* New folder */}
        <button
          onClick={() => setCreatingFolder(true)}
          className="w-11 h-11 rounded-2xl text-zinc-400 hover:text-crimson-hover hover:bg-surface border border-transparent hover:border-crimson/40 transition-all"
          title="New folder"
        >
          <FolderPlus className="w-5 h-5" />
        </button>

        {/* Upload */}
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold bg-neon text-bg hover:bg-neon-hover transition-all shadow-[0_0_14px_rgba(255,45,120,0.3)] hover:shadow-[0_0_22px_rgba(255,45,120,0.45)] hover:-translate-y-0.5"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Breadcrumbs */}
      {(breadcrumbs.length > 0 || creatingFolder) && (
        <div className="flex items-center gap-2 text-[15px] flex-wrap">
          <button
            onClick={() => navigateToBreadcrumb(0)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-neon hover:bg-neon-muted transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="font-medium">root</span>
          </button>
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb.accountId}-${crumb.id}`} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-text-muted" />
              <button
                onClick={() => navigateToBreadcrumb(i + 1)}
                className={cn(
                  "px-3 py-1.5 rounded-lg transition-colors truncate max-w-[140px] min-[480px]:max-w-[180px]",
                  i === breadcrumbs.length - 1
                    ? "text-text font-semibold"
                    : "text-zinc-400 hover:text-neon hover:bg-neon-muted"
                )}
              >
                {crumb.name}
              </button>
            </span>
          ))}
          {creatingFolder && (
            <span className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-text-muted" />
              <input
                ref={newFolderRef}
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder()
                  if (e.key === "Escape") { setCreatingFolder(false); setNewFolderName("") }
                }}
                onBlur={handleCreateFolder}
                placeholder="Folder name..."
                className="bg-surface border-2 border-crimson/40 rounded-xl px-3 py-2 text-sm text-text outline-none w-48 shadow-[0_0_12px_rgba(167,50,72,0.15)]"
              />
            </span>
          )}
        </div>
      )}

      {/* File Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-neon animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border-2 border-dashed border-crimson/30 bg-surface/50">
          <div className="w-20 h-20 rounded-3xl bg-surface border-2 border-crimson/40 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(167,50,72,0.2)]">
            <Folder className="w-9 h-9 text-crimson" />
          </div>
          <h3 className="text-xl font-bold text-text">Nothing here yet</h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-md">
            {searchQuery ? "No results found. Try a different search." : "Upload files or create a folder to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 min-[480px]:gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item) => (
              <FileItem
                key={`${item.accountId}-${item.id}`}
                item={item}
                renamingId={renamingId}
                renameValue={renameValue}
                actionId={actionId}
                onRenameValueChange={setRenameValue}
                onOpenRename={openRename}
                onConfirmRename={handleRename}
                onCancelRename={() => setRenamingId(null)}
                onNavigate={handleNavigate}
                onPreview={setPreviewItem}
                onDownload={handleDownload}
                onDelete={handleDelete}
                accountEmail={accountEmailFor(item.accountId)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadOpen && (
          <UploadModal
            accounts={accounts}
            currentAccountId={currentAccountId}
            currentFolderId={currentFolderId}
            onClose={() => setUploadOpen(false)}
            onUploaded={() => {
              setUploadOpen(false)
              fetchFiles(currentFolderId, currentAccountId)
            }}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <PreviewModal
            item={previewItem}
            accountEmail={accounts.find((a) => a.id === previewItem.accountId)?.account_email}
            onClose={() => setPreviewItem(null)}
            onDownload={() => handleDownload(previewItem)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── FileItem Card ─────────────────────────────────────────────── */

interface FileItemProps {
  item: DriveItem
  renamingId: string | null
  renameValue: string
  actionId: string | null
  onRenameValueChange: (v: string) => void
  onOpenRename: (item: DriveItem) => void
  onConfirmRename: (item: DriveItem) => void
  onCancelRename: () => void
  onNavigate: (item: DriveItem) => void
  onPreview: (item: DriveItem) => void
  onDownload: (item: DriveItem) => void
  onDelete: (item: DriveItem) => void
  accountEmail?: string
}

const FileItem = memo(function FileItem({
  item,
  renamingId,
  renameValue,
  actionId,
  onRenameValueChange,
  onOpenRename,
  onConfirmRename,
  onCancelRename,
  onNavigate,
  onPreview,
  onDownload,
  onDelete,
  accountEmail,
}: FileItemProps) {
  const { Icon, box, iconClass, label } = getCategoryStyle(item.mimeType, item.isFolder)
  const isRenaming = renamingId === item.id
  const isActioning = actionId === item.id
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus()
  }, [isRenaming])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 active:scale-[0.98]",
        item.isFolder
          ? "border-crimson/40 bg-gradient-to-br from-[#1c0f18] via-surface to-surface hover:border-crimson hover:shadow-[0_0_26px_rgba(167,50,72,0.3)] hover:-translate-y-1"
          : "border-border bg-surface hover:border-neon/50 hover:shadow-[0_0_20px_rgba(255,45,120,0.16)] hover:-translate-y-1",
        isActioning && "opacity-60 pointer-events-none"
      )}
      onClick={() => (item.isFolder ? onNavigate(item) : onPreview(item))}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0",
          item.isFolder ? "bg-gradient-to-br from-crimson/30 to-crimson/5 border-crimson/40" : box
        )}>
          <Icon strokeWidth={2} className={cn(
            "w-7 h-7",
            item.isFolder
              ? "text-[#ff6b85] drop-shadow-[0_0_12px_rgba(255,45,120,0.45)]"
              : iconClass
          )} />
        </div>

        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => onRenameValueChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onConfirmRename(item)
                if (e.key === "Escape") onCancelRename()
              }}
              onBlur={() => onConfirmRename(item)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-bg border-2 border-crimson/50 rounded-lg px-3 py-1.5 text-sm text-text outline-none shadow-[0_0_12px_rgba(167,50,72,0.2)]"
            />
          ) : (
            <p
              className={cn(
                "text-base font-semibold leading-tight truncate",
                item.isFolder ? "text-zinc-50" : "text-text"
              )}
              title={item.name}
            >
              {item.name}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[13px] text-zinc-400 font-medium">
              {label}
              {!item.isFolder && (
                <>
                  <span className="mx-1.5 text-text-muted">•</span>
                  {formatFileSize(item.size)}
                </>
              )}
              <span className="mx-1.5 text-text-muted">•</span>
              {formatDate(item.modified_at)}
            </span>
            {accountEmail && (
              <span className={cn(
                "text-xs rounded-lg px-2 py-0.5 border font-medium",
                item.isFolder
                  ? "text-[#ff8ba2] bg-crimson/15 border-crimson/30"
                  : "text-neon bg-neon-muted border-neon/25"
              )}>
                {accountEmail.split("@")[0]}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex flex-col gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150 md:scale-90 md:group-hover:scale-100">
          {!item.isFolder && (
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(item) }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface border border-border text-zinc-400 hover:text-neon hover:border-neon/40 hover:bg-neon-muted transition-colors"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(item) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface border border-border text-zinc-400 hover:text-neon hover:border-neon/40 hover:bg-neon-muted transition-colors"
            title={item.isFolder ? "Open" : "Download"}
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenRename(item) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface border border-border text-zinc-400 hover:text-crimson-hover hover:border-crimson/40 hover:bg-crimson-muted transition-colors"
            title="Rename"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item) }}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface border border-border text-zinc-400 hover:text-danger hover:border-danger/40 hover:bg-danger-muted transition-colors"
            title="Delete"
          >
            {isActioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Image thumbnail preview */}
      {!item.isFolder && item.mimeType.startsWith("image/") && (
        <div className="mt-4 rounded-2xl overflow-hidden bg-bg aspect-video border-2 border-border">
          <img
            src={`/api/drive/files/${item.id}?accountId=${item.accountId}`}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </motion.div>
  )
})

/* ─── Upload Modal ──────────────────────────────────────────────── */

interface UploadModalProps {
  accounts: GoogleAccount[]
  currentAccountId: string | null
  currentFolderId: string
  onClose: () => void
  onUploaded: () => void
}

type UploadKind = "file" | "folder"

interface FolderNode {
  name: string
  driveId: string | null
  children: Map<string, FolderNode>
}

function createFolderNode(name: string): FolderNode {
  return { name, driveId: null, children: new Map() }
}

function UploadModal({ accounts, currentAccountId, currentFolderId, onClose, onUploaded }: UploadModalProps) {
  const [kind, setKind] = useState<UploadKind>("file")
  const [smartMode, setSmartMode] = useState(true)
  const [targetAccountId, setTargetAccountId] = useState(currentAccountId || accounts[0]?.id || "")
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadOne = useCallback(async (file: File, parentId?: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("mode", smartMode ? "smart" : "manual")
    if (!smartMode && targetAccountId) {
      formData.append("accountId", targetAccountId)
    }
    if (parentId) {
      formData.append("parentId", parentId)
    }

    const res = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || `Upload failed (${res.status})`)
    }
    return res.json()
  }, [smartMode, targetAccountId])

  const doUploadFile = useCallback(async (file: File) => {
    setUploading(true)
    setProgress(file.name)
    setError("")
    try {
      await uploadOne(file, currentFolderId === "root" ? undefined : currentFolderId)
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploading(false)
    }
  }, [uploadOne, currentFolderId, onUploaded])

  // Upload a whole folder: create the folder structure then upload each file.
  const doUploadFolder = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError("")

    const tree = new Map<string, FolderNode>()
    const fileList: { file: File; parts: string[] }[] = []

    for (const file of Array.from(files)) {
      const rel = file.webkitRelativePath || file.name
      const parts = rel.split("/").filter(Boolean)
      const fileName = parts[parts.length - 1]
      const dirs = parts.slice(0, -1)

      let node = tree
      for (const dir of dirs) {
        if (!node.has(dir)) node.set(dir, createFolderNode(dir))
        node = node.get(dir)!.children
      }
      fileList.push({ file, parts: dirs.map((d) => d) })
    }

    // Map path strings -> created Drive folder ids.
    const driveFolderIds = new Map<string, string>()

    async function ensureFolder(path: string[], name: string): Promise<string> {
      const cacheKey = path.join("/")
      const rootTarget = currentFolderId === "root" ? undefined : currentFolderId
      if (driveFolderIds.has(cacheKey)) return driveFolderIds.get(cacheKey)!

      const formData = new FormData()
      formData.append("accountId", targetAccountId)
      formData.append("name", name)
      if (path.length === 0) {
        if (rootTarget) formData.append("parentId", rootTarget)
      } else {
        const parentKey = path.slice(0, -1).join("/")
        const parentId = driveFolderIds.get(parentKey) || rootTarget
        if (parentId) formData.append("parentId", parentId)
      }

      const res = await fetch("/api/drive/folders", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to create folder ${name}`)
      }
      const data = await res.json()
      driveFolderIds.set(cacheKey, data.folder.id)
      return data.folder.id
    }

    try {
      // Build creation order: leaf-most dir paths per file.
      let processed = 0
      for (const entry of fileList) {
        // Create parent directories for this file.
        let parentDriveId = currentFolderId === "root" ? undefined : currentFolderId
        let walking: string[] = []
        for (const dir of entry.parts) {
          walking.push(dir)
          if (!driveFolderIds.has(walking.join("/"))) {
            parentDriveId = await ensureFolder(walking.slice(0, -1), dir)
          } else {
            parentDriveId = driveFolderIds.get(walking.join("/"))!
          }
        }
        setProgress(`${entry.file.name} (${++processed}/${fileList.length})`)
        await uploadOne(entry.file, parentDriveId)
      }
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Folder upload failed")
      setUploading(false)
    }
  }, [uploadOne, currentFolderId, targetAccountId, onUploaded])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    if (kind === "folder") {
      doUploadFolder(files)
    } else {
      const file = files[0]
      if (file) doUploadFile(file)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (kind === "folder") {
      doUploadFolder(files)
    } else {
      const file = files[0]
      if (file) doUploadFile(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl border-2 border-crimson/40 bg-surface p-6 shadow-[0_0_30px_rgba(167,50,72,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text">Upload to Drive</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Routing mode toggle */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 rounded-xl bg-bg border border-border p-1">
            <button
              onClick={() => setSmartMode(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                smartMode ? "bg-neon text-bg" : "text-text-muted hover:text-text"
              )}
            >
              <Zap className="w-3 h-3" />
              Smart Routing
            </button>
            <button
              onClick={() => setSmartMode(false)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                !smartMode ? "bg-neon text-bg" : "text-text-muted hover:text-text"
              )}
            >
              <Settings2 className="w-3 h-3" />
              Manual
            </button>
          </div>

          {!smartMode && (
            <motion.select
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-text outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_email}</option>
              ))}
            </motion.select>
          )}
        </div>

        {smartMode && (
          <p className="text-xs text-text-muted mb-4">
            Files automatically route to the drive with the most free space.
          </p>
        )}

        {/* Upload kind toggle */}
        <div className="flex items-center gap-2 rounded-xl bg-bg border border-border p-1 mb-4">
          <button
            onClick={() => { setKind("file"); inputRef.current?.click() }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              kind === "file" ? "bg-neon text-bg" : "text-text-muted hover:text-text"
            )}
          >
            <File className="w-3 h-3" />
            File
          </button>
          <button
            onClick={() => { setKind("folder"); inputRef.current?.click() }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              kind === "folder" ? "bg-neon text-bg" : "text-text-muted hover:text-text"
            )}
          >
            <Folder className="w-3 h-3" />
            Folder
          </button>
        </div>

        {/* Dropzone */}
        <input
          ref={inputRef}
          type="file"
          {...(kind === "folder" ? { webkitdirectory: "", directory: "" } : {})}
          onChange={handleChange}
          className="hidden"
        />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer",
            dragActive
              ? "border-neon bg-neon-muted shadow-[0_0_20px_rgba(255,45,120,0.15)]"
              : "border-border hover:border-crimson/50 hover:bg-surface-hover"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-neon animate-spin" />
              <p className="text-sm text-text-muted">Uploading {progress}...</p>
            </div>
          ) : kind === "folder" ? (
            <div className="flex flex-col items-center gap-2">
              <Folder className="w-8 h-8 text-text-muted" />
              <p className="text-sm text-text-muted">
                <span className="text-neon font-medium">Click to choose</span> a folder to upload
              </p>
              <p className="text-xs text-text-muted/60">Uploads the entire folder structure</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-text-muted" />
              <p className="text-sm text-text-muted">
                <span className="text-neon font-medium">Click to choose</span> or drag & drop
              </p>
              <p className="text-xs text-text-muted/60">Any file type</p>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-xs text-danger bg-danger-muted rounded-lg px-3 py-2">{error}</p>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ─── Preview Modal ─────────────────────────────────────────────── */

interface PreviewModalProps {
  item: DriveItem
  accountEmail?: string
  onClose: () => void
  onDownload: () => void
}

function PreviewModal({ item, accountEmail, onClose, onDownload }: PreviewModalProps) {
  const isImage = item.mimeType.startsWith("image/")
  const isVideo = item.mimeType.startsWith("video/")
  const isAudio = item.mimeType.startsWith("audio/")
  const isPdf = item.mimeType.includes("pdf")
  const src = `/api/drive/files/${item.id}?accountId=${item.accountId}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn(
          "rounded-2xl border-2 border-crimson/40 bg-surface overflow-hidden shadow-[0_0_40px_rgba(167,50,72,0.2)]",
          isImage || isVideo ? "max-w-4xl w-full" : "max-w-md w-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text truncate">{item.name}</p>
            <p className="text-xs text-text-muted">
              {formatFileSize(item.size)} &middot; {accountEmail || "Unknown drive"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neon text-bg hover:bg-neon-hover transition-colors"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {isImage ? (
            <img
              src={src}
              alt={item.name}
              className="max-h-[70vh] mx-auto rounded-lg object-contain"
            />
          ) : isVideo ? (
            <video
              src={src}
              controls
              className="max-h-[70vh] mx-auto rounded-lg"
            />
          ) : isAudio ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="w-20 h-20 rounded-2xl bg-neon-muted border-2 border-crimson/30 flex items-center justify-center">
                <Music className="w-9 h-9 text-neon" />
              </div>
              <audio src={src} controls className="w-full max-w-sm" />
            </div>
          ) : isPdf ? (
            <iframe
              src={src}
              className="w-full h-[70vh] rounded-lg border border-border"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="w-20 h-20 rounded-2xl bg-neon-muted border-2 border-crimson/30 flex items-center justify-center">
                <File className="w-9 h-9 text-neon" />
              </div>
              <p className="text-sm text-text-muted">
                Preview not available for this file type.
              </p>
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-neon text-bg hover:bg-neon-hover transition-colors"
              >
                <Download className="w-4 h-4" />
                Download to view
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

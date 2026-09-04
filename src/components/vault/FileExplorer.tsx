"use client"

import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Folder,
  FolderPlus,
  File,
  Music,
  Upload,
  ChevronRight,
  ChevronDown,
  Home,
  X,
  Loader2,
  Zap,
  Settings2,
  ArrowUpDown,
  Check,
} from "lucide-react"
import { cn, formatFileSize, formatDate } from "@/lib/utils"
import type { GoogleAccount } from "@/types"
import { zipSync } from "fflate"
import { encryptVaultBytes } from "@/lib/crypto-vault"
import { Search as PixelSearch, Upload as PixelUpload } from "pixelarticons/react"
import {
  Archive as PixelArchive,
  File as PixelFile,
  FileText as PixelFileText,
  Folder as PixelFolder,
  Image as PixelImage,
  Music as PixelMusic,
  Presentation as PixelPresentation,
  Video as PixelVideo,
  Braces as PixelCode,
  Grid3x3 as PixelSpreadsheet,
  Download as PixelDownload,
  Eye as PixelEye,
  Loader as PixelLoader,
  Pencil as PixelPencil,
  Trash as PixelTrash,
} from "pixelarticons/react"

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
  Icon: React.ElementType
  box: string
  iconClass: string
  label: string
  pixelIcon?: string
}

const categoryStyles: Record<string, CategoryStyle> = {
  folder: {
    Icon: PixelFolder,
    box: "border-2 border-crimson/50 bg-crimson-muted/30 pixel-shadow-crimson",
    iconClass: "text-[#ff6b85]",
    label: "FOLDER",
  },
  image: {
    Icon: PixelImage,
    box: "border-2 border-emerald-500/50 bg-emerald-500/10 pixel-shadow-dark",
    iconClass: "text-emerald-400",
    label: "PNG",
  },
  video: {
    Icon: PixelVideo,
    box: "border-2 border-sky-500/50 bg-sky-500/10 pixel-shadow-dark",
    iconClass: "text-sky-400",
    label: "VIDEO",
  },
  audio: {
    Icon: PixelMusic,
    box: "border-2 border-[#2b0057]/50 bg-[#2b0057]/10 pixel-shadow-dark",
    iconClass: "text-[#2b0057]",
    label: "AUDIO",
  },
  pdf: {
    Icon: PixelFileText,
    box: "border-2 border-red-500/50 bg-red-500/10 pixel-shadow-dark",
    iconClass: "text-red-400",
    label: "PDF",
  },
  document: {
    Icon: PixelFileText,
    box: "border-2 border-blue-500/50 bg-blue-500/10 pixel-shadow-dark",
    iconClass: "text-blue-400",
    label: "DOCX",
  },
  spreadsheet: {
    Icon: PixelSpreadsheet,
    box: "border-2 border-lime-500/50 bg-lime-500/10 pixel-shadow-dark",
    iconClass: "text-lime-400",
    label: "EXCEL",
  },
  presentation: {
    Icon: PixelPresentation,
    box: "border-2 border-orange-500/50 bg-orange-500/10 pixel-shadow-dark",
    iconClass: "text-orange-400",
    label: "SLIDES",
  },
  code: {
    Icon: PixelCode,
    box: "border-2 border-fuchsia-500/50 bg-fuchsia-500/10 pixel-shadow-dark",
    iconClass: "text-fuchsia-400",
    label: "TXT",
  },
  archive: {
    Icon: PixelArchive,
    box: "border-2 border-accent/50 bg-accent/10 pixel-shadow-dark",
    iconClass: "text-accent",
    label: "ZIP",
  },
  file: {
    Icon: PixelFile,
    box: "border-2 border-neon/40 bg-neon-muted/20 pixel-shadow-neon",
    iconClass: "text-neon",
    label: "FILE",
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
  { key: "name-asc", label: "NAME (A-Z)" },
  { key: "name-desc", label: "NAME (Z-A)" },
  { key: "modified-desc", label: "MODIFIED (NEWEST)" },
  { key: "modified-asc", label: "MODIFIED (OLDEST)" },
  { key: "size-desc", label: "SIZE (LARGEST)" },
  { key: "size-asc", label: "SIZE (SMALLEST)" },
  { key: "type", label: "FILE TYPE" },
  { key: "account", label: "DRIVE ACCOUNT" },
  { key: "kind", label: "FOLDERS FIRST" },
]

export function FileExplorer({ accounts }: FileExplorerProps) {
  const [items, setItems] = useState<DriveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [currentFolderId, setCurrentFolderId] = useState("root")
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

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
      setItems(allItems)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      const timer = window.setTimeout(() => fetchFiles(currentFolderId, currentAccountId), 0)
      return () => window.clearTimeout(timer)
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
      switch (sortKey) {
        case "name-desc":
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
          return b.name.localeCompare(a.name)
        case "modified-desc":
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
          return (b.modified_at || "").localeCompare(a.modified_at || "")
        case "modified-asc":
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
          return (a.modified_at || "").localeCompare(b.modified_at || "")
        case "size-desc":
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
          return b.size - a.size
        case "size-asc":
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
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
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
          return a.name.localeCompare(b.name)
        default:
          if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
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
    if (!confirm(`DELETE "${item.name}"?`)) return
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
        setItems((prev) => [newFolder, ...prev])
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

  useEffect(() => {
    if (!searchQuery.trim()) return
    const t = setTimeout(() => doSearch(), 400)
    return () => clearTimeout(t)
  }, [searchQuery, doSearch])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto pb-10"
    >
      {/* ── Search bar (always visible) ── */}
      <div className="relative">
        <PixelSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
        <input
          type="text"
          id="file-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder="SEARCH FILES..."
          className="w-full h-11 sm:h-12 lg:h-14 pl-11 pr-12 bg-surface border-2 border-border font-pixel text-xs lg:text-sm text-text placeholder:text-text-muted/60 outline-none focus:border-accent focus:shadow-[3px_3px_0_0_rgba(221,44,0,0.45)] transition-all"
        />
        <AnimatePresence>
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.12 }}
              onClick={() => {
                setSearchQuery("")
                fetchFiles(currentFolderId, currentAccountId)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Page header + action buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="font-pixel text-base sm:text-lg font-bold text-text tracking-wider leading-tight">
            MY SECURE VAULT
          </h1>
          <p className="font-pixel text-[10px] text-text-muted mt-1.5">
            {searchQuery.trim()
              ? `RESULTS FOR "${searchQuery.toUpperCase()}"`
              : "CONNECTED GOOGLE DRIVE ACCOUNTS"}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setCreatingFolder(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 lg:h-12 px-3.5 sm:px-4 lg:px-5 font-pixel text-[11px] sm:text-xs lg:text-sm border-2 border-accent text-accent hover:bg-accent/20 pixel-shadow-dark active:translate-x-0.5 active:translate-y-0.5 transition-all whitespace-nowrap"
          >
            <FolderPlus className="w-4 h-4 shrink-0" />
            <span>NEW FOLDER</span>
          </button>

          <button
            onClick={() => setUploadOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 h-10 lg:h-12 px-3.5 sm:px-4 lg:px-5 font-pixel text-[11px] sm:text-xs lg:text-sm border-2 border-neon text-neon hover:bg-neon/20 pixel-shadow-neon active:translate-x-0.5 active:translate-y-0.5 transition-all whitespace-nowrap"
          >
            <PixelUpload className="w-4 h-4 shrink-0" />
            <span>UPLOAD FILES</span>
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className={cn(
                "flex items-center justify-center gap-2 h-10 px-3.5 font-pixel text-[11px] sm:text-xs border-2 transition-all active:translate-x-0.5 active:translate-y-0.5 whitespace-nowrap",
                sortOpen
                  ? "border-neon bg-surface text-neon pixel-shadow-neon"
                  : "border-border bg-surface text-text-muted hover:text-text hover:border-neon/50 pixel-shadow-dark"
              )}
              title="Sort items"
            >
              <ArrowUpDown className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">
                {SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? "SORT"}
              </span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform shrink-0", sortOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 z-50 w-56 border-2 border-border bg-surface p-2 pixel-shadow-dark max-h-[70vh] overflow-y-auto"
                  >
                    <p className="px-3 pt-1.5 pb-2 font-pixel text-[9px] uppercase text-text-muted">
                      SORT BY
                    </p>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortKey(opt.key); setSortOpen(false) }}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-3 py-2 font-pixel text-xs transition-colors",
                          sortKey === opt.key
                            ? "bg-neon-muted text-neon border border-neon/40"
                            : "text-text-muted hover:text-text hover:bg-surface-hover"
                        )}
                      >
                        <span>{opt.label}</span>
                        {sortKey === opt.key && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Account filter pills (horizontally scrollable on mobile) ── */}
      {accounts.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1.5 pt-1 sm:flex-wrap scrollbar-none">
          <button
            onClick={() => switchAccount(null)}
            className={cn(
              "px-3.5 py-1.5 font-pixel text-[10px] transition-all border-2 shrink-0",
                currentAccountId === null
                ? "border-accent bg-accent text-bg font-bold pixel-shadow-dark"
                : "border-border text-text-muted hover:text-text hover:border-accent/40 bg-surface"
            )}
          >
            ALL DRIVES
          </button>
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => switchAccount(a.id)}
              className={cn(
                "px-3.5 py-1.5 font-pixel text-[10px] transition-all border-2 truncate max-w-40 shrink-0",
                currentAccountId === a.id
                  ? "border-accent bg-accent text-bg font-bold pixel-shadow-dark"
                  : "border-border text-text-muted hover:text-text hover:border-accent/40 bg-surface"
              )}
              title={a.account_email}
            >
              {a.account_email.split("@")[0].toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* ── Breadcrumbs ── */}
      {(breadcrumbs.length > 0 || creatingFolder) && (
        <div className="flex items-center gap-2 font-pixel text-[10px] sm:text-xs flex-wrap bg-surface p-2.5 sm:p-3 border-2 border-border overflow-hidden">
          <button
            onClick={() => navigateToBreadcrumb(0)}
            className="flex items-center gap-1.5 text-neon hover:underline shrink-0"
          >
            <Home className="w-4 h-4" />
            <span>ROOT</span>
          </button>
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb.accountId}-${crumb.id}`} className="flex items-center gap-2 text-text-muted min-w-0">
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <button
                onClick={() => navigateToBreadcrumb(i + 1)}
                className={cn(
                  "truncate max-w-25 sm:max-w-40 uppercase",
                  i === breadcrumbs.length - 1
                    ? "text-text font-bold underline"
                    : "text-neon/80 hover:underline"
                )}
              >
                {crumb.name}
              </button>
            </span>
          ))}
          {creatingFolder && (
            <span className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
              <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
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
                placeholder="FOLDER NAME..."
                className="bg-bg border-2 border-crimson px-3 py-1 text-xs text-text font-pixel outline-none w-full sm:w-48 pixel-shadow-crimson"
              />
            </span>
          )}
        </div>
      )}

      {/* ── File list grid ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 text-neon animate-spin" />
          <p className="font-pixel text-xs text-text-muted">LOADING VAULT...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center border-2 border-dashed border-crimson/40 bg-surface/50 p-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-crimson/60 bg-surface flex items-center justify-center mb-4 pixel-shadow-crimson">
            <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-crimson" />
          </div>
          <h3 className="font-pixel text-xs sm:text-sm text-text">NO FILES FOUND</h3>
          <p className="font-pixel text-[10px] text-text-muted mt-2 max-w-sm leading-relaxed">
            {searchQuery
              ? "TRY ANOTHER SEARCH QUERY"
              : "UPLOAD FILES OR CREATE A NEW FOLDER"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-pixel text-[9px] sm:text-[10px] text-text-muted tracking-widest uppercase">
              FILES & FOLDERS ({sortedItems.length})
            </span>
          </div>

          {/* Clean 2-column grid on lg+ screens, 1-column on mobile/tablet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item) => (
                <FileCard
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
        </div>
      )}

      {/* ── Upload Modal ── */}
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

      {/* ── Preview Modal ── */}
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

/* ─── FileCard Component ───────────────────────────────────────── */

interface FileCardProps {
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

const FileCard = memo(function FileCard({
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
}: FileCardProps) {
  const { Icon, iconClass, label, pixelIcon } = getCategoryStyle(item.mimeType, item.isFolder)
  const isRenaming = renamingId === item.id
  const isActioning = actionId === item.id
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isRenaming) renameInputRef.current?.focus()
  }, [isRenaming])

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      className={cn(
        // PC (sm: and up): flex row items-center justify-between gap-4 p-3.5
        // Mobile (< sm): flex-col items-stretch gap-3 p-3
        "group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-3.5 lg:p-5 border-2 cursor-pointer transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5",
        item.isFolder
          ? "border-danger/40 bg-surface hover:border-danger hover:bg-danger/10 shadow-[3px_3px_0_0_rgba(248,113,113,0.35)]"
          : "border-border bg-surface hover:border-danger/60 hover:bg-danger/10 pixel-shadow-dark",
        isActioning && "opacity-50 pointer-events-none"
      )}
      onClick={() => (item.isFolder ? onNavigate(item) : onPreview(item))}
    >
      {/* ── Left side: Icon Box + File Info ── */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1 w-full sm:w-auto">
        {/* ICON BOX - w-12 h-12 on mobile, w-14 h-14 on PC */}
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden leading-none transition-transform group-hover:scale-105 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
          {pixelIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pixelIcon}
              alt={label}
              width={48}
              height={48}
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          ) : (
            <span className="grid h-8 w-8 place-items-center sm:h-9 sm:w-9 lg:h-10 lg:w-10">
              <Icon className={cn("block h-full w-full shrink-0", iconClass)} />
            </span>
          )}
        </div>

        {/* File Name & Account Details */}
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
              className="w-full bg-bg border-2 border-crimson px-2 py-1 font-pixel text-xs text-text outline-none pixel-shadow-crimson"
            />
          ) : (
            <h4
              className={cn(
                "font-pixel text-xs leading-snug truncate tracking-wide lg:text-sm",
                item.isFolder ? "text-text font-bold" : "text-text"
              )}
              title={item.name}
            >
              {item.name}
            </h4>
          )}

          <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
            <span className="font-pixel text-[9px] text-text-muted truncate max-w-32.5">
              {accountEmail ? accountEmail.split("@")[0] : label}
            </span>
            {!item.isFolder && (
              <span className="font-pixel text-[9px] text-text-muted/70">
                &middot; {formatFileSize(item.size)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Right side: Type Badge, Date, and Actions ── */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-border/40 sm:border-t-0">
        <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1">
          <span className={cn(
            "font-pixel text-[8px] px-2 py-0.5 border font-bold uppercase tracking-wider whitespace-nowrap",
            item.isFolder
              ? "text-[#ff8ba2] bg-crimson/20 border-crimson/50"
              : "text-neon bg-neon-muted border-neon/40"
          )}>
            {label}
          </span>
          <span className="font-pixel text-[8px] text-text-muted/70 whitespace-nowrap">
            {formatDate(item.modified_at)}
          </span>
        </div>

        {/* Inline Actions */}
        <div
          className="flex items-center gap-1 sm:pl-1 sm:border-l sm:border-border/50"
          onClick={(e) => e.stopPropagation()}
        >
          {!item.isFolder && (
            <button
              onClick={() => onPreview(item)}
              className="h-9 w-9 border border-transparent hover:border-neon/40 hover:bg-neon-muted flex items-center justify-center text-text-muted hover:text-neon transition-all lg:h-10 lg:w-10"
              title="Preview"
            >
              <PixelEye className="h-4 w-4 lg:h-5 lg:w-5" />
            </button>
          )}
          <button
            onClick={() => onDownload(item)}
            className="h-9 w-9 border border-transparent hover:border-neon/40 hover:bg-neon-muted flex items-center justify-center text-text-muted hover:text-neon transition-all lg:h-10 lg:w-10"
            title={item.isFolder ? "Open" : "Download"}
          >
            <PixelDownload className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
          <button
            onClick={() => onOpenRename(item)}
            className="h-9 w-9 border border-transparent hover:border-crimson/40 hover:bg-crimson-muted flex items-center justify-center text-text-muted hover:text-crimson-hover transition-all lg:h-10 lg:w-10"
            title="Rename"
          >
            <PixelPencil className="h-4 w-4 lg:h-5 lg:w-5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="h-9 w-9 border border-transparent hover:border-danger/40 hover:bg-danger-muted flex items-center justify-center text-text-muted hover:text-danger transition-all lg:h-10 lg:w-10"
            title="Delete"
          >
            {isActioning
              ? <PixelLoader className="h-4 w-4 animate-spin lg:h-5 lg:w-5" />
              : <PixelTrash className="h-4 w-4 lg:h-5 lg:w-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  )
})

/* ─── Upload Modal ──────────────────────────────────────────── */

interface UploadModalProps {
  accounts: GoogleAccount[]
  currentAccountId: string | null
  currentFolderId: string
  onClose: () => void
  onUploaded: () => void
}

type UploadKind = "file" | "folder"

function UploadModal({ accounts, currentAccountId, currentFolderId, onClose, onUploaded }: UploadModalProps) {
  const [kind, setKind] = useState<UploadKind>("file")
  const [smartMode, setSmartMode] = useState(true)
  const [targetAccountId, setTargetAccountId] = useState(currentAccountId || accounts[0]?.id || "")
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState({ label: "", percent: 0 })
  const [error, setError] = useState("")
  const [compressZip, setCompressZip] = useState(false)
  const [encryptBeforeUpload, setEncryptBeforeUpload] = useState(false)
  const [vaultPassword, setVaultPassword] = useState("")
  const [estimatedSavings, setEstimatedSavings] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadOne = useCallback(async (
    file: File,
    parentId?: string,
    onProgress?: (percent: number) => void
  ) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("mode", smartMode ? "smart" : "manual")
    if (!smartMode && targetAccountId) {
      formData.append("accountId", targetAccountId)
    }
    if (parentId) {
      formData.append("parentId", parentId)
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/storage/upload")
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.round((event.loaded / event.total) * 100))
        }
      })
      xhr.addEventListener("load", () => {
        let data: { error?: string } & Record<string, unknown> = {}
        try {
          data = JSON.parse(xhr.responseText) as typeof data
        } catch {
          // Keep the generic HTTP error when the server returns non-JSON.
        }
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(data.error || `Upload failed (${xhr.status})`))
          return
        }
        resolve(data)
      })
      xhr.addEventListener("error", () => reject(new Error("Upload failed: network error")))
      xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")))
      xhr.send(formData)
    })
  }, [smartMode, targetAccountId])

  const prepareUpload = useCallback(async (files: File[]) => {
    if (!compressZip && !encryptBeforeUpload) return files
    const sourceSize = files.reduce((total, file) => total + file.size, 0)
    let output: File

    if (compressZip) {
      const entries: Record<string, Uint8Array> = {}
      for (const [index, file] of files.entries()) {
        setProgress({ label: `COMPRESSING ${file.name}`, percent: Math.round((index / files.length) * 45) })
        entries[file.webkitRelativePath || file.name] = new Uint8Array(await file.arrayBuffer())
        setProgress({ label: `COMPRESSING ${file.name}`, percent: Math.round(((index + 1) / files.length) * 45) })
      }
      const zipped = zipSync(entries, { level: 6, mtime: new Date() })
      setEstimatedSavings(sourceSize > 0 ? Math.max(0, Math.round((1 - zipped.length / sourceSize) * 100)) : 0)
      output = new globalThis.File([zipped], files.length === 1 ? `${files[0].name}.zip` : "zekora-vault.zip", { type: "application/zip" })
    } else {
      output = files[0]
    }

    if (encryptBeforeUpload) {
      if (vaultPassword.length < 8) throw new Error("Enter an encryption password with at least 8 characters")
      setProgress({ label: "ENCRYPTING IN BROWSER", percent: 45 })
      const encrypted = await encryptVaultBytes(new Uint8Array(await output.arrayBuffer()), vaultPassword)
      output = new globalThis.File([encrypted], `${output.name}.zekora`, { type: "application/octet-stream" })
    }
    return [output]
  }, [compressZip, encryptBeforeUpload, vaultPassword])

  const doUploadFile = useCallback(async (file: File) => {
    setUploading(true)
    setProgress({ label: file.name, percent: 0 })
    setError("")
    try {
      const prepared = await prepareUpload([file])
      await uploadOne(
        prepared[0],
        currentFolderId === "root" ? undefined : currentFolderId,
        (percent) => setProgress({ label: `UPLOADING ${prepared[0].name}`, percent })
      )
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploading(false)
    }
  }, [uploadOne, prepareUpload, currentFolderId, onUploaded])

  const doUploadSelection = useCallback(async (files: FileList) => {
    const selected = Array.from(files)
    if (selected.length === 0) return
    if (selected.length === 1) {
      await doUploadFile(selected[0])
      return
    }
    setUploading(true)
    setError("")
    try {
      const prepared = await prepareUpload(selected)
      for (const [index, file] of prepared.entries()) {
        await uploadOne(file, currentFolderId === "root" ? undefined : currentFolderId, (percent) =>
          setProgress({ label: `UPLOADING ${file.name}`, percent: Math.round(((index + percent / 100) / prepared.length) * 100) })
        )
      }
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploading(false)
    }
  }, [doUploadFile, prepareUpload, uploadOne, currentFolderId, onUploaded])

  const doUploadFolder = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setError("")

    if (compressZip || encryptBeforeUpload) {
      try {
        const prepared = await prepareUpload(Array.from(files))
        await uploadOne(prepared[0], currentFolderId === "root" ? undefined : currentFolderId, (percent) =>
          setProgress({ label: `UPLOADING ${prepared[0].name}`, percent })
        )
        onUploaded()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Folder upload failed")
        setUploading(false)
      }
      return
    }

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

      const res = await fetch("/api/drive/folders", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to create folder ${name}`)
      }
      const data = await res.json()
      driveFolderIds.set(cacheKey, data.folder.id)
      return data.folder.id
    }

    const fileList: { file: File; parts: string[] }[] = []
    for (const file of Array.from(files)) {
      const rel = file.webkitRelativePath || file.name
      const parts = rel.split("/").filter(Boolean)
      const dirs = parts.slice(0, -1)
      fileList.push({ file, parts: dirs })
    }

    try {
      let processed = 0
      for (const [index, entry] of fileList.entries()) {
        let parentDriveId: string | undefined = currentFolderId === "root" ? undefined : currentFolderId
        const walking: string[] = []
        for (const dir of entry.parts) {
          walking.push(dir)
          if (!driveFolderIds.has(walking.join("/"))) {
            parentDriveId = await ensureFolder(walking.slice(0, -1), dir)
          } else {
            parentDriveId = driveFolderIds.get(walking.join("/"))!
          }
        }
        setProgress({
          label: `${entry.file.name} (${processed + 1}/${fileList.length})`,
          percent: Math.round((processed / fileList.length) * 100),
        })
        await uploadOne(entry.file, parentDriveId, (percent) => {
          setProgress({
            label: `${entry.file.name} (${index + 1}/${fileList.length})`,
            percent: Math.round(((index + percent / 100) / fileList.length) * 100),
          })
        })
        processed++
      }
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Folder upload failed")
      setUploading(false)
    }
  }, [uploadOne, prepareUpload, compressZip, encryptBeforeUpload, currentFolderId, targetAccountId, onUploaded])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    if (kind === "folder") doUploadFolder(files)
    else doUploadSelection(files)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (kind === "folder") doUploadFolder(files)
    else doUploadSelection(files)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg border-2 border-neon bg-surface p-4 sm:p-6 pixel-shadow-neon max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-pixel text-xs sm:text-sm font-bold text-text">UPLOAD TO DRIVE</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 border border-border flex items-center justify-center text-text-muted hover:text-neon hover:border-neon transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Routing mode */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2 border-2 border-border p-1 bg-bg">
            <button
              onClick={() => setSmartMode(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 font-pixel text-[10px] transition-colors flex-1 sm:flex-none justify-center",
                smartMode ? "bg-neon text-bg font-bold" : "text-text-muted hover:text-text"
              )}
            >
              <Zap className="w-3 h-3" />
              SMART ROUTING
            </button>
            <button
              onClick={() => setSmartMode(false)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 font-pixel text-[10px] transition-colors flex-1 sm:flex-none justify-center",
                !smartMode ? "bg-neon text-bg font-bold" : "text-text-muted hover:text-text"
              )}
            >
              <Settings2 className="w-3 h-3" />
              MANUAL
            </button>
          </div>

          {!smartMode && (
            <select
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className="bg-bg border-2 border-border px-3 py-1.5 font-pixel text-[10px] text-text outline-none w-full sm:w-auto"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.account_email}</option>
              ))}
            </select>
          )}
        </div>

        {smartMode && (
          <p className="font-pixel text-[9px] text-text-muted mb-4 leading-relaxed">
            AUTO-ROUTES TO DRIVE WITH MOST FREE SPACE.
          </p>
        )}

        {/* Kind toggle */}
        <div className="flex items-center gap-2 border-2 border-border p-1 mb-4 bg-bg">
          <button
            onClick={() => { setKind("file"); inputRef.current?.click() }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 font-pixel text-[10px] transition-colors flex-1 justify-center",
              kind === "file" ? "bg-neon text-bg font-bold" : "text-text-muted hover:text-text"
            )}
          >
            <File className="w-3 h-3" />
            FILE
          </button>
          <button
            onClick={() => { setKind("folder"); inputRef.current?.click() }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 font-pixel text-[10px] transition-colors flex-1 justify-center",
              kind === "folder" ? "bg-neon text-bg font-bold" : "text-text-muted hover:text-text"
            )}
          >
            <Folder className="w-3 h-3" />
            FOLDER
          </button>
        </div>

        <div className="mb-4 space-y-2 border-2 border-border bg-bg p-3">
          <label className="flex cursor-pointer items-center gap-2 font-pixel text-[10px] text-text-muted">
            <input type="checkbox" checked={compressZip} onChange={(e) => setCompressZip(e.target.checked)} className="accent-fuchsia-500" />
            <span>COMPRESS INTO ZIP BEFORE UPLOAD</span>
          </label>
          {estimatedSavings !== null && compressZip && (
            <p className="pl-5 font-pixel text-[9px] text-emerald-400">ESTIMATED SPACE SAVINGS: {estimatedSavings}%</p>
          )}
          <label className="flex cursor-pointer items-center gap-2 font-pixel text-[10px] text-text-muted">
            <input type="checkbox" checked={encryptBeforeUpload} onChange={(e) => setEncryptBeforeUpload(e.target.checked)} className="accent-fuchsia-500" />
            <span>ENCRYPT IN BROWSER BEFORE UPLOAD</span>
          </label>
          {encryptBeforeUpload && (
            <input type="password" value={vaultPassword} onChange={(e) => setVaultPassword(e.target.value)} placeholder="ENCRYPTION PASSWORD (8+ CHARACTERS)" className="ml-5 w-[calc(100%-1.25rem)] border-2 border-border bg-surface px-3 py-2 font-pixel text-[9px] text-text outline-none focus:border-neon" />
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          {...(kind === "folder" ? { webkitdirectory: "", directory: "" } : { multiple: true })}
          onChange={handleChange}
          className="hidden"
        />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed p-6 sm:p-10 text-center transition-all cursor-pointer",
            dragActive
              ? "border-neon bg-neon-muted/40 pixel-shadow-neon"
              : "border-border hover:border-neon/60 hover:bg-surface-hover"
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-neon animate-spin" />
              <p className="max-w-full truncate font-pixel text-xs text-text-muted leading-relaxed">
                UPLOADING {progress.label.toUpperCase()}...
              </p>
              <div className="h-4 w-full border-2 border-border bg-bg p-0.5">
                <div
                  className="h-full bg-neon transition-[width] duration-150"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="font-pixel text-[10px] text-neon">{progress.percent}% COMPLETE</p>
            </div>
          ) : kind === "folder" ? (
            <div className="flex flex-col items-center gap-3">
              <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-crimson" />
              <p className="font-pixel text-xs text-text-muted">
                <span className="text-neon font-bold">CLICK TO CHOOSE</span> FOLDER
              </p>
              <p className="font-pixel text-[9px] text-text-muted/60">UPLOADS FULL FOLDER STRUCTURE</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-neon" />
              <p className="font-pixel text-xs text-text-muted">
                <span className="text-neon font-bold">CLICK TO CHOOSE</span> OR DRAG & DROP
              </p>
              <p className="font-pixel text-[9px] text-text-muted/60">ANY FILE TYPE ACCEPTED</p>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 font-pixel text-[10px] text-danger bg-danger-muted border border-danger/40 p-2">{error}</p>
        )}
      </motion.div>
    </motion.div>
  )
}

/* ─── Preview Modal ─────────────────────────────────────────── */

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
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={cn(
          "border-2 border-neon bg-surface overflow-hidden pixel-shadow-neon max-h-[90vh] flex flex-col",
          isImage || isVideo ? "max-w-4xl w-full" : "max-w-md w-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b-2 border-border bg-bg shrink-0 gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-pixel text-xs font-bold text-text truncate">{item.name}</p>
            <p className="font-pixel text-[9px] text-text-muted mt-1 truncate">
              {formatFileSize(item.size)} &middot; {accountEmail?.toUpperCase() || "DRIVE"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 font-pixel text-[10px] bg-neon text-bg font-bold hover:bg-neon-hover transition-colors border border-neon"
            >
              <PixelDownload className="h-4 w-4" />
              <span className="hidden sm:inline">DOWNLOAD</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 overflow-auto">
          {isImage ? (
            <img src={src} alt={item.name} className="max-h-[65vh] mx-auto object-contain border border-border" style={{ imageRendering: "pixelated" }} />
          ) : isVideo ? (
            <video src={src} controls className="max-h-[65vh] mx-auto w-full border border-border" />
          ) : isAudio ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-neon bg-neon-muted flex items-center justify-center pixel-shadow-neon">
                <Music className="w-8 h-8 sm:w-10 sm:h-10 text-neon" />
              </div>
              <audio src={src} controls className="w-full max-w-sm" />
            </div>
          ) : isPdf ? (
            <iframe src={src} className="w-full h-[65vh] border-2 border-border" />
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-neon bg-neon-muted flex items-center justify-center pixel-shadow-neon">
                <File className="w-8 h-8 sm:w-10 sm:h-10 text-neon" />
              </div>
              <p className="font-pixel text-xs text-text-muted leading-relaxed text-center">PREVIEW NOT AVAILABLE FOR THIS FILE TYPE</p>
              <button
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 font-pixel text-xs bg-neon text-bg font-bold hover:bg-neon-hover transition-colors border border-neon"
              >
                <PixelDownload className="h-5 w-5" />
                DOWNLOAD TO VIEW
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

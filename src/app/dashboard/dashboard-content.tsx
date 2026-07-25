"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FileUpload } from "@/components/files/file-upload"
import { FileGrid } from "@/components/files/file-grid"
import { TagInput } from "@/components/shared/tag-input"
import { CollectionPicker } from "@/components/shared/collection-picker"
import { X } from "lucide-react"
import type { FileMetadata, Collection, Tag } from "@/types"

interface DashboardContentProps {
  files: FileMetadata[]
  collections: Collection[]
  tags: Tag[]
}

export function DashboardContent({ files: initialFiles, collections, tags }: DashboardContentProps) {
  const router = useRouter()
  const [files, setFiles] = useState(initialFiles)
  const [uploadError, setUploadError] = useState("")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [filterCollection, setFilterCollection] = useState<string | undefined>()

  const hasFilters = filterTags.length > 0 || filterCollection !== undefined

  const filteredFiles = useMemo(() => {
    let result = files
    if (filterTags.length > 0) {
      result = result.filter((f) => false)
      return result
    }
    if (filterCollection) {
      result = result.filter((f) => false)
      return result
    }
    return result
  }, [files, filterTags, filterCollection])

  const displayFiles = hasFilters ? filteredFiles : files

  const handleUpload = useCallback(async (file: File) => {
    setUploadError("")
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/files", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Upload failed")

    setFiles((prev) => [data.file, ...prev])
    router.refresh()
  }, [router])

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/files/${id}`, { method: "DELETE" })
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id))
      router.refresh()
    }
  }, [router])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl"
    >
      <div>
        <h1 className="text-lg font-medium text-text">Files</h1>
        <p className="text-sm text-text-muted mt-1">
          {files.length} {files.length === 1 ? "file" : "files"} stored
        </p>
      </div>

      <FileUpload onUpload={handleUpload} />

      {uploadError && <p className="text-sm text-danger">{uploadError}</p>}

      {(collections.length > 0 || tags.length > 0) && (
        <div className="space-y-3 p-4 rounded-2xl border border-border bg-surface">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted font-medium">Filters</span>
            {hasFilters && (
              <button
                onClick={() => { setFilterTags([]); setFilterCollection(undefined) }}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-text transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          {collections.length > 0 && (
            <CollectionPicker
              collections={collections}
              value={filterCollection}
              onChange={setFilterCollection}
            />
          )}
          {tags.length > 0 && (
            <TagInput
              tags={filterTags}
              onChange={setFilterTags}
              suggestions={tags.map((t) => t.name)}
              placeholder="Filter by tags..."
            />
          )}
        </div>
      )}

      <FileGrid files={displayFiles} onDelete={handleDelete} />
    </motion.div>
  )
}

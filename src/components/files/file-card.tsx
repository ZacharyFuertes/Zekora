"use client"

import { motion } from "framer-motion"
import {
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  Trash2,
} from "lucide-react"
import { cn, formatFileSize, formatDate, getFileIcon } from "@/lib/utils"
import type { FileMetadata } from "@/types"

const iconMap = {
  image: Image,
  video: Video,
  audio: Music,
  pdf: FileText,
  document: FileText,
  archive: Archive,
  file: File,
}

interface FileCardProps {
  file: FileMetadata
  onDelete?: (id: string) => void
}

export function FileCard({ file, onDelete }: FileCardProps) {
  const Icon = iconMap[getFileIcon(file.type) as keyof typeof iconMap] || File

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative rounded-2xl border border-border bg-surface p-4 hover:bg-surface-hover transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text truncate">
            {file.name}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            {formatFileSize(file.size)} &middot; {formatDate(file.created_at)}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(file.id)}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-danger-muted transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {file.type.startsWith("image/") && (
        <div
          className="mt-3 rounded-xl overflow-hidden bg-bg aspect-video bg-cover bg-center"
          style={{ backgroundImage: `url(${file.url})` }}
        />
      )}
    </motion.div>
  )
}

"use client"

import { AnimatePresence } from "framer-motion"
import { FileCard } from "./file-card"
import type { FileMetadata } from "@/types"
import { Inbox } from "lucide-react"

interface FileGridProps {
  files: FileMetadata[]
  onDelete?: (id: string) => void
}

export function FileGrid({ files, onDelete }: FileGridProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
          <Inbox className="w-7 h-7 text-text-muted" />
        </div>
        <h3 className="text-base font-medium text-text">Your vault is empty</h3>
        <p className="text-sm text-text-muted mt-1 max-w-xs">
          Upload your first file to start building your personal collection.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <FileCard key={file.id} file={file} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  )
}

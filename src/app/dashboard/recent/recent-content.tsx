"use client"

import { motion } from "framer-motion"
import { Clock, Inbox } from "lucide-react"
import { FileCard } from "@/components/files/file-card"
import type { FileMetadata } from "@/types"

interface RecentContentProps {
  files: FileMetadata[]
}

export function RecentContent({ files }: RecentContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl"
    >
      <div>
        <h1 className="text-lg font-medium text-text">Recent</h1>
        <p className="text-sm text-text-muted mt-1">Recently added files and notes</p>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-text-muted" />
          </div>
          <h3 className="text-base font-medium text-text">Nothing yet</h3>
          <p className="text-sm text-text-muted mt-1">Upload files to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

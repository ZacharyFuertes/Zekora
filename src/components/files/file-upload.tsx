"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, Loader2, File } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState("")

  async function handleFile(file: File) {
    setFileName(file.name)
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
      setFileName("")
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        className="hidden"
      />
      <motion.button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative w-full rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          dragActive
            ? "border-primary bg-primary-muted"
            : "border-border hover:border-primary/50 hover:bg-surface-hover"
        )}
      >
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-text-muted">Uploading {fileName}...</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8 text-text-muted" />
              <p className="text-sm text-text-muted">
                <span className="text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-text-muted/60">
                Any file type, up to 50MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

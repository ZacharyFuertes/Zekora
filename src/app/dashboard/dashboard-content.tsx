"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { FileUpload } from "@/components/files/file-upload"
import { FileGrid } from "@/components/files/file-grid"
import type { FileMetadata } from "@/types"

interface DashboardContentProps {
  files: FileMetadata[]
}

export function DashboardContent({ files: initialFiles }: DashboardContentProps) {
  const [files, setFiles] = useState(initialFiles)
  const [uploadError, setUploadError] = useState("")

  const handleUpload = useCallback(async (file: File) => {
    setUploadError("")
    const formData = new FormData()
    formData.append("file", file)
    formData.append("mode", "smart")

    const res = await fetch("/api/storage/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Upload failed")

    const uploaded: FileMetadata = {
      id: data.file.id,
      name: data.file.name,
      mimeType: data.file.mimeType,
      size: Number(data.file.size ?? 0),
      url: `/api/drive/files/${data.file.id}?accountId=${data.accountId}`,
      created_at: data.file.createdTime,
      modified_at: data.file.modifiedTime,
      account_email: undefined,
    }
    setFiles((prev) => [uploaded, ...prev])
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const file = files.find((f) => f.id === id)
    if (!file) return
    const url = new URL(file.url, window.location.origin)
    const accountId = url.searchParams.get("accountId")
    const res = await fetch(`/api/drive/files/${id}?accountId=${accountId}`, {
      method: "DELETE",
    })
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== id))
    }
  }, [files])

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

      <FileGrid files={files} onDelete={handleDelete} />
    </motion.div>
  )
}
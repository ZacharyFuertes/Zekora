"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Tags, Trash2, X, Loader2 } from "lucide-react"
import type { Tag } from "@/types"

interface TagsContentProps {
  tags: Tag[]
}

export function TagsContent({ tags: initial }: TagsContentProps) {
  const router = useRouter()
  const [tags, setTags] = useState(initial)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    setTags((prev) => [...prev, data.tag])
    setName(""); setShowNew(false); setCreating(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE" })
    if (res.ok) {
      setTags((prev) => prev.filter((t) => t.id !== id))
      router.refresh()
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text">Tags</h1>
          <p className="text-sm text-text-muted mt-1">{tags.length} tags</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Tag
        </button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="rounded-2xl border border-border bg-surface p-4 space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-text">New Tag</h3>
              <button type="button" onClick={() => setShowNew(false)}>
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tag name"
              required
              className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={creating || !name}
              className="w-full rounded-xl bg-primary text-bg py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Tag
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {tags.length === 0 && !showNew ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Tags className="w-7 h-7 text-text-muted" />
          </div>
          <h3 className="text-base font-medium text-text">No tags</h3>
          <p className="text-sm text-text-muted mt-1">Tags help you organize your notes and files.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <motion.div
              key={tag.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border hover:bg-surface-hover transition-colors"
            >
              <span className="text-sm text-text">{tag.name}</span>
              <button
                onClick={() => handleDelete(tag.id)}
                className="text-text-muted hover:text-danger transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

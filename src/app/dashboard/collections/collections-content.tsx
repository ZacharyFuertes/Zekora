"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Folder, Trash2, X, Loader2 } from "lucide-react"
import { MOODS, COLLECTION_ICONS } from "@/types"
import { cn } from "@/lib/utils"
import type { Collection } from "@/types"

interface CollectionsContentProps {
  collections: Collection[]
}

export function CollectionsContent({ collections: initial }: CollectionsContentProps) {
  const router = useRouter()
  const [collections, setCollections] = useState(initial)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [mood, setMood] = useState("calm")
  const [color, setColor] = useState("#a78bfa")
  const [creating, setCreating] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, mood, color }),
    })
    const data = await res.json()
    setCollections((prev) => [...prev, data.collection])
    setName(""); setDescription(""); setMood("calm"); setColor("#a78bfa")
    setShowNew(false); setCreating(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" })
    if (res.ok) {
      setCollections((prev) => prev.filter((c) => c.id !== id))
      router.refresh()
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text">Collections</h1>
          <p className="text-sm text-text-muted mt-1">{collections.length} collections</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Collection
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
              <h3 className="text-sm font-medium text-text">New Collection</h3>
              <button type="button" onClick={() => setShowNew(false)}>
                <X className="w-4 h-4 text-text-muted" />
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
              required
              className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors"
            />
            <div>
              <label className="block text-xs text-text-muted mb-1.5">Mood</label>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { setMood(m.id); setColor(m.color) }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                      mood === m.id ? "border-transparent text-bg" : "border-border text-text-muted"
                    )}
                    style={mood === m.id ? { backgroundColor: m.color } : undefined}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={creating || !name}
              className="w-full rounded-xl bg-primary text-bg py-2.5 text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Collection
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {collections.length === 0 && !showNew ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <Folder className="w-7 h-7 text-text-muted" />
          </div>
          <h3 className="text-base font-medium text-text">No collections</h3>
          <p className="text-sm text-text-muted mt-1">Organize your files into collections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-2xl border border-border bg-surface p-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}20` }}>
                    <Folder className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text">{c.name}</h3>
                    {c.description && <p className="text-xs text-text-muted mt-0.5">{c.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted opacity-0 group-hover:opacity-100 hover:text-danger hover:bg-danger-muted transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

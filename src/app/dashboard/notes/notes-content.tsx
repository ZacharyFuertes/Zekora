"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, FileText, Trash2, StickyNote } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import type { Note } from "@/types"

interface NotesContentProps {
  notes: Note[]
}

export function NotesContent({ notes: initialNotes }: NotesContentProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)

  async function handleDelete(id: string) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n._id !== id))
      router.refresh()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-text">Notes</h1>
          <p className="text-sm text-text-muted mt-1">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <Link
          href="/dashboard/notes/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-bg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
            <StickyNote className="w-7 h-7 text-text-muted" />
          </div>
          <h3 className="text-base font-medium text-text">No notes yet</h3>
          <p className="text-sm text-text-muted mt-1">Create your first note to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((note) => (
            <motion.div
              key={note._id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-2xl border border-border bg-surface p-4 hover:bg-surface-hover transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <Link href={`/dashboard/notes/${note._id}`} className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text truncate">{note.title}</h3>
                  <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-lg bg-primary-muted text-primary text-[10px]">
                        {tag}
                      </span>
                    ))}
                    {note.mood && (
                      <span className="px-2 py-0.5 rounded-lg bg-secondary-muted text-secondary text-[10px]">
                        {note.mood}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted/60 mt-2">{formatDate(note.updated_at)}</p>
                </Link>
                <button
                  onClick={() => handleDelete(note._id)}
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

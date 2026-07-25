"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { TagInput } from "@/components/shared/tag-input"
import { CollectionPicker } from "@/components/shared/collection-picker"
import { MoodSelector } from "@/components/shared/mood-selector"
import type { Note, Collection } from "@/types"

interface NoteEditorProps {
  note: Note | null
  isNew: boolean
  collections: Collection[]
  tagSuggestions: string[]
}

export function NoteEditor({ note, isNew, collections, tagSuggestions }: NoteEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [collectionId, setCollectionId] = useState<string | undefined>(note?.collection_id)
  const [mood, setMood] = useState<string | undefined>(note?.mood)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      if (isNew) {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, tags, collection_id: collectionId, mood, type: "standalone" }),
        })
        const data = await res.json()
        router.push(`/dashboard/notes/${data.note._id}`)
      } else if (note) {
        await fetch(`/api/notes/${note._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, tags, collection_id: collectionId, mood }),
        })
      }
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/notes"
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || !title}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-bg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title..."
        className="w-full bg-transparent text-2xl font-medium text-text outline-none placeholder:text-text-muted/30"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        rows={12}
        className="w-full bg-transparent text-sm text-text outline-none resize-none placeholder:text-text-muted/30 leading-relaxed"
      />

      <div className="space-y-4 pt-4 border-t border-border">
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Tags</label>
          <TagInput tags={tags} onChange={setTags} suggestions={tagSuggestions} />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Collection</label>
          <CollectionPicker collections={collections} value={collectionId} onChange={setCollectionId} />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1.5">Mood</label>
          <MoodSelector value={mood} onChange={setMood} />
        </div>
      </div>
    </motion.div>
  )
}

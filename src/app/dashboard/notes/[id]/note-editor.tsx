"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Bold, Italic, List, Loader2, Mic, PencilLine, Save, Type, Underline, Wand2 } from "lucide-react"
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

const toolbarButtons = [
  { icon: PencilLine, label: "Write" },
  { icon: Wand2, label: "AI" },
  { icon: Type, label: "Text" },
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: Underline, label: "Underline" },
  { icon: List, label: "List" },
]

export function NoteEditor({ note, isNew, collections, tagSuggestions }: NoteEditorProps) {
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [title, setTitle] = useState(note?.title ?? "")
  const [content, setContent] = useState(note?.content ?? "")
  const [tags, setTags] = useState<string[]>(note?.tags ?? [])
  const [collectionId, setCollectionId] = useState<string | undefined>(note?.collection_id ?? undefined)
  const [mood, setMood] = useState<string | undefined>(note?.mood ?? undefined)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== (note?.content ?? "")) {
      contentRef.current.innerHTML = note?.content ?? ""
    }
  }, [note?.content])

  const currentCollection = collections.find((collection) => collection.id === collectionId)
  const headerLabel = currentCollection?.name ?? "My work"
  const noteDate = note?.created_at ? new Date(note.created_at) : new Date()
  const formattedDate = noteDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  function focusContent() {
    const editor = contentRef.current
    editor?.focus()
    if (editor && editor.innerText.trim() === "") {
      editor.innerHTML = ""
    }
  }

  function getEditorSelectionRange() {
    const editor = contentRef.current
    if (!editor) return null

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      const range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
      return range
    }

    const range = selection.getRangeAt(0)
    if (!editor.contains(range.startContainer)) {
      const fallbackRange = document.createRange()
      fallbackRange.selectNodeContents(editor)
      fallbackRange.collapse(false)
      selection.removeAllRanges()
      selection.addRange(fallbackRange)
      return fallbackRange
    }

    return range
  }

  function insertPlaceholderText(value: string) {
    const editor = contentRef.current
    if (!editor) return

    const selection = window.getSelection()
    const range = getEditorSelectionRange()
    if (!range) return

    editor.focus()

    const textNode = document.createTextNode(value)
    if (!selection || selection.rangeCount === 0 || !editor.contains(selection.getRangeAt(0).startContainer)) {
      range.selectNodeContents(editor)
      range.collapse(false)
      range.insertNode(textNode)
    } else {
      range.deleteContents()
      range.insertNode(textNode)
    }

    const newRange = document.createRange()
    newRange.setStartAfter(textNode)
    newRange.collapse(true)

    const activeSelection = window.getSelection()
    if (activeSelection) {
      activeSelection.removeAllRanges()
      activeSelection.addRange(newRange)
    }

    setContent(editor.innerHTML)
  }

  function applyInlineFormat(tagName: "b" | "i" | "u") {
    const editor = contentRef.current
    if (!editor) return

    const range = getEditorSelectionRange()
    if (!range) return

    editor.focus()

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      const wrapper = document.createElement(tagName)
      wrapper.textContent = "text"
      range.insertNode(wrapper)
      const caretRange = document.createRange()
      caretRange.selectNodeContents(wrapper)
      caretRange.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(caretRange)
      setContent(editor.innerHTML)
      return
    }

    const selectedText = range.toString() || "text"
    const wrapper = document.createElement(tagName)
    wrapper.textContent = selectedText

    range.deleteContents()
    range.insertNode(wrapper)
    selection.removeAllRanges()
    const newRange = document.createRange()
    newRange.selectNodeContents(wrapper)
    newRange.collapse(false)
    selection.addRange(newRange)
    setContent(editor.innerHTML)
  }

  function handleToolbarAction(action: "write" | "ai" | "text" | "bold" | "italic" | "underline" | "list") {
    const editor = contentRef.current
    if (!editor) return

    editor.focus()

    if (action === "write") {
      return
    }

    if (action === "ai") {
      insertPlaceholderText("\n✨ Idea: ")
      return
    }

    if (action === "text") {
      insertPlaceholderText("\n## Section\n")
      return
    }

    if (action === "bold") {
      applyInlineFormat("b")
      return
    }

    if (action === "italic") {
      applyInlineFormat("i")
      return
    }

    if (action === "underline") {
      applyInlineFormat("u")
      return
    }

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      const listItem = document.createElement("li")
      listItem.textContent = "List item"
      const list = document.createElement("ul")
      list.appendChild(listItem)
      editor.appendChild(list)
      setContent(editor.innerHTML)
      return
    }

    const range = selection.getRangeAt(0)
    const text = range.toString() || "List item"
    const list = document.createElement("ul")
    const item = document.createElement("li")
    item.textContent = text
    list.appendChild(item)
    range.deleteContents()
    range.insertNode(list)
    selection.removeAllRanges()
    const newRange = document.createRange()
    newRange.selectNodeContents(item)
    newRange.collapse(false)
    selection.addRange(newRange)
    setContent(editor.innerHTML)
  }

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
        router.push(`/dashboard/notes/${data.note.id}`)
      } else if (note) {
        await fetch(`/api/notes/${note.id}`, {
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
      className="mx-auto max-w-[820px] px-3 pb-10 pt-4"
    >
      <div className="relative mx-auto max-w-[520px] overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)]/95 shadow-[0_0_0_2px_rgba(255,90,31,0.9),0_18px_40px_rgba(255,90,31,0.45)]">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notes"
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-text-muted transition-colors hover:text-[var(--color-text)]"
              aria-label="Back to notes"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2 rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-text shadow-[inset_0_1px_0_rgba(255,90,31,0.04)]">
              <span className="max-w-[160px] truncate font-medium">{headerLabel}</span>
              <span className="text-[10px] text-text-muted">▾</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !title}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-text-muted transition-colors hover:border-[var(--color-danger)]/70 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Save note"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="px-5 pb-24 pt-3">
          <p className="mt-1 text-xs font-medium tracking-[0.08em] text-text-muted uppercase">
            Date: {formattedDate}
          </p>

          <div className="mt-6 space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled note"
              className="w-full border-0 bg-transparent text-[2.1rem] font-black leading-none tracking-[-0.06em] text-text outline-none placeholder:text-text-muted/35"
            />

            <div
              ref={contentRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(event) => setContent(event.currentTarget.innerHTML)}
              data-placeholder="Start writing..."
              className="min-h-[220px] w-full border-0 bg-transparent text-lg leading-relaxed text-text outline-none empty:before:text-text-muted/35 empty:before:content-[attr(data-placeholder)]"
            />
          </div>

          <div className="mt-6 space-y-4 border-t border-[var(--color-border)] pt-4">
            <div className="flex flex-wrap gap-2">
              <TagInput tags={tags} onChange={setTags} suggestions={tagSuggestions} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5">
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
                  Collection
                </label>
                <CollectionPicker collections={collections} value={collectionId} onChange={setCollectionId} />
              </div>
              <div className="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5">
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
                  Mood
                </label>
                <MoodSelector value={mood} onChange={setMood} />
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/85 to-transparent" />

        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 shadow-[0_4px_0_rgba(255,90,31,0.5)]">
            {toolbarButtons.map(({ icon: Icon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() => {
                  const action = label.toLowerCase().replace(/\s+/g, "")
                  handleToolbarAction(action as "write" | "ai" | "text" | "bold" | "italic" | "underline" | "list")
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-text-muted transition-colors hover:border-[var(--color-danger)]/60 hover:text-[var(--color-primary)] focus:outline-none"
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Voice note"
          className="absolute bottom-1 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-3 border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] shadow-[0_6px_0_rgba(255,90,31,0.4)] transition-transform hover:scale-[1.02]"
        >
          <Mic className="h-6 w-6" />
        </button>
      </div>
    </motion.div>
  )
}

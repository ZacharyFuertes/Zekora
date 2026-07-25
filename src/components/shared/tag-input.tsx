"use client"

import { useState, useRef, KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface TagInputProps {
  tags: string[]
  suggestions?: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, suggestions = [], onChange, placeholder = "Add tag..." }: TagInputProps) {
  const [input, setInput] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(name: string) {
    const trimmed = name.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput("")
    setShowSuggestions(false)
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const filtered = suggestions.filter(
    (s) => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  )

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-bg min-h-[42px] focus-within:border-primary transition-colors">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary-muted text-primary text-xs"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-primary-hover">
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-text outline-none placeholder:text-text-muted/50"
        />
      </div>
      <AnimatePresence>
        {showSuggestions && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-10 top-full mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-lg"
          >
            {filtered.map((s) => (
              <button
                key={s}
                onClick={() => addTag(s)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

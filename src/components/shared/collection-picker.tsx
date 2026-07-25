"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Folder, ChevronDown, X } from "lucide-react"
import type { Collection } from "@/types"

interface CollectionPickerProps {
  collections: Collection[]
  value?: string
  onChange: (id: string | undefined) => void
}

export function CollectionPicker({ collections, value, onChange }: CollectionPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = collections.find((c) => c._id === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-border bg-bg text-sm text-text hover:border-primary/50 transition-colors"
      >
        {selected ? (
          <>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selected.color }} />
            <span>{selected.name}</span>
          </>
        ) : (
          <>
            <Folder className="w-4 h-4 text-text-muted" />
            <span className="text-text-muted">No collection</span>
          </>
        )}
        <ChevronDown className="w-4 h-4 ml-auto text-text-muted" />
      </button>
      {value && (
        <button
          onClick={() => onChange(undefined)}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-10 top-full mt-1 w-full rounded-xl border border-border bg-surface p-1 shadow-lg"
          >
            <button
              onClick={() => { onChange(undefined); setOpen(false) }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              No collection
            </button>
            {collections.map((c) => (
              <button
                key={c._id}
                onClick={() => { onChange(c._id); setOpen(false) }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm text-text hover:bg-surface-hover transition-colors"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

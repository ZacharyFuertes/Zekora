"use client"

import { MOODS } from "@/types"
import { cn } from "@/lib/utils"

interface MoodSelectorProps {
  value?: string
  onChange: (mood: string | undefined) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MOODS.map((mood) => (
        <button
          key={mood.id}
          onClick={() => onChange(value === mood.id ? undefined : mood.id)}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
            value === mood.id
              ? "border-transparent text-bg"
              : "border-border text-text-muted hover:text-text hover:border-primary/50"
          )}
          style={value === mood.id ? { backgroundColor: mood.color } : undefined}
        >
          {mood.label}
        </button>
      ))}
    </div>
  )
}

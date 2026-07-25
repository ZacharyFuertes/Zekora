"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { User, Menu } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const supabase = createClient()
  const [email, setEmail] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? "")
    })
  }, [supabase])

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg hover:bg-surface-hover text-text-muted"
        >
          <Menu className="w-5 h-5" />
        </button>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-sm font-medium text-text">My Vault</h2>
        </motion.div>
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-text-muted truncate hidden sm:block">{email}</span>
        <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center border border-border shrink-0">
          <User className="w-4 h-4 text-text-muted" />
        </div>
      </div>
    </header>
  )
}

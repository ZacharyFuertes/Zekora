"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { User } from "lucide-react"

export function Header() {
  const supabase = createClient()
  const [email, setEmail] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? "")
    })
  }, [supabase])

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-sm font-medium text-text">My Vault</h2>
      </motion.div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">{email}</span>
        <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center border border-border">
          <User className="w-4 h-4 text-text-muted" />
        </div>
      </div>
    </header>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { User, Menu, ChevronDown, LogOut, Settings, HardDrive } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? "")
    })
  }, [supabase])

  const displayName = email
    ? email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)
    : "User"

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <header className="h-16 border-b-2 border-border flex items-center justify-between px-4 sm:px-6 gap-4 bg-surface sticky top-0 z-30">
      {/* Mobile menu trigger */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="relative z-50 min-[1101px]:hidden grid h-10 w-10 place-items-center border-2 border-border bg-bg text-text-muted shadow-[3px_3px_0_0_rgba(0,0,0,0.5)] transition-all hover:border-neon hover:bg-neon-muted hover:text-neon active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Spacer so user profile sits on the right */}
      <div className="flex-1" />

      {/* User profile dropdown container */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            "flex items-center gap-2.5 px-3 py-1.5 rounded-none border-2 transition-all cursor-pointer select-none",
            menuOpen
              ? "border-neon bg-surface text-neon pixel-shadow-neon"
              : "border-border bg-surface-hover hover:border-neon/50 pixel-shadow-dark"
          )}
        >
          <div className="w-7 h-7 rounded-none bg-neon-muted border border-neon/40 flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-neon" />
          </div>
          <span className="font-pixel text-xs text-text hidden sm:block truncate max-w-45">
            {displayName}
          </span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-text-muted hidden sm:block shrink-0 transition-transform duration-200",
              menuOpen && "rotate-180 text-neon"
            )}
          />
        </motion.div>

        {/* Retro Dropdown Menu */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 w-64 border-2 border-neon bg-surface p-3 pixel-shadow-neon"
              >
                {/* User Info Section */}
                <div className="px-2 pb-2.5 mb-2 border-b border-border">
                  <p className="font-pixel text-xs font-bold text-neon truncate">{displayName}</p>
                  <p className="font-pixel text-[9px] text-text-muted mt-1 truncate">{email || "AUTHENTICATED USER"}</p>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 font-pixel text-xs text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                  >
                    <HardDrive className="w-4 h-4 shrink-0 text-neon" />
                    <span>MANAGED DRIVES</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 font-pixel text-xs text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>SETTINGS</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      handleSignOut()
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 font-pixel text-xs text-danger hover:bg-danger-muted border border-transparent hover:border-danger/40 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>SIGN OUT</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

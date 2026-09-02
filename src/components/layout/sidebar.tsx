"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Folder,
  File,
  Tags,
  Clock,
  LayoutGrid,
  ChevronLeft,
  LogOut,
  X,
  HardDrive,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { VaultIcon } from "@/components/ui/vault-icon"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "Storage", href: "/dashboard", icon: LayoutGrid },
  { label: "Drives", href: "/dashboard/settings", icon: HardDrive },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed left-0 top-0 bottom-0 w-64 flex flex-col border-r border-border bg-surface z-50"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-border">
                <div className="flex items-center gap-3">
                  <VaultIcon />
                  <span className="text-sm font-medium text-text">Zekora</span>
                </div>
                <button onClick={onMobileClose} className="p-1 rounded-lg hover:bg-surface-hover text-text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                        isActive
                          ? "bg-primary-muted text-primary"
                          : "text-text-muted hover:text-text hover:bg-surface-hover"
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="p-2 border-t border-border">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-danger hover:bg-danger-muted transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col border-r border-border bg-surface h-dvh sticky top-0 overflow-hidden"
    >
      <div className={cn(
        "flex items-center gap-3 px-4 h-16 border-b border-border",
        collapsed && "justify-center px-0"
      )}>
        <VaultIcon />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-medium text-text whitespace-nowrap overflow-hidden"
            >
              Zekora
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary-muted text-primary"
                  : "text-text-muted hover:text-text hover:bg-surface-hover"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-text hover:bg-surface-hover transition-colors",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <ChevronLeft className={cn(
            "w-4 h-4 shrink-0 transition-transform",
            collapsed && "rotate-180"
          )} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-text-muted hover:text-danger hover:bg-danger-muted transition-colors",
            collapsed && "justify-center px-0"
          )}
          title="Sign out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}

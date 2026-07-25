"use client"

import { useState } from "react"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { VaultIcon } from "@/components/ui/vault-icon"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { label: "All Files", href: "/dashboard", icon: LayoutGrid },
  { label: "Collections", href: "/dashboard/collections", icon: Folder },
  { label: "Notes", href: "/dashboard/notes", icon: File },
  { label: "Tags", href: "/dashboard/tags", icon: Tags },
  { label: "Recent", href: "/dashboard/recent", icon: Clock },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col border-r border-border bg-surface h-dvh sticky top-0 overflow-hidden"
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

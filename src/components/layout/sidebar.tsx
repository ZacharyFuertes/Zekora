"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
} from "lucide-react"
import {
  Grid3x3,
  Folder as PixelFolder,
  Lock as PixelLock,
  Notes as PixelNotes,
  Robot,
  CloudServer,
  Zap,
} from "pixelarticons/react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  disabled?: boolean
  matchExact?: boolean
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Grid3x3, matchExact: true },
  { label: "Files", href: "/dashboard/files", icon: PixelFolder },
  { label: "Assistant", href: "/dashboard/assistant", icon: Robot },
  { label: "Passwords", href: "/dashboard/passwords", icon: PixelLock },
  { label: "Notes", href: "/dashboard/notes", icon: PixelNotes },
  { label: "Hidden Vault", href: "/dashboard/access-logs", icon: PixelLock },
  { label: "Activity", href: "/dashboard/activity", icon: Zap },
]

const bottomNavItems: NavItem[] = [
  { label: "Drives", href: "/dashboard/settings", icon: CloudServer },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick?: () => void
}) {
  const inner = (
    <span
      className={cn(
        "relative flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-sm font-pixel text-xs transition-all border border-transparent",
        isActive
          ? "bg-[#0c0c12] text-[#c62800] border-[#0c0c12] shadow-[3px_3px_0_0_rgba(12,12,18,0.45)]"
          : item.disabled
          ? "text-text-muted/35 cursor-not-allowed select-none"
          : item.href === "/dashboard/files"
          ? "text-[#2b1510] hover:text-[#f87171] hover:bg-[#f87171]/20 hover:border-[#f87171]/60"
          : "text-[#2b1510] hover:text-[#0c0c12] hover:bg-[#c62800]/70 hover:border-[#0c0c12]/30"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#c62800]" />
      )}
      <item.icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.disabled && (
        <span className="text-[9px] text-text-muted/40 font-pixel bg-surface-hover px-1.5 py-0.5 rounded-none border border-border/40">
          Soon
        </span>
      )}
    </span>
  )

  if (item.disabled) return <div>{inner}</div>
  return (
    <Link href={item.href} onClick={onClick}>
      {inner}
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  function isItemActive(item: NavItem): boolean {
    if (item.disabled) return false
    if (item.matchExact) {
      return pathname === item.href
    }
    return pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
  }

  return (
    <>
      {/* Logo */}
      <div className="relative flex items-center justify-center px-5 h-16 border-b-2 border-[#0c0c12] shrink-0">
        <Image src="/zekora-logo-text-new.png" alt="Zekora" width={800} height={375} unoptimized className="h-8 w-50 max-w-full" />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-5 p-1.5 rounded-none border border-border hover:bg-surface-hover text-text-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            isActive={isItemActive(item)}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* Bottom: drives + settings */}
      <div className="px-3 pb-4 border-t-2 border-[#0c0c12] pt-3 space-y-1">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.label}
            item={item}
            isActive={pathname === item.href}
            onClick={onClose}
          />
        ))}
      </div>
    </>
  )
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 1100px)").matches
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1100px)")
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  /* ── Mobile drawer ── */
  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="pointer-events-auto fixed left-0 top-0 bottom-0 z-60 flex w-64 max-w-[80vw] flex-col border-r-2 border-[#0c0c12] bg-[#c62800] pixel-shadow-dark"
            >
              <SidebarContent onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  /* ── Desktop sidebar ── */
  return (
    <aside className="hidden min-[1101px]:flex flex-col w-72 shrink-0 border-r-2 border-[#0c0c12] bg-[#c62800] h-dvh sticky top-0 z-30">
      <SidebarContent />
    </aside>
  )
}

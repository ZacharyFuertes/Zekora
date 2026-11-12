"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { navLinks } from "@/data/landing"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-[100] border-b dz-bd-strong bg-[rgba(9,9,20,0.88)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-6">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="dz-mono dz-terminal-cursor flex items-center gap-1 text-[0.75rem] font-bold uppercase tracking-[0.05em] dz-fg-white"
        >
          <span className="dz-fg-cyan">&gt;</span>
          <span>Zekora</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="dz-link">
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="dz-btn dz-btn-ghost !px-4 !py-2 !text-[0.6875rem]"
          >
            Access
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border dz-bd dz-fg-white transition-colors duration-200 hover:border-[color:var(--dz-border-strong)] md:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      </header>

      <div
        id="mobile-navigation"
        className={cn(
          "fixed inset-0 z-[200] flex flex-col bg-[#090914] px-6 py-5 transition-opacity duration-200 md:hidden",
          open
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        )}
        aria-hidden={!open}
      >
        <div className="flex h-11 items-center justify-between border-b dz-bd pb-5">
          <span className="dz-mono dz-terminal-cursor text-[0.75rem] font-bold uppercase tracking-[0.05em] dz-fg-white">
            <span className="dz-fg-cyan">&gt;</span> Zekora
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border dz-bd dz-fg-white"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-10 flex flex-col gap-2">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b dz-bd py-4 text-[0.75rem] uppercase tracking-[0.04em] dz-fg transition-colors duration-200 hover:text-[color:var(--dz-white)]"
            >
              <span>{link.label}</span>
              <span className="dz-mono text-[0.625rem] dz-fg-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="dz-btn dz-btn-primary mt-auto"
        >
          Access terminal
        </Link>

        <p className="dz-mono mt-4 text-[0.625rem] uppercase tracking-[0.05em] dz-fg-muted">
          STATUS: ONLINE / NODE: ZEKORA-01
        </p>
      </div>
    </>
  )
}

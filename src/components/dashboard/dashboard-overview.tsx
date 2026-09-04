"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  HardDrive,
  PlusCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Server,
  Cloud,
} from "lucide-react"
import { formatFileSize } from "@/lib/utils"
import type { GoogleAccount } from "@/types"
import { ChartLine as PixelChartLine, CloudServer as PixelCloudServer, Folder as PixelFolder } from "pixelarticons/react"

interface DashboardOverviewProps {
  accounts: GoogleAccount[]
}

export function DashboardOverview({ accounts }: DashboardOverviewProps) {
  const totalStorage = accounts.reduce((acc, a) => acc + (a.total_space || 0), 0)
  const usedStorage = accounts.reduce((acc, a) => acc + (a.used_space || 0), 0)
  const freeStorage = Math.max(0, totalStorage - usedStorage)
  const usedPercentage = totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto pb-10"
    >
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-2 border-accent bg-surface shadow-[3px_3px_0_0_rgba(221,44,0,0.45)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-accent animate-pulse" />
            <span className="font-pixel text-[9px] text-accent tracking-widest uppercase">
              SYSTEM COMMAND CENTER
            </span>
          </div>
          <h1 className="font-pixel text-base sm:text-xl font-bold text-text tracking-wider">
            ZEKORA STORAGE VAULT
          </h1>
          <p className="font-pixel text-[10px] text-text-muted mt-1">
            AGGREGATED MULTI-DRIVE CLOUD INFRASTRUCTURE
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/files"
            className="flex items-center gap-2 px-4 py-2.5 font-pixel text-xs bg-accent text-bg font-bold border-2 border-accent pixel-shadow-dark hover:bg-[#c62800] transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <PixelFolder className="w-4 h-4 shrink-0" />
            <span>OPEN FILE VAULT</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </div>
      </div>

      {/* ── Storage Overview Card ── */}
      <div className="border-2 border-border bg-surface p-5 pixel-shadow-dark space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <PixelChartLine className="w-5 h-5 text-accent" />
            <h2 className="font-pixel text-xs sm:text-sm font-bold text-text uppercase">
              TOTAL STORAGE CAPACITY
            </h2>
          </div>
          <span className="font-pixel text-xs text-accent">
            {usedPercentage}% USED ({formatFileSize(usedStorage)} / {formatFileSize(totalStorage)})
          </span>
        </div>

        {/* Pixel Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-5 border-2 border-border bg-bg p-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-crimson to-accent transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, usedPercentage))}%` }}
            />
          </div>
          <div className="flex justify-between font-pixel text-[9px] text-text-muted">
            <span>USED: {formatFileSize(usedStorage)}</span>
            <span>AVAILABLE: {formatFileSize(freeStorage)}</span>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border-2 border-border bg-surface p-4 pixel-shadow-dark">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] text-text-muted uppercase">DRIVES CONNECTED</span>
            <PixelCloudServer className="w-5 h-5 text-accent" />
          </div>
          <p className="font-pixel text-xl font-bold text-text mt-2">{accounts.length}</p>
          <p className="font-pixel text-[9px] text-accent/80 mt-1">ACTIVE INSTANCES</p>
        </div>

        <div className="border-2 border-border bg-surface p-4 pixel-shadow-dark">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] text-text-muted uppercase">FREE SPACE</span>
            <Cloud className="w-5 h-5 text-accent" />
          </div>
          <p className="font-pixel text-xl font-bold text-text mt-2">{formatFileSize(freeStorage)}</p>
          <p className="font-pixel text-[9px] text-accent/80 mt-1">READY FOR ALLOCATIONS</p>
        </div>

        <div className="border-2 border-border bg-surface p-4 pixel-shadow-dark">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] text-text-muted uppercase">SYSTEM STATUS</span>
            <ShieldCheck className="w-5 h-5 text-accent" />
          </div>
          <p className="font-pixel text-base font-bold text-emerald-400 mt-2">ONLINE</p>
          <p className="font-pixel text-[9px] text-accent/80 mt-1">SMART ROUTING ACTIVE</p>
        </div>

        <div className="border-2 border-border bg-surface p-4 pixel-shadow-dark">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] text-text-muted uppercase">ROUTING MODE</span>
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <p className="font-pixel text-base font-bold text-text mt-2">AUTO BALANCED</p>
          <p className="font-pixel text-[9px] text-accent mt-1">MAXIMIZING FREE SPACE</p>
        </div>
      </div>

      {/* ── Connected Drives Detail Breakdown ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-pixel text-xs font-bold text-text uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-accent" />
            CONNECTED GOOGLE DRIVES ({accounts.length})
          </span>
          <Link
            href="/dashboard/settings"
            className="font-pixel text-[10px] text-accent hover:underline flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            MANAGE DRIVES
          </Link>
        </div>

        {accounts.length === 0 ? (
          <div className="border-2 border-dashed border-crimson/50 bg-surface/50 p-8 text-center space-y-3">
            <HardDrive className="w-10 h-10 text-crimson mx-auto" />
            <h3 className="font-pixel text-xs text-text">NO GOOGLE DRIVES CONNECTED</h3>
            <p className="font-pixel text-[9px] text-text-muted max-w-sm mx-auto leading-relaxed">
              CONNECT A GOOGLE DRIVE ACCOUNT IN SETTINGS TO ACCESS CLOUD STORAGE.
            </p>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 px-4 py-2 font-pixel text-xs bg-crimson text-text font-bold border-2 border-crimson pixel-shadow-crimson hover:bg-crimson-hover transition-all"
            >
              CONNECT DRIVE
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => {
              const driveUsedPct = acc.total_space > 0 ? Math.round((acc.used_space / acc.total_space) * 100) : 0
              return (
                <div
                  key={acc.id}
                  className="border-2 border-border bg-surface p-4 pixel-shadow-dark space-y-3 hover:border-neon/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 border-2 border-accent/40 bg-accent-muted flex items-center justify-center shrink-0">
                        <HardDrive className="w-4 h-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-pixel text-xs font-bold text-text truncate" title={acc.account_email}>
                          {acc.account_email.split("@")[0].toUpperCase()}
                        </p>
                        <p className="font-pixel text-[8px] text-text-muted truncate">{acc.account_email}</p>
                      </div>
                    </div>
                    <span className="font-pixel text-[8px] px-2 py-0.5 border border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-pixel text-[9px] text-text-muted">
                      <span>USED: {formatFileSize(acc.used_space)}</span>
                      <span>{driveUsedPct}%</span>
                    </div>
                    <div className="w-full h-3 border border-border bg-bg p-0.5">
                      <div
                        className="h-full bg-neon transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, driveUsedPct))}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

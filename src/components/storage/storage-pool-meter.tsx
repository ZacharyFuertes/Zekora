"use client"

import { motion } from "framer-motion"
import { HardDrive } from "lucide-react"
import { formatFileSize } from "@/lib/utils"
import { cn } from "@/lib/utils"
import type { StoragePool } from "@/types"

interface StoragePoolMeterProps {
  pool: StoragePool | null
  accountCount: number
}

export function StoragePoolMeter({ pool, accountCount }: StoragePoolMeterProps) {
  if (!pool || pool.total === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5 text-text-muted" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text">Storage pool</p>
            <p className="text-xs text-text-muted mt-0.5">
              Connect a Google Drive account to begin.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const usedPercent = pool.usedPercent

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-muted flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5 text-neon" />
          </div>
          <div>
            <p className="text-sm font-medium text-text">Storage pool</p>
            <p className="text-xs text-text-muted mt-0.5">
              {accountCount} {accountCount === 1 ? "account" : "accounts"} &middot;{" "}
              {formatFileSize(pool.used)} of {formatFileSize(pool.total)} used
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-neon">
          {usedPercent}%
        </span>
      </div>

      <div className="h-2.5 rounded-full bg-bg border border-border overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(usedPercent, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            usedPercent > 90
              ? "bg-crimson"
              : usedPercent > 70
              ? "bg-secondary"
              : "bg-neon"
          )}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-text-muted">Free: {formatFileSize(pool.free)}</p>
        <p className="text-xs text-text-muted">Total: {formatFileSize(pool.total)}</p>
      </div>
    </motion.div>
  )
}
"use client"

import { motion } from "framer-motion"
import { HardDrive, Zap } from "lucide-react"
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
      <div className="rounded-xl border-2 border-crimson/30 bg-surface p-5 shadow-[0_0_15px_rgba(167,50,72,0.1)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-muted border-2 border-crimson/30 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6 text-crimson" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text font-mono">STORAGE POOL</p>
            <p className="text-xs text-text-muted mt-1">
              Connect a Google Drive account to activate the storage pool.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const usedPercent = pool.usedPercent
  const capacityLabel = accountCount === 1 ? "1 × 15 GB" : `${accountCount} × 15 GB`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border-2 border-crimson/30 bg-surface p-5 shadow-[0_0_15px_rgba(167,50,72,0.1)]"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-muted border-2 border-neon/20 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,45,120,0.15)]">
            <Zap className="w-6 h-6 text-neon" />
          </div>
          <div>
            <p className="text-sm font-medium text-text font-mono">STORAGE POOL</p>
            <p className="text-xs text-text-muted mt-0.5">
              Capacity: {capacityLabel} &middot; {accountCount} {accountCount === 1 ? "drive" : "drives"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "text-lg font-bold font-mono",
            usedPercent > 90 ? "text-danger" : usedPercent > 70 ? "text-secondary" : "text-neon"
          )}>
            {usedPercent}%
          </p>
          <p className="text-[10px] text-text-muted font-mono uppercase">used</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-bg border-2 border-border overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(usedPercent, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full relative",
            usedPercent > 90
              ? "bg-gradient-to-r from-crimson to-danger"
              : usedPercent > 70
              ? "bg-gradient-to-r from-crimson to-secondary"
              : "bg-gradient-to-r from-crimson to-neon"
          )}
        >
          {usedPercent > 5 && (
            <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
          )}
        </motion.div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-neon shadow-[0_0_6px_rgba(255,45,120,0.4)]" />
          <p className="text-xs text-text-muted font-mono">
            Used: {formatFileSize(pool.used)}
          </p>
        </div>
        <p className="text-xs text-text-muted font-mono">
          Free: {formatFileSize(pool.free)}
        </p>
        <p className="text-xs text-text-muted font-mono">
          Total: {formatFileSize(pool.total)}
        </p>
      </div>

      {/* Per-account breakdown */}
      {pool.accounts.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] text-text-muted font-mono uppercase mb-2">Drive Breakdown</p>
          <div className="space-y-2">
            {pool.accounts.map((acct) => {
              const acctPercent = acct.total > 0
                ? Math.round((acct.used / acct.total) * 1000) / 10
                : 0
              return (
                <div key={acct.account_id} className="flex items-center gap-3">
                  <p className="text-xs text-text-muted truncate w-32 shrink-0 font-mono" title={acct.account_email}>
                    {acct.account_email.split("@")[0]}
                  </p>
                  <div className="flex-1 h-1.5 rounded-full bg-bg border border-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(acctPercent, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className={cn(
                        "h-full rounded-full",
                        acctPercent > 90 ? "bg-danger" : acctPercent > 70 ? "bg-secondary" : "bg-neon"
                      )}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted font-mono w-12 text-right shrink-0">
                    {acctPercent}%
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { HardDrive, Zap } from "lucide-react"
import { formatFileSize, cn } from "@/lib/utils"
import type { StoragePool } from "@/types"

interface StoragePoolMeterProps {
  pool: StoragePool | null
  accountCount: number
}

export function StoragePoolMeter({ pool, accountCount }: StoragePoolMeterProps) {
  if (!pool || pool.total === 0) {
    return (
      <div className="rounded-none border-2 border-crimson/50 bg-surface p-5 pixel-shadow-crimson">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-crimson-muted border-2 border-crimson/60 flex items-center justify-center shrink-0">
            <HardDrive className="w-6 h-6 text-crimson" />
          </div>
          <div className="min-w-0">
            <p className="font-pixel text-xs font-bold text-text uppercase">STORAGE POOL INACTIVE</p>
            <p className="font-pixel text-[10px] text-text-muted mt-1 leading-relaxed">
              CONNECT A GOOGLE DRIVE ACCOUNT TO ACTIVATE STORAGE POOL.
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
      transition={{ duration: 0.3 }}
      className="rounded-none border-2 border-neon bg-surface p-5 pixel-shadow-neon space-y-4"
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-none bg-neon-muted border-2 border-neon flex items-center justify-center shrink-0 pixel-shadow-dark">
            <Zap className="w-6 h-6 text-neon" />
          </div>
          <div>
            <p className="font-pixel text-xs sm:text-sm font-bold text-text uppercase tracking-wider">STORAGE POOL</p>
            <p className="font-pixel text-[10px] text-text-muted mt-1">
              CAPACITY: {capacityLabel} &middot; {accountCount} {accountCount === 1 ? "DRIVE" : "DRIVES"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            "font-pixel text-base sm:text-lg font-bold",
            usedPercent > 90 ? "text-danger" : usedPercent > 70 ? "text-amber-400" : "text-neon"
          )}>
            {usedPercent}%
          </p>
          <p className="font-pixel text-[9px] text-text-muted uppercase">USED</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-4 rounded-none bg-bg border-2 border-border p-0.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(usedPercent, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-none",
            usedPercent > 90
              ? "bg-gradient-to-r from-crimson to-danger"
              : usedPercent > 70
              ? "bg-gradient-to-r from-crimson to-amber-400"
              : "bg-gradient-to-r from-crimson to-neon"
          )}
        />
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between font-pixel text-[10px] text-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-neon animate-pulse" />
          <span>USED: {formatFileSize(pool.used)}</span>
        </div>
        <span>FREE: {formatFileSize(pool.free)}</span>
        <span>TOTAL: {formatFileSize(pool.total)}</span>
      </div>

      {/* Per-account breakdown */}
      {pool.accounts.length > 1 && (
        <div className="pt-3 border-t-2 border-border/60 space-y-2">
          <p className="font-pixel text-[9px] text-text-muted uppercase tracking-wider">DRIVE BREAKDOWN</p>
          <div className="space-y-2">
            {pool.accounts.map((acct) => {
              const acctPercent = acct.total > 0
                ? Math.round((acct.used / acct.total) * 1000) / 10
                : 0
              return (
                <div key={acct.account_id} className="flex items-center gap-3">
                  <p className="font-pixel text-[10px] text-text-muted truncate w-32 shrink-0" title={acct.account_email}>
                    {acct.account_email.split("@")[0].toUpperCase()}
                  </p>
                  <div className="flex-1 h-3 rounded-none bg-bg border border-border p-0.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(acctPercent, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      className={cn(
                        "h-full rounded-none",
                        acctPercent > 90 ? "bg-danger" : acctPercent > 70 ? "bg-amber-400" : "bg-neon"
                      )}
                    />
                  </div>
                  <p className="font-pixel text-[9px] text-text-muted w-12 text-right shrink-0">
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

"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Loader2,
  HardDrive,
  Check,
  AlertTriangle,
  Shield,
} from "lucide-react"
import { formatFileSize, cn } from "@/lib/utils"
import { StoragePoolMeter } from "@/components/drives/StoragePoolMeter"
import type { GoogleAccount, StoragePool } from "@/types"

interface ConnectedDrivesManagerProps {
  accounts: GoogleAccount[]
  pool: StoragePool | null
}

interface ConnectState {
  status: "idle" | "connecting" | "error"
  message?: string
}

export function ConnectedDrivesManager({ accounts: initialAccounts, pool: initialPool }: ConnectedDrivesManagerProps) {
  const router = useRouter()
  const [accounts, setAccounts] = useState(initialAccounts)
  const [connectState, setConnectState] = useState<ConnectState>({ status: "idle" })
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleConnect = useCallback(async () => {
    setConnectState({ status: "connecting" })
    try {
      const res = await fetch("/api/auth/google/connect")
      if (!res.ok) throw new Error("Failed to start connection")
      const data = await res.json()
      window.location.href = data.url
    } catch (error) {
      setConnectState({
        status: "error",
        message: error instanceof Error ? error.message : "Failed to start connection",
      })
    }
  }, [])

  const handleUnlink = useCallback(async (accountId: string) => {
    setRemovingId(accountId)
    try {
      const res = await fetch("/api/storage/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      })
      if (!res.ok) throw new Error("Failed to unlink account")
      setAccounts((prev) => prev.filter((a) => a.id !== accountId))
      router.refresh()
    } finally {
      setRemovingId(null)
    }
  }, [router])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto pb-10"
    >
      {/* Header */}
      <div className="border-b border-border/40 pb-3">
        <h1 className="font-pixel text-base sm:text-lg font-bold text-text uppercase tracking-wider">STORAGE & DRIVES</h1>
        <p className="font-pixel text-[10px] text-text-muted mt-1.5 leading-relaxed">
          LINK MULTIPLE GOOGLE DRIVE ACCOUNTS TO EXPAND YOUR VAULT&apos;S CAPACITY. EACH FREE ACCOUNT ADDS 15&nbsp;GB.
        </p>
      </div>

      {/* Pool meter */}
      <StoragePoolMeter pool={initialPool} accountCount={accounts.length} />

      {/* Accounts section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-pixel text-xs font-bold text-text uppercase tracking-wider">
            CONNECTED DRIVES ({accounts.length})
          </span>
          <button
            onClick={handleConnect}
            disabled={connectState.status === "connecting"}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-none font-pixel text-xs font-bold transition-all border-2 active:translate-x-0.5 active:translate-y-0.5",
              connectState.status === "connecting"
                ? "bg-surface-hover text-text-muted cursor-wait border-border"
                : "bg-neon text-bg border-neon pixel-shadow-neon hover:bg-neon-hover"
            )}
          >
            {connectState.status === "connecting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>ADD GOOGLE ACCOUNT</span>
          </button>
        </div>

        {connectState.status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 font-pixel text-[10px] text-danger bg-danger-muted border border-danger/40 p-3"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{connectState.message?.toUpperCase()}</span>
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {accounts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-crimson/40 bg-surface/50 p-6"
            >
              <div className="w-16 h-16 border-2 border-crimson/60 bg-surface flex items-center justify-center mb-4 pixel-shadow-crimson">
                <HardDrive className="w-8 h-8 text-crimson" />
              </div>
              <h3 className="font-pixel text-xs font-bold text-text">NO DRIVES CONNECTED</h3>
              <p className="font-pixel text-[10px] text-text-muted mt-2 max-w-xs leading-relaxed">
                CONNECT YOUR FIRST GOOGLE ACCOUNT TO UNLOCK 15&nbsp;GB OF SECURE STORAGE.
              </p>
              <button
                onClick={handleConnect}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-none font-pixel text-xs font-bold bg-neon text-bg border-2 border-neon pixel-shadow-neon hover:bg-neon-hover transition-all active:translate-x-0.5 active:translate-y-0.5"
              >
                <Plus className="w-4 h-4" />
                <span>CONNECT FIRST ACCOUNT</span>
              </button>
            </motion.div>
          ) : (
            accounts.map((account) => {
              const usedPercent = account.total_space > 0
                ? Math.round((account.used_space / account.total_space) * 1000) / 10
                : 0

              return (
                <motion.div
                  key={account.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="border-2 border-crimson/40 bg-surface p-4 sm:p-5 pixel-shadow-crimson space-y-3"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Drive icon */}
                    <div className="w-12 h-12 rounded-none bg-crimson-muted/40 border-2 border-crimson/50 flex items-center justify-center shrink-0">
                      <HardDrive className="w-6 h-6 text-crimson" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-pixel text-xs font-bold text-text truncate" title={account.account_email}>
                          {account.account_email}
                        </p>
                        <span className={cn(
                          "shrink-0 flex items-center gap-1 font-pixel text-[8px] uppercase px-2 py-0.5 border font-bold",
                          account.is_active
                            ? "text-neon bg-neon-muted border-neon/40"
                            : "text-text-muted bg-surface-hover border-border"
                        )}>
                          {account.is_active ? <Check className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {account.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      <p className="font-pixel text-[9px] text-text-muted mt-1">
                        {formatFileSize(account.used_space)} OF {formatFileSize(account.total_space)} USED
                      </p>
                    </div>

                    {/* Unlink */}
                    <button
                      onClick={() => handleUnlink(account.id)}
                      disabled={removingId === account.id}
                      className="shrink-0 w-8 h-8 rounded-none flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-muted border border-transparent hover:border-danger/40 transition-all"
                      aria-label={`Unlink ${account.account_email}`}
                      title="Unlink Drive"
                    >
                      {removingId === account.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="h-3 rounded-none bg-bg border-2 border-border p-0.5 overflow-hidden">
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
                  <div className="flex items-center justify-between font-pixel text-[9px] text-text-muted">
                    <p>
                      FREE: {formatFileSize(Math.max(account.total_space - account.used_space, 0))}
                    </p>
                    <p>
                      {usedPercent}%
                    </p>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

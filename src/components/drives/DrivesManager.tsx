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
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-3xl"
    >
      {/* Header */}
      <div>
        <h1 className="text-lg font-medium text-text font-mono tracking-wide">STORAGE</h1>
        <p className="text-sm text-text-muted mt-1">
          Link multiple Google Drive accounts to expand your vault&apos;s capacity.
          Each free account adds 15&nbsp;GB.
        </p>
      </div>

      {/* Pool meter */}
      <StoragePoolMeter pool={initialPool} accountCount={accounts.length} />

      {/* Accounts section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-mono uppercase tracking-widest">Connected Drives</span>
          <button
            onClick={handleConnect}
            disabled={connectState.status === "connecting"}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border-2",
              connectState.status === "connecting"
                ? "bg-surface-hover text-text-muted cursor-wait border-border"
                : "bg-neon text-bg border-neon/60 hover:bg-neon-hover hover:shadow-[0_0_15px_rgba(255,45,120,0.3)] active:scale-95"
            )}
          >
            {connectState.status === "connecting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Google Account
          </button>
        </div>

        {connectState.status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-danger bg-danger-muted border border-danger/20 rounded-xl px-4 py-2.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {connectState.message}
          </motion.div>
        )}

        <AnimatePresence mode="popLayout">
          {accounts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-crimson/30 bg-surface/50"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface border-2 border-crimson/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(167,50,72,0.15)]">
                <HardDrive className="w-7 h-7 text-crimson" />
              </div>
              <h3 className="text-base font-medium text-text">No drives connected</h3>
              <p className="text-sm text-text-muted mt-1 max-w-xs">
                Connect your first Google account to unlock 15&nbsp;GB of secure storage.
              </p>
              <button
                onClick={handleConnect}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-neon text-bg border-2 border-neon/60 hover:bg-neon-hover hover:shadow-[0_0_15px_rgba(255,45,120,0.3)] transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Connect first account
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
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="rounded-xl border-2 border-crimson/30 bg-surface p-5 shadow-[0_0_15px_rgba(167,50,72,0.1)] hover:shadow-[0_0_20px_rgba(167,50,72,0.18)] transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Drive icon */}
                    <div className="w-12 h-12 rounded-xl bg-crimson-muted border-2 border-crimson/30 flex items-center justify-center shrink-0">
                      <HardDrive className="w-6 h-6 text-crimson" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text truncate font-mono">
                          {account.account_email}
                        </p>
                        <span className={cn(
                          "shrink-0 flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border",
                          account.is_active
                            ? "text-neon bg-neon-muted border-neon/20"
                            : "text-text-muted bg-surface-hover border-border"
                        )}>
                          {account.is_active ? <Check className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {account.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1 font-mono">
                        {formatFileSize(account.used_space)} of {formatFileSize(account.total_space)} used
                      </p>
                    </div>

                    {/* Unlink */}
                    <button
                      onClick={() => handleUnlink(account.id)}
                      disabled={removingId === account.id}
                      className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-muted border border-transparent hover:border-danger/30 transition-all"
                      aria-label={`Unlink ${account.account_email}`}
                    >
                      {removingId === account.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-2 rounded-full bg-bg border-2 border-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usedPercent, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        usedPercent > 90
                          ? "bg-gradient-to-r from-crimson to-danger"
                          : usedPercent > 70
                          ? "bg-gradient-to-r from-crimson to-secondary"
                          : "bg-gradient-to-r from-crimson to-neon"
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[10px] text-text-muted font-mono">
                      Free: {formatFileSize(Math.max(account.total_space - account.used_space, 0))}
                    </p>
                    <p className="text-[10px] text-text-muted font-mono">
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

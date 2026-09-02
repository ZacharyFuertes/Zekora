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
} from "lucide-react"
import { formatFileSize } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { StoragePoolMeter } from "@/components/storage/storage-pool-meter"
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
      <div>
        <h1 className="text-lg font-medium text-text">Storage</h1>
        <p className="text-sm text-text-muted mt-1">
          Link multiple Google Drive accounts to expand your vault&apos;s capacity.
          Each free account adds 15&nbsp;GB.
        </p>
      </div>

      <StoragePoolMeter pool={initialPool} accountCount={accounts.length} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted font-medium">CONNECTED DRIVES</span>
          <button
            onClick={handleConnect}
            disabled={connectState.status === "connecting"}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
              connectState.status === "connecting"
                ? "bg-surface-hover text-text-muted cursor-wait"
                : "bg-neon text-bg hover:bg-neon-hover"
            )}
          >
            {connectState.status === "connecting" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Google account
          </button>
        </div>

        {connectState.status === "error" && (
          <p className="text-xs text-danger">{connectState.message}</p>
        )}

        <AnimatePresence>
          {accounts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-border"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                <HardDrive className="w-7 h-7 text-text-muted" />
              </div>
              <h3 className="text-base font-medium text-text">No drives connected</h3>
              <p className="text-sm text-text-muted mt-1 max-w-xs">
                Connect your first Google account to unlock 15&nbsp;GB of secure storage.
              </p>
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
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-muted flex items-center justify-center shrink-0">
                      <HardDrive className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-text truncate">
                          {account.account_email}
                        </p>
                        <span className="shrink-0 flex items-center gap-1 text-[10px] text-secondary">
                          <Check className="w-3 h-3" />
                          Linked
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatFileSize(account.used_space)} of {formatFileSize(account.total_space)} used
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnlink(account.id)}
                      disabled={removingId === account.id}
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-muted transition-colors"
                      aria-label={`Unlink ${account.account_email}`}
                    >
                      {removingId === account.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-bg border border-border overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usedPercent, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        usedPercent > 90 ? "bg-crimson" : "bg-neon"
                      )}
                    />
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
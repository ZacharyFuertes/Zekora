"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface AuthFormProps {
  mode: "login" | "signup"
  onSubmit: (data: { email: string; password: string }) => Promise<void>
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await onSubmit({ email, password })
      if (mode === "login") {
        router.push("/dashboard")
        router.refresh()
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-4 space-y-2 border-2 border-emerald-500/40 bg-emerald-500/10 p-4"
      >
        <p className="font-pixel text-xs text-emerald-400 font-bold">
          CONFIRMATION SENT!
        </p>
        <p className="font-pixel text-[10px] text-text-muted">
          CHECK YOUR EMAIL FOR THE CONFIRMATION LINK.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block font-pixel text-[10px] text-text-muted uppercase tracking-wider mb-2">
          EMAIL ADDRESS
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="YOU@EXAMPLE.COM"
          required
          className="w-full rounded-none border-2 border-border bg-bg px-4 py-3 font-pixel text-xs text-text placeholder:text-text-muted/40 outline-none focus:border-neon focus:pixel-shadow-neon transition-all"
        />
      </div>
      <div>
        <label htmlFor="password" className="block font-pixel text-[10px] text-text-muted uppercase tracking-wider mb-2">
          PASSWORD
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full rounded-none border-2 border-border bg-bg px-4 py-3 font-pixel text-xs text-text placeholder:text-text-muted/40 outline-none focus:border-neon focus:pixel-shadow-neon transition-all"
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-pixel text-[10px] text-danger bg-danger-muted border border-danger/40 p-2"
        >
          {error.toUpperCase()}
        </motion.p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-none bg-neon text-bg font-pixel text-xs font-bold py-3 uppercase tracking-wider border-2 border-neon pixel-shadow-dark hover:bg-neon-hover disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
      </button>
    </form>
  )
}

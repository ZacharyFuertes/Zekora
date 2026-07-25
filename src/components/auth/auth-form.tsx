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
        className="text-center py-4"
      >
        <p className="text-sm text-text-muted">
          Check your email for a confirmation link.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm text-text-muted mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none focus:border-primary transition-colors"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-text-muted mb-1.5">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-muted/50 outline-none focus:border-primary transition-colors"
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-danger"
        >
          {error}
        </motion.p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-primary text-bg font-medium py-2.5 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  )
}

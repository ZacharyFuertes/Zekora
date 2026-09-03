"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, LockKeyhole, LogOut, Loader2 } from "lucide-react"

const KeyRound = (_props: { className?: string }) => null

export function HiddenVaultGate({ onReady }: { onReady?: () => void }) {
  const [exists, setExists] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<"signup" | "login">("signup")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const response = await fetch("/api/hidden-vault")
      if (response.ok) {
        const data = await response.json()
        setExists(data.exists)
        setUnlocked(data.unlocked)
        if (data.email) setEmail(data.email)
        if (data.exists) setMode("login")
      }
      setLoading(false)
      onReady?.()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [onReady])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setMessage("")
    const response = await fetch("/api/hidden-vault", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, email, password }) })
    const data = await response.json()
    if (response.ok) { setExists(true); setUnlocked(true); setPassword("") }
    else setMessage(data.error ?? "Unable to open Hidden Vault")
    setSubmitting(false)
  }

  async function logout() {
    await fetch("/api/hidden-vault", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) })
    setUnlocked(false)
  }

  if (loading) return <div className="mx-auto max-w-4xl p-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-neon" /></div>
  if (unlocked) return <div className="relative mx-auto min-h-80 max-w-4xl overflow-hidden rounded-3xl border-2 border-dashed border-neon/30 bg-surface p-8 text-center shadow-[0_0_32px_rgba(168,85,247,0.08)]"><div className="mx-auto max-w-md"><LockKeyhole className="mx-auto h-12 w-12 text-neon" /><p className="mt-5 font-pixel text-sm uppercase text-text">Hidden vault unlocked</p><p className="mt-2 text-sm text-text-muted">Your private vault session is active.</p><button type="button" onClick={() => void logout()} className="mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-border px-4 py-2 font-pixel text-[10px] uppercase text-text-muted hover:border-danger hover:text-danger"><LogOut className="h-4 w-4" /> Lock vault</button></div></div>

  return <div className="mx-auto max-w-md rounded-3xl border-2 border-neon/30 bg-surface p-6 shadow-[0_0_32px_rgba(168,85,247,0.08)] sm:p-8"><div className="text-center"><KeyRound className="mx-auto h-10 w-10 text-neon" /><p className="mt-4 font-pixel text-sm uppercase text-text">{mode === "signup" ? "Create your Hidden Vault" : "Unlock your Hidden Vault"}</p><p className="mt-2 text-sm text-text-muted">{mode === "signup" ? "Create a separate account for your most private files." : "Sign in to access your private vault."}</p></div><form onSubmit={submit} className="mt-6 space-y-4"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="EMAIL ADDRESS" required disabled={mode === "login"} className="w-full rounded-lg border-2 border-border bg-bg px-3 py-3 font-pixel text-[10px] text-text outline-none focus:border-neon disabled:opacity-60" /><div className="relative"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="HIDDEN VAULT PASSWORD" required minLength={8} className="w-full rounded-lg border-2 border-border bg-bg px-3 py-3 pr-11 font-pixel text-[10px] text-text outline-none focus:border-neon" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-neon">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{message && <p className="font-pixel text-[9px] uppercase text-danger">{message}</p>}<button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-neon bg-neon py-3 font-pixel text-[10px] font-bold uppercase text-bg hover:bg-neon-hover disabled:opacity-50">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "signup" ? "Create vault account" : "Unlock vault"}</button></form><button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage("") }} className="mt-5 w-full text-center font-pixel text-[9px] uppercase text-neon hover:underline">{mode === "signup" ? "Already have a Hidden Vault? Sign in" : "Need a Hidden Vault? Create one"}</button></div>
}

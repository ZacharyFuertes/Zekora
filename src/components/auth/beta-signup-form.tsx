"use client"

import { useState } from "react"
import { Loader2, Mail } from "lucide-react"

export function BetaSignupForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/beta-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error ?? "Could not save your signup")
      setStatus("success")
      setMessage("You are on the list. We will notify you when Zekora is ready.")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Could not save your signup")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border-2 border-secondary/50 bg-secondary-muted p-4 text-center">
        <p className="font-pixel text-[10px] uppercase leading-relaxed text-secondary">
          {message}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border-2 border-border bg-surface p-4 text-left shadow-[3px_3px_0_0_rgba(168,85,247,0.16)]">
      <p className="font-pixel text-[10px] uppercase leading-relaxed text-text-muted">
        Want to know when the vault opens?
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="beta-email" className="sr-only">Email address</label>
        <input
          id="beta-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="YOU@EXAMPLE.COM"
          required
          className="min-w-0 flex-1 rounded-xl border-2 border-border bg-bg px-3 py-2 font-pixel text-[10px] text-text placeholder:text-text-muted/40 outline-none focus:border-neon"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-neon bg-neon px-3 py-2 font-pixel text-[10px] font-bold uppercase text-bg pixel-shadow-dark hover:bg-neon-hover disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="h-3 w-3" />}
          Join beta
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 font-pixel text-[9px] uppercase text-danger">{message}</p>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, KeyRound, Loader2, Plus, Trash2 } from "lucide-react"

type PasswordEntry = { id: string; title: string; username: string; url: string; updated_at: string }
type FormState = { title: string; username: string; url: string; password: string }
const emptyForm: FormState = { title: "", username: "", url: "", password: "" }

async function responseError(response: Response) {
  const text = await response.text()
  if (!text) return `Request failed (${response.status})`
  try {
    const data = JSON.parse(text) as { error?: string }
    return data.error ?? `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

export function PasswordManager() {
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [visible, setVisible] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  async function load() {
    const response = await fetch("/api/passwords")
    if (response.ok) setEntries((await response.json()).passwords)
    else setMessage(await responseError(response))
    setLoading(false)
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setMessage("")
    const response = await fetch("/api/passwords", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    if (!response.ok) { setMessage(await responseError(response)); return }
    setForm(emptyForm); setShowForm(false); await load()
  }

  async function reveal(id: string) {
    if (visible[id]) { setVisible((current) => { const next = { ...current }; delete next[id]; return next }); return }
    const response = await fetch(`/api/passwords/${id}`)
    if (response.ok) {
      const data = await response.json()
      setVisible((current) => ({ ...current, [id]: data.password }))
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this password entry?")) return
    const response = await fetch(`/api/passwords/${id}`, { method: "DELETE" })
    if (response.ok) setEntries((current) => current.filter((entry) => entry.id !== id))
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <div className="flex flex-col gap-4 border-b-2 border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-neon">ZEKORA VAULT</p><h1 className="mt-2 font-pixel text-xl uppercase tracking-wider text-text">Passwords</h1></div>
        <button type="button" onClick={() => setShowForm((open) => !open)} className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-neon bg-neon px-4 py-2 font-pixel text-[10px] font-bold uppercase text-bg pixel-shadow-dark hover:bg-neon-hover"><Plus className="h-4 w-4" /> Add password</button>
      </div>
      {showForm && <form onSubmit={save} className="grid gap-3 border-2 border-neon/40 bg-surface p-5 sm:grid-cols-2">
        {(["title", "username", "url", "password"] as const).map((key) => <input key={key} type={key === "password" ? "password" : "text"} required={key === "title" || key === "password"} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={key.toUpperCase()} className="rounded-lg border-2 border-border bg-bg px-3 py-2 font-pixel text-[10px] text-text outline-none focus:border-neon" />)}
        <button type="submit" className="rounded-lg border-2 border-neon bg-neon px-4 py-2 font-pixel text-[10px] font-bold uppercase text-bg sm:col-span-2">Save password</button>
        {message && <p className="font-pixel text-[9px] uppercase text-danger sm:col-span-2">{message}</p>}
      </form>}
      {loading ? <Loader2 className="h-6 w-6 animate-spin text-neon" /> : entries.length === 0 ? <div className="border-2 border-dashed border-border bg-surface p-12 text-center"><KeyRound className="mx-auto h-10 w-10 text-neon" /><p className="mt-4 font-pixel text-xs uppercase text-text">No passwords saved</p><p className="mt-2 text-sm text-text-muted">Add your first encrypted vault entry above.</p></div> : <div className="grid gap-3 md:grid-cols-2">{entries.map((entry) => <div key={entry.id} className="border-2 border-border bg-surface p-4 shadow-[3px_3px_0_0_rgba(168,85,247,0.12)]"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-pixel text-xs uppercase text-text">{entry.title}</h2><p className="mt-2 truncate text-sm text-text-muted">{entry.username || "No username"}</p>{entry.url && <p className="mt-1 truncate text-xs text-neon">{entry.url}</p>}</div><KeyRound className="h-5 w-5 shrink-0 text-neon" /></div><div className="mt-4 flex items-center gap-2 border-t border-border pt-3"><code className="min-w-0 flex-1 truncate text-xs text-secondary">{visible[entry.id] ?? "••••••••••"}</code><button type="button" onClick={() => void reveal(entry.id)} aria-label="Reveal password" className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-neon">{visible[entry.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button type="button" onClick={() => void remove(entry.id)} aria-label="Delete password" className="rounded-md p-2 text-text-muted hover:bg-danger-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}
    </div>
  )
}

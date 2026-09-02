"use client"

import { FormEvent, useState } from "react"
import { Database, Send, UserRound } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  profileId?: string
}

interface AvatarProfile {
  id: string
  name: string
  image: string
}

const AVATAR_PROFILES: AvatarProfile[] = [
  { id: "black-guy", name: "Black Guy", image: "/black-man.svg" },
  { id: "asian-guy", name: "Asian Guy", image: "/asian-guy.svg" },
  { id: "american-guy", name: "American Guy", image: "/american-guy.svg" },
  { id: "jew-guy", name: "Jewish Guy", image: "/jew-guy.svg" },
]

export function AssistantContent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState("")
  const [selectedProfileId, setSelectedProfileId] = useState("black-guy")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = prompt.trim()
    if (!content || loading) return

    const nextMessages = [...messages, { role: "user" as const, content, profileId: selectedProfileId }]
    setMessages(nextMessages)
    setPrompt("")
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: AVATAR_PROFILES.find((profile) => profile.id === selectedProfileId)?.name ?? "Black Guy",
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      })
      const data = await response.json() as { answer?: string; error?: string }
      if (!response.ok) throw new Error(data.error ?? "Assistant request failed")
      setMessages([...nextMessages, { role: "assistant", content: data.answer ?? "" }])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Assistant request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5">
      <header className="relative overflow-hidden border-2 border-neon/50 bg-surface px-5 py-5 pixel-shadow-neon sm:px-7">
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center border border-neon bg-neon-muted p-0.5">
                <img src="/gengar-bot.svg" alt="gengar" className="h-full w-full object-contain" />
              </span>
              <div>
                <h1 className="font-pixel text-xl text-text">Wild Racist Gengar</h1>
                <p className="mt-1 font-pixel text-[9px] uppercase tracking-wider text-secondary">Came from the hood. Keep it respectful.</p>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 border border-secondary/40 bg-secondary-muted px-2 py-1 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse bg-secondary" />
            <span className="font-pixel text-[9px] uppercase text-secondary">Online</span>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-bg p-3">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-neon" />
          <span className="font-pixel text-[10px] uppercase tracking-widest text-text-muted">Difficulties: </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVATAR_PROFILES.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => setSelectedProfileId(profile.id)}
              aria-label={`Choose ${profile.name} avatar`}
              aria-pressed={selectedProfileId === profile.id}
              className={selectedProfileId === profile.id
                ? "flex items-center gap-2 border-2 border-neon bg-neon-muted px-2 py-1.5 text-neon pixel-shadow-neon"
                : "flex items-center gap-2 border border-border bg-surface px-2 py-1.5 text-text-muted hover:border-neon/50 hover:text-text"}
            >
              <img src={profile.image} alt="" className="h-8 w-8 shrink-0 object-contain" />
              <span className="font-pixel text-[10px] uppercase">{profile.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-2 border-border bg-surface pixel-shadow-dark">
        <div className="flex items-center justify-between border-b border-border bg-bg px-4 py-2">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-neon" />
            <span className="font-pixel text-[10px] uppercase tracking-widest text-text-muted">Vault transcript</span>
          </div>
          <span className="font-pixel text-[9px] text-text-muted">{String(messages.length).padStart(2, "0")} MSG</span>
        </div>
        <div className="min-h-64 space-y-5 p-4 sm:p-6">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-4 flex flex-col items-end sm:ml-16" : "mr-4 sm:mr-16"}>
              <p className="mb-1 font-pixel text-[10px] uppercase tracking-widest text-text-muted">
                {message.role === "user"
                  ? AVATAR_PROFILES.find((profile) => profile.id === message.profileId)?.name ?? "Black Guy"
                  : "Gengar"}
              </p>
              <div className={message.role === "user" ? "flex max-w-[85%] justify-end" : "flex max-w-[90%] items-start gap-2"}>
                {message.role === "assistant" && (
                  <img src="/gengar-bot.svg" alt="" className="mt-1 h-10 w-10 shrink-0 object-contain" />
                )}
                {message.role === "user" ? (
                  <div className="flex items-end gap-2">
                    <p className="whitespace-pre-wrap border border-neon/50 bg-neon-muted p-3 font-pixel text-xs leading-6 text-text pixel-shadow-neon">
                      {message.content}
                    </p>
                    <img
                      src={AVATAR_PROFILES.find((profile) => profile.id === message.profileId)?.image ?? "/black-man.svg"}
                      alt={AVATAR_PROFILES.find((profile) => profile.id === message.profileId)?.name ?? "Black Guy"}
                      className="h-10 w-10 shrink-0 object-contain"
                    />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap border border-border bg-bg p-3 font-pixel text-xs leading-6 text-text">
                    {message.content}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="mr-4 flex items-center gap-2 sm:mr-16" aria-live="polite">
              <img src="/gengar-bot.svg" alt="Gengar is typing" className="h-12 w-12 shrink-0 animate-gengar-shake object-contain" />
              <p className="font-pixel text-[10px] uppercase tracking-widest text-secondary">Racist Gengar is typing</p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="border border-danger/40 bg-danger-muted p-3 text-sm text-danger">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2 border-2 border-border bg-surface p-2 pixel-shadow-dark">
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask your vault..."
          maxLength={8000}
          className="min-w-0 flex-1 bg-bg px-3 py-3 font-pixel text-xs text-text outline-none placeholder:font-pixel placeholder:text-[10px] placeholder:uppercase placeholder:tracking-widest placeholder:text-text-muted focus:ring-1 focus:ring-neon"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          aria-label="Send question"
          className="grid h-13 w-13 shrink-0 place-items-center border-2 border-neon bg-neon text-bg shadow-[3px_3px_0_0_rgba(255,45,120,0.35)] transition-all hover:bg-neon-hover hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  )
}
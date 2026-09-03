import { Activity, Clock, KeyRound, LogIn, ShieldCheck } from "lucide-react"
import type { ActivityEventRow } from "@/lib/supabase/models"

const icons = { password: KeyRound, auth: LogIn, system: ShieldCheck }

export function ActivityList({ events, accessOnly = false }: { events: ActivityEventRow[]; accessOnly?: boolean }) {
  const shown = accessOnly ? events.filter((event) => ["password_revealed", "login", "logout"].includes(event.event_type)) : events

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <div className="border-b-2 border-border/70 pb-5">
        <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-neon">ZEKORA VAULT</p>
        <h1 className="mt-2 font-pixel text-xl uppercase tracking-wider text-text">{accessOnly ? "Hidden vault" : "Activity"}</h1>
        <p className="mt-2 text-sm text-text-muted">{accessOnly ? "A private space for sensitive vault activity." : "A timeline of actions recorded in your vault."}</p>
      </div>

      {shown.length === 0 ? (
        <div className="relative mx-auto min-h-80 max-w-4xl">
          <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-neon/30 bg-surface p-8 text-center shadow-[0_0_32px_rgba(168,85,247,0.08)] sm:p-12">
            {accessOnly ? (
              <>
                <p className="font-pixel text-[10px] uppercase text-text">Hidden vault is clear</p>
              </>
            ) : (
              <>
                <Clock className="h-10 w-10 text-neon" />
                <p className="mt-4 font-pixel text-xs uppercase text-text">No activity yet</p>
                <p className="mt-2 text-sm text-text-muted">Actions will appear here as you use the vault.</p>
              </>
            )}
          </div>
          {accessOnly && (
            <>
              <div className="absolute -bottom-24 right-0 z-10 w-56 sm:right-4">
                <p className="relative rounded-2xl border-2 border-secondary/60 bg-secondary-muted px-4 py-2 font-pixel text-[9px] uppercase leading-relaxed tracking-wide text-secondary after:absolute after:-bottom-2 after:right-7 after:h-3 after:w-3 after:rotate-45 after:border-b-2 after:border-r-2 after:border-secondary/60 after:bg-secondary-muted">
                  Wanna hide something illegal?
                </p>
              </div>
              <img
                src="/gengar-bot.svg"
                alt="Gengar bot guarding the hidden vault"
                className="absolute -bottom-72 right-0 h-48 w-48 animate-hidden-vault-float object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.4)] sm:right-4 sm:h-52 sm:w-52"
              />
            </>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border border-2 border-border bg-surface">
          {shown.map((event) => {
            const Icon = icons[event.resource_type as keyof typeof icons] ?? Activity
            return <div key={event.id} className="flex items-center gap-4 p-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon-muted text-neon"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-pixel text-[10px] uppercase text-text">{event.event_type.replaceAll("_", " ")}</p><p className="mt-1 truncate text-sm text-text-muted">{event.resource_name || event.resource_type}</p></div><time className="shrink-0 text-xs text-text-muted" dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time></div>
          })}
        </div>
      )}
    </div>
  )
}

import Link from "next/link"
import { ArrowRight, type LucideIcon } from "lucide-react"

interface FeatureStatusProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

export function FeatureStatus({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: FeatureStatusProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 pb-10">
      <div className="flex flex-col gap-2 border-b-2 border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-pixel text-[9px] uppercase tracking-[0.2em] text-neon">ZEKORA VAULT</p>
          <h1 className="mt-2 font-pixel text-lg uppercase tracking-wider text-text sm:text-xl">{title}</h1>
        </div>
        <span className="font-pixel text-[9px] uppercase text-text-muted">MODULE STATUS / IN DEVELOPMENT</span>
      </div>

      <div className="grid min-h-[25rem] items-center gap-8 border-2 border-border bg-surface p-6 shadow-[4px_4px_0_0_rgba(168,85,247,0.14)] sm:p-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:p-14">
        <div className="max-w-xl">
          <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-neon/50 bg-neon-muted shadow-[0_0_24px_rgba(168,85,247,0.14)]">
            <Icon className="h-9 w-9 text-neon" />
          </div>
          <p className="font-pixel text-[10px] uppercase tracking-widest text-secondary">FEATURE QUEUED</p>
          <p className="mt-4 text-sm leading-7 text-text-muted">{description}</p>
          <Link
            href={actionHref}
            className="mt-8 inline-flex items-center gap-2 rounded-lg border-2 border-neon bg-neon px-4 py-2.5 font-pixel text-[10px] font-bold uppercase text-bg pixel-shadow-dark transition-colors hover:bg-neon-hover"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="border-t-2 border-neon/30 pt-5 lg:border-l-2 lg:border-t-0 lg:pl-7 lg:pt-0">
          <p className="font-pixel text-[9px] uppercase tracking-widest text-text-muted">CURRENT READOUT</p>
          <div className="mt-4 space-y-3 font-pixel text-[10px] uppercase">
            <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
              <span className="text-text-muted">Availability</span>
              <span className="text-secondary">Queued</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
              <span className="text-text-muted">Vault access</span>
              <span className="text-emerald-400">Online</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-text-muted">Data status</span>
              <span className="text-neon">Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

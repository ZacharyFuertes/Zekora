import Link from "next/link"
import { footerCopy, footerMetrics, navLinks } from "@/data/landing"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t dz-bd-strong">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/"
              className="dz-mono dz-terminal-cursor inline-flex items-center gap-1 text-[0.75rem] font-bold uppercase tracking-[0.05em] dz-fg-white"
            >
              <span className="dz-fg-cyan">&gt;</span> Zekora
            </Link>
            <p className="mt-3 max-w-[38ch] text-[0.6875rem] leading-[1.9] dz-fg-muted">
              {footerCopy.tagline}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="dz-link">
                {link.label}
              </a>
            ))}
            <Link href="/login" className="dz-link">
              Access
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-y dz-bd py-3">
          {footerMetrics.map((metric) => (
            <p
              key={metric.label}
              className="dz-mono text-[0.625rem] uppercase tracking-[0.05em] dz-fg-muted"
            >
              {metric.label}:{" "}
              <span className="dz-fg-cyan">{metric.value}</span>
            </p>
          ))}
          <span className="dz-mono text-[0.625rem] uppercase tracking-[0.05em] dz-fg-muted">
            LAST_SYNC: {new Date().toISOString().slice(0, 16).replace("T", " ")}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="dz-mono text-[0.625rem] uppercase tracking-[0.05em] dz-fg-muted">
            {footerCopy.copyright.replace("{year}", String(year))}
          </p>
          <p className="dz-mono text-[0.625rem] uppercase tracking-[0.05em] dz-fg-muted">
            {footerCopy.status} <span className="dz-fg-cyan">::</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

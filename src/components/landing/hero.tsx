import { AlertTriangle, ArrowRight, Play } from "lucide-react"
import { heroCopy } from "@/data/landing"
import { ButtonLink } from "@/components/ui/button"
import { GlitchText } from "@/components/ui/glitch-text"

export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 pb-24 pt-20"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <span className="dz-badge dz-flicker">
          <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
          {heroCopy.badge}
        </span>

        <GlitchText
          as="h1"
          id="hero-heading"
          text={heroCopy.headline}
          className="mt-8 text-[clamp(2rem,7vw,4.5rem)] font-bold uppercase leading-[1.15] tracking-normal dz-fg-white"
        />

        <p className="dz-mono mt-5 text-[0.5625rem] uppercase tracking-[0.08em] dz-fg-white sm:text-[0.625rem]">
          {heroCopy.subtitle}
        </p>

        <p className="mt-7 max-w-[54ch] text-[0.5625rem] leading-[1.9] dz-fg-muted sm:text-[0.625rem]">
          {heroCopy.description}
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <ButtonLink href="/login" className="w-full sm:w-auto">
            {heroCopy.primaryCta}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="#features" variant="ghost" className="w-full sm:w-auto">
            <Play aria-hidden="true" className="h-4 w-4" />
            {heroCopy.secondaryCta}
          </ButtonLink>
        </div>

      </div>
    </section>
  )
}

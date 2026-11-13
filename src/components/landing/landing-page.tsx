import { Contact } from "@/components/landing/contact"
import { Features } from "@/components/landing/features"
import { Footer } from "@/components/landing/footer"
import { Hero } from "@/components/landing/hero"
import { LoginGlitchTransition } from "@/components/landing/login-glitch-transition"
import { Navbar } from "@/components/landing/navbar"
import { Pricing } from "@/components/landing/pricing"
import { Stats } from "@/components/landing/stats"
import { Testimonials } from "@/components/landing/testimonials"

export function LandingPage() {
  return (
    <div className="landing-root">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-md focus:border focus:bg-[var(--color-bg)] focus:px-4 focus:py-2 focus:text-[0.75rem] focus:text-[color:var(--dz-cyan)]"
      >
        Skip to content
      </a>

      <div className="dz-backdrop" aria-hidden="true" />
      <div className="dz-scanlines" aria-hidden="true" />
      <LoginGlitchTransition />

      <Navbar />

      <main id="main">
        <Hero />
        <Stats />
        <Features />
        <Testimonials />
        <Pricing />
        <Contact />
      </main>

      <Footer />
    </div>
  )
}

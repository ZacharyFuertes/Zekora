import { Check } from "lucide-react"
import { pricingPlans, sectionCopy } from "@/data/landing"
import { Reveal } from "@/components/landing/reveal"
import { SectionHeading } from "@/components/landing/section-heading"
import { ButtonLink } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="mx-auto w-full max-w-[1280px] scroll-mt-24 px-6 py-[clamp(4rem,8vw,8rem)]"
    >
      <Reveal>
        <SectionHeading
          headingId="pricing-heading"
          eyebrow={sectionCopy.pricing.eyebrow}
          title={sectionCopy.pricing.title}
          description={sectionCopy.pricing.description}
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 items-center gap-5 lg:grid-cols-[0.92fr_1.16fr_0.92fr]">
        {pricingPlans.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 80} className="h-full">
            <article
              className={cn(
                "relative flex h-full flex-col rounded-sm border p-6 transition-colors duration-200",
                plan.highlighted
                  ? "border-[color:var(--dz-accent)] bg-[linear-gradient(180deg,rgba(168,85,247,0.16),rgba(9,9,20,0.9))] shadow-[0_0_60px_rgba(168,85,247,0.14)] lg:py-9"
                  : "dz-bd bg-[rgba(9,9,20,0.62)] hover:border-[color:var(--dz-border-strong)]"
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-6 rounded-sm bg-[var(--dz-accent)] px-2 py-1 dz-mono text-[0.5625rem] font-bold uppercase tracking-[0.05em] text-[var(--color-bg)]">
                  Recommended
                </span>
              ) : null}

              <p className="dz-mono text-[0.625rem] uppercase tracking-[0.07em] dz-fg-cyan">
                {String(index + 1).padStart(2, "0")} / {plan.name}
              </p>

              <div className="mt-5 flex items-end gap-2">
                <span className="dz-mono text-2xl font-bold tracking-tight dz-fg-white">
                  {plan.price}
                </span>
                <span className="dz-mono pb-1 text-[0.625rem] uppercase tracking-[0.04em] dz-fg-muted">
                  {plan.cadence}
                </span>
              </div>

              <p className="mt-4 text-[0.6875rem] leading-[1.9] dz-fg-muted">
                {plan.description}
              </p>

              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-[0.6875rem] leading-[1.8] dz-fg-white"
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 dz-fg-cyan"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={plan.href}
                variant={plan.highlighted ? "primary" : "ghost"}
                className="mt-7 w-full"
              >
                {plan.cta}
              </ButtonLink>
            </article>
          </Reveal>
        ))}
      </div>

      <p className="dz-mono mt-6 text-[0.625rem] uppercase tracking-[0.05em] dz-fg-muted">
        Prices in BRL. No charge during alpha.
      </p>
    </section>
  )
}

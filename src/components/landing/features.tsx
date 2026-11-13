import { features, sectionCopy } from "@/data/landing"
import { Reveal } from "@/components/landing/reveal"
import { SectionHeading } from "@/components/landing/section-heading"
import { cn } from "@/lib/utils"

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-[1280px] scroll-mt-24 px-6 py-[clamp(4rem,8vw,8rem)]"
    >
      <Reveal>
        <SectionHeading
          headingId="features-heading"
          eyebrow={sectionCopy.features.eyebrow}
          title={sectionCopy.features.title}
          description={sectionCopy.features.description}
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12">
        {features.map((feature, index) => {
          const Icon = feature.icon

          return (
            <Reveal
              key={feature.title}
              delay={(index % 3) * 80}
              className={cn("md:col-span-6", feature.span)}
            >
              <article className="group relative h-full overflow-hidden rounded-sm border dz-bd bg-[linear-gradient(180deg,rgba(43,0,87,0.34),rgba(9,9,20,0.82))] p-6 transition-colors duration-200 hover:border-[color:var(--dz-border-strong)]">
                <span className="pointer-events-none absolute right-4 top-3 dz-mono text-[0.625rem] tracking-[0.05em] dz-fg-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border dz-bd bg-[rgba(168,85,247,0.1)] dz-fg-cyan transition-colors duration-200 group-hover:border-[color:var(--dz-border-strong)]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h3 className="text-[0.75rem] font-bold uppercase tracking-[0.02em] dz-fg-white">
                    {feature.title}
                  </h3>
                </div>

                <p className="mt-4 max-w-[52ch] text-[0.6875rem] leading-[1.9] dz-fg-muted">
                  {feature.copy}
                </p>

                <span className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-[var(--dz-cyan)] transition-[width] duration-300 ease-out group-hover:w-full" />
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

import { Quote } from "lucide-react"
import { sectionCopy, testimonials } from "@/data/landing"
import { Reveal } from "@/components/landing/reveal"
import { SectionHeading } from "@/components/landing/section-heading"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="border-y dz-bd bg-[rgba(43,0,87,0.18)]"
    >
      <div className="mx-auto w-full max-w-[1280px] scroll-mt-24 px-6 py-[clamp(4rem,8vw,8rem)]">
        <Reveal>
          <SectionHeading
            headingId="testimonials-heading"
            eyebrow={sectionCopy.testimonials.eyebrow}
            title={sectionCopy.testimonials.title}
            description={sectionCopy.testimonials.description}
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal
              key={testimonial.name}
              delay={index * 80}
              className={cn("h-full", testimonial.offset)}
            >
              <figure className="relative flex h-full flex-col rounded-sm border dz-bd bg-[rgba(9,9,20,0.72)] p-6">
                <Quote
                  aria-hidden="true"
                  className="h-6 w-6 dz-fg-cyan"
                  strokeWidth={1.5}
                />
                <blockquote className="mt-4 flex-1 text-[0.6875rem] leading-[1.9] dz-fg-white">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t dz-bd pt-4">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border dz-bd-strong dz-mono text-[0.6875rem] dz-fg-cyan"
                  >
                    {initials(testimonial.name)}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[0.625rem] font-bold uppercase tracking-[0.03em] dz-fg-white">
                      {testimonial.name}
                    </span>
                    <span className="dz-mono text-[0.625rem] uppercase tracking-[0.04em] dz-fg-muted">
                      {testimonial.role} / {testimonial.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

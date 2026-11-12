type SectionHeadingProps = {
  eyebrow: string
  title: string
  description: string
  headingId: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  headingId,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 md:max-w-3xl">
      <p className="dz-mono text-[0.625rem] uppercase tracking-[0.08em] dz-fg-cyan">
        {"// "}
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className="text-[clamp(1.25rem,2.8vw,2rem)] font-bold uppercase leading-[1.4] tracking-normal dz-fg-white"
      >
        {title}
      </h2>
      <p className="max-w-[62ch] text-[0.75rem] leading-[1.9] dz-fg-muted">
        {description}
      </p>
    </div>
  )
}

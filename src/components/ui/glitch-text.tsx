import { cn } from "@/lib/utils"

type GlitchTextTag = "h1" | "h2" | "h3" | "p" | "span"

type GlitchTextProps = {
  text: string
  className?: string
  as?: GlitchTextTag
  id?: string
}

export function GlitchText({
  text,
  className,
  as = "span",
  id,
}: GlitchTextProps) {
  const Tag = as

  return (
    <Tag id={id} className={cn("dz-glitch", className)} data-text={text}>
      {text}
    </Tag>
  )
}

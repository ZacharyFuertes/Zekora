import Image from "next/image"
import { cn } from "@/lib/utils"

interface VaultIconProps {
  className?: string
}

export function VaultIcon({ className }: VaultIconProps) {
  return (
    <Image
      src="/zekora-logo.png"
      alt="Zekora"
      width={48}
      height={48}
      unoptimized
      className={cn("w-10 h-10 object-contain", className)}
      style={{ imageRendering: "pixelated" }}
    />
  )
}

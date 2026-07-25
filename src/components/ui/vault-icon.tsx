import Image from "next/image"
import { cn } from "@/lib/utils"

interface VaultIconProps {
  className?: string
}

export function VaultIcon({ className }: VaultIconProps) {
  return (
    <Image
      src="/zekora.png"
      alt="Zekora"
      width={32}
      height={32}
      className={cn("w-8 h-8 rounded-lg", className)}
    />
  )
}

import { cn } from "@/lib/utils"

interface VaultIconProps {
  className?: string
}

export function VaultIcon({ className }: VaultIconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("w-8 h-8", className)}
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <text
        x="50%"
        y="55%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-bg text-sm font-bold"
        fontSize="18"
        fontFamily="system-ui"
      >
        Z
      </text>
    </svg>
  )
}

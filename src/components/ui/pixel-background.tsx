"use client"

import { useEffect, useState } from "react"

// Parallax pixel background with 3 layers
// Uses existing Zekora color tokens: --color-accent, --color-accent-deep, --color-text-faint, --color-primary
// No external images, no JS animation loops, <20KB

const STAGE_WIDTH = 80
const STAGE_HEIGHT = 60

const LARGE_STAR = "██"
const MEDIUM_STAR = "▓▓"
const SMALL_STAR = "■■"

function seededStars(count: number, seed: number, opacityBase: number, opacityRange: number, sizes: string[]) {
  let state = seed >>> 0
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }

  return Array.from({ length: count }, () => ({
    x: next() * STAGE_WIDTH,
    y: next() * STAGE_HEIGHT,
    opacity: opacityBase + next() * opacityRange,
    size: sizes[Math.floor(next() * sizes.length)],
  }))
}

interface PixelBackgroundProps {
  reduceMotion?: boolean
}

export function PixelBackground({ reduceMotion = false }: PixelBackgroundProps) {
  // immediately reduce if prop or media query matches
  const isReduced =
    reduceMotion ||
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  // animation frame
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (isReduced) return
    const id = setInterval(() => {
      setFrame((prev) => (prev + 1) % 8)
    }, 80)
    return () => clearInterval(id)
  }, [isReduced])

  // Seeded fields produce identical coordinates during server and client rendering.
  const largeStars = seededStars(12, 0x8b17c, 0, 1, [LARGE_STAR, MEDIUM_STAR])
  const mediumStars = seededStars(20, 0x41d2a, 0.2, 0.6, [MEDIUM_STAR])
  const smallStars = seededStars(30, 0x19f3b, 0.1, 0.4, [SMALL_STAR])

  // Planet/moon (low contrast, placed at bottom-right)
  const planet = {
    x: STAGE_WIDTH - 15,
    y: STAGE_HEIGHT - 12,
    size: 8,
    color: "rgba(167, 139, 250, 0.15)",
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <svg
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        style={{
          position: "fixed",
          inset: "auto",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Large star layer - slow parallax */}
        <g fill="var(--color-accent)" stroke="none">
          {largeStars.map((star, i) => {
            const offset = i * 0.1
            const x = (star.x + frame * (0.1 - offset)) % STAGE_WIDTH
            const y = (star.y + frame * (0.05 - offset * 0.5)) % STAGE_HEIGHT
            const size = star.size === LARGE_STAR ? "2" : "1"
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={size}
                height={size}
                fill="var(--color-accent)"
                style={{ opacity: star.opacity }}
              />
            )
          })}
        </g>

        {/* Medium star layer - medium parallax */}
        <g fill="var(--color-accent-deep)" stroke="none">
          {mediumStars.map((star, i) => {
            const offset = i * 0.05
            const x = (star.x + frame * (0.05 - offset)) % STAGE_WIDTH
            const y = (star.y + frame * (0.02 - offset * 0.3)) % STAGE_HEIGHT
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={2}
                height={2}
                fill="var(--color-accent-deep)"
                style={{ opacity: star.opacity }}
              />
            )
          })}
        </g>

        {/* Small star layer - fast parallax */}
        <g fill="var(--color-text-faint)" stroke="none">
          {smallStars.map((star, i) => {
            const offset = i * 0.02
            const x = (star.x + frame * (0.2 - offset)) % STAGE_WIDTH
            const y = (star.y + frame * (0.1 - offset * 0.5)) % STAGE_HEIGHT
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={1}
                height={1}
                fill="var(--color-text-faint)"
                style={{ opacity: star.opacity }}
              />
            )
          })}
        </g>

        {/* Planet/moon (low contrast, fixed position) */}
        <g fill="var(--color-accent-deep)">
          <rect
            x={planet.x - planet.size}
            y={planet.y - planet.size}
            width={planet.size * 2}
            height={planet.size * 2}
            rx={planet.size}
            fill="var(--color-accent-deep)"
          />
        </g>
      </svg>
    </div>
  )
}
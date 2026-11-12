"use client"

import { useCountUp } from "@/hooks/use-count-up"
import { useInView } from "@/hooks/use-in-view"
import { stats, type Stat } from "@/data/landing"
import { cn } from "@/lib/utils"

type AnimatedStatProps = {
  stat: Stat
  index: number
}

function AnimatedStat({ stat, index }: AnimatedStatProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 })
  const value = useCountUp(stat.value, inView)

  return (
    <div
      ref={ref}
      className={cn(
        "dz-reveal flex flex-col gap-2 border-t dz-bd px-0 py-8 first:border-t-0 md:border-l md:border-t-0 md:px-6 md:first:border-l-0 md:first:pl-0",
        inView && "is-visible"
      )}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <p className="dz-mono text-xl font-bold tracking-tight dz-fg-white sm:text-2xl">
        {stat.prefix}
        {value.toFixed(stat.decimals ?? 0)}
        <span className="dz-fg-cyan">{stat.suffix}</span>
      </p>
      <p className="text-[0.625rem] uppercase tracking-[0.07em] dz-fg">{stat.label}</p>
      <p className="max-w-[34ch] text-[0.6875rem] leading-[1.9] dz-fg-dim">
        {stat.hint}
      </p>
    </div>
  )
}

export function Stats() {
  return (
    <section
      aria-label="Platform status"
      className="mx-auto w-full max-w-[1280px] px-6"
    >
      <div className="border-y dz-bd-strong">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {stats.map((stat, index) => (
            <AnimatedStat key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

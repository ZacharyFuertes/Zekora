"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

const GLITCH_DURATION = 420

export function LoginGlitchTransition() {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const navigatingRef = useRef(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const root = document.querySelector(".landing-root")

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a[href="/login"]')
      if (!link || !link.closest(".landing-root")) return
      if (link.getAttribute("target") === "_blank") return

      if (navigatingRef.current) {
        event.preventDefault()
        return
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      event.preventDefault()
      event.stopPropagation()
      navigatingRef.current = true
      setActive(true)
      root?.classList.add("is-login-glitching")

      timerRef.current = window.setTimeout(() => {
        router.push("/login")
      }, GLITCH_DURATION)
    }

    document.addEventListener("click", handleClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      root?.classList.remove("is-login-glitching")
    }
  }, [router])

  return (
    <div
      aria-hidden="true"
      className={active ? "dz-login-glitch is-active" : "dz-login-glitch"}
    />
  )
}

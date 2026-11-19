"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import styles from "@/app/(auth)/login/login.module.css"

export function LoginBackdrop({ zooming = false }: { zooming?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldPlay, setShouldPlay] = useState(false)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncPlayback = () => {
      const video = videoRef.current
      if (!video) return

      if (preference.matches) {
        setShouldPlay(false)
        setMuted(true)
        video.pause()
        video.muted = true
        video.currentTime = 0
        return
      }

      setShouldPlay(true)
      void video.play().catch(() => {
        // Keep the static CSS fallback visible when autoplay is unavailable.
      })
    }

    syncPlayback()
    preference.addEventListener("change", syncPlayback)
    return () => preference.removeEventListener("change", syncPlayback)
  }, [])

  function toggleSound() {
    const video = videoRef.current
    if (!video || !shouldPlay) return

    const nextMuted = !muted
    video.muted = nextMuted
    setMuted(nextMuted)
    if (!nextMuted) {
      void video.play().catch(() => {
        video.muted = true
        setMuted(true)
      })
    }
  }

  return (
    <>
      <div className={`${styles.backdrop} ${zooming ? styles.backdropZoom : ""}`} aria-hidden="true">
        <video
          ref={videoRef}
          className={styles.backdropVideo}
          src="/login/moving-bg-zekora-login-page.mp4"
          autoPlay={shouldPlay}
          muted={muted}
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        />
        <div className={styles.noise} />
      </div>
      <button
        type="button"
        className={styles.soundButton}
        onClick={toggleSound}
        disabled={!shouldPlay}
        aria-label={muted ? "Enable background video sound" : "Mute background video sound"}
        aria-pressed={!muted}
      >
        {muted ? <VolumeX size={16} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
        <span className={styles.soundLabel}>{muted ? "SOUND OFF" : "SOUND ON"}</span>
      </button>
    </>
  )
}

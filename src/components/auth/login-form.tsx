"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import styles from "@/app/(auth)/login/login.module.css"

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>
  onSuccess: () => void
}

export function LoginForm({ onSubmit, onSuccess }: LoginFormProps) {
  const router = useRouter()
  const audioContextRef = useRef<AudioContext | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => () => {
    void audioContextRef.current?.close()
  }, [])

  function clearError() {
    if (!error) return
    setError("")
  }

  function playPixelTone(frequencies: number[], duration: number, volume: number) {
    const AudioContextConstructor = window.AudioContext
    if (!AudioContextConstructor) return

    try {
      const context = audioContextRef.current ?? new AudioContextConstructor()
      audioContextRef.current = context
      if (context.state === "suspended") void context.resume()

      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const now = context.currentTime

      oscillator.type = "square"
      frequencies.forEach((frequency, index) => {
        oscillator.frequency.setValueAtTime(frequency, now + index * duration / frequencies.length)
      })
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(volume, now + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + duration + 0.005)
    } catch {
      // Audio is decorative; it must never interrupt form submission.
    }
  }

  function playSubmitSound() {
    playPixelTone([330, 440, 660], 0.19, 0.09)
  }

  function playTypingSound(value: string) {
    const character = value.codePointAt(value.length - 1) ?? value.length
    playPixelTone([280 + (character % 8) * 28], 0.035, 0.035)
  }

  function navigateToDashboard() {
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => { finished: Promise<void> }
    }

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(() => {
        router.push("/dashboard")
        router.refresh()
      })
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    setError("")
    setLoading(true)

    try {
      await onSubmit({ email, password })
      setSuccess(true)
      onSuccess()
      await new Promise((resolve) => window.setTimeout(resolve, 1050))
      navigateToDashboard()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`${styles.panelShell} ${error ? styles.panelError : ""}`} aria-labelledby="login-title">
      <div className={styles.panelFrame} aria-hidden="true" />
      <div className={styles.panelFace} aria-hidden="true" />
      <div className={styles.topHighlight} aria-hidden="true" />
      <div className={styles.bottomShade} aria-hidden="true" />

      <Image
        src="/logo-txt.png"
        alt="Zekora"
        width={800}
        height={500}
        priority
        className={styles.logo}
      />
      <h1 id="login-title" className={styles.title}>ENTER THE VAULT</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={`${styles.field} ${error ? styles.fieldError : ""}`}>
          <label htmlFor="login-email" className={styles.label}>USERNAME</label>
          <div className={styles.inputFrame}>
            <span className={styles.insetShadow} aria-hidden="true" />
            <input
              id="login-email"
              name="email"
              type="email"
              aria-label="Email address"
              autoComplete="username"
              value={email}
              onChange={(event) => { setEmail(event.target.value); clearError(); playTypingSound(event.target.value) }}
              placeholder="Your adventure name"
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
              className={styles.input}
            />
          </div>
        </div>

        <div className={`${styles.field} ${styles.passwordField} ${error ? styles.fieldError : ""}`}>
          <label htmlFor="login-password" className={styles.label}>PASSWORD</label>
          <div className={styles.inputFrame}>
            <span className={styles.insetShadow} aria-hidden="true" />
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => { setPassword(event.target.value); clearError(); playTypingSound(event.target.value) }}
              placeholder="Your secret password"
              required
              minLength={6}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
              className={styles.input}
            />
          </div>
        </div>

        <p id="login-error" className={styles.errorMessage} aria-live="assertive" role="alert">
          {error ? error.toUpperCase() : ""}
        </p>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || success}
          aria-busy={loading}
          onClick={playSubmitSound}
        >
          <span className={styles.buttonSurface} aria-hidden="true">
            <span className={styles.buttonFill} />
          </span>
          <span className={styles.buttonText}>
            {loading ? (
              <span aria-label="Entering">
                ENTERING<span className={styles.loadingDots} aria-hidden="true">...</span>
              </span>
            ) : success ? (
              "VAULT UNLOCKED"
            ) : (
              "BEGIN ADVENTURE"
            )}
          </span>
        </button>
      </form>
      <p className={styles.instruction}>YOUR ADVENTURE IS ONE CLICK AWAY</p>
    </section>
  )
}

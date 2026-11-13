"use client"

import { AlertTriangle, Send } from "lucide-react"
import { useState, type FormEvent } from "react"
import { contactCopy, sectionCopy } from "@/data/landing"
import { SectionHeading } from "@/components/landing/section-heading"
import { Button } from "@/components/ui/button"

type FormStatus = "idle" | "submitting" | "success" | "error"

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export function Contact() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<FormStatus>("idle")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleaned = email.trim().toLowerCase()

    if (!EMAIL_PATTERN.test(cleaned)) {
      setError("Enter a valid email address.")
      setStatus("error")
      return
    }

    setError(null)
    setStatus("submitting")

    try {
      const response = await fetch("/api/beta-signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleaned }),
      })

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null)
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Could not save your request."

        throw new Error(message)
      }

      setStatus("success")
      setEmail("")
    } catch (caught) {
      setStatus("error")
      setError(
        caught instanceof Error ? caught.message : "Could not save your request."
      )
    }
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-t dz-bd bg-[rgba(43,0,87,0.18)]"
    >
      <div className="mx-auto grid w-full max-w-[1280px] scroll-mt-24 grid-cols-1 gap-12 px-6 py-[clamp(4rem,8vw,8rem)] lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div>
          <SectionHeading
            headingId="contact-heading"
            eyebrow={sectionCopy.contact.eyebrow}
            title={sectionCopy.contact.title}
            description={sectionCopy.contact.description}
          />

          <dl className="mt-10 grid max-w-md grid-cols-2 gap-4">
            {contactCopy.panel.map((item) => (
              <div key={item.label} className="rounded-sm border dz-bd p-4">
                <dt className="dz-mono text-[0.625rem] uppercase tracking-[0.05em] dz-fg-muted">
                  {item.label}
                </dt>
                <dd className="mt-2 dz-mono text-[0.6875rem] dz-fg-white">
                  {item.value}
                </dd>
              </div>
            ))}
            <div className="col-span-2 flex items-center gap-3 rounded-sm border dz-bd p-4">
              <AlertTriangle
                aria-hidden="true"
                className="h-5 w-5 shrink-0 dz-fg-cyan"
              />
              <p className="text-[0.6875rem] leading-[1.9] dz-fg-muted">{contactCopy.guardrail}</p>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-sm border dz-bd-strong bg-[rgba(9,9,20,0.78)] p-6 sm:p-8"
        >
          <p className="dz-mono text-[0.625rem] uppercase tracking-[0.05em] dz-fg-cyan">
            {contactCopy.formCommand}
          </p>

          <div className="mt-6">
            <label htmlFor="contact-email" className="dz-label">
              {contactCopy.emailLabel}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={contactCopy.emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (status === "error" || status === "success") {
                  setStatus("idle")
                  setError(null)
                }
              }}
              aria-invalid={status === "error"}
              aria-describedby={error ? "contact-email-error" : "contact-email-hint"}
              className="dz-input"
              required
            />
            <p
              id="contact-email-hint"
              className="mt-2 text-[0.625rem] leading-[1.9] dz-fg-dim"
            >
              {contactCopy.emailHint}
            </p>
            {error ? (
              <p
                id="contact-email-error"
                role="alert"
                className="mt-2 text-[0.625rem] leading-[1.8] text-[var(--color-danger)]"
              >
                {error}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={status === "submitting"}
            className="mt-6 w-full"
          >
            {status === "submitting" ? (
              <span className="dz-terminal-cursor">
                {contactCopy.submitting}
              </span>
            ) : (
              <>
                <Send aria-hidden="true" className="h-4 w-4" />
                {contactCopy.submit}
              </>
            )}
          </Button>

          {status === "success" ? (
            <p
              role="status"
              className="dz-mono mt-4 border-t dz-bd pt-4 text-[0.6875rem] uppercase leading-relaxed tracking-[0.04em] dz-fg-cyan"
            >
              {contactCopy.success}
            </p>
          ) : null}

          <p className="dz-mono mt-4 text-[0.625rem] uppercase tracking-[0.04em] dz-fg-muted">
            {contactCopy.note}
          </p>
        </form>
      </div>
    </section>
  )
}

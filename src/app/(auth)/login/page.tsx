"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthForm } from "@/components/auth/auth-form"
import { BetaSignupForm } from "@/components/auth/beta-signup-form"

export default function LoginPage() {
  const supabase = createClient()
  const [gengarClicked, setGengarClicked] = useState(false)

  function handleGengarClick() {
    setGengarClicked(false)
    window.setTimeout(() => setGengarClicked(true), 20)
    window.setTimeout(() => setGengarClicked(false), 520)
  }

  return (
    <div className="min-h-dvh px-4 py-8 sm:flex sm:items-center sm:justify-center sm:py-12">
      <div className="grid w-full max-w-4xl items-center gap-10 lg:grid-cols-[minmax(0,28rem)_minmax(18rem,22rem)] lg:gap-16">
        <AuthCard
          title="Zekora is still Under Development"
          subtitle="Developer testing only"
        >
          <AuthForm
            mode="login"
            onSubmit={async ({ email, password }) => {
              const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
              })
              if (error) throw error
            }}
          />
        </AuthCard>

        <aside className="flex w-full flex-col items-center text-center lg:pt-4">
          <p className="relative z-10 w-full rounded-2xl border-2 border-neon bg-surface px-4 py-3 font-pixel text-[10px] uppercase leading-relaxed tracking-wide text-secondary shadow-[3px_3px_0_0_rgba(168,85,247,0.35)] after:absolute after:-bottom-2 after:left-1/2 after:h-3 after:w-3 after:-translate-x-1/2 after:rotate-45 after:border-b-2 after:border-r-2 after:border-neon after:bg-surface">
            This Gengar is still finishing this project. Please be kind to him
          </p>
          <div className="relative flex h-56 w-full items-end justify-center">
            <div className="absolute bottom-3 h-3 w-32 rounded-[50%] bg-black/40 blur-[2px]" />
            <button
              type="button"
              onClick={handleGengarClick}
              aria-label="Pat Gengar"
              className="relative cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-secondary animate-gengar-shake"
            >
              <img
                src="/gengar-maintenance.svg"
                alt="Gengar maintenance mode"
                className={`relative h-52 w-52 object-contain animate-gengar-arrive ${gengarClicked ? "animate-gengar-click" : ""}`}
              />
            </button>
          </div>
          <BetaSignupForm />
        </aside>
      </div>
    </div>
  )
}

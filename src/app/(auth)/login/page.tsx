"use client"

import { createClient } from "@/lib/supabase/client"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthForm } from "@/components/auth/auth-form"
import { BetaSignupForm } from "@/components/auth/beta-signup-form"

export default function LoginPage() {
  const supabase = createClient()

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
          <div className="relative flex h-56 w-full items-end justify-center">
            <div className="absolute bottom-3 h-3 w-32 rounded-[50%] bg-black/40 blur-[2px]" />
            <img
              src="/gengar-maintenance.svg"
              alt="Gengar maintenance mode"
              className="relative h-52 w-52 animate-gengar-shake object-contain"
            />
          </div>
          <p className="relative mt-2 w-full rounded-2xl border-2 border-neon bg-surface px-4 py-3 font-pixel text-[10px] uppercase leading-relaxed tracking-wide text-secondary shadow-[3px_3px_0_0_rgba(168,85,247,0.35)] before:absolute before:-top-2 before:left-1/2 before:h-3 before:w-3 before:-translate-x-1/2 before:rotate-45 before:border-l-2 before:border-t-2 before:border-neon before:bg-surface">
            This Gengar is still finishing this project. Please be kind to him
          </p>
          <BetaSignupForm />
        </aside>
      </div>
    </div>
  )
}

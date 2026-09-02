"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { AuthCard } from "@/components/auth/auth-card"
import { AuthForm } from "@/components/auth/auth-form"

export default function LoginPage() {
  const supabase = createClient()

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-5">
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

        <aside className="flex w-full flex-col items-center text-center">
          <img
            src="/gengar-maintenance.svg"
            alt="Gengar maintenance mode"
            className="h-36 w-36 animate-gengar-shake object-contain sm:h-44 sm:w-44"
          />
          <p className="relative mt-4 border-2 border-neon bg-surface px-4 py-3 font-pixel text-[10px] uppercase leading-relaxed tracking-wide text-secondary shadow-[3px_3px_0_0_rgba(168,85,247,0.35)] before:absolute before:-top-2 before:left-1/2 before:h-3 before:w-3 before:-translate-x-1/2 before:rotate-45 before:border-l-2 before:border-t-2 before:border-neon before:bg-surface">
            This Gengar is still finishing this project. Please be kind to him
          </p>
        </aside>
      </div>
    </div>
  )
}

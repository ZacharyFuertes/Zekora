"use client"

import { useState } from "react"
import { HiddenVaultGate } from "./hidden-vault-gate"

export function HiddenVaultScene() {
  const [gateReady, setGateReady] = useState(false)

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center gap-3 pb-8">
      {gateReady && (
        <div className="relative z-0 -mb-16 flex flex-col items-center pt-2 animate-gengar-arrive">
          <div className="relative z-10 max-w-[15rem] rounded-2xl border-2 border-secondary/60 bg-secondary-muted px-4 py-2 text-center font-pixel text-[9px] uppercase leading-relaxed tracking-wide text-secondary shadow-[3px_3px_0_0_rgba(245,158,11,0.16)]">
            Psst, Wanna hide something illegal?
          </div>
          <span className="-mt-1 h-3 w-3 rotate-45 border-b-2 border-r-2 border-secondary/60 bg-secondary-muted" aria-hidden="true" />
          <img
            src="/gengar-bot.svg"
            alt="Gengar guarding the Hidden Vault"
            className="-mt-1 -translate-y-6 h-36 w-36 object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.4)] lg:h-44 lg:w-44"
          />
        </div>
      )}
      <div className="relative z-10">
        <HiddenVaultGate onReady={() => setGateReady(true)} />
      </div>
    </div>
  )
}

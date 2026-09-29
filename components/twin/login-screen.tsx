"use client"

import type { FormEvent } from "react"
import { DEFAULT_AVATAR, getOutfit, getPhase } from "@/lib/twin"
import { TwinAvatar } from "./twin-avatar"

const PREVIEW_PHASE = getPhase(10)

function Field({ id, label, type, autoComplete }: { id: string; label: string; type: string; autoComplete: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        className="w-full border-b border-border bg-transparent pb-2 text-base focus:border-foreground focus:outline-none"
      />
    </div>
  )
}

export function LoginScreen({ onTrial, onEnter }: { onTrial: () => void; onEnter: () => void }) {
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onEnter()
  }

  return (
    <main className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-[1400px] grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 md:px-16">
        <p className="font-serif text-6xl leading-none tracking-tight">
          Twin<span className="text-accent">.</span>
        </p>
        <h1 className="mt-6 max-w-sm font-serif text-3xl leading-tight text-balance">A planner that moves with your brain and your body.</h1>

        <form onSubmit={submit} className="mt-10 flex max-w-sm flex-col gap-7">
          <Field id="email" label="Email" type="email" autoComplete="email" />
          <Field id="password" label="Password" type="password" autoComplete="current-password" />
          <button
            type="submit"
            className="rounded-full bg-primary py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Log in
          </button>
        </form>

        <div className="mt-4 flex max-w-sm flex-col gap-4">
          <button
            type="button"
            onClick={onEnter}
            className="rounded-full border border-foreground py-3 text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Try for free first (no account needed)
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Want everything?{" "}
            <button type="button" onClick={onTrial} className="text-foreground underline underline-offset-4 hover:text-accent">
              Start a 14-day free trial
            </button>
          </p>
        </div>
      </div>

      <div className="relative hidden items-center justify-center overflow-hidden border-l border-border bg-card lg:flex">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: `radial-gradient(45% 40% at 50% 50%, color-mix(in oklab, ${PREVIEW_PHASE.color} 22%, transparent), transparent 70%)` }}
        />
        <div className="relative flex flex-col items-center">
          <div className="h-[380px] w-[300px] motion-safe:animate-twin-float">
            <TwinAvatar config={DEFAULT_AVATAR} outfit={getOutfit(PREVIEW_PHASE, "chic")} pose="standing" expression="focused" />
          </div>
          <p className="mt-6 max-w-xs text-center font-serif text-xl italic text-balance">&ldquo;I dress for your hormones so you don&apos;t have to.&rdquo;</p>
        </div>
      </div>
    </main>
  )
}

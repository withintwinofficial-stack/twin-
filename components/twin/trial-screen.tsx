"use client"

import type { FormEvent } from "react"
import { ArrowLeft, Check, Lock } from "lucide-react"
import { addDays, parseISODate } from "@/lib/twin"

const FEATURES = [
  "Hormone-aware reminders on every task",
  "Your Twin, with a full cycle-synced wardrobe",
  "Foods, herbs and dinners for each phase",
  "Morning and sunset modes with guilt-free rollover",
  "Phase-matched workouts and focus audio",
]

function CardField({ id, label, placeholder, autoComplete, inputMode }: { id: string; label: string; placeholder: string; autoComplete: string; inputMode?: "numeric" }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="w-full border-b border-border bg-transparent pb-2 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
      />
    </div>
  )
}

export function TrialScreen({ todayISO, onStart, onBack }: { todayISO: string; onStart: () => void; onBack: () => void }) {
  const chargeDate = addDays(parseISODate(todayISO), 14).toLocaleDateString("en-US", { month: "long", day: "numeric" })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onStart()
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-5xl flex-col justify-center px-5 py-12 md:px-10">
      <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to login
      </button>

      <div className="mt-6 grid grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-2">
        <div className="flex flex-col p-8 md:p-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Twin Premium</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-balance md:text-5xl">14 days free, then gently priced.</h1>
          <p className="mt-6 flex items-baseline gap-2">
            <span className="font-serif text-6xl">$4.99</span>
            <span className="text-sm text-muted-foreground">/ month</span>
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm leading-relaxed">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-6 border-t border-border bg-background/60 p-8 md:border-l md:border-t-0 md:p-12">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">Payment details</h2>
            <Lock className="size-4 text-muted-foreground" aria-hidden />
          </div>
          <CardField id="card-name" label="Name on card" placeholder="Alex Morgan" autoComplete="cc-name" />
          <CardField id="card-number" label="Card number" placeholder="4242 4242 4242 4242" autoComplete="cc-number" inputMode="numeric" />
          <div className="grid grid-cols-2 gap-6">
            <CardField id="card-exp" label="Expiry" placeholder="MM / YY" autoComplete="cc-exp" inputMode="numeric" />
            <CardField id="card-cvc" label="CVC" placeholder="123" autoComplete="cc-csc" inputMode="numeric" />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-full bg-primary py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start my free trial
          </button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            You won&apos;t be charged until {chargeDate}. Cancel anytime. This checkout is a preview, so no card details are sent or stored.
          </p>
        </form>
      </div>
    </main>
  )
}

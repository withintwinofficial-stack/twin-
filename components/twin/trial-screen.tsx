"use client"

import type { FormEvent } from "react"
import { ArrowLeft, Check, Lock, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { addDays, parseISODate } from "@/lib/twin"

const FEATURES: { name: string; free: boolean; premium: boolean }[] = [
  { name: "Cycle tracking and rhythm forecast", free: true, premium: true },
  { name: "Hormone-aware task reminders", free: true, premium: true },
  { name: "Daily and monthly to-dos", free: true, premium: true },
  { name: "Your Twin, with the signature wardrobe", free: true, premium: true },
  { name: "Foods and herbs for every phase", free: true, premium: true },
  { name: "Morning and sunset modes", free: true, premium: true },
  { name: "Automated 15-minute dinner curator", free: false, premium: true },
  { name: "Brain Fog Reset and Hyperfocus mode", free: false, premium: true },
  { name: "Dopamine Vault scratch cards", free: false, premium: true },
  { name: "ADHD Tax Prevention shelf", free: false, premium: true },
  { name: "Built-in Spotify focus audio", free: false, premium: true },
  { name: "Premium wardrobe collections", free: false, premium: true },
]

function Mark({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="flex justify-center">
      {on ? (
        <span className="flex size-6 items-center justify-center rounded-full border border-foreground/70">
          <Check className="size-3.5" aria-hidden />
        </span>
      ) : (
        <Minus className="size-3.5 text-muted-foreground/50" aria-hidden />
      )}
      <span className="sr-only">{on ? `Included in ${label}` : `Not included in ${label}`}</span>
    </span>
  )
}

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
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-10 md:py-16">
      <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to login
      </button>

      <header className="mt-10 max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Plans</p>
        <h1 className="mt-4 font-serif text-3xl leading-snug text-pretty md:text-[2.6rem] md:leading-[1.2]">
          Twin is fully functional and free forever because protecting your peace of mind and tracking your biological energy shouldn&apos;t be a luxury.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
          But if you want to supercharge your routine, a small $4.99/month subscription unlocks max automation: your automated 15-minute dinner curator,
          built-in Spotify focus audio, and our premium wardrobe collections. Cancel anytime, your data and your Twin will always
          stay safe with us.
        </p>
      </header>

      <section aria-labelledby="compare-heading" className="mt-14 overflow-hidden rounded-3xl border border-border bg-card">
        <h2 id="compare-heading" className="sr-only">
          Compare Free and Premium
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="px-6 py-6 text-left align-bottom font-normal md:px-10">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">What&apos;s included</span>
              </th>
              <th scope="col" className="w-24 px-2 py-6 text-center align-bottom font-normal md:w-40">
                <span className="block font-serif text-xl md:text-2xl">Free</span>
                <span className="mt-1 block text-xs text-muted-foreground">Forever</span>
              </th>
              <th scope="col" className="w-24 bg-secondary/60 px-2 py-6 text-center align-bottom font-normal md:w-40">
                <span className="block font-serif text-xl md:text-2xl">Premium</span>
                <span className="mt-1 block text-xs text-muted-foreground">$4.99 / month</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f, i) => (
              <tr key={f.name} className={cn(i < FEATURES.length - 1 && "border-b border-border")}>
                <th scope="row" className="px-6 py-4 text-left font-normal leading-snug md:px-10">
                  {f.name}
                </th>
                <td className="px-2 py-4">
                  <Mark on={f.free} label="Free" />
                </td>
                <td className="bg-secondary/60 px-2 py-4">
                  <Mark on={f.premium} label="Premium" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-5">
        <div className="flex flex-col rounded-3xl border border-border bg-card p-8 md:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Free</p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-5xl">$0</span>
            <span className="text-sm text-muted-foreground">forever</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Everything you need to plan with your cycle. No card, no catch.</p>
          <button
            type="button"
            onClick={onStart}
            className="mt-auto rounded-full border border-foreground py-3 text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-md:mt-8"
          >
            Continue free
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-6 rounded-3xl border border-foreground/80 bg-card p-8 md:col-span-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Premium · 14 days free</p>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-serif text-5xl">$4.99</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </p>
            </div>
            <Lock className="mt-1 size-4 text-muted-foreground" aria-hidden />
          </div>
          <CardField id="card-name" label="Name on card" placeholder="Alex Morgan" autoComplete="cc-name" />
          <CardField id="card-number" label="Card number" placeholder="4242 4242 4242 4242" autoComplete="cc-number" inputMode="numeric" />
          <div className="grid grid-cols-2 gap-6">
            <CardField id="card-exp" label="Expiry" placeholder="MM / YY" autoComplete="cc-exp" inputMode="numeric" />
            <CardField id="card-cvc" label="CVC" placeholder="123" autoComplete="cc-csc" inputMode="numeric" />
          </div>
          <button
            type="submit"
            className="rounded-full bg-primary py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Start my free trial
          </button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            You won&apos;t be charged until {chargeDate}. This checkout is a preview, so no card details are sent or stored.
          </p>
        </form>
      </div>
    </main>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Droplet, PersonStanding } from "lucide-react"

const WATER_EVERY = 20 * 60
const STRETCH_EVERY = 45 * 60
const SNOOZE = 5 * 60

const STRETCHES = [
  "Roll our shoulders back five slow times.",
  "Stand up and reach for the ceiling, then let it all drop.",
  "Look at something far away for 20 seconds. Eyes soft.",
]

type CheckIn = "water" | "stretch"

function clock(total: number) {
  const s = Math.max(0, total)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, "0")
  const ss = String(sec).padStart(2, "0")
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

function IntervalRow({ icon, label, remaining, every }: { icon: React.ReactNode; label: string; remaining: number; every: number }) {
  const progress = Math.min(100, Math.max(0, (1 - remaining / every) * 100))
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <dt className="inline-flex items-center gap-2 text-muted-foreground">
          {icon}
          {label}
        </dt>
        <dd className="tabular-nums">{remaining <= 0 ? "Now" : `in ${clock(remaining)}`}</dd>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-border" aria-hidden>
        <div className="h-full rounded-full bg-foreground/50 transition-[width] duration-1000" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export function HyperfocusMode({ initialFocus, onExit }: { initialFocus: string; onExit: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const [focus, setFocus] = useState(initialFocus)
  const [lastWater, setLastWater] = useState(0)
  const [lastStretch, setLastStretch] = useState(0)
  const [glasses, setGlasses] = useState(0)
  const [stretches, setStretches] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const waterIn = WATER_EVERY - (elapsed - lastWater)
  const stretchIn = STRETCH_EVERY - (elapsed - lastStretch)
  const due: CheckIn | null = waterIn <= 0 ? "water" : stretchIn <= 0 ? "stretch" : null

  const complete = (kind: CheckIn) => {
    if (kind === "water") {
      setLastWater(elapsed)
      setGlasses((g) => g + 1)
    } else {
      setLastStretch(elapsed)
      setStretches((s) => s + 1)
    }
  }

  const snooze = (kind: CheckIn) =>
    kind === "water" ? setLastWater(elapsed - WATER_EVERY + SNOOZE) : setLastStretch(elapsed - STRETCH_EVERY + SNOOZE)

  const preview = () => (glasses > stretches ? setLastStretch(elapsed - STRETCH_EVERY) : setLastWater(elapsed - WATER_EVERY))

  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-background px-5 py-10 text-foreground animate-in fade-in duration-700">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Hyperfocus mode</p>
        </div>
        <h1 className="mt-4 font-serif text-3xl leading-tight text-balance md:text-4xl">
          Everything else is on hold. We&apos;ll tap you gently.
        </h1>

        <p role="timer" aria-label={`Focused for ${clock(elapsed)}`} className="mt-12 font-serif text-7xl tabular-nums md:text-8xl">
          {clock(elapsed)}
        </p>

        <label htmlFor="hyperfocus-on" className="mt-10 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Riding this wave on
        </label>
        <input
          id="hyperfocus-on"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          placeholder="The thing that's got us"
          className="mt-2 w-full border-b border-border bg-transparent pb-2 font-serif text-2xl placeholder:text-muted-foreground/50 focus:border-foreground focus:outline-none"
        />

        <dl className="mt-10 flex flex-col gap-5">
          <IntervalRow icon={<Droplet className="size-4" aria-hidden />} label="Water check" remaining={waterIn} every={WATER_EVERY} />
          <IntervalRow icon={<PersonStanding className="size-4" aria-hidden />} label="Stretch check" remaining={stretchIn} every={STRETCH_EVERY} />
        </dl>

        <div aria-live="polite" className="mt-8 min-h-36">
          {due ? (
            <div className="rounded-2xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {due === "water" ? <Droplet className="size-3.5" aria-hidden /> : <PersonStanding className="size-3.5" aria-hidden />}
                {due === "water" ? "Soft check-in" : "Body check-in"}
              </p>
              <p className="mt-3 font-serif text-xl leading-snug text-pretty">
                {due === "water" ? "Tiny pause. A few big sips of water, then straight back in." : STRETCHES[stretches % STRETCHES.length]}
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => complete(due)}
                  className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => snooze(due)}
                  className="rounded-full border border-border px-4 py-2 text-xs transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  5 more minutes
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {glasses} {glasses === 1 ? "glass" : "glasses"} of water <span aria-hidden>&middot;</span> {stretches}{" "}
              {stretches === 1 ? "stretch" : "stretches"} so far. Our list isn&apos;t going anywhere.
            </p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-10">
          <button
            type="button"
            onClick={onExit}
            className="rounded-full border border-foreground px-5 py-2.5 text-sm transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Land the plane
          </button>
          <button type="button" onClick={preview} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Preview a check-in
          </button>
        </div>
      </div>
    </main>
  )
}

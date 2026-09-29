"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { addDays, energyScore, getPhase, type Phase } from "@/lib/twin"

interface Session {
  name: string
  short: string
  detail: string
}

function sessionFor(energy: number): Session {
  if (energy >= 72) return { name: "Spin class", short: "Spin", detail: "45 min, push the hills. Your body recovers fastest right now." }
  if (energy >= 55) return { name: "Strength training", short: "Lift", detail: "40 min, go for a new personal best while estrogen is high." }
  if (energy >= 38) return { name: "Pilates", short: "Pilates", detail: "30 min, controlled and steady. Keep intensity moderate." }
  return { name: "Gentle yin yoga", short: "Yin", detail: "20 min of long, slow holds. Rest is the training today." }
}

export function AlignmentCard({ today, cycleDay, phase }: { today: Date; cycleDay: number; phase: Phase }) {
  const [logged, setLogged] = useState(false)
  const energy = energyScore(cycleDay)
  const session = sessionFor(energy)

  const week = Array.from({ length: 7 }, (_, i) => {
    const e = energyScore(cycleDay + i)
    return {
      key: i,
      day: addDays(today, i).toLocaleDateString("en-US", { weekday: "narrow" }),
      energy: e,
      session: sessionFor(e),
      color: getPhase(cycleDay + i).color,
    }
  })

  return (
    <section aria-labelledby="alignment-heading" className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Daily alignment</p>
      <h2 id="alignment-heading" className="mt-1 font-serif text-2xl">
        {session.name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{session.detail}</p>

      <div className="mt-5">
        <div className="relative h-1.5 rounded-full bg-secondary">
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700" style={{ width: `${energy}%`, backgroundColor: phase.color }} />
          <span
            aria-hidden
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground transition-all duration-700"
            style={{ left: `${energy}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>Gentle yin yoga</span>
          <span>Spin class</span>
        </div>
        <p className="sr-only">Recommended intensity: {energy} percent.</p>
      </div>

      <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Next 7 days of movement">
        {week.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1.5">
            <div className="flex h-14 w-full items-end overflow-hidden rounded-md bg-secondary" aria-hidden>
              <div className="w-full rounded-md" style={{ height: `${d.energy}%`, backgroundColor: d.color, opacity: d.key === 0 ? 1 : 0.55 }} />
            </div>
            <span className={cn("text-[10px]", d.key === 0 ? "font-medium text-foreground" : "text-muted-foreground")}>{d.day}</span>
            <span className="sr-only">{d.session.name}</span>
            <span aria-hidden className="w-full truncate text-center text-[9px] text-muted-foreground">
              {d.session.short}
            </span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        aria-pressed={logged}
        onClick={() => setLogged((v) => !v)}
        className={cn(
          "mt-5 inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          logged ? "border-foreground bg-primary text-primary-foreground" : "border-border hover:border-foreground",
        )}
      >
        {logged ? <Check className="size-4" aria-hidden /> : null}
        {logged ? "Session logged" : "Log today's session"}
      </button>
    </section>
  )
}

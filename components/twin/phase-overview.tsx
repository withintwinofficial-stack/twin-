"use client"

import { useState } from "react"
import { ArrowDownRight, ArrowRight, ArrowUpRight, X } from "lucide-react"
import { CYCLE_LENGTH, hormones, PHASES, type Phase } from "@/lib/twin"

const W = 280
const LEFT = 24
const TOP = 16
const PLOT_W = W - LEFT - 4
const PLOT_H = 76
const BOTTOM = TOP + PLOT_H
const H = BOTTOM + 10

const xFor = (day: number) => LEFT + ((day - 1) / (CYCLE_LENGTH - 1)) * PLOT_W
const yFor = (value: number) => BOTTOM - 4 - value * (PLOT_H - 10)

function curve(fn: (d: number) => number) {
  const pts: string[] = []
  for (let d = 1; d <= CYCLE_LENGTH; d += 0.25) {
    pts.push(`${xFor(d).toFixed(1)},${yFor(fn(d)).toFixed(1)}`)
  }
  return `M${pts.join(" L")}`
}

const LINES = [
  {
    key: "Estrogen",
    role: "Lifts energy, mood & focus",
    fn: hormones.estrogen,
    stroke: "var(--foreground)",
    dash: undefined,
  },
  {
    key: "Progesterone",
    role: "Calming, slows you down",
    fn: hormones.progesterone,
    stroke: "var(--accent)",
    dash: undefined,
  },
  {
    key: "LH",
    role: "Brief spike that triggers ovulation",
    fn: hormones.lh,
    stroke: "var(--muted-foreground)",
    dash: "3 3",
  },
].map((l) => ({ ...l, d: curve(l.fn) }))

const PHASE_LABELS: Record<Phase["id"], string> = {
  menstrual: "Period",
  follicular: "Follicular",
  ovulatory: "Ovul.",
  luteal: "Luteal",
}

function reading(fn: (d: number) => number, day: number) {
  const value = fn(day)
  const delta = fn(Math.min(day + 1, CYCLE_LENGTH)) - fn(Math.max(day - 1, 1))
  const level = value > 0.6 ? "High" : value > 0.3 ? "Medium" : "Low"
  const trend = delta > 0.02 ? "rising" : delta < -0.02 ? "falling" : "steady"
  return { level, trend }
}

const TREND_ICON = { rising: ArrowUpRight, falling: ArrowDownRight, steady: ArrowRight }

export function PhaseOverview({ cycleDay, phase }: { cycleDay: number; phase: Phase }) {
  const [active, setActive] = useState<string | null>(null)
  const toggle = (key: string) => setActive((cur) => (cur === key ? null : key))
  const selected = LINES.find((l) => l.key === active) ?? null
  const selectedReading = selected ? reading(selected.fn, cycleDay) : null
  const SelectedIcon = selectedReading ? TREND_ICON[selectedReading.trend as keyof typeof TREND_ICON] : null
  const markerX = xFor(cycleDay)
  const labelAnchor = cycleDay < 5 ? "start" : cycleDay > CYCLE_LENGTH - 4 ? "end" : "middle"

  return (
    <section aria-labelledby="phase-heading" className="rounded-2xl border border-border bg-card p-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Biology today</p>
      <h2 id="phase-heading" className="mt-2 font-serif text-2xl">
        {phase.name} <span className="italic text-muted-foreground">— {phase.mantra}</span>
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{phase.science}</p>

      <figure className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-medium">Your hormones this cycle</p>
          <p className="text-[11px] text-muted-foreground">Typical levels · day 1–{CYCLE_LENGTH}</p>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="mt-3 w-full overflow-visible"
          role="img"
          aria-label={`Estimated hormone levels across a ${CYCLE_LENGTH}-day cycle. Today is day ${cycleDay}.`}
        >
          <text x={0} y={TOP + 4} fontSize={7} fill="var(--muted-foreground)">
            High
          </text>
          <text x={0} y={BOTTOM - 2} fontSize={7} fill="var(--muted-foreground)">
            Low
          </text>
          <line x1={LEFT} x2={W} y1={TOP + (PLOT_H - 4) / 2} y2={TOP + (PLOT_H - 4) / 2} stroke="var(--border)" strokeWidth={0.6} />
          <line x1={LEFT} x2={W} y1={BOTTOM} y2={BOTTOM} stroke="var(--border)" strokeWidth={0.6} />

          {PHASES.map((p) => {
            const x1 = xFor(p.start)
            const x2 = xFor(Math.min(p.end + 1, CYCLE_LENGTH))
            return (
              <rect
                key={p.id}
                x={x1}
                y={BOTTOM + 4}
                width={Math.max(0, x2 - x1 - 1)}
                height={4}
                rx={2}
                fill={p.color}
                opacity={p.id === phase.id ? 1 : 0.35}
              />
            )
          })}

          <line x1={markerX} x2={markerX} y1={TOP - 2} y2={BOTTOM} stroke="var(--foreground)" strokeWidth={0.8} strokeDasharray="2 3" opacity={0.5} />
          <text x={markerX} y={TOP - 6} fontSize={7} textAnchor={labelAnchor} fill="var(--foreground)" fontWeight={600}>
            Today · Day {cycleDay}
          </text>

          {LINES.map((l) => {
            const isActive = active === l.key
            const dimmed = active !== null && !isActive
            return (
              <g
                key={l.key}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`${l.key} line`}
                onClick={() => toggle(l.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    toggle(l.key)
                  }
                }}
                className="cursor-pointer outline-none [&:focus-visible>path:nth-child(2)]:stroke-[2.6]"
                style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity 300ms" }}
              >
                <path d={l.d} fill="none" stroke="transparent" strokeWidth={12} strokeLinecap="round" />
                <path
                  d={l.d}
                  fill="none"
                  stroke={l.stroke}
                  strokeWidth={isActive ? 2.4 : 1.4}
                  strokeDasharray={l.dash}
                  strokeLinecap="round"
                  style={{ transition: "stroke-width 200ms" }}
                />
                <circle cx={markerX} cy={yFor(l.fn(cycleDay))} r={isActive ? 3.6 : 2.8} fill="var(--card)" stroke={l.stroke} strokeWidth={1.3} />
              </g>
            )
          })}
        </svg>

        <div className="mt-1.5 flex text-[10px] text-muted-foreground" style={{ paddingLeft: `${(LEFT / W) * 100}%`, paddingRight: `${(4 / W) * 100}%` }} aria-hidden>
          {PHASES.map((p) => (
            <span
              key={p.id}
              className={p.id === phase.id ? "truncate font-medium text-foreground" : "truncate"}
              style={{ width: `${((p.end - p.start + 1) / CYCLE_LENGTH) * 100}%` }}
            >
              {PHASE_LABELS[p.id]}
            </span>
          ))}
        </div>

        <figcaption className="mt-4" aria-live="polite">
          {selected ? (
            <div key={selected.key} className="flex items-start gap-3 rounded-xl bg-secondary px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <svg width="18" height="6" aria-hidden className="mt-2 shrink-0">
                <line x1="0" x2="18" y1="3" y2="3" stroke={selected.stroke} strokeWidth="2" strokeDasharray={selected.dash} strokeLinecap="round" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{selected.key}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{selected.role}</p>
                <p className="mt-2 flex items-center gap-1 text-xs">
                  Today: <span className="font-medium">{selectedReading?.level}</span>
                  {SelectedIcon ? <SelectedIcon className="size-3.5 text-muted-foreground" aria-hidden /> : null}
                  <span className="text-muted-foreground">and {selectedReading?.trend}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close hormone details"
                className="rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">Tap a line to see which hormone it is.</p>
          )}
        </figcaption>
      </figure>
    </section>
  )
}

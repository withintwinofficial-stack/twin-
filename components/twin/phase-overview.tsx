import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react"
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

          {LINES.map((l) => (
            <path key={l.key} d={l.d} fill="none" stroke={l.stroke} strokeWidth={1.4} strokeDasharray={l.dash} strokeLinecap="round" />
          ))}

          <line x1={markerX} x2={markerX} y1={TOP - 2} y2={BOTTOM} stroke="var(--foreground)" strokeWidth={0.8} strokeDasharray="2 3" opacity={0.5} />
          <text x={markerX} y={TOP - 6} fontSize={7} textAnchor={labelAnchor} fill="var(--foreground)" fontWeight={600}>
            Today · Day {cycleDay}
          </text>
          {LINES.map((l) => (
            <circle key={l.key} cx={markerX} cy={yFor(l.fn(cycleDay))} r={2.8} fill="var(--card)" stroke={l.stroke} strokeWidth={1.3} />
          ))}
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

        <figcaption className="mt-5">
          <p className="sr-only">Key and today&apos;s readings</p>
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {LINES.map((l) => {
              const r = reading(l.fn, cycleDay)
              const Icon = TREND_ICON[r.trend as keyof typeof TREND_ICON]
              return (
                <li key={l.key} className="flex items-center gap-3 py-2.5">
                  <svg width="18" height="6" aria-hidden className="shrink-0">
                    <line x1="0" x2="18" y1="3" y2="3" stroke={l.stroke} strokeWidth="2" strokeDasharray={l.dash} strokeLinecap="round" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{l.key}</p>
                    <p className="text-xs text-muted-foreground">{l.role}</p>
                  </div>
                  <p className="flex shrink-0 items-center gap-1 text-xs">
                    <span className="font-medium">{r.level}</span>
                    <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                    <span className="sr-only">and {r.trend}</span>
                  </p>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Lines show how each hormone typically rises and falls. Dots mark where you are today.
          </p>
        </figcaption>
      </figure>
    </section>
  )
}

import { CYCLE_LENGTH, hormones, PHASES, type Phase } from "@/lib/twin"

const W = 280
const H = 88

function curve(fn: (d: number) => number) {
  const pts: string[] = []
  for (let d = 1; d <= CYCLE_LENGTH; d += 0.25) {
    const x = ((d - 1) / (CYCLE_LENGTH - 1)) * W
    const y = H - 6 - fn(d) * (H - 16)
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M${pts.join(" L")}`
}

const LINES = [
  { key: "Estrogen", d: curve(hormones.estrogen), stroke: "var(--foreground)", dash: undefined },
  { key: "Progesterone", d: curve(hormones.progesterone), stroke: "var(--accent)", dash: undefined },
  { key: "LH", d: curve(hormones.lh), stroke: "var(--muted-foreground)", dash: "3 3" },
]

export function PhaseOverview({ cycleDay, phase }: { cycleDay: number; phase: Phase }) {
  const markerX = ((cycleDay - 1) / (CYCLE_LENGTH - 1)) * W

  return (
    <section aria-labelledby="phase-heading" className="rounded-2xl border border-border bg-card p-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Biology today</p>
      <h2 id="phase-heading" className="mt-2 font-serif text-2xl">
        {phase.name} <span className="italic text-muted-foreground">— {phase.mantra}</span>
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{phase.science}</p>

      <figure className="mt-5">
        <svg viewBox={`0 0 ${W} ${H + 8}`} className="w-full" role="img" aria-label={`Estimated hormone levels across a ${CYCLE_LENGTH}-day cycle, currently day ${cycleDay}`}>
          {PHASES.map((p) => {
            const x1 = ((p.start - 1) / (CYCLE_LENGTH - 1)) * W
            const x2 = ((Math.min(p.end + 1, CYCLE_LENGTH) - 1) / (CYCLE_LENGTH - 1)) * W
            return <rect key={p.id} x={x1} y={H} width={Math.max(0, x2 - x1 - 1)} height={4} rx={2} fill={p.color} opacity={p.id === phase.id ? 1 : 0.35} />
          })}
          {LINES.map((l) => (
            <path key={l.key} d={l.d} fill="none" stroke={l.stroke} strokeWidth={1.4} strokeDasharray={l.dash} strokeLinecap="round" />
          ))}
          <line x1={markerX} x2={markerX} y1={0} y2={H} stroke="var(--foreground)" strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
          <circle cx={markerX} cy={H - 6 - hormones.estrogen(cycleDay) * (H - 16)} r={3.5} fill="var(--card)" stroke="var(--foreground)" strokeWidth={1.4} />
        </svg>
        <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {LINES.map((l) => (
            <span key={l.key} className="inline-flex items-center gap-1.5">
              <svg width="14" height="4" aria-hidden>
                <line x1="0" x2="14" y1="2" y2="2" stroke={l.stroke} strokeWidth="1.6" strokeDasharray={l.dash} />
              </svg>
              {l.key}
            </span>
          ))}
        </figcaption>
      </figure>
    </section>
  )
}

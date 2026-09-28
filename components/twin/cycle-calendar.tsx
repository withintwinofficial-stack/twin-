import { cn } from "@/lib/utils"
import { addDays, CYCLE_LENGTH, getPhase, normalizeDay, PHASES, toISODate, type Task } from "@/lib/twin"

interface Props {
  today: Date
  cycleDay: number
  tasks: Task[]
  onCycleDayChange: (day: number) => void
}

export function CycleCalendar({ today, cycleDay, tasks, onCycleDayChange }: Props) {
  const days = Array.from({ length: 28 }, (_, i) => {
    const date = addDays(today, i)
    const iso = toISODate(date)
    return {
      iso,
      date,
      phase: getPhase(cycleDay + i),
      cycle: normalizeDay(cycleDay + i),
      due: tasks.filter((t) => !t.done && t.dueDate === iso),
    }
  })

  const rangeLabel = `${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${addDays(today, 27).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`

  return (
    <section aria-labelledby="calendar-heading" className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="calendar-heading" className="font-serif text-2xl">
          Rhythm forecast
        </h2>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{rangeLabel}</p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
        {days.slice(0, 7).map((d) => (
          <span key={`h${d.iso}`} className="pb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {d.date.toLocaleDateString("en-US", { weekday: "narrow" })}
          </span>
        ))}
        {days.map((d, i) => {
          const label = `${d.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}, cycle day ${d.cycle}, ${d.phase.name} phase${d.due.length ? `, due: ${d.due.map((t) => t.title).join(", ")}` : ""}`
          return (
            <div
              key={d.iso}
              title={label}
              aria-label={label}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg text-xs",
                i === 0 ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
              )}
            >
              <span className="font-medium">{d.date.getDate()}</span>
              <span
                aria-hidden
                className="absolute bottom-1.5 h-0.5 w-3.5 rounded-full"
                style={{ backgroundColor: d.phase.color, opacity: i === 0 ? 1 : 0.85 }}
              />
              {d.due.length ? (
                <span aria-hidden className={cn("absolute top-1.5 right-1.5 size-1.5 rounded-full", i === 0 ? "bg-primary-foreground" : "bg-accent")} />
              ) : null}
            </div>
          )
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        {PHASES.map((p) => (
          <li key={p.id} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-0.5 w-3 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-1.5 rounded-full bg-accent" />
          Due
        </li>
      </ul>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <label htmlFor="cycle-day" className="text-xs text-muted-foreground">
            Today&apos;s cycle day
          </label>
          <span className="font-serif text-lg">Day {cycleDay}</span>
        </div>
        <input
          id="cycle-day"
          type="range"
          min={1}
          max={CYCLE_LENGTH}
          value={cycleDay}
          onChange={(e) => onCycleDayChange(Number(e.target.value))}
          className="mt-2 w-full accent-foreground"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">Adjust to sync with your body — Twin&apos;s wardrobe and reminders update instantly.</p>
      </div>
    </section>
  )
}

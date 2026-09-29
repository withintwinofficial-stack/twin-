"use client"

import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  actualCycleDay,
  addDays,
  dayMarker,
  getPhase,
  MARKER_LABELS,
  toISODate,
  toModelDay,
  type CycleProfile,
  type DayMarker,
  type Task,
} from "@/lib/twin"

interface Props {
  today: Date
  profile: CycleProfile
  tasks: Task[]
  onCycleDayChange: (day: number) => void
}

const DAYS_SHOWN = 35

const MARKER_CELL: Record<Exclude<DayMarker, null>, string> = {
  "period-start": "bg-period text-period-foreground",
  period: "bg-period/15",
  ovulation: "bg-fertile/35 ring-1 ring-inset ring-fertile",
  fertile: "bg-fertile/15",
}

const LEGEND: { marker: Exclude<DayMarker, null>; swatch: string }[] = [
  { marker: "period-start", swatch: "bg-period" },
  { marker: "period", swatch: "bg-period/25" },
  { marker: "fertile", swatch: "bg-fertile/25" },
  { marker: "ovulation", swatch: "bg-fertile/40 ring-1 ring-inset ring-fertile" },
]

export function CycleCalendar({ today, profile, tasks, onCycleDayChange }: Props) {
  const todayCycleDay = actualCycleDay(profile, today)
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const date = addDays(today, i)
    const iso = toISODate(date)
    const cycle = actualCycleDay(profile, date)
    return {
      iso,
      date,
      cycle,
      marker: dayMarker(cycle, profile),
      phase: getPhase(toModelDay(cycle, profile.cycleLength)),
      due: tasks.filter((t) => !t.done && t.scope === "monthly" && t.dueDate === iso),
    }
  })

  const nextStart = days.find((d, i) => i > 0 && d.marker === "period-start")
  const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", o)
  const rangeLabel = `${fmt(today, { month: "short", day: "numeric" })} – ${fmt(addDays(today, DAYS_SHOWN - 1), { month: "short", day: "numeric" })}`

  return (
    <section aria-labelledby="calendar-heading" className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="calendar-heading" className="font-serif text-2xl">
          Rhythm forecast
        </h2>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{rangeLabel}</p>
      </div>
      {nextStart ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Next period expected <span className="font-medium text-foreground">{fmt(nextStart.date, { weekday: "short", month: "short", day: "numeric" })}</span>
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
        {days.slice(0, 7).map((d) => (
          <span key={`h${d.iso}`} className="pb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {fmt(d.date, { weekday: "narrow" })}
          </span>
        ))}
        {days.map((d, i) => {
          const isToday = i === 0
          const label = `${fmt(d.date, { weekday: "long", month: "long", day: "numeric" })}${d.marker ? `, ${MARKER_LABELS[d.marker]}` : ""}${d.due.length ? `, ${d.due.length} due` : ""}`
          return (
            <Popover key={d.iso}>
              <PopoverTrigger
                aria-label={label}
                className={cn(
                  "relative flex aspect-square cursor-pointer items-center justify-center rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  d.marker ? MARKER_CELL[d.marker] : "hover:bg-secondary",
                  isToday && "outline-2 outline-offset-1 outline-foreground",
                )}
              >
                <span className={cn(isToday || d.marker === "period-start" ? "font-semibold" : "font-medium")}>{d.date.getDate()}</span>
                {d.due.length ? (
                  <span aria-hidden className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
                    {d.due.slice(0, 3).map((t) => (
                      <span key={t.id} className={cn("size-1 rounded-full", d.marker === "period-start" ? "bg-period-foreground" : "bg-foreground")} />
                    ))}
                  </span>
                ) : null}
              </PopoverTrigger>
              <PopoverContent side="top" sideOffset={6} className="w-64 rounded-2xl p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {isToday ? "Today" : fmt(d.date, { weekday: "long" })} · Cycle day {d.cycle}
                </p>
                <p className="mt-1 font-serif text-lg leading-tight">{fmt(d.date, { month: "long", day: "numeric" })}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: d.phase.color }} />
                  {d.phase.name} phase
                  {d.marker ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className={d.marker.startsWith("period") ? "text-period" : "text-fertile"}>{MARKER_LABELS[d.marker]}</span>
                    </>
                  ) : null}
                </p>
                <div className="mt-3 border-t border-border pt-3">
                  {d.due.length ? (
                    <ul className="flex flex-col gap-2">
                      {d.due.map((t) => (
                        <li key={t.id} className="flex items-start justify-between gap-3 text-sm">
                          <span className="leading-snug">{t.title}</span>
                          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {t.effort === "deep" ? "Deep" : "Light"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">Nothing due. A clear day.</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        {LEGEND.map((l) => (
          <li key={l.marker} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={cn("size-2.5 rounded-[3px]", l.swatch)} />
            {l.marker === "ovulation" ? "Ovulation" : MARKER_LABELS[l.marker]}
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-1 rounded-full bg-foreground" />
          Task due
        </li>
      </ul>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <label htmlFor="cycle-day" className="text-xs text-muted-foreground">
            Today&apos;s cycle day
          </label>
          <span className="font-serif text-lg">Day {todayCycleDay}</span>
        </div>
        <input
          id="cycle-day"
          type="range"
          min={1}
          max={profile.cycleLength}
          value={todayCycleDay}
          onChange={(e) => onCycleDayChange(Number(e.target.value))}
          className="mt-2 w-full accent-foreground"
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          Tracked from your last period on {fmt(new Date(profile.lastPeriodStart + "T00:00:00"), { month: "short", day: "numeric" })} · {profile.cycleLength}-day cycle
        </p>
      </div>
    </section>
  )
}

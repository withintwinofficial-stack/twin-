import { CYCLE_LENGTH, energyScore, type Phase } from "@/lib/twin"

export function DashboardHeader({ today, cycleDay, phase, evening = false }: { today: Date; cycleDay: number; phase: Phase; evening?: boolean }) {
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const hour = new Date().getHours()
  const greeting = evening ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <header className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div className="flex items-end gap-5">
        <p className="font-serif text-5xl leading-none tracking-tight md:text-6xl">
          Twin<span className="text-accent">.</span>
        </p>
        <div className="hidden pb-1 sm:block">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{dateLabel}</p>
          <h1 className="mt-1 text-sm text-foreground" suppressHydrationWarning>
            {greeting}. Here&apos;s your day, in rhythm.
          </h1>
        </div>
      </div>

      <dl className="flex items-stretch divide-x divide-border text-sm">
        <div className="pr-5">
          <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Cycle day</dt>
          <dd className="mt-1 font-serif text-2xl">
            {cycleDay}
            <span className="text-base text-muted-foreground"> / {CYCLE_LENGTH}</span>
          </dd>
        </div>
        <div className="px-5">
          <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Phase</dt>
          <dd className="mt-1 flex items-center gap-2 font-serif text-2xl">
            <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: phase.color }} />
            {phase.name}
          </dd>
        </div>
        <div className="pl-5">
          <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Energy</dt>
          <dd className="mt-1 font-serif text-2xl">{energyScore(cycleDay)}%</dd>
        </div>
      </dl>
    </header>
  )
}

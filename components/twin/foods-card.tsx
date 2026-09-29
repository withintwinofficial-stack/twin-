import { getNextNutritionWindow, getNutritionWindow, HERBS } from "@/lib/nutrition"
import type { Phase } from "@/lib/twin"

export function FoodsCard({ cycleDay, phase }: { cycleDay: number; phase: Phase }) {
  const window = getNutritionWindow(cycleDay)
  const { next, inDays } = getNextNutritionWindow(cycleDay)
  const herbs = HERBS[window.id] ?? []

  return (
    <section aria-labelledby="foods-heading" className="rounded-2xl border border-border bg-card p-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Foods & herbs for today</p>
      <h2 id="foods-heading" className="mt-2 font-serif text-2xl text-balance">
        {window.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{window.summary}</p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Nutrients to focus on">
        {window.focus.map((f) => (
          <li key={f} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs">
            <span className="size-1.5 rounded-full" style={{ background: phase.color }} aria-hidden />
            {f}
          </li>
        ))}
      </ul>

      <ul className="mt-5 flex flex-col divide-y divide-border border-y border-border">
        {window.foods.slice(0, 5).map((food) => (
          <li key={food.name} className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="font-serif text-base leading-snug">{food.name}</span>
            <span className="text-right text-xs text-muted-foreground">{food.why}</span>
          </li>
        ))}
      </ul>

      {herbs.length ? (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Herbs & teas</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {herbs.map((h) => (
              <li key={h.name} className="text-sm">
                <span className="font-medium">{h.name}</span>
                <span className="text-muted-foreground"> — {h.why}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {window.easeOff ? (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Go easy on: </span>
          {window.easeOff}
        </p>
      ) : null}

      <p className="mt-4 text-xs text-muted-foreground">
        Next up in {inDays} {inDays === 1 ? "day" : "days"}: <span className="font-medium text-foreground">{next.title}</span>
      </p>
    </section>
  )
}

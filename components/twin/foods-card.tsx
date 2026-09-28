import { getNextNutritionWindow, getNutritionWindow } from "@/lib/nutrition"
import type { Phase } from "@/lib/twin"

export function FoodsCard({ cycleDay, phase }: { cycleDay: number; phase: Phase }) {
  const window = getNutritionWindow(cycleDay)
  const { next, inDays } = getNextNutritionWindow(cycleDay)

  return (
    <section aria-labelledby="foods-heading" className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <div className="flex flex-col md:w-72 md:shrink-0">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Foods for today</p>
          <h2 id="foods-heading" className="mt-2 font-serif text-2xl text-balance">
            {window.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{window.summary}</p>

          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Nutrients to focus on">
            {window.focus.map((f) => (
              <li key={f} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs">
                <span className="size-1.5 rounded-full" style={{ background: phase.color }} aria-hidden />
                {f}
              </li>
            ))}
          </ul>

          <p className="mt-auto pt-5 text-xs text-muted-foreground">
            Next up in {inDays} {inDays === 1 ? "day" : "days"}:{" "}
            <span className="font-medium text-foreground">{next.title}</span>
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {window.foods.map((food) => (
              <li key={food.name} className="flex flex-col gap-1 bg-card p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{food.nutrient}</p>
                <p className="font-serif text-lg leading-snug">{food.name}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{food.why}</p>
              </li>
            ))}
          </ul>

          {window.easeOff && (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Go easy on: </span>
              {window.easeOff}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

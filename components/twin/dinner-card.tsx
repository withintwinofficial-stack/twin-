"use client"

import { useState } from "react"
import useSWR from "swr"
import { Clock, CookingPot } from "lucide-react"
import { cn } from "@/lib/utils"
import { getNutritionWindow } from "@/lib/nutrition"
import type { Recipe } from "@/lib/dinner"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Could not load dinner idea")
  return (await res.json()) as { recipe: Recipe }
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-foreground bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", checked ? "bg-primary-foreground" : "bg-muted-foreground/50")} />
      {label}
    </button>
  )
}

export function DinnerCard({ cycleDay }: { cycleDay: number }) {
  const [vegetarian, setVegetarian] = useState(false)
  const [glutenFree, setGlutenFree] = useState(false)
  const window = getNutritionWindow(cycleDay)
  const key = `/api/dinner?window=${window.id}&veg=${vegetarian ? 1 : 0}&gf=${glutenFree ? 1 : 0}`
  const { data, error, isLoading } = useSWR(key, fetcher, { keepPreviousData: true })
  const recipe = data?.recipe

  return (
    <section aria-labelledby="dinner-heading" className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Low-effort dinner</p>
        <CookingPot className="size-4 text-muted-foreground" aria-hidden />
      </div>

      <div className="mt-3 flex flex-wrap gap-2" aria-label="Dietary preferences">
        <Toggle label="Vegetarian" checked={vegetarian} onChange={setVegetarian} />
        <Toggle label="Gluten-free" checked={glutenFree} onChange={setGlutenFree} />
      </div>

      <div aria-live="polite" aria-busy={isLoading} className={cn("mt-5 transition-opacity", isLoading && "opacity-50")}>
        {error ? (
          <p className="text-sm text-muted-foreground">Twin&apos;s kitchen is closed right now. Toast counts as dinner.</p>
        ) : recipe ? (
          <div key={recipe.id} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            <h2 id="dinner-heading" className="font-serif text-2xl leading-tight text-balance">
              {recipe.title}
            </h2>
            <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" aria-hidden />
                {recipe.minutes} min
              </span>
              <span aria-hidden>&middot;</span>
              <span>{recipe.mess}</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed">{recipe.why}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Ingredients">
              {recipe.ingredients.map((item) => (
                <li key={item} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col gap-2" aria-label="Loading dinner idea">
            <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <h2 id="dinner-heading" className="sr-only">
              Loading dinner idea
            </h2>
          </div>
        )}
      </div>
    </section>
  )
}

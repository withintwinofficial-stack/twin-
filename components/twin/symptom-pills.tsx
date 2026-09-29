"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export const SYMPTOMS = ["Fatigue", "Headache", "Brain Fog"] as const
export type Symptom = (typeof SYMPTOMS)[number]

export function SymptomPills({ logged, onToggle }: { logged: Symptom[]; onToggle: (s: Symptom) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p id="symptoms-label" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        How are we feeling?
      </p>
      <div role="group" aria-labelledby="symptoms-label" className="flex flex-wrap justify-center gap-2">
        {SYMPTOMS.map((s) => {
          const on = logged.includes(s)
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(s)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                on ? "border-foreground bg-foreground text-background" : "border-border bg-card/70 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
              )}
            >
              {on ? <Check className="size-3" aria-hidden /> : null}
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}

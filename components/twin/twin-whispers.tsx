"use client"

import { useState } from "react"
import { energyScore, type Phase } from "@/lib/twin"

function buildWhispers(phase: Phase, energy: number, doneCount: number, evening: boolean) {
  const finished = doneCount === 0 ? "nothing yet" : doneCount === 1 ? "one thing" : `${doneCount} things`
  if (evening) {
    return [
      `You finished ${finished} today. That's the whole assignment. Laptop can close now.`,
      "The unfinished list isn't a verdict. It's just tomorrow's menu.",
      "Brain's off the clock. Mine too, I've got tea.",
    ]
  }
  if (phase.energy === "low") {
    return [
      `Hey, it's okay that you've only done ${finished} today. Your energy is at ${energy}% right now. Let's close the laptop soon.`,
      "Low battery isn't laziness, it's progesterone. One tiny task, then a snack?",
      "If it's not on fire, it can wait for your follicular era.",
    ]
  }
  return [
    `Energy's at ${energy}%. This is your window, so pick the scary task first.`,
    `${doneCount > 0 ? `${doneCount} down already.` : "Fresh start."} Your dopamine is on our side this week.`,
    "Starting is the hard part and right now starting is cheap. Go.",
  ]
}

export function TwinWhispers({ phase, cycleDay, doneCount, evening = false }: { phase: Phase; cycleDay: number; doneCount: number; evening?: boolean }) {
  const [index, setIndex] = useState(0)
  const whispers = buildWhispers(phase, energyScore(cycleDay), doneCount, evening)
  const text = whispers[index % whispers.length]

  return (
    <section aria-labelledby="whispers-heading" className="relative">
      <span aria-hidden className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-l border-t border-border bg-card" />
      <div className="relative rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="whispers-heading" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Twin whispers
          </h2>
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Another
          </button>
        </div>
        <p key={text} aria-live="polite" className="mt-2 font-serif text-lg leading-snug text-pretty animate-in fade-in duration-500">
          {text}
        </p>
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import type { Symptom } from "./symptom-pills"

const PREDICTIVE_WHISPER =
  "We usually note a recurring hormonal headache and heavy fatigue around Day 24, which is in two days. Let's proactively protect our focus: grab a big glass of water, up our protein intake at lunch, and we've automatically scaled back tomorrow's major chores so we don't hit a wall. We've got this."

function eveningWhispers(doneCount: number) {
  const finished = doneCount === 0 ? "nothing yet" : doneCount === 1 ? "one thing" : `${doneCount} things`
  return [
    `We finished ${finished} today. That's the whole assignment. Laptop can close now.`,
    "Our unfinished list isn't a verdict. It's just tomorrow's menu.",
    "We're off the clock. I've got tea, you get the blanket.",
  ]
}

function formatList(items: string[]) {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

interface TwinWhispersProps {
  doneCount: number
  evening?: boolean
  loggedSymptoms?: Symptom[]
}

export function TwinWhispers({ doneCount, evening = false, loggedSymptoms = [] }: TwinWhispersProps) {
  const [index, setIndex] = useState(0)
  const eveningLines = eveningWhispers(doneCount)
  const text = evening ? eveningLines[index % eveningLines.length] : PREDICTIVE_WHISPER

  return (
    <section aria-labelledby="whispers-heading" className="relative">
      <span aria-hidden className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-l border-t border-border bg-card" />
      <div className="relative rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="whispers-heading" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Twin whispers
          </h2>
          {evening ? (
            <button
              type="button"
              onClick={() => setIndex((i) => i + 1)}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Another
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-3" aria-hidden />
              Predictive
            </span>
          )}
        </div>
        <p key={text} className="mt-2 font-serif text-lg leading-snug text-pretty animate-in fade-in duration-500">
          {text}
        </p>
        {!evening && loggedSymptoms.length > 0 ? (
          <p aria-live="polite" className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground animate-in fade-in duration-500">
            Noted: {formatList(loggedSymptoms.map((s) => s.toLowerCase()))} today. We&apos;ll add it to our pattern so next cycle&apos;s forecast gets sharper.
          </p>
        ) : null}
      </div>
    </section>
  )
}

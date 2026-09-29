"use client"

import { useState, type FormEvent } from "react"
import { Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { daysUntil, parseTaxNote, taxAdvice, taxHeadline, type TaxItem } from "@/lib/pillars"
import { parseISODate } from "@/lib/twin"

const PLACEHOLDER = "What are we going to forget? (e.g., bought avocados today, gym trial ends in 7 days)"

function TaxCard({ item, today, onDone, example = false }: { item: Omit<TaxItem, "id">; today: Date; onDone?: () => void; example?: boolean }) {
  const left = daysUntil(item.dueISO, today)
  const span = Math.max(1, daysUntil(item.dueISO, parseISODate(item.createdISO)))
  const progress = Math.min(100, Math.max(4, ((span - left) / span) * 100))
  const urgent = left <= 2
  return (
    <div className={cn("flex gap-4 rounded-xl border border-border bg-background/70 p-4", example && "opacity-60")}>
      <div className="flex w-12 shrink-0 flex-col items-center">
        <span className="font-serif text-3xl leading-none tabular-nums">{Math.max(0, left)}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{left === 1 ? "day" : "days"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-pretty">{taxHeadline(item, left)}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{taxAdvice(item.kind)}</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-border" aria-hidden>
          <div className={cn("h-full rounded-full", urgent ? "bg-[var(--period)]" : "bg-foreground/45")} style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            {example ? "Example" : `By ${parseISODate(item.dueISO).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </p>
          {onDone ? (
            <button
              type="button"
              onClick={onDone}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Check className="size-3" aria-hidden />
              Handled
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

interface TaxShelfProps {
  today: Date
  items: TaxItem[]
  premium: boolean
  onAdd: (note: string) => void
  onRemove: (id: string) => void
  onLocked: () => void
}

export function TaxShelf({ today, items, premium, onAdd, onRemove, onLocked }: TaxShelfProps) {
  const [draft, setDraft] = useState("")
  const [reading, setReading] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!premium) return onLocked()
    const note = draft.trim()
    if (!note || reading) return
    setDraft("")
    setReading(note)
    setTimeout(() => {
      onAdd(note)
      setReading(null)
    }, 750)
  }

  const sorted = [...items].sort((a, b) => a.dueISO.localeCompare(b.dueISO))

  return (
    <section aria-labelledby="tax-heading" className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="tax-heading" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          ADHD Tax Prevention
        </h2>
        {!premium ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Lock className="size-3" aria-hidden />
            Premium
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-serif text-lg leading-snug text-pretty">Small forgets get expensive. Let&apos;s catch them early.</p>

      <form onSubmit={submit} className="mt-4">
        <label htmlFor="tax-note" className="sr-only">
          Something we might forget
        </label>
        <input
          id="tax-note"
          value={premium ? draft : ""}
          onChange={(e) => (premium ? setDraft(e.target.value) : onLocked())}
          onPaste={(e) => {
            if (premium) return
            e.preventDefault()
            onLocked()
          }}
          placeholder={PLACEHOLDER}
          autoComplete="off"
          enterKeyHint="done"
          className="w-full border-b border-border bg-transparent pb-2 text-sm placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
        />
        <p className="mt-2 text-[11px] text-muted-foreground">Press Enter and we&apos;ll work out the timeline.</p>
      </form>

      <ul className="mt-4 flex flex-col gap-3" aria-live="polite">
        {reading ? (
          <li className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-foreground/40 motion-safe:animate-pulse" aria-hidden />
            Reading the timeline for &ldquo;{reading}&rdquo;
          </li>
        ) : null}
        {premium ? (
          sorted.map((item) => (
            <li key={item.id} className="animate-in fade-in slide-in-from-top-1 duration-500">
              <TaxCard item={item} today={today} onDone={() => onRemove(item.id)} />
            </li>
          ))
        ) : (
          <li>
            <TaxCard item={parseTaxNote("bought avocados today", today)} today={today} example />
          </li>
        )}
      </ul>
    </section>
  )
}

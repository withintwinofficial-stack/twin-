"use client"

import { useState } from "react"
import { ArrowRight, Check, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BioReminder, Phase, Severity } from "@/lib/twin"

const SEVERITY: Record<Severity, { label: string; className: string }> = {
  urgent: { label: "Act today", className: "bg-accent text-accent-foreground" },
  advise: { label: "Plan ahead", className: "bg-secondary text-secondary-foreground" },
  calm: { label: "On track", className: "border border-border text-muted-foreground" },
}

function highlightTitle(text: string, title: string) {
  const i = text.indexOf(title)
  if (i === -1) return text
  return (
    <>
      {text.slice(0, i)}
      <em className="not-italic underline decoration-accent decoration-1 underline-offset-[6px]">{title}</em>
      {text.slice(i + title.length)}
    </>
  )
}

interface Props {
  reminders: BioReminder[]
  phase: Phase
  plannedIds: string[]
  onPlanToday: (taskId: string) => void
}

export function BioReminderCard({ reminders, phase, plannedIds, onPlanToday }: Props) {
  const [index, setIndex] = useState(0)

  if (reminders.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Hormone-aware engine</p>
        <p className="mt-4 font-serif text-3xl">All clear. Your Twin suggests a slow walk and a glass of water.</p>
      </section>
    )
  }

  const activeIndex = Math.min(index, reminders.length - 1)
  const active = reminders[activeIndex]
  const others = reminders.filter((_, i) => i !== activeIndex).slice(0, 3)
  const planned = plannedIds.includes(active.taskId)
  const severity = SEVERITY[active.severity]

  return (
    <section aria-labelledby="engine-heading" className="rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 md:px-8">
        <h2 id="engine-heading" className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Activity className="size-3.5" aria-hidden />
          Hormone-aware engine
        </h2>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping" style={{ backgroundColor: phase.color }} />
            <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: phase.color }} />
          </span>
          Reading {reminders.length} open task{reminders.length === 1 ? "" : "s"} against your {phase.name.toLowerCase()} phase
        </p>
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-[1fr_auto] md:p-8">
        <div key={active.taskId + active.body} className="animate-in fade-in slide-in-from-bottom-1 duration-500" aria-live="polite">
          <span className={cn("inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]", severity.className)}>
            {severity.label}
          </span>
          <p className="mt-5 text-pretty font-serif text-3xl leading-tight md:text-[2.4rem]">
            {highlightTitle(active.lead, active.taskTitle)} <span className="text-muted-foreground">{active.body}</span>
          </p>
          <p className="mt-5 max-w-xl border-l border-accent pl-4 text-sm leading-relaxed text-muted-foreground">{active.insight}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={planned}
              onClick={() => onPlanToday(active.taskId)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {planned ? <Check className="size-4" aria-hidden /> : null}
              {planned ? "Planned for today" : "Plan it for today"}
            </button>
            {reminders.length > 1 ? (
              <button
                type="button"
                onClick={() => setIndex((activeIndex + 1) % reminders.length)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Next insight
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        <dl className="grid h-fit grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 md:w-52 md:grid-cols-1 md:border-t-0 md:border-l md:pt-0 md:pl-8">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Phase at deadline</dt>
            <dd className="mt-1 flex items-center gap-2 font-serif text-xl">
              <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: active.phaseAtDue.color }} />
              {active.phaseAtDue.name}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Energy forecast</dt>
            <dd className="mt-1 font-serif text-xl">{active.energyAtDue}%</dd>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary" aria-hidden>
              <div className="h-full rounded-full bg-foreground transition-all duration-700" style={{ width: `${active.energyAtDue}%` }} />
            </div>
          </div>
        </dl>
      </div>

      {others.length > 0 ? (
        <ul className="divide-y divide-border border-t border-border">
          {others.map((r) => (
            <li key={r.taskId}>
              <button
                type="button"
                onClick={() => setIndex(reminders.indexOf(r))}
                className="flex w-full items-center gap-4 px-6 py-3.5 text-left transition-colors hover:bg-secondary/50 focus-visible:bg-secondary/50 focus-visible:outline-none md:px-8"
              >
                <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: r.phaseAtDue.color }} />
                <span className="min-w-0 flex-1 truncate text-sm">{r.lead}</span>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{SEVERITY[r.severity].label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

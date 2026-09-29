"use client"

import { useRef, useState } from "react"
import { Wind } from "lucide-react"
import type { Task } from "@/lib/twin"

export function EveningRelease({ tasks, onRelease }: { tasks: Task[]; onRelease: (ids: string[]) => void }) {
  const open = tasks.filter((t) => !t.done)
  const doneToday = tasks.length - open.length
  const [dissolving, setDissolving] = useState(false)
  const [releasedCount, setReleasedCount] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const release = () => {
    if (!open.length || dissolving) return
    setDissolving(true)
    const ids = open.map((t) => t.id)
    timer.current = setTimeout(() => {
      onRelease(ids)
      setReleasedCount(ids.length)
      setDissolving(false)
    }, 1100 + ids.length * 120)
  }

  return (
    <section aria-labelledby="evening-heading" className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Sunset shutdown</p>
      <h2 id="evening-heading" className="mt-2 font-serif text-3xl text-balance md:text-4xl">
        {releasedCount !== null ? "All clear. Rest well." : "Let the rest of today go."}
      </h2>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
        You closed {doneToday} {doneToday === 1 ? "task" : "tasks"} today. Anything left can drift to tomorrow. No streak lost, no red numbers, no guilt.
      </p>

      {open.length ? (
        <ul className="mt-6 flex flex-col divide-y divide-border border-y border-border">
          {open.map((task, i) => (
            <li
              key={task.id}
              className={dissolving ? "py-3 text-sm motion-safe:animate-twin-dissolve motion-reduce:opacity-0" : "py-3 text-sm"}
              style={dissolving ? { animationDelay: `${i * 120}ms` } : undefined}
            >
              {task.title}
            </li>
          ))}
        </ul>
      ) : null}

      <div aria-live="polite">
        {releasedCount !== null ? (
          <p className="mt-6 rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground animate-in fade-in duration-700">
            {releasedCount} {releasedCount === 1 ? "task is" : "tasks are"} waiting gently for tomorrow. Your 12-day streak is still intact.
          </p>
        ) : null}
      </div>

      {open.length ? (
        <button
          type="button"
          onClick={release}
          disabled={dissolving}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          <Wind className="size-4" aria-hidden />
          {dissolving ? "Releasing..." : "Release to tomorrow"}
        </button>
      ) : null}
    </section>
  )
}

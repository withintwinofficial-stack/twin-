"use client"

import { useState, type FormEvent } from "react"
import { Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { addDays, diffDays, getPhase, parseISODate, toISODate, type Effort, type Task, type TaskScope } from "@/lib/twin"
import { Stardust } from "./stardust"

interface Props {
  tasks: Task[]
  today: Date
  cycleDay: number
  onToggle: (id: string, done: boolean) => void
  onAdd: (title: string, dueDate: string, effort: Effort, scope: TaskScope) => void
  onRemove: (id: string) => void
  sparkle?: { id: number; taskId: string } | null
}

function dueText(n: number) {
  if (n < 0) return `${Math.abs(n)}d overdue`
  if (n === 0) return "Today"
  if (n === 1) return "Tomorrow"
  return `In ${n} days`
}

const SCOPES: { id: TaskScope; label: string; hint: string }[] = [
  { id: "daily", label: "Today", hint: "Small things for today. They reset tonight." },
  { id: "monthly", label: "This month", hint: "Deadlines Twin times around your cycle." },
]

export function TaskList({ tasks, today, cycleDay, onToggle, onAdd, onRemove, sparkle }: Props) {
  const [scope, setScope] = useState<TaskScope>("daily")
  const [title, setTitle] = useState("")
  const [due, setDue] = useState(() => toISODate(addDays(today, 7)))
  const [effort, setEffort] = useState<Effort>("deep")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const scoped = tasks.filter((t) => t.scope === scope)
  const sorted = [...scoped].sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate))
  const daily = scope === "daily"
  const current = SCOPES.find((s) => s.id === scope)!

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const clean = title.trim()
    if (!clean) return
    if (daily) onAdd(clean.slice(0, 80), toISODate(today), "light", "daily")
    else if (due) onAdd(clean.slice(0, 80), due, effort, "monthly")
    setTitle("")
  }

  return (
    <section aria-labelledby="tasks-heading" className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="tasks-heading" className="font-serif text-2xl">
          To-dos
        </h2>
        <div role="tablist" aria-label="Task list" className="flex rounded-full border border-border p-0.5">
          {SCOPES.map((s) => {
            const open = tasks.filter((t) => t.scope === s.id && !t.done).length
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={scope === s.id}
                aria-controls="task-panel"
                onClick={() => setScope(s.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  scope === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
                <span className={cn("tabular-nums", scope === s.id ? "text-primary-foreground/70" : "text-muted-foreground/70")}>{open}</span>
              </button>
            )
          })}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{current.hint}</p>

      <div id="task-panel" role="tabpanel" aria-label={current.label} className="flex flex-1 flex-col">
      {sorted.length === 0 ? (
        <p className="mt-6 py-6 text-center font-serif text-lg italic text-muted-foreground">
          {daily ? "Nothing yet. Add one small win." : "No deadlines. Enjoy the space."}
        </p>
      ) : null}
      <ul className="mt-3 flex flex-col divide-y divide-border">
        {sorted.map((task) => {
          const dueIn = diffDays(today, parseISODate(task.dueDate))
          const phaseAtDue = getPhase(cycleDay + Math.max(0, dueIn))
          return (
            <li key={task.id} className="group flex items-center gap-3 py-3">
              <span className="relative shrink-0">
                {sparkle?.taskId === task.id ? <Stardust key={sparkle.id} /> : null}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={task.done}
                  aria-label={`Mark ${task.title} as ${task.done ? "not done" : "done"}`}
                  onClick={() => onToggle(task.id, !task.done)}
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    task.done ? "border-phase-ovulatory bg-phase-ovulatory text-primary-foreground" : "border-foreground/40 hover:border-foreground",
                  )}
                >
                  {task.done ? <Check className="size-3" aria-hidden /> : null}
                </button>
              </span>
              <button
                type="button"
                aria-expanded={selectedId === task.id}
                aria-label={`${task.title}. Tap to show delete`}
                onClick={() => setSelectedId((cur) => (cur === task.id ? null : task.id))}
                className="min-w-0 flex-1 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className={cn("block truncate text-sm", task.done && "text-muted-foreground line-through")}>{task.title}</span>
                {daily ? null : (
                <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{dueText(dueIn)}</span>
                  <span aria-hidden>·</span>
                  <span>{task.effort === "deep" ? "Deep focus" : "Light lift"}</span>
                  {!task.done ? (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: phaseAtDue.color }} />
                        {phaseAtDue.name}
                      </span>
                    </>
                  ) : null}
                </span>
                )}
              </button>
              {!daily && task.plannedToday && !task.done ? (
                <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-accent-foreground">
                  Today
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  onRemove(task.id)
                  setSelectedId(null)
                }}
                aria-label={`Delete ${task.title}`}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selectedId === task.id
                    ? "scale-100 bg-period text-period-foreground opacity-100"
                    : "pointer-events-none scale-75 text-period opacity-0 md:group-hover:pointer-events-auto md:group-hover:scale-100 md:group-hover:opacity-100",
                )}
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>

      </div>

      <form onSubmit={submit} className="mt-auto flex flex-col gap-3 border-t border-border pt-5">
        <label htmlFor="task-title" className="sr-only">
          {daily ? "New task for today" : "New monthly task"}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={daily ? "Add something for today" : "Add a deadline and Twin will time it"}
            maxLength={80}
            className="min-w-0 flex-1 border-b border-border bg-transparent pb-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
          {daily ? (
            <button
              type="submit"
              aria-label="Add task"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              disabled={!title.trim()}
            >
              <Plus className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
        {daily ? null : (
        <div className="flex items-center gap-2">
          <label htmlFor="task-due" className="sr-only">
            Due date
          </label>
          <input
            id="task-due"
            type="date"
            value={due}
            min={toISODate(today)}
            onChange={(e) => setDue(e.target.value)}
            className="min-w-0 flex-1 rounded-full border border-border bg-transparent px-3 py-1.5 text-xs focus:border-foreground focus:outline-none"
          />
          <div role="radiogroup" aria-label="Effort" className="flex rounded-full border border-border p-0.5">
            {(["light", "deep"] as const).map((e) => (
              <button
                key={e}
                type="button"
                role="radio"
                aria-checked={effort === e}
                onClick={() => setEffort(e)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs capitalize transition-colors",
                  effort === e ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {e}
              </button>
            ))}
          </div>
          <button
            type="submit"
            aria-label="Add task"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            disabled={!title.trim()}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
        )}
      </form>
    </section>
  )
}

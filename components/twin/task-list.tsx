"use client"

import { useState, type FormEvent } from "react"
import { Check, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { addDays, diffDays, getPhase, parseISODate, toISODate, type Effort, type Task } from "@/lib/twin"

interface Props {
  tasks: Task[]
  today: Date
  cycleDay: number
  onToggle: (id: string, done: boolean) => void
  onAdd: (title: string, dueDate: string, effort: Effort) => void
  onRemove: (id: string) => void
}

function dueText(n: number) {
  if (n < 0) return `${Math.abs(n)}d overdue`
  if (n === 0) return "Today"
  if (n === 1) return "Tomorrow"
  return `In ${n} days`
}

export function TaskList({ tasks, today, cycleDay, onToggle, onAdd, onRemove }: Props) {
  const [title, setTitle] = useState("")
  const [due, setDue] = useState(() => toISODate(addDays(today, 7)))
  const [effort, setEffort] = useState<Effort>("deep")

  const sorted = [...tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.dueDate.localeCompare(b.dueDate))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const clean = title.trim()
    if (!clean || !due) return
    onAdd(clean.slice(0, 80), due, effort)
    setTitle("")
  }

  return (
    <section aria-labelledby="tasks-heading" className="flex flex-col rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between">
        <h2 id="tasks-heading" className="font-serif text-2xl">
          Tasks
        </h2>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {tasks.filter((t) => !t.done).length} open
        </p>
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-border">
        {sorted.map((task) => {
          const dueIn = diffDays(today, parseISODate(task.dueDate))
          const phaseAtDue = getPhase(cycleDay + Math.max(0, dueIn))
          return (
            <li key={task.id} className="group flex items-center gap-3 py-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={task.done}
                aria-label={`Mark ${task.title} as ${task.done ? "not done" : "done"}`}
                onClick={() => onToggle(task.id, !task.done)}
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  task.done ? "border-foreground bg-foreground text-background" : "border-foreground/40 hover:border-foreground",
                )}
              >
                {task.done ? <Check className="size-3" aria-hidden /> : null}
              </button>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-sm", task.done && "text-muted-foreground line-through")}>{task.title}</p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
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
                </p>
              </div>
              {task.plannedToday && !task.done ? (
                <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-accent-foreground">
                  Today
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => onRemove(task.id)}
                aria-label={`Delete ${task.title}`}
                className="shrink-0 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>

      <form onSubmit={submit} className="mt-auto flex flex-col gap-3 border-t border-border pt-5">
        <label htmlFor="task-title" className="sr-only">
          New task
        </label>
        <input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task — Twin will time it for you"
          maxLength={80}
          className="w-full border-b border-border bg-transparent pb-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
        />
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
      </form>
    </section>
  )
}

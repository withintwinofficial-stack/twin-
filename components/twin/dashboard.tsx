"use client"

import { useMemo, useRef, useState } from "react"
import {
  createSeedTasks,
  DEFAULT_AVATAR,
  generateBioReminders,
  getPhase,
  parseISODate,
  type AvatarConfig,
  type Effort,
  type Task,
} from "@/lib/twin"
import { DashboardHeader } from "./dashboard-header"
import { QuoteCard } from "./quote-card"
import { TwinStage, type Celebration } from "./twin-stage"
import { BioReminderCard } from "./bio-reminder-card"
import { TaskList } from "./task-list"
import { PhaseOverview } from "./phase-overview"
import { CycleCalendar } from "./cycle-calendar"

export function Dashboard({ todayISO }: { todayISO: string }) {
  const today = useMemo(() => parseISODate(todayISO), [todayISO])
  const [tasks, setTasks] = useState<Task[]>(() => createSeedTasks(today))
  const [cycleDay, setCycleDay] = useState(12)
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR)

  const phase = getPhase(cycleDay)
  const reminders = useMemo(() => generateBioReminders(tasks, cycleDay, today), [tasks, cycleDay, today])

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const addTask = (title: string, dueDate: string, effort: Effort) =>
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, dueDate, effort, done: false, plannedToday: false },
    ])

  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleTask = (id: string, done: boolean) => {
    updateTask(id, { done })
    if (!done) return
    const task = tasks.find((t) => t.id === id)
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current)
    setCelebration({ id: Date.now(), title: task?.title ?? "Task" })
    celebrationTimer.current = setTimeout(() => setCelebration(null), 2200)
  }

  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id))

  const doneCount = tasks.filter((t) => t.done).length

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-6 md:px-10 md:py-10">
        <DashboardHeader today={today} cycleDay={cycleDay} phase={phase} />

        <QuoteCard today={today} />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section aria-label="Your Twin" className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-8 lg:col-span-4 lg:self-start">
            <TwinStage
              avatar={avatar}
              phase={phase}
              doneCount={doneCount}
              totalCount={tasks.length}
              cycleDay={cycleDay}
              celebration={celebration}
              onAvatarChange={setAvatar}
            />
          </section>

          <section aria-label="Planner" className="flex min-w-0 flex-col gap-6 lg:col-span-8">
            <BioReminderCard
              reminders={reminders}
              phase={phase}
              onPlanToday={(id) => updateTask(id, { plannedToday: true })}
              plannedIds={tasks.filter((t) => t.plannedToday).map((t) => t.id)}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <TaskList
                tasks={tasks}
                today={today}
                cycleDay={cycleDay}
                onToggle={toggleTask}
                onAdd={addTask}
                onRemove={removeTask}
              />
              <div className="flex flex-col gap-6">
                <PhaseOverview cycleDay={cycleDay} phase={phase} />
                <CycleCalendar today={today} cycleDay={cycleDay} tasks={tasks} onCycleDayChange={setCycleDay} />
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>Twin is a planning companion, not medical advice. Cycle predictions are estimates.</p>
          <p className="font-serif text-sm italic">Made for brains that bloom in seasons.</p>
        </footer>
      </div>
    </div>
  )
}

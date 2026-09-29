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
import { FoodsCard } from "./foods-card"
import { DinnerCard } from "./dinner-card"
import { TwinWhispers } from "./twin-whispers"
import { MusicCard } from "./music-card"
import { AlignmentCard } from "./alignment-card"
import { MorningView } from "./morning-view"
import { EveningRelease } from "./evening-release"

export type TimeMode = "morning" | "day" | "evening"

export function Dashboard({ todayISO, timeMode, onTimeModeChange }: { todayISO: string; timeMode: TimeMode; onTimeModeChange: (m: TimeMode) => void }) {
  const today = useMemo(() => parseISODate(todayISO), [todayISO])
  const [tasks, setTasks] = useState<Task[]>(() => createSeedTasks(today))
  const [cycleDay, setCycleDay] = useState(12)
  const [avatar, setAvatar] = useState<AvatarConfig>(DEFAULT_AVATAR)
  const [releasedIds, setReleasedIds] = useState<string[]>([])

  const phase = getPhase(cycleDay)
  const reminders = useMemo(() => generateBioReminders(tasks, cycleDay, today), [tasks, cycleDay, today])

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const addTask = (title: string, dueDate: string, effort: Effort) =>
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title, dueDate, effort, done: false, plannedToday: false }])

  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleTask = (id: string, done: boolean) => {
    updateTask(id, { done })
    if (!done) return
    const task = tasks.find((t) => t.id === id)
    if (celebrationTimer.current) clearTimeout(celebrationTimer.current)
    setCelebration({ id: Date.now(), taskId: id, title: task?.title ?? "Task" })
    celebrationTimer.current = setTimeout(() => setCelebration(null), 2200)
  }

  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id))

  const releaseToTomorrow = (ids: string[]) => {
    setTasks((prev) => prev.map((t) => (ids.includes(t.id) ? { ...t, plannedToday: false } : t)))
    setReleasedIds((prev) => [...prev, ...ids])
  }

  const changeMode = (mode: TimeMode) => {
    if (mode !== "evening") setReleasedIds([])
    onTimeModeChange(mode)
  }

  const doneCount = tasks.filter((t) => t.done).length

  if (timeMode === "morning") {
    return <MorningView avatar={avatar} phase={phase} onWake={() => changeMode("day")} />
  }

  const evening = timeMode === "evening"

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-6 md:px-10 md:py-10">
        <DashboardHeader today={today} cycleDay={cycleDay} phase={phase} evening={evening} />

        {!evening ? <QuoteCard today={today} /> : null}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section aria-label="Your Twin" className="flex min-w-0 flex-col gap-6 lg:col-span-4">
            <TwinStage
              avatar={avatar}
              phase={phase}
              doneCount={doneCount}
              totalCount={tasks.length}
              cycleDay={cycleDay}
              celebration={celebration}
              evening={evening}
              onAvatarChange={setAvatar}
            />
            <TwinWhispers phase={phase} cycleDay={cycleDay} doneCount={doneCount} evening={evening} />
            {!evening ? (
              <>
                <FoodsCard cycleDay={cycleDay} phase={phase} />
                <DinnerCard cycleDay={cycleDay} />
              </>
            ) : null}
          </section>

          <section aria-label="Planner" className="flex min-w-0 flex-col gap-6 lg:col-span-8">
            {evening ? (
              <>
                <EveningRelease tasks={tasks.filter((t) => !releasedIds.includes(t.id))} onRelease={releaseToTomorrow} />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <DinnerCard cycleDay={cycleDay} />
                  <MusicCard phase={phase} />
                </div>
              </>
            ) : (
              <>
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
                    sparkle={celebration}
                  />
                  <div className="flex flex-col gap-6">
                    <PhaseOverview cycleDay={cycleDay} phase={phase} />
                    <CycleCalendar today={today} cycleDay={cycleDay} tasks={tasks} onCycleDayChange={setCycleDay} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <AlignmentCard today={today} cycleDay={cycleDay} phase={phase} />
                  <MusicCard phase={phase} />
                </div>
              </>
            )}
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

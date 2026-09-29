"use client"

import { useMemo, useRef, useState } from "react"
import {
  actualCycleDay,
  addDays,
  createSeedTasks,
  generateBioReminders,
  getPhase,
  parseISODate,
  toISODate,
  toModelDay,
  type AvatarConfig,
  type CycleProfile,
  type Effort,
  type Task,
  type TaskScope,
} from "@/lib/twin"
import { parseTaxNote, type AccessoryId, type PillarId, type TaxItem } from "@/lib/pillars"
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
import { SymptomPills, type Symptom } from "./symptom-pills"
import { PremiumTeaser } from "./premium-teaser"
import { PillarActions } from "./pillar-actions"
import { DopamineVault } from "./dopamine-vault"
import { TaxShelf } from "./tax-shelf"
import { PremiumDrawer } from "./premium-drawer"
import { BrainFogReset } from "./brain-fog-reset"
import { HyperfocusMode } from "./hyperfocus-mode"

export type TimeMode = "morning" | "day" | "evening"
export type Plan = "free" | "premium"

const SEED_TAX_NOTES = ["gym trial ends in 7 days", "bought avocados today"]
const STARTING_TOKENS = 4

interface DashboardProps {
  todayISO: string
  timeMode: TimeMode
  onTimeModeChange: (m: TimeMode) => void
  profile: CycleProfile
  onProfileChange: (p: CycleProfile) => void
  avatar: AvatarConfig
  onAvatarChange: (a: AvatarConfig) => void
  plan: Plan
  onUpgrade: () => void
  collection: AccessoryId[]
  onCollectionChange: (c: AccessoryId[]) => void
}

export function Dashboard({
  todayISO,
  timeMode,
  onTimeModeChange,
  profile,
  onProfileChange,
  avatar,
  onAvatarChange: setAvatar,
  plan,
  onUpgrade,
  collection,
  onCollectionChange,
}: DashboardProps) {
  const today = useMemo(() => parseISODate(todayISO), [todayISO])
  const premium = plan === "premium"
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const toggleSymptom = (s: Symptom) => setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  const [tasks, setTasks] = useState<Task[]>(() => createSeedTasks(today))
  const actualDay = actualCycleDay(profile, today)
  const cycleDay = toModelDay(actualDay, profile.cycleLength)
  const setActualDay = (day: number) => onProfileChange({ ...profile, lastPeriodStart: toISODate(addDays(today, -(day - 1))) })
  const [releasedIds, setReleasedIds] = useState<string[]>([])

  const [tokens, setTokens] = useState(STARTING_TOKENS)
  const [lockedFeature, setLockedFeature] = useState<PillarId | null>(null)
  const [fogOpen, setFogOpen] = useState(false)
  const [fogSession, setFogSession] = useState(0)
  const [hyperfocus, setHyperfocus] = useState(false)
  const [taxItems, setTaxItems] = useState<TaxItem[]>(() => SEED_TAX_NOTES.map((note) => ({ id: note, ...parseTaxNote(note, today) })))

  const phase = getPhase(cycleDay)
  const reminders = useMemo(() => generateBioReminders(tasks, cycleDay, today), [tasks, cycleDay, today])

  const updateTask = (id: string, patch: Partial<Task>) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const addTask = (title: string, dueDate: string, effort: Effort, scope: TaskScope) =>
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), title, dueDate, effort, scope, done: false, plannedToday: scope === "daily" }])

  const [celebration, setCelebration] = useState<Celebration | null>(null)
  const celebrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleTask = (id: string, done: boolean) => {
    updateTask(id, { done })
    if (!done) return
    setTokens((t) => t + 1)
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

  const requirePremium = (feature: PillarId, run: () => void) => (premium ? run() : setLockedFeature(feature))

  const openBrainFog = () =>
    requirePremium("brainFog", () => {
      setFogSession((s) => s + 1)
      setFogOpen(true)
    })

  const nextTask = (tasks.find((t) => !t.done && t.plannedToday) ?? tasks.find((t) => !t.done))?.title

  const doneCount = tasks.filter((t) => t.done).length

  const dinner = premium ? (
    <DinnerCard cycleDay={cycleDay} />
  ) : (
    <PremiumTeaser title="15-minute dinner" description="Let us curate a cycle-matched dinner you can cook in 15 minutes, every night." onUpgrade={onUpgrade} />
  )
  const music = premium ? (
    <MusicCard phase={phase} />
  ) : (
    <PremiumTeaser title="Focus audio" description="Built-in Spotify focus sessions, tuned to our energy for each phase." onUpgrade={onUpgrade} />
  )

  if (timeMode === "morning") {
    return <MorningView avatar={avatar} phase={phase} onWake={() => changeMode("day")} />
  }

  if (hyperfocus && premium) {
    return <HyperfocusMode initialFocus={nextTask ?? ""} onExit={() => setHyperfocus(false)} />
  }

  const evening = timeMode === "evening"

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-6 md:px-10 md:py-10">
        <DashboardHeader today={today} cycleDay={actualDay} energyDay={cycleDay} phase={phase} evening={evening} />

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
              premium={premium}
              onUpgrade={onUpgrade}
              tokens={tokens}
            />
            {!evening ? (
              <>
                <PillarActions premium={premium} onBrainFog={openBrainFog} onHyperfocus={() => requirePremium("hyperfocus", () => setHyperfocus(true))} />
                <SymptomPills logged={symptoms} onToggle={toggleSymptom} />
              </>
            ) : null}
            <TwinWhispers doneCount={doneCount} evening={evening} loggedSymptoms={symptoms} />
            {!evening ? (
              <>
                <DopamineVault
                  tokens={tokens}
                  owned={collection}
                  equipped={avatar.accessory ?? null}
                  premium={premium}
                  onLocked={() => setLockedFeature("vault")}
                  onSpend={(n) => setTokens((t) => t - n)}
                  onEarn={(n) => setTokens((t) => t + n)}
                  onCollect={(id) => onCollectionChange(collection.includes(id) ? collection : [...collection, id])}
                  onEquip={(id) => setAvatar({ ...avatar, accessory: id })}
                />
                <TaxShelf
                  today={today}
                  items={taxItems}
                  premium={premium}
                  onAdd={(note) => setTaxItems((prev) => [{ id: crypto.randomUUID(), ...parseTaxNote(note, today) }, ...prev])}
                  onRemove={(id) => setTaxItems((prev) => prev.filter((t) => t.id !== id))}
                  onLocked={() => setLockedFeature("tax")}
                />
              </>
            ) : null}
          </section>

          <section aria-label="Planner" className="flex min-w-0 flex-col gap-6 lg:col-span-8">
            {evening ? (
              <>
                <EveningRelease tasks={tasks.filter((t) => !releasedIds.includes(t.id))} onRelease={releaseToTomorrow} />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {dinner}
                  {music}
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
                    <CycleCalendar today={today} profile={profile} tasks={tasks} onCycleDayChange={setActualDay} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <AlignmentCard today={today} cycleDay={cycleDay} phase={phase} />
                  {music}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FoodsCard cycleDay={cycleDay} phase={phase} />
                  {dinner}
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

      <PremiumDrawer
        feature={lockedFeature}
        onClose={() => setLockedFeature(null)}
        onUpgrade={() => {
          setLockedFeature(null)
          onUpgrade()
        }}
      />
      <BrainFogReset key={fogSession} open={fogOpen} onClose={() => setFogOpen(false)} nextTask={nextTask} />
    </div>
  )
}

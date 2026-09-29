"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { clearPersistentState, usePersistentState } from "@/hooks/use-persistent-state"
import { createDefaultProfile, DEFAULT_AVATAR, parseISODate, type AccessoryId, type AvatarConfig, type CycleProfile } from "@/lib/twin"
import { Dashboard, type Plan, type TimeMode } from "./dashboard"
import { LoginScreen } from "./login-screen"
import { TrialScreen } from "./trial-screen"
import { AlignTwinDialog } from "./align-twin-dialog"

type View = "login" | "trial" | "sandbox"
type Theme = "chic" | "cosmic" | "cyber"

const VIEWS: { id: View; label: string }[] = [
  { id: "login", label: "Login" },
  { id: "trial", label: "Plans" },
  { id: "sandbox", label: "Sandbox" },
]

const TIME_MODES: { id: TimeMode; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "day", label: "Day" },
  { id: "evening", label: "Evening" },
]

const PLANS: { id: Plan; label: string }[] = [
  { id: "free", label: "Free version" },
  { id: "premium", label: "Premium" },
]

const THEMES: { id: Theme; label: string }[] = [
  { id: "chic", label: "Minimalist Chic" },
  { id: "cosmic", label: "Cosmic Maximalist" },
  { id: "cyber", label: "Cyber Dopamine" },
]

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full border border-bar-foreground/25 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bar-foreground/60",
            value === o.id ? "bg-bar-foreground text-bar" : "text-bar-foreground/70 hover:text-bar-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function BarGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-[0.22em] text-bar-foreground/60">{label}</span>
      {children}
    </div>
  )
}

export function AppShell({ todayISO }: { todayISO: string }) {
  const today = useMemo(() => parseISODate(todayISO), [todayISO])
  const [view, setView] = usePersistentState<View>("view", "sandbox")
  const [plan, setPlan] = usePersistentState<Plan>("plan", "premium")
  const [theme, setTheme] = usePersistentState<Theme>("theme", "chic")
  const [timeMode, setTimeMode] = useState<TimeMode>("day")
  const [profile, setProfile] = usePersistentState<CycleProfile>("profile", () => createDefaultProfile(today))
  const [avatar, setAvatar] = usePersistentState<AvatarConfig>("avatar", DEFAULT_AVATAR)
  const [collection, setCollection] = usePersistentState<AccessoryId[]>("collection", [])
  const [aligning, setAligning] = useState(false)
  const [alignKey, setAlignKey] = useState(0)

  // Applied to <html> so portalled dialogs, drawers and popovers inherit the theme too.
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme
    root.classList.toggle("dark", theme === "cyber")
  }, [theme])

  const resetSandbox = () => {
    if (!window.confirm("Clear all saved Twin progress on this browser and start fresh?")) return
    clearPersistentState()
    window.location.reload()
  }

  const startAlign = () => {
    setAlignKey((k) => k + 1)
    setAligning(true)
  }

  const finishAlign = (p: CycleProfile, a: AvatarConfig) => {
    setProfile(p)
    setAvatar(a)
    setAligning(false)
    setPlan("premium")
    setTimeMode("day")
    setView("sandbox")
  }

  const enterFree = () => {
    setPlan("free")
    setTimeMode("day")
    setView("sandbox")
  }

  return (
    <div className="min-h-dvh">
      <div data-preview-bar className="relative z-40 bg-bar text-bar-foreground md:sticky md:top-0">
        <div className="mx-auto flex min-h-14 max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2 md:px-10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <BarGroup label="Preview">
              <Segmented label="Screen" options={VIEWS} value={view} onChange={setView} />
            </BarGroup>
            <BarGroup label="Aesthetic">
              <Segmented label="Aesthetic theme" options={THEMES} value={theme} onChange={setTheme} />
            </BarGroup>
            <button
              type="button"
              onClick={resetSandbox}
              className="rounded-full border border-bar-foreground/25 px-3 py-1 text-xs text-bar-foreground/70 transition-colors hover:text-bar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bar-foreground/60"
            >
              Reset saved data
            </button>
          </div>
          {view === "sandbox" ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <BarGroup label="Plan">
                <Segmented label="Plan" options={PLANS} value={plan} onChange={setPlan} />
              </BarGroup>
              <BarGroup label="Simulate time">
                <Segmented label="Simulate time" options={TIME_MODES} value={timeMode} onChange={setTimeMode} />
              </BarGroup>
            </div>
          ) : null}
        </div>
      </div>

      {view === "login" ? <LoginScreen onTrial={() => setView("trial")} onEnterFree={enterFree} /> : null}
      {view === "trial" ? <TrialScreen todayISO={todayISO} onStart={startAlign} onBack={() => setView("login")} /> : null}
      {view === "sandbox" ? (
        <Dashboard
          todayISO={todayISO}
          timeMode={timeMode}
          onTimeModeChange={setTimeMode}
          profile={profile}
          onProfileChange={setProfile}
          avatar={avatar}
          onAvatarChange={setAvatar}
          plan={plan}
          onUpgrade={() => setView("trial")}
          collection={collection}
          onCollectionChange={setCollection}
        />
      ) : null}

      <AlignTwinDialog key={alignKey} open={aligning} today={today} initialProfile={profile} initialAvatar={avatar} onComplete={finishAlign} />
    </div>
  )
}

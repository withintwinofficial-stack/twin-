"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Dashboard, type TimeMode } from "./dashboard"
import { LoginScreen } from "./login-screen"
import { TrialScreen } from "./trial-screen"

type View = "login" | "trial" | "sandbox"

const VIEWS: { id: View; label: string }[] = [
  { id: "login", label: "Login" },
  { id: "trial", label: "Trial" },
  { id: "sandbox", label: "Sandbox" },
]

const TIME_MODES: { id: TimeMode; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "day", label: "Day" },
  { id: "evening", label: "Evening" },
]

function Segmented<T extends string>({ label, options, value, onChange }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full border border-primary-foreground/20 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60",
            value === o.id ? "bg-primary-foreground text-primary" : "text-primary-foreground/70 hover:text-primary-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function AppShell({ todayISO }: { todayISO: string }) {
  const [view, setView] = useState<View>("sandbox")
  const [timeMode, setTimeMode] = useState<TimeMode>("day")

  return (
    <div className="min-h-dvh bg-background">
      <div className="sticky top-0 z-40 bg-primary text-primary-foreground">
        <div className="mx-auto flex min-h-14 max-w-[1400px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2 md:px-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.22em] text-primary-foreground/60">Preview</span>
            <Segmented label="Screen" options={VIEWS} value={view} onChange={setView} />
          </div>
          {view === "sandbox" ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.22em] text-primary-foreground/60">Simulate time</span>
              <Segmented label="Simulate time" options={TIME_MODES} value={timeMode} onChange={setTimeMode} />
            </div>
          ) : null}
        </div>
      </div>

      {view === "login" ? <LoginScreen onTrial={() => setView("trial")} onEnter={() => setView("sandbox")} /> : null}
      {view === "trial" ? <TrialScreen todayISO={todayISO} onStart={() => setView("sandbox")} onBack={() => setView("login")} /> : null}
      {view === "sandbox" ? <Dashboard todayISO={todayISO} timeMode={timeMode} onTimeModeChange={setTimeMode} /> : null}
    </div>
  )
}

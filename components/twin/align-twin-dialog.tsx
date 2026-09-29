"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  actualCycleDay,
  addDays,
  getOutfit,
  getPhase,
  parseISODate,
  toISODate,
  toModelDay,
  WARDROBE_STYLES,
  type AvatarConfig,
  type CycleProfile,
} from "@/lib/twin"
import { TwinAvatar } from "./twin-avatar"
import { AvatarCustomizer } from "./avatar-customizer"

interface Props {
  open: boolean
  today: Date
  initialProfile: CycleProfile
  initialAvatar: AvatarConfig
  onComplete: (profile: CycleProfile, avatar: AvatarConfig) => void
}

function Stepper({ id, label, hint, value, min, max, unit, onChange }: { id: string; label: string; hint: string; value: number; min: number; max: number; unit: string; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
      <div className="min-w-0">
        <p id={id} className="text-sm font-medium">
          {label}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      </div>
      <div role="group" aria-labelledby={id} className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex size-8 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Minus className="size-3.5" aria-hidden />
        </button>
        <p className="w-16 text-center font-serif text-xl tabular-nums" aria-live="polite">
          {value} <span className="text-xs text-muted-foreground">{unit}</span>
        </p>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex size-8 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  )
}

export function AlignTwinDialog({ open, today, initialProfile, initialAvatar, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [profile, setProfile] = useState(initialProfile)
  const [avatar, setAvatar] = useState(initialAvatar)

  const day = actualCycleDay(profile, today)
  const phase = getPhase(toModelDay(day, profile.cycleLength))
  const nextPeriod = addDays(parseISODate(profile.lastPeriodStart), Math.ceil((day) / profile.cycleLength) * profile.cycleLength)
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric" })
  const previewPhase = phase.energy === "high" ? phase : getPhase(10)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onComplete(profile, avatar)}>
      <DialogContent showCloseButton={false} className="max-h-[92dvh] gap-0 overflow-y-auto rounded-3xl border border-border bg-card p-0 sm:max-w-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4 md:px-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Step {step} of 2</p>
          <div className="flex gap-1.5" aria-hidden>
            {[1, 2].map((s) => (
              <span key={s} className={cn("h-1 w-8 rounded-full transition-colors", s <= step ? "bg-foreground" : "bg-border")} />
            ))}
          </div>
        </div>

        {step === 1 ? (
          <div className="flex flex-col gap-6 p-6 md:p-8">
            <div>
              <DialogTitle className="font-serif text-3xl font-normal leading-tight md:text-4xl">Let&apos;s align your Twin</DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Tell us when your last period started. Twin tracks the rest automatically, from energy dips to your fertile window.
              </DialogDescription>
            </div>

            <div className="flex flex-col gap-2 border-b border-border pb-4">
              <label htmlFor="last-period" className="text-sm font-medium">
                First day of your last period
              </label>
              <input
                id="last-period"
                type="date"
                value={profile.lastPeriodStart}
                max={toISODate(today)}
                min={toISODate(addDays(today, -90))}
                onChange={(e) => e.target.value && setProfile({ ...profile, lastPeriodStart: e.target.value })}
                className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm focus:border-foreground focus:outline-none"
              />
            </div>

            <Stepper
              id="cycle-length-label"
              label="Cycle length"
              hint="Day 1 of one period to day 1 of the next. Not sure? 28 is a gentle default."
              value={profile.cycleLength}
              min={21}
              max={40}
              unit="days"
              onChange={(n) => setProfile({ ...profile, cycleLength: n })}
            />
            <Stepper
              id="period-length-label"
              label="Period length"
              hint="How many days you usually bleed."
              value={profile.periodLength}
              min={2}
              max={8}
              unit="days"
              onChange={(n) => setProfile({ ...profile, periodLength: n })}
            />

            <div className="flex items-center gap-4 rounded-2xl bg-secondary px-5 py-4">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: phase.color }} />
              <p className="text-sm leading-relaxed" aria-live="polite">
                Today is <span className="font-medium">day {day}</span>, your {phase.name.toLowerCase()} phase. Next period expected around{" "}
                <span className="font-medium">{fmt(nextPeriod)}</span>.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="relative flex items-end justify-center overflow-hidden border-b border-border bg-background/60 md:col-span-2 md:border-r md:border-b-0">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: `radial-gradient(55% 45% at 50% 50%, color-mix(in oklab, ${previewPhase.color} 24%, transparent), transparent 70%)` }}
              />
              <div className="relative h-[280px] w-[220px] md:h-[380px] motion-safe:animate-twin-float">
                <TwinAvatar config={avatar} outfit={getOutfit(previewPhase, avatar.style)} pose="standing" expression="focused" />
              </div>
            </div>

            <div className="flex flex-col gap-6 p-6 md:col-span-3 md:p-8">
              <div>
                <DialogTitle className="font-serif text-3xl font-normal leading-tight">Make your Twin yours</DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Pick a look now. Twin changes into loungewear on its own when your energy dips.
                </DialogDescription>
              </div>

              <AvatarCustomizer value={avatar} onChange={setAvatar} showHeading={false} />

              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2.5 text-xs text-muted-foreground">Signature style</legend>
                <div className="grid grid-cols-2 gap-2">
                  {WARDROBE_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={avatar.style === s.id}
                      onClick={() => setAvatar({ ...avatar, style: s.id })}
                      className={cn(
                        "rounded-full border px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        avatar.style === s.id ? "border-foreground bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => onComplete(profile, avatar)}
                  className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Meet my Twin
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

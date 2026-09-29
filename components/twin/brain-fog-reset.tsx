"use client"

import { useEffect, useState } from "react"
import { Pause, Play, SkipForward, X } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const BREATH = ["Breathe in", "Hold", "Breathe out", "Hold"]

function buildSteps(nextTask?: string) {
  return [
    { duration: 32, title: "Breathe with me", guide: "Four counts in, four to hold, four out, four to hold. Just follow the circle." },
    { duration: 16, title: "Five things we can see", guide: "Name them quietly. The mug. The window. Our own hands." },
    { duration: 16, title: "Four things we can touch", guide: "The chair under us. Fabric at our wrist. Feet on the floor." },
    { duration: 14, title: "Three things we can hear", guide: "Near sounds first, then the far-away ones." },
    { duration: 12, title: "Two things we can smell", guide: "Coffee, soap, fresh air. Anything counts." },
    { duration: 10, title: "One thing we can taste", guide: "Or simply notice our tongue resting softly." },
    { duration: 10, title: "Shoulders down, sip of water", guide: "Unclench the jaw. Drop the shoulders an inch. One slow sip." },
    {
      duration: 10,
      title: "One tiny next step",
      guide: nextTask ? `Just this: ${nextTask}. Nothing else yet.` : "Pick the smallest possible thing. Nothing else yet.",
    },
  ]
}

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

export function BrainFogReset({ open, onClose, nextTask }: { open: boolean; onClose: () => void; nextTask?: string }) {
  const steps = buildSteps(nextTask)
  const total = steps.reduce((sum, s) => sum + s.duration, 0)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const finished = elapsed >= total

  useEffect(() => {
    if (!open || paused || finished) return
    const timer = setInterval(() => setElapsed((e) => Math.min(total, e + 1)), 1000)
    return () => clearInterval(timer)
  }, [open, paused, finished, total])

  let start = 0
  let index = steps.length - 1
  for (let i = 0; i < steps.length; i++) {
    if (elapsed < start + steps[i].duration) {
      index = i
      break
    }
    start += steps[i].duration
  }
  const step = steps[index]
  const stepStart = steps.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
  const breath = BREATH[Math.floor((elapsed % 16) / 4)]

  const skip = () => setElapsed(Math.min(total, stepStart + step.duration))

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent
        showCloseButton={false}
        className="inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-background p-0 ring-0 duration-500 sm:max-w-none data-open:zoom-in-100 data-closed:zoom-out-100"
      >
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Brain Fog Reset</p>
          <DialogClose className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="size-3.5" aria-hidden />
            Leave
          </DialogClose>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="relative flex size-56 items-center justify-center md:size-64">
            <div
              aria-hidden
              className={cn(
                "absolute inset-0 rounded-full border border-border bg-card motion-safe:animate-twin-breath",
                (paused || finished) && "[animation-play-state:paused]",
              )}
            />
            <p className="relative font-serif text-2xl italic" aria-live="polite">
              {finished ? "Welcome back" : index === 0 ? breath : formatClock(stepStart + step.duration - elapsed)}
            </p>
          </div>

          <DialogTitle className="mt-10 font-serif text-3xl leading-tight font-normal text-balance md:text-4xl">
            {finished ? "We're back." : step.title}
          </DialogTitle>
          <DialogDescription className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground text-pretty">
            {finished
              ? nextTask
                ? `The fog lifted a notch. One tiny thing next: ${nextTask}.`
                : "The fog lifted a notch. Let's pick one tiny thing."
              : step.guide}
          </DialogDescription>
        </div>

        <footer className="flex flex-col items-center gap-5 px-6 pb-10">
          <ol className="flex w-full max-w-md gap-1.5" aria-label={`Step ${index + 1} of ${steps.length}`}>
            {steps.map((s, i) => (
              <li
                key={s.title}
                className={cn("h-1 flex-1 rounded-full transition-colors", i < index || finished ? "bg-foreground/70" : i === index ? "bg-foreground/35" : "bg-border")}
              />
            ))}
          </ol>
          {finished ? (
            <DialogClose className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Return to our day
            </DialogClose>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs tabular-nums text-muted-foreground">{formatClock(total - elapsed)} left</span>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={skip}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SkipForward className="size-3.5" aria-hidden />
                Next step
              </button>
            </div>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  )
}

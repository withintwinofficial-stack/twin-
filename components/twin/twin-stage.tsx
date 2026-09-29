"use client"

import { useEffect, useRef, useState } from "react"
import { Lock, Moon, Sparkles, Sunset } from "lucide-react"
import { MiniTwin } from "./mini-twin"
import { energyScore, getOutfit, WARDROBE_STYLES, type AvatarConfig, type Phase } from "@/lib/twin"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TwinAvatar } from "./twin-avatar"
import { AvatarCustomizer } from "./avatar-customizer"
import { CelebrationBurst } from "./celebration-burst"

export interface Celebration {
  id: number
  taskId: string
  title: string
}

const PARTICLES = [
  { left: "14%", top: "22%", size: 6, delay: "0s" },
  { left: "80%", top: "18%", size: 4, delay: "1.6s" },
  { left: "72%", top: "58%", size: 7, delay: "3.1s" },
  { left: "20%", top: "64%", size: 4, delay: "4.4s" },
  { left: "50%", top: "10%", size: 3, delay: "2.2s" },
]

const GOLD_DUST = ["var(--phase-ovulatory)", "#d9bd86", "#f1e3c2", "#a8834a"]

interface TwinStageProps {
  avatar: AvatarConfig
  phase: Phase
  cycleDay: number
  doneCount: number
  totalCount: number
  celebration: Celebration | null
  evening?: boolean
  onAvatarChange: (v: AvatarConfig) => void
  premium?: boolean
  onUpgrade?: () => void
  tokens: number
}

const FREE_STYLE = "chic"

export function TwinStage({ avatar, phase, cycleDay, doneCount, totalCount, celebration, evening = false, onAvatarChange, premium = true, onUpgrade, tokens }: TwinStageProps) {
  const style = premium ? avatar.style : FREE_STYLE
  const outfit = getOutfit(phase, style, evening)
  const resting = outfit.kind === "lounge"
  const energy = energyScore(cycleDay)
  const expression = resting ? "sleepy" : "focused"

  const avatarRef = useRef<HTMLDivElement>(null)
  const [scrolledPast, setScrolledPast] = useState(false)

  useEffect(() => {
    const el = avatarRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0, rootMargin: "-40% 0px 0px 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative">
      <MiniTwin
        visible={scrolledPast}
        avatar={avatar}
        outfit={outfit}
        resting={resting}
        expression={expression}
        phaseColor={phase.color}
        celebration={celebration}
        colors={GOLD_DUST}
        onReturn={() => avatarRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem] transition-colors duration-1000"
        style={{
          background: `radial-gradient(60% 55% at 50% 45%, color-mix(in oklab, ${phase.color} 22%, transparent), transparent 70%)`,
        }}
      />

      <div className="relative flex items-center justify-between gap-3 px-1">
        <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {evening ? <Sunset className="size-3" aria-hidden /> : resting ? <Moon className="size-3" aria-hidden /> : <Sparkles className="size-3" aria-hidden />}
          Your Twin
        </p>
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 py-1 pr-3 pl-1 backdrop-blur-sm">
          <span aria-hidden className="flex size-5 items-center justify-center rounded-full bg-[var(--phase-ovulatory)]">
            <span className="size-3 rounded-full border border-card/70" />
          </span>
          <span key={tokens} className="font-serif text-base leading-none tabular-nums motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-300">
            {tokens}
          </span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Dopamine Tokens</span>
        </p>
      </div>

      <div role="tablist" aria-label="Wardrobe style" className="relative mt-4 grid grid-cols-4 gap-1 rounded-full border border-border bg-card/60 p-1 backdrop-blur-sm">
        {WARDROBE_STYLES.map((s) => {
          const locked = !premium && s.id !== FREE_STYLE
          const selected = style === s.id
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={locked ? `${s.name}, premium collection` : undefined}
              onClick={() => (locked ? onUpgrade?.() : onAvatarChange({ ...avatar, style: s.id }))}
              className={cn(
                "inline-flex items-center justify-center gap-1 truncate rounded-full px-1 py-1.5 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                locked && "text-muted-foreground/60",
              )}
            >
              {locked ? <Lock className="size-2.5 shrink-0" aria-hidden /> : null}
              <span className="truncate">{s.name}</span>
            </button>
          )
        })}
      </div>

      <div ref={avatarRef} className="relative mx-auto mt-2 h-[320px] w-full max-w-[280px] md:h-[350px]">
        {!resting
          ? PARTICLES.map((p) => (
              <span
                key={p.left + p.top}
                aria-hidden
                className="absolute rounded-full motion-safe:animate-twin-drift"
                style={{ left: p.left, top: p.top, width: p.size, height: p.size, backgroundColor: phase.color, animationDelay: p.delay }}
              />
            ))
          : null}

        {celebration ? (
          <>
            <CelebrationBurst key={`burst-${celebration.id}`} colors={GOLD_DUST} />
            <p
              key={`toast-${celebration.id}`}
              className="absolute inset-x-0 top-0 z-20 mx-auto w-fit max-w-[90%] truncate rounded-full border border-border bg-card/90 px-4 py-1.5 text-center text-xs shadow-sm backdrop-blur-sm motion-safe:animate-twin-toast"
            >
              <span className="font-serif italic">Done:</span> {celebration.title}
            </p>
          </>
        ) : null}

        <Popover>
          <PopoverTrigger
            aria-label="Customize your Twin's hair and skin"
            className="group absolute inset-0 cursor-pointer rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div key={outfit.kind + phase.id + String(evening)} className="absolute inset-0 animate-in fade-in zoom-in-95 duration-700">
              <div
                key={celebration?.id ?? "idle"}
                className={cn(
                  "absolute inset-0 transition-transform duration-300 group-hover:scale-[1.02]",
                  celebration && (resting ? "motion-safe:animate-twin-wiggle" : "motion-safe:animate-twin-hop"),
                )}
                style={{ transformOrigin: "50% 90%" }}
              >
                {resting ? (
                  <TwinAvatar config={avatar} outfit={outfit} pose="seated" expression={expression} />
                ) : (
                  <>
                    <div className="absolute inset-x-0 top-0 bottom-6 motion-safe:animate-twin-float">
                      <TwinAvatar config={avatar} outfit={outfit} pose="standing" expression={expression} />
                    </div>
                    <div aria-hidden className="absolute bottom-2 left-1/2 h-3 w-28 -translate-x-1/2 motion-safe:animate-twin-shadow">
                      <div className="h-full w-full rounded-[50%] bg-foreground/15 blur-[3px]" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent side="right" align="center" sideOffset={8} className="w-80 rounded-2xl p-6">
            <AvatarCustomizer value={avatar} onChange={onAvatarChange} />
          </PopoverContent>
        </Popover>
      </div>

      <p className="sr-only" aria-live="polite">
        {celebration ? `Nice work. ${celebration.title} is done.` : ""}
      </p>

      <div className="relative mt-3 text-center">
        <p className="font-serif text-2xl italic text-balance">&ldquo;{outfit.mood}&rdquo;</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Wearing: {outfit.label}
          {resting && !evening ? " (your style returns on high-energy days)" : ""} <span aria-hidden>&middot;</span> Tap your Twin to
          restyle
        </p>
      </div>

      {!evening ? (
        <dl className="relative mt-5 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/70 py-3 text-center backdrop-blur-sm">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Energy</dt>
            <dd className="mt-0.5 font-serif text-xl">{energy}%</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mood</dt>
            <dd className="mt-0.5 font-serif text-xl">{resting ? "Cozy" : "Focused"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Done</dt>
            <dd className="mt-0.5 font-serif text-xl">
              {doneCount}
              <span className="text-sm text-muted-foreground">/{totalCount}</span>
            </dd>
          </div>
        </dl>
      ) : null}
    </div>
  )
}

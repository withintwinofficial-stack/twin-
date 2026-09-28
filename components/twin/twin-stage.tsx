import { Moon, Sparkles } from "lucide-react"
import { energyScore, OUTFITS, type AvatarConfig, type Phase } from "@/lib/twin"
import { TwinAvatar } from "./twin-avatar"

const PARTICLES = [
  { left: "14%", top: "22%", size: 6, delay: "0s" },
  { left: "80%", top: "18%", size: 4, delay: "1.6s" },
  { left: "72%", top: "58%", size: 7, delay: "3.1s" },
  { left: "20%", top: "64%", size: 4, delay: "4.4s" },
  { left: "50%", top: "10%", size: 3, delay: "2.2s" },
]

interface TwinStageProps {
  avatar: AvatarConfig
  phase: Phase
  cycleDay: number
  doneCount: number
  totalCount: number
}

export function TwinStage({ avatar, phase, cycleDay, doneCount, totalCount }: TwinStageProps) {
  const outfit = OUTFITS[phase.id]
  const resting = outfit.kind === "lounge"
  const energy = energyScore(cycleDay)

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0 rounded-[2rem] transition-colors duration-1000"
        style={{
          background: `radial-gradient(60% 55% at 50% 45%, color-mix(in oklab, ${phase.color} 22%, transparent), transparent 70%)`,
        }}
      />

      <div className="relative flex items-center justify-between px-1">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Your Twin</p>
        <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {resting ? <Moon className="size-3" aria-hidden /> : <Sparkles className="size-3" aria-hidden />}
          {resting ? "Resting mode" : "Energized mode"}
        </p>
      </div>

      <div className="relative mx-auto mt-2 h-[340px] w-full max-w-[300px] md:h-[380px]">
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

        <div key={outfit.kind + phase.id} className="absolute inset-0 animate-in fade-in zoom-in-95 duration-700">
          {resting ? (
            <TwinAvatar config={avatar} outfit={outfit} />
          ) : (
            <>
              <div className="absolute inset-x-0 top-0 bottom-6 motion-safe:animate-twin-float">
                <TwinAvatar config={avatar} outfit={outfit} />
              </div>
              <div
                aria-hidden
                className="absolute bottom-2 left-1/2 h-3 w-28 -translate-x-1/2 motion-safe:animate-twin-shadow"
              >
                <div className="h-full w-full rounded-[50%] bg-foreground/15 blur-[3px]" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative mt-4 text-center">
        <p className="font-serif text-2xl italic text-balance">&ldquo;{outfit.mood}&rdquo;</p>
        <p className="mt-2 text-xs text-muted-foreground">Wearing: {outfit.label}</p>
      </div>

      <dl className="relative mt-6 grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/70 py-3 text-center backdrop-blur-sm">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Energy</dt>
          <dd className="mt-0.5 font-serif text-xl">{energy}%</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Mood</dt>
          <dd className="mt-0.5 font-serif text-xl">{resting ? "Cozy" : "Bright"}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Done</dt>
          <dd className="mt-0.5 font-serif text-xl">
            {doneCount}
            <span className="text-sm text-muted-foreground">/{totalCount}</span>
          </dd>
        </div>
      </dl>
    </div>
  )
}

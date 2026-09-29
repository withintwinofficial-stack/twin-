import { Lock, Wind, Zap } from "lucide-react"

function PremiumLock() {
  return (
    <span className="ml-auto flex shrink-0 items-center">
      <Lock className="size-3.5 opacity-60" aria-hidden />
      <span className="sr-only">(Premium)</span>
    </span>
  )
}

export function PillarActions({ premium, onBrainFog, onHyperfocus }: { premium: boolean; onBrainFog: () => void; onHyperfocus: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
      <button
        type="button"
        onClick={onBrainFog}
        className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Wind className="size-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-serif text-lg leading-tight">Brain Fog Reset</span>
          <span className="block text-xs text-muted-foreground">A 2-minute grounding, lists hidden</span>
        </span>
        {!premium ? <PremiumLock /> : null}
      </button>

      <button
        type="button"
        onClick={onHyperfocus}
        className="flex items-center gap-4 rounded-2xl bg-primary px-5 py-4 text-left text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/10">
          <Zap className="size-4" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block font-serif text-lg leading-tight">I&apos;m Hyperfocusing!</span>
          <span className="block text-xs text-primary-foreground/70">Ride the wave, skip the crash</span>
        </span>
        {!premium ? <PremiumLock /> : null}
      </button>
    </div>
  )
}

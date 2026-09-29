import { getOutfit, type AvatarConfig, type Phase } from "@/lib/twin"
import { TwinAvatar } from "./twin-avatar"

export function MorningView({ avatar, phase, onWake }: { avatar: AvatarConfig; phase: Phase; onWake: () => void }) {
  return (
    <main className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center overflow-hidden px-6 py-12 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(50% 45% at 50% 48%, color-mix(in oklab, ${phase.color} 16%, transparent), transparent 70%)` }}
      />
      <p className="relative font-serif text-4xl tracking-tight">
        Twin<span className="text-accent">.</span>
      </p>
      <div className="relative mt-6 h-[260px] w-[240px] animate-in fade-in duration-1000 md:h-[300px] md:w-[280px]">
        <TwinAvatar config={avatar} outfit={getOutfit(phase, avatar.style, true)} pose="asleep" expression="asleep" />
      </div>
      <h1 className="relative mt-4 max-w-md font-serif text-4xl leading-tight text-balance md:text-5xl">
        Good morning. Take a deep breath.
      </h1>
      <p className="relative mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Your Twin is still waking up too. No tasks, no lists, nothing urgent until you say so.
      </p>
      <button
        type="button"
        onClick={onWake}
        className="relative mt-8 rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Tap when you&apos;re ready to start
      </button>
    </main>
  )
}

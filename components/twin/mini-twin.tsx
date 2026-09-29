"use client"

import type { AvatarConfig, Expression, Outfit } from "@/lib/twin"
import { cn } from "@/lib/utils"
import { TwinAvatar } from "./twin-avatar"
import { CelebrationBurst } from "./celebration-burst"
import type { Celebration } from "./twin-stage"

interface Props {
  visible: boolean
  avatar: AvatarConfig
  outfit: Outfit
  resting: boolean
  expression: Expression
  phaseColor: string
  celebration: Celebration | null
  colors: string[]
  onReturn: () => void
}

export function MiniTwin({ visible, avatar, outfit, resting, expression, phaseColor, celebration, colors, onReturn }: Props) {
  return (
    <div
      className={cn(
        "fixed right-3 bottom-4 z-30 transition-all duration-500 ease-out lg:hidden",
        visible ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[120%] opacity-0",
      )}
    >
      {celebration ? (
        <>
          <CelebrationBurst key={`mini-burst-${celebration.id}`} colors={colors} />
          <p
            key={`mini-toast-${celebration.id}`}
            className="absolute top-3 right-full mr-2 max-w-[55vw] truncate rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm motion-safe:animate-twin-toast"
          >
            <span className="font-serif italic">Done:</span> {celebration.title}
          </p>
        </>
      ) : null}
      <button
        type="button"
        onClick={onReturn}
        tabIndex={visible ? 0 : -1}
        aria-hidden={!visible}
        aria-label="Scroll back to your Twin"
        className="relative block h-32 w-24 overflow-hidden rounded-2xl border border-border bg-card/90 shadow-lg backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ backgroundImage: `radial-gradient(70% 60% at 50% 45%, color-mix(in oklab, ${phaseColor} 25%, transparent), transparent 75%)` }}
      >
        <span
          key={celebration?.id ?? "idle"}
          className={cn(
            "absolute inset-1 block",
            celebration && (resting ? "motion-safe:animate-twin-wiggle" : "motion-safe:animate-twin-hop"),
          )}
          style={{ transformOrigin: "50% 90%" }}
        >
          <span className={cn("absolute inset-0 block", !resting && "motion-safe:animate-twin-float")}>
            <TwinAvatar config={avatar} outfit={outfit} pose={resting ? "seated" : "standing"} expression={expression} />
          </span>
        </span>
      </button>
    </div>
  )
}

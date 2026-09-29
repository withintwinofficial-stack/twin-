"use client"

import { Check } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { PillarId } from "@/lib/pillars"

const COPY: Record<PillarId, { title: string; body: string }> = {
  brainFog: {
    title: "Brain Fog Reset",
    body: "When our head feels like wet cotton, one tap hides every list and walks us through a 2-minute grounding reset: breath first, then senses, then one tiny next step.",
  },
  vault: {
    title: "The Dopamine Vault",
    body: "Every task we check off earns a Dopamine Token. Spend 5 to scratch a card and win rare, permanent pieces for our Twin, like sunglasses or a tiny gold crown.",
  },
  tax: {
    title: "ADHD Tax Prevention",
    body: "Tell us what we're going to forget. We read the timeline and set a quiet countdown, so avocados get eaten and free trials get cancelled before they cost us.",
  },
  hyperfocus: {
    title: "Hyperfocus Capitalizer",
    body: "When the wave hits, we clear the dashboard and ride it with you, with soft water and stretch check-ins so we don't crash when it ends.",
  },
}

const INCLUDED = [
  "Brain Fog Reset",
  "Dopamine Vault scratch cards",
  "ADHD Tax Prevention shelf",
  "Hyperfocus mode",
  "15-minute dinner curator",
  "Spotify focus audio",
  "Premium wardrobe collections",
]

export function PremiumDrawer({ feature, onClose, onUpgrade }: { feature: PillarId | null; onClose: () => void; onUpgrade: () => void }) {
  const copy = feature ? COPY[feature] : null
  return (
    <Dialog open={feature !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="top-0 right-0 left-auto flex h-dvh w-full max-w-md translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none bg-card p-8 duration-300 sm:max-w-md md:p-10 data-open:slide-in-from-right data-open:zoom-in-100 data-closed:slide-out-to-right data-closed:zoom-out-100">
        {copy ? (
          <>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">A premium pillar</p>
            <DialogTitle className="mt-4 font-serif text-3xl leading-tight font-normal">{copy.title}</DialogTitle>
            <DialogDescription className="mt-4 text-base leading-relaxed text-pretty">{copy.body}</DialogDescription>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Premium unlocks</p>
              <ul className="mt-4 flex flex-col gap-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground/70">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-10">
              <p className="font-serif text-3xl">
                $4.99<span className="text-base text-muted-foreground"> / month</span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Cancel anytime. Your data and your Twin will always stay safe with us.</p>
              <button
                type="button"
                onClick={onUpgrade}
                className="mt-6 w-full rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Unlock Premium
              </button>
              <DialogClose className="mt-2 w-full rounded-full px-5 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Maybe later
              </DialogClose>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

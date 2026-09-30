"use client"

import { useState } from "react"
import { Crown, Glasses, Lock, Ribbon } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCESSORIES, accessoryName, drawAccessory, DUPLICATE_REFUND, SCRATCH_COST, type AccessoryId } from "@/lib/pillars"
import { AccessoryPreview } from "./twin-avatar"
import { ScratchCard } from "./scratch-card"

interface DopamineVaultProps {
  tokens: number
  owned: AccessoryId[]
  equipped: AccessoryId | null
  premium: boolean
  onLocked: () => void
  onSpend: (n: number) => void
  onEarn: (n: number) => void
  onCollect: (id: AccessoryId) => void
  onEquip: (id: AccessoryId | null) => void
}

interface ActiveCard {
  key: number
  prize: AccessoryId
  duplicate: boolean
  revealed: boolean
}

type Tab = "vault" | "collection"

const UPCOMING_SLOTS = [
  { name: "Glossy Sunglasses", tag: "Eyewear", Icon: Glasses },
  { name: "Y2K Pink Bow", tag: "Hair", Icon: Ribbon },
  { name: "Floating Mini Crown", tag: "Halo", Icon: Crown },
]

export function DopamineVault({ tokens, owned, equipped, premium, onLocked, onSpend, onEarn, onCollect, onEquip }: DopamineVaultProps) {
  const [tab, setTab] = useState<Tab>("vault")
  const [card, setCard] = useState<ActiveCard | null>(null)
  const canAfford = tokens >= SCRATCH_COST
  const scratching = card !== null && !card.revealed

  const unlock = () => {
    if (!premium) return onLocked()
    if (!canAfford || scratching) return
    const { id, duplicate } = drawAccessory(owned)
    onSpend(SCRATCH_COST)
    setCard({ key: Date.now(), prize: id, duplicate, revealed: false })
  }

  const reveal = () => {
    if (!card || card.revealed) return
    setCard({ ...card, revealed: true })
    if (card.duplicate) onEarn(DUPLICATE_REFUND)
    else onCollect(card.prize)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "vault", label: "Vault" },
    { id: "collection", label: `My Collection (${owned.length})` },
  ]

  return (
    <section aria-labelledby="vault-heading" className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="vault-heading" className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Dopamine Vault
        </h2>
        {!premium ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            <Lock className="size-3" aria-hidden />
            Premium
          </span>
        ) : null}
      </div>

      <div role="tablist" aria-label="Vault sections" className="mt-4 flex gap-5 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`vault-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`vault-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px border-b pb-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "vault" ? (
        <div role="tabpanel" id="vault-panel-vault" aria-labelledby="vault-tab-vault" className="mt-5 flex flex-col gap-4">
          <p className="font-serif text-lg leading-snug text-pretty">
            Spend {SCRATCH_COST} Tokens to unlock 1 Scratch Card for permanent rare avatar accessories.
          </p>

          {card ? (
            <>
              <ScratchCard key={card.key} revealed={card.revealed} onReveal={reveal}>
                <div className="flex items-center gap-4 px-5">
                  <div className="size-20 shrink-0">
                    <AccessoryPreview id={card.prize} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {ACCESSORIES.find((a) => a.id === card.prize)?.rarity}
                    </p>
                    <p className="font-serif text-xl leading-tight">{accessoryName(card.prize)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {card.duplicate ? `Already ours. ${DUPLICATE_REFUND} tokens back.` : "Saved to My Collection"}
                    </p>
                  </div>
                </div>
              </ScratchCard>
              <p className="sr-only" aria-live="polite">
                {card.revealed ? `You won ${accessoryName(card.prize)}.` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {!card.revealed ? (
                  <button
                    type="button"
                    onClick={reveal}
                    className="rounded-full border border-border px-4 py-2 text-xs transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Reveal all
                  </button>
                ) : !card.duplicate && equipped !== card.prize ? (
                  <button
                    type="button"
                    onClick={() => onEquip(card.prize)}
                    className="rounded-full bg-primary px-4 py-2 text-xs text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Wear it now
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <div className="flex h-36 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/60">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your next card</p>
              <div className="flex gap-1.5" aria-label={`${Math.min(tokens, SCRATCH_COST)} of ${SCRATCH_COST} tokens saved`}>
                {Array.from({ length: SCRATCH_COST }, (_, i) => (
                  <span
                    key={i}
                    className={cn("size-3 rounded-full border", i < tokens ? "border-transparent bg-[var(--phase-ovulatory)]" : "border-border")}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={unlock}
              disabled={premium && (!canAfford || scratching)}
              className="rounded-full border border-foreground px-4 py-2 text-xs transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
            >
              Unlock a scratch card <span aria-hidden>&middot;</span> {SCRATCH_COST} tokens
            </button>
            <p className="text-xs text-muted-foreground">
              {canAfford ? "Every checked task earns 1 token." : `${SCRATCH_COST - tokens} more ${SCRATCH_COST - tokens === 1 ? "task" : "tasks"} to go`}
            </p>
          </div>
        </div>
      ) : (
        <div role="tabpanel" id="vault-panel-collection" aria-labelledby="vault-tab-collection" className="mt-5">
          <ul className="grid grid-cols-2 gap-3">
            {ACCESSORIES.map((a) => {
              const have = owned.includes(a.id)
              const wearing = equipped === a.id
              return (
                <li key={a.id}>
                  {have ? (
                    <button
                      type="button"
                      aria-pressed={wearing}
                      onClick={() => onEquip(wearing ? null : a.id)}
                      className={cn(
                        "flex w-full flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        wearing ? "border-foreground bg-background" : "border-border hover:border-foreground/40",
                      )}
                    >
                      <span className="size-14">
                        <AccessoryPreview id={a.id} />
                      </span>
                      <span className="text-xs leading-tight">{a.name}</span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{wearing ? "Wearing" : "Wear"}</span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-3 text-center">
                      <span className="flex size-14 items-center justify-center font-serif text-2xl text-muted-foreground/50" aria-hidden>
                        ?
                      </span>
                      <span className="text-xs leading-tight text-muted-foreground">Not yet found</span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{a.rarity}</span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Coming to the vault</h3>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Rare drops</span>
            </div>
            <ul className="mt-3 grid grid-cols-3 gap-2.5" aria-label="Upcoming rare accessories">
              {UPCOMING_SLOTS.map(({ name, tag, Icon }) => (
                <li
                  key={name}
                  className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-2 py-3 text-center"
                >
                  <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="text-xs leading-tight text-pretty">{name}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-secondary-foreground">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}

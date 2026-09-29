"use client"

import { useState } from "react"
import { Headphones } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Phase } from "@/lib/twin"

type Tab = "podcasts" | "sounds"

const SOURCES: Record<Tab, { label: string; items: { name: string; type: "show" | "playlist"; id: string }[] }> = {
  podcasts: {
    label: "ADHD podcasts",
    items: [
      { name: "Taking Control", type: "show", id: "1u5K8OxijCqoHbYLzlbsY0" },
      { name: "ADHD Adults", type: "show", id: "2oYZwGakl7shJFG0lJ8JMt" },
    ],
  },
  sounds: {
    label: "Focus sounds",
    items: [
      { name: "Brown noise", type: "playlist", id: "1RelWQY3aVOOf2CrXLIEMa" },
      { name: "Deep focus noise", type: "playlist", id: "2A4ufQx0uoEV2IzjGavph0" },
    ],
  },
}

export function MusicCard({ phase }: { phase: Phase }) {
  const [tab, setTab] = useState<Tab>("sounds")
  const [pick, setPick] = useState(0)
  const current = SOURCES[tab].items[pick] ?? SOURCES[tab].items[0]

  return (
    <section aria-labelledby="music-heading" className="relative isolate overflow-hidden rounded-2xl">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 transition-colors duration-1000"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${phase.color} 35%, var(--background)), var(--secondary) 60%, color-mix(in oklab, var(--phase-ovulatory) 25%, var(--background)))`,
        }}
      />
      <div className="flex h-full flex-col rounded-2xl border border-card/70 bg-card/45 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Dopamine & focus</p>
            <h2 id="music-heading" className="mt-1 font-serif text-2xl">
              Sound companion
            </h2>
          </div>
          <Headphones className="size-5 text-muted-foreground" aria-hidden />
        </div>

        <div role="tablist" aria-label="Audio type" className="mt-4 grid grid-cols-2 gap-1 rounded-full border border-card/70 bg-card/50 p-1">
          {(Object.keys(SOURCES) as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t)
                setPick(0)
              }}
              className={cn(
                "rounded-full py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {SOURCES[t].label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {SOURCES[tab].items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={i === pick}
              onClick={() => setPick(i)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === pick ? "border-foreground text-foreground" : "border-card/80 text-muted-foreground hover:text-foreground",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>

        <iframe
          key={current.id}
          title={`Spotify: ${current.name}`}
          src={`https://open.spotify.com/embed/${current.type}/${current.id}?utm_source=generator&theme=0`}
          className="mt-4 h-[152px] w-full rounded-xl border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </section>
  )
}

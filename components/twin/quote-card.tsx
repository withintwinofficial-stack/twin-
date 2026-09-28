"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { QUOTES } from "@/lib/twin"

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000)
}

export function QuoteCard({ today }: { today: Date }) {
  const issue = dayOfYear(today)
  const [index, setIndex] = useState(issue % QUOTES.length)

  return (
    <section
      aria-labelledby="quote-heading"
      className="relative mt-8 overflow-hidden rounded-2xl bg-primary px-6 py-8 text-primary-foreground md:px-12 md:py-10"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute top-6 right-8 font-serif text-[10rem] leading-[0.7] md:right-16 text-primary-foreground/5 md:right-12"
      >
        &ldquo;
      </span>
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
        <div className="flex shrink-0 flex-col gap-1 md:w-40">
          <h2 id="quote-heading" className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground/60">
            Quote of the day
          </h2>
          <p className="font-serif text-sm italic text-primary-foreground/60">No. {String(issue).padStart(3, "0")}</p>
        </div>

        <blockquote key={index} className="flex-1 animate-in fade-in slide-in-from-bottom-1 duration-500">
          <p className="text-balance font-serif text-2xl leading-snug md:text-[2rem]">{QUOTES[index]}</p>
        </blockquote>

        <button
          type="button"
          onClick={() => setIndex((i) => (i + 1) % QUOTES.length)}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-primary-foreground/20 px-4 py-2 text-xs tracking-wide text-primary-foreground/80 transition-colors hover:bg-primary-foreground/10 md:self-center"
        >
          <RefreshCw className="size-3.5" aria-hidden />
          Another one
        </button>
      </div>
    </section>
  )
}

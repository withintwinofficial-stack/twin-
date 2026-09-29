import { Lock } from "lucide-react"

export function PremiumTeaser({ title, description, onUpgrade }: { title: string; description: string; onUpgrade: () => void }) {
  const headingId = `teaser-${title.replace(/\W+/g, "-").toLowerCase()}`
  return (
    <section aria-labelledby={headingId} className="flex flex-col rounded-2xl border border-dashed border-border bg-card/50 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <Lock className="size-3" aria-hidden />
          Premium
        </span>
      </div>
      <p className="mt-4 font-serif text-xl leading-snug text-pretty">{description}</p>
      <button
        type="button"
        onClick={onUpgrade}
        className="mt-6 self-start rounded-full border border-foreground px-4 py-2 text-xs transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Unlock for $4.99/month
      </button>
    </section>
  )
}

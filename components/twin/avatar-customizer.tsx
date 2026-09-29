import { cn } from "@/lib/utils"
import { HAIR_COLORS, HAIR_STYLES, SKIN_TONES, type AvatarConfig } from "@/lib/twin"

function Swatch({ color, name, selected, onClick }: { color: string; name: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={name}
      title={name}
      className={cn(
        "size-7 rounded-full ring-offset-2 ring-offset-card transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "ring-1 ring-foreground" : "ring-0 hover:ring-1 hover:ring-border",
      )}
      style={{ backgroundColor: color }}
    />
  )
}

export function AvatarCustomizer({ value, onChange, showHeading = true }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void; showHeading?: boolean }) {
  return (
    <section aria-labelledby={showHeading ? "customize-heading" : undefined} aria-label={showHeading ? undefined : "Twin appearance"}>
      {showHeading ? (
        <div className="mb-5 flex flex-col gap-1">
          <h2 id="customize-heading" className="font-serif text-xl">
            Style your Twin
          </h2>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Wardrobe follows your cycle</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-5">
        <fieldset className="flex items-center justify-between gap-4">
          <legend className="sr-only">Skin tone</legend>
          <span aria-hidden className="text-xs text-muted-foreground">Skin</span>
          <div className="flex gap-3">
            {SKIN_TONES.map((tone, i) => (
              <Swatch key={tone.name} color={tone.value} name={tone.name} selected={value.skin === i} onClick={() => onChange({ ...value, skin: i })} />
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">Hairstyle</legend>
          <span aria-hidden className="text-xs text-muted-foreground">Hairstyle</span>
          <div className="grid grid-cols-4 gap-1 rounded-full border border-border p-1">
            {HAIR_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                aria-pressed={value.hair === style.id}
                onClick={() => onChange({ ...value, hair: style.id })}
                className={cn(
                  "rounded-full py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  value.hair === style.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {style.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex items-center justify-between gap-4">
          <legend className="sr-only">Hair color</legend>
          <span aria-hidden className="text-xs text-muted-foreground">Hair color</span>
          <div className="flex gap-3">
            {HAIR_COLORS.map((c, i) => (
              <Swatch key={c.name} color={c.value} name={c.name} selected={value.hairColor === i} onClick={() => onChange({ ...value, hairColor: i })} />
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  )
}

import type { CSSProperties } from "react"

const STARS = Array.from({ length: 9 }, (_, i) => {
  const angle = (i / 9) * Math.PI * 2
  const distance = 16 + (i % 3) * 7
  return { tx: Math.round(Math.cos(angle) * distance), ty: Math.round(Math.sin(angle) * distance), size: 5 + (i % 3) * 2, delay: (i % 4) * 50 }
})

const COLORS = ["var(--phase-ovulatory)", "#d9bd86", "#a8834a"]

export function Stardust() {
  return (
    <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-10">
      {STARS.map((s, i) => (
        <svg
          key={i}
          viewBox="0 0 10 10"
          className="absolute -translate-x-1/2 -translate-y-1/2 motion-safe:animate-twin-stardust motion-reduce:hidden"
          style={
            {
              "--tx": `${s.tx}px`,
              "--ty": `${s.ty}px`,
              width: s.size,
              height: s.size,
              opacity: 0,
              animationDelay: `${s.delay}ms`,
            } as CSSProperties
          }
        >
          <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill={COLORS[i % COLORS.length]} />
        </svg>
      ))}
    </span>
  )
}

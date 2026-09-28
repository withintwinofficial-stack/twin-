import type { CSSProperties } from "react"

const PIECES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1)
  const distance = 90 + (i % 4) * 22
  return {
    tx: Math.round(Math.cos(angle) * distance),
    ty: Math.round(Math.sin(angle) * distance * 0.85 - 30),
    rot: (i % 2 ? 1 : -1) * (120 + i * 25),
    shape: i % 3,
    delay: (i % 5) * 40,
  }
})

export function CelebrationBurst({ colors }: { colors: string[] }) {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-[38%] z-10">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="absolute block motion-safe:animate-twin-burst motion-reduce:hidden"
          style={
            {
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--rot": `${p.rot}deg`,
              animationDelay: `${p.delay}ms`,
              opacity: 0,
              width: p.shape === 0 ? 8 : 6,
              height: p.shape === 0 ? 8 : p.shape === 1 ? 12 : 6,
              borderRadius: p.shape === 1 ? 2 : 9999,
              backgroundColor: colors[i % colors.length],
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

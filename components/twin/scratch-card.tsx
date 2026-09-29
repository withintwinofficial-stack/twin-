"use client"

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react"
import { cn } from "@/lib/utils"

const BRUSH = 18
const REVEAL_AT = 0.5

export function ScratchCard({ children, revealed, onReveal }: { children: ReactNode; revealed: boolean; onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scratching = useRef(false)
  const strokes = useRef(0)
  const done = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const { width, height } = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const foil = ctx.createLinearGradient(0, 0, width, height)
    foil.addColorStop(0, "#b8914f")
    foil.addColorStop(0.45, "#e7d5ab")
    foil.addColorStop(0.55, "#d9bd86")
    foil.addColorStop(1, "#a8834a")
    ctx.fillStyle = foil
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = "rgba(255,255,255,0.14)"
    ctx.lineWidth = 1
    for (let x = -height; x < width; x += 6) {
      ctx.beginPath()
      ctx.moveTo(x, height)
      ctx.lineTo(x + height, 0)
      ctx.stroke()
    }

    ctx.fillStyle = "rgba(42,38,34,0.72)"
    ctx.textAlign = "center"
    ctx.font = `italic 20px ${getComputedStyle(canvas).fontFamily}`
    ctx.fillText("Scratch gently", width / 2, height / 2 + 7)
  }, [])

  const clearedRatio = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let clear = 0
    let sampled = 0
    for (let i = 3; i < data.length; i += 4 * 24) {
      sampled++
      if (data[i] === 0) clear++
    }
    return clear / sampled
  }

  const scratch = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!scratching.current || done.current) return
    const canvas = e.currentTarget
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, BRUSH, 0, Math.PI * 2)
    ctx.fill()
    strokes.current++
    if (strokes.current % 6 === 0 && clearedRatio(ctx, canvas) > REVEAL_AT) {
      done.current = true
      onReveal()
    }
  }

  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-border bg-background">
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "absolute inset-0 size-full cursor-grab touch-none font-serif transition-opacity duration-700",
          revealed && "pointer-events-none opacity-0",
        )}
        onPointerDown={(e) => {
          scratching.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          scratch(e)
        }}
        onPointerMove={scratch}
        onPointerUp={() => (scratching.current = false)}
        onPointerCancel={() => (scratching.current = false)}
      />
    </div>
  )
}

import type { ReactNode } from "react"
import { HAIR_COLORS, SKIN_TONES, type AccessoryId, type AvatarConfig, type Expression, type HairStyle, type Outfit } from "@/lib/twin"

const INK = "#2a2622"
const CREAM = "#f7f3ec"
const EYE = "#3a2a33"
const IRIS = "#86607a"
const SPARKLE = "#fffaf2"
const LIP = "#c46f6a"
const BLUSH = "#eaa29c"
const GOLD = "#d9b061"
const ROSE = "#d9798a"
const ROSE_DEEP = "#b5576a"
const SOLE = "#d9d2c6"
const LEATHER = "#3a3330"

const VIEWBOX = "-2 -6 36 52"

function mix(a: string, b: string, t: number) {
  const parse = (hex: string) => (hex.slice(1).match(/../g) ?? []).map((v) => Number.parseInt(v, 16))
  const pa = parse(a)
  const pb = parse(b)
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("")}`
}
const lighten = (hex: string, t: number) => mix(hex, "#ffffff", t)
const darken = (hex: string, t: number) => mix(hex, "#000000", t)

type Cells = Map<string, string>

/** A tiny pixel canvas. Later paints overwrite earlier ones, so draw back-to-front. */
class Sprite {
  readonly cells: Cells = new Map()
  dx = 0
  dy = 0

  set(x: number, y: number, color: string) {
    this.cells.set(`${x + this.dx},${y + this.dy}`, color)
  }

  rect(x: number, y: number, w: number, h: number, color: string) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, color)
  }

  span(y: number, x1: number, x2: number, color: string) {
    this.rect(x1, y, x2 - x1 + 1, 1, color)
  }

  art(rows: string[], x0: number, y0: number, palette: Record<string, string>) {
    rows.forEach((row, j) => {
      ;[...row].forEach((ch, i) => {
        const color = palette[ch]
        if (color) this.set(x0 + i, y0 + j, color)
      })
    })
  }

  /** Returns the cells plus a 1px ink outline traced around the silhouette. */
  outlined(color = INK): Cells {
    const out: Cells = new Map(this.cells)
    for (const key of this.cells.keys()) {
      const [x, y] = key.split(",").map(Number)
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ]) {
        const k = `${nx},${ny}`
        if (!this.cells.has(k)) out.set(k, color)
      }
    }
    return out
  }
}

function Pixels({ cells }: { cells: Cells }) {
  const rows = new Map<number, [number, string][]>()
  for (const [key, color] of cells) {
    const [x, y] = key.split(",").map(Number)
    const row = rows.get(y) ?? []
    row.push([x, color])
    rows.set(y, row)
  }
  const rects: ReactNode[] = []
  for (const [y, list] of rows) {
    list.sort((a, b) => a[0] - b[0])
    let start = list[0][0]
    let prev = start
    let color = list[0][1]
    const flush = () => rects.push(<rect key={`${y}:${start}`} x={start} y={y} width={prev - start + 1} height={1} fill={color} />)
    for (let i = 1; i < list.length; i++) {
      const [x, c] = list[i]
      if (x === prev + 1 && c === color) {
        prev = x
      } else {
        flush()
        start = x
        prev = x
        color = c
      }
    }
    flush()
  }
  return <>{rects}</>
}

/* ---------- Hair ---------- */

const CAP_FRONT = [
  "......HHHHHH......",
  "...HHHHHHHHHHHH...",
  "..HHHLLLHHHHHHHH..",
  ".HHHLLHHHHHHHHHHH.",
  ".HHHHHHHHHHHHHHHH.",
  "HHHHHHHHHHHHHHHHHH",
  "HHHHHHH.HHHHH.HHHH",
  "HHH.HH...HHH...HHH",
]
const SIDES = "HH..............HH"

const CURLY_BACK = [
  "....HHHH..HHHH..HHH...",
  "..HHHHHHHHHHHHHHHHHH..",
  ".HHHHHHHHHHHHHHHHHHHH.",
  ...Array.from({ length: 14 }, (_, i) => (i % 2 === 0 ? "HHHHHHHHHHHHHHHHHHHHHH" : ".HHHHHHHHHHHHHHHHHHHH.")),
  "HHHH..............HHHH",
  ".HH................HH.",
]

const CURLY_FRONT = [
  "..HHH.HHHH.HHHH...",
  ".HHHHHHHHHHHHHHHH.",
  "HHHLLHHHHHLLHHHHHH",
  "HHHHHHHHHHHHHHHHHH",
  "HHHHHHHHHHHHHHHHHH",
  "HHHH.HHHHH.HHHHHHH",
  "HH...HH.....HH..HH",
  ...Array.from({ length: 6 }, () => SIDES),
  "HHH............HHH",
]

function capBack(s: Sprite, color: string, bottom: number) {
  s.span(5, 9, 22, color)
  for (let y = 6; y < bottom; y++) s.span(y, 7, 24, color)
  s.span(bottom, 8, 23, color)
}

function hairBack(s: Sprite, style: HairStyle, hair: string) {
  const shine = lighten(hair, 0.3)
  switch (style) {
    case "bob":
    case "long":
      capBack(s, hair, 19)
      return
    case "bun":
      s.span(0, 14, 17, hair)
      s.span(1, 13, 18, hair)
      s.span(2, 12, 19, hair)
      s.span(3, 12, 19, hair)
      s.span(4, 13, 18, hair)
      s.span(1, 14, 15, shine)
      capBack(s, hair, 14)
      return
    case "curly":
      s.art(CURLY_BACK, 5, 3, { H: hair })
      s.set(7, 9, shine)
      s.set(24, 12, shine)
      s.set(6, 16, shine)
      return
  }
}

function hairFront(s: Sprite, style: HairStyle, hair: string) {
  const palette = { H: hair, L: lighten(hair, 0.3) }
  switch (style) {
    case "bob":
      s.art([...CAP_FRONT, ...Array.from({ length: 6 }, () => SIDES), "HHH............HHH", ".HH............HH."], 7, 4, palette)
      return
    case "long": {
      s.art([...CAP_FRONT, ...Array.from({ length: 6 }, () => SIDES)], 7, 4, palette)
      for (let y = 12; y <= 29; y++) {
        s.span(y, 6, 8, hair)
        s.span(y, 23, 25, hair)
      }
      s.span(30, 7, 8, hair)
      s.span(30, 23, 24, hair)
      s.set(7, 31, hair)
      s.set(24, 31, hair)
      for (let y = 15; y <= 25; y++) {
        s.set(7, y, palette.L)
        s.set(24, y, palette.L)
      }
      return
    }
    case "bun":
      s.art([...CAP_FRONT.slice(1), SIDES, SIDES], 7, 5, palette)
      return
    case "curly":
      s.art(CURLY_FRONT, 7, 4, palette)
      return
  }
}

/* ---------- Head & face ---------- */

function headSkin(s: Sprite, skin: string) {
  s.span(6, 12, 19, skin)
  s.span(7, 10, 21, skin)
  s.span(8, 9, 22, skin)
  s.span(9, 9, 22, skin)
  for (let y = 10; y <= 16; y++) s.span(y, 8, 23, skin)
  s.span(17, 9, 22, skin)
  s.span(18, 10, 21, skin)
  s.span(19, 12, 19, skin)
}

function faceDetails(s: Sprite, expression: Expression) {
  s.span(16, 9, 10, BLUSH)
  s.span(16, 21, 22, BLUSH)
  if (expression === "focused") {
    s.set(14, 16, LIP)
    s.set(17, 16, LIP)
    s.span(17, 15, 16, LIP)
  } else if (expression === "sleepy") {
    s.span(17, 15, 16, LIP)
  } else {
    s.span(17, 15, 16, lighten(LIP, 0.25))
  }
}

const EYE_SLOTS: [number, number][] = [
  [10, 9],
  [19, 22],
]

function eyes(e: Sprite, expression: Expression) {
  for (const [x, lash] of EYE_SLOTS) {
    if (expression === "focused") {
      e.span(12, x, x + 2, EYE)
      e.set(lash, 12, EYE)
      e.set(x, 13, SPARKLE)
      e.span(13, x + 1, x + 2, EYE)
      e.span(14, x, x + 2, EYE)
      e.span(15, x, x + 2, IRIS)
      e.set(x + 2, 15, SPARKLE)
    } else if (expression === "sleepy") {
      e.span(13, x, x + 2, EYE)
      e.set(lash, 13, EYE)
      e.span(14, x, x + 2, IRIS)
    } else {
      e.set(x, 13, EYE)
      e.set(x + 2, 13, EYE)
      e.set(x + 1, 14, EYE)
    }
  }
}

/* ---------- Accessories ---------- */

function accessory(s: Sprite, id: AccessoryId, style: HairStyle) {
  switch (id) {
    case "sunglasses": {
      const lens = "#3a2f35"
      s.rect(9, 12, 5, 3, lens)
      s.rect(18, 12, 5, 3, lens)
      s.span(12, 14, 17, lens)
      s.set(8, 12, lens)
      s.set(23, 12, lens)
      s.set(10, 12, "#b9aeb4")
      s.set(19, 12, "#b9aeb4")
      s.set(12, 14, ROSE_DEEP)
      s.set(21, 14, ROSE_DEEP)
      return
    }
    case "crown":
      s.art(["G...GG...G", "GG.GGGG.GG", "GGGGRRGGGG", "GGGGGGGGGG"], 11, style === "bun" ? -5 : -1, { G: GOLD, R: ROSE })
      return
    case "pearls":
      for (const x of [8, 23]) {
        s.set(x, 17, GOLD)
        s.set(x, 18, CREAM)
      }
      return
    case "bow":
      s.art(["BB..BB", "BBKKBB", "BB..BB"], 19, 3, { B: ROSE, K: ROSE_DEEP })
      return
  }
}

/* ---------- Bodies ---------- */

function arms(s: Sprite, skin: string, sleeve: string | null, sleeveRows: number) {
  for (let y = 21; y <= 29; y++) {
    const covered = sleeve !== null && y < 21 + sleeveRows
    const color = covered ? sleeve : skin
    const inner = covered ? darken(sleeve, 0.18) : color
    s.set(9, y, color)
    s.set(10, y, inner)
    s.set(21, y, inner)
    s.set(22, y, color)
  }
  s.span(30, 9, 10, skin)
  s.span(30, 21, 22, skin)
}

function legs(s: Sprite, skin: string) {
  s.rect(12, 34, 3, 7, skin)
  s.rect(17, 34, 3, 7, skin)
}

function heels(s: Sprite, color: string) {
  s.span(41, 12, 14, color)
  s.span(41, 17, 19, color)
  s.set(12, 42, color)
  s.set(19, 42, color)
}

function sneakers(s: Sprite, x1: number, x2: number, x3: number, x4: number) {
  s.span(41, x1, x2, CREAM)
  s.span(41, x3, x4, CREAM)
  s.span(42, x1, x2, SOLE)
  s.span(42, x3, x4, SOLE)
}

function standingBody(s: Sprite, outfit: Outfit, skin: string) {
  const top = outfit.top
  const bottom = outfit.bottom
  s.span(20, 15, 16, skin)

  switch (outfit.kind) {
    case "chic": {
      const mauve = "#8f6e62"
      legs(s, skin)
      heels(s, mauve)
      s.span(28, 11, 20, bottom)
      s.rect(10, 29, 12, 2, bottom)
      s.rect(9, 31, 14, 3, bottom)
      for (const [x, y] of [
        [13, 29],
        [13, 30],
        [18, 31],
        [18, 32],
        [11, 32],
      ])
        s.set(x, y, lighten(bottom, 0.35))
      s.rect(11, 21, 10, 6, top)
      s.span(22, 14, 17, darken(top, 0.08))
      s.span(27, 11, 20, INK)
      s.span(27, 15, 16, GOLD)
      arms(s, skin, top, 3)
      s.set(8, 31, mauve)
      s.rect(6, 32, 4, 3, mauve)
      s.set(8, 32, GOLD)
      return
    }
    case "sporty": {
      const jacket = "#6e7a60"
      s.rect(11, 29, 10, 3, bottom)
      s.rect(12, 32, 3, 8, bottom)
      s.rect(17, 32, 3, 8, bottom)
      s.span(40, 11, 14, bottom)
      s.span(40, 17, 20, bottom)
      sneakers(s, 11, 14, 17, 20)
      s.rect(11, 21, 10, 4, top)
      s.span(21, 13, 18, lighten(top, 0.2))
      s.rect(11, 25, 10, 2, skin)
      s.rect(10, 27, 12, 2, jacket)
      s.span(29, 15, 16, darken(jacket, 0.15))
      s.rect(14, 30, 1, 2, jacket)
      s.rect(17, 30, 1, 2, jacket)
      arms(s, skin, null, 0)
      s.span(27, 7, 8, top)
      s.rect(7, 28, 2, 5, CREAM)
      s.set(7, 30, lighten(top, 0.4))
      return
    }
    case "street": {
      s.rect(10, 29, 12, 3, bottom)
      s.rect(10, 32, 5, 9, bottom)
      s.rect(17, 32, 5, 9, bottom)
      s.rect(10, 34, 2, 2, darken(bottom, 0.12))
      s.rect(20, 34, 2, 2, darken(bottom, 0.12))
      sneakers(s, 10, 14, 17, 21)
      s.rect(13, 21, 6, 8, "#e6daca")
      s.rect(11, 21, 3, 8, top)
      s.rect(18, 21, 3, 8, top)
      for (let y = 23; y <= 26; y++) s.set(12, y, lighten(top, 0.22))
      arms(s, skin, top, 9)
      return
    }
    case "business": {
      legs(s, skin)
      heels(s, LEATHER)
      s.rect(11, 32, 10, 2, bottom)
      s.rect(10, 21, 12, 11, top)
      s.span(21, 14, 17, CREAM)
      s.span(22, 14, 17, CREAM)
      s.span(23, 15, 16, CREAM)
      s.span(24, 15, 16, CREAM)
      const lapel = darken(top, 0.16)
      for (const [x, y] of [
        [13, 22],
        [13, 23],
        [14, 24],
        [18, 22],
        [18, 23],
        [17, 24],
      ])
        s.set(x, y, lapel)
      s.span(27, 10, 21, "#8f6a4d")
      s.span(27, 15, 16, GOLD)
      arms(s, skin, top, 9)
      s.span(31, 22, 24, LEATHER)
      s.rect(21, 32, 5, 3, LEATHER)
      s.set(23, 33, GOLD)
      return
    }
    case "lounge": {
      const shade = darken(top, 0.16)
      s.rect(11, 32, 10, 2, bottom)
      s.rect(11, 34, 4, 6, bottom)
      s.rect(17, 34, 4, 6, bottom)
      s.span(40, 11, 14, darken(bottom, 0.1))
      s.span(40, 17, 20, darken(bottom, 0.1))
      s.span(41, 10, 14, CREAM)
      s.span(41, 17, 21, CREAM)
      s.span(42, 10, 14, SOLE)
      s.span(42, 17, 21, SOLE)
      s.rect(10, 21, 12, 11, top)
      s.span(20, 12, 14, shade)
      s.span(20, 17, 19, shade)
      s.rect(13, 28, 6, 2, shade)
      for (const [x, y] of [
        [14, 22],
        [14, 23],
        [17, 22],
        [17, 23],
      ])
        s.set(x, y, CREAM)
      arms(s, skin, top, 9)
      return
    }
  }
}

function seatedBody(s: Sprite, outfit: Outfit, skin: string) {
  const top = outfit.top
  const bottom = outfit.bottom
  s.span(20, 15, 16, skin)
  if (outfit.kind === "lounge") {
    s.span(20, 12, 14, darken(top, 0.16))
    s.span(20, 17, 19, darken(top, 0.16))
  }
  s.rect(7, 31, 18, 4, bottom)
  s.span(31, 9, 13, lighten(bottom, 0.25))
  s.rect(5, 33, 2, 2, CREAM)
  s.rect(25, 33, 2, 2, CREAM)
  s.rect(10, 21, 12, 10, top)
  if (outfit.kind === "lounge") {
    s.set(14, 22, CREAM)
    s.set(17, 22, CREAM)
  }
  const sleeveInner = darken(top, 0.18)
  for (let y = 21; y <= 26; y++) {
    s.set(9, y, top)
    s.set(10, y, sleeveInner)
    s.set(21, y, sleeveInner)
    s.set(22, y, top)
  }
  s.rect(11, 26, 2, 2, top)
  s.rect(19, 26, 2, 2, top)
  s.span(25, 14, 17, "#cfc2b0")
  s.rect(14, 26, 4, 3, "#fbf8f3")
  s.span(27, 14, 17, ROSE)
  s.rect(13, 26, 1, 2, skin)
  s.rect(18, 26, 1, 2, skin)
}

/* ---------- Composition ---------- */

interface Look {
  skin: string
  hair: string
  style: HairStyle
  expression: Expression
  accessory: AccessoryId | null
}

function composeFigure(base: Sprite, eyeLayer: Sprite, look: Look, dx: number, dy: number, body?: (s: Sprite) => void) {
  base.dx = dx
  base.dy = dy
  eyeLayer.dx = dx
  eyeLayer.dy = dy
  hairBack(base, look.style, look.hair)
  body?.(base)
  headSkin(base, look.skin)
  faceDetails(base, look.expression)
  hairFront(base, look.style, look.hair)
  if (look.accessory) accessory(base, look.accessory, look.style)
  if (look.accessory !== "sunglasses") eyes(eyeLayer, look.expression)
  base.dx = 0
  base.dy = 0
}

function EyeLayer({ cells, blink }: { cells: Cells; blink: boolean }) {
  return (
    <g className={blink ? "motion-safe:animate-twin-blink" : undefined} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
      <Pixels cells={cells} />
    </g>
  )
}

const Z_GLYPH = ["ZZZZZ", "...Z.", "..Z..", ".Z...", "ZZZZZ"]

function SleepyZs() {
  const z = new Sprite()
  z.art(Z_GLYPH, 0, 0, { Z: INK })
  return (
    <g opacity={0.55}>
      {[
        { x: 19, y: 22, scale: 0.6, delay: "0s" },
        { x: 23, y: 15, scale: 0.8, delay: "1.2s" },
        { x: 27, y: 7, scale: 1, delay: "2.4s" },
      ].map((zz) => (
        <g key={zz.delay} transform={`translate(${zz.x} ${zz.y}) scale(${zz.scale})`}>
          <g className="motion-safe:animate-twin-zzz" style={{ animationDelay: zz.delay }}>
            <Pixels cells={z.cells} />
          </g>
        </g>
      ))}
    </g>
  )
}

function StandingTwin({ look, outfit }: { look: Look; outfit: Outfit }) {
  const base = new Sprite()
  const eyeLayer = new Sprite()
  composeFigure(base, eyeLayer, look, 0, 0, (s) => standingBody(s, outfit, look.skin))
  return (
    <svg viewBox={VIEWBOX} shapeRendering="crispEdges" className="h-full w-full" role="img" aria-label={`Your Twin wearing ${outfit.label}`}>
      <rect x={8} y={44} width={16} height={1} fill={INK} opacity={0.12} />
      <rect x={10} y={45} width={12} height={1} fill={INK} opacity={0.06} />
      <Pixels cells={base.outlined()} />
      <EyeLayer cells={eyeLayer.cells} blink={look.expression === "focused"} />
    </svg>
  )
}

function SeatedTwin({ look, outfit }: { look: Look; outfit: Outfit }) {
  const cushion = new Sprite()
  cushion.span(40, 6, 25, "#ece3d6")
  cushion.rect(3, 41, 26, 2, "#ece3d6")
  cushion.rect(3, 43, 26, 1, "#e2d7c7")
  cushion.span(44, 5, 26, "#e2d7c7")
  cushion.set(16, 42, "#cfc2b0")

  const base = new Sprite()
  const eyeLayer = new Sprite()
  composeFigure(base, eyeLayer, look, 0, 7, (s) => seatedBody(s, outfit, look.skin))

  const steam = new Sprite()
  steam.dy = 7
  for (const [x, y] of [
    [15, 24],
    [14, 23],
    [15, 22],
  ])
    steam.set(x, y, CREAM)
  const steam2 = new Sprite()
  steam2.dy = 7
  for (const [x, y] of [
    [17, 23],
    [18, 22],
  ])
    steam2.set(x, y, CREAM)

  return (
    <svg viewBox={VIEWBOX} shapeRendering="crispEdges" className="h-full w-full" role="img" aria-label={`Your Twin resting on a cushion with a warm mug, wearing ${outfit.label}`}>
      <Pixels cells={cushion.outlined()} />
      <g className="motion-safe:animate-twin-breathe" style={{ transformOrigin: "16px 44px", transformBox: "view-box" }}>
        <Pixels cells={base.outlined()} />
        <EyeLayer cells={eyeLayer.cells} blink={look.expression === "focused"} />
        <g opacity={0.85}>
          <g className="motion-safe:animate-twin-steam">
            <Pixels cells={steam.cells} />
          </g>
          <g className="motion-safe:animate-twin-steam [animation-delay:1.4s]">
            <Pixels cells={steam2.cells} />
          </g>
        </g>
      </g>
    </svg>
  )
}

function SleepingTwin({ look }: { look: Look }) {
  const bed = new Sprite()
  bed.span(39, 0, 31, "#ece3d6")
  bed.rect(0, 40, 32, 4, "#e2d7c7")
  bed.rect(1, 33, 12, 6, CREAM)
  bed.span(33, 2, 11, "#fbf8f3")

  const base = new Sprite()
  const eyeLayer = new Sprite()
  composeFigure(base, eyeLayer, { ...look, expression: "asleep", accessory: null }, -6, 18)
  const blanket = "#bfae9c"
  base.span(30, 18, 27, blanket)
  base.span(31, 17, 29, blanket)
  base.rect(16, 32, 15, 7, blanket)
  base.rect(16, 32, 2, 7, "#d9cec1")
  for (const x of [22, 26]) for (let y = 33; y <= 37; y++) base.set(x, y, darken(blanket, 0.07))

  return (
    <svg viewBox={VIEWBOX} shapeRendering="crispEdges" className="h-full w-full" role="img" aria-label="Your Twin asleep under a blanket">
      <Pixels cells={bed.outlined()} />
      <g className="motion-safe:animate-twin-breathe" style={{ transformOrigin: "20px 40px", transformBox: "view-box" }}>
        <Pixels cells={base.outlined()} />
        <EyeLayer cells={eyeLayer.cells} blink={false} />
      </g>
      <SleepyZs />
    </svg>
  )
}

export function AccessoryPreview({ id }: { id: AccessoryId }) {
  const s = new Sprite()
  headSkin(s, "#ece5da")
  accessory(s, id, "bob")
  return (
    <svg viewBox="4 -3 24 24" shapeRendering="crispEdges" className="h-full w-full" aria-hidden>
      <Pixels cells={s.outlined("#b9aea0")} />
    </svg>
  )
}

export type TwinPose = "standing" | "seated" | "asleep"

export function TwinAvatar({ config, outfit, pose, expression }: { config: AvatarConfig; outfit: Outfit; pose: TwinPose; expression: Expression }) {
  const look: Look = {
    skin: SKIN_TONES[config.skin].value,
    hair: HAIR_COLORS[config.hairColor].value,
    style: config.hair,
    expression,
    accessory: config.accessory ?? null,
  }
  if (pose === "asleep") return <SleepingTwin look={look} />
  return pose === "seated" ? <SeatedTwin look={look} outfit={outfit} /> : <StandingTwin look={look} outfit={outfit} />
}

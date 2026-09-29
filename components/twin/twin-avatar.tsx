import { HAIR_COLORS, SKIN_TONES, type AvatarConfig, type Expression, type HairStyle, type Outfit } from "@/lib/twin"

const INK = "#2a2622"
const CREAM = "#f7f3ec"

const CURL_BACK: [number, number][] = [
  [-30, -10], [-26, -26], [-14, -36], [0, -40], [14, -36], [26, -26], [30, -10], [-33, 6], [33, 6], [-30, 20], [30, 20],
]
const CURL_FRONT: [number, number, number][] = [
  [-20, -27, 10], [-6, -32, 10], [8, -32, 10], [21, -25, 9],
]

function HairBack({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "bob":
      return <path d="M-34 -4 Q-37 -40 0 -41 Q37 -40 34 -4 L35 22 Q22 30 14 20 L-14 20 Q-22 30 -35 22 Z" fill={color} />
    case "long":
      return (
        <path
          d="M-34 -6 Q-38 -41 0 -42 Q38 -41 34 -6 Q37 30 38 58 Q32 66 24 60 Q22 38 20 20 L-20 20 Q-22 38 -24 60 Q-32 66 -38 58 Q-37 30 -34 -6 Z"
          fill={color}
        />
      )
    case "bun":
      return <circle cx={0} cy={-38} r={14} fill={color} />
    case "curly":
      return (
        <g fill={color}>
          {CURL_BACK.map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={12.5} />
          ))}
        </g>
      )
  }
}

function HairFront({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "bob":
      return <path d="M-31 -8 Q-28 -37 0 -37 Q29 -37 31 -8 Q14 -24 -4 -19 Q-20 -16 -31 -8 Z" fill={color} />
    case "long":
      return <path d="M-31 -4 Q-31 -38 2 -37 Q31 -36 31 -2 Q22 -26 -2 -26 Q-19 -24 -31 -4 Z" fill={color} />
    case "bun":
      return <path d="M-31 -4 Q-30 -36 0 -35 Q30 -36 31 -4 Q24 -25 0 -27 Q-24 -25 -31 -4 Z" fill={color} />
    case "curly":
      return (
        <g fill={color}>
          {CURL_FRONT.map(([x, y, r]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
      )
  }
}

function Face({ expression }: { expression: Expression }) {
  if (expression === "focused") {
    return (
      <>
        <g stroke={INK} strokeLinecap="round" fill="none">
          <path d="M-16 -8.5 Q-11 -9 -5 -5.5" strokeWidth={1.5} opacity={0.7} />
          <path d="M5 -5.5 Q11 -9 16 -8.5" strokeWidth={1.5} opacity={0.7} />
          <path d="M-4.5 13.5 Q0 16.5 4.5 13.5" strokeWidth={1.6} />
        </g>
        <g fill={INK}>
          <ellipse cx={-10} cy={3} rx={2.4} ry={2.7} />
          <ellipse cx={10} cy={3} rx={2.4} ry={2.7} />
        </g>
        <circle cx={-9.2} cy={2} r={0.8} fill={CREAM} />
        <circle cx={10.8} cy={2} r={0.8} fill={CREAM} />
      </>
    )
  }
  const asleep = expression === "asleep"
  return (
    <g stroke={INK} strokeLinecap="round" fill="none">
      <path d="M-15 -6 Q-11 -8 -6 -6.5" strokeWidth={1.3} opacity={0.5} />
      <path d="M6 -6.5 Q11 -8 15 -6" strokeWidth={1.3} opacity={0.5} />
      <path d={asleep ? "M-14 4 Q-10 6 -6 4" : "M-14 3 Q-10 6.5 -6 3"} strokeWidth={1.6} />
      <path d={asleep ? "M6 4 Q10 6 14 4" : "M6 3 Q10 6.5 14 3"} strokeWidth={1.6} />
      {asleep ? <ellipse cx={0} cy={14} rx={2} ry={1.6} strokeWidth={1.3} /> : <path d="M-4 14 Q0 16 4 14" strokeWidth={1.6} />}
    </g>
  )
}

function Head({ skin, hair, style, expression }: { skin: string; hair: string; style: HairStyle; expression: Expression }) {
  return (
    <>
      <HairBack style={style} color={hair} />
      <circle cx={0} cy={0} r={30} fill={skin} />
      <HairFront style={style} color={hair} />
      <Face expression={expression} />
      <circle cx={-17} cy={10} r={4.5} fill="#c9826f" opacity={0.22} />
      <circle cx={17} cy={10} r={4.5} fill="#c9826f" opacity={0.22} />
    </>
  )
}

interface FigureProps {
  skin: string
  hair: string
  style: HairStyle
  outfit: Outfit
  expression: Expression
}

function ChicOutfit({ skin, outfit }: { skin: string; outfit: Outfit }) {
  return (
    <>
      <path d="M76 164 L124 164 L133 270 L104 270 L100 198 L96 270 L67 270 Z" fill={outfit.bottom} />
      <path d="M72 108 Q100 98 128 108 L126 170 L74 170 Z" fill={outfit.top} />
      <g stroke="#000" strokeOpacity={0.07} strokeWidth={1.2}>
        <path d="M80 124 L120 124" />
        <path d="M79 138 L121 138" />
        <path d="M78 152 L122 152" />
      </g>
      <path d="M75 112 Q61 140 64 170" stroke={outfit.top} strokeWidth={13} strokeLinecap="round" fill="none" />
      <path d="M125 112 Q139 140 136 170" stroke={outfit.top} strokeWidth={13} strokeLinecap="round" fill="none" />
      <circle cx={64} cy={176} r={6} fill={skin} />
      <circle cx={136} cy={176} r={6} fill={skin} />
      <ellipse cx={82} cy={274} rx={12} ry={5} fill={INK} />
      <ellipse cx={118} cy={274} rx={12} ry={5} fill={INK} />
    </>
  )
}

function SportyOutfit({ skin, outfit }: { skin: string; outfit: Outfit }) {
  return (
    <>
      <path d="M84 162 L116 162 L120 182 L118 270 L106 270 L100 196 L94 270 L82 270 L80 182 Z" fill={outfit.bottom} />
      <rect x={80} y={146} width={40} height={20} rx={4} fill={skin} />
      <path d="M76 108 Q100 99 124 108 L121 150 L79 150 Z" fill={outfit.top} />
      <path d="M84 150 L116 150" stroke="#000" strokeOpacity={0.12} strokeWidth={2} />
      <path d="M78 112 Q64 140 67 172" stroke={skin} strokeWidth={11} strokeLinecap="round" fill="none" />
      <path d="M122 112 Q142 98 150 72" stroke={skin} strokeWidth={11} strokeLinecap="round" fill="none" />
      <circle cx={151} cy={68} r={6} fill={skin} />
      <ellipse cx={88} cy={274} rx={11} ry={5.5} fill={CREAM} stroke={INK} strokeWidth={1.2} />
      <ellipse cx={112} cy={274} rx={11} ry={5.5} fill={CREAM} stroke={INK} strokeWidth={1.2} />
    </>
  )
}

function StreetOutfit({ outfit }: { outfit: Outfit }) {
  return (
    <>
      <path d="M74 172 L126 172 L130 262 L106 262 L100 206 L94 262 L70 262 Z" fill={outfit.bottom} />
      <g fill="none" stroke="#000" strokeOpacity={0.14} strokeWidth={1.2}>
        <rect x={74} y={214} width={14} height={16} rx={2} />
        <rect x={112} y={214} width={14} height={16} rx={2} />
      </g>
      <path d="M70 256 L96 256 L96 262 L70 262 Z" fill={outfit.bottom} opacity={0.8} />
      <path d="M78 102 Q100 92 122 102 L118 114 Q100 106 82 114 Z" fill={outfit.top} />
      <path d="M68 110 Q100 98 132 110 L136 180 Q100 188 64 180 Z" fill={outfit.top} />
      <path d="M82 150 L118 150 L116 172 L84 172 Z" fill="#000" opacity={0.12} />
      <g stroke={CREAM} strokeWidth={1.4} strokeLinecap="round">
        <path d="M94 112 L93 134" />
        <path d="M106 112 L107 134" />
      </g>
      <path d="M72 116 Q58 146 86 162" stroke={outfit.top} strokeWidth={15} strokeLinecap="round" fill="none" />
      <path d="M128 116 Q142 146 114 162" stroke={outfit.top} strokeWidth={15} strokeLinecap="round" fill="none" />
      <path d="M64 262 Q64 252 80 254 L98 258 L98 272 L64 272 Z" fill={CREAM} stroke={INK} strokeWidth={1.2} />
      <path d="M102 258 L120 254 Q136 252 136 262 L136 272 L102 272 Z" fill={CREAM} stroke={INK} strokeWidth={1.2} />
      <path d="M64 268 L98 268 M102 268 L136 268" stroke={INK} strokeWidth={1.2} />
    </>
  )
}

function BusinessOutfit({ skin, outfit }: { skin: string; outfit: Outfit }) {
  return (
    <>
      <path d="M80 166 L120 166 L124 270 L104 270 L100 200 L96 270 L76 270 Z" fill={outfit.bottom} />
      <path d="M100 176 L100 270" stroke="#000" strokeOpacity={0.12} strokeWidth={1} />
      <path d="M72 108 Q100 98 128 108 L130 176 L70 176 Z" fill={outfit.top} />
      <path d="M90 104 L100 140 L110 104 Q100 101 90 104 Z" fill={CREAM} />
      <g fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={1.4} strokeLinejoin="round">
        <path d="M88 104 L84 124 L92 128 L100 150" />
        <path d="M112 104 L116 124 L108 128 L100 150" />
      </g>
      <circle cx={100} cy={158} r={2.2} fill={INK} opacity={0.6} />
      <path d="M75 112 Q62 142 65 172" stroke={outfit.top} strokeWidth={13} strokeLinecap="round" fill="none" />
      <path d="M125 112 Q138 142 135 172" stroke={outfit.top} strokeWidth={13} strokeLinecap="round" fill="none" />
      <circle cx={65} cy={178} r={6} fill={skin} />
      <rect x={128} y={170} width={24} height={30} rx={3} fill={INK} />
      <path d="M134 170 Q140 162 146 170" fill="none" stroke={INK} strokeWidth={2} />
      <circle cx={135} cy={178} r={6} fill={skin} />
      <path d="M72 270 L96 270 L96 276 L68 276 Q68 271 72 270 Z" fill={INK} />
      <path d="M104 270 L128 270 Q132 271 132 276 L104 276 Z" fill={INK} />
    </>
  )
}

function StandingTwin({ skin, hair, style, outfit, expression }: FigureProps) {
  return (
    <svg viewBox="0 0 200 290" className="h-full w-full" role="img" aria-label={`Your Twin wearing ${outfit.label}`}>
      <rect x={93} y={86} width={14} height={20} rx={6} fill={skin} />
      {outfit.kind === "sporty" ? <SportyOutfit skin={skin} outfit={outfit} /> : null}
      {outfit.kind === "street" ? <StreetOutfit outfit={outfit} /> : null}
      {outfit.kind === "business" ? <BusinessOutfit skin={skin} outfit={outfit} /> : null}
      {outfit.kind === "chic" ? <ChicOutfit skin={skin} outfit={outfit} /> : null}
      <g transform="translate(100 62)">
        <Head skin={skin} hair={hair} style={style} expression={expression} />
      </g>
    </svg>
  )
}

function SeatedTwin({ skin, hair, style, outfit, expression }: FigureProps) {
  return (
    <svg viewBox="0 0 200 290" className="h-full w-full" role="img" aria-label={`Your Twin resting on a cushion with a warm mug, wearing ${outfit.label}`}>
      <ellipse cx={100} cy={266} rx={82} ry={20} fill="#e2d7c7" />
      <ellipse cx={100} cy={257} rx={78} ry={17} fill="#ece3d6" />
      <circle cx={100} cy={257} r={2} fill="#cfc2b0" />

      <g className="motion-safe:animate-twin-breathe" style={{ transformOrigin: "100px 250px", transformBox: "view-box" }}>
        <path d="M48 248 Q56 222 100 227 Q144 222 152 248 Q126 258 100 252 Q74 258 48 248 Z" fill={outfit.bottom} />
        <ellipse cx={62} cy={249} rx={9} ry={5} fill="#f4eee6" />
        <ellipse cx={138} cy={249} rx={9} ry={5} fill="#f4eee6" />

        <rect x={93} y={146} width={14} height={20} rx={6} fill={skin} />
        <path d="M66 172 Q100 159 134 172 L140 236 Q100 244 60 236 Z" fill={outfit.top} />
        <path d="M76 160 Q100 150 124 160 Q119 178 100 180 Q81 178 76 160 Z" fill={outfit.top} />
        <path d="M76 160 Q100 150 124 160 Q119 178 100 180 Q81 178 76 160 Z" fill="#000" opacity={0.08} />
        <path d="M82 208 L118 208 L122 230 L78 230 Z" fill="#000" opacity={0.06} />
        <g stroke="#f4eee6" strokeWidth={1.4} strokeLinecap="round">
          <path d="M94 176 L93 196" />
          <path d="M106 176 L107 196" />
        </g>

        <g stroke={INK} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.5}>
          <path d="M95 196 Q92 190 95 184" className="motion-safe:animate-twin-steam" />
          <path d="M104 196 Q107 189 104 182" className="motion-safe:animate-twin-steam [animation-delay:1.4s]" />
        </g>
        <rect x={89} y={200} width={22} height={19} rx={4} fill={CREAM} stroke={INK} strokeWidth={1.2} />
        <path d="M111 204 Q118 205 117 210 Q116 214 111 214" fill="none" stroke={INK} strokeWidth={1.2} />

        <path d="M69 178 Q54 208 86 216" stroke={outfit.top} strokeWidth={14} strokeLinecap="round" fill="none" />
        <path d="M131 178 Q146 208 114 216" stroke={outfit.top} strokeWidth={14} strokeLinecap="round" fill="none" />
        <circle cx={89} cy={214} r={5.5} fill={skin} />
        <circle cx={111} cy={214} r={5.5} fill={skin} />

        <g transform="translate(100 124) rotate(-4)">
          <Head skin={skin} hair={hair} style={style} expression={expression} />
        </g>
      </g>
    </svg>
  )
}

function SleepingTwin({ skin, hair, style }: Omit<FigureProps, "outfit" | "expression">) {
  return (
    <svg viewBox="0 0 200 290" className="h-full w-full" role="img" aria-label="Your Twin asleep under a blanket">
      <rect x={14} y={236} width={176} height={24} rx={12} fill="#e2d7c7" />
      <rect x={14} y={230} width={176} height={14} rx={7} fill="#ece3d6" />
      <ellipse cx={54} cy={222} rx={36} ry={14} fill={CREAM} stroke="#ddd3c4" strokeWidth={1.2} />

      <g className="motion-safe:animate-twin-breathe" style={{ transformOrigin: "110px 236px", transformBox: "view-box" }}>
        <g transform="translate(58 196) rotate(-72) scale(0.86)">
          <Head skin={skin} hair={hair} style={style} expression="asleep" />
        </g>
        <path d="M70 214 Q92 186 128 190 Q170 194 186 222 L188 238 L66 238 Q62 226 70 214 Z" fill="#bfae9c" />
        <path d="M70 214 Q80 204 94 202 L100 238 L66 238 Q62 226 70 214 Z" fill="#d9cec1" />
        <g fill="none" stroke="#000" strokeOpacity={0.08} strokeWidth={1.2}>
          <path d="M112 196 Q116 216 114 238" />
          <path d="M140 196 Q146 216 144 238" />
          <path d="M166 206 Q172 222 170 238" />
        </g>
      </g>

      <g fill={INK} className="font-serif italic" opacity={0.55}>
        <text x={92} y={170} fontSize={16} className="motion-safe:animate-twin-zzz">z</text>
        <text x={106} y={150} fontSize={21} className="motion-safe:animate-twin-zzz [animation-delay:1.2s]">z</text>
        <text x={122} y={124} fontSize={27} className="motion-safe:animate-twin-zzz [animation-delay:2.4s]">z</text>
      </g>
    </svg>
  )
}

export type TwinPose = "standing" | "seated" | "asleep"

export function TwinAvatar({ config, outfit, pose, expression }: { config: AvatarConfig; outfit: Outfit; pose: TwinPose; expression: Expression }) {
  const skin = SKIN_TONES[config.skin].value
  const hair = HAIR_COLORS[config.hairColor].value
  if (pose === "asleep") return <SleepingTwin skin={skin} hair={hair} style={config.hair} />
  const props = { skin, hair, style: config.hair, outfit, expression }
  return pose === "seated" ? <SeatedTwin {...props} /> : <StandingTwin {...props} />
}

import { HAIR_COLORS, SKIN_TONES, type AvatarConfig, type Expression, type HairStyle, type Outfit } from "@/lib/twin"

const INK = "#2a2622"
const CREAM = "#f7f3ec"
const LIP = "#b5756a"
const BLUSH = "#c9826f"
const SHADE = "rgba(0,0,0,0.08)"

const CURL_BACK: [number, number][] = [
  [-30, -10], [-26, -26], [-14, -36], [0, -40], [14, -36], [26, -26], [30, -10], [-33, 6], [33, 6], [-30, 20], [30, 20],
]
const CURL_FRONT: [number, number, number][] = [
  [-20, -27, 10], [-6, -32, 10], [8, -32, 10], [21, -25, 9],
]

const FACE_PATH = "M-28 -2 Q-29 -32 0 -32 Q29 -32 28 -2 Q27 17 14 26 Q0 33 -14 26 Q-27 17 -28 -2 Z"

function HairBack({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "bob":
      return <path d="M-33 -4 Q-36 -41 0 -42 Q36 -41 33 -4 L34 20 Q22 28 14 18 L-14 18 Q-22 28 -34 20 Z" fill={color} />
    case "long":
      return (
        <path
          d="M-33 -6 Q-37 -42 0 -43 Q37 -42 33 -6 Q37 30 40 62 Q33 70 24 64 Q21 40 19 20 L-19 20 Q-21 40 -24 64 Q-33 70 -40 62 Q-37 30 -33 -6 Z"
          fill={color}
        />
      )
    case "bun":
      return <circle cx={0} cy={-39} r={14} fill={color} />
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
      return <path d="M-30 -6 Q-29 -38 2 -37 Q30 -36 30 -6 Q20 -26 2 -22 Q-16 -18 -30 -6 Z" fill={color} />
    case "long":
      return <path d="M-30 -2 Q-31 -39 4 -38 Q31 -36 30 0 Q22 -28 0 -27 Q-18 -25 -30 -2 Z" fill={color} />
    case "bun":
      return <path d="M-30 -4 Q-29 -37 0 -36 Q29 -37 30 -4 Q23 -26 0 -28 Q-23 -26 -30 -4 Z" fill={color} />
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

function OpenEye({ side }: { side: 1 | -1 }) {
  const x = 10 * side
  return (
    <g>
      <g className="motion-safe:animate-twin-blink" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <ellipse cx={x} cy={3.5} rx={3.3} ry={3.9} fill={INK} />
        <circle cx={x + 1.1 * side * -1 + 0.4} cy={2.2} r={1.1} fill={CREAM} />
      </g>
      <path
        d={`M${x - 5 * side} 1.2 Q${x} -2.8 ${x + 5 * side} 0.6 L${x + 7 * side} -1.4`}
        stroke={INK}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  )
}

function ClosedEye({ side, soft }: { side: 1 | -1; soft: boolean }) {
  const x = 10 * side
  return (
    <g stroke={INK} strokeLinecap="round" fill="none">
      <path d={`M${x - 5 * side} ${soft ? 3 : 3.5} Q${x} ${soft ? 6.8 : 7} ${x + 5 * side} ${soft ? 3 : 3.5}`} strokeWidth={1.5} />
      <path d={`M${x + 4 * side} 4.6 L${x + 6.5 * side} 6.4`} strokeWidth={1.1} />
      <path d={`M${x + 1.5 * side} 6 L${x + 2.5 * side} 8.2`} strokeWidth={1} />
    </g>
  )
}

function Face({ expression }: { expression: Expression }) {
  const awake = expression === "focused"
  return (
    <>
      <g stroke={INK} strokeLinecap="round" fill="none" opacity={0.55}>
        <path d={awake ? "M-16.5 -8 Q-11 -12.5 -5 -10.5" : "M-16 -6.5 Q-11 -9.5 -5.5 -8.5"} strokeWidth={1.4} />
        <path d={awake ? "M5 -10.5 Q11 -12.5 16.5 -8" : "M5.5 -8.5 Q11 -9.5 16 -6.5"} strokeWidth={1.4} />
        <path d="M0.5 5 Q-1.6 9.5 1 10" strokeWidth={1.1} opacity={0.6} />
      </g>
      {awake ? (
        <>
          <OpenEye side={-1} />
          <OpenEye side={1} />
        </>
      ) : (
        <>
          <ClosedEye side={-1} soft={expression === "sleepy"} />
          <ClosedEye side={1} soft={expression === "sleepy"} />
        </>
      )}
      {expression === "asleep" ? (
        <ellipse cx={0} cy={15.5} rx={2} ry={1.7} fill={LIP} opacity={0.8} />
      ) : (
        <path d={awake ? "M-6 13.6 Q0 19 6.4 13 Q0 15.4 -6 13.6 Z" : "M-4.8 14 Q0 17.4 4.8 14 Q0 15.2 -4.8 14 Z"} fill={LIP} />
      )}
      <ellipse cx={-17} cy={11} rx={5} ry={3.4} fill={BLUSH} opacity={0.24} />
      <ellipse cx={17} cy={11} rx={5} ry={3.4} fill={BLUSH} opacity={0.24} />
    </>
  )
}

function HeadFront({ skin, hair, style, expression }: { skin: string; hair: string; style: HairStyle; expression: Expression }) {
  return (
    <>
      <path d={FACE_PATH} fill={skin} />
      <HairFront style={style} color={hair} />
      <Face expression={expression} />
    </>
  )
}

function Head(props: { skin: string; hair: string; style: HairStyle; expression: Expression }) {
  return (
    <>
      <HairBack style={props.style} color={props.hair} />
      <HeadFront {...props} />
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

const LEGS = {
  left: "M86 170 Q84.5 220 89 260 L95.5 260 Q97 220 99.5 176 Z",
  right: "M114 170 Q115.5 220 111 260 L104.5 260 Q103 220 100.5 176 Z",
}

function BareLegs({ skin }: { skin: string }) {
  return (
    <g fill={skin}>
      <path d={LEGS.left} />
      <path d={LEGS.right} />
    </g>
  )
}

function Heels({ color = INK }: { color?: string }) {
  return (
    <g fill={color} stroke={color} strokeLinecap="round">
      <path d="M88.5 259 L96 259 Q97.5 265 94 267 L82 268 Q82.5 263 88.5 259 Z" strokeWidth={0.6} />
      <path d="M95 264 L95.8 273" strokeWidth={1.6} fill="none" />
      <path d="M111.5 259 L104 259 Q102.5 265 106 267 L118 268 Q117.5 263 111.5 259 Z" strokeWidth={0.6} />
      <path d="M105 264 L104.2 273" strokeWidth={1.6} fill="none" />
    </g>
  )
}

function Sneakers() {
  return (
    <g stroke={INK} strokeWidth={1.1} strokeLinejoin="round">
      <path d="M84 258 L98 258 L99 268 Q99 272 94 272 L78 272 Q74 272 75 267 Q77 261 84 258 Z" fill={CREAM} />
      <path d="M75 268 L99 268" fill="none" />
      <path d="M116 258 L102 258 L101 268 Q101 272 106 272 L122 272 Q126 272 125 267 Q123 261 116 258 Z" fill={CREAM} />
      <path d="M125 268 L101 268" fill="none" />
    </g>
  )
}

function Arm({ d, skin, sleeve, sleeveWidth = 11, sleeveDash }: { d: string; skin: string; sleeve?: string; sleeveWidth?: number; sleeveDash?: string }) {
  return (
    <>
      <path d={d} stroke={skin} strokeWidth={8} strokeLinecap="round" fill="none" />
      {sleeve ? <path d={d} stroke={sleeve} strokeWidth={sleeveWidth} strokeLinecap="round" fill="none" strokeDasharray={sleeveDash} pathLength={100} /> : null}
    </>
  )
}

function ChicOutfit({ skin, outfit }: { skin: string; outfit: Outfit }) {
  return (
    <>
      <BareLegs skin={skin} />
      <Heels color="#8f6e62" />
      <Arm d="M78 103 Q69 132 72 160" skin={skin} sleeve={outfit.top} sleeveDash="22 100" />
      <path d="M84 146 L116 146 Q133 176 140 208 Q100 218 60 208 Q67 176 84 146 Z" fill={outfit.bottom} />
      <path d="M86 150 L114 150 Q127 178 132 204 Q100 211 68 204 Q73 178 86 150 Z" fill={CREAM} opacity={0.22} />
      <path d="M60 208 Q66 212 72 209 Q78 214 86 210 Q93 215 100 211 Q107 215 114 210 Q122 214 128 209 Q134 212 140 208" stroke={outfit.bottom} strokeWidth={3} fill="none" strokeLinecap="round" />
      <g stroke={SHADE} strokeWidth={1}>
        <path d="M92 152 L84 206" />
        <path d="M100 152 L100 210" />
        <path d="M108 152 L116 206" />
      </g>
      <path d="M79 101 Q100 94 121 101 L118 126 Q116 138 115 147 L85 147 Q84 138 82 126 Z" fill={outfit.top} />
      <path d="M92 97 Q100 103 108 97" stroke={SHADE} strokeWidth={1.4} fill="none" />
      <rect x={84} y={143} width={32} height={5} rx={2} fill={INK} />
      <rect x={98} y={143.5} width={4} height={4} rx={1} fill="#c7a878" />
      <Arm d="M122 103 Q138 125 116 146" skin={skin} sleeve={outfit.top} sleeveDash="22 100" />
      <path d="M72 158 L64 132" stroke={INK} strokeWidth={0.9} fill="none" />
      <rect x={60} y={156} width={22} height={11} rx={4} fill="#8f6e62" />
      <circle cx={72} cy={159} r={4.5} fill={skin} />
    </>
  )
}

function SportyOutfit({ skin, outfit }: { skin: string; outfit: Outfit }) {
  return (
    <>
      <path d="M86 146 L114 146 Q115 200 121 258 L104 259 Q102 210 100 176 Q98 210 96 259 L79 258 Q85 200 86 146 Z" fill={outfit.bottom} />
      <Sneakers />
      <path d="M84 128 L116 128 L114.5 148 L85.5 148 Z" fill={skin} />
      <Arm d="M78 103 Q70 130 73 158" skin={skin} />
      <path d="M82 101 Q100 95 118 101 L116 130 Q100 134 84 130 Z" fill={outfit.top} />
      <path d="M92 97 Q100 106 108 97" stroke={SHADE} strokeWidth={1.4} fill="none" />
      <path d="M85 125 Q100 129 115 125" stroke={SHADE} strokeWidth={1.2} fill="none" />
      <path d="M82 146 Q100 154 118 146 L120 156 Q100 164 80 156 Z" fill="#6e7a60" />
      <path d="M96 154 Q90 172 84 184 M104 154 Q108 170 114 182" stroke="#6e7a60" strokeWidth={7} strokeLinecap="round" fill="none" />
      <circle cx={100} cy={155} r={4} fill="#5f6a52" />
      <Arm d="M122 103 Q141 92 147 68" skin={skin} />
      <circle cx={148} cy={64} r={4.8} fill={skin} />
      <rect x={68} y={154} width={9} height={20} rx={3.5} fill={CREAM} stroke={INK} strokeWidth={1} />
      <circle cx={73} cy={160} r={4.5} fill={skin} />
    </>
  )
}

function StreetOutfit({ skin, outfit }: { skin: string; outfit: Outfit }) {
  return (
    <>
      <path d="M82 148 L118 148 Q126 200 130 260 L104 262 L100 180 L96 262 L70 260 Q74 200 82 148 Z" fill={outfit.bottom} />
      <g fill="none" stroke={SHADE} strokeWidth={1.2}>
        <rect x={74} y={206} width={13} height={15} rx={2} />
        <rect x={113} y={206} width={13} height={15} rx={2} />
        <path d="M100 180 L100 262" />
      </g>
      <g stroke={INK} strokeWidth={1.1} strokeLinejoin="round">
        <path d="M68 258 L98 258 L98 272 L66 272 Q64 264 68 258 Z" fill={CREAM} />
        <path d="M132 258 L102 258 L102 272 L134 272 Q136 264 132 258 Z" fill={CREAM} />
        <path d="M66 267 L98 267 M102 267 L134 267" fill="none" />
      </g>
      <path d="M84 100 Q100 95 116 100 L114 146 L86 146 Z" fill="#e6dacA" />
      <path d="M86 146 L114 146 L114 150 L86 150 Z" fill={skin} />
      <path d="M72 100 Q86 94 93 100 L93 132 L91 172 L66 170 Q62 132 72 100 Z" fill={outfit.top} />
      <path d="M128 100 Q114 94 107 100 L107 132 L109 172 L134 170 Q138 132 128 100 Z" fill={outfit.top} />
      <path d="M93 100 L86 124 L93 128" stroke="#000" strokeOpacity={0.25} strokeWidth={1.3} fill="none" />
      <path d="M107 100 L114 124 L107 128" stroke="#000" strokeOpacity={0.25} strokeWidth={1.3} fill="none" />
      <path d="M72 104 Q60 136 70 168" stroke={outfit.top} strokeWidth={15} strokeLinecap="round" fill="none" />
      <path d="M128 104 Q140 136 130 168" stroke={outfit.top} strokeWidth={15} strokeLinecap="round" fill="none" />
      <g stroke={CREAM} strokeOpacity={0.35} strokeWidth={1} fill="none">
        <path d="M70 158 L78 164 M130 158 L122 164" />
      </g>
    </>
  )
}

function BusinessOutfit({ skin, outfit }: { skin: string; outfit: Outfit }) {
  return (
    <>
      <BareLegs skin={skin} />
      <Heels />
      <path d="M83 170 L117 170 L116 202 L84 202 Z" fill={outfit.bottom} />
      <Arm d="M77 104 Q66 134 70 164" skin={skin} sleeve={outfit.top} sleeveWidth={13} sleeveDash="84 100" />
      <path d="M74 100 Q100 91 126 100 L130 178 Q100 184 70 178 Z" fill={outfit.top} />
      <path d="M90 98 L100 136 L110 98 Q100 95 90 98 Z" fill={CREAM} />
      <g fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={1.3} strokeLinejoin="round">
        <path d="M88 98 L83 122 L91 126 L100 146" />
        <path d="M112 98 L117 122 L109 126 L100 146" />
        <path d="M78 152 L90 152 M110 152 L122 152" />
      </g>
      <path d="M72 146 Q100 154 128 146 L128 152 Q100 160 72 152 Z" fill="#8f6a4d" />
      <circle cx={100} cy={153} r={2.4} fill="#c7a878" />
      <Arm d="M123 104 Q136 134 132 164" skin={skin} sleeve={outfit.top} sleeveWidth={13} sleeveDash="84 100" />
      <path d="M126 170 L152 170 L150 204 L128 204 Z" fill={INK} />
      <path d="M133 170 Q139 158 145 170" fill="none" stroke={INK} strokeWidth={2} />
      <circle cx={70} cy={168} r={4.5} fill={skin} />
      <circle cx={132} cy={168} r={4.5} fill={skin} />
    </>
  )
}

function StandingTwin({ skin, hair, style, outfit, expression }: FigureProps) {
  return (
    <svg viewBox="0 0 200 290" className="h-full w-full" role="img" aria-label={`Your Twin wearing ${outfit.label}`}>
      <g transform="translate(100 58)">
        <HairBack style={style} color={hair} />
      </g>
      <path d="M95 80 Q94.5 92 93 100 L107 100 Q105.5 92 105 80 Z" fill={skin} />
      <path d="M95 88 Q100 92 105 88 L105 84 Q100 88 95 84 Z" fill="#000" opacity={0.06} />
      {outfit.kind === "sporty" ? <SportyOutfit skin={skin} outfit={outfit} /> : null}
      {outfit.kind === "street" ? <StreetOutfit skin={skin} outfit={outfit} /> : null}
      {outfit.kind === "business" ? <BusinessOutfit skin={skin} outfit={outfit} /> : null}
      {outfit.kind === "chic" ? <ChicOutfit skin={skin} outfit={outfit} /> : null}
      <g transform="translate(100 58) rotate(-3)">
        <HeadFront skin={skin} hair={hair} style={style} expression={expression} />
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
        <g transform="translate(100 122) rotate(-6)">
          <HairBack style={style} color={hair} />
        </g>
        <path d="M44 248 Q54 220 100 226 Q146 220 156 248 Q128 260 100 253 Q72 260 44 248 Z" fill={outfit.bottom} />
        <path d="M70 236 Q84 232 96 240 M130 236 Q116 232 104 240" stroke={SHADE} strokeWidth={1.2} fill="none" />
        <ellipse cx={58} cy={250} rx={11} ry={6} fill="#f4eee6" />
        <ellipse cx={142} cy={250} rx={11} ry={6} fill="#f4eee6" />
        <g stroke="#e6dccf" strokeWidth={1} fill="none">
          <path d="M50 248 Q52 244 56 246 M62 247 Q64 243 67 246 M134 246 Q137 243 139 247 M145 246 Q148 244 150 248" />
        </g>

        <path d="M95 142 L94 162 L106 162 L105 142 Z" fill={skin} />
        <path d="M62 174 Q100 158 138 174 L144 234 Q100 244 56 234 Z" fill={outfit.top} />
        <path d="M60 226 Q100 236 140 226 L144 236 Q100 246 56 236 Z" fill="#000" opacity={0.07} />
        <path d="M74 162 Q100 150 126 162 Q121 180 100 182 Q79 180 74 162 Z" fill={outfit.top} />
        <path d="M74 162 Q100 150 126 162 Q121 180 100 182 Q79 180 74 162 Z" fill="#000" opacity={0.08} />
        <g stroke="#f4eee6" strokeWidth={1.4} strokeLinecap="round">
          <path d="M94 178 L93 198" />
          <path d="M106 178 L107 198" />
        </g>

        <g stroke={INK} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.5}>
          <path d="M95 196 Q92 190 95 184" className="motion-safe:animate-twin-steam" />
          <path d="M104 196 Q107 189 104 182" className="motion-safe:animate-twin-steam [animation-delay:1.4s]" />
        </g>
        <rect x={89} y={200} width={22} height={19} rx={5} fill={CREAM} stroke={INK} strokeWidth={1.2} />
        <path d="M111 204 Q118 205 117 210 Q116 214 111 214" fill="none" stroke={INK} strokeWidth={1.2} />

        <path d="M66 180 Q50 210 86 216" stroke={outfit.top} strokeWidth={15} strokeLinecap="round" fill="none" />
        <path d="M134 180 Q150 210 114 216" stroke={outfit.top} strokeWidth={15} strokeLinecap="round" fill="none" />
        <circle cx={89} cy={214} r={5} fill={skin} />
        <circle cx={111} cy={214} r={5} fill={skin} />

        <g transform="translate(100 122) rotate(-6)">
          <HeadFront skin={skin} hair={hair} style={style} expression={expression} />
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

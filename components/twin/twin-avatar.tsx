import { HAIR_COLORS, SKIN_TONES, type AvatarConfig, type HairStyle, type Outfit } from "@/lib/twin"

const INK = "#2a2622"

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
      return <path d="M-34 -6 Q-38 -41 0 -42 Q38 -41 34 -6 L39 62 Q20 70 0 62 Q-20 70 -39 62 Z" fill={color} />
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

function Head({ skin, hair, style, resting }: { skin: string; hair: string; style: HairStyle; resting: boolean }) {
  return (
    <>
      <HairBack style={style} color={hair} />
      <circle cx={0} cy={0} r={30} fill={skin} />
      <HairFront style={style} color={hair} />
      <g stroke={INK} strokeLinecap="round" fill="none">
        <path d="M-15 -6 Q-11 -8 -6 -6.5" strokeWidth={1.3} opacity={0.55} />
        <path d="M6 -6.5 Q11 -8 15 -6" strokeWidth={1.3} opacity={0.55} />
        {resting ? (
          <>
            <path d="M-14 3 Q-10 6.5 -6 3" strokeWidth={1.6} />
            <path d="M6 3 Q10 6.5 14 3" strokeWidth={1.6} />
          </>
        ) : null}
        <path d={resting ? "M-4 14 Q0 16 4 14" : "M-5 13 Q0 18 5 13"} strokeWidth={1.6} />
      </g>
      {!resting ? (
        <g fill={INK}>
          <circle cx={-10} cy={3} r={2.3} />
          <circle cx={10} cy={3} r={2.3} />
        </g>
      ) : null}
      <circle cx={-17} cy={10} r={4.5} fill="#c9826f" opacity={0.22} />
      <circle cx={17} cy={10} r={4.5} fill="#c9826f" opacity={0.22} />
    </>
  )
}

function StandingTwin({ skin, hair, style, outfit }: { skin: string; hair: string; style: HairStyle; outfit: Outfit }) {
  const active = outfit.kind === "active"
  return (
    <svg viewBox="0 0 200 290" className="h-full w-full" role="img" aria-label={`Your Twin wearing ${outfit.label}`}>
      <rect x={93} y={86} width={14} height={20} rx={6} fill={skin} />
      {active ? (
        <>
          <path d="M84 162 L116 162 L120 182 L118 270 L106 270 L100 196 L94 270 L82 270 L80 182 Z" fill={outfit.bottom} />
          <rect x={80} y={146} width={40} height={20} rx={4} fill={skin} />
          <path d="M76 108 Q100 99 124 108 L121 150 L79 150 Z" fill={outfit.top} />
          <path d="M84 150 L116 150" stroke="#000" strokeOpacity={0.12} strokeWidth={2} />
          <path d="M78 112 Q64 140 67 172" stroke={skin} strokeWidth={11} strokeLinecap="round" fill="none" />
          <path d="M122 112 Q142 98 150 72" stroke={skin} strokeWidth={11} strokeLinecap="round" fill="none" />
          <ellipse cx={88} cy={274} rx={11} ry={5.5} fill="#f7f3ec" stroke={INK} strokeWidth={1.2} />
          <ellipse cx={112} cy={274} rx={11} ry={5.5} fill="#f7f3ec" stroke={INK} strokeWidth={1.2} />
        </>
      ) : (
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
      )}
      {active ? <circle cx={151} cy={68} r={6} fill={skin} /> : null}
      <g transform="translate(100 62)">
        <Head skin={skin} hair={hair} style={style} resting={false} />
      </g>
    </svg>
  )
}

function SeatedTwin({ skin, hair, style, outfit }: { skin: string; hair: string; style: HairStyle; outfit: Outfit }) {
  return (
    <svg viewBox="0 0 200 290" className="h-full w-full" role="img" aria-label={`Your Twin resting on a cushion in ${outfit.label}`}>
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
        <rect x={89} y={200} width={22} height={19} rx={4} fill="#f7f3ec" stroke={INK} strokeWidth={1.2} />
        <path d="M111 204 Q118 205 117 210 Q116 214 111 214" fill="none" stroke={INK} strokeWidth={1.2} />

        <path d="M69 178 Q54 208 86 216" stroke={outfit.top} strokeWidth={14} strokeLinecap="round" fill="none" />
        <path d="M131 178 Q146 208 114 216" stroke={outfit.top} strokeWidth={14} strokeLinecap="round" fill="none" />
        <circle cx={89} cy={214} r={5.5} fill={skin} />
        <circle cx={111} cy={214} r={5.5} fill={skin} />

        <g transform="translate(100 124) rotate(-4)">
          <Head skin={skin} hair={hair} style={style} resting />
        </g>
      </g>
    </svg>
  )
}

export function TwinAvatar({ config, outfit }: { config: AvatarConfig; outfit: Outfit }) {
  const skin = SKIN_TONES[config.skin].value
  const hair = HAIR_COLORS[config.hairColor].value
  const props = { skin, hair, style: config.hair, outfit }
  return outfit.kind === "lounge" ? <SeatedTwin {...props} /> : <StandingTwin {...props} />
}

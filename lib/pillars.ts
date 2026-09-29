import { addDays, parseISODate, toISODate, type AccessoryId } from "./twin"

export type { AccessoryId }
export type PillarId = "brainFog" | "vault" | "tax" | "hyperfocus"

export const SCRATCH_COST = 5
export const DUPLICATE_REFUND = 2

export const ACCESSORIES: { id: AccessoryId; name: string; rarity: "Rare" | "Very rare" }[] = [
  { id: "sunglasses", name: "Riviera sunnies", rarity: "Rare" },
  { id: "pearls", name: "Pearl drops", rarity: "Rare" },
  { id: "bow", name: "Silk hair bow", rarity: "Rare" },
  { id: "crown", name: "Tiny gold crown", rarity: "Very rare" },
]

export function accessoryName(id: AccessoryId) {
  return ACCESSORIES.find((a) => a.id === id)?.name ?? id
}

export function drawAccessory(owned: AccessoryId[], random: () => number = Math.random) {
  const unowned = ACCESSORIES.filter((a) => !owned.includes(a.id))
  const pool = unowned.length ? unowned : ACCESSORIES
  const weighted = pool.flatMap((a) => (a.rarity === "Very rare" ? [a] : [a, a, a]))
  const pick = weighted[Math.floor(random() * weighted.length)]
  return { id: pick.id, duplicate: unowned.length === 0 }
}

export type TaxKind = "food" | "trial" | "return" | "bill" | "other"

export interface TaxItem {
  id: string
  note: string
  label: string
  kind: TaxKind
  createdISO: string
  dueISO: string
}

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fourteen: 14, thirty: 30,
}

const UNIT_DAYS: Record<string, number> = { day: 1, week: 7, month: 30 }

const TIME_PHRASE =
  /\b(in\s+)?(\d+|an?|one|two|three|four|five|six|seven|eight|nine|ten|fourteen|thirty)\s*(day|week|month)s?\b|\b(tomorrow|tonight|today|next week|next month)\b/gi

const FOODS: [RegExp, string | null, number][] = [
  [/avocados?/i, "Avocados", 3],
  [/bananas?/i, "Bananas", 4],
  [/(straw|rasp|blue|black)?berr(y|ies)/i, "Berries", 3],
  [/spinach|lettuce|salad|rocket|arugula/i, "Salad leaves", 4],
  [/coriander|cilantro|basil|parsley|herbs/i, "Fresh herbs", 4],
  [/tomato(es)?/i, "Tomatoes", 5],
  [/salmon|fish|chicken|mince|steak/i, null, 2],
  [/milk/i, "Milk", 6],
  [/bread|sourdough/i, "Bread", 5],
  [/yog(h)?urt/i, "Yogurt", 7],
  [/cheese/i, "Cheese", 10],
]

const ADVICE: Record<TaxKind, string> = {
  food: "Guac tonight, or halve and freeze. Future us says thanks.",
  trial: "If it's a no, cancel now while we remember. We'll nudge the day before.",
  return: "Bag it and leave it by the door so we trip over it on the way out.",
  bill: "A two-minute job. Let's pay it while it's fresh.",
  other: "Pop it on today's list if we have a spare five minutes.",
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function parseDays(note: string): number | null {
  const m = note.match(/(\d+|an?|one|two|three|four|five|six|seven|eight|nine|ten|fourteen|thirty)\s*(day|week|month)s?\b/i)
  if (m) {
    const n = /^\d+$/.test(m[1]) ? Number.parseInt(m[1], 10) : NUMBER_WORDS[m[1].toLowerCase()]
    return n * UNIT_DAYS[m[2].toLowerCase()]
  }
  if (/\btomorrow\b/i.test(note)) return 1
  if (/\bnext week\b/i.test(note)) return 7
  if (/\bnext month\b/i.test(note)) return 30
  return null
}

function cleanLabel(note: string, extra: RegExp) {
  const cleaned = note
    .replace(TIME_PHRASE, " ")
    .replace(extra, " ")
    .replace(/\b(bought|got|picked up|ends?|due|expires?|renews?|by|on|in|is|are)\b/gi, " ")
    .replace(/[.,!?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(my|the|our|a|an)\s+/i, "")
  const label = capitalize(cleaned || note.trim())
  return label.length > 42 ? `${label.slice(0, 40).trim()}…` : label
}

function detectKind(note: string): TaxKind {
  if (/trial|subscription|membership|free month/i.test(note)) return "trial"
  if (/\breturn|refund|exchange|library/i.test(note)) return "return"
  if (/\bbill|rent|invoice|tax\b|renew|payment|parking|fine\b|insurance|pay\b/i.test(note)) return "bill"
  if (FOODS.some(([re]) => re.test(note))) return "food"
  return "other"
}

export function parseTaxNote(note: string, today: Date): Omit<TaxItem, "id"> {
  const kind = detectKind(note)
  let label: string
  let defaultDays: number

  if (kind === "food") {
    const [re, name, days] = FOODS.find(([r]) => r.test(note))!
    label = name ?? capitalize(note.match(re)![0].toLowerCase())
    defaultDays = days
  } else if (kind === "trial") {
    const m = note.match(/((?:[a-z]+\s+){0,2})(free\s+)?(trial|subscription|membership)/i)
    label = capitalize((m ? m[0] : "Free trial").trim().replace(/^(my|the|our|a|an)\s+/i, ""))
    defaultDays = 7
  } else if (kind === "return") {
    label = cleanLabel(note, /\b(return|refund|exchange)\b/gi)
    defaultDays = /library/i.test(note) ? 14 : 30
  } else if (kind === "bill") {
    label = cleanLabel(note, /\b(pay)\b/gi)
    defaultDays = 7
  } else {
    label = cleanLabel(note, /$^/)
    defaultDays = 7
  }

  const days = parseDays(note) ?? defaultDays
  return { note, label, kind, createdISO: toISODate(today), dueISO: toISODate(addDays(today, days)) }
}

export function daysUntil(iso: string, today: Date) {
  return Math.round((parseISODate(iso).getTime() - parseISODate(toISODate(today)).getTime()) / 86_400_000)
}

export function taxHeadline(item: Pick<TaxItem, "label" | "kind">, daysLeft: number) {
  const when = daysLeft <= 0 ? "today" : daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`
  switch (item.kind) {
    case "food":
      return `${item.label} turning to sludge ${when}`
    case "trial":
      return `${item.label} starts charging ${when}`
    case "return":
      return `${item.label} return window closes ${when}`
    case "bill":
      return `${item.label} due ${when}`
    default:
      return `${item.label} needs us ${when}`
  }
}

export function taxAdvice(kind: TaxKind) {
  return ADVICE[kind]
}

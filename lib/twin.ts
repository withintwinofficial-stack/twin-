export type PhaseId = "menstrual" | "follicular" | "ovulatory" | "luteal"
export type Effort = "light" | "deep"

export interface Task {
  id: string
  title: string
  dueDate: string
  effort: Effort
  done: boolean
  plannedToday: boolean
}

export interface AvatarConfig {
  skin: number
  hair: HairStyle
  hairColor: number
}

export type HairStyle = "bob" | "long" | "bun" | "curly"

export interface Phase {
  id: PhaseId
  name: string
  start: number
  end: number
  energy: "high" | "low"
  mantra: string
  science: string
  color: string
}

export const CYCLE_LENGTH = 28

export const PHASES: Phase[] = [
  {
    id: "menstrual",
    name: "Menstrual",
    start: 1,
    end: 5,
    energy: "low",
    mantra: "Rest is productive.",
    science:
      "Estrogen and progesterone are at their lowest. Dopamine signaling is muted, so reduce context-switching and protect recovery.",
    color: "var(--phase-menstrual)",
  },
  {
    id: "follicular",
    name: "Follicular",
    start: 6,
    end: 13,
    energy: "high",
    mantra: "Plan boldly, start things.",
    science:
      "Rising estrogen heightens dopamine sensitivity. Novelty, planning and initiating tasks feel noticeably easier.",
    color: "var(--phase-follicular)",
  },
  {
    id: "ovulatory",
    name: "Ovulatory",
    start: 14,
    end: 16,
    energy: "high",
    mantra: "Speak up, ship it.",
    science:
      "Estrogen and LH peak together. Verbal fluency, confidence and social energy reach their monthly high.",
    color: "var(--phase-ovulatory)",
  },
  {
    id: "luteal",
    name: "Luteal",
    start: 17,
    end: 28,
    energy: "low",
    mantra: "Finish, don't start.",
    science:
      "Progesterone rises as estrogen falls, lowering dopamine tone. ADHD symptoms often intensify — lean on structure and body-doubling.",
    color: "var(--phase-luteal)",
  },
]

export function normalizeDay(day: number) {
  return ((((day - 1) % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH) + 1
}

export function getPhase(day: number): Phase {
  const d = normalizeDay(day)
  return PHASES.find((p) => d >= p.start && d <= p.end) ?? PHASES[0]
}

function daysUntil(currentDay: number, predicate: (p: Phase) => boolean) {
  for (let offset = 0; offset <= CYCLE_LENGTH; offset++) {
    if (predicate(getPhase(currentDay + offset))) return offset
  }
  return CYCLE_LENGTH
}

const gauss = (x: number, mean: number, sd: number) =>
  Math.exp(-((x - mean) ** 2) / (2 * sd ** 2))

export const hormones = {
  estrogen: (d: number) => 0.12 + 0.78 * gauss(d, 13, 3) + 0.32 * gauss(d, 21, 3.5),
  progesterone: (d: number) => 0.06 + 0.8 * gauss(d, 21, 3.2),
  lh: (d: number) => 0.04 + 0.86 * gauss(d, 14, 0.9),
}

export function energyScore(day: number) {
  const d = normalizeDay(day)
  const raw = 0.35 + 0.6 * gauss(d, 13, 4.5) - 0.25 * gauss(d, 24, 3) - (d <= 3 ? 0.15 : 0)
  return Math.round(Math.min(1, Math.max(0.08, raw)) * 100)
}

/* ---------- Dates ---------- */

export function parseISODate(iso: string) {
  return new Date(`${iso}T12:00:00`)
}

export function toISODate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function diffDays(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

export function createSeedTasks(today: Date): Task[] {
  const due = (n: number) => toISODate(addDays(today, n))
  return [
    { id: "t1", title: "Quarterly tax filing", dueDate: due(10), effort: "deep", done: false, plannedToday: false },
    { id: "t2", title: "Grant proposal draft", dueDate: due(6), effort: "deep", done: false, plannedToday: false },
    { id: "t3", title: "Reply to landlord email", dueDate: due(1), effort: "light", done: false, plannedToday: false },
    { id: "t4", title: "Book dentist appointment", dueDate: due(3), effort: "light", done: true, plannedToday: false },
    { id: "t5", title: "Portfolio refresh", dueDate: due(18), effort: "deep", done: false, plannedToday: false },
  ]
}

/* ---------- Hormone-aware reminder engine ---------- */

export type Severity = "urgent" | "advise" | "calm"

export interface BioReminder {
  taskId: string
  taskTitle: string
  severity: Severity
  lead: string
  body: string
  insight: string
  dueIn: number
  phaseAtDue: Phase
  energyAtDue: number
}

function dueLabel(n: number) {
  if (n < 0) return `was due ${Math.abs(n)} day${n === -1 ? "" : "s"} ago`
  if (n === 0) return "is due today"
  if (n === 1) return "is due tomorrow"
  return `is due in ${n} days`
}

function whenLabel(n: number) {
  if (n <= 1) return "tomorrow"
  if (n <= 6) return "later this week"
  return `in ${n} days`
}

const severityRank: Record<Severity, number> = { urgent: 0, advise: 1, calm: 2 }

export function generateBioReminders(tasks: Task[], cycleDay: number, today: Date): BioReminder[] {
  const current = getPhase(cycleDay)

  return tasks
    .filter((t) => !t.done)
    .map((task): BioReminder => {
      const dueIn = diffDays(today, parseISODate(task.dueDate))
      const phaseAtDue = getPhase(cycleDay + Math.max(0, dueIn))
      const energyAtDue = energyScore(cycleDay + Math.max(0, dueIn))
      const lead = `Your ${task.title} ${dueLabel(dueIn)}.`
      const base = { taskId: task.id, taskTitle: task.title, lead, dueIn, phaseAtDue, energyAtDue }

      if (dueIn < 0) {
        return {
          ...base,
          severity: "urgent",
          body: "No shame spiral needed — pick the smallest next step and give it 10 minutes right now.",
          insight: "Overdue tasks raise cortisol; a tiny win restores dopamine momentum.",
        }
      }

      if (current.energy === "high") {
        const lowIn = daysUntil(cycleDay, (p) => p.energy === "low")
        const lowPhase = getPhase(cycleDay + lowIn)
        const recoverIn = lowIn + daysUntil(cycleDay + lowIn, (p) => p.energy === "high")
        if (lowIn <= dueIn && dueIn >= recoverIn + 2) {
          return {
            ...base,
            severity: "advise",
            body: `Your energy will dip ${whenLabel(lowIn)} but lifts again before the deadline. Sketch the outline now, so low-energy you only has to polish.`,
            insight: "Front-loading the thinking while estrogen is high makes the luteal stretch feel like maintenance, not a climb.",
          }
        }
        if (lowIn <= dueIn) {
          return {
            ...base,
            severity: task.effort === "deep" ? "urgent" : "advise",
            body: `Let's tackle it today before your cycle enters its low-energy ${lowPhase.name.toLowerCase()} phase ${whenLabel(lowIn)} and focus becomes more difficult.`,
            insight: `Estrogen is ${current.id === "ovulatory" ? "peaking" : "climbing"} now — executive function is at its monthly best for ${lowIn} more day${lowIn === 1 ? "" : "s"}.`,
          }
        }
        return {
          ...base,
          severity: "calm",
          body: "It lands comfortably inside your high-energy window. Ride the momentum while starting feels easy.",
          insight: "Rising dopamine sensitivity makes initiation less effortful this week.",
        }
      }

      const highIn = daysUntil(cycleDay, (p) => p.energy === "high")
      if (task.effort === "deep" && highIn < dueIn && dueIn - highIn >= 2) {
        const target = addDays(today, highIn).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
        return {
          ...base,
          severity: "advise",
          body: `Your follicular lift returns ${whenLabel(highIn)}. Protect today for rest and pencil the deep work in for ${target}.`,
          insight: "Lower dopamine tone in this phase makes heavy initiation feel uphill — timing it later is strategy, not avoidance.",
        }
      }
      return {
        ...base,
        severity: task.effort === "deep" || dueIn <= 2 ? "urgent" : "advise",
        body: "Energy is naturally lower right now. Try 15-minute sprints with a body double — progress over perfection.",
        insight: "Progesterone dampens focus; short, externally-structured bursts work with your biology.",
      }
    })
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || a.dueIn - b.dueIn)
}

/* ---------- Avatar ---------- */

export const SKIN_TONES = [
  { name: "Porcelain", value: "#F1D9C6" },
  { name: "Honey", value: "#D2A27E" },
  { name: "Umber", value: "#8C5A3F" },
]

export const HAIR_STYLES: { id: HairStyle; name: string }[] = [
  { id: "bob", name: "Bob" },
  { id: "long", name: "Long" },
  { id: "bun", name: "Bun" },
  { id: "curly", name: "Curls" },
]

export const HAIR_COLORS = [
  { name: "Espresso", value: "#2E2521" },
  { name: "Chestnut", value: "#6B4431" },
  { name: "Honey blonde", value: "#C49A62" },
  { name: "Copper", value: "#9C4F2E" },
]

export const DEFAULT_AVATAR: AvatarConfig = { skin: 1, hair: "bob", hairColor: 0 }

export interface Outfit {
  kind: "casual" | "active" | "lounge"
  label: string
  top: string
  bottom: string
  mood: string
}

export const OUTFITS: Record<PhaseId, Outfit> = {
  follicular: {
    kind: "casual",
    label: "Chic casual · knit & wide-leg trousers",
    top: "#E6DACA",
    bottom: "#3A3530",
    mood: "Light, curious and ready to start things.",
  },
  ovulatory: {
    kind: "active",
    label: "Activewear · sculpt set",
    top: "#8A9679",
    bottom: "#2E2A27",
    mood: "Buzzing with energy — let's move.",
  },
  luteal: {
    kind: "lounge",
    label: "Loungewear · oat hoodie & sweats",
    top: "#BBA999",
    bottom: "#D9CEC1",
    mood: "Slowing down with you. Rest counts.",
  },
  menstrual: {
    kind: "lounge",
    label: "Loungewear · rosewood hoodie & sweats",
    top: "#A07F77",
    bottom: "#D5C6BB",
    mood: "Cozy, quiet, and gentle today.",
  },
}

export const QUOTES = [
  "My brain has forty tabs open, and one of them is playing music I can't find.",
  "I don't procrastinate. I simply wait for the adrenaline of the deadline to become my project manager.",
  "Object permanence: if I can't see it, it has entered witness protection.",
  "I have two speeds: hyperfocused on the wrong thing, and lying on the floor.",
  "\u201CFive more minutes\u201D is a unit of time with no fixed value.",
  "Today's plan: do one thing. Reality: reorganize the spice rack by emotional resonance.",
  "I'm not late. I'm running on a custom time zone called \u201Coptimistic.\u201D",
]

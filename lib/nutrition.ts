import { CYCLE_LENGTH, normalizeDay } from "@/lib/twin"

export interface Food {
  name: string
  why: string
  nutrient: string
}

export interface NutritionWindow {
  id: string
  start: number
  end: number
  title: string
  summary: string
  focus: string[]
  foods: Food[]
  easeOff?: string
}

export const NUTRITION_WINDOWS: NutritionWindow[] = [
  {
    id: "replenish",
    start: 1,
    end: 5,
    title: "Replenish iron",
    summary: "You lose iron with your period, and low iron shows up as fatigue and brain fog. Pair iron with vitamin C so you absorb more of it.",
    focus: ["Iron", "Vitamin C", "Omega-3"],
    foods: [
      { name: "Lentils or beef", why: "Iron to rebuild what you lose", nutrient: "Iron" },
      { name: "Spinach & kale", why: "Plant iron plus folate", nutrient: "Iron" },
      { name: "Oranges or peppers", why: "Help your body absorb iron", nutrient: "Vitamin C" },
      { name: "Salmon", why: "Omega-3s can ease cramps", nutrient: "Omega-3" },
      { name: "Dark chocolate (70%+)", why: "Iron and magnesium in one", nutrient: "Magnesium" },
      { name: "Ginger tea", why: "Soothes cramps and nausea", nutrient: "Comfort" },
    ],
    easeOff: "Coffee with iron-rich meals, since it blocks absorption.",
  },
  {
    id: "build",
    start: 6,
    end: 13,
    title: "Build & fuel",
    summary: "Energy is climbing. Fresh, lighter meals and steady protein help your body build up for ovulation.",
    focus: ["Protein", "Probiotics", "B vitamins"],
    foods: [
      { name: "Eggs", why: "Protein and choline for focus", nutrient: "Protein" },
      { name: "Kimchi or yogurt", why: "Gut support helps process estrogen", nutrient: "Probiotics" },
      { name: "Oats", why: "Slow-release energy for long days", nutrient: "Fiber" },
      { name: "Chicken or tofu", why: "Lean protein to keep blood sugar steady", nutrient: "Protein" },
      { name: "Berries", why: "Antioxidants, and a little sweet", nutrient: "Antioxidants" },
      { name: "Avocado", why: "Healthy fats to build hormones", nutrient: "Healthy fats" },
    ],
  },
  {
    id: "clear",
    start: 14,
    end: 16,
    title: "Fiber & antioxidants",
    summary: "Estrogen peaks now. Fiber and cruciferous veg help your body clear the extra, and a boost of antioxidants supports ovulation.",
    focus: ["Fiber", "Antioxidants", "Zinc"],
    foods: [
      { name: "Broccoli & cauliflower", why: "Help your body clear used estrogen", nutrient: "Fiber" },
      { name: "Quinoa", why: "Complete protein plus fiber", nutrient: "Protein" },
      { name: "Flaxseed", why: "Fiber that helps balance hormones", nutrient: "Fiber" },
      { name: "Raspberries", why: "Rich in antioxidants", nutrient: "Antioxidants" },
      { name: "Pumpkin seeds", why: "Zinc to support ovulation", nutrient: "Zinc" },
      { name: "Lots of water", why: "You run warmer mid-cycle", nutrient: "Hydration" },
    ],
  },
  {
    id: "steady",
    start: 17,
    end: 22,
    title: "Steady blood sugar",
    summary: "Your metabolism speeds up and cravings start. Complex carbs and magnesium keep your mood and blood sugar more even.",
    focus: ["Complex carbs", "Magnesium", "B6"],
    foods: [
      { name: "Sweet potato", why: "Complex carbs to calm cravings", nutrient: "Complex carbs" },
      { name: "Brown rice", why: "Steady energy, plus B vitamins", nutrient: "Complex carbs" },
      { name: "Chickpeas", why: "Protein and fiber together", nutrient: "Protein" },
      { name: "Bananas", why: "B6 supports serotonin", nutrient: "B6" },
      { name: "Turkey", why: "Tryptophan for mood", nutrient: "Protein" },
      { name: "Almonds", why: "Magnesium to take the edge off", nutrient: "Magnesium" },
    ],
  },
  {
    id: "stockup",
    start: 23,
    end: 28,
    title: "Protein up & stock up on iron",
    summary: "Your period is coming. Eat more protein to keep your mood and focus steady, and start building iron stores before bleeding begins.",
    focus: ["Protein", "Iron", "Magnesium"],
    foods: [
      { name: "Greek yogurt", why: "Lots of protein, easy snack", nutrient: "Protein" },
      { name: "Beef, lentils or tofu", why: "Build iron stores before your period", nutrient: "Iron" },
      { name: "Eggs", why: "Protein to keep your mood from dipping", nutrient: "Protein" },
      { name: "Spinach", why: "Iron plus magnesium for PMS", nutrient: "Iron" },
      { name: "Pumpkin seeds", why: "Magnesium and zinc for cramps", nutrient: "Magnesium" },
      { name: "Dark chocolate", why: "The craving, but useful", nutrient: "Magnesium" },
    ],
    easeOff: "Salt, alcohol and too much caffeine, which can worsen bloating and anxiety.",
  },
]

export function getNutritionWindow(day: number) {
  const d = normalizeDay(day)
  return NUTRITION_WINDOWS.find((w) => d >= w.start && d <= w.end) ?? NUTRITION_WINDOWS[0]
}

export function getNextNutritionWindow(day: number) {
  const current = getNutritionWindow(day)
  const d = normalizeDay(day)
  const idx = NUTRITION_WINDOWS.indexOf(current)
  const next = NUTRITION_WINDOWS[(idx + 1) % NUTRITION_WINDOWS.length]
  const inDays = current.end - d + 1
  return { next, inDays: inDays > CYCLE_LENGTH ? 1 : inDays }
}

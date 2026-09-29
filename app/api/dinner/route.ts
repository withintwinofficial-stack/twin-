import { NextResponse, type NextRequest } from "next/server"
import { findDinner } from "@/lib/dinner"
import { NUTRITION_WINDOWS } from "@/lib/nutrition"

const VALID_WINDOWS = new Set(NUTRITION_WINDOWS.map((w) => w.id))

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const windowId = params.get("window") ?? ""
  if (!VALID_WINDOWS.has(windowId)) {
    return NextResponse.json({ error: "Unknown nutrition window" }, { status: 400 })
  }

  const recipe = findDinner({
    windowId,
    vegetarian: params.get("veg") === "1",
    glutenFree: params.get("gf") === "1",
  })

  if (!recipe) return NextResponse.json({ error: "No recipe found" }, { status: 404 })
  return NextResponse.json({ recipe, source: "twin-kitchen-mock" })
}

export interface Recipe {
  id: string
  windowId: string
  title: string
  minutes: number
  mess: string
  why: string
  ingredients: string[]
  vegetarian: boolean
  glutenFree: boolean
}

export interface DinnerFilters {
  windowId: string
  vegetarian: boolean
  glutenFree: boolean
}

const r = (windowId: string, id: string, title: string, minutes: number, mess: string, why: string, ingredients: string[], vegetarian: boolean, glutenFree: boolean): Recipe => ({
  id: `${windowId}-${id}`,
  windowId,
  title,
  minutes,
  mess,
  why,
  ingredients,
  vegetarian,
  glutenFree,
})

export const RECIPES: Recipe[] = [
  r("replenish", "a", "Beef & broccoli ramen bowl", 20, "One pot", "Iron from beef, vitamin C from broccoli to absorb it.", ["Beef strips", "Broccoli", "Ramen noodles", "Soy & ginger"], false, false),
  r("replenish", "b", "Steak, sweet potato & chimichurri", 25, "One tray", "Heme iron plus parsley vitamin C. Oven does the work.", ["Flank steak", "Sweet potato", "Parsley", "Lemon"], false, true),
  r("replenish", "c", "Lentil bolognese pasta", 25, "One pot", "Lentils bring iron and fiber; tomatoes help absorb it.", ["Red lentils", "Pasta", "Crushed tomatoes", "Spinach"], true, false),
  r("replenish", "d", "Coconut lentil & spinach dal", 20, "One pot", "Plant iron, warm spices and zero chopping stress.", ["Red lentils", "Coconut milk", "Spinach", "Rice"], true, true),

  r("build", "a", "Chicken pesto wrap", 10, "No cook", "Lean protein and healthy fats to fuel a busy follicular week.", ["Rotisserie chicken", "Wholewheat wrap", "Pesto", "Rocket"], false, false),
  r("build", "b", "Salmon & avocado rice bowl", 15, "One pan", "Protein and omega-3s while estrogen climbs.", ["Salmon fillet", "Rice", "Avocado", "Kimchi"], false, true),
  r("build", "c", "Halloumi & chickpea flatbreads", 15, "One pan", "Protein-rich, bright and quick.", ["Halloumi", "Chickpeas", "Flatbread", "Yogurt"], true, false),
  r("build", "d", "Tofu & egg fried rice", 15, "One wok", "Two proteins, gut-friendly kimchi on top.", ["Firm tofu", "Eggs", "Rice", "Kimchi"], true, true),

  r("clear", "a", "Shrimp & broccoli orzo", 20, "One pot", "Fiber and zinc to help clear peak estrogen.", ["Shrimp", "Orzo", "Broccoli", "Lemon"], false, false),
  r("clear", "b", "Sheet-pan chicken & cauliflower", 30, "One tray", "Cruciferous veg to process estrogen. Hands-off.", ["Chicken thighs", "Cauliflower", "Turmeric", "Pumpkin seeds"], false, true),
  r("clear", "c", "Roasted veg & feta couscous", 20, "One tray", "Antioxidant colors and plenty of fiber.", ["Couscous", "Peppers", "Courgette", "Feta"], true, false),
  r("clear", "d", "Quinoa, broccoli & tahini bowl", 20, "One pot", "Complete protein and fiber with flaxseed crunch.", ["Quinoa", "Broccoli", "Tahini", "Flaxseed"], true, true),

  r("steady", "a", "Turkey meatball subs", 25, "One tray", "Tryptophan for mood, carbs for steady blood sugar.", ["Turkey mince", "Sub rolls", "Marinara", "Mozzarella"], false, false),
  r("steady", "b", "Turkey & sweet potato chili", 30, "One pot", "Complex carbs and B6 to calm luteal cravings.", ["Turkey mince", "Sweet potato", "Kidney beans", "Cinnamon"], false, true),
  r("steady", "c", "Creamy chickpea & spinach gnocchi", 15, "One pan", "Comforting carbs with protein so you don't crash.", ["Gnocchi", "Chickpeas", "Spinach", "Cream cheese"], true, false),
  r("steady", "d", "Loaded baked sweet potatoes", 35, "One tray", "Complex carbs, black beans and almonds for magnesium.", ["Sweet potatoes", "Black beans", "Greek yogurt", "Almonds"], true, true),

  r("stockup", "a", "Beef & bean burrito bowls", 20, "One pan", "Protein up and iron stocked before your period.", ["Beef mince", "Black beans", "Tortilla chips", "Salsa"], false, false),
  r("stockup", "b", "Salmon, spinach & rice traybake", 25, "One tray", "Protein, iron and magnesium in one tray.", ["Salmon", "Spinach", "Rice", "Pumpkin seeds"], false, true),
  r("stockup", "c", "Spinach & ricotta pasta bake", 30, "One dish", "Iron-rich greens with a protein-heavy sauce.", ["Pasta", "Ricotta", "Spinach", "Parmesan"], true, false),
  r("stockup", "d", "Tofu & lentil peanut curry", 25, "One pot", "Double plant protein and a solid iron top-up.", ["Firm tofu", "Green lentils", "Peanut butter", "Spinach"], true, true),
]

export function findDinner({ windowId, vegetarian, glutenFree }: DinnerFilters): Recipe | null {
  return (
    RECIPES.find(
      (recipe) =>
        recipe.windowId === windowId &&
        recipe.vegetarian === vegetarian &&
        recipe.glutenFree === glutenFree,
    ) ??
    RECIPES.find(
      (recipe) =>
        recipe.windowId === windowId &&
        (!vegetarian || recipe.vegetarian) &&
        (!glutenFree || recipe.glutenFree),
    ) ??
    null
  )
}

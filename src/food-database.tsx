import foodData from "../food-data.json";
import type { FoodItem } from "./types";

export const foodDatabase: Array<FoodItem> = foodData.map((entry, ix) => ({
  id: ix,
  name: entry.food,
  calories_per_100g: entry["Caloric Value"],
  carbs: entry.Carbohydrates,
  protein: entry.Protein,
  fat: entry.Fat,
  common_portions: [],
}));

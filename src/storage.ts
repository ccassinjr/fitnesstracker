import { foodDatabase } from "./food-database";
import type { Database, TopNav } from "./types";

export const initialDatabase: Database = {
  physicalInfo: {
    name: "",
    height: 0,
    sex: "male",
    birthdate: { day: 0, month: 0, year: 0 },
    fitness_level: { type: "FitnessCategory", category: "sedentary" },
    weight: [],
  },
  foods: foodDatabase,
  meals: [],
};

const DB_KEY = "database";

export function loadDatabase(): Database | null {
  const found = window.localStorage.getItem(DB_KEY);
  if (found === null) {
    return null;
  }

  const database = JSON.parse(found) as Database;
  return database;
}

export function saveDatabase(database: Database): void {
  window.localStorage.setItem(DB_KEY, JSON.stringify(database));
}

const TAB_KEY = "tab";

export function loadTab(): TopNav | null {
  const found = window.localStorage.getItem(TAB_KEY);
  if (found === null) return null;
  const parsed = JSON.parse(found) as TopNav;
  const valid: Array<TopNav> = [
    "Home",
    "Nutrition",
    "Training",
    "Log",
    "Profile",
  ];
  return valid.includes(parsed) ? parsed : "Home";
}

export function saveTab(tab: TopNav): void {
  window.localStorage.setItem(TAB_KEY, JSON.stringify(tab));
}

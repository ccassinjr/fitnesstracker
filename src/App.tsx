import { useState, type ReactElement } from "react";
import type {
  Database,
  TopNav,
  NutritionTab,
  FoodItem,
  SetDatabase,
} from "./types";
import { cn } from "./utils";
import {
  loadDatabase,
  saveDatabase,
  loadTab,
  saveTab,
  initialDatabase,
} from "./storage";
import { BottomNav } from "./BottomNav";
import { Home } from "./Home";
import { PhysicalInfo } from "./PhysicalInfo";
import { FoodList } from "./FoodList";
import { AddFoodItem } from "./AddFoodItem";
import { LogMeal } from "./LogMeal";
import { MealLog } from "./MealLog";
import "./styles/globals.css";

export function App() {
  const [database, setDatabaseState] = useState<Database>(
    loadDatabase() ?? initialDatabase,
  );
  const [topNav, setTopNavState] = useState<TopNav>(loadTab() ?? "Home");
  const [nutritionTab, setNutritionTab] = useState<NutritionTab>("FoodItems");
  const [hasReset, setHasReset] = useState(false);

  function setTopNav(tab: TopNav): void {
    setTopNavState(tab);
    saveTab(tab);
  }

  function setDatabase(db: Database): void {
    setDatabaseState(db);
    saveDatabase(db);
  }

  function deleteFood(i: number): void {
    setDatabase({
      ...database,
      foods: database.foods.filter((_, index) => index !== i),
    });
  }

  function editFood(updatedFood: FoodItem): void {
    setDatabase({
      ...database,
      foods: database.foods.map((food) =>
        food.id === updatedFood.id ? updatedFood : food,
      ),
    });
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Fitness Tracker</h1>
        <button
          className="app__reset"
          onClick={() => {
            setDatabase(initialDatabase);
            setHasReset(true);
            setTimeout(() => setHasReset(false), 3000);
          }}
        >
          Reset
        </button>
        {hasReset && (
          <p className="app__reset-confirm">Database has been reset</p>
        )}
      </header>
      <main className="app__content">
        {viewTab(
          topNav,
          nutritionTab,
          setNutritionTab,
          database,
          setDatabase,
          deleteFood,
          editFood,
        )}
      </main>
      <BottomNav active={topNav} onChange={setTopNav} />
    </div>
  );
}

function viewTab(
  tab: TopNav,
  nutritionTab: NutritionTab,
  setNutritionTab: (tab: NutritionTab) => void,
  database: Database,
  setDatabase: SetDatabase,
  deleteFood: (i: number) => void,
  editFood: (food: FoodItem) => void,
): ReactElement {
  switch (tab) {
    case "Home":
      return <Home database={database} />;
    case "Nutrition":
      return (
        <>
          <nav>
            <ul className="tabs">
              <li
                className={cn({
                  tabs__tab: true,
                  "tabs__tab--active": nutritionTab === "FoodItems",
                })}
                onClick={() => setNutritionTab("FoodItems")}
              >
                Food items
              </li>
              <li
                className={cn({
                  tabs__tab: true,
                  "tabs__tab--active": nutritionTab === "Meals",
                })}
                onClick={() => setNutritionTab("Meals")}
              >
                Meals
              </li>
            </ul>
          </nav>
          {nutritionTab === "FoodItems" ? (
            <>
              <FoodList
                foods={database.foods}
                onDeleteFood={deleteFood}
                onEdit={editFood}
              />
              <div className="section-divider" />
              <AddFoodItem database={database} setDatabase={setDatabase} />
            </>
          ) : (
            <>
              <LogMeal database={database} setDatabase={setDatabase} />
              <div className="section-divider" />
              <MealLog database={database} setDatabase={setDatabase} />
            </>
          )}
        </>
      );
    case "Training":
      return (
        <div className="section placeholder">
          <div className="section__header">
            <h2 className="section__title">Training</h2>
          </div>
          <p className="placeholder__message">Coming soon.</p>
        </div>
      );
    case "Log":
      return (
        <div className="section placeholder">
          <div className="section__header">
            <h2 className="section__title">Daily log</h2>
          </div>
          <p className="placeholder__message">Coming soon.</p>
        </div>
      );
    case "Profile":
      return (
        <PhysicalInfo
          physicalInfo={database.physicalInfo}
          setDatabase={setDatabase}
          database={database}
        />
      );
    default:
      tab satisfies never;
      throw new Error(`Invalid tab: '${tab}'`);
  }
}

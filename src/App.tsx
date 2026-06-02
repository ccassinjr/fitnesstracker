import { useState, type ReactElement } from "react";
import type { Database, AppTabs, FoodItem, SetDatabase } from "./types";
import { cn } from "./utils";
import {
  loadDatabase,
  saveDatabase,
  loadTab,
  saveTab,
  initialDatabase,
} from "./storage";
import { Home } from "./Home";
import { PhysicalInfo } from "./PhysicalInfo";
import { FoodList } from "./FoodList";
import { AddFoodItem } from "./AddFoodItem";
import { LogMeal } from "./LogMeal";
import { MealLog } from "./MealLog";

export function App() {
  const [database, setDatabaseState] = useState<Database>(
    loadDatabase() ?? initialDatabase,
  );
  const [selectedTab, setSelectedTabState] = useState<AppTabs>(
    loadTab() ?? "Home",
  );
  const [hasReset, setHasReset] = useState(false);

  function setSelectedTab(tab: AppTabs): void {
    setSelectedTabState(tab);
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
    <>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">Fitness Tracker</h1>
          <button
            className="app__reset"
            onClick={() => {
              setDatabase(initialDatabase);
              setHasReset(true);
              setTimeout(() => {
                setHasReset(false);
              }, 3000);
            }}
          >
            Reset
          </button>
          {hasReset ? (
            <p className="app__reset-confirm">Database has been reset</p>
          ) : null}
        </header>
        <nav className="app__nav">
          <ul className="tabs">
            <li
              className={cn({
                tabs__tab: true,
                "tabs__tab--active": selectedTab === "Home",
              })}
              onClick={() => setSelectedTab("Home")}
            >
              Home
            </li>
            <li
              className={cn({
                tabs__tab: true,
                "tabs__tab--active": selectedTab === "PhysicalInfo",
              })}
              onClick={() => setSelectedTab("PhysicalInfo")}
            >
              Physical Information
            </li>
            <li
              className={cn({
                tabs__tab: true,
                "tabs__tab--active": selectedTab === "FoodItems",
              })}
              onClick={() => setSelectedTab("FoodItems")}
            >
              Food Items
            </li>
            <li
              className={cn({
                tabs__tab: true,
                "tabs__tab--active": selectedTab === "Meals",
              })}
              onClick={() => setSelectedTab("Meals")}
            >
              Meals
            </li>
          </ul>
        </nav>
        <main className="app__content">
          {viewTab(selectedTab, database, setDatabase, deleteFood, editFood)}
        </main>
      </div>
    </>
  );
}

function viewTab(
  tab: AppTabs,
  database: Database,
  setDatabase: SetDatabase,
  deleteFood: (i: number) => void,
  editFood: (food: FoodItem) => void,
): ReactElement {
  switch (tab) {
    case "Home":
      return <Home />;
    case "PhysicalInfo":
      return (
        <>
          <PhysicalInfo
            physicalInfo={database.physicalInfo}
            setDatabase={setDatabase}
            database={database}
          />
        </>
      );
    case "FoodItems":
      return (
        <>
          <FoodList
            foods={database.foods}
            onDeleteFood={deleteFood}
            onEdit={editFood}
          />
          <hr />
          <AddFoodItem database={database} setDatabase={setDatabase} />
        </>
      );
    case "Meals":
      return (
        <>
          <LogMeal database={database} setDatabase={setDatabase} />
          <hr />
          <MealLog database={database} />
        </>
      );
    default:
      tab satisfies never;
      throw new Error(`Invalid tab name: '${tab}'`);
  }
}

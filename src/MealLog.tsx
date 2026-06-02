import type { ReactElement } from "react";
import type { Database } from "./types";
import { showTimestamp } from "./utils";

export function MealLog({ database }: { database: Database }): ReactElement {
  if (database.meals.length === 0) {
    return <p>No meals logged yet.</p>;
  }
  const foodById = new Map(database.foods.map((f) => [f.id, f]));
  return (
    <>
      <h2>Logged Meals</h2>
      <ul>
        {database.meals
          .slice()
          .reverse()
          .map((meal, i) => (
            <li key={i}>
              <strong>{meal.type}</strong> — {showTimestamp(meal.time)}
              <ul>
                {meal.foods.map((mfe, j) => {
                  const food = foodById.get(mfe.food);
                  return <li key={j}>{food?.name ?? "(unknown food)"}</li>;
                })}
              </ul>
            </li>
          ))}
      </ul>
    </>
  );
}

import type { ReactElement } from "react";
import type { Database, SetDatabase } from "./types";
import { showTimestamp, showPortion, capitalise } from "./utils";

export function MealLog({
  database,
  setDatabase,
}: {
  database: Database;
  setDatabase: SetDatabase;
}): ReactElement {
  const foodById = new Map(database.foods.map((f) => [f.id, f]));

  function deleteMeal(reversedIdx: number) {
    const originalIdx = database.meals.length - 1 - reversedIdx;
    setDatabase({
      ...database,
      meals: database.meals.filter((_, i) => i !== originalIdx),
    });
  }

  return (
    <div className="section meal-log">
      <div className="section__header">
        <h2 className="section__title">Meal history</h2>
      </div>
      {database.meals.length === 0 ? (
        <p className="meal-log__empty">No meals logged yet.</p>
      ) : (
        <ul className="meal-log__list">
          {database.meals
            .slice()
            .reverse()
            .map((meal, i) => (
              <li key={i} className="meal-log__item">
                <div className="meal-log__item-header">
                  <span className="meal-log__item-type">
                    {capitalise(meal.type)}
                  </span>
                  <span className="meal-log__item-time">
                    {showTimestamp(meal.time)}
                  </span>
                  <button
                    className="meal-log__delete"
                    type="button"
                    onClick={() => deleteMeal(i)}
                  >
                    Delete
                  </button>
                </div>
                <ul className="meal-log__foods">
                  {meal.foods.map((mfe, j) => {
                    const food = foodById.get(mfe.food);
                    return (
                      <li key={j} className="meal-log__food">
                        <span className="meal-log__food-name">
                          {food?.name ?? "(unknown food)"}
                        </span>
                        <span className="meal-log__food-quantity">
                          {showPortion(mfe.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

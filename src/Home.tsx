import type { ReactElement } from "react";
import type { Database } from "./types";
import { capitalise } from "./utils";

export function Home({ database }: { database: Database }): ReactElement {
  const firstName = database.physicalInfo.name.split(" ")[0];

  const hour = new Date().getHours();
  const timeOfDay =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const todayString = new Date().toDateString();
  const todayMeals = database.meals.filter(
    (meal) => new Date(meal.time).toDateString() === todayString,
  );

  const foodById = new Map(database.foods.map((f) => [f.id, f]));

  const todayCalories = Math.round(
    todayMeals.reduce((total, meal) => {
      return (
        total +
        meal.foods.reduce((mealTotal, entry) => {
          const food = foodById.get(entry.food);
          if (!food || entry.quantity.type === "volume") return mealTotal;
          return (
            mealTotal + (food.calories_per_100g * entry.quantity.grams) / 100
          );
        }, 0)
      );
    }, 0),
  );

  const latestWeight =
    database.physicalInfo.weight[database.physicalInfo.weight.length - 1];

  const dateString = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="home">
      <div className="home__greeting">
        <p className="home__time">Good {timeOfDay}</p>
        <p className="home__name">{firstName}</p>
        <p className="home__date">{dateString}</p>
      </div>
      <div className="home__stats">
        <div className="home__stat">
          <span className="home__stat-value home__stat-value--accent">
            {todayCalories}
          </span>
          <span className="home__stat-label">kcal today</span>
        </div>
        <div className="home__stat">
          <span className="home__stat-value">{todayMeals.length}</span>
          <span className="home__stat-label">
            {todayMeals.length === 1 ? "meal" : "meals"} logged
          </span>
        </div>
        <div className="home__stat">
          <span className="home__stat-value">
            {latestWeight !== undefined ? latestWeight.weight / 1000 : "—"}
          </span>
          <span className="home__stat-label">
            {latestWeight !== undefined ? "kg" : "not logged"}
          </span>
        </div>
      </div>
      <div className="home__today">
        <h3 className="home__today-title">Today's meals</h3>
        {todayMeals.length === 0 ? (
          <p className="home__today-empty">No meals logged today.</p>
        ) : (
          <ul className="home__meals">
            {todayMeals.map((meal, i) => (
              <li key={i} className="home__meal">
                <span className="home__meal-type">{capitalise(meal.type)}</span>
                <span className="home__meal-count">
                  {meal.foods.length}{" "}
                  {meal.foods.length === 1 ? "item" : "items"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
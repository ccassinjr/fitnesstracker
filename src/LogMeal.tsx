import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import type {
  Database,
  SetDatabase,
  FoodItem,
  MealFoodEntry,
  MealType,
  PortionAmount,
} from "./types";
import {
  showPortion,
  showTotalQuantity,
  formatTotal,
  capitalise,
} from "./utils";
import { fuzzyMatch, fuzzyScore, highlightMatch } from "./fuzzy";
import "./styles/meals.css";

const MEAL_TYPES: Array<MealType> = ["breakfast", "lunch", "dinner", "snack"];

export function LogMeal({
  database,
  setDatabase,
}: {
  database: Database;
  setDatabase: SetDatabase;
}): ReactElement {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [selectedFoods, setSelectedFoods] = useState<Array<MealFoodEntry>>([]);
  const [query, setQuery] = useState("");
  const [pendingFood, setPendingFood] = useState<FoodItem | null>(null);
  const [pendingUnit, setPendingUnit] = useState<"weight" | "volume">("weight");
  const [pendingAmount, setPendingAmount] = useState<number>(NaN);

  const topResults = useMemo(() => {
    if (query.trim() === "") return [];
    const matches: Array<{
      food: FoodItem;
      indices: Array<number>;
      score: number;
    }> = [];
    for (const food of database.foods) {
      const indices = fuzzyMatch(query, food.name);
      if (indices === null) continue;
      const score = fuzzyScore(indices, food.name);
      if (score < 18) continue;
      matches.push({ food, indices, score });
    }
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 5);
  }, [query, database.foods]);

  const foodById = useMemo(
    () => new Map(database.foods.map((f) => [f.id, f])),
    [database.foods],
  );

  const totals = useMemo(() => {
    let grams = 0;
    let milliliters = 0;
    let calories = 0;
    let carbs = 0;
    let protein = 0;
    let fat = 0;
    for (const entry of selectedFoods) {
      const food = foodById.get(entry.food);
      if (entry.quantity.type === "volume") {
        milliliters += entry.quantity.milliliters;
        continue;
      }
      const g = entry.quantity.grams;
      grams += g;
      if (food === undefined) continue;
      const factor = g / 100;
      calories += food.calories_per_100g * factor;
      carbs += food.carbs * factor;
      protein += food.protein * factor;
      fat += food.fat * factor;
    }
    return { grams, milliliters, calories, carbs, protein, fat };
  }, [selectedFoods, foodById]);

  function startAddingFood(food: FoodItem) {
    setPendingFood(food);
    setPendingUnit("weight");
    setPendingAmount(NaN);
    setQuery("");
  }

  function confirmPendingFood() {
    if (pendingFood === null) return;
    if (!Number.isFinite(pendingAmount) || pendingAmount <= 0) return;
    const quantity: PortionAmount =
      pendingUnit === "weight"
        ? { type: "weight", grams: pendingAmount }
        : { type: "volume", milliliters: pendingAmount };
    setSelectedFoods([...selectedFoods, { food: pendingFood.id, quantity }]);
    setPendingFood(null);
  }

  function cancelPendingFood() {
    setPendingFood(null);
  }

  function removeFood(idx: number) {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== idx));
  }

  function handleLogMeal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedFoods.length === 0) return;
    setDatabase({
      ...database,
      meals: [
        ...database.meals,
        {
          type: mealType,
          foods: selectedFoods,
          time: Date.now(),
        },
      ],
    });
    setSelectedFoods([]);
    setQuery("");
    setPendingFood(null);
    setMealType("breakfast");
  }

  const pendingAmountValid =
    Number.isFinite(pendingAmount) && pendingAmount > 0;

  return (
    <div className="section meal-form">
      <div className="section__header">
        <h2 className="section__title">Log meal</h2>
      </div>
      <form className="meal-form__form" onSubmit={handleLogMeal}>
        <div className="meal-form__field">
          <label className="meal-form__label">Meal type</label>
          <select
            className="meal-form__select"
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
          >
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {capitalise(t)}
              </option>
            ))}
          </select>
        </div>
        <div className="meal-form__field">
          <label className="meal-form__label">Foods</label>
          {selectedFoods.length === 0 ? (
            <p className="meal-form__foods-empty">No foods added yet.</p>
          ) : (
            <>
              <ul className="meal-form__food-list">
                {selectedFoods.map((entry, i) => {
                  const food = foodById.get(entry.food);
                  const isVolume = entry.quantity.type === "volume";
                  const grams =
                    entry.quantity.type === "weight" ? entry.quantity.grams : 0;
                  const factor = grams / 100;
                  return (
                    <li key={i} className="meal-form__food-item">
                      <div className="meal-form__food-item-header">
                        <span className="meal-form__food-item-name">
                          {food?.name ?? "(unknown food)"}
                        </span>
                        <button
                          className="meal-form__remove"
                          type="button"
                          onClick={() => removeFood(i)}
                        >
                          Remove
                        </button>
                      </div>
                      <span className="meal-form__food-item-quantity">
                        {showPortion(entry.quantity)}
                      </span>
                      {!isVolume && food ? (
                        <div className="meal-form__food-item-macros">
                          <div className="meal-form__food-item-macro">
                            <span className="meal-form__food-item-macro-value meal-form__food-item-macro-value--accent">
                              {formatTotal(food.calories_per_100g * factor)}
                            </span>
                            <span className="meal-form__food-item-macro-label">
                              kcal
                            </span>
                          </div>
                          <div className="meal-form__food-item-macro">
                            <span className="meal-form__food-item-macro-value">
                              {formatTotal(food.carbs * factor)}g
                            </span>
                            <span className="meal-form__food-item-macro-label">
                              carbs
                            </span>
                          </div>
                          <div className="meal-form__food-item-macro">
                            <span className="meal-form__food-item-macro-value">
                              {formatTotal(food.protein * factor)}g
                            </span>
                            <span className="meal-form__food-item-macro-label">
                              protein
                            </span>
                          </div>
                          <div className="meal-form__food-item-macro">
                            <span className="meal-form__food-item-macro-value">
                              {formatTotal(food.fat * factor)}g
                            </span>
                            <span className="meal-form__food-item-macro-label">
                              fat
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="meal-form__food-item-volume-note">
                          Nutrition unavailable for volume entries
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="meal-form__totals">
                <div className="meal-form__totals-header">
                  <span className="meal-form__totals-label">Total</span>
                  <span className="meal-form__totals-quantity">
                    {showTotalQuantity(totals.grams, totals.milliliters)}
                  </span>
                </div>
                <div className="meal-form__food-item-macros">
                  <div className="meal-form__food-item-macro">
                    <span className="meal-form__food-item-macro-value meal-form__food-item-macro-value--accent">
                      {formatTotal(totals.calories)}
                    </span>
                    <span className="meal-form__food-item-macro-label">
                      kcal
                    </span>
                  </div>
                  <div className="meal-form__food-item-macro">
                    <span className="meal-form__food-item-macro-value">
                      {formatTotal(totals.carbs)}g
                    </span>
                    <span className="meal-form__food-item-macro-label">
                      carbs
                    </span>
                  </div>
                  <div className="meal-form__food-item-macro">
                    <span className="meal-form__food-item-macro-value">
                      {formatTotal(totals.protein)}g
                    </span>
                    <span className="meal-form__food-item-macro-label">
                      protein
                    </span>
                  </div>
                  <div className="meal-form__food-item-macro">
                    <span className="meal-form__food-item-macro-value">
                      {formatTotal(totals.fat)}g
                    </span>
                    <span className="meal-form__food-item-macro-label">
                      fat
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="meal-form__search-section">
          <label className="meal-form__label">Add food</label>
          {pendingFood === null ? (
            <div className="meal-form__search">
              <input
                className="meal-form__search-input"
                type="text"
                placeholder="Search foods..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query.trim() !== "" && (
                <ul className="meal-form__results">
                  {topResults.length === 0 ? (
                    <li className="meal-form__result-item meal-form__result-item--empty">
                      No matches found
                    </li>
                  ) : (
                    topResults.map(({ food, indices }) => (
                      <li key={food.id} className="meal-form__result-item">
                        <button
                          className="meal-form__result-btn"
                          type="button"
                          onClick={() => startAddingFood(food)}
                        >
                          {highlightMatch(food.name, indices)}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          ) : (
            <div className="meal-form__pending">
              <p className="meal-form__pending-name">{pendingFood.name}</p>
              {pendingFood.common_portions.length > 0 && (
                <div className="meal-form__portions">
                  {pendingFood.common_portions.map((portion) => (
                    <button
                      key={portion.name}
                      className="meal-form__portion-btn"
                      type="button"
                      onClick={() => {
                        if (portion.amount.type === "weight") {
                          setPendingUnit("weight");
                          setPendingAmount(portion.amount.grams);
                        } else {
                          setPendingUnit("volume");
                          setPendingAmount(portion.amount.milliliters);
                        }
                      }}
                    >
                      {portion.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="meal-form__pending-amount">
                <input
                  className="meal-form__amount-input"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="e.g. 100"
                  value={isNaN(pendingAmount) ? "" : pendingAmount}
                  onChange={(e) => setPendingAmount(e.target.valueAsNumber)}
                />
                <select
                  className="meal-form__unit-select"
                  value={pendingUnit}
                  onChange={(e) =>
                    setPendingUnit(e.target.value as "weight" | "volume")
                  }
                >
                  <option value="weight">Grams</option>
                  <option value="volume">Millilitres</option>
                </select>
              </div>
              <div className="meal-form__pending-actions">
                <button
                  className="meal-form__btn meal-form__btn--primary"
                  type="button"
                  onClick={confirmPendingFood}
                  disabled={!pendingAmountValid}
                >
                  Add to meal
                </button>
                <button
                  className="meal-form__btn meal-form__btn--ghost"
                  type="button"
                  onClick={cancelPendingFood}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          className="meal-form__btn meal-form__btn--submit"
          type="submit"
          disabled={selectedFoods.length === 0}
        >
          Log meal
        </button>
      </form>
    </div>
  );
}

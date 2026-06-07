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
  const [pendingAmount, setPendingAmount] = useState<number>(100);

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
      matches.push({ food, indices, score: fuzzyScore(indices, food.name) });
    }
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 5);
  }, [query, database.foods]);

  const foodById = useMemo(
    () => new Map(database.foods.map((f) => [f.id, f])),
    [database.foods],
  );

  // Totals are computed from the chosen portions (not the raw per-100g
  // column values), so the row shows the real meal calories and macro
  // grams. Volume entries don't contribute to nutritional totals because
  // we have no density to convert ml to grams.
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
            <div className="meal-form__table-wrapper">
              <table className="meal-form__table">
                <thead>
                  <tr>
                    <th className="meal-form__th meal-form__th--name">Name</th>
                    <th className="meal-form__th">Quantity</th>
                    <th className="meal-form__th">kcal</th>
                    <th className="meal-form__th">Carbs g</th>
                    <th className="meal-form__th">Protein g</th>
                    <th className="meal-form__th">Fat g</th>
                    <th className="meal-form__th"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFoods.map((entry, i) => {
                    const food = foodById.get(entry.food);
                    if (food === undefined) {
                      return (
                        <tr key={i} className="meal-form__row">
                          <td className="meal-form__cell meal-form__cell--unknown">
                            (unknown food)
                          </td>
                          <td className="meal-form__cell">
                            {showPortion(entry.quantity)}
                          </td>
                          <td className="meal-form__cell" colSpan={4}></td>
                          <td className="meal-form__cell meal-form__cell--actions">
                            <button
                              className="meal-form__remove"
                              type="button"
                              onClick={() => removeFood(i)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={i} className="meal-form__row">
                        <td className="meal-form__cell meal-form__cell--name">
                          {food.name}
                        </td>
                        <td className="meal-form__cell">
                          {showPortion(entry.quantity)}
                        </td>
                        {entry.quantity.type === "weight" ? (
                          <>
                            <td className="meal-form__cell">
                              {formatTotal((food.calories_per_100g * entry.quantity.grams) / 100)}
                            </td>
                            <td className="meal-form__cell">
                              {formatTotal((food.carbs * entry.quantity.grams) / 100)}
                            </td>
                            <td className="meal-form__cell">
                              {formatTotal((food.protein * entry.quantity.grams) / 100)}
                            </td>
                            <td className="meal-form__cell">
                              {formatTotal((food.fat * entry.quantity.grams) / 100)}
                            </td>
                          </>
                        ) : (
                          <td className="meal-form__cell" colSpan={4}>—</td>
                        )}
                        <td className="meal-form__cell meal-form__cell--actions">
                          <button
                            className="meal-form__remove"
                            type="button"
                            onClick={() => removeFood(i)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="meal-form__total-row">
                    <td className="meal-form__total-cell meal-form__total-cell--label">
                      Total
                    </td>
                    <td className="meal-form__total-cell">
                      {showTotalQuantity(totals.grams, totals.milliliters)}
                    </td>
                    <td className="meal-form__total-cell">
                      {formatTotal(totals.calories)}
                    </td>
                    <td className="meal-form__total-cell">
                      {formatTotal(totals.carbs)}
                    </td>
                    <td className="meal-form__total-cell">
                      {formatTotal(totals.protein)}
                    </td>
                    <td className="meal-form__total-cell">
                      {formatTotal(totals.fat)}
                    </td>
                    <td className="meal-form__total-cell"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
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

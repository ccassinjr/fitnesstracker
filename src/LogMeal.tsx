import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import type {
  Database,
  SetDatabase,
  FoodItem,
  MealFoodEntry,
  MealType,
  PortionAmount,
} from "./types";
import { showPortion, showTotalQuantity, formatTotal } from "./utils";
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
    setPendingAmount(100);
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
    <>
      <h2>Log Meal</h2>
      <form onSubmit={handleLogMeal}>
        <div>
          <label>Meal type</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
          >
            {MEAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Foods</label>
          {selectedFoods.length === 0 ? (
            <p>No foods selected yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <td>Name</td>
                  <td>Quantity</td>
                  <td>Calories per 100g</td>
                  <td>Carbs</td>
                  <td>Protein</td>
                  <td>Fat</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {selectedFoods.map((entry, i) => {
                  const food = foodById.get(entry.food);
                  if (food === undefined) {
                    return (
                      <tr key={i}>
                        <td>(unknown food)</td>
                        <td>{showPortion(entry.quantity)}</td>
                        <td colSpan={4}></td>
                        <td>
                          <button type="button" onClick={() => removeFood(i)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={i}>
                      <td>{food.name}</td>
                      <td>{showPortion(entry.quantity)}</td>
                      <td>{food.calories_per_100g}</td>
                      <td>{food.carbs}</td>
                      <td>{food.protein}</td>
                      <td>{food.fat}</td>
                      <td>
                        <button type="button" onClick={() => removeFood(i)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{showTotalQuantity(totals.grams, totals.milliliters)}</td>
                  <td>{formatTotal(totals.calories)}</td>
                  <td>{formatTotal(totals.carbs)}</td>
                  <td>{formatTotal(totals.protein)}</td>
                  <td>{formatTotal(totals.fat)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div>
          <label>Add food</label>
          {pendingFood === null ? (
            <>
              <input
                type="text"
                placeholder="Search foods..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query.trim() !== "" && (
                <ul>
                  {topResults.length === 0 ? (
                    <li>No matches</li>
                  ) : (
                    topResults.map(({ food, indices }) => (
                      <li key={food.id}>
                        <button
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
            </>
          ) : (
            <div>
              <p>
                Selected: <strong>{pendingFood.name}</strong>
              </p>
              <label>Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                value={pendingAmount}
                onChange={(e) => setPendingAmount(e.target.valueAsNumber)}
              />
              <select
                value={pendingUnit}
                onChange={(e) =>
                  setPendingUnit(e.target.value as "weight" | "volume")
                }
              >
                <option value="weight">grams</option>
                <option value="volume">milliliters</option>
              </select>
              <button
                type="button"
                onClick={confirmPendingFood}
                disabled={!pendingAmountValid}
              >
                Add
              </button>
              <button type="button" onClick={cancelPendingFood}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div>
          <button type="submit" disabled={selectedFoods.length === 0}>
            Log meal
          </button>
        </div>
      </form>
    </>
  );
}

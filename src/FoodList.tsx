import { useState, type FormEvent, type ReactElement } from "react";
import type { FoodItem } from "./types";
import { showPortion } from "./utils";
import { fuzzyMatch, highlightMatch } from "./fuzzy";

const FOOD_PAGE_SIZE = 15;

function FoodListItem({
  food,
  matchIndices,
  onDelete,
  onEdit,
}: {
  food: FoodItem;
  matchIndices: Array<number>;
  onDelete: () => void;
  onEdit: (food: FoodItem) => void;
}): ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(food.name);
  const [caloriesPer100g, setCaloriesPer100g] = useState(
    food.calories_per_100g,
  );
  const [carbs, setCarbs] = useState(food.carbs);
  const [protein, setProtein] = useState(food.protein);
  const [fat, setFat] = useState(food.fat);
  const [portionName, setPortionName] = useState("");
  const [portionType, setPortionType] = useState<"weight" | "volume">("weight");
  const [portionAmount, setPortionAmount] = useState(NaN);
  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onEdit({
      id: food.id,
      name: name,
      calories_per_100g: caloriesPer100g,
      carbs: carbs,
      protein: protein,
      fat: fat,
      common_portions: food.common_portions,
    });
    setIsEditing(false);
  }
  return isEditing ? (
    <tr className="food-item food-item--editing">
      <td className="food-item__edit-cell" colSpan={6}>
        <form className="food-item__edit-form" onSubmit={handleSave}>
          <div className="food-item__edit-fields">
            <div className="food-item__edit-field food-item__edit-field--full">
              <label className="food-item__edit-label">Name</label>
              <input
                className="food-item__edit-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="food-item__edit-field">
              <label className="food-item__edit-label">Calories per 100g</label>
              <input
                className="food-item__edit-input"
                type="number"
                value={caloriesPer100g}
                onChange={(e) => setCaloriesPer100g(e.target.valueAsNumber)}
                onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "E") e.preventDefault();
                }}
              />
            </div>
            <div className="food-item__edit-field">
              <label className="food-item__edit-label">Carbohydrates (%)</label>
              <input
                className="food-item__edit-input"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.valueAsNumber)}
                onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "E") e.preventDefault();
                }}
              />
            </div>
            <div className="food-item__edit-field">
              <label className="food-item__edit-label">Protein (%)</label>
              <input
                className="food-item__edit-input"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.valueAsNumber)}
                onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "E") e.preventDefault();
                }}
              />
            </div>
            <div className="food-item__edit-field">
              <label className="food-item__edit-label">Fat (%)</label>
              <input
                className="food-item__edit-input"
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.valueAsNumber)}
                onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "E") e.preventDefault();
                }}
              />
            </div>
          </div>
          <div className="food-item__portions">
            <h4 className="food-item__portions-title">Common portions</h4>
            {food.common_portions.length === 0 ? (
              <p>No portions added yet.</p>
            ) : (
              <ul className="food-item__portions-list">
                {food.common_portions.map((portion, i) => (
                  <li key={i} className="food-item__portion">
                    <span className="food-item__portion-text">
                      {portion.name} — {showPortion(portion.amount)}
                    </span>
                    <button
                      className="food-item__portion-remove"
                      type="button"
                      onClick={() =>
                        onEdit({
                          ...food,
                          common_portions: food.common_portions.filter(
                            (_, index) => index !== i,
                          ),
                        })
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="food-item__portion-add">
              <input
                className="food-item__edit-input"
                type="text"
                placeholder="e.g. 1 cup"
                value={portionName}
                onChange={(e) => setPortionName(e.target.value)}
              />
              <div className="food-item__portion-row">
                <div className="food-item__portion-type">
                  <label className="food-item__radio-label">
                    <input
                      className="food-item__radio"
                      type="radio"
                      value="weight"
                      checked={portionType === "weight"}
                      onChange={() => setPortionType("weight")}
                    />
                    Weight (g)
                  </label>
                  <label className="food-item__radio-label">
                    <input
                      className="food-item__radio"
                      type="radio"
                      value="volume"
                      checked={portionType === "volume"}
                      onChange={() => setPortionType("volume")}
                    />
                    Volume (ml)
                  </label>
                </div>
                <input
                  className="food-item__edit-input food-item__edit-input--amount"
                  type="number"
                  value={isNaN(portionAmount) ? "" : portionAmount}
                  onChange={(e) => setPortionAmount(e.target.valueAsNumber)}
                  onKeyDown={(e) => {
                    if (e.key === "e" || e.key === "E") e.preventDefault();
                  }}
                  placeholder="e.g. 250"
                />
                <button
                  className="food-item__portion-btn"
                  type="button"
                  disabled={!portionName || isNaN(portionAmount)}
                  onClick={() => {
                    onEdit({
                      ...food,
                      common_portions: [
                        ...food.common_portions,
                        {
                          name: portionName,
                          amount:
                            portionType === "weight"
                              ? { type: "weight", grams: portionAmount }
                              : { type: "volume", milliliters: portionAmount },
                        },
                      ],
                    });
                    setPortionName("");
                    setPortionAmount(NaN);
                  }}
                >
                  Add portion
                </button>
              </div>
            </div>
          </div>
          <div className="food-item__edit-actions">
            <button
              className="food-item__action-btn food-item__action-btn--primary"
              type="submit"
            >
              Save changes
            </button>
            <button
              className="food-item__action-btn food-item__action-btn--ghost"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  ) : (
    <tr className="food-item">
      <td className="food-item__cell food-item__cell--name">
        {highlightMatch(food.name, matchIndices)}
      </td>
      <td className="food-item__cell food-item__cell--value">
        {food.calories_per_100g}
      </td>
      <td className="food-item__cell food-item__cell--value">{food.carbs}%</td>
      <td className="food-item__cell food-item__cell--value">
        {food.protein}%
      </td>
      <td className="food-item__cell food-item__cell--value">{food.fat}%</td>
      <td className="food-item__cell food-item__cell--actions">
        <button
          className="food-item__btn food-item__btn--edit"
          type="button"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
        <button
          className="food-item__btn food-item__btn--remove"
          type="button"
          onClick={() => onDelete()}
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export function FoodList({
  foods,
  onDeleteFood,
  onEdit,
}: {
  foods: Array<FoodItem>;
  onDeleteFood: (i: number) => void;
  onEdit: (food: FoodItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filteredFoods = foods
    .map((food, originalIndex) => {
      const matchIndices = fuzzyMatch(query, food.name);
      return matchIndices === null
        ? null
        : { food, originalIndex, matchIndices };
    })
    .filter((entry) => entry !== null);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFoods.length / FOOD_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages - 1);
  const pageStart = currentPage * FOOD_PAGE_SIZE;
  const pageItems = filteredFoods.slice(pageStart, pageStart + FOOD_PAGE_SIZE);

  return (
    <div className="section food-list">
      <div className="section__header">
        <h2 className="section__title">Food items</h2>
      </div>
      <input
        className="food-list__filter"
        type="text"
        placeholder="Filter food items..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
      />
      <div className="food-list__table-wrapper">
        <table className="food-list__table">
          <thead>
            <tr>
              <th className="food-list__th food-list__th--name">Name</th>
              <th className="food-list__th">kcal / 100g</th>
              <th className="food-list__th">Carbs %</th>
              <th className="food-list__th">Protein %</th>
              <th className="food-list__th">Fat %</th>
              <th className="food-list__th food-list__th--actions"></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map(({ food, originalIndex, matchIndices }) => (
              <FoodListItem
                key={originalIndex}
                food={food}
                matchIndices={matchIndices}
                onDelete={() => onDeleteFood(originalIndex)}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="food-list__pagination">
        <button
          className="food-list__pagination-btn"
          type="button"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <span className="food-list__pagination-info">
          Page {currentPage + 1} of {totalPages} · {filteredFoods.length} items
        </span>
        <button
          className="food-list__pagination-btn"
          type="button"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

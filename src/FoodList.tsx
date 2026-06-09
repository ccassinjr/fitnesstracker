import { useState, type FormEvent, type ReactElement } from "react";
import type { FoodItem } from "./types";
import { showPortion } from "./utils";
import { fuzzyMatch, fuzzyScore, highlightMatch } from "./fuzzy";
import "./styles/food.css";

const FOOD_PAGE_SIZE = 10;

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
  const [portionsChanged, setPortionsChanged] = useState(false);

  const hasChanges =
    name !== food.name ||
    caloriesPer100g !== food.calories_per_100g ||
    carbs !== food.carbs ||
    protein !== food.protein ||
    fat !== food.fat ||
    portionsChanged;

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onEdit({
      id: food.id,
      name,
      calories_per_100g: caloriesPer100g,
      carbs,
      protein,
      fat,
      common_portions: food.common_portions,
    });
    setIsEditing(false);
    setPortionsChanged(false);
  }

  return isEditing ? (
    <li className="food-list__item food-list__item--editing">
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
            <label className="food-item__edit-label">
              Carbohydrates per 100g
            </label>
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
            <label className="food-item__edit-label">Protein per 100g</label>
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
            <label className="food-item__edit-label">Fat per 100g</label>
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
                    onClick={() => {
                      onEdit({
                        ...food,
                        common_portions: food.common_portions.filter(
                          (_, index) => index !== i,
                        ),
                      });
                      setPortionsChanged(true);
                    }}
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
            <p className="food-item__portion-hint">
              Enter a name and amount to add a portion.
            </p>
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
                placeholder="e.g. 250"
                value={isNaN(portionAmount) ? "" : portionAmount}
                onChange={(e) => setPortionAmount(e.target.valueAsNumber)}
                onKeyDown={(e) => {
                  if (e.key === "e" || e.key === "E") e.preventDefault();
                }}
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
                  setPortionsChanged(true);
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
            disabled={!hasChanges}
          >
            Save changes
          </button>
          <button
            className="food-item__action-btn food-item__action-btn--ghost"
            type="button"
            onClick={() => {
              setIsEditing(false);
              setPortionsChanged(false);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </li>
  ) : (
    <li className="food-list__item">
      <div className="food-list__item-header">
        <span className="food-list__item-name">
          {highlightMatch(food.name, matchIndices)}
        </span>
        <div className="food-list__item-actions">
          <button
            className="food-list__item-btn food-list__item-btn--edit"
            type="button"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button
            className="food-list__item-btn food-list__item-btn--remove"
            type="button"
            onClick={() => onDelete()}
          >
            Remove
          </button>
        </div>
      </div>
      <div className="food-list__item-macros">
        <div className="food-list__item-macro">
          <span className="food-list__item-macro-value food-list__item-macro-value--accent">
            {food.calories_per_100g}
          </span>
          <span className="food-list__item-macro-label">kcal</span>
        </div>
        <div className="food-list__item-macro">
          <span className="food-list__item-macro-value">{food.carbs}g</span>
          <span className="food-list__item-macro-label">carbs</span>
        </div>
        <div className="food-list__item-macro">
          <span className="food-list__item-macro-value">{food.protein}g</span>
          <span className="food-list__item-macro-label">protein</span>
        </div>
        <div className="food-list__item-macro">
          <span className="food-list__item-macro-value">{food.fat}g</span>
          <span className="food-list__item-macro-label">fat</span>
        </div>
      </div>
    </li>
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

  const filteredFoods =
    query.trim() === ""
      ? []
      : foods
          .map((food, originalIndex) => {
            const matchIndices = fuzzyMatch(query, food.name);
            if (matchIndices === null) return null;
            const score = fuzzyScore(matchIndices, food.name);
            return score < 18
              ? null
              : { food, originalIndex, matchIndices, score };
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
        placeholder="Search food items..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
      />
      {query.trim() !== "" && filteredFoods.length === 0 ? (
        <p className="food-list__empty">No results for "{query}".</p>
      ) : filteredFoods.length > 0 ? (
        <>
          <ul className="food-list__items">
            {pageItems.map(({ food, originalIndex, matchIndices }) => (
              <FoodListItem
                key={originalIndex}
                food={food}
                matchIndices={matchIndices}
                onDelete={() => onDeleteFood(originalIndex)}
                onEdit={onEdit}
              />
            ))}
          </ul>
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
              Page {currentPage + 1} of {totalPages} · {filteredFoods.length}{" "}
              items
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
        </>
      ) : null}
    </div>
  );
}

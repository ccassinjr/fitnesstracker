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
  const [portionAmount, setPortionAmount] = useState(0);
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
    <tr>
      <td colSpan={6}>
        <form onSubmit={handleSave}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="number"
            value={caloriesPer100g}
            onChange={(e) => setCaloriesPer100g(e.target.valueAsNumber)}
          />
          <input
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.valueAsNumber)}
          />
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.valueAsNumber)}
          />
          <input
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.valueAsNumber)}
          />
          {food.common_portions.length === 0 ? (
            <p>No portions added yet.</p>
          ) : (
            food.common_portions.map((portion, i) => (
              <div key={i}>
                {portion.name} - {showPortion(portion.amount)}
                <button
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
                  Delete
                </button>
              </div>
            ))
          )}
          <input
            type="text"
            placeholder="Portion name"
            value={portionName}
            onChange={(e) => setPortionName(e.target.value)}
          />
          <label>
            <input
              type="radio"
              value="weight"
              checked={portionType === "weight"}
              onChange={() => setPortionType("weight")}
            />
            Weight (g)
          </label>
          <label>
            <input
              type="radio"
              value="volume"
              checked={portionType === "volume"}
              onChange={() => setPortionType("volume")}
            />
            Volume (ml)
          </label>
          <input
            type="number"
            value={portionAmount}
            onChange={(e) => setPortionAmount(e.target.valueAsNumber)}
          />
          <button
            type="button"
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
              setPortionAmount(0);
            }}
          >
            Add portion
          </button>
          <button type="submit">Save</button>
          <button onClick={() => setIsEditing(false)} type="button">
            Cancel
          </button>
        </form>
      </td>
    </tr>
  ) : (
    <tr>
      <td>{highlightMatch(food.name, matchIndices)}</td>
      <td>{food.calories_per_100g}</td>
      <td>{food.carbs}</td>
      <td>{food.protein}</td>
      <td>{food.fat}</td>
      <td>
        <button onClick={() => setIsEditing(true)}>Edit</button>
        <button onClick={() => onDelete()}>Delete</button>
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
    <>
      <h2>Food List</h2>
      <input
        type="text"
        placeholder="Filter foods..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setPage(0);
        }}
      />
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Calories per 100g</td>
            <td>Carbs</td>
            <td>Protein</td>
            <td>Fat</td>
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
      <div>
        <button
          type="button"
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <span>
          {" "}
          Page {currentPage + 1} of {totalPages} ({filteredFoods.length}{" "}
          items){" "}
        </span>
        <button
          type="button"
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
        >
          Next
        </button>
      </div>
    </>
  );
}

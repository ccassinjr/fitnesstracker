import { useState, type FormEvent } from "react";
import type { Database, SetDatabase } from "./types";
import { titleCase } from "./utils";

export function AddFoodItem({
  database,
  setDatabase,
}: {
  database: Database;
  setDatabase: SetDatabase;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [caloriesPer100g, setCaloriesPer100g] = useState(NaN);
  const [carbs, setCarbs] = useState(NaN);
  const [protein, setProtein] = useState(NaN);
  const [fat, setFat] = useState(NaN);

  function handleAddFood(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDatabase({
      ...database,
      foods: [
        ...database.foods,
        {
          id: Date.now(),
          name: titleCase(name),
          calories_per_100g: caloriesPer100g,
          carbs,
          protein,
          fat,
          common_portions: [],
        },
      ],
    });
    handleCancel();
  }

  function handleCancel() {
    setIsOpen(false);
    setName("");
    setCaloriesPer100g(NaN);
    setCarbs(NaN);
    setProtein(NaN);
    setFat(NaN);
  }

  return (
    <div className="section food-form">
      <div className="section__header">
        <h2 className="section__title">New food item</h2>
        {!isOpen && (
          <button
            className="food-form__toggle"
            type="button"
            onClick={() => setIsOpen(true)}
          >
            Add
          </button>
        )}
      </div>
      {isOpen && (
        <form className="food-form__form" onSubmit={handleAddFood}>
          <div className="food-form__field">
            <label className="food-form__label">Name</label>
            <input
              className="food-form__input"
              name="name"
              type="text"
              placeholder="e.g. Chicken breast"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="food-form__field">
            <label className="food-form__label">Calories per 100g</label>
            <input
              className="food-form__input"
              name="calories_per_100g"
              type="number"
              placeholder="e.g. 165"
              required
              value={isNaN(caloriesPer100g) ? "" : caloriesPer100g}
              onChange={(e) => setCaloriesPer100g(e.target.valueAsNumber)}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E") e.preventDefault();
              }}
            />
          </div>
          <div className="food-form__field">
            <label className="food-form__label">Carbohydrates per 100g</label>
            <input
              className="food-form__input"
              name="carbs"
              type="number"
              placeholder="e.g. 12"
              required
              value={isNaN(carbs) ? "" : carbs}
              onChange={(e) => setCarbs(e.target.valueAsNumber)}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E") e.preventDefault();
              }}
            />
          </div>
          <div className="food-form__field">
            <label className="food-form__label">Protein per 100g</label>
            <input
              className="food-form__input"
              name="protein"
              type="number"
              placeholder="e.g. 31"
              required
              value={isNaN(protein) ? "" : protein}
              onChange={(e) => setProtein(e.target.valueAsNumber)}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E") e.preventDefault();
              }}
            />
          </div>
          <div className="food-form__field">
            <label className="food-form__label">Fat per 100g</label>
            <input
              className="food-form__input"
              name="fat"
              type="number"
              placeholder="e.g. 4"
              required
              value={isNaN(fat) ? "" : fat}
              onChange={(e) => setFat(e.target.valueAsNumber)}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E") e.preventDefault();
              }}
            />
          </div>
          <div className="food-form__actions">
            <button
              className="food-form__btn food-form__btn--primary"
              type="submit"
              disabled={
                !name ||
                isNaN(caloriesPer100g) ||
                isNaN(carbs) ||
                isNaN(protein) ||
                isNaN(fat)
              }
            >
              Save food item
            </button>
            <button
              className="food-form__btn food-form__btn--ghost"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

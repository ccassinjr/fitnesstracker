import { useState, type FormEvent } from "react";
import type { Database, SetDatabase } from "./types";

export function AddFoodItem({
  database,
  setDatabase,
}: {
  database: Database;
  setDatabase: SetDatabase;
}) {
  const [name, setName] = useState("");
  const [caloriesPer100g, setCaloriesPer100g] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);

  function handleAddFood(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDatabase({
      ...database,
      foods: [
        ...database.foods,
        {
          id: Date.now(),
          name,
          calories_per_100g: caloriesPer100g,
          carbs,
          protein,
          fat,
          common_portions: [],
        },
      ],
    });
    // reset the form.
    setName("");
    setCaloriesPer100g(0);
    setCarbs(0);
    setProtein(0);
    setFat(0);
  }
  return (
    <>
      <h2>Add Food Item</h2>
      <form onSubmit={handleAddFood}>
        <div>
          <label>Food Name</label>
          <input
            name="name"
            type="text"
            placeholder="Food name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Calories (per 100g)</label>
          <input
            name="calories_per_100g"
            type="number"
            placeholder="Calories per 100g"
            required
            value={caloriesPer100g}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              if (!isNaN(v)) setCaloriesPer100g(v);
            }}
          />
        </div>
        <div>
          <label>Carbs</label>
          <input
            name="carbs"
            type="number"
            placeholder="carbs"
            required
            value={carbs}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              if (!isNaN(v)) setCarbs(v);
            }}
          />
        </div>
        <div>
          <label>Protein</label>
          <input
            name="protein"
            type="number"
            placeholder="protein"
            required
            value={protein}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              if (!isNaN(v)) setProtein(v);
            }}
          />
        </div>
        <div>
          <label>Fat</label>
          <input
            name="fat"
            type="number"
            placeholder="fat"
            required
            value={fat}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              if (!isNaN(v)) setFat(v);
            }}
          />
        </div>
        <div>
          <button type="submit">Add food item</button>
        </div>
      </form>
    </>
  );
}

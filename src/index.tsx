import { useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";

type Database = {
  physicalInfo: PhysicalInfo;
  foods: Array<FoodItem>;
};
type Percentage = number;

type Timestamp = number;
type Grams = number;
type Milliliters = number;
type WeightEntry = { weight: Grams; timestamp: Timestamp };
type FitnessLevel =
  | {
      type: "FitnessCategory";
      category: "sedentary" | "moderately active" | "active" | "very active";
    }
  | { type: "EnergyExpenditure"; daily_expenditure_calories: number };

type DateT = { day: number; month: number; year: number };
type Centimeters = number;

type PhysicalInfo = {
  name: string;
  height: Centimeters;
  sex: "male" | "female" | "other";
  birthdate: DateT;
  fitness_level: FitnessLevel;
  weight: Array<WeightEntry>;
};

type FoodPortion = {
  name: string;
  amount: PortionAmount;
};

type PortionAmount =
  | { type: "weight"; grams: Grams }
  | { type: "volume"; milliliters: Milliliters };

type FoodItem = {
  name: string;
  calories_per_100g: number;
  carbs: Percentage;
  protein: Percentage;
  fat: Percentage;
  common_portions: Array<FoodPortion>;
};

const initialDatabase: Database = {
  physicalInfo: {
    name: "Carlos Junior",
    height: 181,
    sex: "male",
    birthdate: { day: 26, month: 7, year: 1994 },
    fitness_level: { type: "FitnessCategory", category: "moderately active" },
    weight: [{ weight: 77000, timestamp: 1776016587021 }],
  },
  foods: [],
};

function showTimestamp(timestamp: Timestamp): string {
  return new Date(timestamp).toString();
}

function showWeight(grams: Grams): string {
  if (grams < 1000) {
    return grams + " g";
  }
  return grams / 1000 + " kg";
}

function App() {
  const [database, setDatabase] = useState<Database>(initialDatabase);

  function handleUpdatePhysicalInfo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const weight = formData.get("weight");
    if (weight == null || typeof weight !== "string") {
      throw new Error("Missing required weight field");
    }
    setDatabase((db) => ({
      ...db,
      physicalInfo: {
        ...db.physicalInfo,
        weight: [
          ...db.physicalInfo.weight,
          { weight: parseInt(weight, 10), timestamp: Date.now() },
        ],
      },
    }));
    form.reset();
  }

  function handleAddFood(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name");
    if (name == null || typeof name !== "string") {
      throw new Error("Missing required name field");
    }
    const calories_per_100g = formData.get("calories_per_100g");
    if (calories_per_100g == null || typeof calories_per_100g !== "string") {
      throw new Error("Missing required calories_per_100g field");
    }
    const carbs = formData.get("carbs");
    if (carbs == null || typeof carbs !== "string") {
      throw new Error("Missing required carbs field");
    }
    const protein = formData.get("protein");
    if (protein == null || typeof protein !== "string") {
      throw new Error("Missing required protein field");
    }
    const fat = formData.get("fat");
    if (fat == null || typeof fat !== "string") {
      throw new Error("Missing required fat field");
    }
    setDatabase((db) => ({
      ...db,
      foods: [
        ...db.foods,
        {
          name,
          calories_per_100g: parseInt(calories_per_100g, 10),
          carbs: parseInt(carbs, 10),
          protein: parseInt(protein, 10),
          fat: parseInt(fat, 10),
          common_portions: [],
        },
      ],
    }));
    form.reset();
  }

  const { physicalInfo } = database;
  const lastWeight = physicalInfo.weight[physicalInfo.weight.length - 1];

  return (
    <>
      <h1>Fitness Tracker</h1>
      <h2>Physical Info</h2>
      <p>Name: {physicalInfo.name}</p>
      <p>Sex: {physicalInfo.sex}</p>
      <p>Height: {physicalInfo.height} cm</p>
      <p>
        Birthdate: {physicalInfo.birthdate.day}/{physicalInfo.birthdate.month}/
        {physicalInfo.birthdate.year}
      </p>
      <p>
        Fitness level:{" "}
        {physicalInfo.fitness_level.type === "FitnessCategory"
          ? physicalInfo.fitness_level.category
          : physicalInfo.fitness_level.daily_expenditure_calories + " kcal/day"}
      </p>
      <p>
        Latest weight:{" "}
        {lastWeight !== undefined ? lastWeight.weight / 1000 + " kg" : "N/A"}
      </p>
      <table>
        <thead>
          <tr>
            <td>Weight</td>
            <td>Date</td>
          </tr>
        </thead>
        <tbody>
          {physicalInfo.weight.map((entry, i) => (
            <tr key={i}>
              <td>{showWeight(entry.weight)}</td>
              <td>{showTimestamp(entry.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />

      <h2>Edit Physical info</h2>
      <form onSubmit={handleUpdatePhysicalInfo}>
        <h3>Add new weight measurement</h3>
        <input
          name="weight"
          type="number"
          placeholder="Weight in grams"
          required
        />
        <button type="submit">Add weight measurement</button>
      </form>

      <h2>Add Food Item</h2>
      <form onSubmit={handleAddFood}>
        <input name="name" type="text" placeholder="Food name" required />
        <input
          name="calories_per_100g"
          type="text"
          placeholder="Calories per 100g"
          required
        />
        <input name="carbs" type="text" placeholder="carbs" required />
        <input name="protein" type="text" placeholder="protein" required />
        <input name="fat" type="text" placeholder="fat" required />
        <button type="submit">Add food item</button>
      </form>
    </>
  );
}

const rootEl = document.getElementById("root");
if (rootEl == null) {
  throw new Error("Missing root element");
}
createRoot(rootEl).render(<App />);

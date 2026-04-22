import { useState, type FormEvent, type ReactElement } from "react";
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

function PhysicalInfo({
  physicalInfo,
}: {
  physicalInfo: PhysicalInfo;
}): ReactElement {
  const lastWeight = physicalInfo.weight[physicalInfo.weight.length - 1];
  return (
    <>
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
    </>
  );
}

function EditPhysicalInfo({
  database,
  setDatabase,
}: {
  database: Database;
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
}) {
  const [weight, setWeight] = useState(0);

  function handleUpdatePhysicalInfo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDatabase({
      ...database,
      physicalInfo: {
        ...database.physicalInfo,
        weight: [
          ...database.physicalInfo.weight,
          { weight, timestamp: Date.now() },
        ],
      },
    });
    setWeight(0);
  }

  return (
    <>
      <h2>Edit Physical info</h2>
      <form onSubmit={handleUpdatePhysicalInfo}>
        <h3>Add new weight measurement</h3>
        <input
          name="weight"
          type="number"
          placeholder="Weight in grams"
          required
          value={weight}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            if (!isNaN(v)) setWeight(v);
          }}
        />
        <button type="submit">Add weight measurement</button>
      </form>
    </>
  );
}

function AddFoodItem({
  database,
  setDatabase,
}: {
  database: Database;
  setDatabase: React.Dispatch<React.SetStateAction<Database>>;
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
        <input
          name="name"
          type="text"
          placeholder="Food name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <button type="submit">Add food item</button>
      </form>
    </>
  );
}

function App() {
  const [database, setDatabase] = useState<Database>(initialDatabase);

  return (
    <>
      <h1>Fitness Tracker</h1>
      <PhysicalInfo physicalInfo={database.physicalInfo} />
      <hr />
      <EditPhysicalInfo database={database} setDatabase={setDatabase} />
      <hr />
      <AddFoodItem database={database} setDatabase={setDatabase} />
    </>
  );
}

const rootEl = document.getElementById("root");
if (rootEl == null) {
  throw new Error("Missing root element");
}

// @ts-expect-error
function ExampleApp() {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return <h1 onClick={() => setIsOpen(false)}> IS OPEN </h1>;
  } else {
    return <h1 onClick={() => setIsOpen(true)}> IS CLOSED </h1>;
  }
}

createRoot(rootEl).render(<App />);

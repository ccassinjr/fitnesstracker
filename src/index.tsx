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

// Convert an object of class names into a string.
function cn(classes: Record<string, boolean>): string {
  return Object.keys(classes)
    .filter((k) => classes[k])
    .join(" ");
}

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
  setDatabase,
  database,
}: {
  physicalInfo: PhysicalInfo;
  setDatabase: SetDatabase;
  database: Database;
}): ReactElement {
  const lastWeight = physicalInfo.weight[physicalInfo.weight.length - 1];
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(physicalInfo.name);
  const [sex, setSex] = useState(physicalInfo.sex);
  const [height, setHeight] = useState(physicalInfo.height);
  const [birthdate, setBirthdate] = useState(physicalInfo.birthdate);
  const [fitnessLevel, setFitnessLevel] = useState(physicalInfo.fitness_level);
  const [fitnessType, setFitnessType] = useState(
    physicalInfo.fitness_level.type,
  );
  const [weight, setWeight] = useState(0);
  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDatabase({
      ...database,
      physicalInfo: {
        ...database.physicalInfo,
        name: name,
        sex: sex,
        height: height,
        birthdate: birthdate,
        fitness_level: fitnessLevel,
      },
    });
    setIsEditing(false);
  }
  function handleAddWeight() {
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
    <section className="physical-info">
      <div className="physical-info__header">
        <h2 className="physical-info__title">Physical Information</h2>
        {!isEditing && (
          <button
            className="physical-info__edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>
      {isEditing ? (
        <form className="physical-info__form" onSubmit={handleSave}>
          <div className="physical-info__field">
            <label className="physical-info__label">Name</label>
            <input
              className="physical-info__input"
              name="name"
              type="text"
              placeholder="Your name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="physical-info__field">
            <label className="physical-info__label">Sex</label>
            <select
              className="physical-info__select"
              value={sex}
              onChange={(e) =>
                setSex(e.target.value as "male" | "female" | "other")
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="physical-info__field">
            <label className="physical-info__label">Height (cm)</label>
            <input
              className="physical-info__input"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.valueAsNumber)}
            />
          </div>

          <div className="physical-info__field">
            <span className="physical-info__label">Date of birth</span>
            <div className="physical-info__dob-group">
              <div className="physical-info__dob-field">
                <label className="physical-info__dob-label">Day</label>
                <input
                  className="physical-info__input physical-info__input--dob"
                  type="number"
                  value={birthdate.day}
                  onChange={(e) =>
                    setBirthdate({ ...birthdate, day: e.target.valueAsNumber })
                  }
                />
              </div>
              <div className="physical-info__dob-field">
                <label className="physical-info__dob-label">Month</label>
                <input
                  className="physical-info__input physical-info__input--dob"
                  type="number"
                  value={birthdate.month}
                  onChange={(e) =>
                    setBirthdate({
                      ...birthdate,
                      month: e.target.valueAsNumber,
                    })
                  }
                />
              </div>
              <div className="physical-info__dob-field">
                <label className="physical-info__dob-label">Year</label>
                <input
                  className="physical-info__input physical-info__input--dob"
                  type="number"
                  value={birthdate.year}
                  onChange={(e) =>
                    setBirthdate({ ...birthdate, year: e.target.valueAsNumber })
                  }
                />
              </div>
            </div>
          </div>

          <div className="physical-info__field">
            <span className="physical-info__label">Activity level</span>
            <div className="physical-info__radio-group">
              <label className="physical-info__radio-label">
                <input
                  className="physical-info__radio"
                  type="radio"
                  value="FitnessCategory"
                  checked={fitnessType === "FitnessCategory"}
                  onChange={() => setFitnessType("FitnessCategory")}
                />
                Category
              </label>
              <label className="physical-info__radio-label">
                <input
                  className="physical-info__radio"
                  type="radio"
                  value="EnergyExpenditure"
                  checked={fitnessType === "EnergyExpenditure"}
                  onChange={() => setFitnessType("EnergyExpenditure")}
                />
                Daily energy expenditure
              </label>
            </div>

            {fitnessType === "FitnessCategory" ? (
              <div className="physical-info__field physical-info__field--nested">
                <label className="physical-info__label">
                  Activity category
                </label>
                <select
                  className="physical-info__select"
                  value={
                    fitnessLevel.type === "FitnessCategory"
                      ? fitnessLevel.category
                      : "sedentary"
                  }
                  onChange={(e) =>
                    setFitnessLevel({
                      type: "FitnessCategory",
                      category: e.target.value as
                        | "sedentary"
                        | "moderately active"
                        | "active"
                        | "very active",
                    })
                  }
                >
                  <option value="sedentary">Sedentary</option>
                  <option value="moderately active">Moderately active</option>
                  <option value="active">Active</option>
                  <option value="very active">Very active</option>
                </select>
              </div>
            ) : (
              <div className="physical-info__field physical-info__field--nested">
                <label className="physical-info__label">
                  Calories burned per day (kcal)
                </label>
                <input
                  className="physical-info__input"
                  type="number"
                  value={
                    fitnessLevel.type === "EnergyExpenditure"
                      ? fitnessLevel.daily_expenditure_calories
                      : 0
                  }
                  onChange={(e) =>
                    setFitnessLevel({
                      type: "EnergyExpenditure",
                      daily_expenditure_calories: e.target.valueAsNumber,
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="physical-info__divider" />
          <div className="physical-info__field">
            <label className="physical-info__label">Weight (kg)</label>
            <input
              className="physical-info__input"
              name="weight"
              type="number"
              placeholder="e.g. 82.5"
              value={weight}
              onChange={(e) => {
                const v = e.target.valueAsNumber;
                if (!isNaN(v)) setWeight(v);
              }}
            />
          </div>

          <button
            className="physical-info__btn physical-info__btn--secondary"
            type="button"
            onClick={handleAddWeight}
          >
            Log weight
          </button>

          <div className="physical-info__actions">
            <button
              className="physical-info__btn physical-info__btn--primary"
              type="submit"
            >
              Save changes
            </button>
            <button
              className="physical-info__btn physical-info__btn--ghost"
              onClick={() => setIsEditing(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="physical-info__display">
          <dl className="physical-info__stats">
            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Name</dt>
              <dd className="physical-info__stat-value">{physicalInfo.name}</dd>
            </div>
            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Sex</dt>
              <dd className="physical-info__stat-value">{physicalInfo.sex}</dd>
            </div>
            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Height</dt>
              <dd className="physical-info__stat-value">
                {physicalInfo.height} cm
              </dd>
            </div>
            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Date of birth</dt>
              <dd className="physical-info__stat-value">
                {physicalInfo.birthdate.day}/{physicalInfo.birthdate.month}/
                {physicalInfo.birthdate.year}
              </dd>
            </div>
            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Activity level</dt>
              <dd className="physical-info__stat-value">
                {physicalInfo.fitness_level.type === "FitnessCategory"
                  ? physicalInfo.fitness_level.category
                  : `${physicalInfo.fitness_level.daily_expenditure_calories} kcal/day`}
              </dd>
            </div>

            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Latest weight</dt>
              <dd className="physical-info__stat-value">
                {lastWeight !== undefined
                  ? `${lastWeight.weight / 1000} kg`
                  : "Not logged"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="physical-info__weight-history">
        <h3 className="physical-info__weight-history-title">Weight history</h3>
        <table className="physical-info__table">
          <thead className="physical-info__table-head">
            <tr>
              <th className="physical-info__table-header">Weight</th>
              <th className="physical-info__table-header">Date</th>
            </tr>
          </thead>
          <tbody className="physical-info__table-body">
            {physicalInfo.weight.map((entry, i) => (
              <tr className="physical-info__table-row" key={i}>
                <td className="physical-info__table-cell">
                  {showWeight(entry.weight)}
                </td>
                <td className="physical-info__table-cell">
                  {showTimestamp(entry.timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AddFoodItem({
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

function FoodList({
  foods,
  onDeleteFood,
}: {
  foods: Array<FoodItem>;
  onDeleteFood: (i: number) => void;
}) {
  return (
    <>
      <h2>Food List</h2>
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
          {foods.map((food, i) => (
            <tr key={i}>
              <td>{food.name}</td>
              <td>{food.calories_per_100g}</td>
              <td>{food.carbs}</td>
              <td>{food.protein}</td>
              <td>{food.fat}</td>
              <td>
                <button onClick={() => onDeleteFood(i)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const DB_KEY = "database";

function loadDatabase(): Database | null {
  const found = window.localStorage.getItem(DB_KEY);
  if (found === null) {
    return null;
  }

  const database = JSON.parse(found) as Database;
  return database;
}

function saveDatabase(database: Database): void {
  window.localStorage.setItem(DB_KEY, JSON.stringify(database));
}

const TAB_KEY = "tab";

function loadTab(): AppTabs | null {
  const found = window.localStorage.getItem(TAB_KEY);
  if (found === null) {
    return null;
  }

  const database = JSON.parse(found) as AppTabs;
  return database;
}

function saveTab(tab: AppTabs): void {
  window.localStorage.setItem(TAB_KEY, JSON.stringify(tab));
}

type AppTabs = "Home" | "PhysicalInfo" | "FoodItems";

type SetDatabase = (db: Database) => void;

function App() {
  const [database, setDatabaseState] = useState<Database>(
    loadDatabase() ?? initialDatabase,
  );
  const [selectedTab, setSelectedTabState] = useState<AppTabs>(
    loadTab() ?? "Home",
  );
  const [hasReset, setHasReset] = useState(false);

  function setSelectedTab(tab: AppTabs): void {
    setSelectedTabState(tab);
    saveTab(tab);
  }

  function setDatabase(db: Database): void {
    setDatabaseState(db);
    saveDatabase(db);
  }

  function deleteFood(i: number): void {
    setDatabase({
      ...database,
      foods: database.foods.filter((_, index) => index !== i),
    });
  }

  return (
    <>
      <div className="app">
        <header className="app__header">
          <h1 className="app__title">Fitness Tracker</h1>
          <button
            className="app__reset"
            onClick={() => {
              setDatabase(initialDatabase);
              setHasReset(true);
              setTimeout(() => {
                setHasReset(false);
              }, 3000);
            }}
          >
            Reset
          </button>
          {hasReset ? (
            <p className="app__reset-confirm">Database has been reset</p>
          ) : null}
        </header>
        <nav className="app__nav">
          <ul className="tabs">
            <li
              className={cn({
                tabs__tab: true,
                "tabs__tab--active": selectedTab === "Home",
              })}
              onClick={() => setSelectedTab("Home")}
            >
              Home
            </li>
            <li
              className={cn({
                tabs__tab: true,
                "tabs__tab--active": selectedTab === "PhysicalInfo",
              })}
              onClick={() => setSelectedTab("PhysicalInfo")}
            >
              Physical Info
            </li>
            <li
              className={cn({
                tabs__tab: true,
                "tabs__tab--active": selectedTab === "FoodItems",
              })}
              onClick={() => setSelectedTab("FoodItems")}
            >
              Food Items
            </li>
          </ul>
        </nav>
        <main className="app__content">
          {viewTab(selectedTab, database, setDatabase, deleteFood)}
        </main>
      </div>
    </>
  );
}

function viewTab(
  tab: AppTabs,
  database: Database,
  setDatabase: SetDatabase,
  deleteFood: (i: number) => void,
): ReactElement {
  switch (tab) {
    case "Home":
      return <p>Welcome to Fitness Tracker</p>;
    case "PhysicalInfo":
      return (
        <>
          <PhysicalInfo
            physicalInfo={database.physicalInfo}
            setDatabase={setDatabase}
            database={database}
          />
        </>
      );
    case "FoodItems":
      return (
        <>
          <FoodList foods={database.foods} onDeleteFood={deleteFood} />
          <hr />
          <AddFoodItem database={database} setDatabase={setDatabase} />
        </>
      );
    default:
      tab satisfies never;
      throw new Error(`Invalid tab name: '${tab}'`);
  }
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

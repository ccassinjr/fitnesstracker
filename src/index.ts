type Database = {
  physicalInfo: PhysicalInfo;
};

type Timestamp = number;
type Grams = number;
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

const database: Database = {
  physicalInfo: {
    name: "Carlos Junior",
    height: 181,
    sex: "male",
    birthdate: { day: 26, month: 7, year: 1994 },
    fitness_level: { type: "FitnessCategory", category: "moderately active" },
    weight: [{ weight: 77000, timestamp: 1776016587021 }],
  },
};

function handleUpdatePhysicalInfo(e: SubmitEvent) {
  e.preventDefault();
  if (e.target == null) {
    throw new Error("Missing event target");
  } else if (!(e.target instanceof HTMLFormElement)) {
    throw new Error("Unexpected target type");
  }
  const formData = new FormData(e.target);
  const weight = formData.get("weight");
  if (weight == null || typeof weight !== "string") {
    throw new Error("Missing required weight field");
  }

  database.physicalInfo.weight.push({
    weight: parseInt(weight, 10),
    timestamp: Date.now(),
  });
  render(database, document.body);
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

// This function takes a Datbase and an HTML element, and
// displays the database's content inside the given HTML element.
function render(db: Database, element: HTMLElement) {
  const weight = db.physicalInfo.weight;
  const lastWeight = weight[weight.length - 1];

  function weightEntryToRow(entry: WeightEntry): string {
    return `
      <tr>
      <td>${showWeight(entry.weight)}</td>
      <td>${showTimestamp(entry.timestamp)}</td>
      </tr>
      `;
  }

  element.innerHTML = `
  <h2>Physical Info</h2>
  <p>Name: ${db.physicalInfo.name}
  <p>Sex: ${db.physicalInfo.sex}</p>
  <p>Height: ${db.physicalInfo.height} cm</p>
  <p>Birthdate: ${db.physicalInfo.birthdate.day}/${db.physicalInfo.birthdate.month}/${db.physicalInfo.birthdate.year}</p>
  <p>Fitness level: ${db.physicalInfo.fitness_level.type === "FitnessCategory" ? db.physicalInfo.fitness_level.category : db.physicalInfo.fitness_level.daily_expenditure_calories + " kcal/day"}</p>
  <p>Latest weight: ${lastWeight !== undefined ? lastWeight.weight / 1000 + " kg" : "N/A"}</p>
  <table>
    <thead>
      <tr>
        <td>Weight</td>
        <td>Date</td>
      </tr>
    </thead>
    <tbody>
      ${db.physicalInfo.weight.map(weightEntryToRow).join("\n")}
    </tbody>
  </table>
  <hr/>
 
  <h2>Edit Physical info</h2>
  <form onsubmit="handleUpdatePhysicalInfo(event)">
    <h3>Add new weight measurement</h3>
    <input name="weight" type="number" placeholder="Weight in grams" required/>
    <button type="submit">Add weight measurement</button>
  </form>
  `;
}

render(database, document.body);

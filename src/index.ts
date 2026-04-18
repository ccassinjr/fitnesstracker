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
// This function takes a Datbase and an HTML element, and
// displays the database's content inside the given HTML element.
function render(db: Database, element: HTMLElement) {
  const weight = db.physicalInfo.weight;
  const lastWeight = weight[weight.length - 1];
  element.innerHTML = `
  <h2>Physical Info</h2>
  <p>Name: ${db.physicalInfo.name}
  <p>Sex: ${db.physicalInfo.sex}</p>
  <p>Height: ${db.physicalInfo.height} cm</p>
  <p>Birthdate: ${db.physicalInfo.birthdate.day}/${db.physicalInfo.birthdate.month}/${db.physicalInfo.birthdate.year}</p>
  <p>Fitness level: ${db.physicalInfo.fitness_level.type === "FitnessCategory" ? db.physicalInfo.fitness_level.category : db.physicalInfo.fitness_level.daily_expenditure_calories + " kcal/day"}</p>
  <p>Latest weight: ${lastWeight !== undefined ? lastWeight.weight / 1000 + " kg" : "N/A"}</p>`;
}

render(database, document.body);

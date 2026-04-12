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

const ccassin: PhysicalInfo = {
  name: "Carlos Junior",
  height: 181,
  sex: "male",
  birthdate: { day: 26, month: 7, year: 1994 },
  fitness_level: { type: "FitnessCategory", category: "moderately active" },
  weight: [{ weight: 77000, timestamp: 1776016587021 }],
};
console.log(ccassin);

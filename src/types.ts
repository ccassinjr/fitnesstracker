export type Database = {
  physicalInfo: PhysicalInfo;
  foods: Array<FoodItem>;
  meals: Array<MealEntry>;
  exercises: Array<Exercise>;
  routines: Array<Routine>;
  sessions: Array<WorkoutSession>;
};

export type GramsPer100g = number;
export type Timestamp = number;
export type Grams = number;
export type Milliliters = number;
export type WeightEntry = { weight: Grams; timestamp: Timestamp };

export type FitnessLevel =
  | {
      type: "FitnessCategory";
      category: "sedentary" | "moderately active" | "active" | "very active";
    }
  | { type: "EnergyExpenditure"; daily_expenditure_calories: number };

export type DateT = { day: number; month: number; year: number };
export type Centimeters = number;
export type FoodId = number;

export type PhysicalInfo = {
  name: string;
  height: Centimeters;
  sex: "male" | "female" | "other";
  birthdate: DateT;
  fitness_level: FitnessLevel;
  weight: Array<WeightEntry>;
};

export type FoodPortion = {
  name: string;
  amount: PortionAmount;
};

export type PortionAmount =
  | { type: "weight"; grams: Grams }
  | { type: "volume"; milliliters: Milliliters };

export type FoodItem = {
  id: FoodId;
  name: string;
  calories_per_100g: number;
  carbs: GramsPer100g;
  protein: GramsPer100g;
  fat: GramsPer100g;
  common_portions: Array<FoodPortion>;
};

export type MealEntry = {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  foods: Array<MealFoodEntry>;
  time: Timestamp;
};

export type MealFoodEntry = {
  food: FoodId;
  quantity: PortionAmount;
};

export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "full body";

export type ExerciseCategory = "strength" | "cardio";

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup?: MuscleGroup;
  isRoundBased?: boolean;
  notes?: string;
};

export type RoutineExercise = {
  exerciseId: string;
  order: number;
};

export type Routine = {
  id: string;
  name: string;
  exercises: RoutineExercise[];
};

export type StrengthSet = {
  id: string;
  reps: number;
  weightKg: number;
};

export type CardioData = {
  durationMinutes: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
  rpe?: number;
  rounds?: number;
  roundDurationMinutes?: number;
  restDurationMinutes?: number;
  notes?: string;
};

export type SessionEntry = {
  exerciseId: string;
  order: number;
  sets?: StrengthSet[];
  cardio?: CardioData;
};

export type WorkoutSession = {
  id: string;
  routineId?: string;
  date: string;
  notes?: string;
  entries: SessionEntry[];
};

export type TopNav = "Home" | "Nutrition" | "Training" | "Log" | "Profile";
export type NutritionTab = "FoodItems" | "Meals";
export type TrainingTab = "Exercises" | "Routines" | "Sessions";

export type MealType = MealEntry["type"];
export type SetDatabase = (db: Database) => void;

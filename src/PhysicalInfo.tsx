import { useState, type FormEvent, type ReactElement } from "react";
import type { PhysicalInfo, Database, SetDatabase } from "./types";
import { showTimestamp, showWeight } from "./utils";
import "./styles/physical-info.css";

export function PhysicalInfo({
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
  const [height, setHeight] = useState(
    physicalInfo.height === 0 ? NaN : physicalInfo.height,
  );
  const [birthdate, setBirthdate] = useState(physicalInfo.birthdate);
  const [fitnessLevel, setFitnessLevel] = useState(physicalInfo.fitness_level);
  const [fitnessType, setFitnessType] = useState(
    physicalInfo.fitness_level.type,
  );
  const [weight, setWeight] = useState(NaN);
  const [weightLogged, setWeightLogged] = useState(false);
  const [touched, setTouched] = useState({
    height: false,
    day: false,
    month: false,
    year: false,
    weight: false,
  });
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
    setWeight(NaN);
    setIsEditing(false);
  }
  function handleAddWeight() {
    setDatabase({
      ...database,
      physicalInfo: {
        ...database.physicalInfo,
        weight: [
          ...database.physicalInfo.weight,
          { weight: weight * 1000, timestamp: Date.now() },
        ],
      },
    });
    setWeight(NaN);
    setWeightLogged(true);
  }
  const fitnessLevelChanged =
    fitnessLevel.type !== physicalInfo.fitness_level.type ||
    (fitnessLevel.type === "FitnessCategory" &&
      physicalInfo.fitness_level.type === "FitnessCategory" &&
      fitnessLevel.category !== physicalInfo.fitness_level.category) ||
    (fitnessLevel.type === "EnergyExpenditure" &&
      physicalInfo.fitness_level.type === "EnergyExpenditure" &&
      fitnessLevel.daily_expenditure_calories !==
        physicalInfo.fitness_level.daily_expenditure_calories);

  const hasChanges =
    name !== physicalInfo.name ||
    sex !== physicalInfo.sex ||
    (isNaN(height)
      ? physicalInfo.height !== 0
      : height !== physicalInfo.height) ||
    (birthdate.day === 0
      ? physicalInfo.birthdate.day !== 0
      : birthdate.day !== physicalInfo.birthdate.day) ||
    (birthdate.month === 0
      ? physicalInfo.birthdate.month !== 0
      : birthdate.month !== physicalInfo.birthdate.month) ||
    (birthdate.year === 0
      ? physicalInfo.birthdate.year !== 0
      : birthdate.year !== physicalInfo.birthdate.year) ||
    fitnessLevelChanged ||
    weightLogged;

  const formValid =
    name.trim().length > 0 &&
    !isNaN(height) &&
    height >= 50 &&
    height <= 250 &&
    birthdate.day >= 1 &&
    birthdate.day <= 31 &&
    birthdate.month >= 1 &&
    birthdate.month <= 12 &&
    birthdate.year >= 1900 &&
    birthdate.year <= 2026;

  return (
    <section className="section physical-info">
      <div className="section__header">
        <h2 className="section__title">Physical information</h2>
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
        <form className="physical-info__form" noValidate onSubmit={handleSave}>
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
              min="50"
              max="250"
              placeholder="e.g. 181"
              value={height}
              onChange={(e) => setHeight(e.target.valueAsNumber)}
              onBlur={() => setTouched((t) => ({ ...t, height: true }))}
            />
            {touched.height && (height < 50 || height > 250) && (
              <p className="physical-info__error">
                Enter a height between 50 and 250 cm.
              </p>
            )}
          </div>

          <div className="physical-info__field">
            <span className="physical-info__label">Date of birth</span>
            <div className="physical-info__dob-group">
              <div className="physical-info__dob-field">
                <label className="physical-info__dob-label">Day</label>
                <input
                  className="physical-info__input physical-info__input--dob"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1"
                  value={birthdate.day === 0 ? "" : birthdate.day}
                  onChange={(e) =>
                    setBirthdate({ ...birthdate, day: e.target.valueAsNumber })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, day: true }))}
                />
                {touched.day &&
                  birthdate.day !== 0 &&
                  (birthdate.day < 1 || birthdate.day > 31) && (
                    <p className="physical-info__error">
                      Enter a day between 1 and 31.
                    </p>
                  )}
              </div>
              <div className="physical-info__dob-field">
                <label className="physical-info__dob-label">Month</label>
                <input
                  className="physical-info__input physical-info__input--dob"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="1"
                  value={birthdate.month === 0 ? "" : birthdate.month}
                  onChange={(e) =>
                    setBirthdate({
                      ...birthdate,
                      month: e.target.valueAsNumber,
                    })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, month: true }))}
                />
                {touched.month &&
                  birthdate.month !== 0 &&
                  (birthdate.month < 1 || birthdate.month > 12) && (
                    <p className="physical-info__error">
                      Enter a month between 1 and 12.
                    </p>
                  )}
              </div>
              <div className="physical-info__dob-field">
                <label className="physical-info__dob-label">Year</label>
                <input
                  className="physical-info__input physical-info__input--dob"
                  type="number"
                  min="1900"
                  max="2026"
                  placeholder="1990"
                  value={birthdate.year === 0 ? "" : birthdate.year}
                  onChange={(e) =>
                    setBirthdate({ ...birthdate, year: e.target.valueAsNumber })
                  }
                  onBlur={() => setTouched((t) => ({ ...t, year: true }))}
                />
                {touched.year &&
                  birthdate.year !== 0 &&
                  (birthdate.year < 1900 || birthdate.year > 2026) && (
                    <p className="physical-info__error">
                      Enter a year between 1900 and 2026.
                    </p>
                  )}
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
              min="0"
              step="0.1"
              placeholder="e.g. 77"
              value={isNaN(weight) ? "" : weight}
              onChange={(e) => setWeight(e.target.valueAsNumber)}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E") e.preventDefault();
              }}
              onBlur={(e) => {
                setTouched((t) => ({ ...t, weight: true }));
                const v = e.target.valueAsNumber;
                if (!isNaN(v) && v <= 0) setWeight(NaN);
              }}
            />
            {touched.weight && !isNaN(weight) && weight <= 0 && (
              <p className="physical-info__error">
                Enter a weight greater than 0.
              </p>
            )}
          </div>

          <button
            className="physical-info__btn physical-info__btn--secondary"
            type="button"
            disabled={isNaN(weight) || weight <= 0}
            onClick={handleAddWeight}
          >
            Log weight
          </button>

          <div className="physical-info__actions">
            <button
              className="physical-info__btn physical-info__btn--primary"
              type="submit"
              disabled={!hasChanges || !formValid}
            >
              Save changes
            </button>
            <button
              className="physical-info__btn physical-info__btn--ghost"
              onClick={() => {
                setIsEditing(false);
                setWeightLogged(false);
                setWeight(NaN);
              }}
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
              <dd className="physical-info__stat-value">
                {physicalInfo.name || "Not set"}
              </dd>
            </div>
            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Sex</dt>
              <dd className="physical-info__stat-value">{physicalInfo.sex}</dd>
            </div>
            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Height</dt>
              <dd className="physical-info__stat-value">
                {physicalInfo.height === 0 || isNaN(physicalInfo.height)
                  ? "Not set"
                  : `${physicalInfo.height} cm`}
              </dd>
            </div>
            <div className="physical-info__stat">
              <dt className="physical-info__stat-label">Date of birth</dt>
              <dd className="physical-info__stat-value">
                {physicalInfo.birthdate.day === 0
                  ? "Not set"
                  : `${physicalInfo.birthdate.day}/${physicalInfo.birthdate.month}/${physicalInfo.birthdate.year}`}
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
        <ul className="physical-info__weight-list">
          {physicalInfo.weight.map((entry, i) => (
            <li key={i} className="physical-info__weight-item">
              <span className="physical-info__weight-value">
                {showWeight(entry.weight)}
              </span>
              <span className="physical-info__weight-date">
                {showTimestamp(entry.timestamp)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

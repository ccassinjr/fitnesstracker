import { useState, type FormEvent, type ReactElement } from "react";
import type { PhysicalInfo, Database, SetDatabase } from "./types";
import { showTimestamp, showWeight } from "./utils";

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
  const [height, setHeight] = useState(physicalInfo.height);
  const [birthdate, setBirthdate] = useState(physicalInfo.birthdate);
  const [fitnessLevel, setFitnessLevel] = useState(physicalInfo.fitness_level);
  const [fitnessType, setFitnessType] = useState(
    physicalInfo.fitness_level.type,
  );
  const [weight, setWeight] = useState(NaN);
  const [weightLogged, setWeightLogged] = useState(false);
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
    height !== physicalInfo.height ||
    birthdate.day !== physicalInfo.birthdate.day ||
    birthdate.month !== physicalInfo.birthdate.month ||
    birthdate.year !== physicalInfo.birthdate.year ||
    fitnessLevelChanged ||
    weightLogged;

  return (
    <section className="section physical-info">
      <div className="section__header">
        <h2 className="section__title">Physical Information</h2>
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
              min="0"
              step="0.1"
              placeholder="e.g. 77"
              value={isNaN(weight) ? "" : weight}
              onChange={(e) => setWeight(e.target.valueAsNumber)}
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "E") e.preventDefault();
              }}
            />
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
              disabled={!hasChanges}
            >
              Save changes
            </button>
            <button
              className="physical-info__btn physical-info__btn--ghost"
              onClick={() => {
                setIsEditing(false);
                setWeightLogged(false);
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

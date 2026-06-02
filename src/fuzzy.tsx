import type { ReactElement } from "react";

export function fuzzyMatch(query: string, target: string): Array<number> | null {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const indices: Array<number> = [];
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      indices.push(ti);
      qi++;
    }
  }
  return qi === q.length ? indices : null;
}

// Higher score = better match. Rewards consecutive matches and matches at
// the start of words; penalises gaps and longer targets.
export function fuzzyScore(indices: Array<number>, target: string): number {
  const first = indices[0];
  if (first === undefined) return 0;
  let score = 0;
  let lastIdx = -2;
  for (const idx of indices) {
    if (idx === lastIdx + 1) {
      score += 5;
    }
    if (idx === 0) {
      score += 10;
    } else {
      const prev = target[idx - 1];
      if (prev === " " || prev === "-" || prev === "_") {
        score += 5;
      }
    }
    lastIdx = idx;
  }
  score -= first * 0.5;
  score -= target.length * 0.05;
  return score;
}

export function highlightMatch(
  name: string,
  matchIndices: Array<number>,
): ReactElement {
  const indexSet = new Set(matchIndices);
  return (
    <>
      {Array.from(name).map((ch, i) =>
        indexSet.has(i) ? (
          <strong key={i}>{ch}</strong>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </>
  );
}

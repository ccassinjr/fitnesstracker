import type { Timestamp, Grams, PortionAmount } from "./types";

// Convert an object of class names into a string.
export function cn(classes: Record<string, boolean>): string {
  return Object.keys(classes)
    .filter((k) => classes[k])
    .join(" ");
}

export function showTimestamp(timestamp: Timestamp): string {
  return new Date(timestamp).toString();
}

export function showWeight(grams: Grams): string {
  if (grams < 1000) {
    return grams + " g";
  }
  return grams / 1000 + " kg";
}

export function showPortion(portion: PortionAmount): string {
  if (portion.type === "weight") return showWeight(portion.grams);
  return `${portion.milliliters} ml`;
}

export function showTotalQuantity(grams: number, milliliters: number): string {
  const parts: Array<string> = [];
  if (grams > 0) parts.push(showWeight(grams));
  if (milliliters > 0) parts.push(`${milliliters} ml`);
  return parts.length === 0 ? "0 g" : parts.join(" + ");
}

export function formatTotal(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

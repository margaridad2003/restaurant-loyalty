import { randomBytes } from "crypto";

export function generateQrToken(): string {
  return randomBytes(16).toString("hex");
}

export function getFreeMealProgress(totalMeals: number): number {
  return totalMeals % 5;
}

export function didEarnFreeMeal(prevTotalMeals: number, newTotalMeals: number): boolean {
  return Math.floor(newTotalMeals / 5) > Math.floor(prevTotalMeals / 5);
}

export type MealPeriod = "breakfast" | "dinner";

/** Returns the current meal period, or null if outside opening hours. */
export function getMealPeriod(now: Date = new Date()): MealPeriod | null {
  const totalMin = now.getHours() * 60 + now.getMinutes();
  if (totalMin >= 7 * 60 + 30 && totalMin < 11 * 60) return "breakfast";
  if (totalMin >= 19 * 60 && totalMin < 23 * 60) return "dinner";
  return null;
}

/** Returns the loyalty credit for a given period. */
export function getMealCredit(period: MealPeriod): number {
  return period === "breakfast" ? 0.5 : 1;
}

/** Returns the start/end timestamps for a period on the given day. */
export function getPeriodBounds(now: Date, period: MealPeriod): { start: Date; end: Date } {
  const start = new Date(now);
  const end = new Date(now);
  if (period === "breakfast") {
    start.setHours(7, 30, 0, 0);
    end.setHours(11, 0, 0, 0);
  } else {
    start.setHours(19, 0, 0, 0);
    end.setHours(23, 0, 0, 0);
  }
  return { start, end };
}

/** Returns the dollar amount saved*/
export function calculateDiscount(price: number, percent: number): number {
  if (!Number.isFinite(price) || price < 0) throw new Error("Invalid price");
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new Error("Discount must be between 0 and 100");
  return Math.round((price * percent / 100 + Number.EPSILON) * 100) / 100;
}

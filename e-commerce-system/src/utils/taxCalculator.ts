/** tax 3% for groceries, 4.75% for others */
export function calculateTax(amount: number, category: string = ""): number {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid amount");
  const rate = category.toLowerCase() === "groceries" ? 3 : 4.75;
  return Math.round((amount * rate / 100 + Number.EPSILON) * 100) / 100;
}

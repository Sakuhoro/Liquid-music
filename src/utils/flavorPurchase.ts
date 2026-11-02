// Flavorings are purchased as whole 10 ml bottles. Small floating-point noise
// at an exact multiple of 10 ml must not add another bottle to the purchase.
export function flavorPurchaseCost(requiredMl: number, pricePer10ml: number): number {
  if (!Number.isFinite(requiredMl) || requiredMl <= 0) return 0;
  const bottles = Math.max(1, Math.ceil(requiredMl / 10 - 1e-9));
  return bottles * pricePer10ml;
}

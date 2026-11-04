// Purchase whole bottles of the supplier's actual pack size.
export function flavorPurchaseCost(requiredMl: number, bottlePrice: number, packVolumeMl = 10): number {
  if (!Number.isFinite(requiredMl) || requiredMl <= 0) return 0;
  if (!Number.isFinite(packVolumeMl) || packVolumeMl <= 0) return 0;
  return Math.max(1, Math.ceil(requiredMl / packVolumeMl - 1e-9)) * bottlePrice;
}

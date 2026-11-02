import type { PlacedOrder } from '../types';

// subtotal is the final payable amount mapped from the API, after both discounts.
export function calculateOrderRevenue(orders: PlacedOrder[]): number {
  return orders.reduce((sum, order) => {
    const buyer = (order.user?.telegram ?? '').trim().replace(/^@/, '').toLowerCase();
    return buyer === 'white_blooming' ? sum : sum + order.subtotal;
  }, 0);
}

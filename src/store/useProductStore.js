import { create } from 'zustand';
import { COLLECTIONS } from '../data/products';

/**
 * Calculates current season string based on real-world date month
 * Spring: March (2) - May (4)
 * Summer: June (5) - August (7)
 * Autumn: September (8) - November (10)
 * Winter: Dec (11) - Feb (1) -> maps to 'spring' as default active transition
 */
export const getCurrentRealSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'spring'; // Winter default active seasonal transition
};

export const useProductStore = create((set, get) => ({
  // Theme State ('light' | 'dark')
  theme: 'dark',
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    if (typeof document !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    return { theme: nextTheme };
  }),

  // Seasonal State Logic
  activeSeasonOverride: null, // Allows manual override for testing seasons
  setSeasonOverride: (season) => set({ activeSeasonOverride: season }),

  getCurrentSeason: () => {
    const { activeSeasonOverride } = get();
    return activeSeasonOverride || getCurrentRealSeason();
  },

  // Helper to determine if a collection is active for purchase
  isCollectionActive: (collectionId) => {
    const collection = COLLECTIONS.find((c) => c.id === collectionId);
    if (!collection) return false;
    if (collection.type === 'permanent') return true;

    // Seasonal check
    const currentSeason = get().getCurrentSeason();
    return collection.season === currentSeason;
  },

  // Get active collections list (1 current seasonal + 2 permanent)
  getActiveCollections: () => {
    const currentSeason = get().getCurrentSeason();
    return COLLECTIONS.filter(
      (c) => c.type === 'permanent' || c.season === currentSeason
    );
  },

  // 3D POI Proximity & Selected Collection Modal State
  activePOI: null, // collection object when near a POI stand
  activeCollectionModal: null, // collection object when terminal interface is open
  setActivePOI: (poi) => set({ activePOI: poi }),
  openCollectionModal: (collection) => set({ activeCollectionModal: collection }),
  closeCollectionModal: () => set({ activeCollectionModal: null }),

  // Mobile Virtual Joystick State
  joystickVector: { x: 0, y: 0 },
  setJoystickVector: (vector) => set({ joystickVector: vector }),

  // Shopping Cart State
  cart: [],
  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  addToCart: (flavor, nicotine = '3mg', quantity = 1) => {
    const { isCollectionActive } = get();
    if (!isCollectionActive(flavor.collection)) {
      console.warn(`[Liquid Music] Cannot purchase archived flavor: ${flavor.title}`);
      return false;
    }

    set((state) => {
      const cartKey = `${flavor.id}-${nicotine}`;
      const existingIndex = state.cart.findIndex((item) => item.cartKey === cartKey);

      let updatedCart = [...state.cart];
      if (existingIndex > -1) {
        updatedCart[existingIndex].quantity += quantity;
      } else {
        updatedCart.push({
          cartKey,
          flavor,
          nicotine,
          quantity,
        });
      }
      return { cart: updatedCart, isCartOpen: true };
    });
    return true;
  },

  removeFromCart: (cartKey) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.cartKey !== cartKey),
    }));
  },

  updateQuantity: (cartKey, delta) => {
    set((state) => ({
      cart: state.cart
        .map((item) => {
          if (item.cartKey === cartKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    }));
  },

  getCartTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.flavor.price * item.quantity, 0);
  },

  getCartCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

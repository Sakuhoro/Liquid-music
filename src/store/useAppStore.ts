import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ProductItem,
  CartItem,
  VolumeType,
  NicotineType,
  AuthUser,
  PlacedOrder,
  CollectionName,
  CollectionVideosConfig,
  Recipe,
  FlavorPrice,
} from '../types';
import {
  INITIAL_PRODUCTS,
  VOLUME_PRICING,
  NICOTINE_PRICING,
} from '../data/products';

export const MOCK_EXISTING_USERS: AuthUser[] = [
  {
    name: 'Воронова Елена Дмитриевна',
    phone: '+7 (999) 111-22-33',
    telegram: '@White_blooming',
    registeredAt: '2026-01-15',
    role: 'ADMIN',
  },
  {
    name: 'Смирнов Алексей Викторович',
    phone: '+7 (916) 555-44-33',
    telegram: '@alex_vapor',
    registeredAt: '2026-02-10',
    role: 'USER',
  },
  {
    name: 'Ковалев Дмитрий Андреевич',
    phone: '+7 (925) 777-88-99',
    telegram: '@sound_master',
    registeredAt: '2026-03-01',
    role: 'USER',
  },
];

export const DEFAULT_COLLECTION_VIDEOS: CollectionVideosConfig = {
  Spring: '/videos/role-act-as-a-master-animato.mp4',
  Summer: '/videos/role-act-as-a-master-animato.mp4',
  Autumn: '/videos/night-head.mp4',
  'Permanent 1': '/videos/night-head.mp4',
  'Permanent 2': '/videos/night-head.mp4',
};

interface AppState {
  // Theme & Atmosphere
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // View state: Hero vs Catalog
  viewMode: 'hero' | 'catalog';
  setViewMode: (mode: 'hero' | 'catalog') => void;

  // Active Collection filter & Archive status
  activeCollection: CollectionName | 'All';
  setActiveCollection: (col: CollectionName | 'All') => void;
  archivedCollections: Record<CollectionName, boolean>;
  toggleArchiveCollection: (col: CollectionName) => void;
  setArchiveAllCollections: (archived: boolean) => void;
  isCollectionArchived: (col: CollectionName) => boolean;

  // Collection-Specific Cinematic Videos
  collectionVideos: CollectionVideosConfig;
  setCollectionVideo: (col: CollectionName, url: string) => void;

  // Background Music Controls
  darkMusicUrl: string;
  lightMusicUrl: string;
  setDarkMusicUrl: (url: string) => void;
  setLightMusicUrl: (url: string) => void;
  fetchAudioSettings: () => Promise<void>;
  saveAudioSettings: (darkUrl: string, lightUrl: string) => Promise<void>;
  isBgMusicPlaying: boolean;
  toggleBgMusic: () => void;
  setIsBgMusicPlaying: (playing: boolean) => void;

  // SoundCloud Player Integration
  soundCloudUrl: string;
  setSoundCloudUrl: (url: string) => void;
  isSoundCloudOpen: boolean;
  setIsSoundCloudOpen: (open: boolean) => void;

  // Admin Auth Logic (Protected: @White_blooming / 365Dca586)
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, pass: string) => boolean;
  adminLogout: () => void;
  isStudioModalOpen: boolean;
  setIsStudioModalOpen: (open: boolean) => void;

  // Products (Admin & Persistence ready)
  products: ProductItem[];
  fetchProducts: () => Promise<void>;
  updateProduct: (updated: ProductItem) => Promise<void>;
  addProduct: (newProd: ProductItem) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProducts: () => Promise<void>;

  // Recipes & Flavor Pricing Actions
  recipes: Recipe[];
  flavorPrices: FlavorPrice[];
  fetchRecipes: () => Promise<void>;
  saveRecipe: (productId: string, items: Recipe['items']) => Promise<void>;
  fetchFlavorPrices: () => Promise<void>;
  saveFlavorPrice: (vendor: string, name: string, pricePer10ml: number, currency?: string) => Promise<void>;
  deleteFlavorPrice: (key: string) => Promise<void>;

  // Active inspected product modal
  inspectedProduct: ProductItem | null;
  setInspectedProduct: (prod: ProductItem | null) => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: ProductItem, volume: VolumeType, nicotine: NicotineType) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartItemCount: () => number;

  // Authentication for Clients
  currentUser: AuthUser | null;
  existingUsers: AuthUser[];
  isAuthModalOpen: boolean;
  authModalContext: 'checkout' | 'account' | null;
  openAuthModal: (context?: 'checkout' | 'account') => void;
  closeAuthModal: () => void;
  authenticateUser: (
    name: string,
    phone: string,
    telegram: string,
    password?: string
  ) => { success: boolean; error?: string };
  logout: () => void;

  // Modals & Account
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;

  // Checkout & Orders
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: (open: boolean) => void;
  lastPlacedOrder: PlacedOrder | null;
  ordersHistory: PlacedOrder[];
  deleteOrderHistory: (orderId: string) => void;
  placeOrder: () => { success: boolean; requiresAuth?: boolean };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),

      // View state
      viewMode: 'hero',
      setViewMode: (viewMode) => set({ viewMode }),

      // Recipes & Flavor Prices
      recipes: [],
      flavorPrices: [],

      fetchRecipes: async () => {
        try {
          const res = await fetch('/api/recipes');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              set({ recipes: data });
            }
          }
        } catch (err) {
          console.warn('Failed to fetch recipes from backend API:', err);
        }
      },

      saveRecipe: async (productId, items) => {
        set((state) => {
          const existingIndex = state.recipes.findIndex((r) => r.productId === productId);
          const newRecipe: Recipe = { productId, items, updatedAt: new Date().toISOString() };
          let updatedRecipes: Recipe[];
          if (existingIndex >= 0) {
            updatedRecipes = [...state.recipes];
            updatedRecipes[existingIndex] = newRecipe;
          } else {
            updatedRecipes = [...state.recipes, newRecipe];
          }
          return { recipes: updatedRecipes };
        });

        try {
          await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, items }),
          });
        } catch (err) {
          console.error('Failed to save recipe via API:', err);
        }
      },

      fetchFlavorPrices: async () => {
        try {
          const res = await fetch('/api/flavor-prices');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              set({ flavorPrices: data });
            }
          }
        } catch (err) {
          console.warn('Failed to fetch flavor prices from backend API:', err);
        }
      },

      saveFlavorPrice: async (vendor, name, pricePer10ml, currency = 'RUB') => {
        const key = `${vendor.trim().toUpperCase()}:${name.trim().toLowerCase()}`;
        set((state) => {
          const existingIndex = state.flavorPrices.findIndex((fp) => fp.key === key);
          const newPrice: FlavorPrice = {
            key,
            vendor: vendor.trim(),
            name: name.trim(),
            pricePer10ml,
            currency,
            updatedAt: new Date().toISOString(),
          };
          let updatedPrices: FlavorPrice[];
          if (existingIndex >= 0) {
            updatedPrices = [...state.flavorPrices];
            updatedPrices[existingIndex] = newPrice;
          } else {
            updatedPrices = [...state.flavorPrices, newPrice];
          }
          return { flavorPrices: updatedPrices };
        });

        try {
          await fetch('/api/flavor-prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vendor, name, pricePer10ml, currency }),
          });
        } catch (err) {
          console.error('Failed to save flavor price via API:', err);
        }
      },

      deleteFlavorPrice: async (key) => {
        set((state) => ({
          flavorPrices: state.flavorPrices.filter((fp) => fp.key !== key),
        }));
        try {
          await fetch(`/api/flavor-prices/${encodeURIComponent(key)}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error('Failed to delete flavor price via API:', err);
        }
      },

      // Active collection & Archive status
      activeCollection: 'All',
      setActiveCollection: (activeCollection) => set({ activeCollection }),
      archivedCollections: {
        Spring: false,
        Summer: false,
        Autumn: false,
        'Permanent 1': false,
        'Permanent 2': false,
      },
      toggleArchiveCollection: (col) =>
        set((state) => ({
          archivedCollections: {
            ...state.archivedCollections,
            [col]: !state.archivedCollections[col],
          },
        })),
      setArchiveAllCollections: (archived) =>
        set({
          archivedCollections: {
            Spring: archived,
            Summer: archived,
            Autumn: archived,
            'Permanent 1': archived,
            'Permanent 2': archived,
          },
        }),
      isCollectionArchived: (col) => {
        const { archivedCollections } = get();
        return Boolean(archivedCollections?.[col]);
      },

      // Collection-specific video feeds
      collectionVideos: DEFAULT_COLLECTION_VIDEOS,
      setCollectionVideo: (col, url) =>
        set((state) => ({
          collectionVideos: {
            ...state.collectionVideos,
            [col]: url,
          },
        })),

      // Background Music
      darkMusicUrl: '/audio/evening-improvisation-with-ethera.mp3',
      lightMusicUrl: '/audio/fly-away-when-the-fog-settled-down.mp3',
      fetchAudioSettings: async () => {
        try {
          const res = await fetch('/api/settings/audio');
          if (res.ok) {
            const data = await res.json();
            if (data.value) {
              if (data.value.darkMusicUrl) set({ darkMusicUrl: data.value.darkMusicUrl });
              if (data.value.lightMusicUrl) set({ lightMusicUrl: data.value.lightMusicUrl });
            }
          }
        } catch (err) {
          console.warn('Failed to fetch audio settings from backend:', err);
        }
      },
      saveAudioSettings: async (darkUrl, lightUrl) => {
        set({ darkMusicUrl: darkUrl, lightMusicUrl: lightUrl });
        try {
          await fetch('/api/settings/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: { darkMusicUrl: darkUrl, lightMusicUrl: lightUrl } }),
          });
        } catch (err) {
          console.error('Failed to save audio settings to API:', err);
        }
      },
      setDarkMusicUrl: (url) => {
        const { lightMusicUrl, saveAudioSettings } = get();
        saveAudioSettings(url, lightMusicUrl);
      },
      setLightMusicUrl: (url) => {
        const { darkMusicUrl, saveAudioSettings } = get();
        saveAudioSettings(darkMusicUrl, url);
      },
      isBgMusicPlaying: true,
      toggleBgMusic: () =>
        set((state) => ({ isBgMusicPlaying: !state.isBgMusicPlaying })),
      setIsBgMusicPlaying: (isBgMusicPlaying) => set({ isBgMusicPlaying }),

      // SoundCloud URL & Player Modal
      soundCloudUrl: 'https://soundcloud.com/chilledcow/sets/lofi-hip-hop-beats',
      setSoundCloudUrl: (soundCloudUrl) => set({ soundCloudUrl }),
      isSoundCloudOpen: false,
      setIsSoundCloudOpen: (isSoundCloudOpen) => set({ isSoundCloudOpen }),

      // Admin Auth Logic
      isAdminLoggedIn: false,
      adminLogin: (username, pass) => {
        const cleanUser = username.trim();
        const cleanPass = pass.trim();
        if (
          (cleanUser === '@White_blooming' || cleanUser.toLowerCase() === '@white_blooming') &&
          cleanPass === '365Dca586'
        ) {
          set({ isAdminLoggedIn: true });
          return true;
        }
        return false;
      },
      adminLogout: () => set({ isAdminLoggedIn: false }),
      isStudioModalOpen: false,
      setIsStudioModalOpen: (isStudioModalOpen) => set({ isStudioModalOpen }),

      // Products (Admin & Persistence ready)
      products: INITIAL_PRODUCTS,

      fetchProducts: async () => {
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              set({ products: data });
            }
          }
        } catch (err) {
          console.warn('Failed to fetch products from backend API:', err);
        }
      },

      updateProduct: async (updated) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === updated.id ? updated : p)),
        }));
        try {
          await fetch(`/api/products/${encodeURIComponent(updated.id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated),
          });
        } catch (err) {
          console.error('Failed to update product via API:', err);
        }
      },

      addProduct: async (newProd) => {
        set((state) => ({
          products: [newProd, ...state.products],
        }));
        try {
          await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProd),
          });
        } catch (err) {
          console.error('Failed to add product via API:', err);
        }
      },

      deleteProduct: async (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        try {
          await fetch(`/api/products/${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error('Failed to delete product via API:', err);
        }
      },

      resetProducts: async () => {
        try {
          const res = await fetch('/api/products/reset', { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            set({ products: data });
            return;
          }
        } catch (err) {
          console.error('Failed to reset products via API:', err);
        }
        set({ products: INITIAL_PRODUCTS });
      },

      // Inspected product
      inspectedProduct: null,
      setInspectedProduct: (inspectedProduct) => set({ inspectedProduct }),

      // Cart
      cart: [],
      isCartOpen: false,
      setIsCartOpen: (isCartOpen) => set({ isCartOpen }),

      addToCart: (product, volume, nicotine) => {
        const itemId = `${product.id}-${volume}-${nicotine}`;
        const volPrice = VOLUME_PRICING[volume];
        const nicPrice = NICOTINE_PRICING[nicotine];
        const unitPrice = volPrice + nicPrice;

        set((state) => {
          const existing = state.cart.find((item) => item.id === itemId);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              isCartOpen: true,
            };
          }
          const newItem: CartItem = {
            id: itemId,
            product,
            volume,
            nicotine,
            volumePrice: volPrice,
            nicotinePrice: nicPrice,
            totalUnitPrice: unitPrice,
            quantity: 1,
          };
          return {
            cart: [...state.cart, newItem],
            isCartOpen: true,
          };
        });
      },

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        })),

      updateCartQuantity: (itemId, delta) =>
        set((state) => {
          const updated = state.cart
            .map((item) => {
              if (item.id === itemId) {
                const nextQty = item.quantity + delta;
                return nextQty > 0 ? { ...item, quantity: nextQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[];
          return { cart: updated };
        }),

      clearCart: () => set({ cart: [] }),

      getCartSubtotal: () => {
        const { cart } = get();
        return cart.reduce(
          (acc, item) => acc + item.totalUnitPrice * item.quantity,
          0
        );
      },

      getCartItemCount: () => {
        const { cart } = get();
        return cart.reduce((acc, item) => acc + item.quantity, 0);
      },

      // Client Authentication
      currentUser: null,
      existingUsers: MOCK_EXISTING_USERS,
      isAuthModalOpen: false,
      authModalContext: null,

      openAuthModal: (context = 'checkout') =>
        set({ isAuthModalOpen: true, authModalContext: context }),

      closeAuthModal: () =>
        set({ isAuthModalOpen: false, authModalContext: null }),

      authenticateUser: (name, phone, telegram, password) => {
        const { existingUsers, currentUser } = get();

        const cleanName = name.trim();
        const cleanPhone = phone.trim().replace(/[^\d+]/g, '');
        const cleanTelegram = telegram.trim().toLowerCase();
        const cleanPassword = password ? password.trim() : '';

        // Validate password length (min 9 characters)
        if (cleanPassword.length < 9) {
          return {
            success: false,
            error: 'Пароль должен содержать минимум 9 символов.',
          };
        }

        // Check if signing in as Admin
        const isAdmin =
          (cleanTelegram === '@white_blooming' || cleanTelegram === 'white_blooming') &&
          cleanPassword === '365Dca586';

        const role = isAdmin ? 'ADMIN' : 'USER';

        if (isAdmin) {
          set({ isAdminLoggedIn: true });
        }

        if (
          currentUser &&
          currentUser.telegram.toLowerCase() === cleanTelegram
        ) {
          set((state) => ({
            currentUser: { ...state.currentUser!, role },
          }));
          return { success: true };
        }

        const duplicateTelegram = existingUsers.find(
          (u) =>
            u.telegram.toLowerCase() === cleanTelegram &&
            u.telegram.toLowerCase() !== currentUser?.telegram.toLowerCase()
        );

        const duplicatePhone = existingUsers.find(
          (u) =>
            u.phone.replace(/[^\d+]/g, '') === cleanPhone &&
            u.phone.replace(/[^\d+]/g, '') !==
              currentUser?.phone.replace(/[^\d+]/g, '')
        );

        const duplicateName = existingUsers.find(
          (u) =>
            u.name.toLowerCase() === cleanName.toLowerCase() &&
            u.name.toLowerCase() !== currentUser?.name.toLowerCase()
        );

        if (duplicateTelegram || duplicatePhone || duplicateName) {
          // If existing user matching details, log them in
          const existingMatch = duplicateTelegram || duplicatePhone || duplicateName;
          if (existingMatch) {
            const userRole = existingMatch.role || (isAdmin ? 'ADMIN' : 'USER');
            set({
              currentUser: { ...existingMatch, role: userRole },
              isAdminLoggedIn: userRole === 'ADMIN',
              isAuthModalOpen: false,
            });
            return { success: true };
          }
        }

        const newUser: AuthUser = {
          name: cleanName,
          phone: phone.trim(),
          telegram: telegram.startsWith('@') ? telegram.trim() : `@${telegram.trim()}`,
          registeredAt: new Date().toISOString().split('T')[0],
          role,
        };

        set((state) => ({
          currentUser: newUser,
          existingUsers: [...state.existingUsers, newUser],
          isAdminLoggedIn: role === 'ADMIN',
          isAuthModalOpen: false,
        }));

        return { success: true };
      },

      logout: () =>
        set({
          currentUser: null,
          isAdminLoggedIn: false,
          isAccountModalOpen: false,
        }),

      // Account modal
      isAccountModalOpen: false,
      setIsAccountModalOpen: (isAccountModalOpen) => set({ isAccountModalOpen }),

      // Checkout
      isSuccessModalOpen: false,
      setIsSuccessModalOpen: (isSuccessModalOpen) => set({ isSuccessModalOpen }),
      lastPlacedOrder: null,
      ordersHistory: [
        {
          orderId: 'LM-849201',
          user: {
            name: 'Воронова Елена Дмитриевна',
            phone: '+7 (999) 111-22-33',
            telegram: '@White_blooming',
            registeredAt: '2026-01-15',
            role: 'ADMIN',
          },
          items: [
            {
              id: 'blue-raspberry-symphony-120ml-0mg',
              product: INITIAL_PRODUCTS[0],
              volume: '120ml',
              nicotine: '0mg',
              volumePrice: 600,
              nicotinePrice: 0,
              totalUnitPrice: 600,
              quantity: 2,
            },
            {
              id: 'vanilla-caramel-resonance-60ml-3mg',
              product: INITIAL_PRODUCTS[1],
              volume: '60ml',
              nicotine: '3mg',
              volumePrice: 400,
              nicotinePrice: 50,
              totalUnitPrice: 450,
              quantity: 1,
            },
          ],
          subtotal: 1650,
          createdAt: '2026-03-28 14:30',
          status: 'Pending Verification',
        },
        {
          orderId: 'LM-918234',
          user: {
            name: 'Смирнов Алексей Викторович',
            phone: '+7 (916) 555-44-33',
            telegram: '@alex_vapor',
            registeredAt: '2026-02-10',
            role: 'USER',
          },
          items: [
            {
              id: 'sakura-blossom-sonata-30ml-1.5mg',
              product: INITIAL_PRODUCTS[3],
              volume: '30ml',
              nicotine: '1.5mg',
              volumePrice: 300,
              nicotinePrice: 50,
              totalUnitPrice: 350,
              quantity: 3,
            },
            {
              id: 'nordic-frost-nocturne-120ml-6mg',
              product: INITIAL_PRODUCTS[5],
              volume: '120ml',
              nicotine: '6mg',
              volumePrice: 600,
              nicotinePrice: 100,
              totalUnitPrice: 700,
              quantity: 1,
            },
          ],
          subtotal: 1750,
          createdAt: '2026-03-29 09:15',
          status: 'Pending Verification',
        },
      ],

      deleteOrderHistory: (orderId: string) =>
        set((state) => ({
          ordersHistory: state.ordersHistory.filter((o) => o.orderId !== orderId),
        })),

      placeOrder: () => {
        const { currentUser, cart, getCartSubtotal } = get();

        if (!currentUser) {
          set({ isAuthModalOpen: true, authModalContext: 'checkout' });
          return { success: false, requiresAuth: true };
        }

        if (cart.length === 0) {
          return { success: false };
        }

        const subtotal = getCartSubtotal();
        const orderId = `LM-${Math.floor(100000 + Math.random() * 900000)}`;
        const newOrder: PlacedOrder = {
          orderId,
          user: currentUser,
          items: [...cart],
          subtotal,
          createdAt: new Date().toLocaleString('ru-RU'),
          status: 'Pending Verification',
        };

        set((state) => ({
          lastPlacedOrder: newOrder,
          ordersHistory: [newOrder, ...state.ordersHistory],
          cart: [],
          isCartOpen: false,
          isSuccessModalOpen: true,
        }));

        return { success: true };
      },
    }),
    {
      name: 'liquid-music-store-v5',
      partialize: (state) => ({
        theme: state.theme,
        cart: state.cart,
        currentUser: state.currentUser,
        existingUsers: state.existingUsers,
        ordersHistory: state.ordersHistory,
        collectionVideos: state.collectionVideos,
        darkMusicUrl: state.darkMusicUrl,
        lightMusicUrl: state.lightMusicUrl,
        soundCloudUrl: state.soundCloudUrl,
        products: state.products,
        recipes: state.recipes,
        flavorPrices: state.flavorPrices,
        isAdminLoggedIn: state.isAdminLoggedIn,
      }),
    }
  )
);

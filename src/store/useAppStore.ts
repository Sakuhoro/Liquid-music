import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ProductItem,
  CartItem,
  VolumeType,
  NicotineType,
  AuthUser,
  PlacedOrder,
  LoyaltyState,
  CollectionName,
  CollectionVideosConfig,
  Recipe,
  FlavorPrice,
  TelegramWidgetUser,
} from '../types';
import {
  INITIAL_PRODUCTS,
  VOLUME_PRICING,
  NICOTINE_PRICING,
} from '../data/products';

export const DEFAULT_COLLECTION_VIDEOS: CollectionVideosConfig = {
  Spring: '/videos/role-act-as-a-master-animato.mp4',
  Summer: '/videos/role-act-as-a-master-animato.mp4',
  Autumn: '/videos/night-head.mp4',
  'Permanent 1': '/videos/night-head.mp4',
  'Permanent 2': '/videos/night-head.mp4',
};

// The server returns an order with a flat item list keyed by productId, and
// prices frozen at purchase time. The UI works with CartItem and a nested
// product, so the row is reshaped here rather than in every component. subtotal
// stays the amount actually paid, which is what the admin revenue figures sum.
function toPlacedOrder(row: any, currentUser: AuthUser | null): PlacedOrder {
  return {
    orderId: row.orderId,
    user: row.user || currentUser || {
      name: '',
      phone: '',
      telegram: '',
      registeredAt: '',
    },
    items: (row.items || []).map((item: any) => ({
      id: `${item.productId}-${item.volume}-${item.nicotine}`,
      product: {
        id: item.productId,
        name: item.productName,
        image: item.productImage,
      } as any,
      volume: item.volume,
      nicotine: item.nicotine,
      volumePrice: item.volumePrice,
      nicotinePrice: item.nicotinePrice,
      totalUnitPrice: item.totalUnitPrice,
      quantity: item.quantity,
    })),
    subtotal: row.total,
    createdAt: new Date(row.createdAt).toLocaleString('ru-RU'),
    status: row.status,
    grossSubtotal: row.subtotal,
    discountPct: row.discountPct,
    discountAmount: row.discountAmount,
  };
}

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

  // Admin Auth Logic
  //
  // The admin gate is verified by the server, exactly like a normal login: the
  // browser posts the credentials to /api/auth/login, which compares them
  // against the bcrypt hash in the `users` table and returns the role. No
  // credential and no privileged identity is hardcoded here, so reading the
  // shipped JavaScript no longer grants access to the admin cabinet.
  isAdminLoggedIn: boolean;
  adminLogin: (username: string, pass: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
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

  // Transient notice shown after a composition joins the playlist. It carries
  // an id rather than just the name so that adding the same flavour twice in
  // a row still replays the notice instead of looking unchanged.
  playlistToast: { id: number; productName: string } | null;
  dismissPlaylistToast: () => void;

  // Authentication for Clients
  currentUser: AuthUser | null;
  isAuthModalOpen: boolean;
  authModalContext: 'checkout' | 'account' | null;
  openAuthModal: (context?: 'checkout' | 'account') => void;
  closeAuthModal: () => void;
  loginWithApi: (params: {
    telegramId: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  registerWithApi: (params: {
    fullName: string;
    phone: string;
    telegramId: string;
    password: string;
    rememberMe: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  // The signed object comes straight from the Telegram widget and is forwarded
  // untouched, because the server recomputes its signature over exactly these
  // fields. The phone rides alongside it, not inside it.
  loginWithTelegram: (params: {
    telegram: TelegramWidgetUser;
    phone?: string;
    rememberMe: boolean;
  }) => Promise<{ success: boolean; error?: string; needsPhone?: boolean }>;
  fetchTelegramConfig: () => Promise<{ enabled: boolean; username: string | null }>;
  hydrateSession: () => Promise<void>;
  logoutWithApi: () => Promise<void>;
  logout: () => void;

  // Modals & Account
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;

  // Checkout & Orders
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: (open: boolean) => void;
  lastPlacedOrder: PlacedOrder | null;
  ordersHistory: PlacedOrder[];
  adminOrders: PlacedOrder[];
  loyalty: LoyaltyState | null;
  isPlacingOrder: boolean;
  isLoadingOrders: boolean;
  fetchOrders: () => Promise<void>;
  fetchAdminOrders: () => Promise<void>;
  refreshLoyalty: () => Promise<void>;
  deleteOrderHistory: (orderId: string) => void;
  placeOrder: () => Promise<{ success: boolean; requiresAuth?: boolean; error?: string }>;
}

// Bumped per add, so the playlist notice replays on every addition. A module
// counter rather than one in state, since it is never read by the UI.
let playlistToastSeq = 0;

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
      adminLogin: async (username, pass) => {
        const telegramId = username.trim();
        if (!telegramId || !pass) return false;
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, password: pass, rememberMe: true }),
          });
          const data = await res.json();
          if (!res.ok || !data?.user) return false;
          // The server already validated the password against the bcrypt hash;
          // only its role decides whether the admin cabinet unlocks.
          if (data.user.role !== 'ADMIN') return false;
          set({
            currentUser: data.user as AuthUser,
            isAdminLoggedIn: true,
          });
          return true;
        } catch {
          return false;
        }
      },
      // Ends the server-side session too, otherwise the httpOnly cookie would
      // silently sign the admin back in on the next page load.
      adminLogout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
          console.warn('Failed to logout admin via API:', err);
        }
        set({ isAdminLoggedIn: false, currentUser: null });
      },
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
      playlistToast: null,
      dismissPlaylistToast: () => set({ playlistToast: null }),
      setIsCartOpen: (isCartOpen) => set({ isCartOpen }),

      addToCart: (product, volume, nicotine) => {
        const itemId = `${product.id}-${volume}-${nicotine}`;
        const volPrice = VOLUME_PRICING[volume];
        const nicPrice = NICOTINE_PRICING[nicotine];
        const unitPrice = volPrice + nicPrice;

        set((state) => {
          // Adding no longer throws the drawer open. It used to, which meant
          // the whole playlist covered the shelf on every single addition, so
          // picking three flavours in a row meant three full-screen
          // interruptions. The notice says the same thing without stealing
          // the view.
          playlistToastSeq += 1;
          const notice = { id: playlistToastSeq, productName: product.name };

          const existing = state.cart.find((item) => item.id === itemId);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              playlistToast: notice,
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
            playlistToast: notice,
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
      isAuthModalOpen: false,
      authModalContext: null,

      openAuthModal: (context = 'checkout') =>
        set({ isAuthModalOpen: true, authModalContext: context }),

      closeAuthModal: () =>
        set({ isAuthModalOpen: false, authModalContext: null }),

      hydrateSession: async () => {
        try {
          const res = await fetch('/api/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated && data.user) {
              const user: AuthUser = data.user;
              const isAdmin =
                user.role === 'ADMIN';
              set({
                currentUser: user,
                isAdminLoggedIn: isAdmin,
                loyalty: data.loyalty || null,
              });
              get().fetchOrders();
              if (isAdmin) get().fetchAdminOrders();
            }
          }
        } catch (err) {
          console.warn('Failed to hydrate session:', err);
        }
      },

      loginWithApi: async ({ telegramId, password, rememberMe }) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId, password, rememberMe }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.error || 'Ошибка входа в студию.' };
          }
          const user: AuthUser = data.user;
          const isAdmin =
            user.role === 'ADMIN';
          set({
            currentUser: user,
            isAdminLoggedIn: isAdmin,
            isAuthModalOpen: false,
            loyalty: data.loyalty || null,
          });
          get().fetchOrders();
          if (isAdmin) get().fetchAdminOrders();
          return { success: true };
        } catch (err) {
          return { success: false, error: 'Ошибка соединения с сервером.' };
        }
      },

      registerWithApi: async ({ fullName, phone, telegramId, password, rememberMe }) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, phone, telegramId, password, rememberMe }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false, error: data.error || 'Ошибка регистрации.' };
          }
          const user: AuthUser = data.user;
          const isAdmin =
            user.role === 'ADMIN';
          set({
            currentUser: user,
            isAdminLoggedIn: isAdmin,
            isAuthModalOpen: false,
            loyalty: data.loyalty || null,
          });
          get().fetchOrders();
          if (isAdmin) get().fetchAdminOrders();
          return { success: true };
        } catch (err) {
          return { success: false, error: 'Ошибка соединения с сервером.' };
        }
      },

      loginWithTelegram: async ({ telegram, phone, rememberMe }) => {
        try {
          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegram, phone, rememberMe }),
          });
          const data = await res.json();
          if (!res.ok) {
            return {
              success: false,
              error: data.error || 'Ошибка входа через Telegram.',
              needsPhone: Boolean(data.needsPhone),
            };
          }
          const user: AuthUser = data.user;
          const isAdmin = user.role === 'ADMIN';
          set({
            currentUser: user,
            isAdminLoggedIn: isAdmin,
            isAuthModalOpen: false,
            loyalty: data.loyalty || null,
          });
          get().fetchOrders();
          if (isAdmin) get().fetchAdminOrders();
          return { success: true };
        } catch (err) {
          return { success: false, error: 'Ошибка соединения с сервером.' };
        }
      },

      fetchTelegramConfig: async () => {
        try {
          const res = await fetch('/api/auth/telegram/config');
          if (!res.ok) return { enabled: false, username: null };
          const data = await res.json();
          return { enabled: Boolean(data.enabled), username: data.username || null };
        } catch {
          return { enabled: false, username: null };
        }
      },

      logoutWithApi: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
          console.warn('Failed to logout via API:', err);
        }
        set({
          currentUser: null,
          isAdminLoggedIn: false,
          isAccountModalOpen: false,
          ordersHistory: [],
          adminOrders: [],
          loyalty: null,
          lastPlacedOrder: null,
        });
      },

      logout: () =>
        set({
          currentUser: null,
          isAdminLoggedIn: false,
          isAccountModalOpen: false,
          ordersHistory: [],
          adminOrders: [],
          loyalty: null,
          lastPlacedOrder: null,
        }),

      // Account modal
      isAccountModalOpen: false,
      setIsAccountModalOpen: (isAccountModalOpen) => set({ isAccountModalOpen }),

      // Checkout
      isSuccessModalOpen: false,
      setIsSuccessModalOpen: (isSuccessModalOpen) => set({ isSuccessModalOpen }),
      lastPlacedOrder: null,
      // Orders come from the server, not from localStorage: they have to
      // survive a cache clear and follow the account to a second device. A
      // locally stored order also let anyone inflate their own loyalty balance
      // by editing the blob.
      ordersHistory: [],
      adminOrders: [],
      loyalty: null,
      isPlacingOrder: false,
      isLoadingOrders: false,

      fetchOrders: async () => {
        const { currentUser } = get();
        if (!currentUser) {
          set({ ordersHistory: [], loyalty: null });
          return;
        }
        set({ isLoadingOrders: true });
        try {
          const res = await fetch('/api/orders');
          if (res.status === 401) {
            set({ ordersHistory: [], loyalty: null, isLoadingOrders: false });
            return;
          }
          if (!res.ok) return;
          const data = await res.json();
          set({
            ordersHistory: (data.orders || []).map((row: any) =>
              toPlacedOrder(row, currentUser)
            ),
            loyalty: data.loyalty || null,
          });
        } catch (err) {
          console.warn('Failed to load orders:', err);
        } finally {
          set({ isLoadingOrders: false });
        }
      },

      fetchAdminOrders: async () => {
        const { currentUser } = get();
        if (!currentUser || currentUser.role !== 'ADMIN') {
          set({ adminOrders: [] });
          return;
        }
        try {
          const res = await fetch('/api/admin/orders');
          if (!res.ok) return;
          const data = await res.json();
          set({
            adminOrders: (data.orders || []).map((row: any) =>
              toPlacedOrder(row, currentUser)
            ),
          });
        } catch (err) {
          console.warn('Failed to load admin orders:', err);
        }
      },

      refreshLoyalty: async () => {
        const { currentUser } = get();
        if (!currentUser) return;
        try {
          const res = await fetch('/api/auth/me');
          if (!res.ok) return;
          const data = await res.json();
          if (data.loyalty) set({ loyalty: data.loyalty });
        } catch (err) {
          console.warn('Failed to refresh loyalty:', err);
        }
      },

      // Present for the admin table's clear-row affordance. The order itself
      // lives in the database, so this only drops it from the loaded list until
      // the next fetch brings it back.
      deleteOrderHistory: (orderId: string) =>
        set((state) => ({
          ordersHistory: state.ordersHistory.filter((o) => o.orderId !== orderId),
          adminOrders: state.adminOrders.filter((o) => o.orderId !== orderId),
        })),

      placeOrder: async () => {
        const { currentUser, cart } = get();

        if (!currentUser) {
          set({ isAuthModalOpen: true, authModalContext: 'checkout' });
          return { success: false, requiresAuth: true };
        }

        if (cart.length === 0) {
          return { success: false };
        }

        set({ isPlacingOrder: true });
        try {
          // Only the choices go up. Prices, the loyalty discount and the total
          // are all decided on the server.
          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: cart.map((item) => ({
                productId: item.product.id,
                volume: item.volume,
                nicotine: item.nicotine,
                quantity: item.quantity,
              })),
            }),
          });

          const data = await res.json().catch(() => ({}));

          if (res.status === 401) {
            set({ currentUser: null, isAdminLoggedIn: false });
            return { success: false, error: 'Сессия истекла. Войдите снова.' };
          }

          if (!res.ok) {
            return {
              success: false,
              error: data.error || 'Не удалось оформить заказ.',
            };
          }

          const placedOrder = toPlacedOrder(data.order, currentUser);
          set((state) => ({
            lastPlacedOrder: placedOrder,
            ordersHistory: [placedOrder, ...state.ordersHistory],
            loyalty: data.loyalty || state.loyalty,
            cart: [],
            isCartOpen: false,
            playlistToast: null,
            isSuccessModalOpen: true,
            isPlacingOrder: false,
          }));
          get().fetchAdminOrders();

          return { success: true };
        } catch (err) {
          return { success: false, error: 'Ошибка соединения с сервером.' };
        } finally {
          set({ isPlacingOrder: false });
        }
      },
    }),
    {
      name: 'liquid-music-store-v5',
      partialize: (state) => ({
        theme: state.theme,
        cart: state.cart,
        currentUser: state.currentUser,
        collectionVideos: state.collectionVideos,
        darkMusicUrl: state.darkMusicUrl,
        lightMusicUrl: state.lightMusicUrl,
        soundCloudUrl: state.soundCloudUrl,
        products: state.products,
        recipes: state.recipes,
        flavorPrices: state.flavorPrices,
        isAdminLoggedIn: state.isAdminLoggedIn,
      }),
      version: 7,
      // v6 and earlier kept orders in localStorage. They are no longer the
      // source of truth, so the stored copy is dropped on the next load and the
      // real history is fetched from the server instead.
      migrate: (persistedState) => {
        const state = persistedState as Partial<AppState>;
        return { ...state, ordersHistory: [], lastPlacedOrder: null } as AppState;
      },
    }
  )
);

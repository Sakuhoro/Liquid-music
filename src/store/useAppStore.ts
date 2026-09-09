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
  Spring:
    'https://upload.wikimedia.org/wikipedia/commons/1/14/Cloud_timelapse_in_New_Mexico.webm',
  Summer:
    'https://upload.wikimedia.org/wikipedia/commons/c/c6/Cumulus_timelapse_Skupowo-170324.webm',
  Autumn:
    'https://upload.wikimedia.org/wikipedia/commons/8/85/Winter_Timelapse_of_Clouds_Roiling_over_Rimrock_on_Okanagan_Mountain.webm',
  'Permanent 1':
    'https://upload.wikimedia.org/wikipedia/commons/8/80/JAPAN_Milk_Way_4K_-_Beautiful_Star_and_Sky_at_Night_Time_Lapse.webm',
  'Permanent 2':
    'https://upload.wikimedia.org/wikipedia/commons/0/05/Astrophotography_Timelapse.webm',
};

interface AppState {
  // Theme & Atmosphere
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // View state: Hero vs Catalog
  viewMode: 'hero' | 'catalog';
  setViewMode: (mode: 'hero' | 'catalog') => void;

  // Active Collection filter
  activeCollection: CollectionName | 'All';
  setActiveCollection: (col: CollectionName | 'All') => void;

  // Collection-Specific Cinematic Videos
  collectionVideos: CollectionVideosConfig;
  setCollectionVideo: (col: CollectionName, url: string) => void;

  // Background Music Controls
  darkMusicUrl: string;
  lightMusicUrl: string;
  setDarkMusicUrl: (url: string) => void;
  setLightMusicUrl: (url: string) => void;
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

  // Products (Admin ready)
  products: ProductItem[];
  updateProduct: (updated: ProductItem) => void;
  addProduct: (newProd: ProductItem) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;

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

      // Active collection
      activeCollection: 'All',
      setActiveCollection: (activeCollection) => set({ activeCollection }),

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
      setDarkMusicUrl: (url) => set({ darkMusicUrl: url }),
      setLightMusicUrl: (url) => set({ lightMusicUrl: url }),
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

      // Products (Admin ready)
      products: INITIAL_PRODUCTS,
      updateProduct: (updated) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === updated.id ? updated : p)),
        })),
      addProduct: (newProd) =>
        set((state) => ({
          products: [newProd, ...state.products],
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
      resetProducts: () => set({ products: INITIAL_PRODUCTS }),

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
      ordersHistory: [],

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
      name: 'liquid-music-store-v4',
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
        isAdminLoggedIn: state.isAdminLoggedIn,
      }),
    }
  )
);

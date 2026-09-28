export type VolumeType = '30ml' | '60ml' | '120ml';
export type NicotineType = '0mg' | '1.5mg' | '3mg' | '6mg';

export type CollectionName =
  | 'Spring'
  | 'Summer'
  | 'Autumn'
  | 'Permanent 1'
  | 'Permanent 2';

// Public-facing collection titles. Used instead of the internal "Permanent 1"/"Permanent 2" keys.
export const COLLECTION_TITLES: Partial<Record<CollectionName, string>> = {
  'Permanent 1': 'Bones of what you Believe',
  'Permanent 2': 'Velvet Distortion',
};

export const getCollectionTitle = (collection: CollectionName): string =>
  COLLECTION_TITLES[collection] ?? `${collection} Collection`;

export interface VolumeOption {
  volume: VolumeType;
  price: number; // in ₽
  label: string;
}

export interface NicotineOption {
  nicotine: NicotineType;
  price: number; // in ₽
  label: string;
}

export interface ProductItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string; // PNG/SVG/URL image asset
  basePrice: number; // base 30ml price
  category: CollectionName;
  musicalKey: string;
  bpm: number;
  opusNumber: string;
  aromaticChords: {
    top: string;
    heart: string;
    base: string;
  };
  accentColor: string;
  // Artwork scale inside the 80% vinyl label circle. Editable in the admin cabinet.
  artScale?: number;
  // SoundCloud track permalink played by the "Аккорды" button. When absent the
  // button falls back to the generated chord.
  soundCloudUrl?: string | null;
  isFeatured?: boolean;
}

export interface CartItem {
  id: string; // unique item id based on product + volume + nicotine
  product: ProductItem;
  volume: VolumeType;
  nicotine: NicotineType;
  volumePrice: number;
  nicotinePrice: number;
  totalUnitPrice: number; // volumePrice + nicotinePrice
  quantity: number;
}

export interface AuthUser {
  name: string; // Full Name (ФИО)
  phone: string; // Phone number
  telegram: string; // @username
  registeredAt: string;
  role?: 'ADMIN' | 'USER';
}

/** The object Telegram's login widget hands the callback. It is forwarded to
 *  the server byte for byte, because the server rebuilds its signature over
 *  exactly these fields, so an index signature is deliberate: dropping or
 *  adding a key would invalidate the proof. */
export interface TelegramWidgetUser {
  [key: string]: unknown;
  id: number | string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface LoyaltyState {
  spend: number; // total actually paid across all orders
  tier: 'BASE' | 'SILVER' | 'GOLD';
  discountPct: number; // rate locked in by past spend
  currentPct: number; // rate the next order will be charged at
  nextThreshold: number | null; // spend needed for the next tier
}

export interface PlacedOrder {
  orderId: string;
  user: AuthUser;
  items: CartItem[];
  subtotal: number; // amount actually paid
  createdAt: string;
  status: 'Pending Verification' | 'Confirmed';
  grossSubtotal?: number; // before the loyalty discount
  discountPct?: number;
  discountAmount?: number;
}

export interface CheckoutSummary {
  grossSubtotal: number;
  discountPct: number;
  discountAmount: number;
  total: number;
  loyalty: LoyaltyState | null;
}

export interface CollectionVideosConfig {
  Spring: string;
  Summer: string;
  Autumn: string;
  'Permanent 1': string;
  'Permanent 2': string;
}

export interface RecipeItem {
  vendor: string;
  name: string;
  mlPer100ml: number;
}

export interface Recipe {
  productId: string;
  items: RecipeItem[];
  updatedAt?: string;
}

export interface FlavorPrice {
  key: string;
  vendor: string;
  name: string;
  pricePer10ml: number;
  currency?: string;
  updatedAt?: string;
}

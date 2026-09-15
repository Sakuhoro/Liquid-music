export type VolumeType = '30ml' | '60ml' | '120ml';
export type NicotineType = '0mg' | '1.5mg' | '3mg' | '6mg';

export type CollectionName =
  | 'Spring'
  | 'Summer'
  | 'Autumn'
  | 'Permanent 1'
  | 'Permanent 2';

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

export interface PlacedOrder {
  orderId: string;
  user: AuthUser;
  items: CartItem[];
  subtotal: number;
  createdAt: string;
  status: 'Pending Verification' | 'Confirmed';
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

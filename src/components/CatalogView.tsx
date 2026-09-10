import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ProductItem,
  VolumeType,
  NicotineType,
  CollectionName,
} from '../types';
import { calculatePrice } from '../data/products';
import {
  Search,
  Play,
  Volume2,
  Plus,
  Check,
  Disc,
  ArrowLeft,
  Music,
  Radio,
  Sparkles,
  Layers,
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { DepthCard } from './ui/depth-card';
import Carousel from './ui/Carousel.jsx';

// Metadata for Collection Depth Cards
const COLLECTION_CARDS: {
  id: CollectionName;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  badge: string;
  color: string;
}[] = [
  {
    id: 'Spring',
    title: 'Spring Collection',
    subtitle: 'Floral Cantabile & Spring Blossom Dew',
    description: 'Delicate sakura petals, white peach nectar, and crisp alpine mountain water.',
    image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=600&auto=format&fit=crop&q=80',
    badge: 'Seasonal Opus',
    color: 'from-pink-500/80 to-rose-900/80',
  },
  {
    id: 'Summer',
    title: 'Summer Collection',
    subtitle: 'Tropical Vivace & Root Beer Crescendos',
    description: 'Sun-drenched Alphonso mango, effervescent sassafras, key lime zest, and coastal ice.',
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80',
    badge: 'Seasonal Opus',
    color: 'from-amber-400/80 to-orange-900/80',
  },
  {
    id: 'Autumn',
    title: 'Autumn Collection',
    subtitle: 'Warm Acoustic Resonance & Spiced Orchards',
    description: 'Bourbon vanilla caramel, torched brown sugar, honeycrisp apple, and charred oak.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    badge: 'Seasonal Opus',
    color: 'from-orange-500/80 to-stone-900/80',
  },
  {
    id: 'Permanent 1',
    title: 'Permanent 1',
    subtitle: 'Signature Virtuoso Masterworks',
    description: 'Electric blue raspberry symphonies and deep contrapuntal espresso cacao fugues.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
    badge: 'Core Series',
    color: 'from-sky-500/80 to-indigo-900/80',
  },
  {
    id: 'Permanent 2',
    title: 'Permanent 2',
    subtitle: 'Ethereal Sub-Zero Nocturnes & Kyoho Études',
    description: 'Nordic spearmint, frosted fir resins, and soothing aloe vera grape harmonies.',
    image: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?w=600&auto=format&fit=crop&q=80',
    badge: 'Core Series',
    color: 'from-emerald-500/80 to-teal-900/80',
  },
];

// Subcomponent: Individual Flavor Card with High-Contrast Light Theme Support & Dynamic Pricing
const FlavorCard: React.FC<{ product: ProductItem }> = ({ product }) => {
  const addToCart = useAppStore((state) => state.addToCart);
  const setInspectedProduct = useAppStore((state) => state.setInspectedProduct);
  const setIsSoundCloudOpen = useAppStore((state) => state.setIsSoundCloudOpen);
  const theme = useAppStore((state) => state.theme);

  const [selectedVolume, setSelectedVolume] = useState<VolumeType>('30ml');
  const [selectedNicotine, setSelectedNicotine] = useState<NicotineType>('0mg');
  const [isAdded, setIsAdded] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const isDark = theme === 'dark';

  // Dynamic Price Engine: Total Price = Volume Price + Nicotine Price
  const currentPrice = calculatePrice(selectedVolume, selectedNicotine);

  const handleAdd = () => {
    addToCart(product, selectedVolume, selectedNicotine);
    soundEngine.playSuccessTone();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const handlePlayPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingPreview(true);
    soundEngine.playChime([392, 440, 523.25, 659.25]);
    setTimeout(() => setIsPlayingPreview(false), 1200);
  };

  const volumeOptions: { vol: VolumeType; label: string }[] = [
    { vol: '30ml', label: '30ml (300₽)' },
    { vol: '60ml', label: '60ml (550₽)' },
    { vol: '120ml', label: '120ml (900₽)' },
  ];

  const nicotineOptions: { nic: NicotineType; label: string }[] = [
    { nic: '0mg', label: '0mg (+0₽)' },
    { nic: '1.5mg', label: '1.5mg (+15₽)' },
    { nic: '3mg', label: '3mg (+30₽)' },
    { nic: '6mg', label: '6mg (+60₽)' },
  ];

  return (
    <div
      id={`flavor-card-${product.id}`}
      className={`group relative rounded-3xl p-5 md:p-6 transition-all duration-300 backdrop-blur-2xl border flex flex-col justify-between ${
        isDark
          ? 'bg-[rgba(8,28,44,0.75)] hover:bg-[rgba(10,35,55,0.85)] border-white/15 hover:border-amber-400/40 shadow-2xl text-stone-100'
          : 'bg-white/92 hover:bg-white/98 border-slate-300/90 hover:border-amber-500/60 shadow-xl text-slate-900'
      }`}
    >
      <div>
        {/* Card Top: Musical Opus Bar & Audio trigger */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className={`flex items-center gap-1.5 text-xs font-mono ${
              isDark ? 'text-stone-300' : 'text-slate-700 font-semibold'
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>{product.opusNumber}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* SoundCloud / Preview trigger */}
            <button
              onClick={() => setIsSoundCloudOpen(true)}
              title="Open Track in SoundCloud Player"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                isDark ? 'bg-white/10 hover:bg-white/20 text-orange-400' : 'bg-slate-200 hover:bg-slate-300 text-orange-600'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePlayPreview}
              title="Preview Harmonic Chords"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer ${
                isDark ? 'bg-white/10 hover:bg-white/20 text-stone-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
              }`}
            >
              {isPlayingPreview ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
            </button>
          </div>
        </div>

        {/* Product Artwork */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-stone-950/20 border border-black/10 dark:border-white/10">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

          <div className="absolute bottom-2.5 left-3 flex items-center text-[11px] font-mono text-white/95">
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/20 font-bold">
              {product.category}
            </span>
          </div>
        </div>

        {/* Title & Subtitle with High Legibility */}
        <h3
          onClick={() => setInspectedProduct(product)}
          className={`font-serif text-2xl font-bold tracking-tight cursor-pointer transition-colors ${
            isDark
              ? 'text-stone-100 hover:text-amber-400'
              : 'text-slate-900 hover:text-amber-700'
          }`}
        >
          {product.name}
        </h3>
        <p
          className={`text-xs font-medium mt-0.5 mb-3 line-clamp-1 ${
            isDark ? 'text-stone-300' : 'text-slate-700 font-semibold'
          }`}
        >
          {product.subtitle}
        </p>

        {/* Aromatic Chords Description Box */}
        <div
          className={`p-3 rounded-2xl text-[11px] space-y-1.5 mb-4 border ${
            isDark
              ? 'bg-white/[0.04] border-white/10 text-stone-200'
              : 'bg-slate-100/90 border-slate-300 text-slate-900'
          }`}
        >
          <div className="flex items-baseline gap-1.5 truncate">
            <span
              className={`font-mono uppercase text-[9px] font-bold w-10 shrink-0 ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              Top:
            </span>
            <span className="truncate font-medium">{product.aromaticChords.top}</span>
          </div>
          <div className="flex items-baseline gap-1.5 truncate">
            <span
              className={`font-mono uppercase text-[9px] font-bold w-10 shrink-0 ${
                isDark ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              Heart:
            </span>
            <span className="truncate font-medium">{product.aromaticChords.heart}</span>
          </div>
        </div>

        {/* Volume Selector */}
        <div className="space-y-1.5 mb-3">
          <label
            className={`block text-[10px] font-mono uppercase tracking-wider font-bold ${
              isDark ? 'text-stone-300' : 'text-slate-800'
            }`}
          >
            Artisanal Volume:
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
            {volumeOptions.map((v) => (
              <button
                key={v.vol}
                onClick={() => setSelectedVolume(v.vol)}
                className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedVolume === v.vol
                    ? 'bg-amber-400 text-stone-950 font-bold border-amber-500 shadow-md shadow-amber-400/20'
                    : isDark
                    ? 'bg-white/5 border-white/15 text-stone-300 hover:bg-white/10'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 font-semibold'
                }`}
              >
                <div className="font-bold">{v.vol}</div>
                <div className="text-[9px] opacity-80">
                  {v.vol === '30ml' ? '300₽' : v.vol === '60ml' ? '550₽' : '900₽'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nicotine Selector */}
        <div className="space-y-1.5 mb-4">
          <label
            className={`block text-[10px] font-mono uppercase tracking-wider font-bold ${
              isDark ? 'text-stone-300' : 'text-slate-800'
            }`}
          >
            Nicotine Formulation:
          </label>
          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
            {nicotineOptions.map((n) => (
              <button
                key={n.nic}
                onClick={() => setSelectedNicotine(n.nic)}
                className={`py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedNicotine === n.nic
                    ? 'bg-amber-400 text-stone-950 font-bold border-amber-500 shadow-md shadow-amber-400/20'
                    : isDark
                    ? 'bg-white/5 border-white/15 text-stone-300 hover:bg-white/10'
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 font-semibold'
                }`}
              >
                <div className="font-bold">{n.nic}</div>
                <div className="text-[8px] opacity-80">
                  {n.nic === '0mg'
                    ? '+0₽'
                    : n.nic === '1.5mg'
                    ? '+15₽'
                    : n.nic === '3mg'
                    ? '+30₽'
                    : '+60₽'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card Footer: Dynamic Price Display & Liquid-Glass Add Button */}
      <div
        className={`pt-3 border-t flex items-center justify-between gap-3 ${
          isDark ? 'border-white/15' : 'border-slate-300'
        }`}
      >
        <div>
          <div
            className={`text-2xl font-serif font-bold tracking-tight ${
              isDark ? 'text-amber-400' : 'text-amber-700'
            }`}
          >
            {currentPrice} ₽
          </div>
          <div
            className={`text-[10px] font-mono ${
              isDark ? 'text-stone-400' : 'text-slate-600 font-semibold'
            }`}
          >
            {selectedVolume} • {selectedNicotine}
          </div>
        </div>

        <button
          onClick={handleAdd}
          className={`liquid-glass px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
            isAdded
              ? 'bg-emerald-500 text-stone-950 font-bold'
              : isDark
              ? 'hover:scale-105 active:scale-95 text-stone-100'
              : 'hover:scale-105 active:scale-95 text-slate-900 font-bold bg-white/70 border border-slate-300 shadow-sm'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const CatalogView: React.FC = () => {
  const products = useAppStore((state) => state.products);
  const setViewMode = useAppStore((state) => state.setViewMode);
  const setInspectedProduct = useAppStore((state) => state.setInspectedProduct);
  const activeCollection = useAppStore((state) => state.activeCollection);
  const setActiveCollection = useAppStore((state) => state.setActiveCollection);
  const theme = useAppStore((state) => state.theme);

  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme === 'dark';

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCollection =
        activeCollection === 'All' || p.category === activeCollection;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCollection && matchesQuery;
    });
  }, [products, activeCollection, searchQuery]);

  const isOverview = activeCollection === 'All';

  return (
    <div
      id="spotify-musical-catalog-overlay"
      className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 py-4 pb-20 flex flex-col animate-fade-rise"
    >
      {/* Catalog Header Ribbon */}
      <div
        className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b ${
          isDark ? 'border-white/10' : 'border-slate-300'
        }`}
      >
        <div>
          {isOverview ? (
            <button
              onClick={() => setViewMode('hero')}
              className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-2 cursor-pointer transition-colors ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800 font-bold'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Главная страница</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveCollection('All')}
              className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-2 cursor-pointer transition-colors ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800 font-bold'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Все коллекции</span>
            </button>
          )}

          <h2
            className={`font-serif text-4xl sm:text-5xl font-normal tracking-tight ${
              isDark ? 'text-stone-100' : 'text-slate-900'
            }`}
          >
            {isOverview ? 'Все коллекции' : `${activeCollection} Collection`}
          </h2>
          <p
            className={`text-sm mt-1 max-w-xl ${
              isDark ? 'text-stone-300' : 'text-slate-700 font-medium'
            }`}
          >
            {isOverview
              ? 'Выберите коллекцию из списка ниже, чтобы просмотреть виниловый проигрыватель и товары'
              : 'Эксклюзивная подборка товаров данной коллекции'}
          </p>
        </div>

        {/* Search Bar (shown inside specific collection view) */}
        {!isOverview && (
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="Search opus, key, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs border backdrop-blur-md focus:outline-none focus:border-amber-500 transition-colors ${
                isDark
                  ? 'bg-white/[0.05] border-white/15 text-stone-100 placeholder:text-stone-400'
                  : 'bg-white/95 border-slate-300 text-slate-900 placeholder:text-slate-500 shadow-sm'
              }`}
            />
          </div>
        )}
      </div>

      {isOverview ? (
        /* MAIN OVERVIEW VIEW: Death Card Navigation Menu ONLY */
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-stone-100' : 'text-slate-900'}`}>
                Выберите коллекцию
              </h3>
            </div>
            <span className="text-xs font-mono opacity-70 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Interactive 3D View</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {COLLECTION_CARDS.map((card) => (
              <div
                key={card.id}
                onClick={() => setActiveCollection(card.id)}
                className="relative rounded-3xl p-1 transition-all duration-300 cursor-pointer hover:scale-[1.03] opacity-90 hover:opacity-100"
              >
                <DepthCard
                  image={card.image}
                  height={260}
                  maxRotation={22}
                  maxTranslation={20}
                  borderRadius="20px"
                  spotlight={true}
                  spotlightColor="rgba(251, 191, 36, 0.45)"
                  className="w-full"
                >
                  <div className="flex flex-col justify-between h-full p-3">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30">
                        {card.badge}
                      </span>
                    </div>

                    <div className="mt-auto pt-4">
                      <h4 className="font-serif text-xl font-bold text-white tracking-tight leading-snug drop-shadow-md">
                        {card.title}
                      </h4>
                      <p className="text-[11px] font-sans text-stone-200 opacity-90 line-clamp-2 mt-1 font-medium drop-shadow-sm">
                        {card.subtitle}
                      </p>
                    </div>
                  </div>
                </DepthCard>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SPECIFIC COLLECTION VIEW: Vinyl Carousel ONLY (Full Width / No Cards) */
        <div className="w-full flex-1 flex flex-col items-center justify-center py-6 my-auto">
          <Carousel
            items={filteredProducts}
            baseWidth={520}
            round={true}
            loop={true}
            autoplay={true}
            autoplayDelay={4000}
            pauseOnHover={true}
            onItemClick={(product: any) => setInspectedProduct(product)}
          />

          {filteredProducts.length === 0 && (
            <div className="py-24 text-center space-y-3">
              <Disc className="w-12 h-12 mx-auto opacity-30 animate-spin" style={{ animationDuration: '8s' }} />
              <p className="text-sm font-medium opacity-80">В этой коллекции нет товаров</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCollection('All');
                }}
                className="text-xs text-amber-500 underline font-mono cursor-pointer"
              >
                Вернуться ко всем коллекциям
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

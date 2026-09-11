import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  CollectionName,
} from '../types';
import {
  Search,
  Disc,
  ArrowLeft,
  LayoutGrid,
  Film,
} from 'lucide-react';
import SkewedCarousel, { SkewedCarouselItem } from './ui/skewed-carousel';
import DollyGallery from './ui/DollyGallery';

// Metadata for Collection Skewed Cards
const COLLECTION_CARDS: SkewedCarouselItem[] = [
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

type DisplayMode = 'dolly' | 'grid';

export const CatalogView: React.FC = () => {
  const products = useAppStore((state) => state.products);
  const setInspectedProduct = useAppStore((state) => state.setInspectedProduct);
  const activeCollection = useAppStore((state) => state.activeCollection);
  const setActiveCollection = useAppStore((state) => state.setActiveCollection);
  const theme = useAppStore((state) => state.theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('dolly');
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

  // Module 1: If user is viewing all collections, render full-screen Skewed Carousel (w-screen h-screen)
  if (isOverview) {
    return (
      <SkewedCarousel
        items={COLLECTION_CARDS}
        onSelectItem={(id) => setActiveCollection(id as CollectionName)}
      />
    );
  }

  return (
    <div
      id="spotify-musical-catalog-overlay"
      className="relative z-10 flex-1 w-full py-4 pb-20 flex flex-col animate-fade-rise"
    >
      {/* Catalog Header Ribbon */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8">
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b ${
            isDark ? 'border-white/10' : 'border-slate-300'
          }`}
        >
          <div>
            <button
              onClick={() => setActiveCollection('All')}
              className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-2 cursor-pointer transition-colors ${
                isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-700 hover:text-amber-800 font-bold'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Все коллекции</span>
            </button>

            <h2
              className={`font-serif text-4xl sm:text-5xl font-normal tracking-tight ${
                isDark ? 'text-stone-100' : 'text-slate-900'
              }`}
            >
              {`${activeCollection} Collection`}
            </h2>
            <p
              className={`text-sm mt-1 max-w-xl ${
                isDark ? 'text-stone-300' : 'text-slate-700 font-medium'
              }`}
            >
              Интерактивный виниловый карусель товаров. Перетаскивайте карточки или наведите мышью, чтобы просмотреть название.
            </p>
          </div>

          {/* View mode toggle & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* View Mode Switcher */}
            <div className={`flex items-center p-1 rounded-full border backdrop-blur-md ${
              isDark ? 'bg-white/5 border-white/15' : 'bg-slate-100 border-slate-300'
            }`}>
              <button
                onClick={() => setDisplayMode('dolly')}
                title="3D Gallery"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  displayMode === 'dolly'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-md'
                    : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>3D Галерея</span>
              </button>
              <button
                onClick={() => setDisplayMode('grid')}
                title="Сетка"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  displayMode === 'grid'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-md'
                    : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Сетка</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Поиск нот, вкусов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-full text-xs border backdrop-blur-md focus:outline-none focus:border-amber-500 transition-colors ${
                  isDark
                    ? 'bg-white/[0.05] border-white/15 text-stone-100 placeholder:text-stone-400'
                    : 'bg-white/95 border-slate-300 text-slate-900 placeholder:text-slate-500 shadow-sm'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SPECIFIC COLLECTION VIEW: 3D Gallery / Grid View */}
      <div className="w-full flex-1 h-full min-h-[70vh] flex flex-col items-center justify-center my-auto">
        {filteredProducts.length === 0 ? (
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
        ) : displayMode === 'dolly' ? (
          <DollyGallery
            items={filteredProducts}
            itemWidth={680}
            onItemClick={(item) => {
              const fullProduct = products.find((p) => String(p.id) === String(item.id));
              if (fullProduct) setInspectedProduct(fullProduct);
            }}
          />
        ) : (
          /* Grid View */
          <div className="max-w-7xl mx-auto w-full px-6 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full py-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setInspectedProduct(product)}
                  className="group relative rounded-2xl overflow-hidden border border-white/10 bg-stone-900/40 p-4 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/40 shadow-lg"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-black/40 flex items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-xs font-bold text-amber-300">Открыть описание</span>
                    </div>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{product.subtitle}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">{product.basePrice} ₽</span>
                    <span className="text-[10px] font-mono text-stone-400 border border-white/10 px-2 py-0.5 rounded-full">
                      {product.opusNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

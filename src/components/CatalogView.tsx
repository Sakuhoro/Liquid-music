import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ProductItem,
  CollectionName,
} from '../types';
import {
  Search,
  Disc,
  ArrowLeft,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DepthCard } from './ui/depth-card';
import DollyGallery from './ui/DollyGallery';

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
              ? 'Выберите коллекцию из списка ниже, чтобы перейти к 3D Dolly виниловой галерее'
              : 'Прокручивайте колесико или используйте кнопки, чтобы лететь сквозь пластинки'}
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
        /* MAIN OVERVIEW VIEW: Depth Card Navigation Menu ONLY */
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
        /* SPECIFIC COLLECTION VIEW: 3D Dolly Gallery ONLY */
        <div className="w-full flex-1 flex flex-col items-center justify-center my-auto">
          <DollyGallery
            items={filteredProducts}
            onItemClick={(item) => {
              const fullProduct = products.find((p) => p.id === item.id);
              if (fullProduct) setInspectedProduct(fullProduct);
            }}
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

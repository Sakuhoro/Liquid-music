import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  CollectionName,
  getCollectionTitle,
  NicotineType,
  ProductItem,
} from '../types';
import {
  Search,
  Disc,
  ArrowLeft,
  LayoutGrid,
  Film,
  X,
} from 'lucide-react';
import SkewedCarousel, { SkewedCarouselItem } from './ui/skewed-carousel';
import DollyGallery from './ui/DollyGallery';
import { sanitizeRussianText } from '../utils/sanitizeText';

// Metadata for Collection Skewed Cards
const COLLECTION_CARDS: SkewedCarouselItem[] = [
  {
    id: 'Spring',
    title: 'Весенняя коллекция',
    description: 'Нежная акустическая симфония, в которой тонкие и воздушные гармонии плавно сменяют зимнюю тишину.',
    image: '/uploads/photo_2026-09-15_00-08-32.jpg',
    badge: 'Сезонная коллекция',
    color: 'from-pink-500/80 to-rose-900/80',
  },
  {
    id: 'Summer',
    title: 'Летняя коллекция',
    description: 'Энергичный ритм главного фестиваля под открытым небом, в темпе бесконечных теплых ночей.',
    image: '/uploads/photo_2026-09-15_00-00-09.jpg',
    badge: 'Сезонная коллекция',
    color: 'from-amber-400/80 to-orange-900/80',
  },
  {
    id: 'Autumn',
    title: 'Зимняя коллекция',
    description: 'Глубокие, согревающие аккорды и неторопливые инструментальные мелодии, созданные, чтобы укутать вас уютом в сезон холодов и вьюг.',
    image: '/uploads/photo_2026-09-15_00-00-17.jpg',
    badge: 'Сезонная коллекция',
    color: 'from-orange-500/80 to-stone-900/80',
  },
  {
    id: 'Permanent 1',
    title: 'Bones of what you Believe',
    description: 'Эмоциональные, честные и захватывающие композиции, которые долго остаются в сердце с искрящимся эхо.',
    image: '/uploads/6eb3f514644c490e8c43dfe79a10e2ee_img_1K.jpg',
    badge: 'Постоянная коллекция',
    color: 'from-sky-500/80 to-indigo-900/80',
  },
  {
    id: 'Permanent 2',
    title: 'Velvet Distortion',
    description: 'Nordic spearmint, frosted fir resins, and soothing aloe vera grape harmonies.',
    image: '/uploads/velvet-distortion.png',
    badge: 'Постоянная коллекция',
    color: 'from-emerald-500/80 to-teal-900/80',
  },
  {
    id: 'Pain Girl',
    title: 'Pain Girl',
    description: 'Особенная атмосфера и мрачная эстетика в 6 авторских композициях.',
    image: '/Pain girl.jpg',
    badge: 'Special Collection',
    color: 'from-stone-800/80 to-black/90',
  },
];

type DisplayMode = 'dolly' | 'grid';

export const CatalogView: React.FC = () => {
  const products = useAppStore((state) => state.products);
  const setInspectedProduct = useAppStore((state) => state.setInspectedProduct);
  const activeCollection = useAppStore((state) => state.activeCollection);
  const setActiveCollection = useAppStore((state) => state.setActiveCollection);
  const isCollectionArchived = useAppStore((state) => state.isCollectionArchived);
  const addToCart = useAppStore((state) => state.addToCart);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const isBgMusicPlaying = useAppStore((state) => state.isBgMusicPlaying);
  const theme = useAppStore((state) => state.theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('dolly');
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedNicotine, setSelectedNicotine] = useState<NicotineType>('3mg');
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  const isDark = theme === 'dark';
  const painGirlAudioRef = useRef<HTMLAudioElement | null>(null);

  const painGirlTracks = [
    { name: 'Everybody supports women' },
    { name: 'Out in the Garden' },
    { name: 'Above the Neck' },
    { name: 'Evergreen soldier' },
    { name: 'Sex concept' },
    { name: 'hot gum' },
  ];

  // Splash Screen Sequence for Pain Girl
  useEffect(() => {
    if (activeCollection === 'Pain Girl') {
      setShowSplash(true);
      setSplashFading(false);

      const timer1 = setTimeout(() => {
        setSplashFading(true);
      }, 1500);

      const timer2 = setTimeout(() => {
        setShowSplash(false);
      }, 2300);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [activeCollection]);

  // Sync Pain Girl Audio with Global Mute Toggle
  useEffect(() => {
    if (painGirlAudioRef.current) {
      painGirlAudioRef.current.muted = !isBgMusicPlaying;
      if (!isBgMusicPlaying) {
        painGirlAudioRef.current.volume = 0;
      } else {
        painGirlAudioRef.current.volume = 0.45;
      }
    }
  }, [isBgMusicPlaying]);

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

  // Dedicated Pain Girl Collection View
  if (activeCollection === 'Pain Girl') {
    const bundlePrice =
      selectedNicotine === '0mg' ? 8000 : selectedNicotine === '3mg' ? 8300 : 8600;

    const handleAddBundleToCart = () => {
      const bundleProduct: ProductItem = {
        id: 'pain-girl-bundle',
        name: 'Коллекция Pain Girl (6 х 60ml)',
        subtitle: 'Полный сет из 6 авторских композиций',
        description: '6 флаконов по 60мл: Everybody supports women, Out in the Garden, Above the Neck, Evergreen soldier, Sex concept, hot gum.',
        image: '/Pain girl.jpg',
        basePrice: bundlePrice,
        category: 'Pain Girl',
        musicalKey: 'C Minor',
        bpm: 90,
        opusNumber: 'PG-SET',
        aromaticChords: { top: 'Special Collection', heart: '6 Flavors Set', base: '60ml each' },
        accentColor: '#181818',
      };
      addToCart(bundleProduct, '60ml', selectedNicotine);
      setIsStoryModalOpen(false);
      setIsCartOpen(true);
    };

    return (
      <div
        id="pain-girl-collection-stage"
        className="relative z-10 flex-1 w-full min-h-[88vh] flex flex-col justify-between text-white p-4 sm:p-8 animate-fade-rise bg-black overflow-hidden"
      >
        <audio ref={painGirlAudioRef} />

        {/* Splash Dissolve Sequence */}
        {showSplash && (
          <div
            className={`fixed inset-0 z-50 pointer-events-none transition-all duration-800 ease-out bg-black flex items-center justify-center overflow-hidden ${
              splashFading ? 'opacity-0 blur-md scale-95' : 'opacity-100 blur-0 scale-100'
            }`}
          >
            <img
              src="/Pain girl.jpg"
              alt="Pain Girl Splash"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Top Header Ribbon & Action Buttons */}
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10 z-20">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-stone-400 font-bold">Специальная коллекция</span>
            <h2 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-1">Pain Girl</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveCollection('All')}
              className="px-5 py-3 rounded-2xl bg-[#111] hover:bg-[#222] border border-[#333] hover:border-[#555] text-stone-300 hover:text-white font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-all duration-300 shadow-lg cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Вернуться к коллекциям</span>
            </button>

            <button
              onClick={() => setIsStoryModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#111] hover:bg-[#222] border border-[#333] hover:border-[#555] text-amber-400 hover:text-amber-300 font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-all duration-300 shadow-lg cursor-pointer flex items-center gap-2"
            >
              <span>Послушать историю</span>
            </button>
          </div>
        </div>

        {/* Pain Girl Main Stage: Centered Spiral with Desktop Scale Amplification & Compact Mobile Spacing */}
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center relative z-20 my-auto py-4 md:py-8 gap-[clamp(4px,1.5vh,10px)] mb-0 pb-0">
          {/* Centered Interactive Spiral Component */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-[clamp(750px,60vw,1100px)] md:h-[clamp(750px,60vw,1100px)] rounded-full flex items-center justify-center border border-stone-800 bg-stone-950/80 shadow-2xl p-4 md:p-12 overflow-hidden mb-0 pb-0 shrink-0">
            {/* Outer Spiral Rings */}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-spin" style={{ animationDuration: '30s' }} />
            <div className="absolute inset-6 md:inset-16 rounded-full border border-white/10 animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }} />
            <div className="absolute inset-12 md:inset-32 rounded-full border border-white/15" />

            {/* Spiral Center Vinyl / Cover */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-80 md:h-80 rounded-full overflow-hidden border-2 border-stone-700 shadow-inner flex items-center justify-center">
              <img src="/Pain girl.jpg" alt="Pain Girl Spiral" className="w-full h-full object-cover rounded-full" />
              <div className="absolute w-5 h-5 md:w-12 md:h-12 rounded-full bg-black border border-stone-600 z-10" />
            </div>
          </div>

          {/* Track list preview */}
          <div className="w-full max-w-md space-y-1.5 md:space-y-2 font-mono text-xs text-stone-300 mt-2">
            <h4 className="text-center text-amber-400 font-bold uppercase tracking-wider mb-2 text-[11px] md:text-xs">
              Состав коллекции (6 х 60ml):
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {painGirlTracks.map((track, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#111] border border-[#222]">
                  <span className="text-stone-400 font-bold text-[10px]">{idx + 1}.</span>
                  <span className="font-semibold text-white truncate px-1 text-[11px]">{track.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compact Footer for Pain Girl Collection */}
        <footer
          id="pain-girl-compact-footer"
          style={{
            paddingTop: '6px',
            paddingBottom: 'calc(6px + env(safe-area-inset-bottom))',
          }}
          className="w-full border-t border-white/10 bg-black/80 backdrop-blur-md px-4 flex flex-row items-center justify-between text-[10px] sm:text-xs text-stone-400 font-mono tracking-wide mt-2"
        >
          <div className="flex items-center gap-2">
            <Disc className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '12s' }} />
            <span className="scale-90 sm:scale-100">Pain Girl Collection © Liquid Music</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="opacity-80">6 х 60ml сет</span>
            <span className="text-amber-400 font-bold">Original</span>
          </div>
        </footer>

        {/* Modal Window: "Послушать историю" */}
        {isStoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-rise">
            <div className="relative w-full max-w-lg rounded-3xl bg-[#111] border border-[#333] p-6 sm:p-8 text-white shadow-2xl">
              <button
                onClick={() => setIsStoryModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border border-stone-700 shadow-lg">
                  <img src="/Pain girl.jpg" alt="Pain Girl Artwork" className="w-full h-full object-cover" />
                </div>

                <h3 className="font-serif text-2xl font-extrabold text-white">Pain Girl Collection</h3>
                <p className="text-xs text-stone-300 font-sans leading-relaxed">
                  Эксклюзивная сет-коллекция из 6 авторских композиций объёмом 60мл каждая. Выберите желаемую крепость для всего сета.
                </p>

                {/* Nicotine Strength Selector */}
                <div className="w-full space-y-2 pt-2">
                  <label className="block text-xs font-mono uppercase font-bold text-amber-400">Выберите крепость никотина:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['0mg', '3mg', '6mg'] as NicotineType[]).map((nic) => {
                      const label = nic === '0mg' ? '0 мг' : nic === '3mg' ? '3 мг' : '6 мг';
                      const isSelected = selectedNicotine === nic;
                      return (
                        <button
                          key={nic}
                          onClick={() => setSelectedNicotine(nic)}
                          className={`py-3 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                              : 'bg-[#181818] text-stone-300 border-[#333] hover:border-[#555]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Display */}
                <div className="w-full pt-4 border-t border-[#222] flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-stone-400 font-bold">Итоговая цена:</span>
                  <span className="font-serif text-3xl font-extrabold text-amber-400">{bundlePrice} руб.</span>
                </div>

                {/* Add to Cart / Checkout Button */}
                <button
                  onClick={handleAddBundleToCart}
                  className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  Оформить коллекцию ({bundlePrice} руб.)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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
              className={`font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight antialiased ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {getCollectionTitle(activeCollection)}
            </h2>
            <p
              className={`text-sm sm:text-base mt-2 max-w-xl font-sans font-normal antialiased leading-relaxed ${
                isDark ? 'text-stone-300' : 'text-slate-800'
              }`}
            >
              Коллекция авторских вкусовых композиций Liquid Music.
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  displayMode === 'dolly'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-md'
                    : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Film className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap shrink-0">3D&nbsp;Галерея</span>
              </button>
              <button
                onClick={() => setDisplayMode('grid')}
                title="Сетка"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  displayMode === 'grid'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-md'
                    : isDark ? 'text-stone-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">Сетка</span>
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
                  className={`group relative rounded-2xl overflow-hidden border p-4 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg flex flex-col justify-between ${
                    isDark
                      ? 'border-white/10 bg-stone-900/40 hover:border-amber-400/50 shadow-black/50'
                      : 'border-slate-200 bg-white/80 hover:border-amber-500/50 shadow-slate-200/50'
                  }`}
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3.5 bg-black/40 flex items-center justify-center">
                      {isCollectionArchived(product.category as CollectionName) && (
                        <div className="absolute top-3 left-3 z-20 px-3 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-bold uppercase tracking-wider font-sans backdrop-blur-md shadow-lg border border-rose-400/40">
                          Архив
                        </div>
                      )}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <span className="text-xs font-bold font-sans tracking-wide text-amber-300 antialiased">Подробнее</span>
                      </div>
                    </div>
                    <h4 className={`font-sans text-lg font-extrabold tracking-tight antialiased transition-colors line-clamp-1 ${
                      isDark ? 'text-white group-hover:text-amber-400' : 'text-slate-950 group-hover:text-amber-600'
                    }`}>
                      {product.name}
                    </h4>
                    <p className={`font-sans text-xs line-clamp-2 mt-1.5 leading-relaxed antialiased font-medium ${
                      isDark ? 'text-stone-300 opacity-90' : 'text-slate-700 opacity-90'
                    }`}>
                      {sanitizeRussianText(product.description)}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className={`text-[11px] font-sans font-bold px-2.5 py-1 rounded-full border antialiased ${
                      isDark ? 'text-stone-300 border-white/15 bg-white/5' : 'text-slate-700 border-slate-300 bg-slate-100'
                    }`}>
                      {product.category === 'Autumn' ? 'Зимняя' : getCollectionTitle(product.category as CollectionName)}
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

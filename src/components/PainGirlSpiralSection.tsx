import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { NicotineType, ProductItem } from '../types';
import { PAIN_GIRL_ARTWORK, PAIN_GIRL_GALLERY } from '../data/painGirlGallery';
import InfiniteSpiral from './ui/InfiniteSpiral';

// The collection is sold as one set of six 60ml bottles. The price follows the
// strength the customer picks, and matches what the server charges for the six
// compositions separately.
const BUNDLE_PRICES: Record<string, number> = {
  '0mg': 8000,
  '3mg': 8300,
  '6mg': 8600,
};

const BUNDLE_NICOTINE: NicotineType[] = ['0mg', '3mg', '6mg'];

/**
 * The tab a gallery collection opens on. Every other collection tab renders the
 * product grid, so this one brings its own stage: the frames travel up a helix
 * instead of sitting in a grid, which keeps the collection readable without a
 * scrollbar.
 *
 * The frames come from the shared gallery data rather than a list written out
 * here, so the artwork stays defined in one place. The set is bought from the
 * floating control below: the spiral itself stays bare, because a header and a
 * caption list were both removed from it on purpose.
 *
 * The key art behind the screen is painted by the background layer, not here,
 * so it sits under the header as well. From tablet up it fills the screen with
 * the subject on the left and the stage takes the right; on a phone there is no
 * width for the two side by side, so the artwork becomes a band across the top
 * and the spiral starts underneath it. Either way the two never overlap.
 *
 * The split between the two is a measured one. From tablet up the artwork is
 * painted only across the left of the screen and faded to black where this
 * section begins, rather than being laid over the whole screen and dimmed: the
 * spiral has to read against pure black, and behind it there is now nothing but
 * black. Both the artwork's share and the width reserved here are read from the
 * same custom properties (--pain-girl-art-width, --pain-girl-stage-width), and
 * the fade is part of the width rather than a separate number, so the artwork's
 * edge and the stage's edge cannot drift apart.
 */
export const PainGirlSpiralSection: React.FC = () => {
  const products = useAppStore((state) => state.products);
  const addToCart = useAppStore((state) => state.addToCart);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedNicotine, setSelectedNicotine] = useState<NicotineType>('3mg');

  // How much of the screen the stage is given, which is the same question as how
  // much the artwork takes. Both come from CSS (--pain-girl-art-width and
  // --pain-girl-stage-width): the background layer paints the artwork against
  // those numbers, and two copies of a fraction in two files would be free to
  // disagree about where the split falls.
  const stageWidth = 'var(--pain-girl-stage-width)';

  // The frames double on a desktop, and so does the stage they travel through:
  // the component shrinks whatever does not fit, so leaving the stage at 650px
  // would have quietly scaled the growth straight back out again.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const onChange = () => setIsDesktop(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const growth = isDesktop ? 2 : 1;

  const spiralItems = PAIN_GIRL_GALLERY.map((frame) => ({
    id: frame.src,
    src: frame.src,
    alt: frame.alt,
    label: `${frame.title}, ${frame.subtitle}`
  }));

  // Read the six compositions off the catalogue instead of listing them again, so
  // the set cannot drift from what the server will actually sell.
  const tracks = useMemo(
    () => products.filter((product) => product.category === 'Pain Girl'),
    [products]
  );

  const bundlePrice = BUNDLE_PRICES[selectedNicotine];

  const handleAddBundleToCart = () => {
    const bundleProduct: ProductItem = {
      id: 'pain-girl-bundle',
      name: 'Коллекция Pain Girl (6 х 60ml)',
      subtitle: 'Полный сет из 6 авторских композиций',
      description: tracks.length
        ? `6 флаконов по 60мл: ${tracks.map((track) => track.name).join(', ')}.`
        : '6 флаконов по 60мл из состава коллекции Pain Girl.',
      image: '/Pain girl.jpg',
      basePrice: bundlePrice,
      // The set is not six bottles off the single-bottle table: 5 x 1333 + 1335
      // for 0mg, and the same shape for the stronger bottles, which is exactly
      // what the server charges for the six compositions separately.
      setPricing: BUNDLE_PRICES,
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
      id="pain-girl-gallery"
      className="relative z-10 flex-1 w-full flex flex-col animate-fade-rise"
    >
      {/*
        touch-pan-y hands the vertical pan back to the page. Without it the
        spiral would swallow every scroll that starts on it and the sections
        below would be unreachable on a phone.
      */}
      {/*
        Room for the artwork band on a phone. It is the same aspect ratio the
        background layer paints the artwork at, and the same width, so the spiral
        begins exactly where the artwork ends.
      */}
      <div
        aria-hidden
        className="w-full shrink-0 md:hidden"
        style={{ aspectRatio: `${PAIN_GIRL_ARTWORK.width} / ${PAIN_GIRL_ARTWORK.height}` }}
      />

      {/* The stage takes everything the artwork does not, from md up. The artwork
          is painted only across the left of the screen and faded to black where
          this begins, so the spiral reads against pure black with nothing of
          the image behind it. A phone has no width to spare for the two, so
          there the artwork takes a band across the top instead and the spiral
          fills what is left of the screen, full width and centred. */}
      <div
        className="relative w-full flex-1 min-h-[360px] md:flex-none md:min-h-0 md:ml-auto overflow-hidden flex items-center justify-center touch-pan-y"
        style={
          isDesktop
            ? { height: 650 * growth, width: stageWidth, maxWidth: stageWidth }
            : undefined
        }
      >
        <InfiniteSpiral
          items={spiralItems}
          animationMode="all"
          cardHeight={150 * growth}
          cardRadius={12 * growth}
          cardWidth={115 * growth}
          centerScale={1.25}
          direction="up"
          edgeBlur={5}
          edgeFade={0.35}
          imageFit="cover"
          pauseOnHover
          perspective={1100 * growth}
          // Measured against the stage, not chosen: the helix is as wide as its
          // radius plus a card, and the stage is what is left of the screen once
          // the artwork has taken its half. At the tightest desktop (1280x800,
          // where the stage is a little over 600px) the radius and card width
          // together put the outermost frames a few pixels past the stage, and
          // the stage clips them -- so they are sized to fit it.
          radius={168 * growth}
          speed={0.5}
          verticalSpacing={65 * growth}
        />
      </div>

      {/* Absolute, so the stage keeps the height it was measured at. From tablet
          up it is pinned near the foot of the first screenful by CSS rather than
          the foot of the stage, which is taller than the screen on purpose; a
          phone leaves it in the flow, where the stage fits the screen anyway. */}
      <button
        id="pain-girl-buy-btn"
        onClick={() => setIsStoryModalOpen(true)}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-[3vw] md:translate-x-0 z-30 px-5 py-3 rounded-2xl bg-[#111] hover:bg-[#222] border border-[#333] hover:border-[#555] text-amber-400 hover:text-amber-300 font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-all duration-300 shadow-lg cursor-pointer"
      >
        Оформить коллекцию
      </button>

      {isStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-rise">
          <div className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto rounded-3xl bg-[#111] border border-[#333] p-6 sm:p-8 text-white shadow-2xl">
            <button
              onClick={() => setIsStoryModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close"
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

              <ul className="w-full space-y-2">
                {tracks.map((track, idx) => (
                  <li
                    key={track.id}
                    className="flex items-center justify-between px-4 py-2 rounded-xl bg-[#181818] border border-[#222]"
                  >
                    <span className="text-stone-400 font-bold font-mono text-xs">{idx + 1}.</span>
                    <span className="font-semibold text-white truncate px-2 text-xs">{track.name}</span>
                    <span className="text-amber-400 text-[10px] uppercase font-bold font-mono">60ml</span>
                  </li>
                ))}
              </ul>

              <div className="w-full space-y-2 pt-2">
                <label className="block text-xs font-mono uppercase font-bold text-amber-400">
                  Выберите крепость никотина:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BUNDLE_NICOTINE.map((nic) => {
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

              <div className="w-full pt-4 border-t border-[#222] flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-stone-400 font-bold">Итоговая цена:</span>
                <span className="font-serif text-3xl font-extrabold text-amber-400">{bundlePrice} руб.</span>
              </div>

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
};

export default PainGirlSpiralSection;

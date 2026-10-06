import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
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
 * story modal, which a frame opens when it is tapped: the spiral itself stays
 * bare, because a header and a caption list were both removed from it on purpose.
 *
 * The key art behind the screen is painted by the background layer, not here, so
 * it sits under the header as well. From tablet up it fills the screen with the
 * subject on the left and the stage takes the right; on a phone there is no width
 * for the two side by side, so the artwork becomes a band across the top and the
 * spiral starts underneath it. Either way the two never overlap.
 *
 * The split between the two is a measured one. From tablet up the artwork is
 * painted only across the left of the screen and faded to black where this
 * section begins, rather than being laid over the whole screen and dimmed: the
 * spiral has to read against pure black, and behind it there is now nothing but
 * black. Both the artwork's share and the width reserved here are read from the
 * same custom properties (--pain-girl-art-width, --pain-girl-stage-width), and
 * the fade is part of the width rather than a separate number, so the artwork's
 * edge and the stage's edge cannot drift apart.
 *
 * On a phone the section opens itself: the artwork covers the screen for three
 * seconds and then fades away, and the spiral is what is underneath it. The
 * sequence runs once per entry into the collection, which is to say once per
 * mount -- leaving the collection and coming back plays it again.
 */
export const PainGirlSpiralSection: React.FC = () => {
  const products = useAppStore((state) => state.products);
  const addToCart = useAppStore((state) => state.addToCart);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const setActiveCollection = useAppStore((state) => state.setActiveCollection);
  const painGirlStories = useAppStore((state) => state.painGirlStories);

  // The frame whose story is open. null keeps the modal out of the tree; the
  // number is the index into the gallery, so opening frame 0 is not ambiguous
  // with "no frame" the way a boolean would be.
  const [activeFrameIndex, setActiveFrameIndex] = useState<number | null>(null);
  const [selectedNicotine, setSelectedNicotine] = useState<NicotineType>('3mg');

  // 'hold' keeps the splash up for three seconds, 'fade' runs the 600ms wipe,
  // null means it is out of the tree entirely and cannot take a touch. Starting
  // at null on a desktop means the splash is never built there at all.
  const [splashPhase, setSplashPhase] = useState<'hold' | 'fade' | null>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
      ? 'hold'
      : null
  );

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

  // The splash holds, then fades, then leaves. Two effects rather than one
  // timeout carrying both phases, so the fade's duration is the class it is
  // styled with rather than a number the JS has to keep in step with the CSS.
  useEffect(() => {
    if (splashPhase !== 'hold') return undefined;
    const timer = window.setTimeout(() => setSplashPhase('fade'), 3000);
    return () => window.clearTimeout(timer);
  }, [splashPhase]);

  useEffect(() => {
    if (splashPhase !== 'fade') return undefined;
    const timer = window.setTimeout(() => setSplashPhase(null), 600);
    return () => window.clearTimeout(timer);
  }, [splashPhase]);

  const growth = isDesktop ? 2 : 1;
  const isSplashUp = splashPhase !== null;
  // On a phone the spiral waits for the splash to finish, and only its entrance
  // is delayed: on a desktop it is live from the first paint, as it always was.
  const spiralInteractive = !isSplashUp;

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

  // The frame on screen, with an admin's edit sitting on top of the shipped copy.
  // A frame with no override falls back to the data file, which is why only
  // edited frames are ever fetched.
  const activeFrame = activeFrameIndex === null ? null : PAIN_GIRL_GALLERY[activeFrameIndex];
  const activeStoryText = useMemo(() => {
    if (!activeFrame) return '';
    const override = painGirlStories.find((story) => story.frameId === activeFrame.src);
    return override?.storyText ?? activeFrame.storyText;
  }, [activeFrame, painGirlStories]);

  const openStory = (index: number) => setActiveFrameIndex(index);
  const closeStory = () => setActiveFrameIndex(null);
  const stepStory = (delta: number) => {
    setActiveFrameIndex((current) => {
      if (current === null) return current;
      const count = PAIN_GIRL_GALLERY.length;
      return (current + delta + count) % count;
    });
  };

  // Esc is the close that does not take you back to the overview: the back button
  // in the corner does that on purpose, but a key press should just put the modal
  // away and leave the collection where it was.
  useEffect(() => {
    if (activeFrameIndex === null) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeStory();
      if (event.key === 'ArrowLeft') stepStory(-1);
      if (event.key === 'ArrowRight') stepStory(1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeFrameIndex]);

  // This is the same handler the collection has always checked out with: the
  // bundle product, the set pricing the server charges for the six singles, and
  // the cart opening itself afterwards. Only the button's label moved.
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
    closeStory();
    setIsCartOpen(true);
  };

  // Back to the selector: the modal closes and the collection clears, which is
  // what renders the carousel again.
  const backToAllCollections = () => {
    closeStory();
    setActiveCollection('All');
  };

  return (
    <>
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
          the image behind it. A phone has no width to spare for the two, so there
          the artwork takes a band across the top instead and the spiral fills what
          is left of the screen, full width and centred -- and the stage paints its
          own black, so the helix never has a photograph showing through it. */}
      <div
        className="relative w-full flex-1 min-h-[360px] md:flex-none md:min-h-0 md:ml-auto overflow-hidden flex items-center justify-center touch-pan-y bg-black"
        style={
          isDesktop
            ? { height: 650 * growth, width: stageWidth, maxWidth: stageWidth }
            : undefined
        }
      >
        {/* The spiral waits behind the splash on a phone, and comes in on the
            black rather than popping onto it. The entrance is a transform and an
            opacity, so it costs no layout: the stage is the same box throughout.
            It also takes the pointer while it is waiting, so the first tap of the
            session cannot reach a card the customer has not seen yet. */}
        <InfiniteSpiral
          className={`pain-girl-spiral-entry ${spiralInteractive ? 'pain-girl-spiral-entry--in' : 'pain-girl-spiral-entry--out'}`}
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
          onSelectItem={openStory}
        />
      </div>

      {/* The splash itself. Full-bleed, black behind the art so the fade lands on
          black, and it is the overlay that owns the phone's first three seconds.
          While it is fading it no longer takes pointers, and once the second
          timer runs it is out of the tree, so nothing underneath can be blocked
          by a layer that is no longer there. It lives in a portal because the
          section's entrance keeps a transformed ancestor in the tree, and a
          transformed ancestor would put the fixed overlay behind the screen. */}
      </div>

      {isSplashUp &&
        createPortal(
          <div
            id="pain-girl-splash"
            aria-hidden
            className={`fixed inset-0 z-10 bg-black overflow-hidden ${splashPhase === 'fade' ? 'pain-girl-splash--out' : 'pain-girl-splash--in'}`}
          >
            <img
              src={PAIN_GIRL_ARTWORK.src}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>,
          document.body
        )}

      {activeFrameIndex !== null &&
        activeFrame &&
        createPortal(
          <div
            id="pain-girl-story-modal"
            data-story-shell
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-rise"
          >
          {/* A tap on the backdrop puts the modal away without going anywhere. */}
          <button
            type="button"
            aria-label="Закрыть"
            onClick={closeStory}
            className="absolute inset-0 cursor-default"
          />

          {/* The shell. Its own subtree is keyed per frame below, so the arrows
              swap what is inside without React building the panel again -- the
              panel keeps its node, its scroll position and its transition. */}
          <div className="relative w-full max-w-6xl max-h-[85dvh] overflow-y-auto rounded-3xl bg-[#111] border border-[#333] p-4 sm:p-6 lg:p-8 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-4">
              <span className="font-mono text-xs uppercase tracking-wider font-bold text-amber-400 pt-2">
                {String(activeFrameIndex + 1).padStart(2, '0')} / {String(PAIN_GIRL_GALLERY.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={backToAllCollections}
                className="group flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#181818] hover:bg-amber-400 border border-[#333] hover:border-amber-300 text-stone-200 hover:text-slate-950 font-mono text-[11px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer"
              >
                Вернуться ко всем коллекциям
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
              {/* Keyed with the index: the image and the text swap as one unit,
                  which is what runs the fade on every arrow press. The box has its
                  height from CSS rather than from the image, so a frame still
                  loading cannot resize the panel under the reader's cursor. */}
              <div
                key={`art-${activeFrameIndex}`}
                className="pain-girl-frame-swap relative w-full aspect-square md:aspect-auto md:min-h-[42vh] rounded-2xl overflow-hidden border border-[#2a2a2a] bg-black"
              >
                <img
                  src={activeFrame.src}
                  alt={activeFrame.alt}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              <div
                key={`copy-${activeFrameIndex}`}
                className="pain-girl-frame-swap min-w-0 flex flex-col gap-3"
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider font-bold text-amber-400/80">
                    {activeFrame.subtitle}
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white leading-tight mt-1">
                    {activeFrame.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-stone-300 font-sans leading-relaxed whitespace-pre-line">
                  {activeStoryText}
                </p>
              </div>
            </div>

            {/* Footer: arrows to walk the set, then the strength the set is bought
                at, then the button that buys it. */}
            <div className="mt-6 pt-5 border-t border-[#222] space-y-5">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => stepStory(-1)}
                  aria-label="Предыдущая история"
                  className="group flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#181818] hover:bg-[#222] border border-[#333] hover:border-amber-400/60 text-stone-200 hover:text-amber-300 font-mono text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  Назад
                </button>

                <div className="flex-1 hidden sm:flex items-center justify-center">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
                    {activeFrame.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => stepStory(1)}
                  aria-label="Следующая история"
                  className="group flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#181818] hover:bg-[#222] border border-[#333] hover:border-amber-400/60 text-stone-200 hover:text-amber-300 font-mono text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer"
                >
                  Вперёд
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase font-bold text-amber-400">
                    Выберите крепость никотина:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BUNDLE_NICOTINE.map((nic) => {
                      const label = nic === '0mg' ? '0 мг' : nic === '3mg' ? '3 мг' : '6 мг';
                      const isSelected = selectedNicotine === nic;
                      return (
                        <button
                          type="button"
                          key={nic}
                          onClick={() => setSelectedNicotine(nic)}
                          aria-pressed={isSelected}
                          className={`py-3 min-h-[44px] rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
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

                <div className="flex flex-col justify-end gap-3">
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-xs font-mono uppercase text-stone-400 font-bold">
                      Итоговая цена:
                    </span>
                    <span className="font-serif text-3xl font-extrabold text-amber-400">
                      {bundlePrice} руб.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBundleToCart}
                    className="w-full min-h-[52px] py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-amber-400/20"
                  >
                    Добавить истории в плейлист ({bundlePrice} руб.)
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default PainGirlSpiralSection;

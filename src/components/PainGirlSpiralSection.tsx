import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

// The collection's own ambient bed, served from the public audio folder next to
// the other collections' tracks. Played while the collection is on screen.
const PAIN_GIRL_MUSIC_URL = '/audio/pain-girl.mp3';
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
 * for the two side by side, so the artwork never shows once the section is up --
 * the gallery still in the header stays, and the stage fills the whole width,
 * which is how a phone reads the collection as a helix against pure black.
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
 * On a phone the section opens itself: the artwork covers the screen for a second
 * and a half, then dissolves in an 800ms fade, and the spiral is what is
 * underneath it. The sequence runs once per entry into the collection, which is
 * to say once per mount -- leaving the collection and coming back plays it again.
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

  // 'hold' keeps the splash up for a second and a half, 'fade' runs the 800ms
  // dissolve, null means it is out of the tree entirely and cannot take a touch.
  // Starting at null on a desktop means the splash is never built there at all.
  const [splashPhase, setSplashPhase] = useState<'hold' | 'fade' | null>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
      ? 'hold'
      : null
  );

  // How far the site header reaches down on the phone. The splash's artwork is
  // centred in the space below it rather than in the whole viewport, so the
  // figure never slides under the bar. Measured because the header's height
  // depends on how its links wrap.
  const [navTop, setNavTop] = useState(0);

  useLayoutEffect(() => {
    const header = document.getElementById('main-app-nav');
    if (!header) return;
    const read = () => setNavTop(Math.round(header.getBoundingClientRect().height));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // How much of the screen the stage is given, which is the same question as how
  // much the artwork takes. Both come from CSS (--pain-girl-art-width and
  // --pain-girl-stage-width): the background layer paints the artwork against
  // those numbers, and two copies of a fraction in two files would be free to
  // disagree about where the split falls.
  const stageWidth = 'var(--pain-girl-stage-width)';

  // The frames double on a desktop, and so does the stage they travel through:
  // the component shrinks whatever does not fit, so leaving the stage at 650px
  // would have quietly scaled the growth straight back out again.
  //
  // The desktop here starts one pixel past the phone layout's upper bound: a
  // 768px screen still runs the phone's splash sequence, so it must also keep
  // the phone's stage -- full width, the spiral at home size, centred in the
  // screen. Neither the splash nor the desktop can own 768 without the other
  // leaking in.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 769px)').matches
  );

  useEffect(() => {
    const query = window.matchMedia('(min-width: 769px)');
    const onChange = () => setIsDesktop(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // The splash holds, then fades, then leaves. Two effects rather than one
  // timeout carrying both phases, so the fade's duration is the class it is
  // styled with rather than a number the JS has to keep in step with the CSS.
  useEffect(() => {
    if (splashPhase !== 'hold') return undefined;
    const timer = window.setTimeout(() => setSplashPhase('fade'), 1500);
    return () => window.clearTimeout(timer);
  }, [splashPhase]);

  useEffect(() => {
    if (splashPhase !== 'fade') return undefined;
    const timer = window.setTimeout(() => setSplashPhase(null), 800);
    return () => window.clearTimeout(timer);
  }, [splashPhase]);

  // The collection's ambient track starts the moment it is on screen and stops
  // when it unmounts. The first play attempt rides the tap that opened the
  // collection; an early rejection just means the browser wants a gesture for
  // unattended sound, so the next pointer or key retries until the gate opens --
  // the same retry shape the site-wide bed in App.tsx already uses.
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = musicRef.current;
    if (!audio) return undefined;
    audio.volume = 0.4;
    const tryPlay = () => {
      const started = audio.play();
      if (started && typeof started.catch === 'function') started.catch(() => {});
    };
    tryPlay();
    const retry = () => tryPlay();
    window.addEventListener('pointerdown', retry);
    window.addEventListener('keydown', retry);
    return () => {
      window.removeEventListener('pointerdown', retry);
      window.removeEventListener('keydown', retry);
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

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
      {/* The stage takes everything the artwork does not, from md up. The artwork
          is painted only across the left of the screen and faded to black where
          this begins, so the spiral reads against pure black with nothing of
          the image behind it. A phone, by contrast, has no artwork of its own at
          all: the splash owns its entry and then leaves, and what is left is
          just this stage on its own black -- the artwork band that used to
          linger there was the ghost this section is cleared of. */}
      <div
        className="relative w-full flex-1 min-h-[360px] min-[769px]:flex-none min-[769px]:min-h-0 min-[769px]:ml-auto overflow-hidden flex items-stretch justify-center touch-pan-y bg-black"
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

      {/* The collection's ambient bed, rendered so the browser can fetch it from
          the tap that opened the collection and so a probe can read whether it
          plays. `hidden` keeps it out of layout; loop and the volume live on
          the element, the play/retry logic in the effect above. */}
      <audio
        ref={musicRef}
        src={PAIN_GIRL_MUSIC_URL}
        loop
        preload="auto"
        hidden
      />

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
            {/* The artwork sits in a box that starts below the header, so the
                scaled figure is centred in the visible space without ever
                sliding under the bar. */}
            <div
              className="pain-girl-splash-stage absolute inset-x-0 bottom-0"
              style={{ top: navTop }}
            >
              <img
                src={PAIN_GIRL_ARTWORK.src}
                alt=""
                className="pain-girl-splash-img w-full h-full object-cover"
                draggable={false}
              />
            </div>
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
              {/* The "back to the collections" control. On a desktop it stays up
                  here in the corner; on a phone it moves to the bottom of the
                  modal, into the footer action stack, so the thumb does not have
                  to reach for the top of the sheet. The two copies never show
                  together: each is hidden where the other is shown. */}
              <button
                type="button"
                onClick={backToAllCollections}
                className="group hidden md:flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#181818] hover:bg-amber-400 border border-[#333] hover:border-amber-300 text-stone-200 hover:text-slate-950 font-mono text-[11px] sm:text-xs uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer"
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
                className="pain-girl-frame-swap relative w-full max-w-[70%] mx-auto aspect-square rounded-2xl overflow-hidden border border-[#2a2a2a] bg-black md:max-w-none md:mx-0 md:aspect-auto md:min-h-[42vh]"
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
                at beside the button that buys it. The two sit on one horizontal
                line on a desktop -- the strength options left, the CTA right of
                them, both vertically centred -- and stack on a phone. The price
                is not laid out as a line of its own anywhere: the button's label
                is the price, which is the only copy that needs it. At the very
                bottom of the sheet a phone gets the return control, duplicated
                from the corner that a desktop keeps it in. */}
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

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
                <div className="space-y-2 md:flex-1">
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

              <button
                type="button"
                onClick={handleAddBundleToCart}
                className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-extrabold text-xs sm:text-sm md:text-base uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-amber-400/20 md:w-auto md:min-w-[320px] md:justify-center"
              >
                Добавить истории в плейлист ({bundlePrice} руб.)
              </button>
            </div>

            {/* The mobile copy of the return control, at the bottom of the action
                stack. Hidden on a desktop, where the corner copy shows instead. */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={backToAllCollections}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#181818] hover:bg-amber-400 border border-[#333] hover:border-amber-300 text-stone-200 hover:text-slate-950 font-mono text-[11px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer"
              >
                Вернуться ко всем коллекциям
                <ChevronRight className="w-4 h-4" />
              </button>
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

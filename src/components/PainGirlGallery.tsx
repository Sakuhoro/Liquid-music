import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ImageOff, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getCollectionTitle } from '../types';
import { PAIN_GIRL_GALLERY } from '../data/painGirlGallery';
import SkewedCarousel, { SkewedCarouselItem } from './ui/skewed-carousel';

const toCarouselItems = (): SkewedCarouselItem[] =>
  PAIN_GIRL_GALLERY.map((frame, index) => ({
    id: frame.src,
    title: frame.title,
    description: frame.subtitle,
    image: frame.src,
    badge: String(index + 1).padStart(2, '0'),
    color: '',
    alt: frame.alt,
  }));

/**
 * The tab a gallery collection opens on. Every other collection tab renders the
 * product grid, so this one brings its own header and its own stage: the same
 * skewed carousel the collection overview uses, narrowed to square cards because
 * the artwork is square, with no collection CTA because there is no collection to
 * open -- clicking a frame opens the frame itself.
 */
export const PainGirlGallery: React.FC = () => {
  const setActiveCollection = useAppStore((state) => state.setActiveCollection);
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((prev) =>
        prev === null ? prev : (prev + delta + PAIN_GIRL_GALLERY.length) % PAIN_GIRL_GALLERY.length
      ),
    []
  );

  useEffect(() => {
    if (openIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openIndex, close, step]);

  const open = openIndex === null ? null : PAIN_GIRL_GALLERY[openIndex];

  return (
    <div
      id="pain-girl-gallery"
      className="relative z-10 flex-1 w-full py-4 pb-16 flex flex-col animate-fade-rise"
    >
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8">
        <div
          className={`flex flex-col gap-4 mb-4 pb-6 border-b ${
            isDark ? 'border-white/10' : 'border-slate-300'
          }`}
        >
          <div>
            <button
              onClick={() => setActiveCollection('All')}
              className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest mb-2 cursor-pointer transition-colors ${
                isDark
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-amber-700 hover:text-amber-800 font-bold'
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
              {getCollectionTitle('Pain Girl')}
            </h2>
            <p
              className={`text-sm sm:text-base mt-2 max-w-xl font-sans font-normal antialiased leading-relaxed ${
                isDark ? 'text-stone-300' : 'text-slate-800'
              }`}
            >
              Сезонная коллекция образов.
            </p>
          </div>
        </div>
      </div>

      {PAIN_GIRL_GALLERY.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <ImageOff className="w-12 h-12 mx-auto opacity-30" />
          <p className="text-sm font-medium opacity-80">Галерея пока пуста</p>
        </div>
      ) : (
        <div className="w-full">
          <SkewedCarousel
            items={toCarouselItems()}
            onSelectItem={(id) =>
              setOpenIndex(PAIN_GIRL_GALLERY.findIndex((frame) => frame.src === id))
            }
            layout="inline"
            // The overview owns the viewport, so the wheel can drive the carousel.
            // Here it sits in a page between other sections, so scrolling has to
            // keep scrolling and the arrow keys are left to the lightbox.
            scrollMode="pass"
            keyboardNav={false}
            cardAspect="square"
            showHeader={false}
            showCta={false}
            itemNoun="Работа"
          />
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-fade-rise"
          onClick={close}
        >
          <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 shrink-0">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
              Работа {(openIndex ?? 0) + 1} из {PAIN_GIRL_GALLERY.length}
            </span>
            <button
              ref={closeButtonRef}
              onClick={close}
              aria-label="Закрыть"
              className="p-2 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center px-4 pb-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={open.src}
              alt={open.alt}
              className="max-h-full max-w-full object-contain drop-shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 pb-6 pt-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Предыдущая работа"
              className="p-2.5 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white transition-colors cursor-pointer shrink-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="min-w-0 text-center">
              <h3 className="font-serif text-xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
                {open.title}
              </h3>
              <p className="text-xs font-mono text-amber-300/90 mt-1 truncate">{open.subtitle}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Следующая работа"
              className="p-2.5 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white transition-colors cursor-pointer shrink-0"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PainGirlGallery;

import React from 'react';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getCollectionTitle } from '../types';
import { PAIN_GIRL_GALLERY } from '../data/painGirlGallery';
import CircularCarousel from './ui/CircularCarousel';

/**
 * The tab a gallery collection opens on. Every other collection tab renders the
 * product grid, so this one brings its own header and its own stage: a circular
 * ring of frames with no search box and no grid toggle, because neither means
 * anything here.
 */
export const PainGirlGallery: React.FC = () => {
  const setActiveCollection = useAppStore((state) => state.setActiveCollection);
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

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
        /* The ring is height:100% inside an overflow:hidden box, so its height
           has to come from a *definite* parent height. A flex-1/min-h-[…]
           wrapper does not count: the percentage falls back to auto, collapses
           to zero against absolutely-positioned children, and the whole ring is
           clipped away. Hence a plain vh height here rather than flex fill. */}
        <div className="w-full h-[58vh] sm:h-[62vh] max-h-[820px] px-2 sm:px-6">
          <CircularCarousel
            items={PAIN_GIRL_GALLERY}
            preset="cylinder"
            intro="rise"
            cardWidth={216}
            aspectRatio={1}
            speed={14}
            captions
            fadeColor={isDark ? '#071826' : '#d7e3ec'}
            cornerRadius={16}
          />
        </div>
      )}
    </div>
  );
};

export default PainGirlGallery;
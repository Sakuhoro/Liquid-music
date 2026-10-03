import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getCollectionTitle } from '../types';
import { PAIN_GIRL_GALLERY } from '../data/painGirlGallery';
import InfiniteSpiral from './ui/InfiniteSpiral';

/**
 * The tab a gallery collection opens on. Every other collection tab renders the
 * product grid, so this one brings its own header and its own stage: the frames
 * travel up a helix instead of sitting in a grid, which keeps the collection
 * readable without a scrollbar.
 *
 * The frames come from the shared gallery data rather than a list written out
 * here, so the artwork stays defined in one place.
 */
export const PainGirlSpiralSection: React.FC = () => {
  const setActiveCollection = useAppStore((state) => state.setActiveCollection);
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

  const spiralItems = PAIN_GIRL_GALLERY.map((frame, index) => ({
    id: frame.src,
    src: frame.src,
    alt: frame.alt,
    label: `${frame.title}, ${frame.subtitle}`
  }));

  return (
    <div id="pain-girl-gallery" className="relative z-10 flex-1 w-full py-4 pb-16 flex flex-col animate-fade-rise">
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

      {/*
        touch-pan-y hands the vertical pan back to the page. Without it the
        spiral would swallow every scroll that starts on it and the sections
        below would be unreachable on a phone.
      */}
      <div className="relative w-full h-[650px] overflow-hidden flex items-center justify-center my-8 touch-pan-y">
        <InfiniteSpiral
          items={spiralItems}
          animationMode="all"
          cardHeight={150}
          cardRadius={12}
          cardWidth={120}
          centerScale={1.25}
          direction="up"
          edgeBlur={5}
          edgeFade={0.35}
          imageFit="cover"
          pauseOnHover
          perspective={1100}
          radius={180}
          speed={0.5}
          verticalSpacing={65}
        />
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 justify-center">
          {PAIN_GIRL_GALLERY.map((frame) => (
            <li
              key={frame.src}
              className={`text-[0.6875rem] font-mono uppercase tracking-widest ${
                isDark ? 'text-stone-400' : 'text-slate-600'
              }`}
            >
              {frame.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PainGirlSpiralSection;

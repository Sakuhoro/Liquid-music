import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
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
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

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

  const spiralItems = PAIN_GIRL_GALLERY.map((frame, index) => ({
    id: frame.src,
    src: frame.src,
    alt: frame.alt,
    label: `${frame.title}, ${frame.subtitle}`
  }));

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
      <div
        className="relative w-full overflow-hidden flex items-center justify-center touch-pan-y"
        style={{ height: 650 * growth }}
      >
        <InfiniteSpiral
          items={spiralItems}
          animationMode="all"
          cardHeight={150 * growth}
          cardRadius={12 * growth}
          cardWidth={120 * growth}
          centerScale={1.25}
          direction="up"
          edgeBlur={5}
          edgeFade={0.35}
          imageFit="cover"
          pauseOnHover
          perspective={1100 * growth}
          radius={180 * growth}
          speed={0.5}
          verticalSpacing={65 * growth}
        />
      </div>
    </div>
  );
};

export default PainGirlSpiralSection;

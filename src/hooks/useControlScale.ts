import { useEffect, useState } from 'react';

/**
 * The header controls' size knob, read back from the stylesheet rather than
 * restated here. --control-scale is what index.css sets per breakpoint, so
 * reading it keeps one source of truth for where the scaling starts and stops:
 * a second copy of those numbers in TypeScript would be free to drift out of
 * step with the CSS, and the header's controls would quietly stop matching the
 * rest of the page.
 *
 * Only the theme switch needs this: the mute and cart buttons are sized in CSS,
 * but the switch's geometry is arithmetic (track, inset, thumb travel), so it
 * has to be handed a number.
 */
export const useControlScale = (): number => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const read = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue('--control-scale');
      const parsed = parseFloat(raw);
      setScale(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
    };

    read();
    // A media query change fires no event of its own, so the read follows the
    // window; it is one getComputedStyle against a custom property, which is
    // not worth the machinery of a ResizeObserver that could only ever fire on
    // the same resize.
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  return scale;
};
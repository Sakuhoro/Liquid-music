import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CollectionName } from '../types';
import { PAIN_GIRL_ARTWORK } from '../data/painGirlGallery';

// Shown for the hero and for any collection without its own cut.
const HERO_VIDEO_LIGHT = '/videos/role-act-as-a-master-animato.mp4';
const HERO_VIDEO_DARK = '/videos/night-head.mp4';

// Per-collection cuts, keyed by the internal collection id rather than the
// public title, so "Bones of what you Believe" is the 'Permanent 1' key. A
// collection listed with the same file on both sides plays that cut in either
// theme, which is the case for Bones.
const COLLECTION_VIDEOS: Partial<Record<CollectionName, { light: string; dark: string }>> = {
  Summer: { light: '/videos/summer-lite.mp4', dark: '/videos/summer-dark.mp4' },
  Autumn: { light: '/videos/autumn-lite.mp4', dark: '/videos/autumn-dark.mp4' },
  'Permanent 1': { light: '/videos/bones.mp4', dark: '/videos/bones.mp4' },
};

interface StillBackground {
  image: string;
  /** Where the subject sits when the artwork fills the screen. */
  position: string;
  /**
   * Set when a narrow screen cannot put the artwork and the content side by side.
   * The artwork then goes across the screen at its own proportions, sitting just
   * under the header, and the content starts where the artwork ends, so the
   * composition is neither cropped nor covered.
   */
  band?: {
    /** Kept in step with the room the screen leaves for it. */
    aspectRatio: string;
    /** Measured off the file: what the artwork fades out into at its edges. */
    surround: string;
  };
}

// Some collections are artwork rather than footage, and a still reads better
// than a clip here: the illustration is the point, so it is anchored to the
// left edge, which is where the subject stands, and the screen's own content is
// laid out to the right of it. Kept in this file so there is still exactly one
// background layer behind the header and the content below it.
const COLLECTION_STILL: Partial<Record<CollectionName, StillBackground>> = {
  'Pain Girl': {
    image: PAIN_GIRL_ARTWORK.src,
    position: 'left center',
    band: {
      aspectRatio: `${PAIN_GIRL_ARTWORK.width} / ${PAIN_GIRL_ARTWORK.height}`,
      surround: '#0a0a0a',
    },
  },
};

// The clips carry a generation watermark along the right-hand margin, so each
// one is blown up and anchored left of centre to push that margin out of
// frame. Zooming further crops more of the right side; the source resolution
// leaves room for it before the image starts to soften.
const VIDEO_ZOOM = 1.45;
const VIDEO_ORIGIN = '22% 50%';

export const BackgroundVideo: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const activeCollection = useAppStore((state) => state.activeCollection);

  const videoRef = useRef<HTMLVideoElement>(null);
  const isDark = theme === 'dark';

  const collectionCut =
    activeCollection === 'All' ? undefined : COLLECTION_VIDEOS[activeCollection];
  const still = activeCollection === 'All' ? undefined : COLLECTION_STILL[activeCollection];
  const currentVideoSrc = collectionCut
    ? isDark
      ? collectionCut.dark
      : collectionCut.light
    : isDark
      ? HERO_VIDEO_DARK
      : HERO_VIDEO_LIGHT;

  // The header belongs to the page rather than to this layer, but on a narrow
  // screen the artwork has to start below it. Measured rather than assumed: its
  // height depends on how the links wrap, which changes with the width.
  const [chromeTop, setChromeTop] = useState(0);

  useEffect(() => {
    const header = document.getElementById('main-app-nav');
    if (!header) return;
    const read = () => setChromeTop(Math.round(header.getBoundingClientRect().height));
    read();
    const observer = new ResizeObserver(read);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Nothing to play when the collection brings its own artwork.
    if (still) return;
    const playSafe = async () => {
      if (videoRef.current) {
        try {
          videoRef.current.muted = true;
          await videoRef.current.play();
        } catch (err) {
          // Autoplay handled safely
        }
      }
    };
    playSafe();
  }, [currentVideoSrc, still]);

  return (
    <div
      id="cinematic-video-stage"
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none"
    >
      {still ? (
        <>
          {/*
            A phone gets the whole composition at its own proportions, sitting just
            under the header, with the screen's content starting where the artwork
            ends. A portrait crop of a landscape illustration would show nothing
            but its dark margins, which is why the artwork is laid out whole here
            instead of being covered to fit. Tablet and up get it full-screen with
            the content laid out beside it. Either way this is one layer behind
            the header and the content, which is what keeps them reading as a
            single canvas.
          */}
          {still.band ? (
            <div
              data-testid="collection-still-band"
              className="absolute inset-0 z-0 bg-no-repeat md:hidden"
              style={{
                // The artwork's own surround, so the parts of the screen it does
                // not reach are the same flat black rather than the page's grey.
                // Nothing stops on an edge: the file fades into this colour.
                backgroundColor: still.band.surround,
                backgroundImage: `url('${still.image}')`,
                backgroundSize: '100% auto',
                backgroundPosition: `left ${chromeTop}px`,
              }}
            />
          ) : null}
          <div
            data-testid="collection-still"
            className={`absolute inset-0 z-0 bg-cover bg-no-repeat ${still.band ? 'hidden md:block' : ''}`}
            style={{
              backgroundImage: `url('${still.image}')`,
              backgroundPosition: still.position,
            }}
          />
          {/* Scrim flat rather than a gradient on purpose: a directional one would
              put a second tonal break across the screen, which is the seam this
              layer exists to avoid. */}
          <div className="absolute inset-0 z-1 pointer-events-none bg-black/25" />
        </>
      ) : (
        <>
          {/* Strictly Clean Cinematic Looping Video - No Character Silhouettes or Floating Notes */}
          <video
            key={currentVideoSrc}
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000"
            style={{ transform: `scale(${VIDEO_ZOOM})`, transformOrigin: VIDEO_ORIGIN }}
            src={currentVideoSrc}
          />

          {/* Clean, Subtle Atmospheric Contrast Tint to preserve contrast for foreground typography */}
          <div
            className={`absolute inset-0 z-1 pointer-events-none transition-colors duration-1000 ${
              isDark
                ? 'bg-gradient-to-t from-[hsl(201,100%,13%)] via-[hsla(201,100%,13%,0.65)] to-[hsla(201,100%,10%,0.35)]'
                : 'bg-gradient-to-t from-[hsl(204,45%,96%)] via-[hsla(204,45%,96%,0.45)] to-[hsla(204,45%,96%,0.2)]'
            }`}
          />
        </>
      )}
    </div>
  );
};

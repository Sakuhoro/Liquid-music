import React, { useRef, useEffect } from 'react';
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
   * Set when the artwork can be given its own half of a wide screen instead of
   * being laid across all of it. The file is 1366x768, so on a 16:9 screen a
   * full-bleed cover crop has to throw away about a third of the width to reach
   * the height; splitting the screen instead lets the artwork keep more of
   * itself and leaves the rest pure black for the content to sit on.
   *
   * Everything about the split's geometry -- how much of the screen the artwork
   * takes, how it is cropped or fitted, how far it fades into black, and the
   * width that leaves for the stage -- is in CSS (--pain-girl-art-width,
   * .hall-pain-art, --pain-girl-stage-width), because the stage reserves that
   * room from the same numbers. Only what is measured off the file is here:
   * where inside it the subject stands.
   */
  split?: {
    /** Where inside the artwork the panel's share lands, horizontally. */
    focal: string;
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
    split: {
      // Measured off the file: the subject sits left of the file's middle, with
      // her head around 38% across and her body running down from there. The
      // panel is drawn large enough (80% of the screen's height) that 38% keeps
      // her whole figure in frame; pushing the anchor further left would slide
      // her out of the panel a few dozen pixels at a time, so the horizontal is
      // left at the anchor and the vertical calibration (80px straight down)
      // lives in the CSS (background-position-y on a desktop), next to the
      // sizing.
      focal: '38%',
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

  // Nothing to play when the collection brings its own artwork.
  useEffect(() => {
    if (still || activeCollection === 'Pain Girl') return;
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
  }, [currentVideoSrc, still, activeCollection]);

  if (activeCollection === 'Pain Girl') {
    return (
      <div
        id="cinematic-video-stage"
        className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none bg-black"
      />
    );
  }

  return (
    <div
      id="cinematic-video-stage"
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none"
    >
      {still ? (
        <>
          {/* The artwork's own black, filling everything the artwork does not.
              From tablet up that is the whole of the content's half, so the
              spiral reads against pure black with no image behind it. A phone
              gets no artwork at all behind the spiral: the splash owns its entry
              and the stage paints its own black after it, so there is nothing
              for this layer to hold -- the ghost of the entry artwork that used
              to stay as a band across the top is gone with the band. */}
          {still.split ? (
            <div
              data-testid="collection-still-surround-wide"
              className="absolute inset-0 z-0 hidden"
              style={{ backgroundColor: '#000000' }}
            />
          ) : null}
          {/*
            A wide screen is split rather than covered. The artwork is painted
            into its own share of the width and the rest of the screen is the
            artwork's own surround, so the two meet along a fade instead of along
            an edge, and everything the content sits on behind it is black. Both
            the share and the fade live in CSS (--pain-girl-art-width,
            .hall-pain-art), so the section that reserves the room reads the same
            number the artwork is painted against.
          */}
          {still.split ? (
            <div
              data-testid="collection-still-split"
              className="hall-pain-art z-0 hidden"
              style={{
                // Only the horizontal placement is set here: the panel's size,
                // where it is cropped or fitted, and the fade into the stage are
                // all in CSS (.hall-pain-art), which the stage's own width is
                // measured from -- so the picture and the spiral cannot disagree
                // about where they meet.
                backgroundPositionX: still.split.focal,
                backgroundImage: `url('${still.image}')`,
              }}
            />
          ) : (
            <div
              data-testid="collection-still"
              className="absolute inset-0 z-0 bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url('${still.image}')`,
                backgroundPosition: still.position,
              }}
            />
          )}
          {/* Scrim flat rather than a gradient on purpose: a directional one would
              put a second tonal break across the screen, which is the seam this
              layer exists to avoid. Over a split the scrim only covers the
              artwork's own half, so the content's half stays the pure black it
              is meant to be. */}
          {still.split ? (
            // Only while the artwork is cropped into its panel. Past 2560 it is
            // shown whole and nothing is laid over it, so darkening it would
            // leave the black inside the panel a shade off the black outside it.
            <div className="hall-pain-scrim hall-pain-art z-1 hidden pointer-events-none bg-black/25" />
          ) : (
            <div className="absolute inset-0 z-1 pointer-events-none bg-black/25" />
          )}
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

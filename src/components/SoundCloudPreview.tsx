import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

const WIDGET_API_SRC = 'https://w.soundcloud.com/player/api.js';
const WIDGET_ORIGIN = 'https://w.soundcloud.com';

export type SoundCloudPreviewStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface SoundCloudWidgetApi {
  play(): void;
  pause(): void;
  toggle(): void;
  setVolume(volume: number): void;
  bind(event: string, listener: () => void): void;
  unbind(event: string): void;
}

interface SoundCloudWidgetConstructor {
  (element: HTMLIFrameElement): SoundCloudWidgetApi;
  Events: {
    READY: string;
    PLAY: string;
    PAUSE: string;
    FINISH: string;
    ERROR: string;
  };
}

interface SoundCloudGlobal {
  Widget: SoundCloudWidgetConstructor;
}

declare global {
  interface Window {
    SC?: SoundCloudGlobal;
  }
}

const buildPlayerSrc = (url: string) => {
  const params = new URLSearchParams({
    url,
    color: '#fbbf24',
    auto_play: 'false',
    visual: 'false',
    hide_related: 'true',
    show_artwork: 'false',
    show_user: 'false',
    show_reposts: 'false',
    show_comments: 'false',
    show_playcount: 'false',
    buying: 'false',
    sharing: 'false',
    download: 'false',
    // Stopping any other SoundCloud player on the page when this one starts.
    single_active: 'true',
  });
  return `${WIDGET_ORIGIN}/player/?${params.toString()}`;
};

let apiPromise: Promise<SoundCloudGlobal> | null = null;

// The widget API is a classic external script, so it has to be appended as a real
// <script> element. An iframe/render that never injects it leaves window.SC undefined
// and every play() call silently does nothing.
const loadWidgetApi = (): Promise<SoundCloudGlobal> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('SoundCloud preview requires a browser environment'));
  }
  if (window.SC?.Widget) return Promise.resolve(window.SC);

  if (!apiPromise) {
    apiPromise = new Promise<SoundCloudGlobal>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = WIDGET_API_SRC;
      script.async = true;
      script.onload = () => {
        if (window.SC?.Widget) {
          resolve(window.SC);
        } else {
          apiPromise = null;
          reject(new Error('SoundCloud Widget API loaded but did not initialise'));
        }
      };
      script.onerror = () => {
        apiPromise = null;
        reject(new Error('Failed to load the SoundCloud Widget API'));
      };
      document.head.appendChild(script);
    });
  }

  return apiPromise;
};

export interface SoundCloudPreviewHandle {
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
}

interface SoundCloudPreviewProps {
  url?: string | null;
  volume?: number;
  onStatusChange?: (status: SoundCloudPreviewStatus) => void;
  onPlayingChange?: (playing: boolean) => void;
}

/**
 * Invisible SoundCloud player bound to a product's track link.
 *
 * The real player lives in a 1px iframe so the catalogue keeps its own layout, and
 * the visible control is whatever button owns the `ref` (see ProductDetailModal).
 * Playback is always stopped when the component unmounts, which is what keeps a
 * track from continuing after the product modal closes.
 */
export const SoundCloudPreview = forwardRef<SoundCloudPreviewHandle, SoundCloudPreviewProps>(
  function SoundCloudPreview({ url, volume = 100, onStatusChange, onPlayingChange }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const widgetRef = useRef<SoundCloudWidgetApi | null>(null);
    const pendingPlayRef = useRef(false);
    const statusRef = useRef<SoundCloudPreviewStatus>('idle');
    const volumeRef = useRef(volume);
    const listenersRef = useRef({ onStatusChange, onPlayingChange });

    useEffect(() => {
      volumeRef.current = volume;
    }, [volume]);

    useEffect(() => {
      listenersRef.current = { onStatusChange, onPlayingChange };
    }, [onStatusChange, onPlayingChange]);

    const emit = useCallback((status: SoundCloudPreviewStatus) => {
      statusRef.current = status;
      listenersRef.current.onStatusChange?.(status);
      listenersRef.current.onPlayingChange?.(status === 'playing');
    }, []);

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!url || !iframe) return;

      let disposed = false;
      let widget: SoundCloudWidgetApi | null = null;

      emit('loading');

      loadWidgetApi()
        .then((SC) => {
          if (disposed) return;

          widget = SC.Widget(iframe);
          widgetRef.current = widget;

          try {
            widget.setVolume(volumeRef.current);
          } catch (_) {
            // Volume is cosmetic; never let it block playback.
          }

          const { Events } = SC.Widget;

          widget.bind(Events.READY, () => {
            if (disposed) return;
            emit('paused');
            if (pendingPlayRef.current) {
              pendingPlayRef.current = false;
              widget?.play();
            }
          });
          widget.bind(Events.PLAY, () => {
            if (!disposed) emit('playing');
          });
          widget.bind(Events.PAUSE, () => {
            if (!disposed) emit('paused');
          });
          widget.bind(Events.FINISH, () => {
            if (disposed) return;
            pendingPlayRef.current = false;
            emit('paused');
          });
          widget.bind(Events.ERROR, () => {
            if (disposed) return;
            pendingPlayRef.current = false;
            emit('error');
          });
        })
        .catch(() => {
          if (disposed) return;
          pendingPlayRef.current = false;
          emit('error');
        });

      return () => {
        disposed = true;
        pendingPlayRef.current = false;

        const active = widget;
        widgetRef.current = null;

        if (active) {
          try {
            const Events = window.SC?.Widget?.Events;
            if (Events) {
              active.unbind(Events.READY);
              active.unbind(Events.PLAY);
              active.unbind(Events.PAUSE);
              active.unbind(Events.FINISH);
              active.unbind(Events.ERROR);
            }
            active.pause();
          } catch (_) {
            // The iframe may already be detached; nothing left to stop.
          }
        }
      };
    }, [url, emit]);

    useImperativeHandle(
      ref,
      () => ({
        play() {
          const widget = widgetRef.current;
          if (!widget) {
            // The API script is still loading; READY will start it.
            pendingPlayRef.current = true;
            return;
          }
          try {
            widget.play();
          } catch (_) {
            pendingPlayRef.current = true;
          }
        },
        pause() {
          pendingPlayRef.current = false;
          try {
            widgetRef.current?.pause();
          } catch (_) {
            // Already torn down.
          }
        },
        isPlaying() {
          return statusRef.current === 'playing';
        },
      }),
      []
    );

    if (!url) return null;

    return (
      <iframe
        ref={iframeRef}
        title={`SoundCloud preview ${url}`}
        src={buildPlayerSrc(url)}
        allow="autoplay"
        scrolling="no"
        frameBorder="no"
        aria-hidden="true"
        tabIndex={-1}
        className="fixed bottom-0 left-0 h-px w-px border-0 opacity-0 pointer-events-none"
      />
    );
  }
);

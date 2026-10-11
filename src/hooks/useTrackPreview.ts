import { useCallback, useEffect, useRef, useState } from 'react';

export type TrackPreviewStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface TrackPreview {
  /** Attach to the <audio> element rendered by the caller. */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  status: TrackPreviewStatus;
  isPlaying: boolean;
  /** True when the product has a local file to play. */
  hasTrack: boolean;
  toggle: () => void;
  /** Wires the element's media events to the status above. */
  handlers: {
    onLoadStart: () => void;
    onPlaying: () => void;
    onPause: () => void;
    onEnded: () => void;
    onError: () => void;
  };
}

/**
 * Drives a plain <audio> element as a play/pause preview.
 *
 * Playback is always rewound and stopped when the caller unmounts the element,
 * because the button lives inside a modal: without that cleanup a track keeps
 * playing after the product is closed.
 */
export function useTrackPreview(audioFile?: string | null): TrackPreview {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<TrackPreviewStatus>('idle');
  const mountedRef = useRef(true);

  const hasTrack = Boolean(audioFile);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Switching products means switching tracks, so the previous state must not
  // survive: the button would claim to be playing audio that is already gone.
  useEffect(() => {
    setStatus('idle');
  }, [audioFile]);

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Prime the element as soon as the flavour opens so the first tap already has
  // a buffered track. iOS Safari refuses play() on an element that has never
  // started loading, which is why a plain tap used to leave mobile silent.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioFile) return;
    audio.load();
  }, [audioFile]);

  const safeSet = useCallback((next: TrackPreviewStatus) => {
    if (mountedRef.current) setStatus(next);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // Resumes in place when paused mid-track; a finished element restarts.
      const started = audio.play();
      if (started && typeof started.catch === 'function') {
        started.catch(() => {
          // A real media error keeps the error state so the caller can fall
          // back to the chord. A policy rejection (iOS blocks the first play()
          // on a fresh element) stays retryable instead of latching "error",
          // which would turn the button into a permanent silent chord.
          safeSet(audio.error ? 'error' : 'idle');
        });
      }
    } else {
      audio.pause();
    }
  }, [safeSet]);

  const handlers = {
    onLoadStart: () => safeSet('loading'),
    onPlaying: () => safeSet('playing'),
    onPause: () => safeSet('paused'),
    onEnded: () => safeSet('paused'),
    onError: () => safeSet('error'),
  };

  return { audioRef, status, isPlaying: status === 'playing', hasTrack, toggle, handlers };
}

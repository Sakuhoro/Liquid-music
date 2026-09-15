import React, { useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { CatalogView } from './components/CatalogView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { StudioAdminModal } from './components/StudioAdminModal';
import { AccountModal } from './components/AccountModal';
import { SoundCloudPlayerModal } from './components/SoundCloudPlayerModal';

export default function App() {
  const theme = useAppStore((state) => state.theme);
  const viewMode = useAppStore((state) => state.viewMode);
  const darkMusicUrl = useAppStore((state) => state.darkMusicUrl);
  const lightMusicUrl = useAppStore((state) => state.lightMusicUrl);
  const isBgMusicPlaying = useAppStore((state) => state.isBgMusicPlaying);
  const fetchProducts = useAppStore((state) => state.fetchProducts);
  const fetchAudioSettings = useAppStore((state) => state.fetchAudioSettings);
  const fetchRecipes = useAppStore((state) => state.fetchRecipes);
  const fetchFlavorPrices = useAppStore((state) => state.fetchFlavorPrices);
  const setIsStudioModalOpen = useAppStore((state) => state.setIsStudioModalOpen);

  const audioRef = useRef<HTMLAudioElement>(null);
  const isAutoplayBlockedRef = useRef(false);
  const isBgMusicPlayingRef = useRef(isBgMusicPlaying);

  useEffect(() => {
    isBgMusicPlayingRef.current = isBgMusicPlaying;
  }, [isBgMusicPlaying]);

  // Fetch initial products, audio settings, recipes, and flavor prices from backend API
  useEffect(() => {
    fetchProducts();
    fetchAudioSettings();
    fetchRecipes();
    fetchFlavorPrices();

    if (window.location.pathname.toLowerCase().includes('/admin')) {
      setIsStudioModalOpen(true);
    }
  }, [fetchProducts, fetchAudioSettings, fetchRecipes, fetchFlavorPrices, setIsStudioModalOpen]);

  // Sync document class for dark/light mode
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Autoplay Policy Handler (User Interaction Listener)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isAutoplayBlockedRef.current && audioRef.current && isBgMusicPlayingRef.current) {
        audioRef.current.play().then(() => {
          isAutoplayBlockedRef.current = false;
        }).catch(() => {});
      }
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('pointerdown', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('pointerdown', handleUserInteraction);
    };
  }, []);

  // Tab Visibility Handler (Task 3: Action 3)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return;
      if (document.hidden) {
        audioRef.current.pause();
      } else {
        if (isBgMusicPlayingRef.current) {
          audioRef.current.play().catch(() => {
            isAutoplayBlockedRef.current = true;
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Sync background ambient audio
  const currentMusicSrc = theme === 'dark' ? darkMusicUrl : lightMusicUrl;

  useEffect(() => {
    if (!audioRef.current) return;

    if (!isBgMusicPlaying) {
      audioRef.current.pause();
      return;
    }

    try {
      const targetUrl = new URL(currentMusicSrc, window.location.href).href;
      if (audioRef.current.src !== targetUrl) {
        audioRef.current.src = currentMusicSrc;
        audioRef.current.loop = true;
        audioRef.current.volume = 0.45;
      }
    } catch (_) {
      audioRef.current.src = currentMusicSrc;
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay blocked by browser policy, waiting for user interaction:', err);
        isAutoplayBlockedRef.current = true;
      });
    }
  }, [isBgMusicPlaying, currentMusicSrc]);

  return (
    <main
      id="liquid-music-experience"
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden transition-colors duration-700"
    >
      {/* Background Ambient Audio Player */}
      <audio ref={audioRef} preload="none" />

      {/* 1. Full-Screen Looping Video Background Engine (Strictly Clean Video) */}
      <BackgroundVideo />

      {/* 2. Top Navigation Bar (Plain text logo, no trademark, no yellow dot) */}
      <Navigation />

      {/* 3. Main View Stage: Hero Minimalist OR Musical Catalog Overlay */}
      {viewMode === 'hero' ? <HeroSection /> : <CatalogView />}

      {/* Note: Footer has been completely deleted per user specification */}

      {/* 4. Modals & Drawers */}
      <ProductDetailModal />
      <AuthModal />
      <CartDrawer />
      <OrderSuccessModal />
      <StudioAdminModal />
      <AccountModal />
      <SoundCloudPlayerModal />
    </main>
  );
}

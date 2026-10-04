import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ThemeToggle } from './ThemeToggle';
import {
  ShoppingBag,
  User,
  Sliders,
  Music,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const viewMode = useAppStore((state) => state.viewMode);
  const setViewMode = useAppStore((state) => state.setViewMode);
  const setActiveCollection = useAppStore((state) => state.setActiveCollection);
  const cartCount = useAppStore((state) => state.getCartItemCount());
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const currentUser = useAppStore((state) => state.currentUser);
  const isAdminLoggedIn = useAppStore((state) => state.isAdminLoggedIn);
  const setIsAccountModalOpen = useAppStore((state) => state.setIsAccountModalOpen);
  const setIsStudioModalOpen = useAppStore((state) => state.setIsStudioModalOpen);
  const openAuthModal = useAppStore((state) => state.openAuthModal);
  const isBgMusicPlaying = useAppStore((state) => state.isBgMusicPlaying);
  const toggleBgMusic = useAppStore((state) => state.toggleBgMusic);

  const activeCollection = useAppStore((state) => state.activeCollection);
  const isPainGirl = activeCollection === 'Pain Girl';
  const isDark = theme === 'dark';

  const handleAccountClick = () => {
    if (currentUser) {
      setIsAccountModalOpen(true);
    } else {
      openAuthModal('account');
    }
  };

  const isAdmin = isAdminLoggedIn || currentUser?.role === 'ADMIN';

  return (
    <header
      id="main-app-nav"
      className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-8 py-3 sm:py-4 min-h-[72px] sm:min-h-[80px] max-w-7xl mx-auto w-full"
    >
      <div className="flex items-center justify-between w-full md:w-auto">
        {/* Brand Logo: Plain text "Liquid Music" */}
        <button
          id="nav-logo-btn"
          onClick={() => setViewMode('hero')}
          className="group focus:outline-none text-left cursor-pointer min-h-[44px] flex items-center"
        >
          <span className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight transition-opacity duration-300 hover:opacity-85 whitespace-nowrap">
            Liquid Music
          </span>
        </button>

        {/* Mobile quick controls: Background Music, Theme Toggle & Cart */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Background Ambient Music Toggle (Mobile) */}
          <button
            id="bg-music-toggle-btn-mobile"
            onClick={toggleBgMusic}
            aria-label={isBgMusicPlaying ? 'Mute Background Melody' : 'Play Background Melody'}
            title={isBgMusicPlaying ? 'Mute Background Melody' : 'Play Background Melody'}
            className="liquid-glass w-9 h-9 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 text-stone-200"
          >
            {isBgMusicPlaying ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 opacity-60" />
            )}
          </button>

          {/* Theme Toggle (Light / Dark) Mobile - hidden in Pain Girl collection */}
          {!isPainGirl && <ThemeToggle id="theme-mode-toggle-mobile" />}

          <button
            id="open-cart-btn-mobile"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
            className="liquid-glass min-w-[44px] min-h-[44px] px-3.5 py-1.5 rounded-full flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 opacity-80" />
            <span className="text-xs font-semibold font-mono">{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Center Links: Admin Cabinet, Collections, Account - Horizontal Scroll for Mobile */}
      <nav className="flex items-center gap-3 sm:gap-6 md:gap-8 text-xs sm:text-sm font-medium overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none touch-pan-x">
        {/* Only visible when authenticated as ADMIN */}
        {isAdmin && (
          <button
            id="nav-link-studio"
            onClick={() => {
              try {
                window.history.pushState({}, '', '/Liquidmusic/admin');
              } catch (_) {}
              setIsStudioModalOpen(true);
            }}
            className={`shrink-0 min-h-[44px] px-2 hover:opacity-100 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-amber-400 ${
              isDark ? 'hover:text-amber-300' : 'hover:text-amber-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Кабинет администратора</span>
          </button>
        )}

        <button
          id="nav-link-collections"
          // Goes back to the collection overview, not just to the catalogue
          // view: a gallery tab has no back control of its own, so without the
          // reset this link would land you straight back on it.
          onClick={() => {
            setActiveCollection('All');
            setViewMode('catalog');
          }}
          className={`shrink-0 min-h-[44px] px-2 hover:opacity-100 transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'catalog'
              ? 'font-bold border-b-2 border-amber-400 pb-0.5'
              : 'opacity-80'
          } ${isDark ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-stone-950'}`}
        >
          <Music className="w-4 h-4 opacity-70 shrink-0" />
          <span className="whitespace-nowrap">Коллекции</span>
        </button>

        <button
          id="nav-link-account"
          onClick={handleAccountClick}
          className={`shrink-0 min-h-[44px] px-2 hover:opacity-100 transition-all flex items-center gap-1.5 cursor-pointer ${
            isDark ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <User className="w-4 h-4 opacity-70 shrink-0" />
          <span className="whitespace-nowrap">
            {currentUser ? currentUser.telegram : 'Вход на студию'}
          </span>
          {currentUser && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          )}
        </button>
      </nav>

      {/* Right Controls: Audio toggles, Theme Toggle & Cart (Desktop) */}
      <div className="hidden md:flex items-center gap-2.5 sm:gap-3">
        {/* Background Ambient Music Toggle */}
        <button
          id="bg-music-toggle-btn"
          onClick={toggleBgMusic}
          title={isBgMusicPlaying ? 'Mute Background Melody' : 'Play Background Melody'}
          className="liquid-glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 text-stone-200"
        >
          {isBgMusicPlaying ? (
            <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 opacity-60" />
          )}
        </button>

        {/* Theme Toggle (Light / Dark) - hidden in Pain Girl collection */}
        {!isPainGirl && <ThemeToggle id="theme-mode-toggle" />}

        {/* Cart Drawer Trigger */}
        <button
          id="open-cart-btn"
          onClick={() => setIsCartOpen(true)}
          className="liquid-glass px-3.5 py-1.5 rounded-full flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingBag className="w-3.5 h-3.5 opacity-80" />
          <span className="text-xs font-semibold font-mono">
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Sun,
  Moon,
  ShoppingBag,
  User,
  Sliders,
  Music,
  Radio,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const viewMode = useAppStore((state) => state.viewMode);
  const setViewMode = useAppStore((state) => state.setViewMode);
  const cartCount = useAppStore((state) => state.getCartItemCount());
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const currentUser = useAppStore((state) => state.currentUser);
  const isAdminLoggedIn = useAppStore((state) => state.isAdminLoggedIn);
  const setIsAccountModalOpen = useAppStore((state) => state.setIsAccountModalOpen);
  const setIsStudioModalOpen = useAppStore((state) => state.setIsStudioModalOpen);
  const openAuthModal = useAppStore((state) => state.openAuthModal);
  const isBgMusicPlaying = useAppStore((state) => state.isBgMusicPlaying);
  const toggleBgMusic = useAppStore((state) => state.toggleBgMusic);
  const setIsSoundCloudOpen = useAppStore((state) => state.setIsSoundCloudOpen);

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
      className="relative z-10 flex flex-row items-center justify-between px-6 sm:px-8 py-6 max-w-7xl mx-auto w-full"
    >
      {/* Brand Logo: Plain text "Liquid Music" */}
      <button
        id="nav-logo-btn"
        onClick={() => setViewMode('hero')}
        className="group focus:outline-none text-left cursor-pointer"
      >
        <span className="font-serif text-3xl md:text-4xl font-normal tracking-tight transition-opacity duration-300 hover:opacity-85">
          Liquid Music
        </span>
      </button>

      {/* Center Links: Admin Cabinet (Visible ONLY for ADMIN), Collections, Account */}
      <nav className="flex items-center gap-6 md:gap-10 text-sm font-medium">
        {/* Only visible when authenticated as ADMIN */}
        {isAdmin && (
          <button
            id="nav-link-studio"
            onClick={() => setIsStudioModalOpen(true)}
            className={`hover:opacity-100 transition-all flex items-center gap-1.5 cursor-pointer font-bold text-amber-400 ${
              isDark ? 'hover:text-amber-300' : 'hover:text-amber-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Кабинет администратора</span>
          </button>
        )}

        <button
          id="nav-link-collections"
          onClick={() => setViewMode('catalog')}
          className={`hover:opacity-100 transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'catalog'
              ? 'font-bold border-b-2 border-amber-400 pb-0.5'
              : 'opacity-80'
          } ${isDark ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-stone-950'}`}
        >
          <Music className="w-3.5 h-3.5 opacity-70" />
          <span>Collections</span>
        </button>

        <button
          id="nav-link-account"
          onClick={handleAccountClick}
          className={`hover:opacity-100 transition-all flex items-center gap-1.5 cursor-pointer ${
            isDark ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-stone-950'
          }`}
        >
          <User className="w-3.5 h-3.5 opacity-70" />
          <span>
            {currentUser ? currentUser.telegram : 'Вход на студию звукозаписи'}
          </span>
          {currentUser && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>
      </nav>

      {/* Right Controls: Audio toggles, Theme Toggle & Cart */}
      <div className="flex items-center gap-2.5 sm:gap-3">
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

        {/* SoundCloud Player Integration Button */}
        <button
          id="soundcloud-player-btn"
          onClick={() => setIsSoundCloudOpen(true)}
          title="Open SoundCloud Musical Player"
          className="liquid-glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 text-stone-200"
        >
          <Radio className="w-3.5 h-3.5 text-orange-400" />
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          id="theme-mode-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Airy Daylight' : 'Switch to Musical Night'}
          className="liquid-glass w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 text-stone-200"
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-sky-800" />
          )}
        </button>

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

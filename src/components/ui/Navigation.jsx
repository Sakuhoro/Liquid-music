import React from 'react';
import { useProductStore } from '../../store/useProductStore';
import {
  Sun,
  Moon,
  ShoppingCart,
  Music,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';

export function Navigation() {
  const theme = useProductStore((s) => s.theme);
  const toggleTheme = useProductStore((s) => s.toggleTheme);
  const cartCount = useProductStore((s) => s.getCartCount());
  const toggleCart = useProductStore((s) => s.toggleCart);

  const currentSeason = useProductStore((s) => s.getCurrentSeason());
  const setSeasonOverride = useProductStore((s) => s.setSeasonOverride);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-4 md:p-6 pointer-events-none flex items-center justify-between">
      {/* Brand Logo & Title */}
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/80 text-white border border-white/20 backdrop-blur-xl shadow-2xl">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-400 to-pink-500 text-slate-950 font-bold">
          <Music className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-pink-200 to-indigo-200 bg-clip-text text-transparent">
            LIQUID MUSIC
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
            3D Spatial Audio & Vape Sanctuary
          </p>
        </div>
      </div>

      {/* Top Right Controls & Dynamic Theme/Season Switcher */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Season Selector Override */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-white/20 backdrop-blur-xl text-xs">
          <Calendar className="w-4 h-4 ml-2 text-amber-400" />
          {['spring', 'summer', 'autumn'].map((s) => (
            <button
              key={s}
              onClick={() => setSeasonOverride(s)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                currentSeason === s
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Dynamic Light/Dark Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-slate-900/80 text-white border border-white/20 backdrop-blur-xl shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-indigo-300" />
          ) : (
            <Sun className="w-5 h-5 text-amber-400" />
          )}
        </button>

        {/* Cart Drawer Trigger */}
        <button
          onClick={toggleCart}
          className="relative p-3 rounded-2xl bg-slate-900/80 text-white border border-white/20 backdrop-blur-xl shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5 text-amber-300" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white text-[11px] font-black flex items-center justify-center animate-bounce border border-slate-900">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

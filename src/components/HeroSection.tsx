import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const setViewMode = useAppStore((state) => state.setViewMode);
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <section
      id="hero-minimalist-section"
      className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 max-w-5xl mx-auto my-auto"
    >
      {/* H1: "Where melodies shape the vapor." (Instrument Serif, 7xl/8xl, staggered fade-rise) */}
      <h1
        className={`font-serif text-5xl sm:text-7xl lg:text-8xl font-normal leading-[1.05] tracking-tight max-w-4xl mx-auto animate-fade-rise opacity-0 delay-100 ${
          isDark ? 'text-stone-50' : 'text-stone-900'
        }`}
      >
        Where melodies shape the vapor.
      </h1>

      {/* Subtext: "Premium vape liquids crafted like symphonies." */}
      <p
        className={`mt-6 text-lg sm:text-xl md:text-2xl font-normal tracking-wide max-w-2xl mx-auto animate-fade-rise opacity-0 delay-200 ${
          isDark ? 'text-[hsl(240,4%,66%)]' : 'text-stone-700 font-medium'
        }`}
      >
        Premium vape liquids crafted like symphonies.
      </p>

      {/* CTA Button: "Begin Journey" with .liquid-glass */}
      <div className="mt-10 animate-fade-rise opacity-0 delay-300">
        <button
          id="begin-journey-btn"
          onClick={() => setViewMode('catalog')}
          className="liquid-glass group px-8 py-4 rounded-full text-base font-medium flex items-center gap-3 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl text-stone-100"
        >
          <span className="tracking-wide">Begin Journey</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 opacity-80" />
        </button>
      </div>
    </section>
  );
};

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ArrowRight, Disc } from 'lucide-react';
import Carousel from './ui/Carousel.jsx';

export const HeroSection: React.FC = () => {
  const setViewMode = useAppStore((state) => state.setViewMode);
  const products = useAppStore((state) => state.products);
  const setInspectedProduct = useAppStore((state) => state.setInspectedProduct);
  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

  return (
    <section
      id="hero-minimalist-section"
      className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 max-w-5xl mx-auto my-auto py-8"
    >
      {/* H1: Main Headline */}
      <h1
        className={`font-serif text-4xl sm:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight max-w-4xl mx-auto animate-fade-rise opacity-0 delay-100 ${
          isDark ? 'text-stone-50' : 'text-stone-900'
        }`}
      >
        Место, где мелодии превращаются во что-то большее
      </h1>

      {/* Subtext: Subheading */}
      <p
        className={`mt-6 text-lg sm:text-xl md:text-2xl font-normal tracking-wide max-w-2xl mx-auto animate-fade-rise opacity-0 delay-200 ${
          isDark ? 'text-[hsl(240,4%,66%)]' : 'text-stone-700 font-medium'
        }`}
      >
        Здесь ноты обретают другое состояние
      </p>

      {/* Vinyl Products Navigation Carousel */}
      <div className="mt-8 mb-6 animate-fade-rise opacity-0 delay-300 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-amber-400">
          <Disc className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Виниловая коллекция товаров</span>
        </div>
        <Carousel
          items={products}
          baseWidth={320}
          round={true}
          loop={true}
          autoplay={true}
          autoplayDelay={3500}
          pauseOnHover={true}
          onItemClick={(product: any) => setInspectedProduct(product)}
        />
      </div>

      {/* CTA Button: "Начать путешествие" with .liquid-glass */}
      <div className="animate-fade-rise opacity-0 delay-300">
        <button
          id="begin-journey-btn"
          onClick={() => setViewMode('catalog')}
          className="liquid-glass group px-8 py-4 rounded-full text-base sm:text-lg font-medium flex items-center gap-3 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl text-stone-100"
        >
          <span className="tracking-wide">Начать путешествие</span>
          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 opacity-80" />
        </button>
      </div>
    </section>
  );
};

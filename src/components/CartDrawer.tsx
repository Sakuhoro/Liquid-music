import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatRatio, NicotineType, VolumeType, RatioType, RATIO_OPTIONS } from '../types';
import Shredder from './ui/Shredder';
import './CartDrawer.css';
import { NICOTINE_PRICING, VOLUME_PRICING } from '../data/products';
import {
  X,
  Plus,
  Minus,
  Disc3,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

// Ticks the number up to its new value instead of snapping, so a change in
// the cart or a loyalty discount landing reads as a consequence. Falls back
// to the final value immediately when motion is not wanted.
function useCountUp(value: number) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number | null>(null);
  const from = useRef(value);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || from.current === value) {
      from.current = value;
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const delta = value - from.current;
    const duration = 420;

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic, so it decelerates into the total rather than stopping dead
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from.current + delta * eased));
      if (t < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        from.current = value;
      }
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      from.current = value;
    };
  }, [value]);

  return display;
}

const formatRub = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value);

// The loyalty tier reaches the cart as a discount percentage; map it back to the
// same tier names the account card uses so the two never disagree.
const LOYALTY_TIER_LABEL: Record<number, string> = {
  5: 'Периодический слушатель',
  10: 'Постоянный слушатель',
};

export const CartDrawer: React.FC = () => {
  const isCartOpen = useAppStore((state) => state.isCartOpen);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const cart = useAppStore((state) => state.cart);
  const updateCartQuantity = useAppStore((state) => state.updateCartQuantity);
  const updateCartOptions = useAppStore((state) => state.updateCartOptions);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const getCartSubtotal = useAppStore((state) => state.getCartSubtotal);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const loyalty = useAppStore((state) => state.loyalty);
  const isPlacingOrder = useAppStore((state) => state.isPlacingOrder);
  const theme = useAppStore((state) => state.theme);

  const [error, setError] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const subtotal = getCartSubtotal();
  const discountPct = loyalty?.discountPct ?? 0;
  const discountAmount = Math.round(subtotal * (discountPct / 100));
  const total = subtotal - discountAmount;
  const animatedTotal = useCountUp(total);

  // Clear a stale failure when the drawer is opened again.
  useEffect(() => {
    if (isCartOpen) setError(null);
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = async () => {
    setError(null);
    const result = await placeOrder();
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsCartOpen(false);
    }
  };

  const surface = isDark ? 'var(--hall-surface)' : 'var(--hall-surface)';


  return (
    <div
      id="cart-drawer-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm cursor-default"
    >
      <div
        id="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Корзина"
        style={{
          background: surface,
          borderColor: 'var(--hall-border)',
          color: 'var(--hall-text)',
          boxShadow: 'var(--hall-shadow)',
        }}
        className="hall-cart-panel w-full max-w-2xl h-full flex flex-col border-l backdrop-blur-2xl hall-drawer-in"
      >
        {/* Header */}
        <div className="hall-cart-head relative p-6 border-b overflow-hidden" style={{ borderColor: 'var(--hall-border)' }}>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center hall-focusable"
                style={{
                  background: 'var(--hall-varnish-soft)',
                  border: '1px solid var(--hall-border-strong)',
                  color: 'var(--hall-varnish)',
                }}
              >
                <Disc3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif hall-text-xl font-normal leading-tight tracking-tight">
                  Ваш плейлист
                </h3>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="Закрыть корзину"
              className="hall-focusable w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ background: 'var(--hall-border)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="hall-cart-rows flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <Disc3 className="w-12 h-12 mx-auto" style={{ color: 'var(--hall-text-faint)' }} />
              <p className="hall-text-base font-medium" style={{ color: 'var(--hall-text-muted)' }}>
                Ваш плейлист пока пуст
              </p>
              <p className="hall-text-sm max-w-[22rem] mx-auto" style={{ color: 'var(--hall-text-faint)' }}>
                Добавьте в него новые композиции и соберите свою идеальную музыкальную подборку.
              </p>
            </div>
          ) : (
            // Rows ride on a sheet: drag one sideways (or, with a mouse, down
            // through the sheet) to take it out of the cart. The shredder calls
            // back into the store only once the tear has finished, and the trash
            // button below is still there for anyone who would rather not throw.
            <Shredder
              className="hall-playlist"
              items={cart}
              tone={isDark ? 'dark' : 'light'}
              getKey={(item) => item.id}
              onShred={(item) => removeFromCart(item.id)}
              renderItem={(item, index) => (
                <article
                  className="playlist-line hall-list-in"
                  aria-label={item.product.name}
                  style={{ animationDelay: `${Math.min(index, 6) * 35}ms` }}
                >
                  <div className="playlist-line__art">
                    <img src={item.product.image} alt="" />
                  </div>
                  <h4 className="playlist-line__title">{item.product.name}</h4>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Убрать ${item.product.name}`}
                    className="playlist-line__remove"
                  >
                    <X size={16} strokeWidth={1.5} />
                  </button>

                  <p className="playlist-line__description">{item.product.description}</p>
                  <div className="playlist-line__details">
                    {item.setUnitPrice !== undefined ? (
                      <span>Сет · {item.volume.replace('ml', ' мл')}</span>
                    ) : (
                      <label className="playlist-line__strength playlist-line__volume">
                        <span className="sr-only">Объём флакона: {item.product.name}</span>
                        <select aria-label={`Объём флакона: ${item.product.name}`} value={item.volume}
                          onChange={(event) => updateCartOptions(item.id, { volume: event.target.value as VolumeType })}>
                          {(Object.keys(VOLUME_PRICING) as VolumeType[]).map(volume => <option key={volume} value={volume}>{volume.replace('ml', ' мл')}</option>)}
                        </select>
                        <ChevronDown size={12} aria-hidden="true" />
                      </label>
                    )}
                    <span aria-hidden="true" className="playlist-line__dot">·</span>
                    <label className="playlist-line__strength">
                      <span className="sr-only">Крепость: {item.product.name}</span>
                      <select
                        aria-label={`Крепость: ${item.product.name}`}
                        value={item.nicotine}
                        onChange={(event) => updateCartOptions(item.id, { nicotine: event.target.value as NicotineType })}
                      >
                        {(Object.keys(NICOTINE_PRICING) as NicotineType[])
                          .filter(nicotine => item.setUnitPrice === undefined || item.product.setPricing?.[nicotine] !== undefined)
                          .map(nicotine => <option key={nicotine} value={nicotine}>{nicotine.replace('mg', ' мг')}</option>)}
                      </select>
                      <ChevronDown size={12} aria-hidden="true" />
                    </label>
                    <span aria-hidden="true" className="playlist-line__dot">·</span>
                    <label className="playlist-line__strength playlist-line__ratio">
                      <span className="sr-only">Соотношение: {item.product.name}</span>
                      <select aria-label={`Соотношение: ${item.product.name}`} value={item.ratio}
                        onChange={(event) => updateCartOptions(item.id, { ratio: event.target.value as RatioType })}>
                        {RATIO_OPTIONS.map(ratio => <option key={ratio} value={ratio}>{formatRatio(ratio)}</option>)}
                      </select>
                      <ChevronDown size={12} aria-hidden="true" />
                    </label>
                  </div>

                  <div className="playlist-line__bottom">
                    <div className="playlist-line__quantity" role="group" aria-label={`Количество: ${item.product.name}`}>
                      <button type="button" onClick={() => updateCartQuantity(item.id, -1)} aria-label={`Уменьшить количество: ${item.product.name}`}>
                        <Minus size={13} strokeWidth={1.6} />
                      </button>
                      <span aria-live="polite" aria-atomic="true">{item.quantity}</span>
                      <button type="button" onClick={() => updateCartQuantity(item.id, 1)} aria-label={`Увеличить количество: ${item.product.name}`}>
                        <Plus size={13} strokeWidth={1.6} />
                      </button>
                    </div>
                    <span className="playlist-line__price" aria-label={`Стоимость ${item.product.name}: ${formatRub(item.totalUnitPrice * item.quantity)} рублей`}>
                      {formatRub(item.totalUnitPrice * item.quantity)} <span>₽</span>
                    </span>
                  </div>
                </article>
              )}
            />
          )}
        </div>

        {/* Footer: the total is the one place the discount is spelled out */}
        {cart.length > 0 && (
          <div
            className="hall-cart-footer p-3 sm:p-6 space-y-2.5 sm:space-y-4"
            style={{ borderTop: '1px solid var(--hall-border)' }}
          >
            <div className="space-y-1.5 hall-text-base font-sans font-medium">
              <div className="flex items-baseline justify-between" style={{ color: 'var(--hall-text-muted)' }}>
                <span>Стоимость</span>
                <span className="tabular-nums">{formatRub(subtotal)} ₽</span>
              </div>

              {discountPct > 0 && (
                <div
                  className="flex items-baseline justify-between hall-list-in"
                  style={{ color: 'var(--hall-loyalty)' }}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {LOYALTY_TIER_LABEL[discountPct] ?? 'Слушатель'} · {discountPct}%
                  </span>
                  <span className="tabular-nums">−{formatRub(discountAmount)} ₽</span>
                </div>
              )}

              <div
                className="flex items-baseline justify-between pt-2 mt-1"
                style={{ borderTop: '1px solid var(--hall-border)' }}
              >
                <span className="hall-text-sm uppercase tracking-wider font-semibold" style={{ color: 'var(--hall-text-muted)' }}>
                  К оплате
                </span>
                <span className="font-sans tabular-nums hall-text-3xl font-extrabold" style={{ color: 'var(--hall-varnish)' }}>
                  {formatRub(animatedTotal)} ₽
                </span>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2 hall-text-sm font-mono p-3 rounded-xl hall-list-in"
                style={{ background: 'oklch(0.577 0.245 27.325 / 12%)', color: 'oklch(0.7 0.19 22)' }}
                role="alert"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="place-order-checkout-btn"
              onClick={handleCheckoutClick}
              disabled={isPlacingOrder}
              className="hall-focusable hall-sheen w-full py-2.5 sm:py-4 rounded-2xl font-semibold hall-text-base flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-[1.015] active:scale-[0.985] disabled:cursor-wait disabled:hover:scale-100 disabled:opacity-90"
              style={{
                background: 'var(--hall-varnish)',
                color: 'oklch(0.19 0.032 250)',
                boxShadow: '0 12px 32px -10px var(--hall-varnish)',
              }}
            >
              <span className={isPlacingOrder ? 'hall-pending' : undefined}>
                {isPlacingOrder ? 'Записываем партитуру…' : 'Оформить плейлист'}
              </span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

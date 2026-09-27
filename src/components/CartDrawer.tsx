import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Disc3,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
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

export const CartDrawer: React.FC = () => {
  const isCartOpen = useAppStore((state) => state.isCartOpen);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const cart = useAppStore((state) => state.cart);
  const updateCartQuantity = useAppStore((state) => state.updateCartQuantity);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const getCartSubtotal = useAppStore((state) => state.getCartSubtotal);
  const currentUser = useAppStore((state) => state.currentUser);
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

  const itemCount = cart.reduce((a, b) => a + b.quantity, 0);

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
  const raised = isDark ? 'var(--hall-surface-raised)' : 'var(--hall-surface-raised)';

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
        className="w-full max-w-md h-full flex flex-col border-l backdrop-blur-2xl hall-drawer-in"
      >
        {/* Header: a record turning behind the title */}
        <div className="relative p-6 border-b overflow-hidden" style={{ borderColor: 'var(--hall-border)' }}>
          <div className="hall-vinyl hall-vinyl-slow" aria-hidden="true" />
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
                <h3 className="font-serif text-xl font-normal leading-tight tracking-tight">
                  Концертный зал
                </h3>
                <p className="text-[11px] font-mono" style={{ color: 'var(--hall-text-faint)' }}>
                  {itemCount > 0 ? `${itemCount} на весах` : 'Тишина перед началом'}
                </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <Disc3 className="w-12 h-12 mx-auto" style={{ color: 'var(--hall-text-faint)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--hall-text-muted)' }}>
                Зал пуст
              </p>
              <p className="text-xs max-w-[16rem] mx-auto" style={{ color: 'var(--hall-text-faint)' }}>
                Соберите свою партитуру из вкусов наших опусов.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={item.id}
                className="hall-list-in p-4 rounded-2xl border flex gap-3.5"
                style={{
                  background: raised,
                  borderColor: 'var(--hall-border)',
                  // Stagger is capped at six rows so a full satchel does not
                  // crawl in.
                  animationDelay: `${Math.min(index, 6) * 45}ms`,
                }}
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  style={{ border: '1px solid var(--hall-border)' }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-serif text-base font-semibold leading-snug truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Убрать ${item.product.name}`}
                      className="hall-focusable p-1 transition-colors cursor-pointer"
                      style={{ color: 'var(--hall-text-faint)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono" style={{ color: 'var(--hall-varnish)' }}>
                    <span className="px-1.5 py-0.5 rounded-md" style={{ background: 'var(--hall-varnish-soft)' }}>
                      {item.volume} · {item.volumePrice}₽
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md" style={{ background: 'var(--hall-varnish-soft)' }}>
                      {item.nicotine} · +{item.nicotinePrice}₽
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div
                      className="flex items-center gap-1 rounded-lg p-1 hall-focusable"
                      style={{ background: 'var(--hall-border)' }}
                    >
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        aria-label="Уменьшить количество"
                        className="w-5 h-5 rounded flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                        style={{ background: 'var(--hall-surface)' }}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-mono font-bold w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        aria-label="Увеличить количество"
                        className="w-5 h-5 rounded flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                        style={{ background: 'var(--hall-surface)' }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span
                        className="font-serif text-base font-bold"
                        style={{ color: 'var(--hall-varnish)' }}
                      >
                        {formatRub(item.totalUnitPrice * item.quantity)} ₽
                      </span>
                      {item.quantity > 1 && (
                        <div className="text-[10px] font-mono" style={{ color: 'var(--hall-text-faint)' }}>
                          {formatRub(item.totalUnitPrice)} ₽ / шт
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: the total is the one place the discount is spelled out */}
        {cart.length > 0 && (
          <div className="p-6 space-y-4" style={{ borderTop: '1px solid var(--hall-border)' }}>
            <div className="flex items-center justify-between text-xs font-mono">
              <span style={{ color: 'var(--hall-text-muted)' }}>Исполнитель</span>
              {currentUser ? (
                <span className="flex items-center gap-1.5" style={{ color: 'var(--tier-gold)' }}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentUser.telegram}
                </span>
              ) : (
                <span style={{ color: 'var(--hall-varnish)' }}>
                  Нужен вход в аккаунт
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-sm font-mono">
              <div className="flex items-baseline justify-between" style={{ color: 'var(--hall-text-muted)' }}>
                <span>Стоимость</span>
                <span>{formatRub(subtotal)} ₽</span>
              </div>

              {discountPct > 0 && (
                <div
                  className="flex items-baseline justify-between hall-list-in"
                  style={{ color: 'var(--tier-gold)' }}
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Постоянный слушатель · {discountPct}%
                  </span>
                  <span>−{formatRub(discountAmount)} ₽</span>
                </div>
              )}

              <div
                className="flex items-baseline justify-between pt-2 mt-1"
                style={{ borderTop: '1px solid var(--hall-border)' }}
              >
                <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--hall-text-muted)' }}>
                  К оплате
                </span>
                <span className="font-serif text-3xl font-bold" style={{ color: 'var(--hall-varnish)' }}>
                  {formatRub(animatedTotal)} ₽
                </span>
              </div>
            </div>

            {error && (
              <div
                className="flex items-start gap-2 text-xs font-mono p-3 rounded-xl hall-list-in"
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
              className="hall-focusable hall-sheen w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-[1.015] active:scale-[0.985] disabled:cursor-wait disabled:hover:scale-100 disabled:opacity-90"
              style={{
                background: 'var(--hall-varnish)',
                color: 'oklch(0.19 0.032 250)',
                boxShadow: '0 12px 32px -10px var(--hall-varnish)',
              }}
            >
              <span className={isPlacingOrder ? 'hall-pending' : undefined}>
                {isPlacingOrder ? 'Записываем партитуру…' : 'Оформить заказ'}
              </span>
              <ArrowRight className="w-4 h-4 opacity-80" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

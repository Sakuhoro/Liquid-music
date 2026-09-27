import React from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  CheckCircle2,
  Send,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';

const formatRub = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value);

export const OrderSuccessModal: React.FC = () => {
  const isSuccessModalOpen = useAppStore((state) => state.isSuccessModalOpen);
  const setIsSuccessModalOpen = useAppStore((state) => state.setIsSuccessModalOpen);
  const lastPlacedOrder = useAppStore((state) => state.lastPlacedOrder);

  if (!isSuccessModalOpen || !lastPlacedOrder) return null;

  return (
    <div
      id="order-success-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSuccessModalOpen(false);
      }}
    >
      {/* hall-type-scale-2 lifts every hall-text-* size inside this card to
          twice the base, and the card is widened to match so the receipt
          lines keep a readable measure instead of wrapping into ribbons. */}
      <div
        id="order-success-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Заказ успешно оформлен"
        className="hall-settle hall-type-scale-2 relative w-full max-w-4xl rounded-3xl overflow-hidden border p-6 sm:p-8 backdrop-blur-2xl"
        style={{
          background: 'var(--hall-surface)',
          borderColor: 'var(--hall-border)',
          color: 'var(--hall-text)',
          boxShadow: 'var(--hall-shadow)',
        }}
      >
        <button
          onClick={() => setIsSuccessModalOpen(false)}
          aria-label="Закрыть"
          className="hall-focusable absolute top-6 right-6 w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
          style={{ background: 'var(--hall-border)' }}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
            style={{
              background: 'oklch(0.696 0.17 162 / 16%)',
              border: '1px solid oklch(0.696 0.17 162 / 32%)',
              color: 'oklch(0.79 0.17 162)',
            }}
          >
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full hall-text-sm font-mono mb-3"
            style={{
              background: 'var(--hall-varnish-soft)',
              color: 'var(--hall-varnish)',
              border: '1px solid var(--hall-border-strong)',
            }}
          >
            <Sparkles className="w-6 h-6" />
            <span>Заказ {lastPlacedOrder.orderId}</span>
          </div>

          <h2 className="font-serif hall-text-3xl font-normal tracking-tight text-center max-w-3xl mx-auto leading-snug">
            Ваш заказ успешно оформлен. Наш администратор{' '}
            <span className="font-semibold underline underline-offset-8" style={{ color: 'var(--hall-varnish)' }}>
              @White_blooming
            </span>{' '}
            свяжется с вами в Telegram для подтверждения и оплаты.
          </h2>
        </div>

        {/* Receipt */}
        <div
          className="p-6 rounded-2xl space-y-4 mb-6"
          style={{
            background: 'var(--hall-surface-raised)',
            border: '1px solid var(--hall-border)',
          }}
        >
          {[
            { label: 'Получатель', value: lastPlacedOrder.user.name, tone: undefined as string | undefined },
            { label: 'Телефон', value: lastPlacedOrder.user.phone, tone: undefined },
            { label: 'Telegram аккаунт', value: lastPlacedOrder.user.telegram, tone: 'var(--hall-varnish)' },
          ].map(({ label, value, tone }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 hall-text-sm font-mono pb-3"
              style={{ borderBottom: '1px solid var(--hall-border)' }}
            >
              <span style={{ color: 'var(--hall-text-muted)' }}>{label}:</span>
              <span className="font-bold truncate" style={{ color: tone }}>{value}</span>
            </div>
          ))}

          <div className="pt-1">
            <span
              className="block hall-text-2xs font-mono uppercase mb-3"
              style={{ color: 'var(--hall-text-faint)' }}
            >
              Состав заказанной партитуры:
            </span>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lastPlacedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 justify-between hall-text-sm font-mono hall-list-in"
                  style={{ animationDelay: `${Math.min(idx, 6) * 45}ms` }}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      style={{ border: '1px solid var(--hall-border)' }}
                    />
                    <span className="truncate">
                      {item.quantity}× {item.product.name}
                      <span style={{ color: 'var(--hall-text-faint)' }}>
                        {' '}
                        ({item.volume}, {item.nicotine})
                      </span>
                    </span>
                  </span>
                  <span className="font-bold shrink-0" style={{ color: 'var(--hall-varnish)' }}>
                    {formatRub(item.totalUnitPrice * item.quantity)} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>

          {lastPlacedOrder.discountAmount ? (
            <div
              className="flex items-center justify-between gap-4 hall-text-sm font-mono pt-4"
              style={{ borderTop: '1px solid var(--hall-border)', color: 'var(--tier-gold)' }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Скидка постоянного слушателя {lastPlacedOrder.discountPct}%
              </span>
              <span className="font-bold">−{formatRub(lastPlacedOrder.discountAmount)} ₽</span>
            </div>
          ) : null}

          <div
            className="pt-4 flex items-center justify-between gap-4 font-serif hall-text-2xl font-bold"
            style={{ borderTop: '1px solid var(--hall-border)' }}
          >
            <span>Итоговая сумма:</span>
            <span className="hall-text-3xl" style={{ color: 'var(--hall-varnish)' }}>
              {formatRub(lastPlacedOrder.subtotal)} ₽
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://t.me/White_blooming"
            target="_blank"
            rel="noopener noreferrer"
            className="hall-focusable hall-sheen w-full sm:flex-1 py-4 rounded-2xl font-semibold hall-text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 hover:scale-[1.015] active:scale-[0.985]"
            style={{
              background: 'var(--hall-varnish)',
              color: 'oklch(0.19 0.032 250)',
            }}
          >
            <Send className="w-7 h-7" />
            <span>Написать администратору в Telegram</span>
            <ExternalLink className="w-5 h-5 opacity-70" />
          </a>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="hall-focusable w-full sm:w-auto px-8 py-4 rounded-2xl hall-text-sm font-mono transition-colors cursor-pointer"
            style={{ border: '1px solid var(--hall-border-strong)' }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  CheckCircle2,
  Send,
  Sparkles,
  X,
  Music,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const isSuccessModalOpen = useAppStore((state) => state.isSuccessModalOpen);
  const setIsSuccessModalOpen = useAppStore((state) => state.setIsSuccessModalOpen);
  const lastPlacedOrder = useAppStore((state) => state.lastPlacedOrder);
  const theme = useAppStore((state) => state.theme);

  if (!isSuccessModalOpen || !lastPlacedOrder) return null;

  const isDark = theme === 'dark';

  return (
    <div
      id="order-success-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-rise"
    >
      <div
        id="order-success-modal-card"
        className={`relative w-full max-w-xl rounded-3xl overflow-hidden border shadow-2xl p-6 sm:p-8 backdrop-blur-2xl ${
          isDark
            ? 'bg-[rgba(8,28,44,0.92)] border-white/20 text-stone-100'
            : 'bg-white/95 border-black/15 text-stone-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsSuccessModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
            <CheckCircle2 className="w-8 h-8 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono mb-2 bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Заказ {lastPlacedOrder.orderId}</span>
          </div>

          {/* EXACT MANDATED RUSSIAN SUCCESS TEXT */}
          <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-center max-w-md mx-auto leading-snug">
            Ваш заказ успешно оформлен. Наш администратор{' '}
            <span className="text-amber-400 font-semibold underline underline-offset-4">
              @White_blooming
            </span>{' '}
            свяжется с вами в Telegram для подтверждения и оплаты.
          </h2>
        </div>

        {/* Order Details & Telegram Verification Card */}
        <div
          className={`p-5 rounded-2xl border space-y-3 mb-6 ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-black/[0.02] border-black/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
            <span className="opacity-70">Получатель:</span>
            <span className="font-bold">{lastPlacedOrder.user.name}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
            <span className="opacity-70">Телефон:</span>
            <span>{lastPlacedOrder.user.phone}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10">
            <span className="opacity-70">Telegram аккаунт:</span>
            <span className="text-amber-400 font-bold">{lastPlacedOrder.user.telegram}</span>
          </div>

          <div className="pt-2">
            <span className="block text-[11px] font-mono opacity-60 uppercase mb-2">
              Состав заказанной партитуры:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {lastPlacedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs font-mono opacity-90"
                >
                  <span className="truncate pr-2">
                    {item.quantity}× {item.product.name} ({item.volume}, {item.nicotine})
                  </span>
                  <span className="font-bold text-amber-400 shrink-0">
                    {item.totalUnitPrice * item.quantity} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between font-serif text-xl font-bold">
            <span>Итоговая сумма:</span>
            <span className="text-amber-400 text-2xl">{lastPlacedOrder.subtotal} ₽</span>
          </div>
        </div>

        {/* Actions: Open Telegram & Close */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://t.me/White_blooming"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass w-full sm:flex-1 py-3.5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] text-stone-100"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>Написать администратору в Telegram</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-white/15 hover:bg-white/10 font-mono text-xs transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

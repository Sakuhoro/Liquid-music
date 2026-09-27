import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  User,
  Phone,
  Send,
  Calendar,
  LogOut,
  Disc3,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Loader2,
} from 'lucide-react';

const formatRub = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value);

const TIER_LABEL: Record<string, string> = {
  BASE: 'Первое слушание',
  SILVER: 'Серебряный слушатель',
  GOLD: 'Золотой слушатель',
};

const STATUS_LABEL: Record<string, string> = {
  'Pending Verification': 'Ожидает подтверждения',
  Confirmed: 'Подтверждён',
};

const STATUS_TONE: Record<string, string> = {
  'Pending Verification': 'var(--hall-varnish)',
  Confirmed: 'var(--tier-silver)',
};

// Progress toward the next tier, as a percentage. A member with no next
// threshold is shown a full bar rather than an empty one.
function loyaltyProgress(spend: number, nextThreshold: number | null) {
  if (!nextThreshold) return 100;
  const previous = nextThreshold === 20000 ? 0 : 20000;
  const span = nextThreshold - previous;
  if (span <= 0) return 100;
  return Math.max(0, Math.min(100, ((spend - previous) / span) * 100));
}

export const AccountModal: React.FC = () => {
  const isAccountModalOpen = useAppStore((state) => state.isAccountModalOpen);
  const setIsAccountModalOpen = useAppStore((state) => state.setIsAccountModalOpen);
  const currentUser = useAppStore((state) => state.currentUser);
  const logoutWithApi = useAppStore((state) => state.logoutWithApi);
  const logout = useAppStore((state) => state.logout);
  const ordersHistory = useAppStore((state) => state.ordersHistory);
  const loyalty = useAppStore((state) => state.loyalty);
  const fetchOrders = useAppStore((state) => state.fetchOrders);
  const isLoading = useAppStore((state) => state.isLoadingOrders);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Re-read on open so the cabinet never shows a history that predates an
  // order placed in another tab.
  useEffect(() => {
    if (isAccountModalOpen) fetchOrders();
  }, [isAccountModalOpen, fetchOrders]);

  if (!isAccountModalOpen || !currentUser) return null;

  const spend = loyalty?.spend ?? 0;
  const nextThreshold = loyalty?.nextThreshold ?? null;
  const progress = loyaltyProgress(spend, nextThreshold);
  const remaining = nextThreshold ? Math.max(0, nextThreshold - spend) : 0;

  return (
    <div
      id="account-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsAccountModalOpen(false);
      }}
    >
      <div
        id="account-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Личный кабинет"
        className="relative w-full max-w-3xl rounded-3xl overflow-hidden border hall-settle"
        style={{
          background: 'var(--hall-surface)',
          borderColor: 'var(--hall-border)',
          color: 'var(--hall-text)',
          boxShadow: 'var(--hall-shadow)',
        }}
      >
        {/* Header with the turning record */}
        <div className="relative p-6 sm:p-8 overflow-hidden">
          <div className="hall-vinyl" aria-hidden="true" />

          <button
            onClick={() => setIsAccountModalOpen(false)}
            aria-label="Закрыть кабинет"
            className="absolute top-5 right-5 hall-focusable w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
            style={{ background: 'var(--hall-border)' }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--hall-varnish-soft)', border: '1px solid var(--hall-border-strong)', color: 'var(--hall-varnish)' }}
            >
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 hall-text-2xs font-mono" style={{ color: 'var(--tier-gold)' }}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Авторизованный слушатель</span>
              </div>
              <h2 className="font-serif hall-text-3xl font-normal leading-tight truncate">
                {currentUser.name}
              </h2>
            </div>
          </div>

          {/* Loyalty programme */}
          {loyalty && (
            <div
              className="relative mt-6 p-4 rounded-2xl hall-list-in"
              style={{ background: 'var(--hall-surface-raised)', border: '1px solid var(--hall-border)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="hall-text-2xs font-mono uppercase tracking-wider" style={{ color: 'var(--hall-text-faint)' }}>
                    Постоянный слушатель
                  </div>
                  <div className="font-serif hall-text-xl mt-0.5" style={{ color: `var(--tier-${loyalty.tier.toLowerCase()})` }}>
                    {TIER_LABEL[loyalty.tier] ?? loyalty.tier}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-serif hall-text-3xl font-bold" style={{ color: 'var(--hall-varnish)' }}>
                    {loyalty.discountPct}%
                  </div>
                  <div className="hall-text-2xs font-mono" style={{ color: 'var(--hall-text-faint)' }}>
                    на следующий заказ
                  </div>
                </div>
              </div>

              <div
                className="mt-3 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--hall-border)' }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Прогресс до следующего уровня"
              >
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${progress}%`,
                    background: `var(--tier-${loyalty.tier.toLowerCase()})`,
                    transitionTimingFunction: 'var(--motion-ease-out)',
                  }}
                />
              </div>

              <div className="mt-2 hall-text-2xs font-mono" style={{ color: 'var(--hall-text-muted)' }}>
                {nextThreshold ? (
                  <>
                    <span style={{ color: 'var(--hall-text)' }}>{formatRub(spend)} ₽</span>
                    {' из '}
                    {formatRub(nextThreshold)} ₽ — ещё {formatRub(remaining)} ₽
                  </>
                ) : (
                  <>
                    <span style={{ color: 'var(--hall-text)' }}>{formatRub(spend)} ₽</span>
                    {' — максимальный уровень'}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div
          className="mx-6 sm:mx-8 p-4 rounded-2xl space-y-3 hall-text-base font-mono"
          style={{ background: 'var(--hall-surface-raised)', border: '1px solid var(--hall-border)' }}
        >
          {[
            { Icon: Send, label: 'Telegram', value: currentUser.telegram, tone: 'var(--hall-varnish)' },
            { Icon: Phone, label: 'Телефон', value: currentUser.phone, tone: 'var(--tier-silver)' },
            { Icon: Calendar, label: 'В студии с', value: currentUser.registeredAt, tone: 'var(--hall-varnish)' },
          ].map(({ Icon, label, value, tone }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 shrink-0" style={{ color: 'var(--hall-text-muted)' }}>
                <Icon className="w-3.5 h-3.5" style={{ color: tone }} />
                {label}
              </span>
              <span className="truncate" style={{ color: label === 'Telegram' ? 'var(--hall-varnish)' : undefined }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Order history */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif hall-text-xl flex items-center gap-2">
              <Disc3 className="w-4 h-4" style={{ color: 'var(--hall-varnish)' }} />
              <span>История заказов</span>
              <span className="hall-text-base font-mono" style={{ color: 'var(--hall-text-faint)' }}>
                ({ordersHistory.length})
              </span>
            </h3>
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--hall-text-faint)' }} />}
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {ordersHistory.length === 0 ? (
              <div className="py-8 text-center">
                <Disc3 className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--hall-text-faint)' }} />
                <p className="hall-text-base" style={{ color: 'var(--hall-text-muted)' }}>
                  {isLoading ? 'Загружаем архив…' : 'Записей пока нет.'}
                </p>
                <p className="hall-text-2xs mt-1" style={{ color: 'var(--hall-text-faint)' }}>
                  Первый заказ появится здесь сразу после оформления.
                </p>
              </div>
            ) : (
              ordersHistory.map((order, index) => {
                const isOpen = expanded === order.orderId;
                return (
                  <div
                    key={order.orderId}
                    className="hall-list-in rounded-xl overflow-hidden"
                    style={{
                      background: 'var(--hall-surface-raised)',
                      border: '1px solid var(--hall-border)',
                      animationDelay: `${Math.min(index, 6) * 40}ms`,
                    }}
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : order.orderId)}
                      aria-expanded={isOpen}
                      className="hall-focusable w-full p-3 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-mono font-bold hall-text-base" style={{ color: 'var(--hall-varnish)' }}>
                          {order.orderId}
                        </div>
                        <div className="hall-text-2xs font-mono mt-0.5" style={{ color: 'var(--hall-text-faint)' }}>
                          {order.createdAt} ·{' '}
                          <span style={{ color: STATUS_TONE[order.status] }}>
                            {STATUS_LABEL[order.status] ?? order.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold hall-text-base">
                          {formatRub(order.subtotal)} ₽
                        </span>
                        <ChevronDown
                          className="w-3.5 h-3.5 transition-transform duration-200"
                          style={{
                            color: 'var(--hall-text-faint)',
                            transform: isOpen ? 'rotate(180deg)' : undefined,
                          }}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        className="px-3 pb-3 pt-1 space-y-2 hall-list-in"
                        style={{ borderTop: '1px solid var(--hall-border)' }}
                      >
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2.5 py-1.5">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                              style={{ border: '1px solid var(--hall-border)' }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="hall-text-base font-medium truncate">{item.product.name}</div>
                              <div className="hall-text-2xs font-mono" style={{ color: 'var(--hall-text-faint)' }}>
                                {item.volume} · {item.nicotine} · {item.quantity} шт
                              </div>
                            </div>
                            <div className="hall-text-2xs font-mono shrink-0">
                              {formatRub(item.totalUnitPrice * item.quantity)} ₽
                            </div>
                          </div>
                        ))}

                        {order.discountAmount ? (
                          <div
                            className="flex items-center justify-between hall-text-2xs font-mono pt-2"
                            style={{ borderTop: '1px solid var(--hall-border)', color: 'var(--tier-gold)' }}
                          >
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              Скидка постоянного слушателя {order.discountPct}%
                            </span>
                            <span>−{formatRub(order.discountAmount)} ₽</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--hall-border)' }}
        >
          <button
            onClick={() => {
              logoutWithApi();
              logout();
            }}
            className="hall-focusable px-4 py-2 rounded-xl hall-text-base font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            style={{ color: 'oklch(0.7 0.19 22)' }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Выйти</span>
          </button>

          <button
            onClick={() => setIsAccountModalOpen(false)}
            className="hall-focusable px-5 py-2 rounded-xl hall-text-base font-mono transition-colors cursor-pointer"
            style={{ border: '1px solid var(--hall-border-strong)' }}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

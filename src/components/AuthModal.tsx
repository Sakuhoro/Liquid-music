import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  UserCheck,
  Phone,
  Send,
  User,
  AlertCircle,
  Lock,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const isAuthModalOpen = useAppStore((state) => state.isAuthModalOpen);
  const closeAuthModal = useAppStore((state) => state.closeAuthModal);
  const authModalContext = useAppStore((state) => state.authModalContext);
  const authenticateUser = useAppStore((state) => state.authenticateUser);
  const placeOrder = useAppStore((state) => state.placeOrder);
  const theme = useAppStore((state) => state.theme);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('@');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic format validation
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.split(/\s+/).length < 2) {
      setError('Пожалуйста, введите полное ФИО (как минимум Фамилию и Имя).');
      return;
    }

    const cleanPhone = phone.trim().replace(/[^\d]/g, '');
    if (cleanPhone.length < 10) {
      setError('Укажите корректный номер телефона (не менее 10 цифр).');
      return;
    }

    let cleanTg = telegram.trim();
    if (!cleanTg.startsWith('@')) {
      cleanTg = '@' + cleanTg;
    }
    if (cleanTg.length < 4) {
      setError('Укажите корректный Telegram ID (например, @username).');
      return;
    }

    if (!password || password.trim().length < 9) {
      setError('Пароль должен содержать минимум 9 символов.');
      return;
    }

    // Call store authentication engine
    const result = authenticateUser(trimmedName, phone.trim(), cleanTg, password.trim());
    if (!result.success) {
      setError(result.error || 'Ошибка входа. Проверьте введенные данные.');
      return;
    }

    // If context was checkout, continue placing order automatically!
    if (authModalContext === 'checkout') {
      setTimeout(() => {
        placeOrder();
      }, 250);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-rise"
    >
      <div
        id="auth-modal-card"
        className={`relative w-full max-w-xl rounded-3xl overflow-hidden border shadow-2xl p-8 sm:p-10 backdrop-blur-2xl ${
          isDark
            ? 'bg-[rgba(8,28,44,0.95)] border-white/20 text-stone-100'
            : 'bg-white/95 border-black/15 text-stone-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">
            Заполнение карточки для входа на студию
          </h2>

          <p className="text-sm opacity-75 mt-2 leading-relaxed font-sans">
            Укажите ваши персональные данные и пароль для доступа к звукозаписывающей студии и управлению заказами.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Auth Form with Prominent Inputs (Increased font size & scale) */}
        <form onSubmit={handleSubmit} className="space-y-5 text-base font-sans">
          {/* Field 1: Full Name (ФИО) */}
          <div className="space-y-2">
            <label className="block font-mono uppercase tracking-wider text-xs sm:text-sm opacity-80 font-bold">
              ФИО (Полное имя):
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                required
                placeholder="Иванова Анна Сергеевна"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-12 pr-5 py-4 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 transition-colors text-base sm:text-lg ${
                  isDark
                    ? 'bg-white/[0.05] border-white/20 text-stone-100 placeholder:text-stone-500'
                    : 'bg-black/[0.04] border-black/15 text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Field 2: Phone Number */}
          <div className="space-y-2">
            <label className="block font-mono uppercase tracking-wider text-xs sm:text-sm opacity-80 font-bold">
              Номер Телефона:
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="tel"
                required
                placeholder="+7 (999) 000-00-00"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-12 pr-5 py-4 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 transition-colors text-base sm:text-lg ${
                  isDark
                    ? 'bg-white/[0.05] border-white/20 text-stone-100 placeholder:text-stone-500'
                    : 'bg-black/[0.04] border-black/15 text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Field 3: Telegram ID (@username) */}
          <div className="space-y-2">
            <label className="block font-mono uppercase tracking-wider text-xs sm:text-sm opacity-80 font-bold">
              Telegram ID:
            </label>
            <div className="relative">
              <Send className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                required
                placeholder="@username"
                value={telegram}
                onChange={(e) => {
                  let val = e.target.value;
                  if (!val.startsWith('@') && val.length > 0) {
                    val = '@' + val;
                  }
                  setTelegram(val);
                  setError(null);
                }}
                className={`w-full pl-12 pr-5 py-4 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 transition-colors text-base sm:text-lg font-mono ${
                  isDark
                    ? 'bg-white/[0.05] border-white/20 text-stone-100 placeholder:text-stone-500'
                    : 'bg-black/[0.04] border-black/15 text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Field 4: Password (Minimum 9 characters) */}
          <div className="space-y-2">
            <label className="block font-mono uppercase tracking-wider text-xs sm:text-sm opacity-80 font-bold">
              Пароль (мин. 9 символов):
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="password"
                required
                minLength={9}
                placeholder="•••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-12 pr-5 py-4 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 transition-colors text-base sm:text-lg font-mono ${
                  isDark
                    ? 'bg-white/[0.05] border-white/20 text-stone-100 placeholder:text-stone-500'
                    : 'bg-black/[0.04] border-black/15 text-stone-900 placeholder:text-stone-400'
                }`}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="liquid-glass w-full py-4.5 rounded-2xl font-semibold text-base sm:text-lg tracking-wide flex items-center justify-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] text-stone-100 shadow-xl"
            >
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>Войти в студию</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

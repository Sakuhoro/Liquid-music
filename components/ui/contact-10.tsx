import React, { useState } from 'react';
import {
  User,
  Phone,
  Send,
  Lock,
  UserCheck,
  UserPlus,
  Sliders,
  AlertCircle,
  CheckSquare,
  Square,
} from 'lucide-react';

export interface StudioAccessGateProps {
  mode?: 'login' | 'register';
  onModeChange?: (mode: 'login' | 'register') => void;
  onSubmitLogin?: (data: { telegramId: string; password: string; rememberMe: boolean }) => void;
  onSubmitRegister?: (data: {
    fullName: string;
    phone: string;
    telegramId: string;
    password: string;
    rememberMe: boolean;
  }) => void;
  error?: string | null;
  loading?: boolean;
}

export const Contact10: React.FC<StudioAccessGateProps> = ({
  mode: externalMode,
  onModeChange,
  onSubmitLogin,
  onSubmitRegister,
  error,
  loading = false,
}) => {
  const [internalMode, setInternalMode] = useState<'login' | 'register'>('login');
  const mode = externalMode ?? internalMode;

  const handleSetMode = (m: 'login' | 'register') => {
    if (onModeChange) {
      onModeChange(m);
    } else {
      setInternalMode(m);
    }
  };

  // Registering asks for three fields where signing in asks for two, which on
  // a phone made this the taller of the two cards by enough to push the submit
  // button past the fold. So the register view gives up about a quarter of
  // its padding, gaps and field heights, and only on a phone; sign-in and
  // anything from md up keep the roomier metrics.
  const isRegister = mode === 'register';
  const cardPad = isRegister ? 'p-4 md:p-10' : 'p-6 sm:p-8 md:p-10';
  const formGap = isRegister ? 'space-y-2.5 md:space-y-4' : 'space-y-4';
  const labelGap = isRegister ? 'space-y-1 md:space-y-1.5' : 'space-y-1.5';
  const fieldPad = isRegister ? 'py-2.5 md:py-3.5' : 'py-3.5';
  const fieldInset = isRegister ? 'pl-10 md:pl-12' : 'pl-12';
  const iconInset = isRegister ? 'left-3.5 md:left-4' : 'left-4';
  const submitPad = isRegister ? 'py-3 md:py-4' : 'py-4';

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramId, setTelegramId] = useState('@');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);

  const activeError = error || clientError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);

    let cleanTg = telegramId.trim();
    if (!cleanTg.startsWith('@')) {
      cleanTg = '@' + cleanTg;
    }

    if (password.trim().length < 9) {
      setClientError('Пароль должен содержать минимум 9 символов.');
      return;
    }

    if (mode === 'login') {
      if (cleanTg.length < 2) {
        setClientError('Укажите корректный Telegram ID.');
        return;
      }
      if (onSubmitLogin) {
        onSubmitLogin({
          telegramId: cleanTg,
          password: password.trim(),
          rememberMe,
        });
      }
    } else {
      const cleanName = fullName.trim();
      if (!cleanName || cleanName.split(/\s+/).length < 2) {
        setClientError('Пожалуйста, введите полное ФИО (не менее 2 слов).');
        return;
      }

      const cleanPhoneDigits = phone.replace(/[^\d]/g, '');
      if (cleanPhoneDigits.length < 10) {
        setClientError('Укажите корректный номер телефона (не менее 10 цифр).');
        return;
      }

      if (cleanTg.length < 2) {
        setClientError('Укажите корректный Telegram ID.');
        return;
      }

      if (onSubmitRegister) {
        onSubmitRegister({
          fullName: cleanName,
          phone: phone.trim(),
          telegramId: cleanTg,
          password: password.trim(),
          rememberMe,
        });
      }
    }
  };

  return (
    <div className={`w-full max-w-xl mx-auto rounded-3xl border border-white/20 bg-stone-950/90 ${cardPad} text-stone-100 shadow-2xl backdrop-blur-2xl relative overflow-hidden font-sans`}>
      {/* Studio Background Accents & Waveform Grid */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white mb-6">
        Вход для звукорежиссеров
      </h2>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-white/[0.06] border border-white/10 font-mono text-sm">
        <button
          type="button"
          onClick={() => handleSetMode('login')}
          className={`py-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'login'
              ? 'bg-amber-400 text-stone-950 shadow-md'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Вход</span>
        </button>
        <button
          type="button"
          onClick={() => handleSetMode('register')}
          className={`py-2.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'register'
              ? 'bg-amber-400 text-stone-950 shadow-md'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Регистрация</span>
        </button>
      </div>

      {/* Active Error Alert */}
      {activeError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-snug font-medium">{activeError}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className={`${formGap} font-sans`}>
        {mode === 'register' && (
          <>
            {/* Field: Full Name / ФИО */}
            <div className={labelGap}>
              <label className="block font-mono uppercase tracking-wider text-xs text-stone-300 font-bold">
                ФИО (Полное имя):
              </label>
              <div className="relative">
                <User className={`w-5 h-5 absolute ${iconInset} top-1/2 -translate-y-1/2 text-stone-400`} />
                <input
                  type="text"
                  required
                  placeholder="Иванова Анна Сергеевна"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setClientError(null);
                  }}
                  className={`w-full ${fieldInset} pr-4 ${fieldPad} rounded-2xl border border-white/15 bg-white/[0.05] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 text-base transition-colors`}
                />
              </div>
            </div>

            {/* Field: Phone Number */}
            <div className={labelGap}>
              <label className="block font-mono uppercase tracking-wider text-xs text-stone-300 font-bold">
                Номер Телефона:
              </label>
              <div className="relative">
                <Phone className={`w-5 h-5 absolute ${iconInset} top-1/2 -translate-y-1/2 text-stone-400`} />
                <input
                  type="tel"
                  required
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setClientError(null);
                  }}
                  className={`w-full ${fieldInset} pr-4 ${fieldPad} rounded-2xl border border-white/15 bg-white/[0.05] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 text-base transition-colors`}
                />
              </div>
            </div>
          </>
        )}

        {/* Field: Telegram ID */}
        <div className={labelGap}>
          <label className="block font-mono uppercase tracking-wider text-xs text-stone-300 font-bold">
            Telegram ID:
          </label>
          <div className="relative">
            <Send className={`w-5 h-5 absolute ${iconInset} top-1/2 -translate-y-1/2 text-stone-400`} />
            <input
              type="text"
              required
              placeholder="@username"
              value={telegramId}
              onChange={(e) => {
                let val = e.target.value;
                if (!val.startsWith('@') && val.length > 0) {
                  val = '@' + val;
                }
                setTelegramId(val);
                setClientError(null);
              }}
              className={`w-full ${fieldInset} pr-4 ${fieldPad} rounded-2xl border border-white/15 bg-white/[0.05] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 text-base font-mono transition-colors`}
            />
          </div>
        </div>

        {/* Field: Password */}
        <div className={labelGap}>
          <label className="block font-mono uppercase tracking-wider text-xs text-stone-300 font-bold">
            Пароль (мин. 9 символов):
          </label>
          <div className="relative">
            <Lock className={`w-5 h-5 absolute ${iconInset} top-1/2 -translate-y-1/2 text-stone-400`} />
            <input
              type="password"
              required
              minLength={9}
              placeholder="•••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setClientError(null);
              }}
              className={`w-full ${fieldInset} pr-4 ${fieldPad} rounded-2xl border border-white/15 bg-white/[0.05] text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400 text-base font-mono transition-colors`}
            />
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-3 text-sm text-stone-300 hover:text-white cursor-pointer select-none transition-colors"
          >
            {rememberMe ? (
              <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-stone-500 shrink-0" />
            )}
            <span className="font-medium">Запомнить меня</span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`liquid-glass w-full ${submitPad} rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-3 cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] text-white shadow-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40`}
          >
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>
              {loading
                ? 'Обработка доступа...'
                : mode === 'login'
                ? 'Войти в студию'
                : 'Зарегистрироваться как звукорежиссер'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ProductItem, CollectionName } from '../types';
import {
  X,
  Sliders,
  Edit2,
  Trash2,
  Plus,
  RotateCcw,
  Copy,
  Check,
  Video,
  FileCode,
  Music,
  Radio,
  Lock,
  Unlock,
  Download,
  AlertCircle,
  HelpCircle,
  LogOut,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';

export const StudioAdminModal: React.FC = () => {
  const isStudioModalOpen = useAppStore((state) => state.isStudioModalOpen);
  const setIsStudioModalOpen = useAppStore((state) => state.setIsStudioModalOpen);
  const isAdminLoggedIn = useAppStore((state) => state.isAdminLoggedIn);
  const adminLogin = useAppStore((state) => state.adminLogin);
  const adminLogout = useAppStore((state) => state.adminLogout);

  const products = useAppStore((state) => state.products);
  const updateProduct = useAppStore((state) => state.updateProduct);
  const addProduct = useAppStore((state) => state.addProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);
  const resetProducts = useAppStore((state) => state.resetProducts);

  const collectionVideos = useAppStore((state) => state.collectionVideos);
  const setCollectionVideo = useAppStore((state) => state.setCollectionVideo);

  const darkMusicUrl = useAppStore((state) => state.darkMusicUrl);
  const lightMusicUrl = useAppStore((state) => state.lightMusicUrl);
  const setDarkMusicUrl = useAppStore((state) => state.setDarkMusicUrl);
  const setLightMusicUrl = useAppStore((state) => state.setLightMusicUrl);

  const soundCloudUrl = useAppStore((state) => state.soundCloudUrl);
  const setSoundCloudUrl = useAppStore((state) => state.setSoundCloudUrl);

  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Admin tabs
  const [activeTab, setActiveTab] = useState<'products' | 'videos' | 'audio' | 'export'>('products');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Video inputs state
  const [tempVideos, setTempVideos] = useState(collectionVideos);
  // Audio inputs state
  const [tempDarkMusic, setTempDarkMusic] = useState(darkMusicUrl);
  const [tempLightMusic, setTempLightMusic] = useState(lightMusicUrl);
  const [tempSoundCloud, setTempSoundCloud] = useState(soundCloudUrl);
  const [audioSaveNotice, setAudioSaveNotice] = useState(false);
  const [videoSaveNotice, setVideoSaveNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isStudioModalOpen) return null;

  // Handle Admin Login: strictly @White_blooming / 365Dca586
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const success = adminLogin(usernameInput, passwordInput);
    if (!success) {
      setAuthError('Неверный логин или пароль администратора. Доступ заблокирован.');
    }
  };

  const handleSaveVideos = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(tempVideos).forEach(([col, url]) => {
      setCollectionVideo(col as CollectionName, url);
    });
    setVideoSaveNotice(true);
    setTimeout(() => setVideoSaveNotice(false), 2000);
  };

  const handleSaveAudio = (e: React.FormEvent) => {
    e.preventDefault();
    setDarkMusicUrl(tempDarkMusic);
    setLightMusicUrl(tempLightMusic);
    setSoundCloudUrl(tempSoundCloud);
    setAudioSaveNotice(true);
    setTimeout(() => setAudioSaveNotice(false), 2000);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCreateNew = () => {
    const newId = `opus-${Date.now()}`;
    const newProd: ProductItem = {
      id: newId,
      name: 'Новый Вкус',
      subtitle: 'Новый авторский микс',
      description: 'Описание нового авторского вкуса и ароматической пирамиды.',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80',
      basePrice: 300,
      category: 'Spring',
      musicalKey: 'C Major',
      bpm: 120,
      opusNumber: `Op. ${products.length + 1}`,
      aromaticChords: {
        top: 'Верхние ноты',
        heart: 'Ноты сердца',
        base: 'Базовый аккорд',
      },
      accentColor: '#38bdf8',
    };
    addProduct(newProd);
    setEditingProduct(newProd);
  };

  // Image Upload Handler for Edit Form
  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    if (!file.type.startsWith('image/')) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setEditingProduct({ ...editingProduct, image: data.url });
          return;
        }
      }
    } catch (err) {
      console.error('Failed to upload image to server:', err);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setEditingProduct({ ...editingProduct, image: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(products, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'liquid-music-database-backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      id="studio-admin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-rise"
    >
      <div
        id="studio-admin-modal-card"
        className={`relative w-full max-w-[1344px] h-[88vh] rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-2xl flex flex-col ${
          isDark
            ? 'bg-[rgba(7,24,38,0.96)] border-white/20 text-stone-100'
            : 'bg-white/95 border-slate-300 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsStudioModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. IF NOT AUTHENTICATED: Show Protected Admin Login Screen */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center my-auto max-w-md mx-auto w-full">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-6 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="font-serif text-3xl font-normal tracking-tight mb-2">
              Studio Director Console
            </h2>

            <p className="text-xs opacity-75 mb-6 leading-relaxed">
              Вход в панель управления защищен. Требуются учетные данные администратора.
            </p>

            {authError && (
              <div className="w-full mb-5 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="w-full space-y-4 text-left text-xs font-mono">
              <div>
                <label className="block text-[11px] uppercase tracking-wider opacity-70 mb-1.5 font-bold">
                  Username:
                </label>
                <input
                  type="text"
                  required
                  placeholder="@White_blooming"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 text-xs ${
                    isDark
                      ? 'bg-white/5 border-white/15 text-stone-100 placeholder:text-stone-500'
                      : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider opacity-70 mb-1.5 font-bold">
                  Password:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 text-xs ${
                    isDark
                      ? 'bg-white/5 border-white/15 text-stone-100 placeholder:text-stone-500'
                      : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="liquid-glass w-full py-3.5 rounded-2xl font-sans font-semibold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] text-stone-100"
              >
                <Unlock className="w-4 h-4 text-amber-400" />
                <span>Войти в консоль Studio Director</span>
              </button>
            </form>
          </div>
        ) : (
          /* 2. IF AUTHENTICATED: Show Full Admin Studio Controls */
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-normal">
                    Кабинет администратора
                  </h2>
                  <p className="text-xs opacity-60">
                    Авторизован как <span className="text-amber-400 font-mono">@White_blooming</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pr-10">
                <button
                  onClick={adminLogout}
                  title="Заблокировать консоль"
                  className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выход</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 text-xs font-mono rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-white/10 font-bold text-amber-400 border-b-2 border-amber-400'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                Вкусы и Цены ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 text-xs font-mono rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'videos'
                    ? 'bg-white/10 font-bold text-amber-400 border-b-2 border-amber-400'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Video className="w-3.5 h-3.5 inline mr-1" />
                Видео коллекций
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`px-4 py-2 text-xs font-mono rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'audio'
                    ? 'bg-white/10 font-bold text-amber-400 border-b-2 border-amber-400'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Music className="w-3.5 h-3.5 inline mr-1" />
                Фоновая музыка & SoundCloud
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`px-4 py-2 text-xs font-mono rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'export'
                    ? 'bg-white/10 font-bold text-amber-400 border-b-2 border-amber-400'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 inline mr-1" />
                Экспорт БД
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: Products */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono opacity-70">
                      Управление вкусами, коллекциями и базовыми ценами
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={resetProducts}
                        className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-mono flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Сбросить по умолчанию</span>
                      </button>
                      <button
                        onClick={handleCreateNew}
                        className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-400/20 transition-transform active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Добавить вкус</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-lg font-bold truncate">
                              {prod.name}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 font-bold border border-white/10 text-amber-400">
                              {prod.category}
                            </span>
                          </div>
                          <p className="text-xs opacity-60 truncate">{prod.description}</p>
                          <div className="text-xs font-mono text-amber-400 mt-1">
                            Цена: {prod.basePrice} ₽
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Редактировать</span>
                          </button>

                          <button
                            onClick={() => deleteProduct(prod.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Collection-Specific Videos (Spring, Summer, Autumn, Permanent 1, Permanent 2) */}
              {activeTab === 'videos' && (
                <form onSubmit={handleSaveVideos} className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="font-serif text-xl mb-1">Collection-Specific Cinematic Videos</h3>
                    <p className="text-xs opacity-70">
                      Assign distinct full-screen looping video background URLs to each specific collection. When a customer filters by that collection, the background seamlessly switches.
                    </p>
                  </div>

                  {videoSaveNotice && (
                    <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Collection video feeds successfully updated!</span>
                    </div>
                  )}

                  {(['Spring', 'Summer', 'Autumn', 'Permanent 1', 'Permanent 2'] as CollectionName[]).map((col) => (
                    <div key={col} className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase tracking-wider opacity-80 font-bold">
                        {col} Collection Video URL:
                      </label>
                      <input
                        type="url"
                        required
                        value={tempVideos[col]}
                        onChange={(e) =>
                          setTempVideos({
                            ...tempVideos,
                            [col]: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="liquid-glass px-6 py-3 rounded-2xl text-xs font-semibold text-stone-100 cursor-pointer hover:scale-105 transition-transform"
                  >
                    Save Collection Video Feeds
                  </button>
                </form>
              )}

              {/* TAB 4: Background Music & SoundCloud Integration */}
              {activeTab === 'audio' && (
                <form onSubmit={handleSaveAudio} className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="font-serif text-xl mb-1">Background Audio & SoundCloud Player</h3>
                    <p className="text-xs opacity-70">
                      Configure background ambient audio for Dark and Light themes, and paste a direct SoundCloud link for the UI music player.
                    </p>
                  </div>

                  {audioSaveNotice && (
                    <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Audio configurations successfully updated!</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider opacity-80 font-bold">
                      Dark Theme Background Music URL:
                    </label>
                    <input
                      type="url"
                      required
                      value={tempDarkMusic}
                      onChange={(e) => setTempDarkMusic(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] opacity-50 font-mono">
                      Plays when user toggles Dark Theme and enables the ambient speaker.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider opacity-80 font-bold">
                      Light Theme Background Music URL:
                    </label>
                    <input
                      type="url"
                      required
                      value={tempLightMusic}
                      onChange={(e) => setTempLightMusic(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] opacity-50 font-mono">
                      Plays when user toggles Light Theme and enables the ambient speaker.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="block text-xs font-mono uppercase tracking-wider opacity-80 font-bold text-orange-400">
                      <Radio className="w-3.5 h-3.5 inline mr-1" />
                      SoundCloud Direct Track Link:
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://soundcloud.com/artist/track"
                      value={tempSoundCloud}
                      onChange={(e) => setTempSoundCloud(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] opacity-50 font-mono">
                      This track will be launched when the user clicks the music player button in the UI.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="liquid-glass px-6 py-3 rounded-2xl text-xs font-semibold text-stone-100 cursor-pointer hover:scale-105 transition-transform"
                  >
                    Save Audio Configurations
                  </button>
                </form>
              )}

              {/* TAB 5: Export JSON with "Download database backup" helper text */}
              {activeTab === 'export' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-serif text-lg">Product Catalog Database Export</h4>
                      <p className="text-xs opacity-70 flex items-center gap-1.5 mt-0.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download database backup or copy clean JSON payload.</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyJson}
                        className="liquid-glass px-3.5 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 text-stone-100 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>

                      {/* Export JSON Button with Helper Tooltip */}
                      <div className="relative group">
                        <button
                          onClick={handleDownloadBackup}
                          className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-400/20 transition-transform active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export JSON</span>
                        </button>

                        {/* Helper Tooltip */}
                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block whitespace-nowrap px-2.5 py-1 rounded-md bg-black/90 text-amber-300 border border-amber-400/30 text-[10px] font-mono shadow-xl z-20">
                          Download database backup
                        </div>
                      </div>
                    </div>
                  </div>

                  <pre className="p-4 rounded-2xl bg-black/70 border border-white/10 text-[11px] font-mono overflow-x-auto text-amber-300 max-h-96">
                    {JSON.stringify(products, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Editing Product Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div
                  className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl ${
                    isDark ? 'bg-[hsl(201,100%,13%)] border-white/20 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-serif text-2xl font-bold">Редактирование: {editingProduct.name}</h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-mono font-bold opacity-80 mb-1 text-xs">Имя</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 focus:outline-none focus:border-amber-500 font-medium text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-mono font-bold opacity-80 mb-1 text-xs">Коллекция</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value as CollectionName,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                      >
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                        <option value="Autumn">Autumn</option>
                        <option value="Permanent 1">Permanent 1</option>
                        <option value="Permanent 2">Permanent 2</option>
                      </select>
                    </div>

                    {/* Integrated Direct Photo Loader & Preview */}
                    <div className="p-4 rounded-2xl border border-slate-300 dark:border-white/15 bg-slate-100/70 dark:bg-white/[0.03] space-y-3">
                      <label className="block font-mono font-bold opacity-90 text-xs uppercase tracking-wider">
                        Загрузка фотографии карточки
                      </label>

                      <div className="flex items-center gap-4">
                        {editingProduct.image && (
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-white/20 shrink-0 bg-black/20 shadow-md">
                            <img
                              src={editingProduct.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 space-y-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleEditImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/20 text-slate-800 dark:text-stone-100 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                          >
                            <Upload className="w-4 h-4 text-amber-500" />
                            <span>Загрузить изображение с компьютера</span>
                          </button>
                          <p className="text-[10px] opacity-60 font-mono">
                            Поддерживаются форматы PNG, JPG, WebP. Выбранная картинка будет сохранена напрямую в карточке.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono font-bold opacity-80 mb-1 text-xs">Описание</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, description: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 focus:outline-none focus:border-amber-500 text-xs font-normal"
                      />
                    </div>

                    <div>
                      <label className="block font-mono font-bold opacity-80 mb-1 text-xs">Цена (₽)</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.basePrice}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            basePrice: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 focus:outline-none focus:border-amber-500 font-mono text-sm font-bold"
                      />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-xs tracking-wide shadow-lg shadow-amber-500/30 transition-all cursor-pointer active:scale-95"
                      >
                        Сохранить изменения
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

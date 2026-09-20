import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ProductItem, CollectionName, PlacedOrder, VolumeType, NicotineType, RecipeItem } from '../types';
import { parseRecipeText, formatRecipeText } from '../utils/recipeParser';
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
  Upload,
  GitBranch,
  ShoppingBag,
  Package,
  DollarSign,
  Search,
  Filter,
  Eye,
  Archive,
  Layers,
  FlaskConical,
  BookOpen,
  Droplets,
  CheckCircle,
  Save,
  FileText,
} from 'lucide-react';

const ALL_COLLECTIONS: CollectionName[] = [
  'Spring',
  'Summer',
  'Autumn',
  'Permanent 1',
  'Permanent 2',
];

const COLLECTION_DISPLAY_NAMES: Record<string, string> = {
  All: 'Все коллекции',
  Spring: 'Весенняя',
  Summer: 'Летняя',
  Autumn: 'Осенняя',
  'Permanent 1': 'Permanent 1',
  'Permanent 2': 'Permanent 2',
};

const VOLUMES: VolumeType[] = ['30ml', '60ml', '120ml'];
const NICOTINES: NicotineType[] = ['0mg', '1.5mg', '3mg', '6mg'];

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

  const archivedCollections = useAppStore((state) => state.archivedCollections);
  const toggleArchiveCollection = useAppStore((state) => state.toggleArchiveCollection);
  const setArchiveAllCollections = useAppStore((state) => state.setArchiveAllCollections);

  const ordersHistory = useAppStore((state) => state.ordersHistory);
  const deleteOrderHistory = useAppStore((state) => state.deleteOrderHistory);

  const collectionVideos = useAppStore((state) => state.collectionVideos);
  const setCollectionVideo = useAppStore((state) => state.setCollectionVideo);

  const darkMusicUrl = useAppStore((state) => state.darkMusicUrl);
  const lightMusicUrl = useAppStore((state) => state.lightMusicUrl);
  const setDarkMusicUrl = useAppStore((state) => state.setDarkMusicUrl);
  const setLightMusicUrl = useAppStore((state) => state.setLightMusicUrl);

  const soundCloudUrl = useAppStore((state) => state.soundCloudUrl);
  const setSoundCloudUrl = useAppStore((state) => state.setSoundCloudUrl);

  const recipes = useAppStore((state) => state.recipes);
  const saveRecipe = useAppStore((state) => state.saveRecipe);

  const flavorPrices = useAppStore((state) => state.flavorPrices);
  const saveFlavorPrice = useAppStore((state) => state.saveFlavorPrice);

  const theme = useAppStore((state) => state.theme);
  const isDark = theme === 'dark';

  // Recipe Editor State
  const [recipeCollectionFilter, setRecipeCollectionFilter] = useState<CollectionName | 'All'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const colParam = params.get('collection');
      if (colParam) {
        const found = ALL_COLLECTIONS.find(
          (c) =>
            c.toLowerCase().replace(/\s+/g, '') === colParam.toLowerCase().replace(/\s+/g, '') ||
            COLLECTION_DISPLAY_NAMES[c]?.toLowerCase() === colParam.toLowerCase()
        );
        if (found) return found;
      }
    }
    return 'All';
  });

  const [selectedRecipeProductId, setSelectedRecipeProductId] = useState<string>(products[0]?.id || '');
  const [recipeRawText, setRecipeRawText] = useState<string>('');
  const [recipeMode, setRecipeMode] = useState<'table' | 'raw'>('table');
  const [recipeNotice, setRecipeNotice] = useState<string | null>(null);
  const [editingRecipeItems, setEditingRecipeItems] = useState<RecipeItem[]>([]);

  // Sync recipeCollectionFilter to URL search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (recipeCollectionFilter === 'All') {
        url.searchParams.delete('collection');
      } else {
        url.searchParams.set('collection', recipeCollectionFilter.toLowerCase().replace(/\s+/g, ''));
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [recipeCollectionFilter]);

  const filteredRecipeProducts = useMemo(() => {
    if (recipeCollectionFilter === 'All') return products;
    return products.filter((p) => p.category === recipeCollectionFilter);
  }, [products, recipeCollectionFilter]);

  useEffect(() => {
    if (filteredRecipeProducts.length > 0) {
      const exists = filteredRecipeProducts.some((p) => p.id === selectedRecipeProductId);
      if (!exists) {
        setSelectedRecipeProductId(filteredRecipeProducts[0].id);
      }
    }
  }, [filteredRecipeProducts, selectedRecipeProductId]);

  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Main Admin tabs: "Заказы" (orders) | "Товары" (products) | "Производство" (production) | "Медиа & БД" (media)
  const [mainTab, setMainTab] = useState<'orders' | 'products' | 'production' | 'media'>('orders');

  // Production sub-tabs: "Сводка" | "Рецепты" | "Аромы"
  const [prodSubTab, setProdSubTab] = useState<'summary' | 'recipes' | 'aromas'>('summary');

  // Orders tab state
  const [inspectedOrder, setInspectedOrder] = useState<PlacedOrder | null>(null);

  // Products tab filter state
  const [productCollectionFilter, setProductCollectionFilter] = useState<CollectionName | 'All'>('All');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Production Focus Mode state
  const [focusedFlavorName, setFocusedFlavorName] = useState<string | null>(null);

  // Media & Sync inputs state
  const [tempVideos, setTempVideos] = useState(collectionVideos);
  const [tempDarkMusic, setTempDarkMusic] = useState(darkMusicUrl);
  const [tempLightMusic, setTempLightMusic] = useState(lightMusicUrl);
  const [tempSoundCloud, setTempSoundCloud] = useState(soundCloudUrl);
  const [audioSaveNotice, setAudioSaveNotice] = useState(false);
  const [videoSaveNotice, setVideoSaveNotice] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [gitSyncNotice, setGitSyncNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkAudioInputRef = useRef<HTMLInputElement>(null);
  const lightAudioInputRef = useRef<HTMLInputElement>(null);

  // Sync active editing recipe items when selected product changes or tab switches
  useEffect(() => {
    if (!selectedRecipeProductId && products.length > 0) {
      setSelectedRecipeProductId(products[0].id);
    }
    const currentRecipe = recipes.find((r) => r.productId === selectedRecipeProductId);
    const items = currentRecipe ? currentRecipe.items : [];
    setEditingRecipeItems(items);
    setRecipeRawText(formatRecipeText(items));
  }, [selectedRecipeProductId, recipes, products]);

  // Facet Counts for Tab 6.2 (Products)
  const productCountsByCollection = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    ALL_COLLECTIONS.forEach((c) => {
      counts[c] = 0;
    });
    for (const p of products) {
      if (counts[p.category] !== undefined) {
        counts[p.category] += 1;
      } else {
        counts[p.category] = 1;
      }
    }
    return counts;
  }, [products]);

  if (!isStudioModalOpen) return null;

  // Handle Admin Login: strictly @White_Blooming / 365Dca586
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const success = adminLogin(usernameInput, passwordInput);
    if (!success) {
      setAuthError('Неверный логин или пароль администратора. Доступ заблокирован.');
    }
  };

  // Metrics for Tab 6.1 (Orders)
  const totalOrdersCount = ordersHistory.length;
  const totalBottlesCount = ordersHistory.reduce(
    (sum, order) => sum + order.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );
  const totalRevenueSum = ordersHistory.reduce((sum, order) => sum + order.subtotal, 0);

  // Filtered Products for Tab 6.2 (Products)
  const filteredProducts = products.filter((p) => {
    const matchesCol = productCollectionFilter === 'All' || p.category === productCollectionFilter;
    const q = productSearchQuery.toLowerCase().trim();
    const matchesQuery =
      q === '' ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchesCol && matchesQuery;
  });

  const areAllCollectionsArchived = ALL_COLLECTIONS.every((col) => archivedCollections[col]);

  // Pivot table matrix helper for Production Tab (Sub-tab 6.3)
  const getRequiredCount = (productName: string, vol: VolumeType, nic: NicotineType, orders: PlacedOrder[]) => {
    let count = 0;
    for (const order of orders) {
      for (const item of order.items) {
        if (item.product.name === productName && item.volume === vol && item.nicotine === nic) {
          count += item.quantity;
        }
      }
    }
    return count;
  };

  const getFlavorTotalBottles = (productName: string, orders: PlacedOrder[]) => {
    let count = 0;
    for (const order of orders) {
      for (const item of order.items) {
        if (item.product.name === productName) {
          count += item.quantity;
        }
      }
    }
    return count;
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

  const handleAudioFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetTheme: 'dark' | 'light'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setGitSyncNotice(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          if (targetTheme === 'dark') {
            setTempDarkMusic(data.url);
            setDarkMusicUrl(data.url);
          } else {
            setTempLightMusic(data.url);
            setLightMusicUrl(data.url);
          }
          setGitSyncNotice(`Файл ${file.name} успешно загружен и скоммичен в Git repository.`);
        }
      } else {
        setGitSyncNotice('Ошибка загрузки аудиофайла на сервер.');
      }
    } catch (err) {
      console.error('Audio Git upload failed:', err);
      setGitSyncNotice('Ошибка при синхронизации аудио с Git.');
    } finally {
      setIsUploadingAudio(false);
    }
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
      subtitle: '',
      description: 'Описание нового авторского вкуса и ароматической пирамиды.',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=500&auto=format&fit=crop&q=80',
      basePrice: 300,
      category: 'Spring',
      musicalKey: 'C Major',
      bpm: 120,
      opusNumber: '',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-rise"
    >
      <div
        id="studio-admin-modal-card"
        className={`relative w-full max-w-[1400px] h-[92vh] rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-2xl flex flex-col ${
          isDark
            ? 'bg-[rgba(7,24,38,0.96)] border-white/20 text-stone-100'
            : 'bg-white/95 border-slate-300 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          id="close-studio-modal-btn"
          onClick={() => setIsStudioModalOpen(false)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. IF NOT AUTHENTICATED: Show Protected Admin Login Screen */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center my-auto max-w-md mx-auto w-full">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-6 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">
              Панель Администратора
            </h2>

            <p className="text-xs opacity-75 mb-6 leading-relaxed">
              Авторизация для доступа к админ-панели /Liquidmusic/admin
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
                  Логин:
                </label>
                <input
                  type="text"
                  required
                  placeholder="@White_Blooming"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 text-xs font-sans font-semibold ${
                    isDark
                      ? 'bg-white/5 border-white/15 text-stone-100 placeholder:text-stone-500'
                      : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider opacity-70 mb-1.5 font-bold">
                  Пароль:
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl border backdrop-blur-md focus:outline-none focus:border-amber-400 text-xs font-sans font-semibold ${
                    isDark
                      ? 'bg-white/5 border-white/15 text-stone-100 placeholder:text-stone-500'
                      : 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="liquid-glass w-full py-3.5 rounded-2xl font-sans font-bold text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.02] text-stone-100 bg-amber-500/20 border border-amber-400/40"
              >
                <Unlock className="w-4 h-4 text-amber-400" />
                <span>Войти в систему (/Liquidmusic/admin)</span>
              </button>
            </form>
          </div>
        ) : (
          /* 2. IF AUTHENTICATED: Show Full Encapsulated Admin Panel Dashboard */
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-sans text-2xl font-extrabold tracking-tight antialiased">
                    Панель Управления Liquid Music
                  </h2>
                  <p className="text-xs opacity-70 font-mono">
                    Администратор: <span className="text-amber-400 font-bold">@White_Blooming</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pr-12">
                <button
                  onClick={adminLogout}
                  className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>

            {/* Top-Level Admin Navigation Tabs: "Заказы" | "Товары" | "Производство" | "Медиа & БД" */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 overflow-x-auto scrollbar-none bg-black/20">
              <button
                onClick={() => setMainTab('orders')}
                className={`px-5 py-3 text-sm font-sans font-extrabold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  mainTab === 'orders'
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                    : 'opacity-70 hover:opacity-100 text-stone-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Заказы</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 text-current">
                  {totalOrdersCount}
                </span>
              </button>

              <button
                onClick={() => setMainTab('products')}
                className={`px-5 py-3 text-sm font-sans font-extrabold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  mainTab === 'products'
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                    : 'opacity-70 hover:opacity-100 text-stone-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Товары</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 text-current">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setMainTab('production')}
                className={`px-5 py-3 text-sm font-sans font-extrabold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  mainTab === 'production'
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                    : 'opacity-70 hover:opacity-100 text-stone-200'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>Производство</span>
              </button>

              <button
                onClick={() => setMainTab('media')}
                className={`px-5 py-3 text-sm font-sans font-extrabold rounded-t-2xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  mainTab === 'media'
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20'
                    : 'opacity-70 hover:opacity-100 text-stone-200'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>Медиа & Git Sync</span>
              </button>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* TAB 6.1: ЗАКАЗЫ (ORDERS) */}
              {mainTab === 'orders' && (
                <div className="space-y-6">
                  {/* Top 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-between">
                      <div>
                        <p className="text-xs font-sans uppercase font-extrabold text-stone-400 tracking-wider">
                          Всего заказов
                        </p>
                        <h3 className="text-3xl font-extrabold font-sans text-white mt-1">
                          {totalOrdersCount}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-between">
                      <div>
                        <p className="text-xs font-sans uppercase font-extrabold text-stone-400 tracking-wider">
                          Общее количество флаконов
                        </p>
                        <h3 className="text-3xl font-extrabold font-sans text-emerald-400 mt-1">
                          {totalBottlesCount} шт.
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                        <Package className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-between">
                      <div>
                        <p className="text-xs font-sans uppercase font-extrabold text-stone-400 tracking-wider">
                          Общая выручка
                        </p>
                        <h3 className="text-3xl font-extrabold font-sans text-amber-400 mt-1">
                          {totalRevenueSum} ₽
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Orders List Table */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-sans font-extrabold text-white tracking-tight">
                      Список текущих заказов
                    </h3>

                    {ordersHistory.length === 0 ? (
                      <div className="p-12 text-center text-stone-400 font-sans font-semibold">
                        Заказы отсутствуют.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ordersHistory.map((order) => {
                          const orderBottles = order.items.reduce((s, i) => s + i.quantity, 0);
                          return (
                            <div
                              key={order.orderId}
                              className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-amber-400 text-sm">
                                    #{order.orderId}
                                  </span>
                                  <span className="font-sans font-extrabold text-white text-base">
                                    {order.user?.telegram || order.user?.name || '@пользователь'}
                                  </span>
                                  <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                                    {orderBottles} флак.
                                  </span>
                                </div>
                                <p className="text-xs text-stone-400 font-mono">
                                  Оформлен: {order.createdAt} • ФИО: {order.user?.name} ({order.user?.phone})
                                </p>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <div className="text-right">
                                  <div className="text-xs text-stone-400 font-sans font-semibold uppercase">Сумма:</div>
                                  <div className="text-xl font-extrabold text-amber-400 font-mono">
                                    {order.subtotal} ₽
                                  </div>
                                </div>

                                <button
                                  onClick={() => setInspectedOrder(order)}
                                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 text-xs font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-4 h-4 text-amber-400" />
                                  <span>Состав заказа</span>
                                </button>

                                <button
                                  onClick={() => deleteOrderHistory(order.orderId)}
                                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 text-xs font-sans font-bold border border-rose-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Удалить заказ как тестовый"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="hidden sm:inline">Удалить как тестовый</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6.2: ТОВАРЫ (PRODUCTS) */}
              {mainTab === 'products' && (
                <div className="space-y-6">
                  {/* Global Collection Archive Control Bar */}
                  <div className="p-4 rounded-2xl border border-white/15 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Archive className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <h4 className="font-sans font-extrabold text-sm text-white">
                          Глобальный статус заказов
                        </h4>
                        <p className="text-xs text-stone-300">
                          {areAllCollectionsArchived
                            ? 'Все коллекции закрыты для заказа (Архивированы)'
                            : 'Доступны открытые коллекции для оформления'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setArchiveAllCollections(!areAllCollectionsArchived)}
                      className={`px-5 py-2.5 rounded-xl font-sans font-extrabold text-xs transition-all cursor-pointer shadow-md ${
                        areAllCollectionsArchived
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          : 'bg-rose-600 text-white hover:bg-rose-500'
                      }`}
                    >
                      {areAllCollectionsArchived
                        ? 'Открыть все коллекции'
                        : 'Закрыть все коллекции для заказа'}
                    </button>
                  </div>

                  {/* Individual Collections Status Toggles */}
                  <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <h4 className="text-xs font-sans uppercase font-extrabold text-stone-300 mb-3 tracking-wider">
                      Управление доступом к коллекциям:
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {ALL_COLLECTIONS.map((col) => {
                        const isArchived = archivedCollections[col];
                        return (
                          <div
                            key={col}
                            className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-colors ${
                              isArchived
                                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-sans font-extrabold text-xs">{col}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isArchived ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
                              }`}>
                                {isArchived ? 'Архив' : 'Активна'}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleArchiveCollection(col)}
                              className="w-full py-1.5 rounded-lg text-[11px] font-sans font-bold border cursor-pointer transition-colors bg-white/10 hover:bg-white/20 border-white/15"
                            >
                              {isArchived ? 'Открыть' : 'Закрыть'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filter and Search Toolbar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
                      <span className="text-xs font-sans font-extrabold opacity-70 shrink-0">Фильтр:</span>
                      <button
                        onClick={() => setProductCollectionFilter('All')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold cursor-pointer whitespace-nowrap transition-colors ${
                          productCollectionFilter === 'All'
                            ? 'bg-amber-400 text-slate-950 shadow-md'
                            : 'bg-white/10 text-stone-300 hover:bg-white/20'
                        }`}
                      >
                        Все ({productCountsByCollection.All || 0})
                      </button>
                      {ALL_COLLECTIONS.map((col) => (
                        <button
                          key={col}
                          onClick={() => setProductCollectionFilter(col)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold cursor-pointer whitespace-nowrap transition-colors ${
                            productCollectionFilter === col
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-white/10 text-stone-300 hover:bg-white/20'
                          }`}
                        >
                          {COLLECTION_DISPLAY_NAMES[col] || col} ({productCountsByCollection[col] || 0})
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                        <input
                          type="text"
                          placeholder="Поиск товара..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-white/15 bg-white/5 focus:outline-none focus:border-amber-400 text-white font-sans"
                        />
                      </div>

                      <button
                        onClick={handleCreateNew}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-sans font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Добавить вкус</span>
                      </button>
                    </div>
                  </div>

                  {/* Products List */}
                  <div className="space-y-3">
                    {filteredProducts.map((prod) => {
                      const isArchived = archivedCollections[prod.category as CollectionName];
                      return (
                        <div
                          key={prod.id}
                          className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4"
                        >
                          <div className="relative shrink-0">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-14 h-14 rounded-xl object-cover border border-white/10"
                            />
                            {isArchived && (
                              <span className="absolute -top-2 -left-2 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border border-rose-400">
                                Архив
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-sans text-base font-extrabold truncate">
                                {prod.name}
                              </h4>
                              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-md bg-white/10 font-bold border border-white/10 text-amber-400">
                                {prod.category}
                              </span>
                            </div>
                            <p className="text-xs opacity-70 truncate font-sans">{prod.description}</p>
                            <div className="text-xs font-mono text-amber-400 mt-1">
                              Базовая цена: {prod.basePrice} ₽
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setEditingProduct(prod)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6.3: ПРОИЗВОДСТВО (PRODUCTION) */}
              {mainTab === 'production' && (
                <div className="space-y-6">
                  {/* Sub-tabs for Production: "Сводка" | "Рецепты" | "Аромы" */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <button
                      onClick={() => setProdSubTab('summary')}
                      className={`px-4 py-2 rounded-xl text-xs font-sans font-extrabold cursor-pointer transition-all ${
                        prodSubTab === 'summary'
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-white/5 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 inline mr-1.5" />
                      Сводка (Pivot Matrix)
                    </button>

                    <button
                      onClick={() => setProdSubTab('recipes')}
                      className={`px-4 py-2 rounded-xl text-xs font-sans font-extrabold cursor-pointer transition-all ${
                        prodSubTab === 'recipes'
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-white/5 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                      Рецепты
                    </button>

                    <button
                      onClick={() => setProdSubTab('aromas')}
                      className={`px-4 py-2 rounded-xl text-xs font-sans font-extrabold cursor-pointer transition-all ${
                        prodSubTab === 'aromas'
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-white/5 text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      <Droplets className="w-3.5 h-3.5 inline mr-1.5" />
                      Аромы
                    </button>
                  </div>

                  {/* SUB-TAB 6.3.1: СВОДКА (DYNAMIC PIVOT TABLE MATRIX) */}
                  {prodSubTab === 'summary' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div>
                          <h3 className="text-base font-sans font-extrabold text-white">
                            Сводный рассчет объёмов и крепостей по заказам
                          </h3>
                          <p className="text-xs text-stone-300 mt-0.5">
                            Нажмите на название вкуса, чтобы переключить Режим Фокуса (Focus Mode).
                          </p>
                        </div>

                        {focusedFlavorName && (
                          <button
                            onClick={() => setFocusedFlavorName(null)}
                            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <X className="w-4 h-4" />
                            <span>Сбросить фокус ({focusedFlavorName})</span>
                          </button>
                        )}
                      </div>

                      {/* Render Unified Matrix for ALL Collections, then isolated per Collection */}
                      {[
                        { title: 'Единая Сводка (Все коллекции)', colFilter: 'All' },
                        ...ALL_COLLECTIONS.map((c) => ({ title: `Коллекция: ${c}`, colFilter: c })),
                      ].map(({ title, colFilter }) => {
                        const colProducts = products.filter(
                          (p) => colFilter === 'All' || p.category === colFilter
                        );
                        const displayedProducts = focusedFlavorName
                          ? colProducts.filter((p) => p.name === focusedFlavorName)
                          : colProducts;

                        if (displayedProducts.length === 0) return null;

                        return (
                          <div key={title} className="space-y-3">
                            <h4 className="text-sm font-sans font-extrabold text-amber-300 tracking-tight">
                              {title}
                            </h4>

                            <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/40">
                              <table className="w-full text-left border-collapse text-xs font-sans">
                                <thead>
                                  <tr className="border-b border-white/20 bg-white/10 text-stone-200">
                                    <th className="p-3 font-extrabold">Вкус</th>
                                    {VOLUMES.map((vol) => (
                                      <th key={vol} colSpan={NICOTINES.length} className="p-3 text-center border-l border-white/15 font-extrabold">
                                        {vol}
                                      </th>
                                    ))}
                                    <th className="p-3 text-center border-l border-white/15 font-extrabold">
                                      Всего шт.
                                    </th>
                                  </tr>
                                  <tr className="border-b border-white/15 bg-white/5 text-[11px] font-mono text-stone-300">
                                    <th className="p-2"></th>
                                    {VOLUMES.map((vol) =>
                                      NICOTINES.map((nic) => (
                                        <th key={`${vol}-${nic}`} className="p-2 text-center border-l border-white/10">
                                          {nic}
                                        </th>
                                      ))
                                    )}
                                    <th className="p-2 border-l border-white/15 text-center">Итого</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {displayedProducts.map((prod) => {
                                    const totalForFlavor = getFlavorTotalBottles(prod.name, ordersHistory);
                                    const isFocused = focusedFlavorName === prod.name;

                                    return (
                                      <tr
                                        key={prod.id}
                                        onClick={() =>
                                          setFocusedFlavorName(isFocused ? null : prod.name)
                                        }
                                        className={`border-b border-white/10 transition-colors cursor-pointer ${
                                          isFocused
                                            ? 'bg-amber-400/20'
                                            : 'hover:bg-white/5'
                                        }`}
                                      >
                                        <td className="p-3 font-extrabold text-white flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                          <span>{prod.name}</span>
                                        </td>

                                        {VOLUMES.map((vol) =>
                                          NICOTINES.map((nic) => {
                                            const count = getRequiredCount(prod.name, vol, nic, ordersHistory);
                                            const hasValue = count > 0;
                                            return (
                                              <td
                                                key={`${vol}-${nic}`}
                                                className={`p-2.5 text-center font-bold border-l border-white/10 font-mono text-xs ${
                                                  hasValue
                                                    ? 'bg-emerald-500 text-white font-extrabold shadow-inner'
                                                    : 'text-stone-500 opacity-40'
                                                }`}
                                              >
                                                {count}
                                              </td>
                                            );
                                          })
                                        )}

                                        <td className="p-3 text-center border-l border-white/15 font-extrabold font-mono text-amber-400">
                                          {totalForFlavor}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SUB-TAB 6.3.2: РЕЦЕПТЫ (RECIPES EDITOR) */}
                  {prodSubTab === 'recipes' && (
                    <div className="space-y-6">
                      {/* Collection Segment Filter Tabs */}
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none p-3 rounded-2xl bg-black/30 border border-white/10">
                        <span className="text-xs font-sans font-extrabold text-stone-300 shrink-0 flex items-center gap-1.5 mr-1">
                          <Filter className="w-3.5 h-3.5 text-amber-400" />
                          Коллекция:
                        </span>
                        <button
                          onClick={() => setRecipeCollectionFilter('All')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold cursor-pointer whitespace-nowrap transition-colors ${
                            recipeCollectionFilter === 'All'
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-white/10 text-stone-300 hover:bg-white/20'
                          }`}
                        >
                          Все коллекции ({products.length})
                        </button>
                        {ALL_COLLECTIONS.map((col) => {
                          const count = products.filter((p) => p.category === col).length;
                          return (
                            <button
                              key={col}
                              onClick={() => setRecipeCollectionFilter(col)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold cursor-pointer whitespace-nowrap transition-colors ${
                                recipeCollectionFilter === col
                                  ? 'bg-amber-400 text-slate-950 shadow-md'
                                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
                              }`}
                            >
                              {COLLECTION_DISPLAY_NAMES[col] || col} ({count})
                            </button>
                          );
                        })}
                      </div>

                      {/* Product Selector Bar */}
                      <div className="p-4 rounded-2xl border border-white/15 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
                          <div className="w-full sm:w-auto">
                            <label className="block text-xs font-sans font-bold text-stone-300 mb-1">
                              Выберите вкус для редактирования рецепта:
                            </label>
                            <select
                              value={selectedRecipeProductId}
                              onChange={(e) => setSelectedRecipeProductId(e.target.value)}
                              className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-white/20 bg-slate-900 text-white font-sans text-xs font-bold focus:outline-none focus:border-amber-400"
                            >
                              {filteredRecipeProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({COLLECTION_DISPLAY_NAMES[p.category] || p.category})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Mode Switcher & Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <div className="bg-black/40 p-1 rounded-xl flex items-center gap-1 border border-white/10">
                            <button
                              onClick={() => setRecipeMode('table')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                recipeMode === 'table' ? 'bg-amber-400 text-slate-950' : 'text-stone-300 hover:text-white'
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Таблица
                            </button>
                            <button
                              onClick={() => {
                                setRecipeRawText(formatRecipeText(editingRecipeItems));
                                setRecipeMode('raw');
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                recipeMode === 'raw' ? 'bg-amber-400 text-slate-950' : 'text-stone-300 hover:text-white'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Текст / Вставка
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              let finalItems = editingRecipeItems;
                              if (recipeMode === 'raw') {
                                finalItems = parseRecipeText(recipeRawText);
                                setEditingRecipeItems(finalItems);
                              }
                              saveRecipe(selectedRecipeProductId, finalItems);
                              setRecipeNotice('Рецепт успешно сохранен в базе данных!');
                              setTimeout(() => setRecipeNotice(null), 2500);
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sans font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Save className="w-4 h-4" />
                            Сохранить рецепт
                          </button>
                        </div>
                      </div>

                      {recipeNotice && (
                        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{recipeNotice}</span>
                        </div>
                      )}

                      {/* Recipe Display / Edit Area */}
                      {recipeMode === 'table' ? (
                        <div className="space-y-4">
                          <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/40">
                            <table className="w-full text-left border-collapse text-xs font-sans">
                              <thead>
                                <tr className="border-b border-white/20 bg-white/10 text-stone-200">
                                  <th className="p-3 font-extrabold">Производитель (Vendor)</th>
                                  <th className="p-3 font-extrabold">Название ароматизатора</th>
                                  <th className="p-3 font-extrabold text-center">мл на 100мл (%)</th>
                                  <th className="p-3 text-center font-extrabold">Действие</th>
                                </tr>
                              </thead>
                              <tbody>
                                {editingRecipeItems.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="p-8 text-center text-stone-400 font-sans font-semibold">
                                      Рецепт пока пуст. Нажмите &quot;Добавить компонент&quot; или переключитесь в текстовый режим.
                                    </td>
                                  </tr>
                                ) : (
                                  editingRecipeItems.map((item, idx) => (
                                    <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                      <td className="p-2.5">
                                        <input
                                          type="text"
                                          value={item.vendor}
                                          onChange={(e) => {
                                            const next = [...editingRecipeItems];
                                            next[idx].vendor = e.target.value;
                                            setEditingRecipeItems(next);
                                          }}
                                          className="w-24 px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 uppercase"
                                        />
                                      </td>
                                      <td className="p-2.5">
                                        <input
                                          type="text"
                                          value={item.name}
                                          onChange={(e) => {
                                            const next = [...editingRecipeItems];
                                            next[idx].name = e.target.value;
                                            setEditingRecipeItems(next);
                                          }}
                                          className="w-full px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                                        />
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <input
                                          type="number"
                                          step="0.1"
                                          value={item.mlPer100ml}
                                          onChange={(e) => {
                                            const next = [...editingRecipeItems];
                                            next[idx].mlPer100ml = parseFloat(e.target.value) || 0;
                                            setEditingRecipeItems(next);
                                          }}
                                          className="w-24 px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 text-xs font-mono font-bold text-amber-400 text-center focus:outline-none focus:border-amber-400"
                                        />
                                      </td>
                                      <td className="p-2.5 text-center">
                                        <button
                                          onClick={() => {
                                            const next = editingRecipeItems.filter((_, i) => i !== idx);
                                            setEditingRecipeItems(next);
                                          }}
                                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>

                          <button
                            onClick={() => {
                              setEditingRecipeItems([
                                ...editingRecipeItems,
                                { vendor: 'CAP', name: 'New Flavor', mlPer100ml: 1 },
                              ]);
                            }}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 font-sans font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Plus className="w-4 h-4 text-amber-400" />
                            Добавить компонент
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-stone-300 font-sans">
                            Вставьте рецепт списком (автоматически распознаются типы опечаток, слипшиеся вендоры и десятичные запятые):
                          </p>
                          <textarea
                            rows={10}
                            value={recipeRawText}
                            onChange={(e) => {
                              setRecipeRawText(e.target.value);
                              const parsed = parseRecipeText(e.target.value);
                              setEditingRecipeItems(parsed);
                            }}
                            placeholder={`CAP Grapefruit 4\nCAPJuicy Orange 5\nCAP Sweet Guava 7\nCAP Sweet Tangerine2\nFA Blood Orange 2\nFA Passion (passionfruit) 2,5\nTPA Dragonfruit 0,5\nCAPSuper Sweet 0,5`}
                            className="w-full p-4 rounded-2xl border border-white/15 bg-black/60 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-400 leading-relaxed"
                          />
                          <p className="text-[11px] text-stone-400 font-mono">
                            Распознано компонентов: <span className="text-amber-400 font-bold">{editingRecipeItems.length}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-TAB 6.3.3: АРОМЫ (CONSOLIDATED FLAVORINGS & COST CALCULATOR) */}
                  {prodSubTab === 'aromas' && (
                    <div className="space-y-6">
                      {/* Summary Metrics Banner */}
                      {(() => {
                        // Calculate total required flavorings across all user orders with normalized keys
                        const flavorMap = new Map<string, { vendor: string; name: string; totalMl: number; key: string }>();

                        for (const order of ordersHistory) {
                          for (const item of order.items) {
                            const volMl = parseInt(item.volume.replace('ml', ''), 10) || 30;
                            const totalLiquidMl = volMl * item.quantity;
                            const recipe = recipes.find((r) => r.productId === item.product.id);

                            if (recipe && recipe.items) {
                              for (const comp of recipe.items) {
                                const cleanVendor = comp.vendor.trim().toUpperCase();
                                const cleanName = comp.name.trim().replace(/\s+/g, ' ');
                                const canonicalKey = `${cleanVendor}_${cleanName.toLowerCase()}`;
                                const compMl = totalLiquidMl * (comp.mlPer100ml / 100);

                                if (flavorMap.has(canonicalKey)) {
                                  const existing = flavorMap.get(canonicalKey)!;
                                  existing.totalMl += compMl;
                                } else {
                                  flavorMap.set(canonicalKey, {
                                    key: canonicalKey,
                                    vendor: cleanVendor,
                                    name: cleanName,
                                    totalMl: compMl,
                                  });
                                }
                              }
                            }
                          }
                        }

                        const aggregatedList = Array.from(flavorMap.values()).sort((a, b) =>
                          a.vendor.localeCompare(b.vendor) || a.name.localeCompare(b.name)
                        );

                        // Calculate totals
                        let totalMlSum = 0;
                        let totalCostSum = 0;

                        aggregatedList.forEach((item) => {
                          totalMlSum += item.totalMl;
                          const key1 = `${item.vendor}:${item.name.toLowerCase()}`;
                          const key2 = `${item.vendor}_${item.name.toLowerCase()}`;
                          const priceRecord = flavorPrices.find((fp) => fp.key === key1 || fp.key === key2);
                          const pricePer10ml = priceRecord ? priceRecord.pricePer10ml : 100;
                          const cost = (item.totalMl / 10) * pricePer10ml;
                          totalCostSum += cost;
                        });

                        const formattedVolume =
                          totalMlSum >= 1000
                            ? `${(totalMlSum / 1000).toFixed(2)} л (${totalMlSum.toFixed(0)} мл)`
                            : `${totalMlSum.toFixed(1)} мл`;

                        return (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-sans uppercase font-extrabold text-stone-400 tracking-wider">
                                    Уникальных ароматизаторов к заказу
                                  </p>
                                  <h3 className="text-3xl font-extrabold font-sans text-amber-400 mt-1">
                                    {aggregatedList.length}
                                  </h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                  <Droplets className="w-6 h-6" />
                                </div>
                              </div>

                              <div className="p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-sans uppercase font-extrabold text-stone-400 tracking-wider">
                                    Общий объем концентратов к заказу
                                  </p>
                                  <h3 className="text-3xl font-extrabold font-sans text-emerald-400 mt-1">
                                    {formattedVolume}
                                  </h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                                  <Package className="w-6 h-6" />
                                </div>
                              </div>

                              <div className="p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-sans uppercase font-extrabold text-stone-400 tracking-wider">
                                    Примерная стоимость закупки
                                  </p>
                                  <h3 className="text-3xl font-extrabold font-sans text-amber-400 mt-1">
                                    {Math.round(totalCostSum)} ₽
                                  </h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                                  <DollarSign className="w-6 h-6" />
                                </div>
                              </div>
                            </div>

                            {/* Aggregated Flavorings Procurement Table */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-sans font-extrabold text-white">
                                  Сводный список ароматизаторов по всем заказам
                                </h4>
                                <span className="text-xs text-stone-400 font-mono">
                                  Цены сохраняются в БД автоматически (за 10мл)
                                </span>
                              </div>

                              <div className="overflow-x-auto rounded-2xl border border-white/15 bg-black/40">
                                <table className="w-full text-left border-collapse text-xs font-sans">
                                  <thead>
                                    <tr className="border-b border-white/20 bg-white/10 text-stone-200">
                                      <th className="p-3 font-extrabold">Вендор (Vendor)</th>
                                      <th className="p-3 font-extrabold">Ароматизатор</th>
                                      <th className="p-3 text-center font-extrabold">Потребность (мл)</th>
                                      <th className="p-3 text-center font-extrabold">Цена за 10мл (₽)</th>
                                      <th className="p-3 text-right font-extrabold">Итого закупка (₽)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {aggregatedList.length === 0 ? (
                                      <tr>
                                        <td colSpan={5} className="p-8 text-center text-stone-400 font-sans font-semibold">
                                          Заказы отсутствуют или рецепты не заданы.
                                        </td>
                                      </tr>
                                    ) : (
                                      aggregatedList.map((item) => {
                                        const key1 = `${item.vendor}:${item.name.toLowerCase()}`;
                                        const key2 = `${item.vendor}_${item.name.toLowerCase()}`;
                                        const priceRecord = flavorPrices.find((fp) => fp.key === key1 || fp.key === key2);
                                        const pricePer10ml = priceRecord ? priceRecord.pricePer10ml : 100;
                                        const cost = (item.totalMl / 10) * pricePer10ml;

                                        return (
                                          <tr key={item.key} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-mono font-bold text-amber-300">
                                              {item.vendor}
                                            </td>
                                            <td className="p-3 font-bold text-white">
                                              {item.name}
                                            </td>
                                            <td className="p-3 text-center font-mono font-extrabold text-emerald-400">
                                              {item.totalMl.toFixed(1)} мл
                                            </td>
                                            <td className="p-3 text-center">
                                              <input
                                                type="number"
                                                step="5"
                                                value={pricePer10ml}
                                                onChange={(e) => {
                                                  const val = parseFloat(e.target.value) || 0;
                                                  saveFlavorPrice(item.vendor, item.name, val);
                                                }}
                                                className="w-24 px-2.5 py-1.5 rounded-lg border border-white/15 bg-white/5 font-mono text-xs text-amber-400 text-center font-bold focus:outline-none focus:border-amber-400"
                                              />
                                            </td>
                                            <td className="p-3 text-right font-mono font-extrabold text-amber-400">
                                              {Math.round(cost)} ₽
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: МЕДИА & GIT SYNC */}
              {mainTab === 'media' && (
                <div className="space-y-8 max-w-2xl">
                  {/* Videos */}
                  <form onSubmit={handleSaveVideos} className="space-y-4">
                    <div>
                      <h3 className="font-sans text-lg font-extrabold text-white">Видео фоны коллекций</h3>
                    </div>

                    {videoSaveNotice && (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Видео фоны коллекций обновлены!</span>
                      </div>
                    )}

                    {ALL_COLLECTIONS.map((col) => (
                      <div key={col} className="space-y-1">
                        <label className="block text-xs font-sans font-bold text-amber-300 uppercase">
                          {col} URL:
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
                          className="w-full px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-xs font-mono focus:outline-none focus:border-amber-400 text-white"
                        />
                      </div>
                    ))}

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-sans font-extrabold text-xs cursor-pointer shadow-md"
                    >
                      Сохранить видео фоны
                    </button>
                  </form>

                  {/* Audio & Git Sync */}
                  <form onSubmit={handleSaveAudio} className="space-y-4 pt-4 border-t border-white/10">
                    <div>
                      <h3 className="font-sans text-lg font-extrabold text-white flex items-center gap-2">
                        <span>Аудио фоны & Git Sync</span>
                        <GitBranch className="w-5 h-5 text-amber-400" />
                      </h3>
                    </div>

                    {audioSaveNotice && (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Настройки аудио обновлены!</span>
                      </div>
                    )}

                    {gitSyncNotice && (
                      <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
                        <GitBranch className="w-4 h-4 shrink-0" />
                        <span>{gitSyncNotice}</span>
                      </div>
                    )}

                    <div className="p-4 rounded-xl border border-white/15 bg-white/[0.03] space-y-3">
                      <label className="block text-xs font-sans font-extrabold uppercase text-amber-300">
                        Dark Theme Audio File:
                      </label>
                      <input
                        type="text"
                        required
                        value={tempDarkMusic}
                        onChange={(e) => setTempDarkMusic(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-xs font-mono focus:outline-none focus:border-amber-400 text-white"
                      />
                      <div className="flex items-center gap-3">
                        <input
                          ref={darkAudioInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileUpload(e, 'dark')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingAudio}
                          onClick={() => darkAudioInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs font-sans font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Загрузить и скоммитить в Git</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-white/15 bg-white/[0.03] space-y-3">
                      <label className="block text-xs font-sans font-extrabold uppercase text-amber-300">
                        Light Theme Audio File:
                      </label>
                      <input
                        type="text"
                        required
                        value={tempLightMusic}
                        onChange={(e) => setTempLightMusic(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-xs font-mono focus:outline-none focus:border-amber-400 text-white"
                      />
                      <div className="flex items-center gap-3">
                        <input
                          ref={lightAudioInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioFileUpload(e, 'light')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingAudio}
                          onClick={() => lightAudioInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs font-sans font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Загрузить и скоммитить в Git</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-sans font-extrabold text-xs cursor-pointer shadow-md"
                    >
                      Сохранить аудио настройки
                    </button>
                  </form>
                </div>
              )}

            </div>

            {/* Modal: Order Details Inspection Modal */}
            {inspectedOrder && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div
                  className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 border shadow-2xl ${
                    isDark ? 'bg-slate-950 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="font-sans text-xl font-extrabold">
                        Детали заказа #{inspectedOrder.orderId}
                      </h3>
                      <p className="text-xs text-stone-400 font-mono mt-0.5">
                        Пользователь: {inspectedOrder.user?.telegram} ({inspectedOrder.user?.name})
                      </p>
                    </div>
                    <button
                      onClick={() => setInspectedOrder(null)}
                      className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    <h4 className="text-xs font-sans font-extrabold uppercase text-amber-400 tracking-wider">
                      Состав заказа:
                    </h4>

                    {inspectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10"
                          />
                          <div>
                            <div className="font-sans font-extrabold text-sm text-white">
                              {item.product.name}
                            </div>
                            <div className="text-xs font-mono text-stone-300">
                              Объём: <span className="text-amber-300 font-bold">{item.volume}</span> •
                              Никотин: <span className="text-amber-300 font-bold">{item.nicotine}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-mono text-stone-400">
                            x{item.quantity} шт.
                          </div>
                          <div className="text-sm font-extrabold font-mono text-amber-400">
                            {item.totalUnitPrice * item.quantity} ₽
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-sans uppercase text-stone-400 font-bold">Итого:</span>
                      <div className="text-2xl font-extrabold font-mono text-amber-400">
                        {inspectedOrder.subtotal} ₽
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectedOrder(null)}
                      className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-sans font-extrabold text-xs cursor-pointer shadow-md"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Edit Product Form */}
            {editingProduct && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <div
                  className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl ${
                    isDark ? 'bg-slate-950 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-sans text-xl font-extrabold">Редактирование: {editingProduct.name}</h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block font-bold opacity-80 mb-1">Название вкуса</label>
                      <input
                        type="text"
                        required
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 focus:outline-none focus:border-amber-500 font-bold text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold opacity-80 mb-1">Коллекция</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            category: e.target.value as CollectionName,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-slate-900 focus:outline-none focus:border-amber-500 text-xs font-bold text-white"
                      >
                        {ALL_COLLECTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/15 bg-white/[0.03] space-y-3">
                      <label className="block font-bold text-xs uppercase tracking-wider">
                        Загрузка фотографии карточки
                      </label>

                      <div className="flex items-center gap-4">
                        {editingProduct.image && (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 shrink-0 bg-black/20 shadow-md">
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
                            className="w-full py-2.5 px-4 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                          >
                            <Upload className="w-4 h-4 text-amber-500" />
                            <span>Загрузить фото с компьютера</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold opacity-80 mb-1">Описание</label>
                      <textarea
                        rows={3}
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, description: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 focus:outline-none focus:border-amber-500 text-xs font-medium text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold opacity-80 mb-1">Базовая цена (₽)</label>
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 focus:outline-none focus:border-amber-500 font-mono text-sm font-bold text-amber-400"
                      />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs tracking-wide shadow-lg shadow-amber-400/30 transition-all cursor-pointer active:scale-95"
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

import React, { useState, useEffect } from 'react';
import { Category, Product, Promotion, Order, Reservation, RestaurantConfig, OrderStatus, ReservationStatus } from '../types';
import {
  LayoutDashboard,
  FolderTree,
  Utensils,
  Percent,
  ClipboardList,
  CalendarCheck,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  MapPin,
  Clock,
  Smartphone,
  Eye,
  ArrowLeftRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Info,
  Users,
  Key,
  Share2,
  UserPlus,
  Copy,
  ExternalLink
} from 'lucide-react';

interface AdminPanelProps {
  categories: Category[];
  products: Product[];
  promotions: Promotion[];
  orders: Order[];
  reservations: Reservation[];
  config: RestaurantConfig;
  clients: Array<{ id: string; name: string; phone: string; registrationDate: string }>;
  adminPin: string;
  requireClientRegistration: boolean;
  onUpdateCategories: (cats: Category[]) => void;
  onUpdateProducts: (prods: Product[]) => void;
  onUpdatePromotions: (promos: Promotion[]) => void;
  onUpdateOrders: (ords: Order[]) => void;
  onUpdateReservations: (res: Reservation[]) => void;
  onUpdateConfig: (cfg: RestaurantConfig) => void;
  onUpdateSettings: (pin: string, requireReg: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories,
  products,
  promotions,
  orders,
  reservations,
  config,
  clients = [],
  adminPin,
  requireClientRegistration,
  onUpdateCategories,
  onUpdateProducts,
  onUpdatePromotions,
  onUpdateOrders,
  onUpdateReservations,
  onUpdateConfig,
  onUpdateSettings,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'categories' | 'products' | 'promotions' | 'orders' | 'reservations' | 'access' | 'config'>('dashboard');

  // Modal / Form trigger states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryOrder, setCategoryOrder] = useState<number>(1);
  const [categoryActive, setCategoryActive] = useState(true);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productAvailable, setProductAvailable] = useState(true);
  const [productFeatured, setProductFeatured] = useState(false);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promoName, setPromoName] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoOrigPrice, setPromoOrigPrice] = useState<number>(0);
  const [promoPriceValue, setPromoPriceValue] = useState<number>(0);
  const [promoImage, setPromoImage] = useState('');
  const [promoStart, setPromoStart] = useState('');
  const [promoEnd, setPromoEnd] = useState('');
  const [promoActive, setPromoActive] = useState(true);
  const [promoSelectedProds, setPromoSelectedProds] = useState<string[]>([]);

  // Config Local Edit Form State
  const [editConfig, setEditConfig] = useState<RestaurantConfig>({ ...config });
  const [configSuccess, setConfigSuccess] = useState(false);

  useEffect(() => {
    setEditConfig({ ...config });
  }, [config]);

  // Security & Access control state
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [localAdminPin, setLocalAdminPin] = useState(adminPin || '1234');
  const [localRequireReg, setLocalRequireReg] = useState(requireClientRegistration || false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  // Stats Helper Calculations
  const stats = {
    totalProducts: products.length,
    availableProducts: products.filter(p => p.available).length,
    activePromos: promotions.filter(p => p.active).length,
    receivedOrders: orders.length,
    receivedReservations: reservations.length,
    todayReservations: reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
  };

  // Helper: check overload of tables on a specific date & time slot
  // Returns count of active (Pendiente / Confirmada) reservations
  const getSlotReservationCount = (dateStr: string, timeStr: string) => {
    return reservations.filter(
      res => res.date === dateStr &&
             res.time.substring(0, 2) === timeStr.substring(0, 2) &&
             ['Pendiente', 'Confirmada'].includes(res.status)
    ).length;
  };

  // CATEGORIES ACTIONS
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      // Edit existing
      const updated = categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryName, order: Number(categoryOrder), active: categoryActive }
          : cat
      );
      onUpdateCategories(updated);
    } else {
      // Create new
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: categoryName,
        order: Number(categoryOrder),
        active: categoryActive
      };
      onUpdateCategories([...categories, newCat]);
    }
    handleCloseCategoryModal();
  };

  const handleEditCategoryClick = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryOrder(cat.order);
    setCategoryActive(cat.active);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría? Se desvinculará de los productos correspondientes.')) {
      onUpdateCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryOrder(1);
    setCategoryActive(true);
  };

  // PRODUCTS ACTIONS
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !productCategory) return;

    const imgUrl = productImage.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop';

    if (editingProduct) {
      const updated = products.map(prod =>
        prod.id === editingProduct.id
          ? {
              ...prod,
              name: productName,
              description: productDesc,
              price: Number(productPrice),
              categoryId: productCategory,
              image: imgUrl,
              available: productAvailable,
              featured: productFeatured,
            }
          : prod
      );
      onUpdateProducts(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: productName,
        description: productDesc,
        price: Number(productPrice),
        categoryId: productCategory,
        image: imgUrl,
        available: productAvailable,
        featured: productFeatured,
      };
      onUpdateProducts([...products, newProd]);
    }
    handleCloseProductModal();
  };

  const handleEditProductClick = (prod: Product) => {
    setEditingProduct(prod);
    setProductName(prod.name);
    setProductDesc(prod.description);
    setProductPrice(prod.price);
    setProductCategory(prod.categoryId);
    setProductImage(prod.image);
    setProductAvailable(prod.available);
    setProductFeatured(prod.featured);
    setShowProductModal(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto de la carta?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductName('');
    setProductDesc('');
    setProductPrice(0);
    setProductCategory(categories[0]?.id || '');
    setProductImage('');
    setProductAvailable(true);
    setProductFeatured(false);
  };

  // PROMOTIONS ACTIONS
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoName.trim()) return;

    const imgUrl = promoImage.trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop';

    if (editingPromo) {
      const updated = promotions.map(p =>
        p.id === editingPromo.id
          ? {
              ...p,
              name: promoName,
              description: promoDesc,
              originalPrice: Number(promoOrigPrice),
              promoPrice: Number(promoPriceValue),
              image: imgUrl,
              startDate: promoStart,
              endDate: promoEnd,
              active: promoActive,
              productIds: promoSelectedProds,
            }
          : p
      );
      onUpdatePromotions(updated);
    } else {
      const newP: Promotion = {
        id: `promo-${Date.now()}`,
        name: promoName,
        description: promoDesc,
        originalPrice: Number(promoOrigPrice),
        promoPrice: Number(promoPriceValue),
        image: imgUrl,
        startDate: promoStart,
        endDate: promoEnd,
        active: promoActive,
        productIds: promoSelectedProds,
      };
      onUpdatePromotions([...promotions, newP]);
    }
    handleClosePromoModal();
  };

  const handleEditPromoClick = (p: Promotion) => {
    setEditingPromo(p);
    setPromoName(p.name);
    setPromoDesc(p.description);
    setPromoOrigPrice(p.originalPrice);
    setPromoPriceValue(p.promoPrice);
    setPromoImage(p.image);
    setPromoStart(p.startDate);
    setPromoEnd(p.endDate);
    setPromoActive(p.active);
    setPromoSelectedProds(p.productIds);
    setShowPromoModal(true);
  };

  const handleDeletePromo = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta promoción?')) {
      onUpdatePromotions(promotions.filter(p => p.id !== id));
    }
  };

  const handleTogglePromoProd = (id: string) => {
    if (promoSelectedProds.includes(id)) {
      setPromoSelectedProds(promoSelectedProds.filter(x => x !== id));
    } else {
      setPromoSelectedProds([...promoSelectedProds, id]);
    }
  };

  const handleClosePromoModal = () => {
    setShowPromoModal(false);
    setEditingPromo(null);
    setPromoName('');
    setPromoDesc('');
    setPromoOrigPrice(0);
    setPromoPriceValue(0);
    setPromoImage('');
    setPromoStart('');
    setPromoEnd('');
    setPromoActive(true);
    setPromoSelectedProds([]);
  };

  // ORDERS TRANSITIONS
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map(ord =>
      ord.id === orderId ? { ...ord, status: newStatus } : ord
    );
    onUpdateOrders(updated);
  };

  // RESERVATIONS STATE & TABLE ASSIGNMENTS
  const handleResStatusChange = (resId: string, newStatus: ReservationStatus) => {
    const updated = reservations.map(r =>
      r.id === resId ? { ...r, status: newStatus } : r
    );
    onUpdateReservations(updated);
  };

  const handleResTableAssign = (resId: string, tableName: string) => {
    const updated = reservations.map(r =>
      r.id === resId ? { ...r, tableAssigned: tableName } : r
    );
    onUpdateReservations(updated);
  };

  // CONFIG ACTIONS
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(editConfig);
    setConfigSuccess(true);
    setTimeout(() => setConfigSuccess(false), 3000);
  };

  // Handle local config changes
  const updateConfigField = (field: keyof RestaurantConfig, val: any) => {
    setEditConfig(prev => ({ ...prev, [field]: val }));
  };

  // Image Upload base64 Simulator helper
  const handleImageUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'promo' | 'logo' | 'hero') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (target === 'product') setProductImage(base64String);
        else if (target === 'promo') setPromoImage(base64String);
        else if (target === 'logo') updateConfigField('logo', base64String);
        else if (target === 'hero') updateConfigField('heroImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row pb-12">
      {/* LEFT ADMIN SIDEBAR PANEL */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-200 flex flex-col shrink-0 border-r border-stone-800">
        <div className="p-6 border-b border-stone-800 flex items-center gap-3 bg-stone-950/40">
          <div className="p-2 bg-brand-red rounded-lg text-white font-serif font-black text-lg">EC</div>
          <div>
            <h2 className="font-serif font-bold text-sm tracking-tight text-white">{config.name}</h2>
            <span className="text-[10px] uppercase text-stone-400 tracking-wider font-semibold">Panel de Control</span>
          </div>
        </div>

        {/* Navigation Sidebar Link list */}
        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeSubTab === 'dashboard' ? 'bg-brand-red text-white shadow-md shadow-brand-red/10' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Resumen General
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeSubTab === 'categories' ? 'bg-brand-red text-white shadow-md shadow-brand-red/10' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <FolderTree className="w-4 h-4" /> Categorías de Menú
          </button>

          <button
            onClick={() => setActiveSubTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeSubTab === 'products' ? 'bg-brand-red text-white shadow-md shadow-brand-red/10' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <Utensils className="w-4 h-4" /> Platos de la Carta
          </button>

          <button
            onClick={() => setActiveSubTab('promotions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeSubTab === 'promotions' ? 'bg-brand-red text-white shadow-md shadow-brand-red/10' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <Percent className="w-4 h-4" /> Promociones Activas
          </button>

          <button
            id="admin-orders-tab"
            onClick={() => setActiveSubTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all relative ${
              activeSubTab === 'orders' ? 'bg-brand-red text-white shadow-md shadow-brand-red/10' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Pedidos Recibidos
            {orders.filter(o => o.status === 'Nuevo').length > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-brand-red text-white text-[9px] font-black rounded-full animate-bounce">
                {orders.filter(o => o.status === 'Nuevo').length}
              </span>
            )}
          </button>

          <button
            id="admin-reservations-tab"
            onClick={() => setActiveSubTab('reservations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all relative ${
              activeSubTab === 'reservations' ? 'bg-brand-red text-white shadow-md shadow-brand-red/10' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4" /> Registro de Reservas
            {reservations.filter(r => r.status === 'Pendiente').length > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-amber-500 text-stone-900 text-[9px] font-black rounded-full">
                {reservations.filter(r => r.status === 'Pendiente').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('access')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeSubTab === 'access' ? 'bg-brand-red text-white shadow-md shadow-brand-red/10' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <Key className="w-4 h-4" /> Acceso de Clientes
          </button>

          <button
            onClick={() => setActiveSubTab('config')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeSubTab === 'config' ? 'bg-brand-red text-white shadow-md shadow-brand-red/10' : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" /> Configuración Local
          </button>
        </nav>

        {/* Security / Role disclaimer footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 text-stone-500 text-[10px] space-y-1 leading-relaxed">
          <p className="font-bold flex items-center gap-1 text-stone-400">🛡️ Zona Administrativa Protegida</p>
          <p>Esta terminal simula el backend corporativo de "El Chuquisaqueño" para gestionar productos y pedidos interactivos.</p>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN DASHBOARD WORKSPACE */}
      <main className="flex-1 p-6 md:p-8 space-y-6">
        
        {/* Workspace Top header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">ADMINISTRACIÓN</span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 capitalize">
              {activeSubTab === 'dashboard' ? 'Panel de Control Principal' : `Gestión de ${activeSubTab}`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-stone-200 text-stone-700 text-[10px] font-mono">ESTADO: DEMO CONECTADA</span>
          </div>
        </div>

        {/* SUBTAB 1: DASHBOARD */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI statistics cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block">Platos Registrados</span>
                <p className="text-2xl font-black text-stone-950">{stats.totalProducts}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block">Disponibles hoy</span>
                <p className="text-2xl font-black text-green-600">{stats.availableProducts}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block">Promos Activas</span>
                <p className="text-2xl font-black text-amber-500">{stats.activePromos}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block">Pedidos Recibidos</span>
                <p className="text-2xl font-black text-brand-red">{stats.receivedOrders}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block">Reservas Totales</span>
                <p className="text-2xl font-black text-stone-900">{stats.receivedReservations}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-1">
                <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block">Reservas para hoy</span>
                <p className="text-2xl font-black text-blue-600">{stats.todayReservations}</p>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-lg text-stone-950 flex items-center gap-2"><Sparkles className="w-5 h-5 text-brand-red" /> Accesos Directos Administrativos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => { setActiveSubTab('products'); setShowProductModal(true); }}
                  className="p-4 rounded-xl border border-dashed border-stone-300 hover:border-brand-red hover:bg-brand-red-light/10 text-left transition-all group"
                >
                  <h4 className="font-bold text-xs text-stone-900 group-hover:text-brand-red">➕ Agregar Plato a la Carta</h4>
                  <p className="text-[10px] text-stone-500 mt-1">Sube foto, define precio y asócialo a categorías.</p>
                </button>

                <button
                  onClick={() => { setActiveSubTab('promotions'); setShowPromoModal(true); }}
                  className="p-4 rounded-xl border border-dashed border-stone-300 hover:border-brand-red hover:bg-brand-red-light/10 text-left transition-all group"
                >
                  <h4 className="font-bold text-xs text-stone-900 group-hover:text-brand-red">➕ Crear Nueva Promoción</h4>
                  <p className="text-[10px] text-stone-500 mt-1">Arma combos tradicionales con precios reducidos y vigencia.</p>
                </button>

                <button
                  onClick={() => setActiveSubTab('reservations')}
                  className="p-4 rounded-xl border border-dashed border-stone-300 hover:border-brand-red hover:bg-brand-red-light/10 text-left transition-all group"
                >
                  <h4 className="font-bold text-xs text-stone-900 group-hover:text-brand-red">📋 Revisar Solicitudes de Mesa</h4>
                  <p className="text-[10px] text-stone-500 mt-1">Asigna las 6 mesas disponibles y administra estados.</p>
                </button>
              </div>
            </div>

            {/* Quick View Table of Today Reservations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-950">⏰ Reservas Próximas</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {reservations.map(res => (
                    <div key={res.id} className="p-3 bg-stone-50 rounded-xl border border-stone-150 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{res.clientName}</p>
                        <p className="text-stone-500 text-[10px]">{res.date} • {res.time} • {res.peopleCount} personas</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        res.status === 'Confirmada' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                      }`}>{res.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-stone-950">🚀 Pedidos Nuevos</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {orders.map(ord => (
                    <div key={ord.id} className="p-3 bg-stone-50 rounded-xl border border-stone-150 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{ord.clientName} ({ord.id})</p>
                        <p className="text-stone-500 text-[10px]">{ord.type === 'delivery' ? '🚀 Delivery' : '🛍️ Recojo'} • Total: Bs {ord.total}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-red text-white">{ord.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: CATEGORIES */}
        {activeSubTab === 'categories' && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-stone-950">Categorías de Menú</h3>
              <button
                onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                className="px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar Categoría
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Orden</th>
                    <th className="p-4 font-bold">Nombre</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {categories.sort((a,b)=>a.order - b.order).map(cat => (
                    <tr key={cat.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-bold text-stone-900">{cat.order}</td>
                      <td className="p-4 font-bold text-stone-900">{cat.name}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          cat.active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                        }`}>{cat.active ? 'Activa' : 'Inactiva'}</span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleEditCategoryClick(cat)}
                          className="p-1.5 text-stone-600 hover:text-brand-red rounded hover:bg-stone-100 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-stone-400 hover:text-brand-red rounded hover:bg-stone-100 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 3: PRODUCTS */}
        {activeSubTab === 'products' && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-stone-950">Platos de la Carta</h3>
              <button
                onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                className="px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar Plato
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Imagen</th>
                    <th className="p-4 font-bold">Plato</th>
                    <th className="p-4 font-bold">Categoría</th>
                    <th className="p-4 font-bold">Precio</th>
                    <th className="p-4 font-bold">Disponibilidad</th>
                    <th className="p-4 font-bold">Destacado</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map(prod => {
                    const cat = categories.find(c => c.id === prod.categoryId);
                    return (
                      <tr key={prod.id} className="hover:bg-stone-50/50">
                        <td className="p-4">
                          <img src={prod.image} alt={prod.name} className="w-12 h-12 object-cover rounded-xl bg-stone-100 border" />
                        </td>
                        <td className="p-4 space-y-0.5">
                          <p className="font-serif font-bold text-stone-900">{prod.name}</p>
                          <p className="text-stone-500 text-[10px] line-clamp-1 max-w-xs">{prod.description}</p>
                        </td>
                        <td className="p-4 text-stone-600 font-semibold">{cat ? cat.name : 'Desconocida'}</td>
                        <td className="p-4 font-bold text-stone-950">Bs {prod.price}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              const updated = products.map(p => p.id === prod.id ? { ...p, available: !p.available } : p);
                              onUpdateProducts(updated);
                            }}
                            className="text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                            title="Cambiar estado"
                          >
                            {prod.available ? (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-100 text-green-800 flex items-center gap-1 w-max">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Disponible
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-stone-200 text-stone-600 flex items-center gap-1 w-max">
                                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full"></span> Agotado
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              const updated = products.map(p => p.id === prod.id ? { ...p, featured: !p.featured } : p);
                              onUpdateProducts(updated);
                            }}
                            className="cursor-pointer"
                          >
                            {prod.featured ? (
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">★ Destacado</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-400 font-bold text-[10px]">No</span>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => handleEditProductClick(prod)}
                            className="p-1.5 text-stone-600 hover:text-brand-red rounded hover:bg-stone-100 transition-all cursor-pointer"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-stone-400 hover:text-brand-red rounded hover:bg-stone-100 transition-all cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 4: PROMOTIONS */}
        {activeSubTab === 'promotions' && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-stone-950">Promociones Activas</h3>
              <button
                onClick={() => { setEditingPromo(null); setShowPromoModal(true); }}
                className="px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar Promoción
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Imagen</th>
                    <th className="p-4 font-bold">Nombre</th>
                    <th className="p-4 font-bold">Precio Anterior</th>
                    <th className="p-4 font-bold">Precio Promo</th>
                    <th className="p-4 font-bold">Vigencia</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {promotions.map(promo => (
                    <tr key={promo.id} className="hover:bg-stone-50/50">
                      <td className="p-4">
                        <img src={promo.image} alt={promo.name} className="w-12 h-12 object-cover rounded-xl bg-stone-100 border" />
                      </td>
                      <td className="p-4 space-y-0.5">
                        <p className="font-serif font-bold text-stone-900">{promo.name}</p>
                        <p className="text-stone-500 text-[10px] line-clamp-1 max-w-xs">{promo.description}</p>
                      </td>
                      <td className="p-4 text-stone-400 line-through">Bs {promo.originalPrice}</td>
                      <td className="p-4 font-bold text-brand-red text-sm">Bs {promo.promoPrice}</td>
                      <td className="p-4 text-stone-600 font-semibold">{promo.startDate} al {promo.endDate}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          promo.active ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                        }`}>{promo.active ? 'Activa' : 'Inactiva'}</span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleEditPromoClick(promo)}
                          className="p-1.5 text-stone-600 hover:text-brand-red rounded hover:bg-stone-100 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo.id)}
                          className="p-1.5 text-stone-400 hover:text-brand-red rounded hover:bg-stone-100 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 5: ORDERS */}
        {activeSubTab === 'orders' && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 animate-fade-in">
            <h3 className="font-serif font-bold text-lg text-stone-950">Pedidos Recibidos</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">Cliente / Celular</th>
                    <th className="p-4 font-bold">Detalle Platos</th>
                    <th className="p-4 font-bold">Total</th>
                    <th className="p-4 font-bold">Modalidad / Pago</th>
                    <th className="p-4 font-bold">Fecha / Hora</th>
                    <th className="p-4 font-bold">Estado actual</th>
                    <th className="p-4 font-bold text-right">Cambiar Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map(ord => (
                    <tr key={ord.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-bold text-stone-950 whitespace-nowrap">{ord.id}</td>
                      <td className="p-4 space-y-0.5">
                        <p className="font-bold text-stone-900">{ord.clientName}</p>
                        <p className="text-stone-500 text-[10px]">{ord.phone}</p>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="space-y-1">
                          {ord.items.map((it, i) => (
                            <p key={i} className="text-[11px] text-stone-700">
                              • <strong className="text-stone-950">{it.quantity}x</strong> {it.name}
                              {it.observations && <span className="text-stone-400 block text-[9px] italic">"{it.observations}"</span>}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-stone-900">Bs {ord.total}</td>
                      <td className="p-4 space-y-0.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          ord.type === 'delivery' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>{ord.type === 'delivery' ? '🚀 Delivery' : '🛍️ Recojo'}</span>
                        <p className="text-stone-500 text-[10px] capitalize">{ord.paymentMethod === 'qr' ? '📲 QR WhatsApp' : '💵 Efectivo'}</p>
                      </td>
                      <td className="p-4 text-stone-500 text-[10px]">
                        <p>{ord.date}</p>
                        <p>{ord.time}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          ['Nuevo', 'Confirmado'].includes(ord.status) ? 'bg-brand-red text-white' :
                          ord.status === 'En preparación' ? 'bg-orange-100 text-orange-800' :
                          ['Listo', 'Listo para recoger'].includes(ord.status) ? 'bg-amber-100 text-amber-800' :
                          ord.status === 'En camino' ? 'bg-blue-100 text-blue-800' :
                          ord.status === 'Entregado' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'
                        }`}>{ord.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value as OrderStatus)}
                          className="px-2 py-1 bg-stone-50 border border-stone-200 text-stone-700 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-red"
                        >
                          <option value="Nuevo">Nuevo</option>
                          <option value="Confirmado">Confirmado</option>
                          <option value="En preparación">En preparación</option>
                          {ord.type === 'delivery' ? (
                            <>
                              <option value="Listo">Listo para enviar</option>
                              <option value="En camino">En camino</option>
                            </>
                          ) : (
                            <option value="Listo para recoger">Listo para recoger</option>
                          )}
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                          <option value="Rechazado">Rechazado</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB 6: RESERVATIONS */}
        {activeSubTab === 'reservations' && (
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-stone-950">Registro de Reservas</h3>
              <div className="text-xs text-stone-500 font-medium">
                ⚠️ <span className="font-bold text-brand-red">Mesa límite: 6 mesas.</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                    <th className="p-4 font-bold">Código</th>
                    <th className="p-4 font-bold">Cliente / Teléfono</th>
                    <th className="p-4 font-bold">Fecha / Hora</th>
                    <th className="p-4 font-bold">Personas</th>
                    <th className="p-4 font-bold">Mesa Asignada</th>
                    <th className="p-4 font-bold">Comentarios</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold">Capacidad Slot</th>
                    <th className="p-4 font-bold text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reservations.map(res => {
                    const slotCount = getSlotReservationCount(res.date, res.time);
                    const isOverbooked = slotCount > config.tablesCount;
                    return (
                      <tr key={res.id} className="hover:bg-stone-50/50">
                        <td className="p-4 font-bold text-stone-950">{res.id}</td>
                        <td className="p-4 space-y-0.5">
                          <p className="font-bold text-stone-900">{res.clientName}</p>
                          <p className="text-stone-500 text-[10px]">{res.phone}</p>
                        </td>
                        <td className="p-4 text-stone-600 font-semibold">{res.date} • {res.time}</td>
                        <td className="p-4 font-bold text-stone-900">{res.peopleCount} pers.</td>
                        <td className="p-4">
                          <select
                            value={res.tableAssigned}
                            onChange={(e) => handleResTableAssign(res.id, e.target.value)}
                            className="px-2 py-1 bg-stone-50 border border-stone-200 rounded text-xs font-semibold focus:outline-none"
                          >
                            <option value="Por asignar">Por asignar</option>
                            <option value="Mesa 1">Mesa 1</option>
                            <option value="Mesa 2">Mesa 2</option>
                            <option value="Mesa 3">Mesa 3</option>
                            <option value="Mesa 4">Mesa 4</option>
                            <option value="Mesa 5">Mesa 5</option>
                            <option value="Mesa 6">Mesa 6</option>
                          </select>
                        </td>
                        <td className="p-4 text-stone-500 max-w-xs truncate">{res.comments || 'Sin comentarios'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            res.status === 'Confirmada' ? 'bg-green-100 text-green-800' :
                            res.status === 'Pendiente' ? 'bg-amber-100 text-amber-800' :
                            res.status === 'Atendida' ? 'bg-stone-200 text-stone-600' : 'bg-red-100 text-red-800'
                          }`}>{res.status}</span>
                        </td>
                        <td className="p-4">
                          {isOverbooked ? (
                            <span className="text-brand-red font-bold flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4 shrink-0 animate-ping" /> ¡Exceso ({slotCount})!
                            </span>
                          ) : (
                            <span className="text-stone-500">{slotCount} de {config.tablesCount}</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <select
                            value={res.status}
                            onChange={(e) => handleResStatusChange(res.id, e.target.value as ReservationStatus)}
                            className="px-2 py-1 bg-stone-50 border border-stone-200 text-stone-700 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-red"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmada">Confirmada</option>
                            <option value="Atendida">Atendida</option>
                            <option value="Reprogramada">Reprogramada</option>
                            <option value="Cancelada">Cancelada</option>
                            <option value="Rechazada">Rechazada</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUBTAB: CLIENT ACCESS & SECURITY */}
        {activeSubTab === 'access' && (
          <div className="space-y-8 animate-fade-in text-xs">
            
            {/* Header info card */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-stone-200 p-6 rounded-2xl border border-stone-800 shadow-lg space-y-2">
              <h3 className="font-serif font-black text-xl text-white flex items-center gap-2">
                <Key className="w-6 h-6 text-brand-red shrink-0" />
                Control de Acceso y Enlaces en Tiempo Real
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed max-w-3xl">
                Al usar una base de datos centralizada, cualquier cambio en tu menú, platos, precios o promociones se actualizará automáticamente en los dispositivos de tus clientes. Usa este panel para configurar la seguridad de tu carta digital e invitar a tus comensales.
              </p>
            </div>

            {/* ENLACE GENERAL DE REGISTRO PARA CLIENTES */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-2xl shadow-sm space-y-4">
              {(() => {
                const base = editConfig.publicUrl || window.location.origin;
                const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
                const registerUrl = `${cleanBase}/registro`;

                return (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-serif font-black text-base text-stone-900">Enlace de registro para clientes</h4>
                        <p className="text-stone-600 text-xs leading-relaxed">
                          Comparte este enlace de registro público con tus clientes. Al ingresar, se registrarán autónomamente ingresando su nombre, correo electrónico y contraseña, y de esa manera verán todo tu menú e interactuarán **en tiempo real** con actualizaciones instantáneas de platos, precios y ofertas.
                        </p>
                      </div>
                    </div>

                    {/* ENLACE PÚBLICO CONFIGURABLE */}
                    <div className="bg-white p-4 rounded-xl border border-amber-200/60 space-y-3">
                      <div className="flex flex-col md:flex-row gap-2 items-end">
                        <div className="flex-1 space-y-1 w-full">
                          <label className="text-[10px] font-bold text-amber-800 uppercase block">🔗 Enlace Público / URL de tu Carta Digital:</label>
                          <input
                            type="url"
                            value={editConfig.publicUrl || ''}
                            onChange={(e) => updateConfigField('publicUrl', e.target.value)}
                            placeholder="Pega aquí el enlace de tu app (ej. el Enlace Compartido o de Desarrollo)"
                            className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs font-mono text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateConfig(editConfig);
                            alert('✓ ¡Enlace público del restaurante guardado y sincronizado correctamente!');
                          }}
                          className="w-full md:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-950 text-white font-bold rounded-lg text-xs cursor-pointer h-max transition-colors shrink-0"
                        >
                          Guardar Enlace
                        </button>
                      </div>

                      {(!editConfig.publicUrl || editConfig.publicUrl.includes('localhost') || editConfig.publicUrl.includes('127.0.0.1')) && (
                        <div className="text-[10px] text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100 leading-normal">
                          ⚠️ <strong>¡Atención!</strong> El enlace configurado está vacío o apunta a 'localhost'. Las invitaciones enviadas por WhatsApp no funcionarán desde los celulares de tus clientes. Por favor, <strong>pega arriba la URL pública de tu aplicación</strong> (por ejemplo, copia la dirección web actual de tu navegador o tu Enlace Compartido) y presiona "Guardar Enlace".
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block">Enlace de registro público a compartir:</span>
                      <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-xl border border-amber-200/60 w-full">
                        <div className="font-mono text-xs text-stone-700 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200 flex-1 w-full overflow-x-auto whitespace-nowrap">
                          {registerUrl}
                        </div>
                        <div className="flex gap-2 w-full md:w-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(registerUrl);
                              alert('✓ ¡Enlace de registro público copiado al portapapeles!');
                            }}
                            className="flex-1 md:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
                          >
                            <Copy className="w-4 h-4" /> Copiar Enlace
                          </button>

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `Estimado cliente, te invitamos a registrarte en la plataforma de *El Chuquisaqueño* para realizar tus pedidos y hacer seguimiento en tiempo real: ${registerUrl}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 md:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all text-xs"
                          >
                            <ExternalLink className="w-4 h-4" /> Compartir por WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Security Settings & Link Generator */}
              <div className="space-y-6">
                
                {/* 1. Security Config */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                  <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                    <Settings className="w-4 h-4 text-brand-red" /> Ajustes de Privacidad y Acceso
                  </h4>

                  {settingsSuccess && (
                    <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-xl font-bold">
                      ✓ Ajustes guardados y sincronizados correctamente en la base de datos.
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Toggle require registration */}
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-150">
                      <div className="space-y-0.5 max-w-[70%]">
                        <label className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                          🔒 Restringir acceso ("No es acceso libre")
                        </label>
                        <p className="text-[10px] text-stone-500 leading-normal">
                          Exige que los clientes se registren con su Nombre y Teléfono antes de poder visualizar la carta, a menos que ingresen con un enlace de invitación pre-autorizado.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLocalRequireReg(!localRequireReg)}
                        className="cursor-pointer transition-transform duration-200 hover:scale-105"
                      >
                        {localRequireReg ? (
                          <ToggleRight className="w-12 h-12 text-brand-red" />
                        ) : (
                          <ToggleLeft className="w-12 h-12 text-stone-300" />
                        )}
                      </button>
                    </div>

                    {/* PIN field */}
                    <div className="space-y-1 p-3 bg-stone-50 rounded-xl border border-stone-150">
                      <label className="font-bold text-stone-900 flex items-center gap-1 text-xs">
                        🔑 Contraseña / PIN de Acceso Administrador
                      </label>
                      <p className="text-[10px] text-stone-500 mb-2">
                        Código numérico requerido para ingresar a esta pantalla de administración.
                      </p>
                      <input
                        type="text"
                        maxLength={8}
                        value={localAdminPin}
                        onChange={(e) => setLocalAdminPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2 rounded-lg border border-stone-200 bg-white font-mono text-sm tracking-widest text-center"
                        placeholder="Ej. 1234"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSettings(localAdminPin, localRequireReg);
                        setSettingsSuccess(true);
                        setTimeout(() => setSettingsSuccess(false), 3000);
                      }}
                      className="w-full py-2.5 bg-stone-900 hover:bg-stone-950 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs"
                    >
                      Guardar Ajustes de Acceso
                    </button>
                  </div>
                </div>

                {/* 2. Invitation Generator */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                  <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-2">
                    <Share2 className="w-4 h-4 text-brand-red" /> Generador de Enlaces de Invitación
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Escribe los datos de tu cliente para generarle un **Enlace de Registro y Acceso Directo**. Al ingresar mediante este enlace, el sistema los identificará y les dará acceso inmediato, omitiendo pantallas de bloqueo.
                  </p>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-stone-700 font-bold block text-[10px] uppercase">Nombre del Cliente</label>
                        <input
                          type="text"
                          value={inviteName}
                          onChange={(e) => {
                            setInviteName(e.target.value);
                            setGeneratedLink('');
                          }}
                          placeholder="Ej. Carlos Siles"
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-stone-700 font-bold block text-[10px] uppercase">Teléfono / Celular</label>
                        <input
                          type="text"
                          value={invitePhone}
                          onChange={(e) => {
                            setInvitePhone(e.target.value.replace(/\D/g, ''));
                            setGeneratedLink('');
                          }}
                          placeholder="Ej. 71234567"
                          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50/50"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!inviteName.trim() || !invitePhone.trim()) {
                          alert('Por favor, ingresa el nombre y teléfono del cliente para generar su enlace de invitación.');
                          return;
                        }
                        const origin = editConfig.publicUrl || window.location.origin;
                        const link = `${origin}/?ref=invitado&name=${encodeURIComponent(inviteName.trim())}&phone=${encodeURIComponent(invitePhone.trim())}`;
                        setGeneratedLink(link);
                      }}
                      className="w-full py-2.5 bg-brand-red hover:bg-brand-red-dark text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-xs"
                    >
                      Generar Enlace de Registro
                    </button>

                    {generatedLink && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3 mt-3 animate-scale-up">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider block">¡Enlace Generado Exitosamente!</span>
                          <textarea
                            readOnly
                            value={generatedLink}
                            className="w-full p-2 text-[10px] font-mono border border-amber-200 bg-white rounded-lg resize-none h-16"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedLink);
                              alert('¡Enlace copiado al portapapeles!');
                            }}
                            className="flex-1 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-[11px]"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copiar Enlace
                          </button>

                          <a
                            href={`https://wa.me/591${invitePhone}?text=${encodeURIComponent(
                              `Estimado/a *${inviteName}*, te invito a ver en tiempo real nuestro menú tradicional e interactivo de *El Chuquisaqueño*. Puedes ingresar directamente mediante este enlace personalizado: ${generatedLink}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all text-[11px]"
                          >
                            <Smartphone className="w-3.5 h-3.5" /> Enviar WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Registered Clients List */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-red" /> Clientes Registrados en la Base de Datos
                  </h4>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-800 font-black rounded-full text-[10px]">
                    {clients.length}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Lista de clientes que han accedido a tu base de datos de manera autorizada, ya sea registrándose manualmente o ingresando mediante enlaces de invitación compartidos.
                </p>

                {clients.length === 0 ? (
                  <div className="p-8 border border-dashed border-stone-200 rounded-xl text-center space-y-2 text-stone-400">
                    <UserPlus className="w-8 h-8 mx-auto" />
                    <p className="font-bold text-xs text-stone-500">Ningún cliente registrado todavía</p>
                    <p className="text-[10px]">Los clientes que se registren desde el enlace de invitación aparecerán aquí automáticamente.</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[380px] pr-1 space-y-2">
                    {clients.map((client) => (
                      <div key={client.id} className="p-3 bg-stone-50 hover:bg-stone-100/50 rounded-xl border border-stone-150 flex items-center justify-between text-xs transition-colors">
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-900 flex items-center gap-1">
                            👤 {client.name}
                          </p>
                          <p className="text-stone-500 text-[10px]">Celular: <span className="font-mono text-stone-700 font-bold">{client.phone}</span></p>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-[9px] bg-stone-200 text-stone-600 font-black px-2 py-0.5 rounded-full block w-max ml-auto">
                            Invitado
                          </span>
                          <span className="text-[9px] text-stone-400 block font-mono">{client.registrationDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 7: RESTAURANT CONFIGURATION */}
        {activeSubTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-950">Configuración General del Restaurante</h3>
              <button
                type="submit"
                className="px-6 py-2 bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Guardar Configuración
              </button>
            </div>

            {configSuccess && (
              <div className="p-4 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-5 h-5" /> ¡Configuración guardada y actualizada con éxito en la simulación!
              </div>
            )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Public URL */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-stone-700 font-bold">URL Pública / Enlace de tu Carta Digital (para WhatsApp y QR)</label>
                <input
                  type="url"
                  placeholder="Ej. https://ais-pre-n3c3w4oiqaqvuz2w74v6si-47374800727.us-east1.run.app"
                  value={editConfig.publicUrl || ''}
                  onChange={(e) => updateConfigField('publicUrl', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 font-mono text-amber-900"
                />
                <p className="text-[10px] text-stone-400 mt-1">Ingresa el enlace real de tu aplicación (por ejemplo, copia la dirección web actual de tu navegador). Esto asegura que los enlaces compartidos y códigos QR funcionen desde los celulares de tus comensales.</p>
              </div>

              {/* Restaurant Name */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Nombre del Restaurante</label>
                <input
                  type="text"
                  value={editConfig.name}
                  onChange={(e) => updateConfigField('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Slogan o Descripción</label>
                <input
                  type="text"
                  value={editConfig.description}
                  onChange={(e) => updateConfigField('description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Dirección Física</label>
                <input
                  type="text"
                  value={editConfig.address}
                  onChange={(e) => updateConfigField('address', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Ciudad</label>
                <input
                  type="text"
                  value={editConfig.city}
                  onChange={(e) => updateConfigField('city', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* WhatsApp phone */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Número de WhatsApp del Restaurante</label>
                <input
                  type="text"
                  value={editConfig.phone}
                  onChange={(e) => updateConfigField('phone', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* Hours */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Horario de Atención</label>
                <input
                  type="text"
                  value={editConfig.hours}
                  onChange={(e) => updateConfigField('hours', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* Delivery charge */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Costo de Envío (Bs)</label>
                <input
                  type="number"
                  value={editConfig.deliveryCost}
                  onChange={(e) => updateConfigField('deliveryCost', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* Prep time */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Tiempo estimado de preparación</label>
                <input
                  type="text"
                  value={editConfig.prepTime}
                  onChange={(e) => updateConfigField('prepTime', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* Tables count */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Capacidad Máxima (Cantidad de Mesas)</label>
                <input
                  type="number"
                  value={editConfig.tablesCount}
                  onChange={(e) => updateConfigField('tablesCount', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold">Link de Facebook (Opcional)</label>
                <input
                  type="text"
                  value={editConfig.socialFacebook}
                  onChange={(e) => updateConfigField('socialFacebook', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              {/* Logo Simulated */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Logotipo (Subir archivo)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUploadSimulated(e, 'logo')}
                  className="w-full p-2 border border-stone-200 rounded-xl text-xs bg-white"
                />
                <img src={editConfig.logo} alt="Logo" className="w-12 h-12 object-cover rounded mt-2 border" />
              </div>

              {/* Hero Image Simulated */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Imagen Principal Hero (Subir archivo)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUploadSimulated(e, 'hero')}
                  className="w-full p-2 border border-stone-200 rounded-xl text-xs bg-white"
                />
                <img src={editConfig.heroImage} alt="Hero" className="w-20 h-10 object-cover rounded mt-2 border" />
              </div>
            </div>
          </form>
        )}

      </main>

      {/* CATEGORY ADD/EDIT MODAL DIALOG */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <form onSubmit={handleSaveCategory} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900 border-b pb-2">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>

            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Nombre de Categoría *</label>
              <input
                type="text"
                required
                placeholder="Ej. Sándwiches, Minutas..."
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Orden de Visualización *</label>
              <input
                type="number"
                required
                value={categoryOrder}
                onChange={(e) => setCategoryOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs"
              />
            </div>

            <label className="flex items-center gap-2 p-1.5 cursor-pointer font-bold text-stone-700">
              <input
                type="checkbox"
                checked={categoryActive}
                onChange={(e) => setCategoryActive(e.target.checked)}
                className="w-4 h-4 accent-brand-red"
              /> Activa en el Menú de Clientes
            </label>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCloseCategoryModal}
                className="flex-1 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl font-bold"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCT ADD/EDIT MODAL DIALOG */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto animate-fade-in">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up text-xs my-8">
            <h3 className="font-serif font-bold text-base text-stone-900 border-b pb-2">
              {editingProduct ? 'Editar Plato' : 'Nuevo Plato'}
            </h3>

            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Nombre del Plato *</label>
              <input
                type="text"
                required
                placeholder="Ej. Silpancho Cochabambino"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Descripción Completa *</label>
              <textarea
                rows={2}
                required
                placeholder="Escribe la lista de ingredientes y acompañamientos de este plato tradicional..."
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Precio (Bs) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 35"
                  value={productPrice || ''}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Categoría *</label>
                <select
                  required
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 font-semibold"
                >
                  <option value="" disabled>Seleccione categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Fotografía del plato (Subir archivo)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUploadSimulated(e, 'product')}
                className="w-full p-2 border border-stone-200 rounded-xl bg-white"
              />
              {productImage && (
                <img src={productImage} alt="Preview" className="w-16 h-16 object-cover rounded border mt-2" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 p-1.5 cursor-pointer font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={productAvailable}
                  onChange={(e) => setProductAvailable(e.target.checked)}
                  className="w-4 h-4 accent-brand-red"
                /> Disponible hoy
              </label>

              <label className="flex items-center gap-2 p-1.5 cursor-pointer font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={productFeatured}
                  onChange={(e) => setProductFeatured(e.target.checked)}
                  className="w-4 h-4 accent-brand-red"
                /> Plato Destacado
              </label>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCloseProductModal}
                className="flex-1 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl font-bold"
              >
                Guardar Plato
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROMOTION ADD/EDIT MODAL DIALOG */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto animate-fade-in">
          <form onSubmit={handleSavePromo} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up text-xs my-8">
            <h3 className="font-serif font-bold text-base text-stone-900 border-b pb-2">
              {editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
            </h3>

            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Nombre del Combo Promocional *</label>
              <input
                type="text"
                required
                placeholder="Ej. Combo Familiar Fin de Semana"
                value={promoName}
                onChange={(e) => setPromoName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Descripción o Contenido del Combo *</label>
              <textarea
                rows={2}
                required
                placeholder="Ej. Incluye 2 Sopas de Maní + 1 Refresco de Mocochinchi grande..."
                value={promoDesc}
                onChange={(e) => setPromoDesc(e.target.value)}
                className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Precio Normal (Anterior) Bs *</label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 65"
                  value={promoOrigPrice || ''}
                  onChange={(e) => setPromoOrigPrice(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Precio Promocional Bs *</label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 50"
                  value={promoPriceValue || ''}
                  onChange={(e) => setPromoPriceValue(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Fecha de Inicio *</label>
                <input
                  type="date"
                  required
                  value={promoStart}
                  onChange={(e) => setPromoStart(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Fecha de Cierre *</label>
                <input
                  type="date"
                  required
                  value={promoEnd}
                  onChange={(e) => setPromoEnd(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>
            </div>

            {/* Select Linked products */}
            <div className="space-y-1.5">
              <label className="text-stone-700 font-bold block">Vincular Platos de la Carta (Opcional)</label>
              <div className="p-3 bg-stone-50 border rounded-xl max-h-36 overflow-y-auto space-y-1.5">
                {products.map(prod => (
                  <label key={prod.id} className="flex items-center gap-2 cursor-pointer text-stone-700 hover:text-stone-900">
                    <input
                      type="checkbox"
                      checked={promoSelectedProds.includes(prod.id)}
                      onChange={() => handleTogglePromoProd(prod.id)}
                      className="accent-brand-red"
                    /> {prod.name} (Bs {prod.price})
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Imagen de la Promoción (Subir archivo)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUploadSimulated(e, 'promo')}
                className="w-full p-2 border border-stone-200 rounded-xl bg-white"
              />
              {promoImage && (
                <img src={promoImage} alt="Preview" className="w-16 h-16 object-cover rounded border mt-2" />
              )}
            </div>

            <label className="flex items-center gap-2 p-1.5 cursor-pointer font-bold text-stone-700">
              <input
                type="checkbox"
                checked={promoActive}
                onChange={(e) => setPromoActive(e.target.checked)}
                className="w-4 h-4 accent-brand-red"
              /> Promoción Activa hoy
            </label>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleClosePromoModal}
                className="flex-1 py-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl font-bold"
              >
                Guardar Promoción
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

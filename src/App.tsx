import React, { useState, useEffect } from 'react';
import {
  Category,
  Product,
  Promotion,
  Order,
  Reservation,
  RestaurantConfig,
  CartItem,
} from './types';
import {
  initialCategories,
  initialProducts,
  initialPromotions,
  initialOrders,
  initialReservations,
  initialRestaurantConfig,
} from './mockData';

// Modular Component Imports
import { ClientHome } from './components/ClientHome';
import { ClientMenu } from './components/ClientMenu';
import { ClientBooking } from './components/ClientBooking';
import { ClientCart } from './components/ClientCart';
import { AdminPanel } from './components/AdminPanel';
import { ClientRegisterView } from './components/ClientRegisterView';
import { ClientOrders } from './components/ClientOrders';

// Icons Import
import {
  Utensils,
  Calendar,
  ShoppingBag,
  Settings,
  Home,
  Percent,
  Facebook,
  Instagram,
  Clock,
  MapPin,
  MessageCircle,
  HelpCircle,
  Smartphone,
  Key,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Check,
  ClipboardList,
} from 'lucide-react';

export default function App() {
  // STATE MANAGEMENT WITH LOCALSTORAGE PERSISTENCE AND FULL-STACK SERVER INTEGRATION
  const [categories, setCategories] = useState<Category[]>(() => {
    const local = localStorage.getItem('ec_categories');
    return local ? JSON.parse(local) : initialCategories;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem('ec_products');
    return local ? JSON.parse(local) : initialProducts;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const local = localStorage.getItem('ec_promotions');
    return local ? JSON.parse(local) : initialPromotions;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem('ec_orders');
    return local ? JSON.parse(local) : initialOrders;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const local = localStorage.getItem('ec_reservations');
    return local ? JSON.parse(local) : initialReservations;
  });

  const [config, setConfig] = useState<RestaurantConfig>(() => {
    const local = localStorage.getItem('ec_config');
    return local ? JSON.parse(local) : initialRestaurantConfig;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('ec_cart');
    return local ? JSON.parse(local) : [];
  });

  // Centralized real-time server database synchronization states
  const [clients, setClients] = useState<any[]>([]);
  const [adminPin, setAdminPin] = useState<string>("1234");
  const [requireClientRegistration, setRequireClientRegistration] = useState<boolean>(false);
  const [clientUser, setClientUser] = useState<any>(() => {
    const local = localStorage.getItem('ec_client_user');
    return local ? JSON.parse(local) : null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('ec_admin_auth') === 'true';
  });

  // Form states for gated client registration and passcode entrance
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  // Sync state indications
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>('');

  // Routing Path & Tab State
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'promos' | 'booking' | 'cart' | 'admin' | 'my-orders'>('home');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | Promotion | null>(null);

  // Synchronize currentPath on navigate and browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Synchronize States with LocalStorage for quick load
  useEffect(() => {
    localStorage.setItem('ec_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('ec_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ec_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('ec_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ec_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('ec_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('ec_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch Central Database state from server
  const fetchDatabase = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setCategories(data.categories || initialCategories);
          setProducts(data.products || initialProducts);
          setPromotions(data.promotions || initialPromotions);
          setOrders(data.orders || []);
          setReservations(data.reservations || []);
          setConfig(data.config || initialRestaurantConfig);
          setClients(data.clients || []);
          setAdminPin(data.adminPin || "1234");
          setRequireClientRegistration(!!data.requireClientRegistration);
          setLastSynced(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error("Error syncing with real-time central database:", err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  // Trigger registration on backend
  const registerClientOnServer = async (name: string, phone: string) => {
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      fetchDatabase(true);
    } catch (err) {
      console.error("Error auto-registering client on backend:", err);
    }
  };

  // URL Invitation Link Capture
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const name = params.get('name');
    const phone = params.get('phone');

    if (ref === 'invitado' && name && phone) {
      const clientData = { name, phone };
      localStorage.setItem('ec_client_user', JSON.stringify(clientData));
      setClientUser(clientData);

      // Register instantly in the centralized database list
      registerClientOnServer(name, phone);

      // Clean the parameters from URL so the bar looks beautiful
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({ path: newurl }, '', newurl);
    }
  }, []);

  // Gated block to prevent clients from accessing administration panel
  useEffect(() => {
    if (activeTab === 'admin' && clientUser && clientUser.role === 'client') {
      setActiveTab('home');
      alert('🔒 Acceso de cliente: Los clientes registrados no pueden ingresar al panel administrativo.');
    }
  }, [activeTab, clientUser]);

  // Poll database state every 5 seconds for immediate real-time synchronization
  useEffect(() => {
    fetchDatabase();
    const interval = setInterval(() => {
      fetchDatabase(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // MUTATION MUTUAL SYNCS (PUTS TO EXPRESS SERVER + UPDATES LOCAL STATE)
  const handleUpdateCategories = async (newCats: Category[]) => {
    setCategories(newCats);
    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCats)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProducts = async (newProds: Product[]) => {
    setProducts(newProds);
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProds)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePromotions = async (newPromos: Promotion[]) => {
    setPromotions(newPromos);
    try {
      await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromos)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrders = async (newOrders: Order[]) => {
    setOrders(newOrders);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrders)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReservations = async (newRes: Reservation[]) => {
    setReservations(newRes);
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRes)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConfig = async (newCfg: RestaurantConfig) => {
    setConfig(newCfg);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCfg)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (pin: string, requireReg: boolean) => {
    setAdminPin(pin);
    setRequireClientRegistration(requireReg);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin: pin, requireClientRegistration: requireReg })
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Client gated registration form submission
  const handleClientRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || regPhone.trim().length < 7) {
      alert("Por favor, ingresa un nombre y un número de contacto válido.");
      return;
    }
    const clientData = { name: regName.trim(), phone: regPhone.trim() };
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (res.ok) {
        localStorage.setItem('ec_client_user', JSON.stringify(clientData));
        setClientUser(clientData);
        fetchDatabase(true);
      } else {
        throw new Error();
      }
    } catch (err) {
      // Offline fallback
      localStorage.setItem('ec_client_user', JSON.stringify(clientData));
      setClientUser(clientData);
    }
  };

  // Admin PIN Verify handler
  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('ec_admin_auth', 'true');
      setActiveTab('admin');
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('PIN de seguridad incorrecto. Intenta de nuevo.');
      setPinInput('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('ec_admin_auth');
    setActiveTab('home');
  };

  // CORE CART MUTATIONS
  const handleAddToCart = (
    itemType: 'product' | 'promotion',
    item: any,
    quantity: number,
    observations: string
  ) => {
    const itemId = item.id;
    // Generate unique identifier combining itemId and observations to support split-row observations
    const cartItemId = `${itemId}-${observations.replace(/\s+/g, '-').toLowerCase()}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((x) => x.id === cartItemId);
      if (existingIndex > -1) {
        // Update quantity
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        // Create new item
        const newItem: CartItem = {
          id: cartItemId,
          itemType,
          itemId,
          name: item.name,
          price: itemType === 'promotion' ? item.promoPrice : item.price,
          image: item.image,
          quantity,
          observations,
        };
        return [...prevCart, newItem];
      }
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((it) => (it.id === cartItemId ? { ...it, quantity } : it))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prevCart) => prevCart.filter((it) => it.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // ADD BOOKING / RESERVATION
  const handleAddReservation = (newRes: Reservation) => {
    handleUpdateReservations([newRes, ...reservations]);
  };

  // HELPER FOR QUICK MENU DISPLAY
  const featuredProducts = products.filter((p) => p.featured && p.available);
  const activePromotions = promotions.filter((p) => p.active);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans select-none antialiased">
      
      {/* REAL-TIME SERVER SYNC NOTIFICATION BANNER */}
      <div className="bg-stone-900 text-stone-200 py-1.5 px-4 text-[10px] md:text-xs flex justify-between items-center select-none border-b border-stone-800">
        <div className="flex items-center gap-2 font-mono">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isSyncing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
          </span>
          <span className="text-stone-300">
            {isSyncing ? 'Sincronizando base de datos...' : 'Base de datos centralizada conectada en tiempo real'}
          </span>
        </div>
        {lastSynced && (
          <div className="flex items-center gap-3 font-mono text-[9px] md:text-[10px] text-stone-400">
            {clientUser && (
              <span className="hidden sm:inline border-r border-stone-700 pr-3 text-emerald-400">
                Cliente: <span className="font-bold">{clientUser.name}</span>
              </span>
            )}
            <span>Sincronizado: {lastSynced}</span>
          </div>
        )}
      </div>

      {/* PERSISTENT HEADER (TOP BANNER & NAVIGATION) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          
          {/* Logo & Slogan */}
          <div
            onClick={() => { setActiveTab('home'); setSelectedProductForDetail(null); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center text-white font-serif font-black text-xl shadow-md group-hover:rotate-6 transition-all duration-300">
              EC
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-serif font-black tracking-tight text-stone-900 flex items-center gap-1.5">
                {config.name}
              </h1>
              <span className="text-[10px] text-brand-red font-bold uppercase tracking-widest block">
                Sabor Tradicional • Cochabamba
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Hidden on small mobile) */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('home'); setSelectedProductForDetail(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'home' ? 'bg-brand-red-light text-brand-red' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => { setActiveTab('menu'); setSelectedProductForDetail(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'menu' ? 'bg-brand-red-light text-brand-red' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Menú Tradicional
            </button>
            <button
              onClick={() => { setActiveTab('promos'); setSelectedProductForDetail(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'promos' ? 'bg-brand-red-light text-brand-red' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Promociones
            </button>
            <button
              onClick={() => { setActiveTab('booking'); setSelectedProductForDetail(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'booking' ? 'bg-brand-red-light text-brand-red' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              Reservar Mesa
            </button>
            {clientUser && (
              <button
                onClick={() => { setActiveTab('my-orders'); setSelectedProductForDetail(null); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'my-orders' ? 'bg-brand-red-light text-brand-red' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" /> Mis Pedidos
              </button>
            )}
          </nav>

          {/* Top Actions & Role Toggle */}
          <div className="flex items-center gap-2">
            
            {/* View Admin Toggle Button for demo testing */}
            {!(clientUser && clientUser.role === 'client') && (
              <button
                id="top-admin-toggle"
                onClick={() => {
                  if (activeTab === 'admin') {
                    setActiveTab('home');
                  } else if (isAdminAuthenticated) {
                    setActiveTab('admin');
                  } else {
                    setShowPinModal(true);
                  }
                  setSelectedProductForDetail(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-stone-900 text-white'
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200'
                }`}
                title="Alternar entre cliente y administrador para probar las pantallas"
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">
                  {activeTab === 'admin' ? 'Ver como Cliente' : 'Panel Administrador'}
                </span>
              </button>
            )}

            {/* Logout Admin Session */}
            {isAdminAuthenticated && (
              <button
                onClick={handleAdminLogout}
                className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl cursor-pointer border border-stone-200"
                title="Cerrar Sesión Administrador"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Client User Session / Access */}
            {clientUser ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden lg:inline text-xs text-stone-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                  Cliente: <span className="font-bold text-emerald-800">{clientUser.name}</span>
                </span>
                <button
                  onClick={() => {
                    localStorage.removeItem('ec_client_user');
                    setClientUser(null);
                    setActiveTab('home');
                    navigate('/');
                  }}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-200 flex items-center gap-1"
                  title="Cerrar Sesión Cliente"
                >
                  <LogOut className="w-3.5 h-3.5" /> Salir
                </button>
              </div>
            ) : (
              currentPath !== '/registro' && (
                <button
                  onClick={() => {
                    navigate('/registro');
                  }}
                  className="px-3.5 py-2 bg-brand-red hover:bg-brand-red-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
                >
                  Regístrate
                </button>
              )
            )}

            {/* Shopping Cart button with counter */}
            {activeTab !== 'admin' && (
              <button
                id="top-cart-btn"
                onClick={() => { setActiveTab('cart'); setSelectedProductForDetail(null); }}
                className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                  activeTab === 'cart'
                    ? 'bg-brand-red text-white border-brand-red shadow-md shadow-brand-red/10'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
                }`}
                title="Ver carrito de compras"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-red text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale-up">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* WORKSPACE AREA (MAIN VIEW CONTAINER) */}
      <main className="flex-1">
        {currentPath === '/registro' ? (
          <ClientRegisterView
            onSuccess={(user) => {
              localStorage.setItem('ec_client_user', JSON.stringify(user));
              setClientUser(user);
              navigate('/');
              setActiveTab('home');
            }}
            onCancel={() => {
              navigate('/');
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <ClientHome
                config={config}
                featuredProducts={featuredProducts}
                activePromotions={activePromotions}
                onNavigate={(tab) => setActiveTab(tab)}
                onSelectProduct={(p) => { setSelectedProductForDetail(p); setActiveTab('menu'); }}
                onSelectPromotion={(promo) => { setSelectedProductForDetail(promo); setActiveTab('menu'); }}
                onAddToCart={handleAddToCart}
              />
            )}

            {activeTab === 'menu' && (
              <ClientMenu
                categories={categories}
                products={products}
                promotions={promotions}
                cart={cart}
                onAddToCart={handleAddToCart}
                selectedProductForDetail={selectedProductForDetail}
                onSelectProductForDetail={setSelectedProductForDetail}
              />
            )}

            {activeTab === 'promos' && (
              <ClientMenu
                categories={categories}
                products={products}
                promotions={promotions}
                cart={cart}
                onAddToCart={handleAddToCart}
                selectedProductForDetail={selectedProductForDetail}
                onSelectProductForDetail={setSelectedProductForDetail}
              />
            )}

            {activeTab === 'booking' && (
              <ClientBooking
                config={config}
                reservations={reservations}
                onAddReservation={handleAddReservation}
              />
            )}

            {activeTab === 'cart' && (
              <ClientCart
                config={config}
                cart={cart}
                onUpdateQuantity={handleUpdateCartQuantity}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                onAddOrder={(newOrder) => handleUpdateOrders([newOrder, ...orders])}
              />
            )}

            {activeTab === 'my-orders' && (
              <ClientOrders
                orders={orders}
                clientUser={clientUser}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel
                categories={categories}
                products={products}
                promotions={promotions}
                orders={orders}
                reservations={reservations}
                config={config}
                clients={clients}
                adminPin={adminPin}
                requireClientRegistration={requireClientRegistration}
                onUpdateCategories={handleUpdateCategories}
                onUpdateProducts={handleUpdateProducts}
                onUpdatePromotions={handleUpdatePromotions}
                onUpdateOrders={handleUpdateOrders}
                onUpdateReservations={handleUpdateReservations}
                onUpdateConfig={handleUpdateConfig}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </>
        )}
      </main>

      {/* ADMIN PIN ENTRANCE MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xl max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              🔑
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-black text-lg text-stone-900">Acceso de Administración</h3>
              <p className="text-[11px] text-stone-500 leading-normal">
                Ingresa el PIN de seguridad asignado para gestionar platos, precios, pedidos y ver los clientes en tiempo real.
              </p>
            </div>
            <form onSubmit={handleVerifyAdminPin} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value.replace(/\D/g, ''));
                  setPinError('');
                }}
                placeholder="••••"
                className="w-full text-center py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xl tracking-widest text-stone-950 focus:outline-none focus:ring-1 focus:ring-brand-red"
                autoFocus
              />
              {pinError && (
                <p className="text-[10px] text-brand-red font-bold">{pinError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(''); }}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-red hover:bg-brand-red-dark text-white font-bold rounded-xl text-xs shadow-md shadow-brand-red/10"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATED ACCESS: CLIENT REGISTRATION */}
      {requireClientRegistration && !clientUser && activeTab !== 'admin' && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-brand-red to-brand-red-dark p-6 text-white text-center space-y-2">
              <div className="w-14 h-14 bg-white text-brand-red rounded-full flex items-center justify-center mx-auto text-2xl font-serif font-black shadow-lg">
                EC
              </div>
              <div className="space-y-0.5">
                <h3 className="font-serif font-black text-xl">El Chuquisaqueño</h3>
                <span className="text-[9px] uppercase tracking-wider font-bold opacity-80">Cochabamba, Bolivia</span>
              </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleClientRegisterSubmit} className="p-6 md:p-8 space-y-4 text-xs">
              <div className="text-center space-y-1.5 mb-2">
                <h4 className="font-serif font-bold text-sm text-stone-900">Bienvenido a nuestra Carta Digital</h4>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Para acceder al menú interactivo y registrar tu pedido con actualizaciones en tiempo real, ingresa tus datos de contacto básicos.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Tu Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ej. Carlos Siles"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-red text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Tu Teléfono / Celular de Contacto *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej. 71234567"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 font-mono tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-brand-red text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-red hover:bg-brand-red-dark text-white font-bold rounded-xl shadow-lg shadow-brand-red/10 transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>Ingresar a la Carta Digital</span> 🚀
                </button>
              </div>

              <div className="pt-2 text-center text-[10px] text-stone-400">
                🔒 Tus datos solo se usan para procesar tus pedidos por WhatsApp.
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE LOWER BOTTOM BAR (FOR SMARTPHONES NAVIGATION) */}
      {activeTab !== 'admin' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 md:hidden flex items-center justify-around py-2.5 shadow-lg">
          <button
            onClick={() => { setActiveTab('home'); setSelectedProductForDetail(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
              activeTab === 'home' ? 'text-brand-red' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </button>

          <button
            onClick={() => { setActiveTab('menu'); setSelectedProductForDetail(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
              activeTab === 'menu' ? 'text-brand-red' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span>Menú</span>
          </button>

          <button
            onClick={() => { setActiveTab('promos'); setSelectedProductForDetail(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
              activeTab === 'promos' ? 'text-brand-red' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Percent className="w-5 h-5" />
            <span>Promos</span>
          </button>

          <button
            onClick={() => { setActiveTab('booking'); setSelectedProductForDetail(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
              activeTab === 'booking' ? 'text-brand-red' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Reservas</span>
          </button>

          {clientUser && (
            <button
              onClick={() => { setActiveTab('my-orders'); setSelectedProductForDetail(null); }}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
                activeTab === 'my-orders' ? 'text-brand-red' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span>Pedidos</span>
            </button>
          )}

          <button
            onClick={() => { setActiveTab('cart'); setSelectedProductForDetail(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold cursor-pointer transition-all relative ${
              activeTab === 'cart' ? 'text-brand-red' : 'text-stone-400 hover:text-stone-700'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Carrito</span>
            {cart.length > 0 && (
              <span className="absolute top-0 right-1.5 bg-brand-red text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      )}

      {/* PERSISTENT FOOTER */}
      {activeTab !== 'admin' && (
        <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white font-serif font-black">EC</div>
                <h3 className="font-serif font-bold text-lg text-white">{config.name}</h3>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Comprometidos con mantener vivas las recetas y sabores ancestrales de Sucre. Cada bocado es un viaje directo a la capital boliviana.
              </p>
              <div className="flex gap-3 text-stone-400">
                <a href={config.socialFacebook} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={config.socialInstagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Col 2: Hours */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Horario de Atención</h4>
              <div className="space-y-2 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-red shrink-0" />
                  <span>{config.hours}</span>
                </div>
                <p className="text-[11px] text-stone-500">Servicio continuo para delivery y recojo local de almuerzos tradicionales.</p>
              </div>
            </div>

            {/* Col 3: Contact */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Contacto Directo</h4>
              <div className="space-y-2 text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-brand-red shrink-0" />
                  <a href={`https://wa.me/59162418191`} target="_blank" rel="noreferrer" className="hover:underline">
                    WhatsApp: {config.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-red shrink-0" />
                  <span>{config.address}</span>
                </div>
              </div>
            </div>

            {/* Col 4: Region */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-white uppercase tracking-wider">Ubicación</h4>
              <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 space-y-2 text-xs">
                <p className="font-bold text-stone-300">{config.city}</p>
                <p className="text-stone-500 text-[11px]">Encuéntranos en Cochabamba, listos para brindarte la mejor atención culinaria.</p>
              </div>
            </div>

          </div>

          <div className="bg-stone-950/80 py-4 text-center text-stone-500 text-[11px] border-t border-stone-850">
            <p>© 2026 {config.name} • Cochabamba, Bolivia. Todos los derechos reservados.</p>
          </div>
        </footer>
      )}

    </div>
  );
}

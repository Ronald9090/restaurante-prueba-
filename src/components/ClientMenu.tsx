import React, { useState } from 'react';
import { Category, Product, Promotion, CartItem } from '../types';
import { Utensils, MessageSquare, ShoppingCart, Plus, Minus, X, Check, Heart, Eye } from 'lucide-react';

interface ClientMenuProps {
  categories: Category[];
  products: Product[];
  promotions: Promotion[];
  cart: CartItem[];
  onAddToCart: (itemType: 'product' | 'promotion', item: any, quantity: number, observations: string) => void;
  selectedProductForDetail: Product | Promotion | null;
  onSelectProductForDetail: (item: Product | Promotion | null) => void;
}

export const ClientMenu: React.FC<ClientMenuProps> = ({
  categories,
  products,
  promotions,
  cart,
  onAddToCart,
  selectedProductForDetail,
  onSelectProductForDetail,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State for detail modal quantities/observations
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [detailObservations, setDetailObservations] = useState<string>('');
  const [showAddSuccess, setShowAddSuccess] = useState<boolean>(false);

  // Active categories list
  const activeCategories = categories.filter(c => c.active).sort((a, b) => a.order - b.order);

  // Filtered products list
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategoryId === 'all' || product.categoryId === selectedCategoryId;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDetail = (item: Product | Promotion) => {
    onSelectProductForDetail(item);
    setDetailQuantity(1);
    setDetailObservations('');
    setShowAddSuccess(false);
  };

  const handleCloseDetail = () => {
    onSelectProductForDetail(null);
  };

  const handleAddToCartFromDetail = () => {
    if (!selectedProductForDetail) return;
    const isPromo = 'promoPrice' in selectedProductForDetail;
    
    onAddToCart(
      isPromo ? 'promotion' : 'product',
      selectedProductForDetail,
      detailQuantity,
      detailObservations
    );

    setShowAddSuccess(true);
    setTimeout(() => {
      setShowAddSuccess(false);
      handleCloseDetail();
    }, 1500);
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!product.available) return;
    onAddToCart('product', product, 1, '');
    // Spark a quick alert
    alert(`¡Se agregó 1 x "${product.name}" al carrito!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-20">
      
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
            Nuestro Tradicional <span className="text-brand-red">Menú</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Platos típicos elaborados con ingredientes de primera calidad traídos desde Chuquisaca.
          </p>
        </div>

        {/* Search bar */}
        <div className="w-full md:w-80">
          <input
            id="menu-search-input"
            type="text"
            placeholder="Buscar plato, ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Category Tabs Scrollable */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
          }`}
        >
          Todos los Platos
        </button>

        {activeCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryId === cat.id
                ? 'bg-brand-red text-white shadow-md shadow-brand-red/10'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            {cat.name}
          </button>
        ))}

        <button
          onClick={() => setSelectedCategoryId('promos')}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryId === 'promos'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100/75 border border-amber-200'
          }`}
        >
          🌟 Promociones Especiales
        </button>
      </div>

      {/* Product List Content */}
      {selectedCategoryId === 'promos' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promotions.filter(p => p.active).map((promo) => (
            <div
              key={promo.id}
              onClick={() => handleOpenDetail(promo)}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col md:flex-row cursor-pointer transition-all hover:shadow-md hover:border-stone-200"
            >
              <div className="md:w-2/5 h-48 md:h-auto relative bg-stone-100">
                <img src={promo.image} alt={promo.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  PROMO
                </div>
              </div>
              <div className="p-6 md:w-3/5 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-serif font-bold text-lg text-stone-900">{promo.name}</h3>
                  <p className="text-stone-600 text-xs line-clamp-3 leading-relaxed">{promo.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-stone-400 text-xs line-through block">Bs {promo.originalPrice}</span>
                    <span className="text-brand-red font-bold text-lg">Bs {promo.promoPrice}</span>
                  </div>
                  <button className="px-4 py-2 bg-brand-red text-white text-xs font-semibold rounded-xl hover:bg-brand-red-dark transition-all">
                    Ver Promo
                  </button>
                </div>
              </div>
            </div>
          ))}
          {promotions.filter(p => p.active).length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-500">
              No hay promociones activas en este momento.
            </div>
          )}
        </div>
      ) : (
        <div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleOpenDetail(product)}
                  className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-stone-200 flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Image block */}
                    <div className="relative h-52 w-full bg-stone-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                      {!product.available && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="px-3 py-1 bg-stone-800 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                            Agotado por hoy
                          </span>
                        </div>
                      )}
                      {product.featured && product.available && (
                        <div className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          Destacado
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-brand-red transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <span className="text-brand-red font-bold text-lg whitespace-nowrap ml-2">Bs {product.price}</span>
                      </div>
                      <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="p-5 pt-0 mt-auto flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenDetail(product); }}
                      className="flex-1 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-stone-200"
                    >
                      <Eye className="w-4 h-4" /> Detalles
                    </button>
                    {product.available ? (
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex-1 py-2 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-brand-red/10 cursor-pointer"
                      >
                        <ShoppingCart className="w-4 h-4" /> Agregar
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-400 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        Agotado
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 max-w-lg mx-auto space-y-3">
              <Utensils className="w-12 h-12 text-stone-300 mx-auto" />
              <p className="text-stone-700 font-serif font-bold text-lg">No encontramos productos</p>
              <p className="text-stone-500 text-xs">Intenta buscando con otros términos o seleccionando otra categoría.</p>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL (PÁGINA DETALLE DEL PRODUCTO) */}
      {selectedProductForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-8 animate-scale-up">
            
            {/* Close Button */}
            <button
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-all shadow-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Product Image */}
            <div className="relative h-64 md:h-80 w-full bg-stone-100">
              <img
                src={selectedProductForDetail.image}
                alt={selectedProductForDetail.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 left-6 text-white space-y-1">
                <span className="px-2.5 py-1 bg-brand-red text-white text-[10px] uppercase tracking-wider font-bold rounded-full">
                  {'promoPrice' in selectedProductForDetail ? 'Combo Promocional' : 'Sabor Tradicional'}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white shadow-sm">
                  {selectedProductForDetail.name}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Price and Description */}
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-stone-500 text-xs uppercase tracking-wider font-bold">Precio Unitario</span>
                  {'promoPrice' in selectedProductForDetail ? (
                    <div className="flex items-center gap-2">
                      <span className="text-stone-400 text-sm line-through">Bs {selectedProductForDetail.originalPrice}</span>
                      <span className="text-brand-red font-serif font-bold text-2xl">Bs {selectedProductForDetail.promoPrice}</span>
                    </div>
                  ) : (
                    <span className="text-brand-red font-serif font-bold text-2xl">
                      Bs {selectedProductForDetail.price}
                    </span>
                  )}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {selectedProductForDetail.description}
                </p>
              </div>

              {/* Warnings / Availability */}
              {'available' in selectedProductForDetail && !selectedProductForDetail.available && (
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-center gap-2 font-medium border border-amber-100">
                  ⚠️ Este producto se encuentra temporalmente agotado por el día de hoy.
                </div>
              )}

              {/* Configuration Section for Order */}
              {('available' in selectedProductForDetail ? selectedProductForDetail.available : true) && (
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  
                  {/* Quantity selector */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">Cantidad</h4>
                      <p className="text-stone-500 text-xs">¿Cuántas porciones deseas?</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                      <button
                        onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                        className="p-1 rounded-lg hover:bg-white text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-stone-800 text-sm">
                        {detailQuantity}
                      </span>
                      <button
                        onClick={() => setDetailQuantity(detailQuantity + 1)}
                        className="p-1 rounded-lg hover:bg-white text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Observations */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <label htmlFor="detail-obs" className="font-bold text-stone-700 flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-stone-400" /> Observaciones (Opcional)
                      </label>
                      <span className="text-stone-400">Ej: "sin cebolla", "sin picante"</span>
                    </div>
                    <textarea
                      id="detail-obs"
                      rows={2}
                      placeholder="Escribe indicaciones especiales para la preparación de tu plato..."
                      value={detailObservations}
                      onChange={(e) => setDetailObservations(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-stone-50/50"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={handleCloseDetail}
                      className="flex-1 py-3 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddToCartFromDetail}
                      className="flex-2 py-3 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-brand-red/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" /> Agregar al Carrito (Bs {
                        ('promoPrice' in selectedProductForDetail 
                          ? selectedProductForDetail.promoPrice 
                          : selectedProductForDetail.price) * detailQuantity
                      })
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add Toast Confirmation Inside Modal */}
            {showAddSuccess && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center space-y-3 z-20 animate-fade-in">
                <div className="p-4 bg-green-500 text-white rounded-full shadow-lg">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-lg text-stone-950">¡Plato Agregado con Éxito!</h3>
                <p className="text-stone-600 text-xs text-center px-6">
                  Hemos agregado {detailQuantity} x "{selectedProductForDetail.name}" al carrito de compras.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

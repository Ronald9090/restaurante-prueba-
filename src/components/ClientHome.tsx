import React from 'react';
import { Product, Promotion, RestaurantConfig } from '../types';
import { Utensils, Calendar, Clock, MapPin, Phone, MessageCircle, ArrowRight, Sparkles, Percent } from 'lucide-react';

interface ClientHomeProps {
  config: RestaurantConfig;
  featuredProducts: Product[];
  activePromotions: Promotion[];
  onNavigate: (tab: 'home' | 'menu' | 'promos' | 'booking') => void;
  onSelectProduct: (product: Product) => void;
  onSelectPromotion: (promo: Promotion) => void;
  onAddToCart: (item: any) => void;
}

export const ClientHome: React.FC<ClientHomeProps> = ({
  config,
  featuredProducts,
  activePromotions,
  onNavigate,
  onSelectProduct,
  onSelectPromotion,
}) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Section */}
      <section className="relative h-[480px] w-full flex items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <img
            src={config.heroImage || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop"}
            alt="Comida tradicional chuquisaqueña"
            className="h-full w-full object-cover opacity-65 scale-105 transition-all duration-700 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6 space-y-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red text-white text-xs font-semibold tracking-wider uppercase animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> El auténtico sabor de Sucre en Cochabamba
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-white">
            El <span className="text-brand-red">Chuquisaqueño</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-200 font-sans max-w-2xl mx-auto leading-relaxed">
            {config.description}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              id="hero-btn-menu"
              onClick={() => onNavigate('menu')}
              className="px-8 py-3.5 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white font-semibold transition-all shadow-lg hover:shadow-brand-red/30 flex items-center gap-2 text-base cursor-pointer"
            >
              <Utensils className="w-5 h-5" /> Ver Menú Completo
            </button>
            <button
              id="hero-btn-booking"
              onClick={() => onNavigate('booking')}
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-brand-red border border-stone-200 font-semibold transition-all shadow-md flex items-center gap-2 text-base cursor-pointer"
            >
              <Calendar className="w-5 h-5" /> Reservar una Mesa
            </button>
          </div>
        </div>
      </section>

      {/* Main Info Blocks */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-brand-red-light rounded-xl text-brand-red">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Horario de Atención</h3>
            <p className="text-stone-600 text-sm mt-1">{config.hours}</p>
            <p className="text-stone-500 text-xs mt-0.5">Atención continua de almuerzos</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-brand-red-light rounded-xl text-brand-red">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Nuestra Ubicación</h3>
            <p className="text-stone-600 text-sm mt-1">{config.address}</p>
            <p className="text-stone-500 text-xs mt-0.5">{config.city}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">Pedidos y Consultas</h3>
            <p className="text-stone-600 text-sm mt-1">Soporte directo por WhatsApp</p>
            <a
              href={`https://wa.me/59162418191`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm hover:underline mt-1"
            >
              +591 62418191 <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      {activePromotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <Percent className="w-5 h-5" />
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">Promociones Imperdibles</h2>
            </div>
            <button
              onClick={() => onNavigate('promos')}
              className="text-brand-red hover:text-brand-red-dark font-semibold text-sm flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activePromotions.map((promo) => (
              <div
                key={promo.id}
                onClick={() => onSelectPromotion(promo)}
                className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden flex flex-col sm:flex-row cursor-pointer transition-all hover:shadow-md hover:border-stone-200"
              >
                <div className="sm:w-2/5 h-48 sm:h-auto relative bg-stone-100">
                  <img
                    src={promo.image}
                    alt={promo.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                    DESCUENTO
                  </div>
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-brand-red transition-colors">
                      {promo.name}
                    </h3>
                    <p className="text-stone-600 text-xs line-clamp-3 leading-relaxed">
                      {promo.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-stone-400 text-xs line-through block">Bs {promo.originalPrice}</span>
                      <span className="text-brand-red font-bold text-lg">Bs {promo.promoPrice}</span>
                    </div>
                    <span className="text-brand-red bg-brand-red-light px-3 py-1.5 rounded-lg text-xs font-semibold group-hover:bg-brand-red group-hover:text-white transition-all">
                      Ver Detalles
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-brand-red-light text-brand-red rounded-lg">
              <Utensils className="w-5 h-5" />
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">Platos Destacados</h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-brand-red hover:text-brand-red-dark font-semibold text-sm flex items-center gap-1"
          >
            Menú completo <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-stone-200"
            >
              <div className="relative h-56 w-full bg-stone-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {!product.available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="px-3 py-1 bg-stone-800 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                      Agotado por hoy
                    </span>
                  </div>
                )}
                {product.available && (
                  <div className="absolute top-3 right-3 bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    Recomendado
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-brand-red transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-brand-red font-bold text-lg whitespace-nowrap ml-2">Bs {product.price}</span>
                </div>
                <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                <div className="pt-3 border-t border-stone-50 flex items-center justify-between text-xs">
                  <span className="text-stone-400">Cocina Tradicional</span>
                  <span className="text-brand-red font-semibold group-hover:underline flex items-center gap-1">
                    Ver más detalles <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/59162418191"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 md:bottom-6 right-6 z-40 p-4 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#128C7E] transition-all transform hover:scale-110 flex items-center justify-center border border-white"
        title="Enviar mensaje de consulta"
      >
        <MessageCircle className="w-6 h-6 fill-white" />
      </a>
    </div>
  );
};

import React from 'react';
import { Order, OrderStatus } from '../types';
import { ShoppingBag, Clock, MapPin, CheckCircle2, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

interface ClientOrdersProps {
  orders: Order[];
  clientUser: { name: string; phone: string; email?: string } | null;
}

export function ClientOrders({ orders, clientUser }: ClientOrdersProps) {
  if (!clientUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="font-serif font-black text-xl text-stone-900">Inicia sesión para ver tus pedidos</h3>
        <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">
          Regístrate o inicia sesión en el sistema para realizar un seguimiento en tiempo real de todos tus pedidos de El Chuquisaqueño.
        </p>
      </div>
    );
  }

  // Filter orders by phone or name
  const myOrders = orders.filter(
    (o) =>
      o.phone === clientUser.phone ||
      (o.clientName && o.clientName.toLowerCase() === clientUser.name.toLowerCase())
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Nuevo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmado':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'En preparación':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Listo':
      case 'Listo para recoger':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'En camino':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Entregado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelado':
      case 'Rechazado':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'Nuevo':
        return 1;
      case 'Confirmado':
        return 2;
      case 'En preparación':
        return 3;
      case 'Listo':
      case 'Listo para recoger':
        return 4;
      case 'En camino':
        return 5;
      case 'Entregado':
        return 6;
      case 'Cancelado':
      case 'Rechazado':
        return -1;
      default:
        return 1;
    }
  };

  const steps = [
    { label: 'Recibido', val: 1 },
    { label: 'Confirmado', val: 2 },
    { label: 'En Cocina', val: 3 },
    { label: 'Listo', val: 4 },
    { label: 'En Camino', val: 5 },
    { label: 'Entregado', val: 6 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1.5">
        <h2 className="font-serif font-black text-2xl text-stone-900">Mis Pedidos en Tiempo Real</h2>
        <p className="text-stone-500 text-xs leading-relaxed">
          Sigue el progreso de tus platos tradicionales chuquisaqueños. El panel se actualiza automáticamente cada 5 segundos cuando la administración cambia el estado.
        </p>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-stone-900 text-base">Aún no tienes pedidos registrados</h4>
            <p className="text-stone-500 text-xs max-w-sm mx-auto leading-relaxed">
              Explora nuestro delicioso menú y añade un Mondongo Chuquisaqueño o nuestra famosa Sopa de Maní Tradicional al carrito para realizar tu primer pedido.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {myOrders.map((order) => {
            const currentStep = getStatusStep(order.status);
            const isCancelled = currentStep === -1;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-sm hover:shadow-md transition-all p-5 md:p-6 space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-black text-lg text-brand-red">{order.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-stone-400 text-[10px] font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-300" />
                        {order.date} a las {order.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-300" />
                        {order.type === 'delivery' ? 'Delivery a Domicilio' : 'Recojo en Local'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">Total a pagar</span>
                    <span className="font-serif font-black text-xl text-stone-900">Bs {order.total}</span>
                  </div>
                </div>

                {/* Tracking Stepper */}
                {!isCancelled ? (
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Estado de preparación:</h5>
                    <div className="relative">
                      {/* Desktop Stepper */}
                      <div className="hidden md:flex items-center justify-between relative z-10">
                        {steps.map((step, idx) => {
                          const isActive = currentStep >= step.val;
                          const isCurrent = currentStep === step.val;

                          return (
                            <div key={step.val} className="flex-1 flex flex-col items-center text-center group">
                              <div
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                                  isCurrent
                                    ? 'bg-brand-red border-brand-red text-white scale-110 shadow-lg shadow-brand-red/20'
                                    : isActive
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'bg-white border-stone-200 text-stone-400'
                                }`}
                              >
                                {isActive && !isCurrent ? '✓' : step.val}
                              </div>
                              <span
                                className={`text-[10px] font-bold mt-2 transition-all ${
                                  isCurrent
                                    ? 'text-brand-red'
                                    : isActive
                                    ? 'text-emerald-600'
                                    : 'text-stone-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop progress bar background */}
                      <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-stone-100 -z-0">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${Math.max(0, ((currentStep - 1) / 5) * 100)}%`,
                          }}
                        ></div>
                      </div>

                      {/* Mobile Tracker */}
                      <div className="md:hidden flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {currentStep}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase block">Paso actual</span>
                            <span className="font-serif font-bold text-stone-900 text-sm">
                              {steps.find((s) => s.val === currentStep)?.label || order.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-pulse">
                          <span>Actualizado en vivo</span> •
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-red-950 text-xs">Pedido Cancelado o Rechazado</h5>
                      <p className="text-red-700 text-[11px] leading-normal mt-0.5">
                        Este pedido no ha podido ser procesado o fue cancelado. Por favor contáctanos directamente a través de nuestro WhatsApp para coordinar o resolver cualquier duda.
                      </p>
                    </div>
                  </div>
                )}

                {/* Items & details */}
                <div className="bg-stone-50/50 rounded-2xl border border-stone-100 p-4 space-y-3">
                  <h6 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Detalles de la compra:</h6>
                  <div className="divide-y divide-stone-100 text-xs">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex justify-between items-start gap-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-stone-900">
                            {item.quantity}x <span className="font-serif">{item.name}</span>
                          </span>
                          {item.observations && (
                            <p className="text-[10px] text-stone-500 italic">"{item.observations}"</p>
                          )}
                        </div>
                        <span className="font-mono text-stone-700 font-medium">Bs {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {order.observations && (
                    <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500">
                      <span className="font-bold text-stone-700">Nota general:</span> "{order.observations}"
                    </div>
                  )}

                  {order.type === 'delivery' && (
                    <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 space-y-0.5">
                      <div>
                        <span className="font-bold text-stone-700">Dirección:</span> {order.address}
                      </div>
                      <div>
                        <span className="font-bold text-stone-700">Referencia:</span> {order.reference}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

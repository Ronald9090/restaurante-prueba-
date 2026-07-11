import React, { useState } from 'react';
import { CartItem, RestaurantConfig, Order } from '../types';
import { ShoppingBag, Trash2, Plus, Minus, MessageSquare, MapPin, Truck, Store, ArrowRight, HelpCircle } from 'lucide-react';

interface ClientCartProps {
  config: RestaurantConfig;
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onAddOrder?: (order: Order) => void;
}

export const ClientCart: React.FC<ClientCartProps> = ({
  config,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddOrder,
}) => {
  // Checkout Form states
  const [clientName, setClientName] = useState(() => {
    const local = localStorage.getItem('ec_client_user');
    if (local) {
      try { return JSON.parse(local).name || ''; } catch (e) {}
    }
    return '';
  });
  const [phone, setPhone] = useState(() => {
    const local = localStorage.getItem('ec_client_user');
    if (local) {
      try { return JSON.parse(local).phone || ''; } catch (e) {}
    }
    return '';
  });
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [reference, setReference] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash'>('qr');
  const [observations, setObservations] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  // Math Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharge = orderType === 'delivery' ? config.deliveryCost : 0;
  const total = subtotal + deliveryCharge;

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!clientName.trim()) tempErrors.clientName = 'El nombre completo es requerido.';
    if (!phone.trim()) {
      tempErrors.phone = 'El número de teléfono es requerido.';
    } else if (!/^\d{7,10}$/.test(phone.trim())) {
      tempErrors.phone = 'Introduce un número de teléfono válido (7 a 10 dígitos).';
    }

    if (orderType === 'delivery') {
      if (!address.trim()) tempErrors.address = 'La dirección de entrega es requerida.';
      if (!reference.trim()) tempErrors.reference = 'La referencia de la dirección es requerida.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Tu carrito está vacío. Agrega platos del menú antes de continuar.');
      return;
    }
    if (!validateForm()) return;

    // Build itemized breakdown text for WhatsApp
    let itemDetailsText = '';
    cart.forEach((item, index) => {
      const obsText = item.observations.trim() ? ` (Obs: "${item.observations}")` : '';
      itemDetailsText += `${index + 1}. *${item.quantity}x* ${item.name}${obsText} -> *Bs ${item.price * item.quantity}*\n`;
    });

    // Formatting order text for the WhatsApp chat
    const formattedMessage = `¡Hola *El Chuquisaqueño*! 🍽️ Me gustaría realizar el siguiente pedido:

👤 *Cliente:* ${clientName}
📞 *Celular:* ${phone}
📍 *Modalidad:* ${orderType === 'delivery' ? '🚀 Delivery a domicilio' : '🛍️ Recojo en restaurante'}
${orderType === 'delivery' ? `🏠 *Dirección de entrega:* ${address}\n📍 *Referencia:* ${reference}\n🚚 *Costo de Delivery:* Bs ${deliveryCharge}\n` : ''}💵 *Método de Pago:* ${paymentMethod === 'qr' ? '📲 Pago QR coordinado por WhatsApp' : '💵 Efectivo al recibir'}
💬 *Observación General:* ${observations.trim() ? observations : 'Ninguna'}

📋 *Detalle del Pedido:*
${itemDetailsText}
💰 *Total a pagar:* *Bs ${total}*

_Por favor confírmenme el pedido para coordinar el envío. ¡Muchas gracias!_`;

    const whatsappUrl = `https://wa.me/59162418191?text=${encodeURIComponent(formattedMessage)}`;

    // Persist to central real-time database
    if (onAddOrder) {
      const boTime = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
      const newOrder: Order = {
        id: `PED-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName,
        phone,
        type: orderType,
        address: orderType === 'delivery' ? address : '',
        reference: orderType === 'delivery' ? reference : '',
        paymentMethod,
        observations,
        items: [...cart],
        total,
        date: new Date().toISOString().split('T')[0],
        time: boTime,
        status: 'Nuevo'
      };
      onAddOrder(newOrder);
    }

    setSuccess(true);
    onClearCart(); // Empty the cart upon success checkout

    // Open WhatsApp after a short delay
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1500);
  };

  const handleResetForm = () => {
    setClientName('');
    setPhone('');
    setAddress('');
    setReference('');
    setPaymentMethod('qr');
    setObservations('');
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif font-bold text-3xl text-stone-950">¡Pedido Enviado a WhatsApp!</h2>
          <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
            Hemos preparado tu mensaje de confirmación de pedido y abierto WhatsApp. Revisa el mensaje y presiona enviar en tu chat para que empecemos a cocinar.
          </p>
        </div>
        <div className="p-4 bg-brand-red-light rounded-2xl max-w-md mx-auto text-stone-900 font-semibold text-xs border border-brand-red/10">
          📍 Número de atención del restaurante: +591 62418191
        </div>
        <button
          onClick={handleResetForm}
          className="text-stone-500 hover:text-stone-900 text-xs font-bold underline cursor-pointer"
        >
          Realizar un nuevo pedido
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      
      {/* Title */}
      <div className="border-b border-stone-200 pb-5 mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
          Tu <span className="text-brand-red">Carrito</span> de Compras
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Gestiona tus platos seleccionados y completa los datos para recibir tu delicioso pedido por WhatsApp.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 max-w-lg mx-auto space-y-4">
          <div className="p-4 bg-stone-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8 text-stone-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-stone-950">Tu carrito está vacío</h3>
            <p className="text-stone-500 text-xs max-w-xs mx-auto">
              Aún no has agregado platos a tu pedido. Explora nuestro menú tradicional para empezar.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Cart Items (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                <span className="font-bold text-xs text-stone-700">Platos Seleccionados ({cart.length})</span>
                <button
                  onClick={onClearCart}
                  className="text-stone-500 hover:text-brand-red text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar Carrito
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {cart.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4 items-start">
                    {/* Image thumb */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl bg-stone-100 border border-stone-100 shrink-0"
                    />

                    {/* Details and Actions */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">{item.name}</h4>
                        <span className="font-bold text-sm text-brand-red whitespace-nowrap">
                          Bs {item.price * item.quantity}
                        </span>
                      </div>

                      {item.observations.trim() && (
                        <p className="text-stone-500 text-[11px] bg-stone-50 p-1.5 rounded-lg border border-stone-100 inline-block">
                          ✏️ "{item.observations}"
                        </p>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        {/* Selector */}
                        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-100">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1 rounded hover:bg-white text-stone-600 transition-all cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-stone-800 text-xs">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded hover:bg-white text-stone-600 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-stone-400 hover:text-brand-red p-1 rounded transition-all cursor-pointer"
                          title="Eliminar plato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subtotals footer */}
              <div className="p-4 bg-stone-50/50 border-t border-stone-100 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal de platos</span>
                  <span>Bs {subtotal}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between text-stone-600">
                    <span>Costo de envío (Delivery)</span>
                    <span>Bs {deliveryCharge}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total estimado</span>
                  <span>Bs {total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form (5 cols) */}
          <div className="lg:col-span-5">
            <form onSubmit={handleSendOrder} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-5">
              <h3 className="font-serif font-bold text-lg text-stone-950 border-b border-stone-100 pb-2">
                Datos de Entrega y Pago
              </h3>

              {/* Client Name */}
              <div className="space-y-1">
                <label htmlFor="cart-name" className="text-stone-700 font-bold text-xs block">
                  Nombre Completo *
                </label>
                <input
                  id="cart-name"
                  type="text"
                  placeholder="Ej. Andrés Quiroga"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/20 ${
                    errors.clientName ? 'border-brand-red focus:border-brand-red bg-brand-red-light/10' : 'border-stone-200 focus:border-brand-red bg-stone-50/50'
                  }`}
                />
                {errors.clientName && (
                  <p className="text-brand-red text-[11px] font-medium">{errors.clientName}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label htmlFor="cart-phone" className="text-stone-700 font-bold text-xs block">
                  Número de Celular *
                </label>
                <input
                  id="cart-phone"
                  type="tel"
                  placeholder="Ej. 71234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/20 ${
                    errors.phone ? 'border-brand-red focus:border-brand-red bg-brand-red-light/10' : 'border-stone-200 focus:border-brand-red bg-stone-50/50'
                  }`}
                />
                {errors.phone && (
                  <p className="text-brand-red text-[11px] font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Delivery vs Pickup */}
              <div className="space-y-2">
                <label className="text-stone-700 font-bold text-xs block">Modalidad de Entrega *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="cart-delivery-btn"
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      orderType === 'delivery'
                        ? 'border-brand-red bg-brand-red-light/50 text-brand-red shadow-sm'
                        : 'border-stone-200 text-stone-600 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" /> Delivery (+Bs {config.deliveryCost})
                  </button>
                  <button
                    id="cart-pickup-btn"
                    type="button"
                    onClick={() => setOrderType('pickup')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      orderType === 'pickup'
                        ? 'border-brand-red bg-brand-red-light/50 text-brand-red shadow-sm'
                        : 'border-stone-200 text-stone-600 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <Store className="w-4 h-4" /> Recojo Local
                  </button>
                </div>
              </div>

              {/* Delivery fields (Only shown when delivery is chosen) */}
              {orderType === 'delivery' && (
                <div className="space-y-3 p-3 bg-stone-50 rounded-xl border border-stone-150 animate-fade-in">
                  <div className="space-y-1">
                    <label htmlFor="cart-address" className="text-stone-700 font-bold text-[11px] block">
                      Dirección de Entrega *
                    </label>
                    <input
                      id="cart-address"
                      type="text"
                      placeholder="Calle, número de casa, edificio, departamento..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/10 ${
                        errors.address ? 'border-brand-red bg-brand-red-light/5' : 'border-stone-200 bg-white'
                      }`}
                    />
                    {errors.address && (
                      <p className="text-brand-red text-[10px] font-medium">{errors.address}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="cart-ref" className="text-stone-700 font-bold text-[11px] block">
                      Referencia de la Dirección *
                    </label>
                    <input
                      id="cart-ref"
                      type="text"
                      placeholder="Ej. Frente a la plaza, portón azul, tienda de barrio..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/10 ${
                        errors.reference ? 'border-brand-red bg-brand-red-light/5' : 'border-stone-200 bg-white'
                      }`}
                    />
                    {errors.reference && (
                      <p className="text-brand-red text-[10px] font-medium">{errors.reference}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-stone-700 font-bold text-xs block">Método de Pago *</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'qr'}
                      onChange={() => setPaymentMethod('qr')}
                      className="w-4 h-4 text-brand-red focus:ring-brand-red accent-brand-red"
                    />
                    <div>
                      <p className="font-bold text-stone-900">📲 Pago mediante QR por WhatsApp</p>
                      <p className="text-stone-500 text-[10px]">El restaurante te enviará el QR directo para pagar desde tu app bancaria.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="w-4 h-4 text-brand-red focus:ring-brand-red accent-brand-red"
                    />
                    <div>
                      <p className="font-bold text-stone-900">💵 Efectivo</p>
                      <p className="text-stone-500 text-[10px]">Paga al repartidor al recibir el delivery o en caja al recoger.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Observaciones generales */}
              <div className="space-y-1">
                <label htmlFor="cart-obs" className="text-stone-700 font-bold text-xs block">
                  Observaciones Adicionales
                </label>
                <textarea
                  id="cart-obs"
                  rows={2}
                  placeholder="Indicación sobre cubiertos, hora de entrega, cambio para billetes grandes..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-stone-50/50"
                />
              </div>

              {/* Submit Checkout */}
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-brand-red/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Enviar Pedido por WhatsApp <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-[10px] text-stone-400">
                  Tu pedido se resumirá en un mensaje preestablecido para coordinar el despacho por WhatsApp inmediatamente.
                </p>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
};

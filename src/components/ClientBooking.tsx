import React, { useState } from 'react';
import { Reservation, RestaurantConfig } from '../types';
import { Calendar, Clock, Users, MessageSquare, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';

interface ClientBookingProps {
  config: RestaurantConfig;
  reservations: Reservation[];
  onAddReservation: (reservation: Reservation) => void;
}

export const ClientBooking: React.FC<ClientBookingProps> = ({
  config,
  reservations,
  onAddReservation,
}) => {
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
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [peopleCount, setPeopleCount] = useState(2);
  const [comments, setComments] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  // Validate form
  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!clientName.trim()) tempErrors.clientName = 'El nombre completo es requerido.';
    if (!phone.trim()) {
      tempErrors.phone = 'El número de teléfono es requerido.';
    } else if (!/^\d{7,10}$/.test(phone.trim())) {
      tempErrors.phone = 'Introduce un número de teléfono válido (7 a 10 dígitos).';
    }

    if (!date) {
      tempErrors.date = 'La fecha de la reserva es requerida.';
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        tempErrors.date = 'No puedes reservar en fechas pasadas.';
      }
    }

    if (!time) {
      tempErrors.time = 'La hora de la reserva es requerida.';
    } else {
      const hourVal = parseInt(time.split(':')[0], 10);
      if (hourVal < 8 || hourVal >= 18) {
        tempErrors.time = 'El horario de reserva debe ser entre las 8:00 a. m. y las 6:00 p. m.';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Check if booking slot is fully booked (Warning state)
  // Let's count how many reservations are on the same date and hour slot
  const checkCapacityOverload = () => {
    if (!date || !time) return false;
    const sameSlotBookings = reservations.filter(
      res => res.date === date && 
             res.time.substring(0, 2) === time.substring(0, 2) && // same hour group
             ['Confirmada', 'Pendiente'].includes(res.status)
    );
    // If we have reservations equal to or exceeding total mesas, we warn the user
    return sameSlotBookings.length >= config.tablesCount;
  };

  const isOverload = checkCapacityOverload();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Create a client-side mockup reservation item
    const newRes: Reservation = {
      id: `RES-${Math.floor(100 + Math.random() * 900)}`,
      clientName,
      phone,
      date,
      time,
      peopleCount,
      tableAssigned: 'Por asignar',
      comments,
      status: 'Pendiente',
    };

    onAddReservation(newRes);
    setSuccess(true);

    // Format WhatsApp Message
    const formattedMessage = `Hola *El Chuquisaqueño* 🍽️, me gustaría solicitar una reserva de mesa:
    
👤 *Nombre:* ${clientName}
📞 *Teléfono:* ${phone}
📅 *Fecha:* ${date}
⏰ *Hora:* ${time}
👥 *Personas:* ${peopleCount} personas
💬 *Comentarios:* ${comments.trim() ? comments : 'Ninguno'}

_Por favor, confírmenme la disponibilidad de la mesa. ¡Muchas gracias!_`;

    const whatsappUrl = `https://wa.me/59162418191?text=${encodeURIComponent(formattedMessage)}`;

    // Open WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 1200);
  };

  const handleReset = () => {
    setClientName('');
    setPhone('');
    setDate('');
    setTime('');
    setPeopleCount(2);
    setComments('');
    setSuccess(false);
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-20">
      
      {/* View Title */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="px-3 py-1 bg-brand-red-light text-brand-red text-xs font-bold rounded-full uppercase tracking-wider">
          Mesa Exclusiva
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900">
          Reserva de <span className="text-brand-red">Mesas</span>
        </h1>
        <p className="text-stone-500 text-sm">
          Disfruta de nuestros exquisitos platos chuquisaqueños en un ambiente cálido y acogedor en Cochabamba.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left side: details card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-lg text-stone-950 border-b border-stone-100 pb-2">
              Políticas de Reserva
            </h3>
            
            <div className="flex gap-3 text-stone-700 text-xs leading-relaxed">
              <Clock className="w-5 h-5 text-brand-red shrink-0" />
              <div>
                <p className="font-bold">Horario Permitido</p>
                <p className="text-stone-500">{config.hours}</p>
              </div>
            </div>

            <div className="flex gap-3 text-stone-700 text-xs leading-relaxed">
              <Users className="w-5 h-5 text-brand-red shrink-0" />
              <div>
                <p className="font-bold">Capacidad Limitada</p>
                <p className="text-stone-500">
                  Disponemos de {config.tablesCount} mesas de servicio en el salón principal para garantizar el distanciamiento y confort.
                </p>
              </div>
            </div>

            <div className="flex gap-3 text-stone-700 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="font-bold">Confirmación por WhatsApp</p>
                <p className="text-stone-500">
                  Todas las reservas son solicitudes y están <span className="font-semibold text-brand-red">sujetas a confirmación previa</span> por parte de nuestro personal a través de WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Notice Map / Address */}
          <div className="bg-brand-red-light p-6 rounded-2xl border border-brand-red/10 text-stone-900 space-y-3">
            <h4 className="font-bold text-sm text-brand-red-dark">Nuestra ubicación física:</h4>
            <p className="text-xs text-stone-700">{config.address}</p>
            <p className="text-[11px] text-brand-red/80 font-semibold uppercase">Cochabamba - Bolivia</p>
          </div>
        </div>

        {/* Right side: Form container */}
        <div className="lg:col-span-3">
          {success ? (
            <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-md text-center space-y-5">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-2xl text-stone-950">¡Solicitud Generada!</h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto">
                  Hemos enviado los detalles a tu WhatsApp para que el restaurante te asigne tu mesa rápidamente.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl max-w-sm mx-auto text-left space-y-1.5 text-xs text-stone-700">
                <p>👤 <strong>Cliente:</strong> {clientName}</p>
                <p>📅 <strong>Fecha:</strong> {date}</p>
                <p>⏰ <strong>Hora:</strong> {time}</p>
                <p>👥 <strong>Personas:</strong> {peopleCount}</p>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <p className="text-xs text-stone-400">¿No se abrió WhatsApp de forma automática?</p>
                <a
                  href={`https://wa.me/59162418191?text=${encodeURIComponent(
                    `Hola El Chuquisaqueño, solicito reserva: ${clientName}, ${date} a las ${time}, para ${peopleCount} personas.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold shadow-sm inline-flex items-center justify-center gap-2 max-w-xs mx-auto"
                >
                  <Smartphone className="w-4 h-4" /> Reintentar Abrir WhatsApp
                </a>
                <button
                  onClick={handleReset}
                  className="text-stone-500 hover:text-stone-900 text-xs font-bold underline cursor-pointer mt-2"
                >
                  Hacer otra Reserva
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-stone-100 shadow-sm space-y-5">
              
              {/* Warnings if crowded */}
              {isOverload && (
                <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Alta Demanda Detectada:</span> Hay múltiples reservas agendadas en esta fecha y horario seleccionado. Sugerimos agendar con anticipación o buscar un horario alterno.
                  </div>
                </div>
              )}

              {/* Grid 2 cols */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nombre */}
                <div className="space-y-1">
                  <label htmlFor="booking-name" className="text-stone-700 font-bold text-xs block">
                    Nombre Completo *
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    placeholder="Ej. Juan Pérez Siles"
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

                {/* Teléfono */}
                <div className="space-y-1">
                  <label htmlFor="booking-phone" className="text-stone-700 font-bold text-xs block">
                    Número de Celular *
                  </label>
                  <input
                    id="booking-phone"
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

                {/* Fecha */}
                <div className="space-y-1">
                  <label htmlFor="booking-date" className="text-stone-700 font-bold text-xs block">
                    Fecha de la Reserva *
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // visual constraint in HTML
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/20 ${
                      errors.date ? 'border-brand-red focus:border-brand-red bg-brand-red-light/10' : 'border-stone-200 focus:border-brand-red bg-stone-50/50'
                    }`}
                  />
                  {errors.date && (
                    <p className="text-brand-red text-[11px] font-medium">{errors.date}</p>
                  )}
                </div>

                {/* Hora */}
                <div className="space-y-1">
                  <label htmlFor="booking-time" className="text-stone-700 font-bold text-xs block">
                    Hora de la Reserva *
                  </label>
                  <input
                    id="booking-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/20 ${
                      errors.time ? 'border-brand-red focus:border-brand-red bg-brand-red-light/10' : 'border-stone-200 focus:border-brand-red bg-stone-50/50'
                    }`}
                  />
                  <span className="text-[10px] text-stone-400 block mt-0.5">Atención: de 8:00 AM a 6:00 PM</span>
                  {errors.time && (
                    <p className="text-brand-red text-[11px] font-medium">{errors.time}</p>
                  )}
                </div>

                {/* Personas */}
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="booking-people" className="text-stone-700 font-bold text-xs block">
                    Cantidad de Personas *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="booking-people"
                      type="range"
                      min="1"
                      max="15"
                      value={peopleCount}
                      onChange={(e) => setPeopleCount(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-brand-red"
                    />
                    <span className="w-14 text-center font-bold text-stone-900 text-sm border border-stone-200 px-2 py-1 rounded-lg bg-stone-50">
                      {peopleCount} {peopleCount === 1 ? 'Persona' : 'Pers.'}
                    </span>
                  </div>
                </div>

                {/* Comentarios */}
                <div className="space-y-1 md:col-span-2">
                  <label htmlFor="booking-comments" className="text-stone-700 font-bold text-xs block flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-400" /> Comentario o Pedido Especial (Opcional)
                  </label>
                  <textarea
                    id="booking-comments"
                    rows={3}
                    placeholder="Ej. Cumpleaños, mesa cerca a la ventana, silla de bebé..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-stone-50/50"
                  />
                </div>

              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-brand-red hover:bg-brand-red-dark text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-brand-red/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                Solicitar Reserva por WhatsApp
              </button>

              <p className="text-center text-[10px] text-stone-400">
                Al enviar la solicitud, se te redireccionará a WhatsApp para enviar el mensaje estructurado de manera instantánea.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ClientRegisterViewProps {
  onSuccess: (user: { id: string; name: string; email: string; role: string }) => void;
  onCancel: () => void;
}

export function ClientRegisterView({ onSuccess, onCancel }: ClientRegisterViewProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const url = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error inesperado');
      }

      if (isLogin) {
        setSuccess('¡Inicio de sesión exitoso!');
      } else {
        setSuccess('¡Registro completado con éxito!');
      }

      // Short delay for user to see success before redirecting
      setTimeout(() => {
        onSuccess(data.client);
      }, 1000);

    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 px-4 animate-scale-up">
      <button
        onClick={onCancel}
        className="mb-6 flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-brand-red transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a la Carta
      </button>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-br from-brand-red to-amber-600 p-8 text-white text-center space-y-2">
          <div className="w-14 h-14 bg-white text-brand-red rounded-full flex items-center justify-center mx-auto text-2xl font-serif font-black shadow-lg">
            EC
          </div>
          <div>
            <h2 className="font-serif font-black text-2xl">El Chuquisaqueño</h2>
            <p className="text-xs opacity-90">Portal de Registro de Clientes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-100">
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 text-xs font-bold tracking-wider uppercase transition-colors border-b-2 ${
              !isLogin
                ? 'border-brand-red text-brand-red bg-amber-50/10'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 text-xs font-bold tracking-wider uppercase transition-colors border-b-2 ${
              isLogin
                ? 'border-brand-red text-brand-red bg-amber-50/10'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-4">
          <div className="text-center space-y-1 mb-2">
            <h3 className="font-serif font-bold text-stone-900 text-base">
              {isLogin ? 'Ingresa a tu cuenta de cliente' : 'Crea tu cuenta de cliente'}
            </h3>
            <p className="text-[11px] text-stone-500 leading-normal">
              {isLogin
                ? 'Ingresa tus credenciales para acceder a tus pedidos en tiempo real.'
                : 'Regístrate para realizar pedidos y dar seguimiento instantáneo a tus órdenes.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-start gap-2.5 text-xs animate-scale-up">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-3 text-xs">
            {/* Name Field (Only on Register) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Nombre Completo *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-red"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Correo Electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-stone-700 font-bold block">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-brand-red hover:bg-brand-red-dark text-white font-bold rounded-xl shadow-lg shadow-brand-red/10 transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span>Cargando...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta'}</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-stone-50 p-4 border-t border-stone-100 text-center text-[10px] text-stone-500 leading-normal">
          🔒 Registro instantáneo en tiempo real de tu cuenta para la carta digital interactiva.
        </div>
      </div>
    </div>
  );
}

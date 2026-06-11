import { useState, useEffect } from "react";
import { useOutletContext, Link, useNavigate } from "react-router";
import { Clock, Bike, Store, ShoppingBag, ChevronRight, CheckCircle2, Wallet, QrCode, AlertTriangle, XCircle } from "lucide-react";
import { AppContextType } from "../components/Layout";

export function Pedidos() {
  const { orders, removeOrder, updateOrderStatus, user } = useOutletContext<AppContextType>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);
  
  // Modals state
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [reportOrderId, setReportOrderId] = useState<string | null>(null);

  // Simular que el pedido se completa después de 5 segundos
  useEffect(() => {
    const timers = orders.map((order) => {
      if (order.status === "PREPARANDO") {
        return setTimeout(() => {
          updateOrderStatus(order.id, "EN CAMINO");
        }, 8000); // 8 segundos para simular el tiempo de espera
      }
      return null;
    });

    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [orders, updateOrderStatus]);

  if (orders.filter(o => o.status !== "COMPLETADO").length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 pt-20 pb-10 flex-1 text-center">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-16 h-16 text-gray-300" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Aún no tienes pedidos en cola</h2>
        <p className="text-gray-500 font-medium mb-8 max-w-[250px]">Explora nuestro menú y anímate a probar el mejor pollo de la ciudad.</p>
        <Link 
          to="/menu"
          className="bg-[#E60000] text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider shadow-lg hover:bg-[#CC0000] transition-colors"
        >
          Ver Menú
        </Link>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status !== "COMPLETADO");

  return (
    <div className="flex flex-col px-5 py-6 max-w-lg mx-auto w-full relative z-10 gap-6">
      
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tus Pedidos</h1>
        <span className="bg-red-100 text-[#E60000] font-black text-xs px-3 py-1.5 rounded-full">
          {activeOrders.length} Activo{activeOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col gap-5 pb-10">
        {activeOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-[32px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden">
            
            {/* Cabecera / Estado */}
            <div className="flex items-start justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`${order.status === 'EN CAMINO' ? 'bg-[#3B82F6]' : 'bg-[#10B981]'} p-2.5 rounded-xl shadow-sm transition-colors`}>
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 leading-tight">
                    {order.status === 'EN CAMINO' ? '¡Pedido en Camino/Listo!' : 'En Preparación'}
                  </h3>
                  <p className="text-xs font-bold text-gray-500">Orden #{order.id}</p>
                </div>
              </div>
              <div className={`bg-orange-50 text-[#F59E0B] px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${order.status === 'EN CAMINO' ? 'hidden' : ''}`}>
                <Clock className="w-4 h-4" />
                <span className="font-black text-sm">{order.estimatedTime}</span>
              </div>
            </div>

            {/* Barra de Progreso Simulada */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${order.status === 'EN CAMINO' ? 'w-full bg-[#3B82F6]' : 'w-[40%] bg-[#10B981] animate-pulse'}`} />
            </div>

            {/* Detalles del Pedido */}
            <div className="bg-[#F8FAFC] rounded-2xl p-4 mb-4 border border-gray-100">
              <p className="font-bold text-gray-800 text-lg mb-1 leading-snug">{order.itemName}</p>
              <div className="flex justify-between items-end mt-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total pagado</span>
                <span className="text-xl font-black text-[#E60000]">Bs. {order.total}</span>
              </div>
            </div>

            {/* Info de Entrega & Pago */}
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 text-center">
                {order.deliveryMethod === "ENVÍO A DOMICILIO" ? (
                  <Bike className="w-5 h-5 text-gray-500" />
                ) : (
                  <Store className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-[10px] font-black text-gray-600 uppercase leading-tight">{order.deliveryMethod}</span>
              </div>

              <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 text-center">
                {order.paymentMethod === "EFECTIVO" ? (
                  <Wallet className="w-5 h-5 text-gray-500" />
                ) : (
                  <QrCode className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-[10px] font-black text-gray-600 uppercase leading-tight">
                  {order.paymentMethod === "EFECTIVO" ? "EFECTIVO" : "PAGO POR QR"}
                </span>
              </div>
            </div>

            {/* Order Actions based on Status */}
            <div className="mt-5 border-t border-gray-100 pt-4 flex flex-col gap-3">
              <button
                onClick={() => setCancelOrderId(order.id)}
                className={`w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-[#E60000] font-black py-3 rounded-2xl transition-colors text-sm uppercase tracking-wider ${order.status === "PREPARANDO" ? "" : "hidden"}`}
              >
                <XCircle className="w-5 h-5" /> Cancelar Pedido
              </button>
              
              <div className={`flex flex-col gap-3 ${order.status !== "PREPARANDO" ? "" : "hidden"}`}>
                <button
                  onClick={() => updateOrderStatus(order.id, "COMPLETADO")}
                  className="w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black py-3.5 rounded-2xl transition-colors shadow-md text-sm uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-5 h-5" /> Ya he recibido el pedido
                </button>
                <button
                  onClick={() => setReportOrderId(order.id)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-2xl transition-colors text-sm"
                >
                  <AlertTriangle className="w-5 h-5" /> Reportar error o percance
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
      
      {/* Modal Confirmar Cancelación */}
      {cancelOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#E60000]">
              <XCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">¿Cancelar Pedido?</h3>
            <p className="text-gray-500 font-medium mb-6">Esta acción no se puede deshacer y perderás tu turno en la cocina.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setCancelOrderId(null)}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                No, mantener
              </button>
              <button 
                onClick={() => {
                  removeOrder(cancelOrderId);
                  setCancelOrderId(null);
                }}
                className="flex-1 py-3.5 rounded-xl font-black text-white bg-[#E60000] hover:bg-[#CC0000] shadow-md transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reportar Error */}
      {reportOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#F59E0B]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">¿Tuviste un problema?</h3>
            <p className="text-gray-500 font-medium mb-6">
              Por favor, comunícate inmediatamente con nuestro soporte telefónico para resolver tu percance.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Línea de atención</p>
              <p className="text-2xl font-black text-[#E60000] tracking-tight">+591 69209742</p>
            </div>
            <button 
              onClick={() => setReportOrderId(null)}
              className="w-full py-4 rounded-xl font-black text-white bg-[#F59E0B] hover:bg-[#D97706] shadow-md transition-colors uppercase tracking-wider"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

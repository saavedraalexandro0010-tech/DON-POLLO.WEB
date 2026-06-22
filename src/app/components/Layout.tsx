import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { ShoppingCart, UtensilsCrossed, Home, Phone, MapPin, User } from "lucide-react";
import logoImg from "figma:asset/1b250b5ccd268dca2b6289d13db65831f3d42fad.png";
import { useState, useEffect } from "react";
import { ProfileModal } from "./ProfileModal";
import { supabase } from "../../lib/supabase";

// Tipo del pedido para compartir en el Contexto
export type AppOrder = {
  id: string;
  itemName: string;
  total: number;
  deliveryMethod: "RETIRO EN TIENDA" | "ENVÍO A DOMICILIO";
  paymentMethod: "EFECTIVO" | "QR";
  status: "PREPARANDO" | "EN CAMINO" | "LISTO PARA RECOGER" | "COMPLETADO";
  estimatedTime: string;
  timestamp: Date;
  hasDiscount?: boolean;
  discountPercent?: number;
  subtotal?: number;
};

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  password?: string;
};

export type AppContextType = {
  orders: AppOrder[];
  addOrder: (order: AppOrder) => void;
  removeOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: AppOrder["status"]) => void;
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateUser: (user: UserProfile) => Promise<{ success: boolean; message: string }>;
  discount: number;
  applyDiscount: (code: string) => { success: boolean; message: string };
  openProfile: () => void;
  registeredUsers: UserProfile[];
  registerUser: (user: UserProfile) => void;
};

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = sessionStorage.getItem("don_pollo_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [dbUsedCodes, setDbUsedCodes] = useState<string[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [coupons, setCoupons] = useState<{ code: string; discount_percent: number }[]>([]);

  // Helper para guardar en sessionStorage
  const updateLocalUser = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        sessionStorage.setItem("don_pollo_user", JSON.stringify(u));
      } else {
        sessionStorage.removeItem("don_pollo_user");
      }
    } catch (e) {
      console.error("Error updating local user:", e);
    }
  };

  // Helper para cargar todos los cupones válidos
  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("code, discount_percent");
    if (data) {
      setCoupons(data);
    }
  };

  // Helper para cargar códigos de descuento y calcular el descuento acumulado activo
  const fetchUsedCodes = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // 1. Obtener cupones canjeados por este usuario para calcular el descuento activo
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("used_by", session.user.id);
      
      if (data) {
        const activeCodes = data.filter((d) => !d.order_id);
        
        let totalDiscount = 0;
        activeCodes.forEach(ac => {
          totalDiscount += ac.discount_percent;
        });
        setDiscount(Math.min(100, totalDiscount));
      }

      // 2. Obtener todos los cupones que ya han sido canjeados globalmente (para bloquear su uso a otros usuarios)
      const { data: globalUsed } = await supabase
        .from("coupons")
        .select("code")
        .eq("is_used", true);
      
      if (globalUsed) {
        setDbUsedCodes(globalUsed.map((d) => d.code));
      }
    }
  };

  // Helper para sincronizar el perfil de Supabase o autorecuperarlo (self-healing)
  const syncProfileAndGetDetails = async (session: any) => {
    let { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    
    let currentLocalName = "Usuario";
    let currentLocalPhone = "";
    try {
      const stored = sessionStorage.getItem("don_pollo_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        currentLocalName = parsed.name || "Usuario";
        currentLocalPhone = parsed.phone || "";
      }
    } catch {}

    if (!profile || error) {
      // Autorecuperación: Crear fila si no existe
      const newProfile = {
        id: session.user.id,
        username: session.user.user_metadata?.username || currentLocalName || "Usuario",
        phone: session.user.user_metadata?.phone || currentLocalPhone || "",
        role: "client"
      };
      const { data: insertedProfile } = await supabase
        .from("profiles")
        .upsert(newProfile)
        .select()
        .single();
      if (insertedProfile) {
        profile = insertedProfile;
      }
    }

    return {
      name: profile?.username || session.user.user_metadata?.username || currentLocalName,
      email: session.user.email || "",
      phone: profile?.phone || session.user.user_metadata?.phone || currentLocalPhone,
    };
  };

  // 1. Efecto al montar: restaurar sesión y escuchar cambios de auth
  useEffect(() => {
    const initSession = async () => {
      await fetchCoupons();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const details = await syncProfileAndGetDetails(session);
        updateLocalUser(details);
        await fetchUsedCodes();
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const details = await syncProfileAndGetDetails(session);
        updateLocalUser(details);
        await fetchUsedCodes();
      } else {
        updateLocalUser(null);
        setOrders([]);
        setDbUsedCodes([]);
        setDiscount(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Efecto para cargar pedidos cuando el usuario esté cargado
  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        
        if (data) {
          setOrders(data.map(o => ({
            id: o.id,
            itemName: o.item_name,
            total: Number(o.total),
            deliveryMethod: o.delivery_method as any,
            paymentMethod: o.payment_method as any,
            status: o.status as any,
            estimatedTime: o.estimated_time,
            timestamp: new Date(o.created_at),
            hasDiscount: o.has_discount,
            discountPercent: o.discount_percent,
            subtotal: o.subtotal ? Number(o.subtotal) : undefined
          })));
        }
      }
    };
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  // 3. Efecto para cargar códigos de descuento ya usados por el usuario desde Supabase
  useEffect(() => {
    if (user) {
      fetchUsedCodes();
    } else {
      setDiscount(0);
    }
  }, [user]);

  const addOrder = async (order: AppOrder) => {
    // Primero actualizamos estado local
    setOrders((prev) => [order, ...prev]);

    // Luego guardamos en Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Guardar pedido
      const { error: orderErr } = await supabase.from("orders").insert({
        id: order.id,
        user_id: session.user.id,
        item_name: order.itemName,
        total: order.total,
        delivery_method: order.deliveryMethod,
        payment_method: order.paymentMethod,
        status: order.status,
        estimated_time: order.estimatedTime,
        has_discount: order.hasDiscount,
        discount_percent: order.discountPercent,
        subtotal: order.subtotal
      });
      if (orderErr) {
        console.error("Error al guardar pedido en base de datos:", orderErr.message);
      }

      // Vincular todos los descuentos activos del usuario (order_id IS NULL) a este pedido en coupons
      const { error: discountErr } = await supabase
        .from("coupons")
        .update({ order_id: order.id })
        .eq("used_by", session.user.id)
        .is("order_id", null);
      
      if (discountErr) {
        console.error("Error al vincular códigos de descuento al pedido:", discountErr.message);
      }
      
      // Recargar descuentos
      await fetchUsedCodes();
    }
  };

  const removeOrder = async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));

    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      console.error("Error al cancelar pedido de la base de datos:", error.message);
    }
  };

  const updateOrderStatus = async (id: string, status: AppOrder["status"]) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));

    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      console.error("Error al actualizar estado de pedido en base de datos:", error.message);
    }
  };

  const login = (userData: UserProfile) => updateLocalUser(userData);

  const logout = async () => {
    await supabase.auth.signOut();
    updateLocalUser(null);
    setDiscount(0);
    setDbUsedCodes([]);
    setOrders([]);
    navigate("/");
  };

  const registerUser = (userData: UserProfile) => setRegisteredUsers((prev) => [...prev, userData]);

  const updateUser = async (userData: UserProfile): Promise<{ success: boolean; message: string }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { success: false, message: "No hay sesión activa." };

    // Actualizar localmente
    updateLocalUser(userData);

    // Actualizar tabla profiles (el nombre ya no se actualiza porque es permanente)
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        phone: userData.phone
      })
      .eq("id", session.user.id);
    
    if (profileErr) {
      console.error("Error al actualizar perfil en base de datos:", profileErr.message);
      return { success: false, message: "Error al guardar en base de datos." };
    }

    return { success: true, message: "Perfil actualizado correctamente." };
  };

  const applyDiscount = async (code: string) => {
    if (discount >= 100) return { success: false, message: "Has alcanzado el límite máximo de descuento (100%)." };
    
    // Consultar el estado del cupón directamente de la base de datos
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .single();
    
    if (error || !coupon) return { success: false, message: "Código inválido." };
    if (coupon.is_used) return { success: false, message: "Este código ya fue utilizado." };
    
    // Registrar el descuento marcando el cupón como usado globalmente e inmediatamente
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error: updateErr } = await supabase
        .from("coupons")
        .update({
          is_used: true,
          used_by: session.user.id,
          used_at: new Date().toISOString(),
          order_id: null
        })
        .eq("code", code)
        .eq("is_used", false); // Evita condiciones de carrera
      
      if (updateErr) {
        console.error("Error al registrar descuento en Supabase:", updateErr.message);
        return { success: false, message: "Error al aplicar descuento. Intenta de nuevo." };
      }
      
      await fetchUsedCodes();
      return { success: true, message: `¡Descuento aplicado! +${coupon.discount_percent}%` };
    }
    
    return { success: false, message: "Debes iniciar sesión para aplicar descuentos." };
  };

  const isHome = location.pathname === "/";
  const isAuth = location.pathname === "/auth";
  const isOrderConfig = location.pathname.startsWith("/pedido/");
  const isMenu = location.pathname === "/menu";

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex flex-col font-sans text-gray-900 relative">
      
      {/* Decorative Background Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.81-5.81l.83.83-1.66 1.66-.83-.83.83-.83zm-5.81-5.81l.83.83-1.66 1.66-.83-.83.83-.83zM30 30c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-2c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header Clásico (Oculto en Home y Auth) */}
      {!isHome && !isAuth && (
        <header className="sticky top-0 z-40 shadow-md">
          {!isOrderConfig && (
            <div className="bg-[#E60000] pb-2 pt-3 px-4 flex justify-between items-center w-full shadow-inner z-20 relative border-b border-red-500/50">
              <div className="bg-white/95 backdrop-blur-md shadow-md rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 text-gray-800 cursor-pointer">
                <Phone className="w-4 h-4 text-[#E60000]" strokeWidth={2.5} />
                <span className="text-xs sm:text-sm font-black tracking-widest">+591 69209742</span>
              </div>
              {user && (
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="bg-white/95 backdrop-blur-md shadow-md rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[#E60000] hover:scale-105 transition-transform"
                >
                  <User className="w-5 h-5" strokeWidth={2.5} />
                </button>
              )}
            </div>
          )}

          <div className="bg-[#FF0000] h-16 relative flex justify-center border-b-[6px] border-[#F4B41A] shadow-md">
            <div className="absolute -bottom-10 w-28 h-28 bg-white rounded-full p-1.5 shadow-[0_10px_30px_rgba(230,0,0,0.4)] ring-[4px] ring-[#F4B41A] z-20 flex items-center justify-center overflow-visible">
              <div className="absolute inset-0 rounded-full bg-[#E60000] blur-md opacity-20" />
              <img src={logoImg} alt="Don Pollo Logo" className="w-full h-full object-contain scale-[1.15] mt-1 relative z-10 drop-shadow-md hover:scale-[1.2] transition-transform" />
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full mx-auto relative z-10 ${isAuth ? 'pb-10' : isHome ? 'pb-32' : isOrderConfig ? 'max-w-lg pb-0 pt-10' : 'max-w-lg pb-32 pt-10'}`}>
        <Outlet context={{ 
          orders, addOrder, removeOrder, updateOrderStatus,
          user, login, logout, updateUser, discount, applyDiscount,
          openProfile: () => setIsProfileOpen(true),
          registeredUsers, registerUser
        } satisfies AppContextType} />
      </main>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        user={user}
        updateUser={updateUser}
        orders={orders}
        discount={discount}
        applyDiscount={applyDiscount}
        logout={logout}
      />

      {/* Bottom Navigation */}
      {!isOrderConfig && !isHome && !isAuth && (
        <nav className={`fixed bottom-0 w-full left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.1)] border-t border-gray-100 flex justify-around items-center pb-safe pt-3 px-6 z-50 pb-5 max-w-lg`}>
          <button
            onClick={() => user ? setShowLogoutConfirm(true) : navigate("/")}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${isHome ? 'text-[#E60000] scale-110' : 'text-gray-400 hover:text-red-400'}`}
          >
            <div className={`p-2 rounded-2xl ${isHome ? 'bg-red-50 shadow-inner' : 'bg-transparent'}`}>
              <Home className="w-7 h-7" strokeWidth={isHome ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Inicio</span>
          </button>

          <Link
            to="/menu"
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${location.pathname === '/menu' ? 'text-[#E60000] scale-110' : 'text-gray-400 hover:text-red-400'}`}
          >
            <div className={`p-2 rounded-2xl ${location.pathname === '/menu' ? 'bg-red-50 shadow-inner' : 'bg-transparent'}`}>
              <UtensilsCrossed className="w-7 h-7" strokeWidth={location.pathname === '/menu' ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Menú</span>
          </Link>

          <Link
            to="/pedidos"
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 group relative ${location.pathname === '/pedidos' ? 'text-[#E60000] scale-110' : 'text-gray-400 hover:text-red-400'}`}
          >
            <div className={`p-2 rounded-2xl transition-colors ${location.pathname === '/pedidos' ? 'bg-red-50 shadow-inner' : 'group-hover:bg-red-50'}`}>
              <ShoppingCart className="w-7 h-7" strokeWidth={location.pathname === '/pedidos' ? 2.5 : 2} />
              {orders.filter(o => o.status !== "COMPLETADO").length > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-[#F4B41A] text-[#6D3412] text-[11px] font-black flex items-center justify-center rounded-full shadow-md ring-2 ring-white animate-bounce">
                  {orders.filter(o => o.status !== "COMPLETADO").length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">Pedidos</span>
          </Link>
        </nav>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-[90%] max-w-sm bg-white rounded-[32px] shadow-2xl p-6 animate-in zoom-in duration-300">
            <h3 className="text-2xl font-black text-gray-900 mb-3 text-center">¿Deseas cerrar sesión?</h3>
            <p className="text-gray-600 font-medium text-center mb-6">Si cierras sesión, volverás al inicio de la aplicación.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black py-3 rounded-2xl transition-colors"
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 bg-[#E60000] hover:bg-[#CC0000] text-white font-black py-3 rounded-2xl transition-colors shadow-md"
              >
                CERRAR SESIÓN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, Flame, ShoppingBag, Check, Bike, Store, Wallet, QrCode, X } from "lucide-react";
import { Link, useParams, useNavigate, useOutletContext } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { AppContextType, AppOrder } from "../components/Layout";
import { supabase } from "../../lib/supabase";

// Datos de items globales (Fallback local)
const ITEMS_DATA = {
  pollo: {
    title: "Pollo",
    imageBroaster: "https://images.unsplash.com/photo-1672856399624-61b47d70d339?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlzcHklMjBmcmllZCUyMGNoaWNrZW58ZW58MXx8fHwxNzczMTMyNTk1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageBrasa: "https://images.unsplash.com/photo-1652545296882-cf7f118c4df5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJ1dmlhbiUyMHJvYXN0ZWQlMjBjaGlja2VufGVufDF8fHx8MTc3MzE3NDYzM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    portions: [
      { id: '1/4', name: 'Cuarto', basePrice: 20 },
      { id: '1/2', name: 'Medio', basePrice: 38 },
      { id: '1', name: 'Entero', basePrice: 70 },
    ],
    hasTypes: true
  },
  alitas: {
    title: "Cubeta de Alitas",
    imageBroaster: "https://images.unsplash.com/photo-1670688866261-db6697858df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMGNoaWNrZW4lMjB3aW5ncyUyMGJ1Y2tldHxlbnwxfHx8fDE3NzMxNzUwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    portions: [
      { id: '6pz', name: '6 Piezas', basePrice: 25 },
      { id: '12pz', name: '12 Piezas', basePrice: 45 },
    ],
    hasTypes: false
  },
  burger: {
    title: "Burguer Chicken",
    imageBroaster: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYnVyZ2VyfGVufDF8fHx8MTc3MzE3NTA3MHww&ixlib=rb-4.1.0&q=80&w=1080",
    portions: [
      { id: 'simple', name: 'Simple', basePrice: 18 },
      { id: 'doble', name: 'Doble Especial', basePrice: 28 },
    ],
    hasTypes: false
  },
  nuggets: {
    title: "Nuggets de Pollo",
    imageBroaster: "https://images.unsplash.com/photo-1619881590738-a111d176d906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwbnVnZ2V0c3xlbnwxfHx8fDE3NzMxMjM1MzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    portions: [
      { id: '6pz', name: '6 Piezas', basePrice: 15 },
      { id: '10pz', name: '10 Piezas', basePrice: 22 },
    ],
    hasTypes: false
  },
  salchibroaster: {
    title: "Salchi-Broaster Especial",
    imageBroaster: "https://images.unsplash.com/photo-1639744210631-209fce3e256c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2FkZWQlMjBmcmllc3xlbnwxfHx8fDE3NzMxNzc3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    portions: [
      { id: 'personal', name: 'Personal', basePrice: 20 },
      { id: 'familiar', name: 'Familiar', basePrice: 35 },
    ],
    hasTypes: false
  }
};

const CHICKEN_TYPES = [
  { id: 'broaster', name: 'Broaster', desc: 'Crujiente', icon: '🍗' },
  { id: 'brasa', name: 'A la Brasa', desc: 'Jugoso', icon: '🔥' },
];

const SIDES = [
  { id: 'papas', name: 'Papas Fritas', price: 0 },
  { id: 'arroz', name: 'Arroz', price: 0 },
  { id: 'ambas', name: 'Papas y Arroz', price: 5 },
];

const DRINKS = [
  { id: 'ninguna', name: 'Sin Bebida', price: 0 },
  { id: 'personal', name: 'Gaseosa Personal', price: 5 },
  { id: 'litro', name: 'Gaseosa 1L', price: 12 },
  { id: '2litros', name: 'Gaseosa 2L', price: 18 },
];

export function Order() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addOrder, user, discount, applyDiscount } = useOutletContext<AppContextType>();
  
  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  // Encontrar la configuración o por defecto pollo (Fallback)
  const fallbackConfig = ITEMS_DATA[id as keyof typeof ITEMS_DATA] || ITEMS_DATA.pollo;
  const [itemConfig, setItemConfig] = useState(fallbackConfig);

  const [selectedType, setSelectedType] = useState(CHICKEN_TYPES[0].id);
  const [selectedPortion, setSelectedPortion] = useState(fallbackConfig.portions[0].id);
  const [selectedSide, setSelectedSide] = useState(SIDES[0].id);
  const [selectedDrink, setSelectedDrink] = useState(DRINKS[0].id);
  const [quantity, setQuantity] = useState(1);

  // Efecto para cargar dinámicamente desde la base de datos
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("menu")
        .select("*")
        .eq("id", id)
        .single();
      
      if (data) {
        const config = {
          title: data.title,
          imageBroaster: data.image_broaster || data.image_url,
          imageBrasa: data.image_brasa || data.image_url,
          portions: data.portions || fallbackConfig.portions,
          hasTypes: data.has_types
        };
        setItemConfig(config);
        setSelectedPortion(config.portions[0].id);
      }
    };
    fetchItem();
  }, [id]);

  // Estados de Checkout (Modal)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"RETIRO EN TIENDA" | "ENVÍO A DOMICILIO">("ENVÍO A DOMICILIO");
  const [paymentMethod, setPaymentMethod] = useState<"EFECTIVO" | "QR">("EFECTIVO");

  const { totalPrice, subtotal, discountAmount } = useMemo(() => {
    const portionPrice = itemConfig.portions.find(p => p.id === selectedPortion)?.basePrice || 0;
    const sidePrice = SIDES.find(s => s.id === selectedSide)?.price || 0;
    const drinkPrice = DRINKS.find(d => d.id === selectedDrink)?.price || 0;
    const sub = (portionPrice + sidePrice + drinkPrice) * quantity;
    const disc = discount > 0 ? (sub * discount) / 100 : 0;
    return {
      subtotal: sub,
      discountAmount: disc,
      totalPrice: Math.max(0, sub - disc)
    };
  }, [selectedPortion, selectedSide, selectedDrink, quantity, itemConfig.portions, discount]);

  const activeImage = (itemConfig.hasTypes && selectedType === 'brasa') 
    ? itemConfig.imageBrasa 
    : itemConfig.imageBroaster;

  const handleConfirmOrder = () => {
    // Crear objeto de orden
    const newOrder: AppOrder = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      itemName: `${quantity}x ${itemConfig.title} ${itemConfig.hasTypes ? `(${selectedType})` : ''}`,
      total: totalPrice,
      deliveryMethod,
      paymentMethod,
      status: "PREPARANDO",
      estimatedTime: deliveryMethod === "ENVÍO A DOMICILIO" ? "35 - 45 min" : "15 - 20 min",
      timestamp: new Date(),
      hasDiscount: discount > 0,
      discountPercent: discount > 0 ? discount : undefined,
      subtotal: discount > 0 ? subtotal : undefined
    };

    addOrder(newOrder);
    setIsCheckoutOpen(false);

    // Navegar directamente a pedidos para ver el estado
    navigate('/pedidos');
  };

  return (
    <div className="flex flex-col bg-[#FFFDF5] min-h-[100dvh] pb-[160px] font-sans relative">
      
      {/* Header Sticky con botón para volver a Menú */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md shadow-sm z-30 px-4 py-3 flex items-center gap-4 border-b border-gray-100">
        <Link to="/menu" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors bg-gray-50 text-gray-700 shadow-sm border border-gray-200">
          <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
        </Link>
        <h1 className="text-xl font-black text-gray-900 leading-none flex items-center gap-2">
          Armar Pedido
        </h1>
      </div>

      {/* Hero Image */}
      <div className="w-full h-64 relative bg-gray-900 overflow-hidden shadow-md shrink-0">
        <ImageWithFallback 
          src={activeImage}
          alt={itemConfig.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h2 className="text-4xl font-black tracking-tight leading-none drop-shadow-lg mb-1">
            {itemConfig.title}
          </h2>
          <p className="text-sm font-bold text-[#F4B41A] uppercase tracking-wider">
            Personaliza tus opciones
          </p>
        </div>
      </div>

      {/* Opciones de Configuración */}
      <div className="flex flex-col gap-8 px-5 py-6 flex-1">
        
        {/* 1. Tipo de Pollo (Solo si el item lo permite) */}
        {itemConfig.hasTypes && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-900">¿Qué tipo de cocción?</h3>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Obligatorio</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CHICKEN_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-[3px] transition-all duration-200 ${
                    selectedType === type.id 
                    ? 'border-[#E60000] bg-red-50 shadow-[0_4px_12px_rgba(230,0,0,0.15)]' 
                    : 'border-gray-200 bg-white hover:border-red-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-4xl mb-2 block">{type.icon}</span>
                  <span className={`text-base font-bold ${selectedType === type.id ? 'text-red-700' : 'text-gray-700'}`}>
                    {type.name}
                  </span>
                  <span className="text-xs font-medium text-gray-500 mt-0.5">{type.desc}</span>
                  
                  {/* Indicator Checkmark */}
                  <div className={`absolute top-2 right-2 rounded-full p-0.5 transition-opacity ${selectedType === type.id ? 'opacity-100 bg-[#E60000] text-white' : 'opacity-0'}`}>
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 2. Tamaño de la porción */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Tamaño / Porción</h3>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Obligatorio</span>
          </div>
          <div className="flex flex-col gap-3">
            {itemConfig.portions.map(portion => (
              <label 
                key={portion.id}
                onClick={() => setSelectedPortion(portion.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-[3px] cursor-pointer transition-all ${
                  selectedPortion === portion.id 
                  ? 'border-[#E60000] bg-red-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-red-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-colors ${
                    selectedPortion === portion.id ? 'border-[#E60000]' : 'border-gray-300'
                  }`}>
                    {selectedPortion === portion.id && <div className="w-2.5 h-2.5 bg-[#E60000] rounded-full" />}
                  </div>
                  <span className={`text-lg font-black ${selectedPortion === portion.id ? 'text-gray-900' : 'text-gray-600'}`}>
                    {portion.name}
                  </span>
                </div>
                <span className="text-lg font-black text-[#E60000]">
                  Bs. {portion.basePrice}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* 3. Guarniciones */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Elige tu guarnición</h3>
            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">1 Opción</span>
          </div>
          <div className="flex flex-col gap-3">
            {SIDES.map(side => (
              <label 
                key={side.id}
                onClick={() => setSelectedSide(side.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-[3px] cursor-pointer transition-all ${
                  selectedSide === side.id 
                  ? 'border-[#F4B41A] bg-[#FFFDF5] shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-[#F4B41A]/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-colors ${
                    selectedSide === side.id ? 'border-[#F4B41A]' : 'border-gray-300'
                  }`}>
                    {selectedSide === side.id && <div className="w-2.5 h-2.5 bg-[#F4B41A] rounded-full" />}
                  </div>
                  <span className={`text-lg font-black ${selectedSide === side.id ? 'text-gray-900' : 'text-gray-600'}`}>
                    {side.name}
                  </span>
                </div>
                {side.price > 0 && (
                  <span className="text-sm font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                    + Bs. {side.price}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* 4. Bebidas */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900">Añade una Bebida</h3>
            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase">Opcional</span>
          </div>
          <div className="flex flex-col gap-3">
            {DRINKS.map(drink => (
              <label 
                key={drink.id}
                onClick={() => setSelectedDrink(drink.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-[3px] cursor-pointer transition-all ${
                  selectedDrink === drink.id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-colors ${
                    selectedDrink === drink.id ? 'border-blue-500' : 'border-gray-300'
                  }`}>
                    {selectedDrink === drink.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </div>
                  <span className={`text-lg font-black ${selectedDrink === drink.id ? 'text-gray-900' : 'text-gray-600'}`}>
                    {drink.name}
                  </span>
                </div>
                {drink.price > 0 && (
                  <span className="text-sm font-black text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                    + Bs. {drink.price}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>

      </div>

      {/* Botón Flotante para ABRIR CHECKOUT - Modificado para NO ser tapado por navbar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 shadow-[0_-20px_40px_rgba(0,0,0,0.15)] rounded-t-[32px] p-5 pb-safe z-40 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-2xl">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-xl bg-white text-gray-600 font-black text-2xl shadow-sm hover:text-red-600 transition-colors flex items-center justify-center active:scale-90"
            >
              -
            </button>
            <span className="w-8 text-center font-black text-2xl text-gray-900">{quantity}</span>
            <button 
              onClick={() => setQuantity(Math.min(99, quantity + 1))}
              className="w-12 h-12 rounded-xl bg-white text-gray-600 font-black text-2xl shadow-sm hover:text-red-600 transition-colors flex items-center justify-center active:scale-90"
            >
              +
            </button>
          </div>

          <div className="text-right flex flex-col items-end">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total a pagar</p>
            {discountAmount > 0 && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black text-white bg-green-500 px-1.5 py-0.5 rounded uppercase tracking-wider">-{discount}% DESCUENTO</span>
                <span className="text-sm font-bold text-gray-400 line-through">Bs. {subtotal}</span>
              </div>
            )}
            <p className="text-3xl font-black text-[#E60000] drop-shadow-sm">
              Bs. {totalPrice}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full bg-[#E60000] hover:bg-[#CC0000] text-white rounded-[20px] py-4 px-6 flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(230,0,0,0.3)] transition-all active:scale-[0.98]"
        >
          <ShoppingBag className="w-6 h-6" strokeWidth={2.5} />
          <span className="font-black text-xl tracking-wide uppercase">
            REALIZAR PEDIDO
          </span>
        </button>
      </div>

      {/* --- MODAL DE CHECKOUT (BOTTOM SHEET) --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white rounded-t-[40px] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                Completa tu Pedido <Flame className="w-6 h-6 text-[#E60000] fill-[#E60000]" />
              </h2>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 bg-gray-100 hover:bg-red-50 hover:text-[#E60000] rounded-full transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">
              
              {/* Opción de Entrega */}
              <section>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">1. Método de Entrega</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDeliveryMethod("ENVÍO A DOMICILIO")}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-[3px] transition-all gap-2 ${
                      deliveryMethod === "ENVÍO A DOMICILIO" ? 'border-[#E60000] bg-red-50 text-[#E60000]' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Bike className="w-8 h-8" strokeWidth={2} />
                    <span className="font-bold text-sm text-center leading-tight">Envío a<br/>Domicilio</span>
                  </button>
                  <button
                    onClick={() => setDeliveryMethod("RETIRO EN TIENDA")}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-[3px] transition-all gap-2 ${
                      deliveryMethod === "RETIRO EN TIENDA" ? 'border-[#E60000] bg-red-50 text-[#E60000]' : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <Store className="w-8 h-8" strokeWidth={2} />
                    <span className="font-bold text-sm text-center leading-tight">Recojo en<br/>Persona</span>
                  </button>
                </div>
              </section>

              {/* Opción de Pago */}
              <section>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">2. Método de Pago</h3>
                <div className="flex flex-col gap-3">
                  <label 
                    onClick={() => setPaymentMethod("EFECTIVO")}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-[3px] cursor-pointer transition-all ${
                      paymentMethod === "EFECTIVO" ? 'border-[#10B981] bg-[#10B981]/10' : 'border-gray-200'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${paymentMethod === "EFECTIVO" ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-black text-lg ${paymentMethod === "EFECTIVO" ? 'text-[#065F46]' : 'text-gray-700'}`}>Efectivo Contra Entrega</p>
                      <p className="text-xs font-semibold text-gray-500">Pago directo al repartidor en físico</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-colors ${paymentMethod === "EFECTIVO" ? 'border-[#10B981]' : 'border-gray-300'}`}>
                      {paymentMethod === "EFECTIVO" && <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full" />}
                    </div>
                  </label>

                  <label 
                    onClick={() => setPaymentMethod("QR")}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-[3px] cursor-pointer transition-all ${
                      paymentMethod === "QR" ? 'border-[#3B82F6] bg-[#3B82F6]/10' : 'border-gray-200'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${paymentMethod === "QR" ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-black text-lg ${paymentMethod === "QR" ? 'text-[#1E3A8A]' : 'text-gray-700'}`}>Pago por QR Simple</p>
                      <p className="text-xs font-semibold text-gray-500">Transferencia rápida y segura</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-colors ${paymentMethod === "QR" ? 'border-[#3B82F6]' : 'border-gray-300'}`}>
                      {paymentMethod === "QR" && <div className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full" />}
                    </div>
                  </label>
                </div>

                {/* Mostrar QR Simulado si se elige QR */}
                {paymentMethod === "QR" && (
                  <div className="mt-4 bg-[#F8FAFC] border border-[#BFDBFE] p-5 rounded-2xl flex flex-col items-center justify-center animate-in slide-in-from-top-4 duration-300">
                    <p className="text-sm font-black text-[#1E3A8A] mb-3 uppercase tracking-wider">Escanea para pagar</p>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      {/* Fake QR Code Image usando unsplash u otro fallback visual */}
                      <ImageWithFallback 
                        src="https://images.unsplash.com/photo-1595079676339-1534801ad6cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxciUyMGNvZGV8ZW58MXx8fHwxNzczMTU5ODAwfDA&ixlib=rb-4.1.0&q=80&w=300"
                        alt="QR Pago"
                        className="w-36 h-36 object-cover rounded-md"
                      />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mt-3 text-center">Una vez escaneado y pagado, confirma debajo.</p>
                  </div>
                )}
              </section>
            </div>

            {/* Modal Bottom Fixed Confirm */}
            <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-end mb-4">
                <span className="font-black text-gray-500 uppercase tracking-widest text-sm mb-1">Total Definitivo:</span>
                <div className="flex flex-col items-end">
                  {discountAmount > 0 && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-white bg-green-500 px-1.5 py-0.5 rounded uppercase tracking-wider">-{discount}% DESCUENTO</span>
                      <span className="text-sm font-bold text-gray-400 line-through">Bs. {subtotal}</span>
                    </div>
                  )}
                  <span className="text-4xl font-black text-[#E60000] drop-shadow-sm leading-none">Bs. {totalPrice}</span>
                </div>
              </div>
              <button 
                onClick={handleConfirmOrder}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white rounded-[20px] py-4 px-6 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
              >
                <Check className="w-6 h-6" strokeWidth={3} />
                <span className="font-black text-xl tracking-wide uppercase">
                  {paymentMethod === "QR" ? "LISTO, YA PAGUÉ" : "CONFIRMAR PEDIDO"}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

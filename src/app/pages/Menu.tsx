import { ChevronRight, Flame, MessageSquarePlus, X, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { AppContextType } from "../components/Layout";
import { supabase } from "../../lib/supabase";

// Menú completo SIN precios (Fallback local)
const CATALOG_ITEMS = [
  {
    id: 'pollo',
    title: "Pollo a tu Estilo",
    desc: "Elige entre nuestro clásico pollo jugoso A la Brasa o nuestro inconfundible pollo Broaster súper crujiente.",
    tags: ["Broaster", "A la Brasa"],
    image: "https://images.unsplash.com/photo-1517984055083-fd6e1e788e54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMGFuZCUyMHJvYXN0JTIwY2hpY2tlbnxlbnwxfHx8fDE3NzMxNzc3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 'alitas',
    title: "Alitas de Pollo",
    desc: "Cubeta de alitas doradas y crujientes. Perfectas para compartir o disfrutar solo.",
    tags: ["Crujientes"],
    image: "https://images.unsplash.com/photo-1670688866261-db6697858df8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllZCUyMGNoaWNrZW4lMjB3aW5ncyUyMGJ1Y2tldHxlbnwxfHx8fDE3NzMxNzUwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 'burger',
    title: "Burguer Chicken",
    desc: "Pechuga de pollo broaster, verduras frescas, queso fundido y nuestras salsas especiales de la casa.",
    tags: ["Favorito"],
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwYnVyZ2VyfGVufDF8fHx8MTc3MzE3NTA3MHww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 'nuggets',
    title: "Nuggets de Pollo",
    desc: "Trocitos de pura pechuga de pollo, empanizados y fritos a la perfección. Ideales para los más peques.",
    tags: ["Kids"],
    image: "https://images.unsplash.com/photo-1619881590738-a111d176d906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwbnVnZ2V0c3xlbnwxfHx8fDE3NzMxMjM1MzR8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 'salchibroaster',
    title: "Salchi-Broaster Especial",
    desc: "¡Una montaña de sabor! Abundantes papas fritas bañadas con trozos de pollo broaster y salchichas.",
    tags: ["NUEVO", "Gigante"],
    image: "https://images.unsplash.com/photo-1639744210631-209fce3e256c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2FkZWQlMjBmcmllc3xlbnwxfHx8fDE3NzMxNzc3ODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function Menu() {
  const [items, setItems] = useState(CATALOG_ITEMS);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [suggestionText, setSuggestionText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useOutletContext<AppContextType>();

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from("menu").select("*");
      if (data && data.length > 0) {
        setItems(data.map(item => ({
          id: item.id,
          title: item.title,
          desc: item.description || "",
          tags: item.tags || [],
          image: item.image_url || ""
        })));
      }
    };
    fetchMenu();
  }, []);

  const handleSuggestionSubmit = async () => {
    if (!suggestionText.trim() || !user) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from("suggestions").insert({
          user_id: authUser.id,
          username: user.name,
          suggestion: suggestionText.trim()
        });
      }
    } catch (err) {
      console.error("Error al guardar la sugerencia:", err);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSuggestionOpen(false);
      setIsSubmitted(false);
      setSuggestionText("");
    }, 2500);
  };

  return (
    <div className="flex flex-col gap-6 px-5 py-4 max-w-lg mx-auto w-full relative z-10">
      
      <div className="text-center mb-2">
        <h1 className="text-3xl font-black text-gray-900 flex items-center justify-center gap-2 drop-shadow-sm">
          NUESTRO MENÚ <Flame className="text-[#E60000] fill-[#E60000] w-6 h-6 animate-pulse" />
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Selecciona para armar y ver precios</p>
      </div>

      <div className="flex flex-col gap-6 pb-12">
        {items.map((item) => (
          <Link 
            key={item.id} 
            to={`/pedido/${item.id}`}
            className="bg-white rounded-[28px] p-0 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 hover:border-[#E60000] hover:shadow-xl transition-all group relative cursor-pointer overflow-hidden"
          >
            {/* Image (Top) */}
            <div className="w-full h-44 overflow-hidden relative">
              <ImageWithFallback 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Tags overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span key={tag} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full shadow-md ${tag === 'NUEVO' ? 'bg-[#FFC107] text-[#6D3412]' : 'bg-[#E60000] text-white'}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Info (Bottom) */}
            <div className="p-5 flex flex-col">
              <h3 className="font-black text-gray-900 text-2xl leading-tight mb-2">
                {item.title}
              </h3>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-4">
                {item.desc}
              </p>
              
              {/* Fake button logic, actually links via parent */}
              <div className="w-full bg-red-50 text-[#E60000] font-bold py-3 rounded-2xl flex items-center justify-center gap-2 group-hover:bg-[#E60000] group-hover:text-white transition-colors">
                <span>Realiza tu Pedido</span>
                <ChevronRight className="w-5 h-5" strokeWidth={3} />
              </div>
            </div>
          </Link>
        ))}

        {/* RECUADRO DE SUGERENCIAS */}
        <div 
          onClick={() => setIsSuggestionOpen(true)}
          className="bg-white rounded-[28px] p-8 flex flex-col items-center justify-center text-center shadow-md border-4 border-dashed border-red-200 hover:border-[#E60000] hover:bg-red-50 transition-all cursor-pointer group mt-2"
        >
          <div className="bg-red-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
            <MessageSquarePlus className="w-10 h-10 text-[#E60000]" strokeWidth={2} />
          </div>
          <h3 className="font-black text-gray-900 text-2xl leading-tight mb-2">
            ¿Nuevo Plato?
          </h3>
          <p className="text-sm font-medium text-gray-500 mb-6">
            ¿Tienes alguna idea para mejorar nuestro menú? ¡El jefe escucha a su gente!
          </p>
          <button className="w-full bg-[#F4B41A] hover:bg-[#EAA308] text-[#6D3412] font-black text-sm py-4 px-6 rounded-2xl shadow-sm transition-colors uppercase tracking-wide border-2 border-[#EAA308]/20">
            Enviar Sugerencia
          </button>
        </div>
      </div>

      {/* MODAL DE SUGERENCIAS */}
      {isSuggestionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsSuggestionOpen(false)}
              className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full hover:bg-red-100 hover:text-[#E60000] transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
            </button>

            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in slide-in-from-bottom-4">
                <CheckCircle2 className="w-20 h-20 text-[#22C55E] mb-6 animate-bounce" />
                <h2 className="text-3xl font-black text-gray-900 mb-3">¡Sugerencia Enviada!</h2>
                <p className="text-gray-500 font-medium text-lg">Gracias por ayudarnos a mejorar, jefe.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-red-100 p-4 rounded-2xl border border-red-200">
                    <MessageSquarePlus className="w-8 h-8 text-[#E60000]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Tu Idea</h2>
                    <p className="text-sm font-medium text-gray-500">¿Qué te gustaría probar en el menú?</p>
                  </div>
                </div>
                
                  <textarea
                  value={suggestionText || ""}
                  onChange={(e) => setSuggestionText(e.target.value)}
                  placeholder="Ej: Deberían agregar alitas picantes con salsa buffalo y papas rústicas..."
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-5 min-h-[160px] resize-none focus:outline-none focus:border-[#E60000] focus:ring-4 focus:ring-red-100 transition-all font-medium text-gray-700 text-lg placeholder:text-gray-400"
                  autoFocus
                ></textarea>
                
                <button
                  onClick={handleSuggestionSubmit}
                  disabled={!suggestionText.trim()}
                  className="mt-6 w-full bg-gradient-to-r from-[#E60000] to-[#C00000] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:from-[#FF0000] hover:to-[#CC0000] text-white font-black text-lg py-4 md:py-5 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 border-[3px] border-white/20"
                >
                  <MessageSquarePlus className="w-5 h-5" strokeWidth={2.5} />
                  ENVIAR SUGERENCIA
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

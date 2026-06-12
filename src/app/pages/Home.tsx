import { UtensilsCrossed, ArrowRight, Flame, MapPin, Phone, Star, User } from "lucide-react";
import { Link, useNavigate, useOutletContext } from "react-router";
import logoImg from "figma:asset/1b250b5ccd268dca2b6289d13db65831f3d42fad.png";
import { AppContextType } from "../components/Layout";

export function Home() {
  const navigate = useNavigate();
  const { user, openProfile } = useOutletContext<AppContextType>();

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate("/menu");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] relative bg-transparent overflow-y-auto overflow-x-hidden">
      
      {/* Top Red Bar Solid/Gradient Banner */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#E60000] to-[#FF0000] z-0 shadow-md border-b-[6px] border-[#F4B41A]" />

      {/* Top Info Bar */}
      <div className="relative z-20 flex justify-between items-center px-4 md:px-8 lg:px-12 pt-safe-top mt-6 w-full max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.1)] rounded-full px-5 py-2.5 border border-white/50 flex items-center gap-3 text-gray-800 hover:scale-105 transition-transform cursor-pointer">
          <Phone className="w-5 h-5 text-[#E60000]" strokeWidth={2.5} />
          <span className="text-sm font-black tracking-widest">+591 69209742</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <button 
              onClick={() => openProfile()}
              className="bg-white/95 backdrop-blur-md shadow-[0_4px_10px_rgba(0,0,0,0.1)] rounded-full w-10 h-10 border border-white/50 flex items-center justify-center text-[#E60000] hover:scale-105 transition-transform cursor-pointer"
            >
              <User className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-center gap-8 xl:gap-16 px-6 md:px-12 w-full max-w-7xl mx-auto mt-6 flex-1 min-h-[calc(100vh-140px)]">
        
        {/* LADO IZQUIERDO: LOGO Y SLOGAN */}
        <div className="flex flex-col items-center xl:items-start w-full max-w-lg xl:max-w-xl">
          {/* LOGO GIGANTE */}
          <div className="relative flex flex-col items-center justify-center w-full mb-6 mt-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4B41A] to-[#E60000] blur-[60px] opacity-30 rounded-full animate-pulse max-w-[350px] max-h-[350px] m-auto" />
            <div className="w-80 h-80 md:w-96 md:h-96 bg-white/70 backdrop-blur-md rounded-full p-6 flex items-center justify-center overflow-visible relative z-10 shadow-[0_20px_40px_rgba(230,0,0,0.2)] ring-8 ring-white/50 border-4 border-[#F4B41A]/30">
              <img 
                src={logoImg} 
                alt="Don Pollo Logo" 
                className="w-full h-full object-contain scale-[1.1] hover:scale-[1.2] transition-transform duration-700 drop-shadow-2xl" 
              />
            </div>
          </div>

          {/* SLOGAN ESTILIZADO */}
          <div className="text-center xl:text-left flex flex-col items-center xl:items-start gap-2 mb-8 w-full mt-2">
            <div className="flex items-center gap-2 text-[#E60000] mb-2 bg-white px-5 py-2 rounded-full shadow-md border border-gray-100">
              <Flame className="w-5 h-5 fill-[#E60000] animate-pulse" />
              <span className="uppercase tracking-[0.25em] text-[12px] font-black">Una oferta irresistible</span>
              <Flame className="w-5 h-5 fill-[#E60000] animate-pulse" />
            </div>
            <h1 className="text-gray-900 text-[50px] md:text-[64px] leading-[1.05] font-black tracking-tighter drop-shadow-sm">
              EL AUTÉNTICO<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E60000] via-[#FF0000] to-[#C00000] text-[60px] md:text-[76px] drop-shadow-md">
                JEFE DEL SABOR
              </span>
            </h1>
          </div>

          {/* Botón Centralizado */}
          <div className="w-full flex justify-center xl:justify-start mb-10 px-2 xl:px-0">
            <button 
              onClick={handleMenuClick}
              className="w-full xl:w-auto min-w-[320px] bg-gradient-to-r from-[#E60000] to-[#C00000] hover:from-[#FF0000] hover:to-[#CC0000] text-white transition-all rounded-[32px] p-5 flex items-center justify-between shadow-[0_20px_40px_rgba(230,0,0,0.4)] active:scale-[0.96] border-[3px] border-white/30 group relative overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl shadow-inner border border-white/20">
                  <UtensilsCrossed className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left mr-4">
                  <h2 className="text-3xl font-black tracking-tighter leading-none drop-shadow-md mb-1">
                    ¡MIRAR MENÚ!
                  </h2>
                  <span className="text-sm font-bold text-red-100 uppercase tracking-widest">
                    Haz tu pedido aquí
                  </span>
                </div>
              </div>
              
              <div className="bg-white text-[#E60000] p-3.5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform relative z-10 ml-auto">
                <ArrowRight className="w-7 h-7" strokeWidth={3} />
              </div>
            </button>
          </div>
        </div>

        {/* LADO DERECHO: COLLAGE DE FOTOS EPIC */}
        <div className="w-full max-w-2xl flex flex-col gap-5 mt-auto mb-10 pb-4 xl:mt-0 xl:pb-0">
          <div className="flex items-center gap-3 w-full mb-1 px-2">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Star className="w-5 h-5 text-[#F4B41A] fill-[#F4B41A]" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-widest">Nuestras Especialidades</h2>
            <div className="flex-1 h-[3px] bg-gradient-to-r from-gray-200 to-transparent ml-2 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full h-[420px] md:h-[500px]">
            {/* Foto Grande Izquierda */}
            <div className="col-span-1 row-span-2 rounded-[32px] overflow-hidden relative shadow-xl group border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1761515397046-44035db91504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmlzcHklMjBmcmllZCUyMGNoaWNrZW4lMjBjbG9zZSUyMHVwfGVufDF8fHx8MTc3MzE4MTA5MXww&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Pollo Broaster" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[11px] bg-[#E60000] px-3 py-1.5 rounded-lg font-black uppercase mb-2 inline-block shadow-md border border-white/20">100% Broaster</span>
                <p className="font-black text-xl leading-tight drop-shadow-md">Crujiente<br/>Nivel Jefe</p>
              </div>
            </div>

            {/* Dos Fotos Derecha */}
            <div className="col-span-1 row-span-1 rounded-[32px] overflow-hidden relative shadow-lg group border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1759568558640-3c9239a6153e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3Rpc3NlcmllJTIwY2hpY2tlbiUyMGZpcmV8ZW58MXx8fHwxNzczMTgxMDkxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Pollo a la Brasa" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] bg-[#F4B41A] text-[#6D3412] px-2.5 py-1 rounded-lg font-black uppercase mb-1.5 inline-block shadow-md">A la Brasa</span>
                <p className="font-black text-sm leading-tight drop-shadow-md">El Verdadero<br/>Sabor Clásico</p>
              </div>
            </div>

            <div className="col-span-1 row-span-1 rounded-[32px] overflow-hidden relative shadow-lg group border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1760390952092-03cf0a020f25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2FkZWQlMjBmcmllcyUyMGNoaWNrZW58ZW58MXx8fHwxNzczMTgxMDkxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
                alt="Papas Fritas y más" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg font-black uppercase mb-1.5 inline-block border border-white/20 shadow-md">Guarniciones</span>
                <p className="font-black text-sm leading-tight drop-shadow-md">Para toda<br/>La Familia</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CSS Animaciones Inline */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

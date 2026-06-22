import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { User, Mail, Phone, Tag, Save, X, History, ChevronRight, ChevronDown, ChevronUp, Edit2, CheckCircle2, AlertCircle, XCircle, Download } from "lucide-react";
import { UserProfile, AppOrder } from "./Layout";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  updateUser: (user: UserProfile) => void;
  orders: AppOrder[];
  discount: number;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

type DiscountFeedback = { type: "success" | "error"; message: string } | null;

export function ProfileModal({
  isOpen,
  onClose,
  user,
  updateUser,
  orders,
  discount,
  applyDiscount,
  logout,
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"perfil" | "historial" | "descuentos">("perfil");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState<UserProfile>(user || { name: "", email: "", phone: "" });
  const [promoCode, setPromoCode] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [discountFeedback, setDiscountFeedback] = useState<DiscountFeedback>(null);

  // Sincronizar el estado del formulario cuando se carga el usuario de Supabase
  useEffect(() => {
    if (user) {
      setEditData(user);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(editData);
    setIsEditingProfile(false);
  };

  const handleDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const res = await applyDiscount(promoCode.trim());
    setDiscountFeedback({ type: res.success ? "success" : "error", message: res.message });
    if (res.success) setPromoCode("");
    setTimeout(() => setDiscountFeedback(null), 3500);
  };

  const completedOrders = orders.filter(o => o.status === "COMPLETADO");

  const generateInvoicePDF = (order: AppOrder) => {
    const fecha = new Date(order.timestamp).toLocaleDateString("es-BO", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
    const subtotal = (order.subtotal || order.total).toFixed(2);
    const descuento = order.hasDiscount && order.subtotal
      ? (order.subtotal - order.total).toFixed(2)
      : null;

    const doc = new jsPDF({ unit: "mm", format: "a5" });
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("COMPLETADO", pageWidth / 2, y, { align: "center" });
    y += 6;

    doc.setFontSize(20);
    doc.setFont("courier", "bold");
    doc.setTextColor(20);
    doc.text("DON POLLO", pageWidth / 2, y, { align: "center" });
    y += 6;

    doc.setFontSize(9);
    doc.setFont("courier", "normal");
    doc.setTextColor(100);
    doc.text("El Jefe del Sabor", pageWidth / 2, y, { align: "center" });
    y += 4;
    doc.text("RECIBO ELECTRÓNICO", pageWidth / 2, y, { align: "center" });
    y += 6;

    // Dashed line
    doc.setDrawColor(180);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;

    // Details
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.setFont("courier", "normal");
    const addRow = (label: string, value: string) => {
      doc.text(label, margin, y);
      doc.setFont("courier", "bold");
      doc.setTextColor(20);
      doc.text(value, margin + contentWidth, y, { align: "right" });
      doc.setFont("courier", "normal");
      doc.setTextColor(80);
      y += 6;
    };

    addRow("Fecha:", fecha);
    addRow("Nro. Orden:", order.id.slice(0, 16) + "...");
    addRow("Entrega:", order.deliveryMethod);
    addRow("Pago:", order.paymentMethod);
    y += 2;

    // Dashed separator
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;

    // Items
    addRow(order.itemName, `Bs ${subtotal}`);
    if (descuento) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Descuento (-${order.discountPercent}%):`, margin, y);
      doc.setFont("courier", "bold");
      doc.text(`- Bs ${descuento}`, margin + contentWidth, y, { align: "right" });
      doc.setFont("courier", "normal");
      doc.setTextColor(80);
      y += 6;
    }
    y += 2;

    // Solid line
    doc.setLineDashPattern([], 0);
    doc.setDrawColor(20);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;

    // Total
    doc.setFontSize(14);
    doc.setFont("courier", "bold");
    doc.setTextColor(20);
    doc.text("TOTAL:", margin, y);
    doc.text(`Bs ${order.total.toFixed(2)}`, margin + contentWidth, y, { align: "right" });
    y += 10;

    // Footer
    doc.setLineDashPattern([2, 2], 0);
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    y += 6;
    doc.setFontSize(8);
    doc.setFont("courier", "normal");
    doc.setTextColor(120);
    doc.text("¡Gracias por tu compra, Jefe!", pageWidth / 2, y, { align: "center" });
    y += 4;
    doc.text("Tel: +591 69209742", pageWidth / 2, y, { align: "center" });

    doc.save(`Factura_DonPollo_${order.id.slice(0, 8)}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full sm:max-w-md bg-[#FFFDF5] rounded-t-[32px] sm:rounded-[32px] shadow-2xl h-[88vh] sm:h-auto sm:max-h-[88vh] flex flex-col relative overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#E60000] to-[#C00000] p-6 text-white relative shadow-md shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#F4B41A] rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg shrink-0">
              <User className="w-8 h-8 text-[#6D3412]" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black tracking-wide drop-shadow-sm truncate">{user.name}</h2>
              <p className="text-red-100 font-medium text-sm drop-shadow-sm opacity-90 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white shadow-sm border-b border-gray-100 shrink-0">
          {(["perfil", "historial", "descuentos"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-xs font-black transition-colors border-b-[3px] uppercase tracking-wider ${
                activeTab === tab
                  ? "border-[#E60000] text-[#E60000]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 font-sans pb-8">

          {/* PERFIL */}
          {activeTab === "perfil" && (
            <div className="animate-in fade-in duration-300">
              {!isEditingProfile ? (
                <div className="flex flex-col gap-5">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                    {[
                      { icon: <User className="w-5 h-5" />, label: "Nombre completo", value: user.name },
                      { icon: <Mail className="w-5 h-5" />, label: "Correo electrónico", value: user.email },
                      { icon: <Phone className="w-5 h-5" />, label: "Teléfono", value: user.phone || "No especificado" },
                    ].map((item, i) => (
                      <div key={i}>
                        {i > 0 && <div className="h-px bg-gray-100 mb-4" />}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#E60000] shrink-0">
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{item.label}</p>
                            <p className="font-bold text-gray-900 truncate">{item.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => { setEditData(user); setIsEditingProfile(true); }}
                      className="w-full bg-white border-2 border-gray-200 hover:border-[#E60000] hover:text-[#E60000] text-gray-700 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Edit2 className="w-5 h-5" />
                      <span>EDITAR DATOS</span>
                    </button>
                    <button
                      onClick={() => { logout(); onClose(); }}
                      className="w-full bg-gradient-to-r from-[#E60000] to-[#C00000] hover:from-[#FF0000] hover:to-[#CC0000] text-white font-black py-4 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-[0.98]"
                    >
                      CERRAR SESIÓN
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300">
                  {[
                    { label: "Nombre completo", icon: <User className="h-5 w-5 text-gray-400" />, field: "name" as const, type: "text" },
                    { label: "Correo electrónico", icon: <Mail className="h-5 w-5 text-gray-400" />, field: "email" as const, type: "email" },
                    { label: "Teléfono", icon: <Phone className="h-5 w-5 text-gray-400" />, field: "phone" as const, type: "tel" },
                  ].map(({ label, icon, field, type }) => (
                    <div key={field}>
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">{label}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{icon}</div>
                        <input
                          type={type}
                          required={field !== "phone"}
                          value={editData[field] || ""}
                          onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                          className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-[#E60000] focus:border-transparent outline-none transition-all font-medium shadow-sm text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-col gap-3 mt-2">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#E60000] to-[#C00000] hover:from-[#FF0000] hover:to-[#CC0000] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(230,0,0,0.2)] transition-all active:scale-[0.98]"
                    >
                      <Save className="w-5 h-5" />
                      <span>GUARDAR CAMBIOS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl flex items-center justify-center transition-colors"
                    >
                      CANCELAR
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* HISTORIAL */}
          {activeTab === "historial" && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              {completedOrders.length > 0 ? (
                completedOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black text-white bg-green-500 px-2 py-1 rounded-lg uppercase tracking-wider mb-1 inline-block">Completado</span>
                            <h4 className="font-black text-gray-900 text-sm">{order.itemName}</h4>
                            <p className="text-xs text-gray-500 font-medium">#{order.id.slice(0, 8)} · {new Date(order.timestamp).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="font-black text-[#E60000]">Bs {order.total}</span>
                            {order.hasDiscount && (
                              <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md mt-1">-{order.discountPercent}%</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="w-full bg-[#E60000] hover:bg-[#CC0000] text-white font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm active:scale-[0.98]"
                        >
                          <span>VER FACTURA</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="bg-[#FFFDF5] px-5 py-6 border-t-2 border-dashed border-gray-300 animate-in slide-in-from-top-2 duration-300 relative">
                          <div className="absolute -top-3 left-5 w-6 h-6 bg-[#FFFDF5] rounded-full border border-dashed border-gray-300" />
                          <div className="absolute -top-3 right-5 w-6 h-6 bg-[#FFFDF5] rounded-full border border-dashed border-gray-300" />

                          <div className="text-center mb-5 pb-4 border-b border-gray-200">
                            <h5 className="text-base font-black text-gray-900 tracking-widest uppercase">RECIBO ELECTRÓNICO</h5>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Don Pollo — El Jefe del Sabor</p>
                          </div>

                          <div className="flex flex-col gap-3 font-mono text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Fecha:</span>
                              <span className="font-bold text-gray-900 text-right text-xs">{new Date(order.timestamp).toLocaleDateString("es-BO", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Nro. Orden:</span>
                              <span className="font-bold text-gray-900 text-xs text-right max-w-[55%] break-all">{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Entrega:</span>
                              <span className="font-bold text-gray-900 text-xs text-right">{order.deliveryMethod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Pago:</span>
                              <span className="font-bold text-gray-900">{order.paymentMethod}</span>
                            </div>

                            <div className="border-t border-dashed border-gray-300 my-1" />

                            <div className="flex justify-between items-start">
                              <span className="text-gray-800 font-bold max-w-[60%] text-xs leading-snug">{order.itemName}</span>
                              <span className="font-bold text-gray-900">Bs {(order.subtotal || order.total).toFixed(2)}</span>
                            </div>

                            {order.hasDiscount && order.subtotal && (
                              <div className="flex justify-between text-[#E60000]">
                                <span className="text-xs">Descuento (-{order.discountPercent}%):</span>
                                <span>- Bs {(order.subtotal - order.total).toFixed(2)}</span>
                              </div>
                            )}

                            <div className="border-t-2 border-gray-800 mt-1 pt-3" />

                            <div className="flex justify-between items-end">
                              <span className="text-gray-800 font-black text-base">TOTAL:</span>
                              <span className="font-black text-2xl text-gray-900">Bs {order.total.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="mt-6 text-center text-xs text-gray-400 font-medium border-t border-dashed border-gray-200 pt-4">
                            ¡Gracias por tu compra, Jefe!
                          </div>

                          {/* Botón Descargar PDF */}
                          <button
                            onClick={() => generateInvoicePDF(order)}
                            className="mt-4 w-full bg-gray-900 hover:bg-gray-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm uppercase tracking-wider active:scale-[0.98] shadow-md"
                          >
                            <Download className="w-4 h-4" />
                            Descargar en PDF
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 flex flex-col items-center opacity-60">
                  <History className="w-16 h-16 text-gray-300 mb-4" strokeWidth={1} />
                  <p className="font-bold text-gray-500">Aún no tienes pedidos completados.</p>
                </div>
              )}
            </div>
          )}

          {/* DESCUENTOS */}
          {activeTab === "descuentos" && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">

              <div className="bg-gradient-to-br from-[#F4B41A] to-[#D99A0D] p-6 rounded-[24px] text-center shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />
                <h3 className="text-[#6D3412] font-black text-xs uppercase tracking-widest mb-1 relative z-10">Tu descuento actual</h3>
                <div className="text-5xl font-black text-white drop-shadow-md relative z-10 my-2">{discount}%</div>
                <p className="text-[#6D3412]/80 text-xs font-bold relative z-10">Aplicable en tu próximo pedido</p>
              </div>

              {/* Progress bar */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Progreso</span>
                  <span className="text-xs font-black text-[#E60000]">{discount}/100%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F4B41A] to-[#E60000] rounded-full transition-all duration-700"
                    style={{ width: `${discount}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleDiscount} className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
                <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2 text-sm">
                  <Tag className="w-5 h-5 text-[#E60000]" />
                  Canjear código promocional
                </h4>

                {discount >= 100 ? (
                  <div className="bg-red-50 text-[#E60000] p-4 rounded-xl font-bold text-sm text-center border border-red-100">
                    ¡Has alcanzado el límite de 100% de descuento!
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Ej: POLLO5"
                        className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#E60000] focus:border-transparent outline-none transition-all font-black uppercase text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!promoCode.trim()}
                        className="bg-[#E60000] hover:bg-[#CC0000] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black px-5 rounded-xl shadow-md transition-all flex items-center justify-center active:scale-95"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>

                    {discountFeedback && (
                      <div
                        className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold animate-in fade-in zoom-in duration-200 ${
                          discountFeedback.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-[#E60000] border border-red-200"
                        }`}
                      >
                        {discountFeedback.type === "success" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{discountFeedback.message}</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 font-medium mt-3">
                      Cada código válido suma +5% al descuento acumulado (máx. 100%).
                    </p>
                  </>
                )}
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { User, Mail, Lock, Phone, ArrowRight, CheckCircle2, ArrowLeft, Eye, EyeOff, AlertCircle } from "lucide-react";
import logoImg from "figma:asset/1b250b5ccd268dca2b6289d13db65831f3d42fad.png";
import { AppContextType } from "../components/Layout";
import { supabase, supabaseAdmin } from "../../lib/supabase";

type LoginErrors = { username?: string; email?: string; password?: string; general?: string };
type RegisterErrors = { username?: string; email?: string; phone?: string; password?: string };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 px-1 animate-in slide-in-from-top-1 fade-in duration-200">
      <AlertCircle className="w-3.5 h-3.5 text-[#E60000] shrink-0" />
      <span className="text-xs font-bold text-[#E60000]">{message}</span>
    </div>
  );
}

const validateName = (v: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v.trim());
const validatePassword = (v: string) =>
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/.test(v);
const validatePhone = (v: string) => /^[0-9]+$/.test(v);

export function Auth() {
  const [view, setView] = useState<"login" | "register">("login");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useOutletContext<AppContextType>();

  const [loginData, setLoginData] = useState({ username: "", email: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", phone: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);
  const [loginTouched, setLoginTouched] = useState<Record<string, boolean>>({});
  const [registerTouched, setRegisterTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateLogin = (data = loginData): LoginErrors => {
    const e: LoginErrors = {};
    if (!data.username.trim()) e.username = "El nombre es requerido";
    else if (!validateName(data.username)) e.username = "Solo se permiten letras y espacios";
    if (!data.email.trim()) e.email = "El correo es requerido";
    if (!data.password) e.password = "La contraseña es requerida";
    else if (!validatePassword(data.password)) e.password = "Mín. 8 caracteres, 1 mayúscula, 1 número y 1 símbolo";
    return e;
  };

  const validateRegister = (data = registerData): RegisterErrors => {
    const e: RegisterErrors = {};
    if (!data.username.trim()) e.username = "El nombre es requerido";
    else if (!validateName(data.username)) e.username = "Solo se permiten letras y espacios";
    if (!data.email.trim()) e.email = "El correo es requerido";
    if (!data.password) e.password = "La contraseña es requerida";
    else if (!validatePassword(data.password)) e.password = "Mín. 8 caracteres, 1 mayúscula, 1 número y 1 símbolo";
    if (data.phone && !validatePhone(data.phone)) e.phone = "Solo se permiten números";
    return e;
  };

  const handleLoginBlur = (field: string) => {
    setLoginTouched(p => ({ ...p, [field]: true }));
    const errs = validateLogin();
    setLoginErrors(errs);
  };

  const handleRegisterBlur = (field: string) => {
    setRegisterTouched(p => ({ ...p, [field]: true }));
    const errs = validateRegister();
    setRegisterErrors(errs);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRegister();
    if (Object.keys(errs).length > 0) {
      setRegisterErrors(errs);
      setRegisterTouched({ username: true, email: true, phone: true, password: true });
      return;
    }

    setIsLoading(true);
    setRegisterErrors({});

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: registerData.email,
      password: registerData.password,
      email_confirm: true,
      user_metadata: {
        username: registerData.username.trim(),
        phone: registerData.phone || "",
      },
    });

    setIsLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        setRegisterErrors({ email: "Este correo ya está registrado por otra cuenta." });
      } else {
        setRegisterErrors({ password: `Error al registrarse: ${error.message}` });
      }
    } else if (data?.user) {
      setShowSuccess(true);
    } else {
      setRegisterErrors({ password: "Error desconocido al crear la cuenta." });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length > 0) {
      setLoginErrors(errs);
      setLoginTouched({ username: true, email: true, password: true });
      return;
    }

    setIsLoading(true);
    setLoginErrors({});

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    setIsLoading(false);

    if (error) {
      setLoginErrors({ general: "Credenciales incorrectas o usuario no registrado. Regístrate primero." });
      return;
    }

    if (data?.user) {
      const username = data.user.user_metadata?.username || loginData.username || "Usuario";
      const phone = data.user.user_metadata?.phone || "";
      login({
        name: username,
        email: data.user.email || "",
        phone: phone,
      });
      navigate("/menu");
    }
  };

  const inputBase = (hasError: boolean) =>
    `w-full bg-gray-50 border text-gray-900 rounded-2xl pl-11 pr-4 py-4 outline-none transition-all font-medium text-sm ${
      hasError
        ? "border-[#E60000] ring-1 ring-[#E60000] bg-red-50/40"
        : "border-gray-200 focus:ring-2 focus:ring-[#E60000] focus:border-transparent"
    }`;

  const inputBasePw = (hasError: boolean) =>
    `w-full bg-gray-50 border text-gray-900 rounded-2xl pl-11 pr-12 py-4 outline-none transition-all font-medium text-sm ${
      hasError
        ? "border-[#E60000] ring-1 ring-[#E60000] bg-red-50/40"
        : "border-gray-200 focus:ring-2 focus:ring-[#E60000] focus:border-transparent"
    }`;

  return (
    <div className="flex flex-col w-full min-h-[100dvh] relative bg-transparent overflow-y-auto overflow-x-hidden font-sans">

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-2c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C%2Fsvg%3E")`,
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#E60000] to-[#FF0000] z-0 shadow-md border-b-[6px] border-[#F4B41A]" />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 w-full max-w-md mx-auto pt-10 pb-12 flex-1">

        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full shadow-[0_8px_20px_rgba(230,0,0,0.3)] border border-white/40 transition-all text-white group z-50 hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
          <span className="font-black text-sm tracking-wider uppercase drop-shadow-md">Volver</span>
        </button>

        <div className="relative flex flex-col items-center justify-center w-full mb-8">
          <div className="w-36 h-36 bg-white/90 backdrop-blur-md rounded-full p-3 flex items-center justify-center overflow-visible shadow-[0_15px_30px_rgba(230,0,0,0.3)] ring-4 ring-white border-4 border-[#F4B41A]">
            <img src={logoImg} alt="Don Pollo Logo" className="w-full h-full object-contain scale-[1.1] drop-shadow-xl" />
          </div>
        </div>

        <div className="w-full bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-6 md:p-8 border border-gray-100 relative">

          {showSuccess ? (
            <div className="flex flex-col items-center justify-center text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">¡Registro Correcto!</h2>
              <p className="text-gray-500 mb-8 font-medium">Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.</p>
              <button
                onClick={() => { setShowSuccess(false); setView("login"); }}
                className="w-full bg-[#E60000] hover:bg-[#CC0000] text-white font-black py-4 rounded-2xl shadow-lg transition-colors"
              >
                ACEPTAR
              </button>
            </div>
          ) : (
            <>
              {/* Toggle */}
              <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
                <button
                  onClick={() => { setView("login"); setLoginErrors({}); setLoginTouched({}); }}
                  className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all duration-300 ${view === "login" ? "bg-white text-[#E60000] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  INICIAR SESIÓN
                </button>
                <button
                  onClick={() => { setView("register"); setRegisterErrors({}); setRegisterTouched({}); }}
                  className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all duration-300 ${view === "register" ? "bg-white text-[#E60000] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  REGISTRARSE
                </button>
              </div>

              {/* Login */}
              {view === "login" ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-3 animate-in fade-in slide-in-from-left-4 duration-300">

                  {loginErrors.general && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-[#E60000] px-4 py-3 rounded-2xl animate-in fade-in zoom-in duration-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p className="text-sm font-bold">{loginErrors.general}</p>
                    </div>
                  )}

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${loginTouched.username && loginErrors.username ? "text-[#E60000]" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="text"
                        value={loginData.username}
                        onChange={(e) => {
                          setLoginData({ ...loginData, username: e.target.value });
                          if (loginTouched.username) setLoginErrors(validateLogin({ ...loginData, username: e.target.value }));
                        }}
                        onBlur={() => handleLoginBlur("username")}
                        placeholder="Nombre de usuario"
                        className={inputBase(!!(loginTouched.username && loginErrors.username))}
                      />
                    </div>
                    <FieldError message={loginTouched.username ? loginErrors.username : undefined} />
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${loginTouched.email && loginErrors.email ? "text-[#E60000]" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => {
                          setLoginData({ ...loginData, email: e.target.value });
                          if (loginTouched.email) setLoginErrors(validateLogin({ ...loginData, email: e.target.value }));
                        }}
                        onBlur={() => handleLoginBlur("email")}
                        placeholder="Correo electrónico"
                        className={inputBase(!!(loginTouched.email && loginErrors.email))}
                      />
                    </div>
                    <FieldError message={loginTouched.email ? loginErrors.email : undefined} />
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${loginTouched.password && loginErrors.password ? "text-[#E60000]" : "text-gray-400"}`} />
                      </div>
                      <input
                        type={showLoginPw ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData({ ...loginData, password: e.target.value });
                          if (loginTouched.password) setLoginErrors(validateLogin({ ...loginData, password: e.target.value }));
                        }}
                        onBlur={() => handleLoginBlur("password")}
                        placeholder="Contraseña"
                        className={inputBasePw(!!(loginTouched.password && loginErrors.password))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw(p => !p)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showLoginPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <FieldError message={loginTouched.password ? loginErrors.password : undefined} />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-3 w-full bg-gradient-to-r from-[#E60000] to-[#C00000] hover:from-[#FF0000] hover:to-[#CC0000] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(230,0,0,0.3)] transition-all active:scale-[0.98] hover:shadow-[0_14px_28px_rgba(230,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isLoading ? "INGRESANDO..." : "INGRESAR AL MENÚ"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-300">

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className={`h-5 w-5 ${registerTouched.username && registerErrors.username ? "text-[#E60000]" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="text"
                        value={registerData.username}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, username: e.target.value });
                          if (registerTouched.username) setRegisterErrors(validateRegister({ ...registerData, username: e.target.value }));
                        }}
                        onBlur={() => handleRegisterBlur("username")}
                        placeholder="Nombre de usuario"
                        className={inputBase(!!(registerTouched.username && registerErrors.username))}
                      />
                    </div>
                    <FieldError message={registerTouched.username ? registerErrors.username : undefined} />
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className={`h-5 w-5 ${registerTouched.email && registerErrors.email ? "text-[#E60000]" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="email"
                        value={registerData.email}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, email: e.target.value });
                          if (registerTouched.email) setRegisterErrors(validateRegister({ ...registerData, email: e.target.value }));
                        }}
                        onBlur={() => handleRegisterBlur("email")}
                        placeholder="Correo electrónico"
                        className={inputBase(!!(registerTouched.email && registerErrors.email))}
                      />
                    </div>
                    <FieldError message={registerTouched.email ? registerErrors.email : undefined} />
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className={`h-5 w-5 ${registerTouched.password && registerErrors.password ? "text-[#E60000]" : "text-gray-400"}`} />
                      </div>
                      <input
                        type={showRegisterPw ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, password: e.target.value });
                          if (registerTouched.password) setRegisterErrors(validateRegister({ ...registerData, password: e.target.value }));
                        }}
                        onBlur={() => handleRegisterBlur("password")}
                        placeholder="Contraseña"
                        className={inputBasePw(!!(registerTouched.password && registerErrors.password))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPw(p => !p)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showRegisterPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <FieldError message={registerTouched.password ? registerErrors.password : undefined} />
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className={`h-5 w-5 ${registerTouched.phone && registerErrors.phone ? "text-[#E60000]" : "text-gray-400"}`} />
                      </div>
                      <input
                        type="tel"
                        value={registerData.phone}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, phone: e.target.value });
                          if (registerTouched.phone) setRegisterErrors(validateRegister({ ...registerData, phone: e.target.value }));
                        }}
                        onBlur={() => handleRegisterBlur("phone")}
                        placeholder="Teléfono (Opcional)"
                        className={inputBase(!!(registerTouched.phone && registerErrors.phone))}
                      />
                    </div>
                    <FieldError message={registerTouched.phone ? registerErrors.phone : undefined} />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-3 w-full bg-gradient-to-r from-[#F4B41A] to-[#D99A0D] hover:from-[#FFC12A] hover:to-[#EAA91D] text-[#6D3412] font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(244,180,26,0.3)] transition-all active:scale-[0.98] hover:shadow-[0_14px_28px_rgba(244,180,26,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isLoading ? "CREANDO CUENTA..." : "CREAR CUENTA"}</span>
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

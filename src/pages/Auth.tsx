import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, UserPlus, LogIn, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/Toast";
import { isAdminEmail } from "../config/admin";


export default function Auth({ mode: initialMode }: { mode: "login" | "signup" }) {
  const [view, setView] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/client/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou mot de passe incorrect. Veuillez réessayer.");
        }
        throw error;
      }

      if (data.session) {
        localStorage.setItem("token", data.session.access_token);
      }

      addToast(`Bienvenue ${data.user.user_metadata?.firstName || 'Aventurier'} ! Heureux de vous revoir !`, "success");
      
      const userEmail = (data.user.email || "").toLowerCase().trim();
      navigate(isAdminEmail(userEmail) ? "/admin/dashboard" : from, { replace: true });
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Email ou mot de passe incorrect")) {
        addToast(msg, "error");
      } else {
        addToast("Erreur de connexion. Veuillez réessayer.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      addToast("Le mot de passe doit contenir au moins 6 caractères.", "error");
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { firstName, lastName }
        }
      });
      
      if (error) {
        if (error.message.includes("User already registered")) {
          throw new Error("Cet email est déjà utilisé. Essayez de vous connecter.");
        }
        throw new Error("Erreur lors de l'inscription. Veuillez réessayer.");
      }

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
        });
      }

      addToast("Bienvenue dans l'univers Appiotti ! Vérifiez vos emails si nécessaire.", "success");
      
      // Auto-login after signup if possible
      if (data.session) {
        localStorage.setItem("token", data.session.access_token);
        navigate(from, { replace: true });
      } else {
        navigate(`/verifier-code?email=${encodeURIComponent(email)}&type=signup`, { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("déjà utilisé")) {
        addToast(msg, "error");
      } else {
        addToast("Erreur d'inscription. Veuillez réessayer.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B35] rounded-full blur-[200px] opacity-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFD23F] rounded-full blur-[200px] opacity-10 translate-y-1/2 -translate-x-1/2" />

      <div 
        key={view}
        className="w-full max-w-xl bg-white rounded-[24px] md:rounded-[48px] shadow-2xl overflow-hidden relative border border-gray-100 animate-fade-in-up"
      >
        <div className="p-6 md:p-12">
          <div className="text-center mb-6 md:mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 md:mb-8 group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FF6B35] rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl text-white shadow-lg">A</div>
              <span className="text-lg md:text-2xl font-black font-display text-brand-dark uppercase tracking-tight">Appiotti <span className="text-brand-orange">Game Shop</span></span>
            </Link>
            <h1 className="text-2xl md:text-5xl font-black text-brand-dark mb-3 md:mb-4 font-display uppercase tracking-tighter">
              {view === "login" ? "Bon retour !" : "Créez votre univers"}
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {view === "login" ? "Heureux de vous revoir parmi nous." : "Rejoignez la communauté des passionnés de loisirs."}
            </p>
          </div>

          <form onSubmit={view === "login" ? handleLogin : handleSignup} className="space-y-6">
            {view === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      required
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Nom</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                      required
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.fr"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mot de passe</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-14 py-4 transition-all outline-none font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {view === "login" ? <LogIn /> : <UserPlus />}
                </>
              )}
              {view === "login" ? "Me connecter" : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-12 text-center flex flex-col gap-4">
             <p className="text-gray-400 font-bold">
               {view === "login" ? "Pas encore de compte ?" : "Déjà membre ?"} 
               <button 
                onClick={() => setView(view === "login" ? "signup" : "login")}
                className="text-[#FF6B35] ml-2 hover:underline inline-block"
               >
                 {view === "login" ? "Inscrivez-vous gratuitement" : "Connectez-vous"}
               </button>
             </p>
             <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 uppercase tracking-widest py-6 md:py-8 border-t border-gray-50">
                <ShieldCheck size={14} /> Sécurisé par Appiotti Game Shop
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

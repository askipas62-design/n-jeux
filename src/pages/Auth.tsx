import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, UserPlus, LogIn, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/Toast";
import { motion } from "motion/react";

export default function Auth({ mode: initialMode }: { mode: "login" | "signup" }) {
  const [view, setView] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      addToast(`Heureux de vous revoir !`, "success");
      const isAdmin = data.user.email === "askipas62@gmail.com";
      navigate(isAdmin ? "/admin" : "/dashboard");
    } catch (err: any) {
      addToast(err.message || "Erreur de connexion", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { firstName, lastName }
        }
      });
      
      if (error) throw error;

      // Sync with local backend for consistency in orders/reviews
      if (data.session?.access_token) {
        await fetch("/api/auth/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${data.session.access_token}`
          },
          body: JSON.stringify({ firstName, lastName })
        });
      }

      addToast("Bienvenue dans l'univers Appiotti ! Vérifiez vos emails si nécessaire.", "success");
      navigate("/boutique");
    } catch (err: any) {
      addToast(err.message || "Erreur d'inscription", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B35] rounded-full blur-[200px] opacity-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFD23F] rounded-full blur-[200px] opacity-10 translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        key={view}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden relative border border-gray-100"
      >
        <div className="p-12 md:p-16">
          <div className="text-center mb-12">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg">A</div>
              <span className="text-2xl font-black font-display text-brand-dark uppercase tracking-tight">Appiotti <span className="text-brand-orange">Game Shop</span></span>
            </Link>
            <h1 className="text-3xl md:text-5xl font-black text-brand-dark mb-4 font-display uppercase tracking-tighter">
              {view === "login" ? "Bon retour !" : "Créez votre univers"}
            </h1>
            <p className="text-gray-500 font-medium">
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
             <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 uppercase tracking-widest py-8 border-t border-gray-50">
                <ShieldCheck size={14} /> Sécurisé par Appiotti Game Shop
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

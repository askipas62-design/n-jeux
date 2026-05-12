import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, UserPlus, LogIn, ArrowRight, ShieldCheck, Loader2, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

type AuthView = "login" | "signup" | "verify" | "forgot-password";

export default function Auth({ mode: initialMode }: { mode: "login" | "signup" }) {
  const [view, setView] = useState<AuthView>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data.user) {
        login(data.session?.access_token || "", {
          email: data.user.email || "",
          firstName: data.user.user_metadata?.firstName || "Client",
          lastName: data.user.user_metadata?.lastName || "Appiotti",
          isAdmin: data.user.email === "askipas62@gmail.com"
        });
        addToast(`Bon retour !`, "success");
        navigate("/boutique");
      }
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

      if (data.user) {
        addToast("Compte créé ! Veuillez entrer le code reçu par email.", "success");
        setView("verify");
      }
    } catch (err: any) {
      addToast(err.message || "Erreur d'inscription", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      });

      if (error) throw error;

      if (data.user) {
        login(data.session?.access_token || "", {
          email: data.user.email || "",
          firstName: data.user.user_metadata?.firstName || "Client",
          lastName: data.user.user_metadata?.lastName || "Appiotti",
          isAdmin: data.user.email === "askipas62@gmail.com"
        });
        addToast("Email vérifié ! Bienvenue.", "success");
        navigate("/boutique");
      }
    } catch (err: any) {
      addToast(err.message || "Code invalide", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      addToast("Email de réinitialisation envoyé !", "success");
      setView("login");
    } catch (err: any) {
      addToast(err.message || "Erreur d'envoi", "error");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    login: "Bon retour !",
    signup: "Créez votre univers",
    verify: "Vérification",
    "forgot-password": "Mot de passe oublié"
  };

  const descriptions = {
    login: "Heureux de vous revoir parmi nous.",
    signup: "Rejoignez la communauté des passionnés de loisirs.",
    verify: `Entrez le code envoyé à ${email}`,
    "forgot-password": "Nous vous enverrons un lien pour réinitialiser votre compte."
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#FFF8F0] relative overflow-hidden">
      {/* Background Decor */}
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
              {titles[view]}
            </h1>
            <p className="text-gray-500 font-medium">
              {descriptions[view]}
            </p>
          </div>

          <form 
            onSubmit={
              view === "login" ? handleLogin : 
              view === "signup" ? handleSignup : 
              view === "forgot-password" ? handleForgotPassword :
              handleVerify
            } 
            className="space-y-6"
          >
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

            {(view === "login" || view === "signup" || view === "forgot-password") && (
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
            )}

            {view === "verify" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Code de vérification</label>
                <div className="relative">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    required
                    type="text" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold text-center text-2xl tracking-[0.5em]"
                  />
                </div>
              </div>
            )}

            {(view === "login" || view === "signup") && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mot de passe</label>
                  {view === "login" && (
                    <button 
                      type="button"
                      onClick={() => setView("forgot-password")}
                      className="text-[10px] font-black text-brand-orange uppercase hover:underline"
                    >
                      Oublié ?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                  <input 
                    required
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                  />
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {view === "login" && <LogIn />}
                  {view === "signup" && <UserPlus />}
                  {view === "verify" && <ArrowRight />}
                  {view === "forgot-password" && <Mail />}
                </>
              )}
              {view === "login" ? "Me connecter" : 
               view === "signup" ? "Créer mon compte" : 
               view === "forgot-password" ? "Réinitialiser" :
               "Vérifier le code"}
            </button>
            
            {(view === "verify" || view === "forgot-password") && (
              <button 
                type="button"
                onClick={() => setView(view === "verify" ? "signup" : "login")}
                className="w-full text-center text-xs font-bold text-gray-400 uppercase flex items-center justify-center gap-2 hover:text-brand-orange transition-colors"
              >
                <ArrowLeft size={14} /> Retour
              </button>
            )}
          </form>

          <div className="mt-12 text-center flex flex-col gap-4">
             <p className="text-gray-400 font-bold">
               {view === "login" ? "Pas encore de compte ?" : view === "signup" ? "Déjà membre ?" : ""} 
               {(view === "login" || view === "signup") && (
                 <button 
                  onClick={() => setView(view === "login" ? "signup" : "login")}
                  className="text-[#FF6B35] ml-2 hover:underline inline-block"
                 >
                   {view === "login" ? "Inscrivez-vous gratuitement" : "Connectez-vous"}
                 </button>
               )}
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

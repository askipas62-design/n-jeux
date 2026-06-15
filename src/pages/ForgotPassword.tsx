import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, ShieldCheck, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/Toast";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;

      addToast("Un code de réinitialisation à 6 chiffres a été envoyé à votre email.", "success");
      navigate(`/verifier-code?type=recovery&email=${encodeURIComponent(email)}`, { replace: true });
    } catch (err: any) {
      if (err.message.includes("User not found")) {
        addToast("Aucun compte associé à cet email. Vérifiez et réessayez.", "error");
      } else {
        addToast(err.message || "Erreur lors de l'envoi du code", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B35] rounded-full blur-[200px] opacity-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFD23F] rounded-full blur-[200px] opacity-10 translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-xl bg-white rounded-[24px] md:rounded-[48px] shadow-2xl overflow-hidden relative border border-gray-100 p-6 md:p-16 animate-fade-in-up"
      >
        <div className="text-center mb-6 md:mb-12">
          <Link to="/connexion" className="inline-flex items-center gap-2 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FF6B35] rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl text-white shadow-lg">A</div>
            <span className="text-lg md:text-2xl font-black font-display text-brand-dark uppercase tracking-tight">Appiotti <span className="text-brand-orange">Game Shop</span></span>
          </Link>
          <h1 className="text-2xl md:text-5xl font-black text-brand-dark mb-3 md:mb-4 font-display uppercase tracking-tighter">
            Mot de passe oublié
          </h1>
          <p className="text-gray-500 font-medium">
            Entrez votre email pour recevoir un code de réinitialisation à 6 chiffres.
          </p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-6">
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

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send />}
            Envoyer le code
          </button>
        </form>

        <div className="mt-12 text-center flex flex-col gap-4">
          <Link 
            to="/connexion"
            className="text-gray-400 font-bold hover:text-[#FF6B35] inline-flex items-center justify-center gap-1 transition-colors"
          >
            <ArrowLeft size={16} /> Retour à la connexion
          </Link>
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 uppercase tracking-widest py-8 border-t border-gray-50">
            <ShieldCheck size={14} /> Sécurisé par Appiotti Game Shop
          </div>
        </div>
      </div>
    </div>
  );
}

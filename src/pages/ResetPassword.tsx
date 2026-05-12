import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../components/ui/Toast";
import { motion } from "motion/react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast("Les mots de passe ne correspondent pas.", "error");
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setSuccess(true);
      addToast("Mot de passe mis à jour !", "success");
      setTimeout(() => navigate("/connexion"), 3000);
    } catch (err: any) {
      addToast(err.message || "Erreur de mise à jour", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-[#FFF8F0] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B35] rounded-full blur-[200px] opacity-10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFD23F] rounded-full blur-[200px] opacity-10 translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden relative border border-gray-100 p-12 md:p-16"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-brand-dark mb-4 font-display uppercase tracking-tighter">
            {success ? "Félicitations !" : "Espace Sécurisé"}
          </h1>
          <p className="text-gray-500 font-medium">
            {success 
              ? "Votre mot de passe a été réinitialisé avec succès. Redirection..." 
              : "Veuillez définir votre nouveau mot de passe ci-dessous."
            }
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="w-24 h-24 bg-brand-green/20 text-brand-green rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <button 
              onClick={() => navigate("/connexion")}
              className="text-brand-orange font-black uppercase tracking-widest text-sm hover:underline"
            >
              Se connecter maintenant
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Nouveau mot de passe</label>
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

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-4">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  required
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#FF6B35] focus:bg-white rounded-full pl-14 pr-6 py-4 transition-all outline-none font-bold"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-5 rounded-full font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Mettre à jour"}
            </button>
          </form>
        )}

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 uppercase tracking-widest py-8 border-t border-gray-50">
            <ShieldCheck size={14} /> Sécurisé par Appiotti Game Shop
          </div>
        </div>
      </motion.div>
    </div>
  );
}

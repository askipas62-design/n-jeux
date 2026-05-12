import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Copy, Check, Upload, AlertTriangle, ArrowRight, Loader2, Info, CreditCard, TrendingUp, Users, Zap, Shield, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { motion, AnimatePresence } from "motion/react";

export default function Payment() {
  const { totalTTC, items, clearCart } = useCart();
  const { token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const bankDetails = {
    holder: "MONSIEUR HERVÉ APPIOTTI",
    iban: "FR76 1234 5678 9012 3456 7890 123",
    bic: "APPIFR2X",
    bank: "Crédit Agricole Charente"
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    addToast(`${field} copié !`, "success");
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ items, totalTTC }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.id);
        setOrderCreated(true);
        addToast("Commande créée avec succès !", "success");
      }
    } catch (err) {
      addToast("Erreur lors de la création de la commande", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("proof", file);

    try {
      const res = await fetch(`/api/orders/${orderId}/proof`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        addToast("Preuve de virement envoyée ! Votre commande est en cours de validation.", "success");
        clearCart();
        navigate("/");
      }
    } catch (err) {
      addToast("Erreur lors de l'envoi de la preuve", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFF8F0] min-h-screen pb-24">
      {/* 1. MANIFESTE / WHY VIREMENT (Hero Section) */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-dark text-white p-12 md:p-24 rounded-[80px] shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group"
          >
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                  x: [0, 50, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-orange/20 rounded-full blur-[140px]" 
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, -90, 0],
                  y: [0, 100, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-green/20 rounded-full blur-[120px]" 
              />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-12">
                <div className="max-w-3xl">
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-brand-orange font-black uppercase tracking-[0.6em] text-[10px] mb-6 block"
                  >
                    Le Manifeste de la Confiance
                  </motion.span>
                  <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-8xl font-black font-display uppercase tracking-[-0.04em] leading-[0.85]"
                  >
                    Pourquoi <br />
                    le <span className="text-brand-orange italic">Virement ?</span>
                  </motion.h1>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 backdrop-blur-3xl border-2 border-white/10 p-8 rounded-[40px] max-w-sm relative"
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-orange rounded-2xl flex items-center justify-center shadow-xl">
                    <Info size={24} />
                  </div>
                  <p className="text-lg md:text-xl text-gray-300 leading-tight font-medium italic">
                    "Nous avons choisi de supprimer les commissions bancaires inutiles pour vous offrir le prix juste, sans aucun compromis sur l'humain."
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-8 h-[2px] bg-brand-orange" />
                    <p className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Hervé Appiotti</p>
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {[
                  { 
                    icon: <Shield className="text-brand-orange" size={32} />, 
                    title: "Sécurité Bancaire", 
                    text: "Votre transaction est cryptée par votre propre banque. Aucun numéro de carte ne circule sur nos serveurs." 
                  },
                  { 
                    icon: <TrendingUp className="text-brand-green" size={32} />, 
                    title: "Prix Directs", 
                    text: "Sans les 3% de frais VISA/Mastercard, nous répercutons l'économie directement sur votre facture finale." 
                  },
                  { 
                    icon: <Users className="text-sky-500" size={32} />, 
                    title: "Relation Humaine", 
                    text: "Un virement, c'est un lien direct. Hervé vérifie personnellement chaque paiement avant la préparation." 
                  },
                  { 
                    icon: <Zap className="text-brand-yellow" size={32} />, 
                    title: "Anti-Spéculation", 
                    text: "Le virement élimine les 'achat-robots' qui épuisent nos stocks. Seuls les vrais passionnés accèdent à nos produits." 
                  },
                  { 
                    icon: <Heart className="text-red-400" size={32} />, 
                    title: "Engagement Éthique", 
                    text: "Soutenir un commerce sans intermédiaires financiers globaux, c'est choisir une consommation plus souveraine." 
                  },
                  { 
                    icon: <Check className="text-brand-orange" size={32} />, 
                    title: "Preuve Légale", 
                    text: "Votre relevé bancaire est une preuve juridique irréfutable de votre achat, vous garantissant une protection totale." 
                  }
                ].map((reason, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="w-16 h-16 bg-white/5 rounded-[24px] flex items-center justify-center mb-8 border border-white/10 group-hover:bg-brand-orange group-hover:rotate-[10deg] group-hover:scale-110 transition-all duration-500">
                      {reason.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic group-hover:text-brand-orange transition-colors">{reason.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">{reason.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
           <div className="inline-flex p-6 bg-brand-orange/10 rounded-[32px] text-brand-orange mb-8 shadow-2xl">
              <ShieldCheck size={64} />
           </div>
           <h2 className="text-5xl md:text-8xl font-black text-brand-dark mb-6 font-display uppercase tracking-tighter">Étape de <span className="text-brand-orange">Paiement</span></h2>
           <p className="text-xl text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Veuillez suivre les instructions ci-dessous</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           {/* Left Column: Bank Details & Instructions */}
           <div className="space-y-8">
              <div className="bg-[#1B1B2F] text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B35] rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                 <h2 className="text-2xl font-black mb-8 flex items-center gap-3 font-display">Coordonnées Bancaires</h2>
                 
                 <div className="space-y-8 relative z-10">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Titulaire du compte</label>
                       <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 group cursor-pointer" onClick={() => handleCopy(bankDetails.holder, "Titulaire")}>
                          <span className="font-bold">{bankDetails.holder}</span>
                          {copied === "Titulaire" ? <Check size={16} className="text-[#06D6A0]" /> : <Copy size={16} className="opacity-30 group-hover:opacity-100" />}
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">IBAN</label>
                       <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 group cursor-pointer" onClick={() => handleCopy(bankDetails.iban, "IBAN")}>
                          <span className="font-mono text-sm break-all">{bankDetails.iban}</span>
                          {copied === "IBAN" ? <Check size={16} className="text-[#06D6A0]" /> : <Copy size={16} className="opacity-30 group-hover:opacity-100" />}
                       </div>
                    </div>

                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">BIC</label>
                       <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 group cursor-pointer" onClick={() => handleCopy(bankDetails.bic, "BIC")}>
                          <span className="font-mono text-sm">{bankDetails.bic}</span>
                          {copied === "BIC" ? <Check size={16} className="text-[#06D6A0]" /> : <Copy size={16} className="opacity-30 group-hover:opacity-100" />}
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[48px] shadow-xl border border-gray-100">
                 <h2 className="text-2xl font-black mb-8 font-display text-[#1B1B2F]">Comment ça marche ?</h2>
                 <div className="space-y-8">
                    {[
                      { num: "01", title: "Valider la commande", text: "Cliquez sur le bouton pour confirmer vos articles et obtenir votre numéro de commande." },
                      { num: "02", title: "Effectuer le virement", text: "Utilisez les coordonnées bancaires ci-dessus. Indiquez votre n° de commande en motif." },
                      { num: "03", title: "Télécharger la preuve", text: "Prenez en photo ou téléchargez l'accusé de réception de votre virement bancaire." },
                      { num: "04", title: "Validation & Envoi", text: "Dès réception, Hervé valide votre commande et procède à l'expédition immédiate." },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-6">
                        <span className="text-4xl font-black text-[#FF6B35]/20 font-display leading-none">{step.num}</span>
                        <div>
                          <h4 className="font-black text-[#1B1B2F] mb-1">{step.title}</h4>
                          <p className="text-sm text-gray-400 leading-relaxed">{step.text}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Right Column: Steps & Action */}
           <div className="space-y-8">
              {!orderCreated ? (
                <div className="bg-white p-12 rounded-[48px] shadow-2xl border-4 border-[#FF6B35]/20 flex flex-col items-center text-center">
                   <div className="w-24 h-24 bg-[#FF6B35] rounded-[32px] flex items-center justify-center text-white mb-8 shadow-xl">
                      <ArrowRight size={48} />
                   </div>
                   <h2 className="text-3xl font-black text-[#1B1B2F] mb-6 font-display uppercase tracking-tight">Prêt à commander ?</h2>
                   <p className="text-gray-500 mb-10">En validant, nous réservons vos articles pendant 72h, le temps de recevoir votre virement.</p>
                   
                   <div className="w-full p-8 bg-gray-50 rounded-3xl mb-10 border border-gray-100">
                      <div className="flex justify-between items-center text-lg font-bold mb-2">
                         <span className="text-gray-400">Total à régler</span>
                         <span className="text-3xl font-black text-[#FF6B35] font-display">{totalTTC.toFixed(2)}€</span>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest text-right">Paiement par virement uniquement</p>
                   </div>

                   <button 
                     onClick={handleCreateOrder}
                     disabled={loading}
                     className="w-full bg-[#FF6B35] hover:bg-[#ff8c42] text-white py-6 rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                     Confirmer ma commande
                   </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-12 rounded-[48px] shadow-2xl border-4 border-[#06D6A0]/20 flex flex-col items-center text-center"
                >
                   <div className="w-24 h-24 bg-[#06D6A0] rounded-[32px] flex items-center justify-center text-white mb-8 shadow-xl">
                      <Check size={48} />
                   </div>
                   <h2 className="text-3xl font-black text-[#1B1B2F] mb-2 font-display uppercase tracking-tight">Commande {orderId}</h2>
                   <p className="text-[#06D6A0] font-bold mb-8 uppercase tracking-widest text-sm">Validée & En attente de paiement</p>
                   
                   <div className="w-full p-8 bg-[#06D6A0]/5 rounded-3xl mb-10 border-2 border-dashed border-[#06D6A0]/20 space-y-6">
                      <div className="flex flex-col items-center">
                         <label className="text-xs font-bold text-gray-400 uppercase mb-4">Télécharger votre preuve de virement</label>
                         <input 
                           type="file" 
                           id="proof" 
                           className="hidden" 
                           onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                         />
                         <label 
                           htmlFor="proof"
                           className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B35] hover:bg-white transition-all group"
                         >
                            {file ? (
                              <div className="flex flex-col items-center text-[#FF6B35]">
                                 <Check size={32} />
                                 <span className="font-bold mt-2">{file.name}</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-gray-300 group-hover:text-[#FF6B35]">
                                 <Upload size={32} />
                                 <span className="font-bold mt-2">Cliquez ou glissez l'image ici</span>
                              </div>
                            )}
                         </label>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 p-4 bg-[#FFD23F]/10 rounded-2xl border border-[#FFD23F]/30 text-[#1B1B2F] mb-10 text-left">
                      <AlertTriangle className="text-[#FF6B35]" size={36} />
                      <p className="text-xs font-bold leading-relaxed">
                        Important : Notez bien votre numéro de commande <strong>{orderId}</strong> dans le motif du virement pour accélérer le traitement.
                      </p>
                   </div>

                   <button 
                     onClick={handleUploadProof}
                     disabled={!file || loading}
                     className="w-full bg-[#1B1B2F] text-white py-6 rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : <Upload />}
                     Envoyer la preuve
                   </button>
                   
                   <button onClick={() => navigate("/")} className="mt-8 text-gray-400 font-bold hover:text-[#FF6B35] underline transition-colors">
                      Le faire plus tard via mon compte
                   </button>
                </motion.div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

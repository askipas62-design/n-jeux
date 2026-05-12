import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Copy, Check, Upload, AlertTriangle, ArrowRight, Loader2, Info, CreditCard, TrendingUp, Users, Zap, Shield, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { motion, AnimatePresence } from "motion/react";

import { orderService } from "../services/orderService";

export default function Payment() {
  const { totalTTC, items, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId] = useState(() => "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase());
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
    if (!user) {
      addToast("Vous devez être connecté pour passer commande", "error");
      navigate("/connexion");
      return;
    }
    setLoading(true);
    try {
      await orderService.create({
        id: orderId,
        items,
        totalTTC,
        status: "En attente de virement"
      });
      setOrderCreated(true);
      addToast("Commande réservée ! Vous pouvez maintenant effectuer le virement.", "success");
    } catch (err: any) {
      console.error("Order creation error:", err);
      addToast(err.message || "Erreur lors de la création de la commande", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async () => {
    if (!file) {
      addToast("Veuillez sélectionner un fichier", "error");
      return;
    }
    setLoading(true);

    try {
      await orderService.uploadProof(orderId, file);
      
      addToast("Preuve de virement reçue ! Nous validons cela rapidement.", "success");
      clearCart();
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Upload proof error:", err);
      addToast("Erreur lors de l'envoi de la preuve", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFF8F0] min-h-screen pb-24">
      <div className="container mx-auto px-4 max-w-5xl pt-24">
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
                 <h2 className="text-2xl font-black mb-8 flex flex-col gap-1 font-display">
                    <span>Coordonnées Bancaires</span>
                    <span className="text-[10px] text-brand-green uppercase tracking-[0.3em] font-black">Virement Bancaire Instantané</span>
                 </h2>
                 
                 <div className="space-y-8 relative z-10">
                    <motion.div 
                      key="motif-virement"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex flex-col gap-2 p-6 rounded-3xl border-2 transition-all duration-500 ${orderCreated ? 'bg-brand-orange/20 border-brand-orange/40' : 'bg-brand-yellow/10 border-brand-yellow/30'}`}
                    >
                       <label className={`text-[10px] uppercase font-black tracking-widest ${orderCreated ? 'text-brand-orange' : 'text-brand-yellow'}`}>
                          Motif du virement {orderCreated ? '(À SAISIR)' : '(VOTRE RÉFÉRENCE)'}
                       </label>
                       <div 
                         className="flex items-center justify-between bg-white/10 p-4 rounded-xl border border-white/20 group cursor-pointer" 
                         onClick={() => handleCopy(`#${orderId.split('-')[1]}`, "Motif")}
                       >
                          <span className={`font-black text-lg font-mono ${orderCreated ? 'text-brand-orange' : 'text-brand-yellow'}`}>
                             #{orderId.split('-')[1]}
                          </span>
                          {copied === "Motif" ? <Check size={16} className="text-[#06D6A0]" /> : <Copy size={16} className={`${orderCreated ? 'text-brand-orange' : 'text-brand-yellow'} opacity-60 group-hover:opacity-100`} />}
                       </div>
                       <p className={`text-[9px] font-bold uppercase tracking-widest ${orderCreated ? 'text-brand-orange/80' : 'text-brand-yellow/80'}`}>
                          {orderCreated ? 'Utilisez ce numéro comme référence de votre virement' : 'Ce numéro unique sera associé à votre commande'}
                       </p>
                    </motion.div>

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
                      { num: "01", title: "Référence de commande", text: `Notez le numéro #${orderId.split('-')[1]} visible ci-contre. Il s'agit de votre identifiant unique.` },
                      { num: "02", title: "Virement Instantané", text: "Effectuez votre virement vers notre IBAN en saisissant impérativement cette référence en motif." },
                      { num: "03", title: "Confirmer & Preuve", text: "Cliquez sur 'Confirmer' pour réserver vos articles et envoyez votre justificatif de paiement." },
                      { num: "04", title: "Expédition Prioritaire", text: "Avec le virement instantané, Hervé prépare votre colis dans l'heure qui suit la réception." },
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
                   <h2 className="text-3xl font-black text-[#1B1B2F] mb-2 font-display uppercase tracking-tight">Commande #{orderId.split('-')[1]}</h2>
                   <p className="text-[#06D6A0] font-bold mb-8 uppercase tracking-widest text-sm">Validée & En attente de paiement</p>
                   
                   <div className="w-full p-8 bg-[#06D6A0]/5 rounded-3xl mb-10 border-2 border-dashed border-[#06D6A0]/20 space-y-6">
                      <div className="flex flex-col items-center">
                         <label className="text-xs font-bold text-gray-400 uppercase mb-4">Télécharger votre preuve de virement</label>
                         <input 
                           type="file" 
                           id="proof" 
                           className="hidden" 
                           accept="image/*,.pdf"
                           onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                         />
                         <label 
                           htmlFor="proof"
                           className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FF6B35] hover:bg-white transition-all group"
                         >
                            {file ? (
                               <div className="flex flex-col items-center text-[#FF6B35]">
                                  <Check size={32} />
                                  <span className="font-bold mt-2 truncate max-w-[200px]">{file.name}</span>
                               </div>
                            ) : (
                               <div className="flex flex-col items-center text-gray-300 group-hover:text-[#FF6B35]">
                                  <Upload size={32} />
                                  <span className="font-bold mt-2 uppercase text-[10px] tracking-widest">Cliquez pour envoyer</span>
                               </div>
                            )}
                         </label>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 p-4 bg-[#FFD23F]/10 rounded-2xl border border-[#FFD23F]/30 text-[#1B1B2F] mb-10 text-left">
                      <AlertTriangle className="text-[#FF6B35]" size={36} />
                      <p className="text-xs font-bold leading-relaxed">
                        Important : Indiquez impérativement <strong>#{orderId.split('-')[1]}</strong> en tant que <strong>motif / référence</strong> de votre virement bancaire pour un traitement éclair (virement instantané recommandé).
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
                   
                   <button onClick={() => navigate("/dashboard")} className="mt-8 text-gray-400 font-bold hover:text-[#FF6B35] underline transition-colors uppercase text-[10px] tracking-widest">
                      Plus tard via mon compte
                   </button>
                </motion.div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

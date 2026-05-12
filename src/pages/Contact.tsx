import { motion } from "motion/react";
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, Loader2, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "../components/ui/Toast";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast("Votre message a été envoyé ! Nous vous répondrons sous 24h.", "success");
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="bg-brand-cream min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-20">
           <motion.h1 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-5xl md:text-8xl font-black text-brand-dark mb-6 font-display uppercase tracking-tighter"
           >
             Contactez <span className="text-brand-orange">Hervé</span>
           </motion.h1>
           <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
             Une question sur un produit ou une commande ? Notre équipe est à votre écoute pour vous conseiller.
           </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
           {/* Sidebar Info */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-brand-dark text-white p-12 rounded-[64px] shadow-2xl relative overflow-hidden h-full border border-white/5">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-brand-yellow rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2" />
                 
                 <h3 className="text-3xl font-black mb-12 font-display uppercase tracking-tight">Nos Coordonnées</h3>
                 
                 <div className="space-y-12">
                    <div className="flex gap-6 group">
                       <div className="p-4 bg-white/5 rounded-2xl text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all shadow-lg border border-white/10">
                          <MapPin size={24} />
                       </div>
                       <div>
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 opacity-60">Notre boutique officielle</h4>
                          <p className="text-lg font-bold leading-tight font-display uppercase tracking-tight">
                             18 Route de Marillac<br />16220 Saint-Sornin, France
                          </p>
                       </div>
                    </div>

                    <div className="flex gap-6 group">
                       <div className="p-4 bg-white/5 rounded-2xl text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all shadow-lg border border-white/10">
                          <Phone size={24} />
                       </div>
                       <div>
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 opacity-60">Appelez-nous</h4>
                          <p className="text-lg font-bold font-display uppercase tracking-tight">06 48 59 13 86</p>
                       </div>
                    </div>

                    <div className="flex gap-6 group">
                       <div className="p-4 bg-white/5 rounded-2xl text-sky-400 group-hover:bg-sky-400 group-hover:text-white transition-all shadow-lg border border-white/10">
                          <Mail size={24} />
                       </div>
                       <div>
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 opacity-60">Email direct</h4>
                          <p className="text-lg font-bold font-display tracking-tight hover:text-brand-orange transition-colors">contact@appiotti.fr</p>
                       </div>
                    </div>

                    <div className="flex gap-6 group">
                       <div className="p-4 bg-white/5 rounded-2xl text-brand-yellow group-hover:bg-brand-yellow group-hover:text-white transition-all shadow-lg border border-white/10">
                          <Clock size={24} />
                       </div>
                       <div>
                          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 opacity-60">Horaires Boutique</h4>
                          <p className="text-lg font-bold font-display uppercase tracking-tight">Lundi - Vendredi<br />09h00 - 18h00</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Contact Form */}
           <div className="lg:col-span-3">
              <div className="bg-white p-12 md:p-20 rounded-[64px] shadow-2xl border border-gray-100 h-full">
                 <h3 className="text-3xl font-black mb-12 font-display text-brand-dark flex items-center gap-4 uppercase tracking-tighter">
                    <MessageSquare className="text-brand-orange" size={32} /> Envoyez-nous un message
                 </h3>

                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Votre Nom</label>
                          <input required type="text" placeholder="Hervé Appiotti" className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-orange rounded-[24px] px-8 py-5 outline-none font-bold transition-all text-xs" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Votre Email</label>
                          <input required type="email" placeholder="herve@mail.fr" className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-orange rounded-[24px] px-8 py-5 outline-none font-bold transition-all text-xs" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Sujet de votre demande</label>
                       <select className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-orange rounded-[24px] px-8 py-5 outline-none font-bold transition-all appearance-none cursor-pointer text-xs">
                          <option>Question sur un produit</option>
                          <option>Suivi de commande virement</option>
                          <option>Service Après-Vente (SAV)</option>
                          <option>Demande de partenariat</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-6">Message</label>
                       <textarea required rows={5} placeholder="Bonjour Hervé, je souhaitais avoir des précisions sur..." className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-orange rounded-[32px] px-8 py-6 outline-none font-bold transition-all resize-none text-xs"></textarea>
                    </div>

                    <button 
                      disabled={loading}
                      type="submit" 
                      className="w-full bg-brand-dark text-white py-6 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-brand-orange transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                       {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} 
                       Envoyer ma demande
                    </button>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

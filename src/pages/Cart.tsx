import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, Package, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "motion/react";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalHT, totalTTC, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4 bg-brand-cream">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 md:p-24 rounded-[64px] shadow-2xl text-center border border-gray-100 max-w-2xl flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-brand-orange/10 rounded-[32px] flex items-center justify-center text-brand-orange mb-8 shadow-xl">
             <ShoppingBag size={64} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-dark mb-6 font-display uppercase tracking-tighter">Votre panier est vide</h1>
          <p className="text-xl text-gray-500 mb-12 font-medium">On dirait que vous n'avez pas encore trouvé la pépite pour votre été !</p>
          <Link to="/boutique" className="inline-flex items-center gap-4 bg-brand-dark text-white px-10 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-orange transition-all shadow-2xl">
            Explorer la boutique <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-black text-brand-dark mb-12 font-display uppercase tracking-tighter">Mon <span className="text-brand-orange">Panier</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-[40px] p-8 shadow-xl flex items-center gap-8 border border-gray-100 hover:border-brand-orange/30 transition-all group"
                >
                  <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden relative">
                     <Package size={40} className="text-gray-200" />
                  </div>
                  <div className="flex-grow text-left">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category}</span>
                        <h3 className="text-2xl font-black text-brand-dark font-display uppercase tracking-tight">{item.name}</h3>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors bg-red-50 p-3 rounded-2xl"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-3 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-brand-orange"><Minus size={16} /></button>
                        <span className="w-10 text-center font-black text-lg text-brand-dark">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-3 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-brand-orange"><Plus size={16} /></button>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-brand-orange font-mono">{(item.priceHT * 1.2 * item.quantity).toFixed(2)}€ <span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans ml-1 text-center">TTC</span></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <div className="flex justify-center pt-8">
               <Link to="/boutique" className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-3">
                  <ShoppingBag size={20} /> Continuer mes achats
               </Link>
            </div>
          </div>

          {/* Summary Sidebar */}
          <aside className="lg:w-full">
             <div className="bg-brand-dark text-white p-12 rounded-[64px] shadow-2xl sticky top-32 border-b-[12px] border-brand-orange">
                <h2 className="text-2xl font-black mb-10 border-b border-white/10 pb-6 font-display uppercase tracking-tight">Résumé</h2>
                
                <div className="space-y-6 mb-10 text-gray-400 font-medium text-sm">
                   <div className="flex justify-between">
                      <span>Articles ({itemCount})</span>
                      <span className="text-white font-mono">{totalHT.toFixed(2)}€</span>
                   </div>
                   <div className="flex justify-between">
                      <span>Sous-total HT</span>
                      <span className="text-white font-mono">{totalHT.toFixed(2)}€</span>
                   </div>
                   <div className="flex justify-between">
                      <span>TVA (20%)</span>
                      <span className="text-white font-mono">{(totalTTC - totalHT).toFixed(2)}€</span>
                   </div>
                   <div className="flex justify-between text-brand-green font-black uppercase text-[10px] tracking-widest">
                      <span>Expédition</span>
                      <span>{totalTTC > 100 ? "Gratuite" : "Calculée ensuite"}</span>
                   </div>
                </div>

                <div className="border-t border-white/10 pt-8 mb-12">
                   <div className="flex justify-between items-baseline mb-2">
                      <span className="text-lg font-black uppercase tracking-widest text-gray-500 text-xs">Total TTC</span>
                      <span className="text-5xl font-black text-brand-yellow font-mono tracking-tighter">
                         {totalTTC.toFixed(2)}€
                      </span>
                   </div>
                </div>

                <Link to="/paiement" className="w-full bg-brand-orange hover:bg-brand-yellow hover:text-brand-dark text-white py-6 px-10 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl mb-12">
                   Payer par virement <ArrowRight size={20} />
                </Link>

                <div className="flex flex-col gap-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                   <div className="flex items-center gap-4 py-4 px-6 bg-white/5 rounded-2xl border border-white/10"><ShieldCheck className="text-brand-green" size={20} /> Protection acheteur</div>
                   <div className="flex items-center gap-4 py-4 px-6 bg-white/5 rounded-2xl border border-white/10"><CreditCard className="text-brand-yellow" size={20} /> Virement bancaire pro</div>
                </div>
             </div>
             
             <div className="mt-12 p-12 bg-white rounded-[64px] border-2 border-brand-yellow/30 border-dashed text-center">
                <h3 className="font-black text-brand-dark mb-8 font-display uppercase tracking-widest text-xs">Complétez votre été !</h3>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="min-w-[160px] h-28 bg-brand-cream rounded-[32px] shadow-inner border border-gray-100 flex items-center justify-center text-brand-orange">
                        <Package size={40} className="opacity-40" />
                     </div>
                   ))}
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

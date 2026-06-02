import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, Package } from "lucide-react";
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
          className="bg-white p-8 md:p-16 rounded-[48px] shadow-2xl text-center border border-gray-100 max-w-xl flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mb-4 shadow-xl">
            <ShoppingBag size={40} />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-brand-dark mb-3 font-display uppercase tracking-tighter">Votre panier est vide</h1>
          <p className="text-sm text-gray-500 mb-6 font-medium">On dirait que vous n'avez pas encore trouvé la pépite pour votre été !</p>
          <Link to="/boutique" className="inline-flex items-center gap-3 bg-brand-dark text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-brand-orange transition-all shadow-2xl">
            Explorer la boutique <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen pt-4 pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-black text-brand-dark mb-4 font-display uppercase tracking-tighter">Mon <span className="text-brand-orange">Panier</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-3xl p-4 shadow-xl flex items-center gap-4 border border-gray-100 hover:border-brand-orange/30 transition-all group"
                >
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden relative">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={28} className="text-gray-200" />
                    )}
                  </div>
                  <div className="flex-grow text-left min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.category}</span>
                        <h3 className="text-sm font-black text-brand-dark font-display uppercase tracking-tight truncate">{item.name}</h3>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors bg-red-50 p-1.5 rounded-lg shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-brand-orange"><Minus size={12} /></button>
                        <span className="w-6 text-center font-black text-xs text-brand-dark">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-white rounded-lg transition-all text-gray-400 hover:text-brand-orange"><Plus size={12} /></button>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-brand-orange font-mono">{(item.priceHT * 1.2 * item.quantity).toFixed(2)}€ <span className="text-[8px] text-gray-400 uppercase tracking-widest font-sans">TTC</span></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="flex justify-center pt-2">
              <Link to="/boutique" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-2">
                <ShoppingBag size={14} /> Continuer mes achats
              </Link>
            </div>
          </div>

          {/* Summary Sidebar */}
          <aside className="lg:w-full">
            <div className="bg-brand-dark text-white p-6 rounded-[40px] shadow-2xl sticky top-16 border-b-[8px] border-brand-orange">
              <h2 className="text-lg font-black mb-4 border-b border-white/10 pb-3 font-display uppercase tracking-tight">Résumé</h2>

              <div className="space-y-2 mb-4 text-gray-400 font-medium text-xs">
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
                <div className="flex justify-between text-brand-green font-black uppercase text-[8px] tracking-widest">
                  <span>Expédition</span>
                  <span>{totalTTC > 100 ? "Gratuite" : "Calculée ensuite"}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total TTC</span>
                  <span className="text-3xl font-black text-brand-yellow font-mono tracking-tighter">
                    {totalTTC.toFixed(2)}€
                  </span>
                </div>
              </div>

              <Link to="/paiement" className="w-full bg-brand-orange hover:bg-brand-yellow hover:text-brand-dark text-white py-3 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl mb-4">
                Payer par virement <ArrowRight size={16} />
              </Link>

              <div className="flex flex-col gap-2 text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2 py-2 px-3 bg-white/5 rounded-xl border border-white/10"><ShieldCheck className="text-brand-green" size={14} /> Protection acheteur</div>
                <div className="flex items-center gap-2 py-2 px-3 bg-white/5 rounded-xl border border-white/10"><CreditCard className="text-brand-yellow" size={14} /> Virement bancaire pro</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

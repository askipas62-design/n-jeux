import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, CreditCard, Package, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalHT, totalTTC, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4 bg-brand-cream">
        <div 
          className="bg-white p-8 md:p-16 rounded-[40px] shadow-2xl text-center border border-gray-100 max-w-xl flex flex-col items-center animate-scale-in"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-orange/10 rounded-[24px] flex items-center justify-center text-brand-orange mb-6 shadow-xl">
             <ShoppingBag size={40} />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-brand-dark mb-4 font-display uppercase tracking-tighter">Votre panier est vide</h1>
          <p className="text-base md:text-lg text-gray-500 mb-8 font-medium">On dirait que vous n'avez pas encore trouvé la pépite pour votre été !</p>
          <Link to="/boutique" className="inline-flex items-center gap-3 bg-brand-dark text-white px-8 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-orange transition-all shadow-2xl">
            Explorer la boutique <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen pt-6 md:pt-12 pb-12 md:pb-24">
      <div className="container mx-auto px-3 md:px-4">
        <h1 className="text-2xl md:text-5xl font-black text-brand-dark mb-6 md:mb-10 font-display uppercase tracking-tighter">Mon <span className="text-brand-orange">Panier</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[24px] md:rounded-[32px] p-4 md:p-6 shadow-lg flex items-center gap-3 md:gap-6 border border-gray-100 hover:border-brand-orange/30 transition-all animate-slide-in-left"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden relative">
                     {item.image ? (
                       <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                       <Package size={24} className="text-gray-200" />
                     )}
                  </div>
                  <div className="flex-grow min-w-0 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.category}</span>
                        <h3 className="text-sm md:text-xl font-black text-brand-dark font-display uppercase tracking-tight truncate">{item.name}</h3>
                        {item.selectedOption && (
                          <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest">Taille : {item.selectedOption}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="shrink-0 text-gray-300 hover:text-red-500 transition-colors bg-red-50 p-2 md:p-3 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 md:mt-4">
                      <div className="flex items-center bg-gray-50 rounded-xl md:rounded-2xl p-0.5 md:p-1 border border-gray-100">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 md:p-3 hover:bg-white rounded-lg md:rounded-xl transition-all text-gray-400 hover:text-brand-orange"><Minus size={14} /></button>
                        <span className="w-7 md:w-10 text-center font-black text-sm md:text-lg text-brand-dark">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 md:p-3 hover:bg-white rounded-lg md:rounded-xl transition-all text-gray-400 hover:text-brand-orange"><Plus size={14} /></button>
                      </div>
                      <div className="text-right">
                        <span className="text-sm md:text-2xl font-black text-brand-orange font-mono">{(item.priceHT * 1.2 * item.quantity).toFixed(2)}€ <span className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-sans ml-1 text-center">TTC</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            
            <div className="flex justify-center pt-4 md:pt-6">
               <Link to="/boutique" className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-2">
                  <ShoppingBag size={16} /> Continuer mes achats
               </Link>
            </div>
          </div>

          {/* Summary Sidebar */}
          <aside className="lg:w-full">
             <div className="bg-brand-dark text-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] shadow-xl sticky top-24 border-b-[8px] md:border-b-[12px] border-brand-orange">
                <h2 className="text-lg md:text-2xl font-black mb-6 md:mb-8 border-b border-white/10 pb-4 md:pb-6 font-display uppercase tracking-tight">Résumé</h2>
                
                <div className="space-y-3 md:space-y-5 mb-6 md:mb-8 text-gray-400 font-medium text-xs md:text-sm">
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
                   <div className="flex justify-between text-brand-green font-black uppercase text-[9px] md:text-[10px] tracking-widest">
                      <span>Expédition</span>
                      <span>{totalTTC > 100 ? "Gratuite" : "Calculée ensuite"}</span>
                   </div>
                </div>

                <div className="border-t border-white/10 pt-5 md:pt-6 mb-6 md:mb-10">
                   <div className="flex justify-between items-baseline">
                      <span className="font-black uppercase tracking-widest text-gray-500 text-[10px] md:text-xs">Total TTC</span>
                      <span className="text-2xl md:text-4xl font-black text-brand-yellow font-mono tracking-tighter">
                         {totalTTC.toFixed(2)}€
                      </span>
                   </div>
                </div>

                <Link to="/paiement" className="w-full bg-brand-orange hover:bg-brand-yellow hover:text-brand-dark text-white py-4 md:py-5 px-6 md:px-8 rounded-[20px] md:rounded-[24px] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl mb-6 md:mb-10">
                   Payer  <ArrowRight size={18} />
                </Link>

                <div className="flex flex-col gap-3 md:gap-4 text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                   <div className="flex items-center gap-3 py-3 md:py-4 px-4 md:px-5 bg-white/5 rounded-xl md:rounded-2xl border border-white/10"><ShieldCheck className="text-brand-green shrink-0" size={16} /> Protection acheteur</div>
                   <div className="flex items-center gap-3 py-3 md:py-4 px-4 md:px-5 bg-white/5 rounded-xl md:rounded-2xl border border-white/10"><CreditCard className="text-brand-yellow shrink-0" size={16} /> Virement bancaire pro</div>
                </div>
             </div>
             
             {items.length > 0 && (
               <div className="mt-4 md:mt-8 p-4 md:p-8 bg-white rounded-[24px] md:rounded-[48px] border-2 border-brand-yellow/30 border-dashed text-center">
                  <h3 className="font-black text-brand-dark mb-4 md:mb-6 font-display uppercase tracking-widest text-[10px] md:text-xs">Complétez votre été !</h3>
                  <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="min-w-[120px] md:min-w-[140px] h-20 md:h-24 bg-brand-cream rounded-[24px] shadow-inner border border-gray-100 flex items-center justify-center text-brand-orange">
                          <Package size={32} className="opacity-40" />
                       </div>
                     ))}
                  </div>
               </div>
             )}
          </aside>
        </div>
      </div>
    </div>
  );
}

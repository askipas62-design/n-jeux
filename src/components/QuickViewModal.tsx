import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingCart, Heart, Star, Trophy, Zap, CircleDot, Orbit, Headset, Gamepad2, ArrowRight, RefreshCw } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "./ui/Toast";

interface QuickViewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, processingId } = useWishlist();
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const isFavorite = isInWishlist(product.id);
  const isWishlistLoading = processingId === product.id;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, 1);
      addToast(`${product.name} ajouté au panier !`, "success");
      setIsAdding(false);
      onClose();
    }, 600);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "baby-foot": return <Trophy size={64} />;
      case "ping-pong": return <Zap size={64} />;
      case "billard": return <CircleDot size={64} />;
      case "trampoline": return <Orbit size={64} />;
      case "consoles": return <Gamepad2 size={64} />;
      default: return <Headset size={64} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 bg-gray-50 hover:bg-brand-orange hover:text-white rounded-full transition-all"
            >
              <X size={24} />
            </button>

            {/* Product Visual */}
            <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-12 relative overflow-hidden group">
               
               {product.image ? (
                 <motion.img 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   src={product.image} 
                   alt={product.name} 
                   className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                 />
               ) : (
                 <motion.div 
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  className="text-brand-orange relative z-10 drop-shadow-2xl"
                 >
                   {getIcon(product.category)}
                 </motion.div>
               )}
               
               <div className="absolute bottom-6 left-6 flex gap-2">
                 <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-dark border border-white/20">
                   Premium Quality
                 </span>
               </div>
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-[#FFD23F]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < 4 ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-4 font-display uppercase tracking-tight leading-tight">
                  {product.name}
                </h2>
                <div className="text-3xl font-black text-brand-orange mb-6 font-display">
                  {(product.priceHT * 1.2).toFixed(2)}€ <span className="text-xs text-gray-300 font-bold ml-1 uppercase">TTC</span>
                </div>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                  Vivez l'expérience ultime du divertissement avec {product.name}. 
                  Design d'exception et finitions soignées pour sublimer votre intérieur.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full bg-brand-dark text-white py-5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-orange transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
                >
                  {isAdding ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <RefreshCw size={18} />
                    </motion.div>
                  ) : (
                    <ShoppingCart size={18} />
                  )}
                  {isAdding ? "AJOUT EN COURS..." : "Ajouter au panier"}
                </button>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    disabled={isWishlistLoading}
                    className={`flex-1 py-4 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2 disabled:opacity-50 disabled:cursor-wait ${
                      isFavorite ? "border-brand-orange bg-brand-orange/5 text-brand-orange" : "border-gray-100 hover:border-brand-orange text-gray-400 hover:text-brand-orange"
                    }`}
                  >
                    {isWishlistLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <RefreshCw size={16} />
                      </motion.div>
                    ) : (
                      <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                    )}
                    Favoris
                  </button>
                  <button 
                    onClick={() => {
                        onClose();
                        // Navigate to detail is handled by parent Link if we didn't have e.stopPropagation
                        // But here we're inside the modal.
                    }}
                    className="flex-1 border-2 border-brand-dark text-brand-dark py-4 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-dark hover:text-white transition-all"
                  >
                    Fiche Complète <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

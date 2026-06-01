import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Heart, Trophy, Zap, CircleDot, Orbit, Headset, Gamepad2, RefreshCw, Loader2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "./ui/Toast";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: any;
  key?: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  if (!product) return null;
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, processingId } = useWishlist();
  const { addToast } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product);
      addToast(`${product.name} ajouté au panier !`, "success");
      setIsAdding(false);
    }, 600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const isFavorite = isInWishlist(product.id);
  const isWishlistLoading = processingId === product.id;

  const getIcon = (category: string) => {
    switch (category) {
      case "baby-foot": return <Trophy size={48} />;
      case "ping-pong": return <Zap size={48} />;
      case "billard": return <CircleDot size={48} />;
      case "trampoline": return <Orbit size={48} />;
      case "consoles": return <Gamepad2 size={48} />;
      default: return <Headset size={48} />;
    }
  };

  const getCategoryImage = (category: string) => {
    switch (category) {
      case "baby-foot": return "/images/products/baby-foot-classique-2-joueurs.jpg";
      case "ping-pong": return "/images/hero-bg.jpg";
      case "billard": return "/images/products/table-de-billard-americain-7-pieds.jpg";
      case "trampoline": return "/images/products/trampoline-jardin-244cm-8-pieds.jpg";
      case "consoles": return "/images/products/playstation-5-pro.jpg";
      default: return "/images/hero-bg.jpg";
    }
  };

  const getShadowColor = (category: string) => {
    switch (category) {
      case "baby-foot": return "shadow-card-orange";
      case "ping-pong": return "shadow-card-green";
      case "billard": return "shadow-card-dark";
      case "trampoline": return "shadow-card-yellow";
      case "accessoires": return "shadow-card-green";
      case "consoles": return "shadow-card-purple";
      default: return "shadow-xl";
    }
  };

  const cardShadow = getShadowColor(product.category);

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative bg-white rounded-[24px] overflow-hidden ${cardShadow} transition-all duration-500 flex flex-col h-full border border-gray-100`}
    >
      {/* Category Badge */}
      <div className={`absolute top-4 left-4 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-tighter bg-brand-orange shadow-lg`}>
        {product?.badge || "SÉLECTION"}
      </div>

      {/* Image Section */}
      <Link to={`/boutique/${product.id}`} className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center group-hover:bg-brand-cream transition-colors duration-500">
         <img 
           src={product.image || getCategoryImage(product.category)} 
           alt={product.name} 
           className="absolute inset-0 w-full h-full object-cover transition-all duration-700" 
           referrerPolicy="no-referrer"
         />

         <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
            <button 
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              className="px-8 py-3 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-brand-dark transform translate-y-10 group-hover:translate-y-0 transition-all hover:bg-brand-dark hover:text-white shadow-xl"
            >
              Vue Rapide
            </button>
            <button 
              onClick={handleWishlist}
              disabled={isWishlistLoading}
              className={`p-4 rounded-xl transform translate-y-10 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-wait ${
                isFavorite 
                  ? "bg-brand-orange text-white" 
                  : "bg-white/90 backdrop-blur-sm text-brand-orange hover:bg-brand-orange hover:text-white"
              }`}
            >
               {isWishlistLoading ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                   <RefreshCw size={20} />
                 </motion.div>
               ) : (
                 <Heart size={20} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "" : "group-hover:fill-current"} />
               )}
            </button>
         </div>
      </Link>

      <QuickViewModal 
        product={product} 
        isOpen={quickViewOpen} 
        onClose={() => setQuickViewOpen(false)} 
      />

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        <h4 className="font-semibold text-brand-dark text-[13px] mb-1 group-hover:text-brand-orange transition-colors leading-tight">
          {product.name}
        </h4>
        <div className="flex text-brand-yellow text-[10px] mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
          ))}
          <span className="text-gray-400 ml-1">({Math.floor(product.rating * 3)})</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
             <span className="text-base font-mono font-bold text-brand-orange">
               {(product.priceHT * 1.2).toFixed(2)}€
             </span>
             <span className="text-[9px] text-gray-400 font-medium tracking-tight">TTC</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-grow bg-gradient-to-r from-brand-orange to-brand-yellow text-white py-2 rounded-xl font-bold text-[10px] shadow-lg hover:shadow-brand-orange/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {isAdding ? <Loader2 className="animate-spin" size={12} /> : <ShoppingCart size={12} />}
              {isAdding ? "AJOUT..." : "AJOUTER"}
            </button>
            <button 
              onClick={handleWishlist}
              disabled={isWishlistLoading}
              className={`p-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 border shrink-0 ${
                isFavorite 
                  ? "bg-brand-orange/10 border-brand-orange text-brand-orange" 
                  : "bg-gray-50 border-gray-100 text-gray-400 hover:text-brand-orange hover:border-brand-orange"
              }`}
            >
               {isWishlistLoading ? (
                 <RefreshCw size={12} className="animate-spin" />
               ) : (
                 <Heart size={12} fill={isFavorite ? "currentColor" : "none"} />
               )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

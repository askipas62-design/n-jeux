import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Heart, Trophy, Zap, CircleDot, Orbit, Headset, Gamepad2, RefreshCw } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "./ui/Toast";
import QuickViewModal from "./QuickViewModal";
import { getImageSrc } from "../lib/images";

interface ProductCardProps {
  product: any;
}

const getBrandInitials = (brand: string) => {
  if (!brand || brand === "Générique") return "N/J";
  return brand.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
};

const getBrandColor = (brand: string) => {
  const colors = [
    ["#f97316", "#ea580c"], ["#22c55e", "#16a34a"], ["#3b82f6", "#2563eb"],
    ["#a855f7", "#9333ea"], ["#ec4899", "#db2777"], ["#14b8a6", "#0d9488"],
    ["#eab308", "#ca8a04"], ["#f43f5e", "#e11d48"], ["#6366f1", "#4f46e5"],
    ["#84cc16", "#65a30d"], ["#06b6d4", "#0891b2"], ["#d946ef", "#c026d3"],
  ];
  let hash = 0;
  for (let i = 0; i < brand.length; i++) hash = brand.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, processingId } = useWishlist();
  const { addToast } = useToast();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!product) return null;

  const hasImage = !!product.image;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    addToast(`${product.name} ajouté au panier !`, "success");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      case "consoles": return "shadow-card-purple";
      default: return "shadow-xl";
    }
  };

  const cardShadow = getShadowColor(product.category);

  const navigateToDetail = () => {
    window.scrollTo(0, 0);
    navigate(`/boutique/${product.id}`);
  };

  return (
    <div
      className={`group relative bg-white rounded-[24px] overflow-hidden ${cardShadow} animate-fade-in-up hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 flex flex-col h-full border border-gray-100 cursor-pointer`}
      onClick={navigateToDetail}
    >
      {/* Category Badge */}
      {product?.badge && product.badge !== "Kit complet" && (
        <div className={`absolute top-4 left-4 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold text-white uppercase tracking-tighter bg-brand-orange shadow-lg`}>
          {product.badge}
        </div>
      )}
      {product.badge === "Kit complet" && (
        <div className="absolute top-4 right-4 z-10 px-2 py-0.5 rounded-md text-[9px] font-bold text-brand-dark uppercase tracking-tighter bg-brand-yellow shadow-lg">
          Kit complet
        </div>
      )}

      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-100 flex items-center justify-center group-hover:bg-brand-cream transition-colors duration-500">
        {hasImage && !imgError ? (
         <img 
           src={getImageSrc(product.image)} 
           alt={product.name} 
           width={400}
           height={300}
           loading="lazy"
           decoding="async"
           className="absolute inset-0 w-full h-full object-cover transition-all duration-700" 
           referrerPolicy="no-referrer"
           onError={() => setImgError(true)}
         />
         ) : (() => {
          const [c1, c2] = getBrandColor(product.brand);
          const initials = getBrandInitials(product.brand);
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
              <span className="text-white/90 font-black text-3xl tracking-tight">{initials}</span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">{product.brand || product.category}</span>
            </div>
          );
        })()}

         <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 pointer-events-none">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="pointer-events-auto px-8 py-3 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-brand-dark transform translate-y-10 group-hover:translate-y-0 transition-all hover:bg-brand-dark hover:text-white shadow-xl"
            >
              Vue Rapide
            </button>
            <button 
              onClick={handleWishlist}
              disabled={isWishlistLoading}
              className={`pointer-events-auto p-4 rounded-xl transform translate-y-10 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-wait ${
                isFavorite 
                  ? "bg-brand-orange text-white" 
                  : "bg-white/90 backdrop-blur-sm text-brand-orange hover:bg-brand-orange hover:text-white"
              }`}
            >
               {isWishlistLoading ? (
                  <div className="animate-spin-slow">
                    <RefreshCw size={20} />
                  </div>
               ) : (
                 <Heart size={20} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "" : "group-hover:fill-current"} />
               )}
            </button>
         </div>
      </div>

      <QuickViewModal 
        product={product} 
        isOpen={quickViewOpen} 
        onClose={() => setQuickViewOpen(false)} 
      />

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-grow bg-white">
        <h4 className="font-semibold text-brand-dark text-[13px] mb-1 hover:text-brand-orange transition-colors leading-tight">
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
              className="flex-grow bg-gradient-to-r from-brand-orange to-brand-yellow text-white py-2 rounded-xl font-bold text-[10px] shadow-lg hover:shadow-brand-orange/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart size={12} />
              AJOUTER
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
    </div>
  );
}

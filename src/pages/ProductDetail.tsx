import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Heart, Share2, ArrowLeft, Truck, ShieldCheck, Undo2, Loader2, Minus, Plus, Trophy, Zap, CircleDot, Orbit, Headset, Gamepad2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../components/ui/Toast";
import { motion, AnimatePresence } from "motion/react";
import ProductCard from "../components/ProductCard";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, processingId } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isFavorite = isInWishlist(id || "");
  const isWishlistLoading = processingId === (id || "");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        // Fetch related
        fetch(`/api/products?category=${data.category}`)
          .then(res => res.json())
          .then(relatedData => {
            setRelated(relatedData.filter((p: any) => p.id !== id).slice(0, 4));
            setLoading(false);
          });
      })
      .catch(() => {
        setLoading(false);
        navigate("/boutique");
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream">
        <Loader2 className="animate-spin text-brand-orange" size={64} />
        <p className="mt-6 text-brand-dark font-black text-2xl font-display uppercase tracking-widest text-center">Un instant, on déballe le colis...</p>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    setUpdatingCart(true);
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      addToast(`${quantity} x ${product.name} ajouté au panier !`, "success");
      setUpdatingCart(false);
    }, 600);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case "baby-foot": return <Trophy size={120} />;
      case "ping-pong": return <Zap size={120} />;
      case "billard": return <CircleDot size={120} />;
      case "trampoline": return <Orbit size={120} />;
      case "consoles": return <Gamepad2 size={120} />;
      default: return <Headset size={120} />;
    }
  };

  const getProductImage = (category: string) => {
    switch (category) {
      case "baby-foot": return "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=1200";
      case "ping-pong": return "https://images.unsplash.com/photo-1629731629232-e5470d061511?auto=format&fit=crop&q=80&w=1200";
      case "billard": return "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1200";
      case "trampoline": return "https://images.unsplash.com/photo-1510332859919-056efec29676?auto=format&fit=crop&q=80&w=1200";
      case "consoles": return "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&q=80&w=1200";
      default: return "https://images.unsplash.com/photo-1546433194-6d517f77b73b?auto=format&fit=crop&q=80&w=1200";
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs & Back */}
        <div className="mb-12 flex items-center justify-between">
           <Link to="/boutique" className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-brand-orange transition-colors">
              <ArrowLeft size={16} /> Retour à la boutique
           </Link>
           <div className="hidden md:flex gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <Link to="/" className="hover:text-brand-orange">Accueil</Link> / 
              <Link to="/boutique" className="hover:text-brand-orange">Boutique</Link> / 
              <span className="text-brand-orange">{product.category}</span>
           </div>
        </div>

        <div className="bg-white rounded-[64px] shadow-2xl overflow-hidden border border-gray-100">
           <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Image Gallery area */}
              <div className={`relative p-8 md:p-16 flex items-center justify-center bg-gray-50`}>
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="relative w-full aspect-square rounded-[48px] overflow-hidden shadow-2xl border-4 border-white"
                 >
                    <img 
                      src={product.image || getProductImage(product.category)} 
                      alt={product.name} 
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    {/* Floating badges */}
                    <div className="absolute top-8 left-8 bg-brand-orange text-white px-6 py-2.5 rounded-2xl font-black text-xs shadow-2xl uppercase tracking-widest border border-white/20">
                       {product.category}
                    </div>
                    {product.badge && (
                      <div className="absolute bottom-8 right-8 bg-brand-yellow text-brand-dark px-6 py-2.5 rounded-2xl font-black text-xs shadow-2xl uppercase tracking-widest border border-white/20">
                         {product.badge}
                      </div>
                    )}
                 </motion.div>
              </div>

              {/* Product Info area */}
              <div className="p-12 md:p-24 flex flex-col justify-center">
                 <div className="flex items-center gap-1 mb-6 text-brand-yellow">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
                    ))}
                    <span className="text-xs font-black text-gray-400 ml-3 uppercase tracking-widest">12 avis experts</span>
                 </div>

                 <h1 className="text-5xl md:text-7xl font-black text-brand-dark mb-8 font-display leading-[0.9] uppercase tracking-tighter">
                    {product.name}
                 </h1>

                 <div className="flex flex-col gap-2 mb-10 p-8 bg-brand-cream/50 rounded-[40px] border border-brand-yellow/10">
                    <div className="flex items-baseline gap-4">
                       <span className="text-5xl md:text-6xl font-black text-brand-orange font-mono tracking-tighter">
                          {(product.priceHT * 1.2).toFixed(2)}€
                       </span>
                       <span className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">TTC</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-gray-400 font-bold line-through text-sm opacity-50">
                          {(product.priceHT * 1.25).toFixed(2)}€
                       </span>
                       <span className="bg-brand-green/10 text-brand-green text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Économisez 5%</span>
                    </div>
                 </div>

                 <div className="space-y-8 mb-12">
                    <p className="text-xl text-gray-600 leading-relaxed font-medium italic border-l-8 border-brand-orange pl-8 py-2">
                       {product.desc}
                    </p>
                    <div className="flex items-center gap-4 py-6 border-y border-gray-100">
                       <div className={`w-4 h-4 rounded-full animate-pulse ${product.stock > 0 ? 'bg-brand-green shadow-[0_0_15px_rgba(6,214,160,0.5)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`} />
                       <span className={`text-sm font-black uppercase tracking-widest ${product.stock > 0 ? 'text-brand-green' : 'text-red-500'}`}>
                          {product.stock > 0 ? `En stock — Prêt à expédier` : "Temporairement indisponible"}
                       </span>
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
                    <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-3xl overflow-hidden p-2">
                       <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-4 text-gray-400 hover:text-brand-orange hover:bg-white rounded-2xl transition-all">
                          <Minus size={20} />
                       </button>
                       <span className="w-16 text-center font-black text-2xl text-brand-dark">{quantity}</span>
                       <button onClick={() => setQuantity(q => q + 1)} className="p-4 text-gray-400 hover:text-brand-orange hover:bg-white rounded-2xl transition-all">
                          <Plus size={20} />
                       </button>
                    </div>
                    <button 
                      onClick={handleAddToCart}
                      disabled={updatingCart}
                      className="flex-grow w-full bg-brand-dark py-6 px-10 rounded-[24px] text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl hover:bg-brand-orange transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait"
                    >
                       {updatingCart ? <Loader2 className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
                       {updatingCart ? "Traitement..." : "Ajouter au panier"}
                    </button>
                 </div>

                 <div className="flex items-center gap-10 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] border-t pt-10">
                    <button 
                      onClick={() => toggleWishlist(id || "")}
                      disabled={isWishlistLoading}
                      className={`flex items-center gap-2 transition-all p-3 rounded-2xl disabled:opacity-50 disabled:cursor-wait ${
                        isFavorite ? "text-brand-orange bg-brand-orange/10" : "hover:text-brand-orange hover:bg-gray-50"
                      }`}
                    >
                       {isWishlistLoading ? (
                         <Loader2 size={18} className="animate-spin" />
                       ) : (
                         <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                       )}
                       {isFavorite ? "Dans mes favoris" : "Ajouter aux favoris"}
                    </button>
                    <button className="flex items-center gap-2 hover:text-brand-orange hover:bg-gray-50 p-3 rounded-2xl transition-all">
                       <Share2 size={18} /> Partager
                    </button>
                 </div>
              </div>
           </div>

           {/* Tabs section */}
           <div className="bg-gray-50 p-12 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="flex gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm h-fit"><Truck className="text-brand-orange" /></div>
                    <div>
                       <h4 className="font-bold text-brand-dark mb-1">Livraison Offerte</h4>
                       <p className="text-xs text-gray-500">Pour toute commande {'>'} 100€, expédiée sous 48h.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm h-fit"><ShieldCheck className="text-brand-green" /></div>
                    <div>
                       <h4 className="font-bold text-brand-dark mb-1">Garanti Appiotti</h4>
                       <p className="text-xs text-gray-500">Service après-vente basé en Charente (16220).</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="p-4 bg-white rounded-2xl shadow-sm h-fit"><Undo2 className="text-sky-400" /></div>
                    <div>
                       <h4 className="font-bold text-brand-dark mb-1">Moyen de Paiement</h4>
                       <p className="text-xs text-gray-500">Paiement 100% sécurisé par virement bancaire.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Related Products */}
        <div className="mt-24">
           <h2 className="text-3xl md:text-5xl font-black text-brand-dark mb-12 font-display">
              Vous aimerez aussi...
           </h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

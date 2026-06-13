import { useState, useEffect, useMemo, FormEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Heart, Share2, ArrowLeft, Truck, ShieldCheck, Undo2, Loader2, Minus, Plus, MessageSquare, User, Send } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { motion, AnimatePresence } from "motion/react";
import ProductCard from "../components/ProductCard";

import { products as allProducts } from "../data/products";
import { reviewService } from "../services/reviewService";
import { getStaticReviewsForProduct } from "../data/staticReviews";
import { getImageSrc } from "../lib/images";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, processingId } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isFavorite = isInWishlist(id || "");
  const isWishlistLoading = processingId === (id || "");

  const getImageUrl = getImageSrc;

  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const dynamicData = await reviewService.getAll(id);
      setReviews(dynamicData);
    } catch (err) {
      setReviews(getStaticReviewsForProduct(id));
    } finally {
      setReviewsLoading(false);
    }
  };

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r: any) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const foundProduct = allProducts.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        const relatedData = allProducts
          .filter(p => p.category === foundProduct.category && p.id !== id)
          .slice(0, 4);
        setRelated(relatedData);
        setLoading(false);
        fetchReviews();
      } else {
        setLoading(false);
        navigate("/boutique");
      }
    }, 400);
  }, [id, navigate]);

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) { addToast("Connectez-vous pour laisser un avis", "error"); return; }
    if (!newReview.comment.trim()) { addToast("Veuillez écrire un commentaire", "error"); return; }
    setSubmittingReview(true);
    try {
      await reviewService.create({ rating: newReview.rating, comment: newReview.comment, productId: id, userName: `${user.firstName} ${user.lastName}` });
      addToast("Merci pour votre avis !", "success");
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch (err) {
      addToast("Erreur lors de l'envoi de l'avis", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream">
        <Loader2 className="animate-spin text-brand-orange" size={40} />
        <p className="mt-4 text-brand-dark font-black text-sm font-display uppercase tracking-widest">Chargement...</p>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    setUpdatingCart(true);
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) addToCart(product);
      addToast(`${quantity} x ${product.name} ajouté au panier !`, "success");
      setUpdatingCart(false);
    }, 600);
  };

  const getProductImage = (category: string) => {
    switch (category) {
      case "baby-foot": return "/images/products/baby-foot-classique-2-joueurs.jpg";
      case "ping-pong": return "/images/hero-bg.jpg";
      case "billard": return "/images/products/table-de-billard-americain-7-pieds.jpg";
      case "trampoline": return "/images/products/trampoline-jardin-244cm-8-pieds.jpg";
      case "consoles": return "/images/products/playstation-5-pro.jpg";
      default: return "/images/hero-bg.jpg";
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen pt-3 pb-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="mb-3 flex items-center justify-between">
          <Link to="/boutique" className="flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-brand-orange transition-colors">
            <ArrowLeft size={12} /> Retour
          </Link>
          <div className="hidden md:flex gap-3 text-[8px] font-black text-gray-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-brand-orange">Accueil</Link> /
            <Link to="/boutique" className="hover:text-brand-orange">Boutique</Link> /
            <span className="text-brand-orange">{product.category}</span>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="relative p-4 md:p-8 flex items-center justify-center bg-gray-50">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full aspect-square rounded-[24px] overflow-hidden shadow-xl border-2 border-white max-h-[50vh]"
              >
                <img
                  src={getImageUrl(product.image || getProductImage(product.category))}
                  alt={product.name}
                  width={600}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-brand-orange text-white px-3 py-1 rounded-xl font-black text-[8px] shadow-lg uppercase tracking-widest border border-white/20">
                  {product.category}
                </div>
                {product?.badge && (
                  <div className="absolute bottom-3 right-3 bg-brand-yellow text-brand-dark px-3 py-1 rounded-xl font-black text-[8px] shadow-lg uppercase tracking-widest border border-white/20">
                    {product.badge}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Product Info */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-1 mb-2 text-brand-yellow">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < Math.floor(Number(averageRating)) ? "currentColor" : "none"} />
                ))}
                <button
                  onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-[8px] font-black text-gray-400 ml-2 uppercase tracking-widest hover:text-brand-orange transition-colors flex items-center gap-1"
                >
                  {reviews.length} avis <MessageSquare size={10} />
                </button>
              </div>

              <h1 className="text-xl md:text-2xl font-black text-brand-dark mb-3 font-display leading-tight uppercase tracking-tight">
                {product.name}
              </h1>

              <div className="flex flex-col gap-1 mb-4 p-4 bg-brand-cream/50 rounded-2xl border border-brand-yellow/10">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl md:text-3xl font-black text-brand-orange font-mono tracking-tighter">
                    {(product.priceHT * 1.2).toFixed(2)}€
                  </span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">TTC</span>
                </div>
                {product.badge === "Promo" && (
                  <div className="flex items-center gap-2">
                    <span className="bg-brand-green/10 text-brand-green text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">En promotion</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-medium italic border-l-4 border-brand-orange pl-3 mb-3 line-clamp-3">
                {product.desc}
              </p>

              <div className="flex items-center gap-2 mb-4 py-2 border-y border-gray-100">
                <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${product.stock > 0 ? 'bg-brand-green shadow-[0_0_8px_rgba(6,214,160,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'text-brand-green' : 'text-red-500'}`}>
                  {product.stock > 0 ? "En stock — Prêt à expédier" : "Indisponible"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden p-1 shrink-0">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-white rounded-lg transition-all">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-black text-sm text-brand-dark">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-white rounded-lg transition-all">
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={updatingCart}
                  className="flex-grow bg-brand-dark py-3 px-6 rounded-xl text-white font-black text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-xl hover:bg-brand-orange transition-all active:scale-95 disabled:opacity-70"
                >
                  {updatingCart ? <Loader2 className="animate-spin" size={14} /> : <ShoppingCart size={14} />}
                  {updatingCart ? "..." : "Ajouter au panier"}
                </button>
                <button
                  onClick={() => toggleWishlist(id || "")}
                  disabled={isWishlistLoading}
                  className={`p-3 rounded-xl border transition-all shrink-0 shadow-md active:scale-95 disabled:opacity-50 ${
                    isFavorite ? "bg-brand-orange/10 border-brand-orange text-brand-orange" : "bg-white border-gray-100 text-gray-400 hover:text-brand-orange hover:border-brand-orange"
                  }`}
                >
                  {isWishlistLoading ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />}
                </button>
              </div>

              <div className="flex items-center gap-6 text-gray-400 text-[8px] font-black uppercase tracking-[0.2em]">
                <button className="flex items-center gap-1 hover:text-brand-orange transition-colors py-1"><Share2 size={12} /> Partager</button>
              </div>
            </div>
          </div>

          {/* Tabs - compact */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-brand-orange shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-dark text-[10px]">Livraison Offerte</h4>
                  <p className="text-[8px] text-gray-500">&gt; 100€, sous 48h</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-green shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-dark text-[10px]">Garanti Appiotti</h4>
                  <p className="text-[8px] text-gray-500">SAV en Charente</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Undo2 size={16} className="text-sky-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-brand-dark text-[10px]">Paiement Sécurisé</h4>
                  <p className="text-[8px] text-gray-500">Virement bancaire</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specs Section */}
        {product?.specs && Object.keys(product.specs).length > 0 && (
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden mt-6">
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-black text-brand-dark font-display uppercase tracking-tighter mb-5">
                Caractéristiques <span className="text-brand-orange">Techniques</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {Object.entries(product.specs).map(([key, val], idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider shrink-0 mr-4">{key}</span>
                    <span className="text-[12px] font-bold text-brand-dark text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div id="reviews" className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden mt-6 mb-12">
          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-brand-dark font-display uppercase tracking-tighter mb-1">Avis <span className="text-brand-orange">Clients</span></h2>
                <p className="text-gray-400 font-bold uppercase text-[8px] tracking-[0.3em]">Retours de la communauté</p>
              </div>
              <div className="flex items-center gap-4 bg-brand-cream/50 p-3 rounded-2xl border border-brand-yellow/10">
                <div className="text-center">
                  <p className="text-2xl font-black text-brand-dark leading-none">{averageRating}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase mt-0.5">Sur 5</p>
                </div>
                <div className="h-8 w-[1px] bg-brand-yellow/20" />
                <div>
                  <div className="flex gap-0.5 text-brand-yellow mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < Math.floor(Number(averageRating)) ? "currentColor" : "none"} />)}
                  </div>
                  <p className="text-[8px] font-black text-brand-orange uppercase">{reviews.length} Avis</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Review List */}
              <div className="lg:col-span-7 space-y-3">
                {reviewsLoading ? (
                  <div className="flex justify-center py-6"><Loader2 className="animate-spin text-brand-orange" size={28} /></div>
                ) : reviews.length === 0 ? (
                  <div className="bg-gray-50 p-6 rounded-2xl text-center border-2 border-dashed border-gray-200">
                    <MessageSquare size={28} className="mx-auto text-gray-200 mb-3" />
                    <h3 className="text-sm font-black text-brand-dark mb-1">Soyez le premier !</h3>
                    <p className="text-gray-400 font-medium text-xs">Partagez votre expérience.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {sortedReviews.map((review, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        viewport={{ once: true }}
                        key={review.id}
                        className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex gap-3"
                      >
                        <div className="shrink-0 hidden sm:block">
                          <div className="w-8 h-8 bg-brand-orange/5 rounded-xl flex items-center justify-center text-brand-orange border border-brand-orange/10">
                            <User size={14} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-black text-brand-dark uppercase tracking-tight text-[11px] truncate">{review.userName}</p>
                            <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest shrink-0 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-0.5 text-brand-yellow mb-1">
                            {[...Array(5)].map((_, i) => <Star key={i} size={9} fill={i < review.rating ? "currentColor" : "none"} />)}
                          </div>
                          <p className="text-gray-500 font-medium text-[11px] leading-snug italic line-clamp-2">"{review.comment}"</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="lg:col-span-5">
                <div className="bg-brand-dark text-white p-5 rounded-2xl shadow-xl">
                  <h3 className="text-sm font-black mb-3 font-display uppercase tracking-tight">Laisser un <span className="text-brand-orange">Avis</span></h3>
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div>
                        <label className="text-[8px] font-black text-brand-orange uppercase tracking-[0.2em] block mb-1">Votre Note</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: val })}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${newReview.rating >= val ? "bg-brand-orange text-white scale-110" : "bg-white/5 hover:bg-white/10 text-gray-400"}`}
                            >
                              <Star size={14} fill={newReview.rating >= val ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-brand-orange uppercase tracking-[0.2em] block mb-1">Commentaire</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Votre avis..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 min-h-[80px] text-xs outline-none focus:border-brand-orange transition-all font-medium placeholder:text-white/20"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full bg-brand-orange py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {submittingReview ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
                        Publier
                      </button>
                    </form>
                  ) : (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                      <p className="text-[10px] font-medium text-white/50 mb-3">Connectez-vous pour laisser un avis.</p>
                      <Link to="/connexion" className="inline-block bg-brand-orange text-white w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Se connecter</Link>
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <ShieldCheck className="text-brand-green shrink-0" size={12} />
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Avis modérés par notre équipe.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-8">
          <h2 className="text-lg md:text-xl font-black text-brand-dark mb-4 font-display">
            Vous aimerez aussi...
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

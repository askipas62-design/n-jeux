import React, { useEffect, useState, useMemo } from "react";

import { 
  User, Package, Clock, MapPin, Mail, ArrowRight, ChevronRight, 
  CheckCircle2, AlertCircle, Info, RefreshCw, LogOut, Settings, 
  CreditCard, ShieldCheck, Phone, ExternalLink, Copy, Check,
  ChevronDown, ChevronUp, ShoppingBag, Truck, Gift, Heart, Loader2,
  Star, MessageSquare, Send
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../components/ui/Toast";
import ProductCard from "../components/ProductCard";
import { getImageSrc } from "../lib/images";

import { orderService } from "../services/orderService";
import { reviewService } from "../services/reviewService";
import { productService } from "../services/productService";

interface Order {
  id: string;
  items: any[];
  totalTTC: number;
  status: string;
  createdAt: string;
  proofUrl?: string;
  proofUploaded: boolean;
}

export default function ClientDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "favorites" | "profile" | "review" | "security">("orders");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({ 
    firstName: user?.firstName || "", 
    lastName: user?.lastName || "" 
  });

  // Review state
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "", productId: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Ensure image path is correct
  const getImageUrl = getImageSrc;

  const favoriteProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [wishlist, products]);

  const allPurchasedProducts = useMemo(() => {
    const products: any[] = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!products.find(p => p.id === item.id)) {
          products.push(item);
        }
      });
    });
    return products;
  }, [orders]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [ordersData, productsData] = await Promise.all([
        orderService.getMyOrders(),
        productService.getAll(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile(profileData.firstName, profileData.lastName);
      addToast("Profil mis à jour !", "success");
      setEditing(false);
    } catch (err) {
      addToast("Erreur lors de la mise à jour", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      addToast("Veuillez laisser un petit message !", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      await reviewService.create({
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        productId: reviewForm.productId || undefined,
        userName: `${user?.firstName} ${user?.lastName}`
      });
      addToast("Merci pour votre avis ! Il est publié.", "success");
      setReviewForm({ rating: 5, comment: "", productId: "" });
      setActiveTab("orders");
    } catch (err) {
      addToast("Erreur lors de l'envoi de l'avis", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast("N° de commande copié !", "success");
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "En attente de virement": return "bg-brand-yellow text-brand-dark border-brand-yellow/20";
      case "En cours de validation": return "bg-sky-500 text-white border-sky-600/20";
      case "Validée": return "bg-brand-green text-white border-brand-green/20";
      case "Expédiée": return "bg-indigo-500 text-white border-indigo-600/20";
      case "Livrée": return "bg-brand-dark text-brand-yellow border-brand-dark/20";
      case "Annulée":
      case "Refusée": return "bg-red-500 text-white border-red-600/20";
      default: return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ["En attente de virement", "En cours de validation", "Validée", "Expédiée", "Livrée"];
    if (status === "Refusée" || status === "Annulée") return -1;
    return steps.indexOf(status);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 text-center bg-[#FFF8F0] min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white p-16 rounded-[60px] shadow-2xl border-4 border-brand-orange/10 max-w-lg"
        >
          <div className="w-24 h-24 bg-brand-orange/10 rounded-3xl flex items-center justify-center text-brand-orange mx-auto mb-8">
            <User size={48} />
          </div>
          <h2 className="text-4xl font-black font-display uppercase tracking-tighter mb-4 text-brand-dark">Espace Client</h2>
          <p className="text-gray-400 mb-10 font-medium">Connectez-vous pour suivre vos commandes et gérer vos informations personnelles.</p>
          <Link to="/connexion" className="inline-flex items-center gap-3 bg-brand-orange text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-brand-orange/20">Se connecter <ArrowRight size={18} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F0] min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-brand-dark text-white p-8 md:p-12 rounded-[56px] shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-green rounded-full blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center text-brand-orange border border-white/10 shadow-inner">
                <User size={36} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-orange mb-2 block">Bienvenue chez vous</span>
                <h1 className="text-3xl md:text-6xl font-black font-display uppercase tracking-tighter leading-none">
                  Hello, <span className="text-brand-orange">{user.firstName}</span>
                </h1>
                <p className="text-gray-400 text-xs font-bold mt-2 flex items-center gap-2">
                  <Mail size={14} /> {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-4">
              <button 
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "orders" 
                    ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/20" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                <Package size={16} /> Commandes
              </button>
              <button 
                onClick={() => setActiveTab("review")}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "review" 
                    ? "bg-brand-green text-brand-dark shadow-xl" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                <Star size={16} /> Laisser un avis
              </button>
              <button 
                onClick={() => { logout(); navigate("/"); }} 
                className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          </div>
        </div>

        <div className="flex bg-white p-2 rounded-3xl shadow-xl border border-gray-100 mb-12 max-w-xl mx-auto sticky top-24 z-30 overflow-x-auto">
          {[
            { id: "orders", label: "Commandes", icon: <Package size={18} /> },
            { id: "favorites", label: "Favoris", icon: <Heart size={18} /> },
            { id: "review", label: "Mon Avis", icon: <Star size={18} /> },
            { id: "profile", label: "Profil", icon: <Settings size={18} /> },
            { id: "security", label: "Aide", icon: <ShieldCheck size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-brand-dark text-white shadow-lg" 
                  : "text-gray-400 hover:text-brand-dark"
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "orders" && (
            <div 
              key="orders"
              className="space-y-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black font-display uppercase tracking-tight text-brand-dark flex items-center gap-3">
                    <Clock className="text-brand-orange" size={28} /> Suivi de commande
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Historique complet de vos achats</p>
                </div>
                <button onClick={fetchData} className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-all shadow-lg active:scale-95">
                  <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {loading && orders.length === 0 ? (
                <div               className="bg-white p-12 md:p-24 rounded-[32px] md:rounded-[64px] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-brand-orange border-t-transparent rounded-full mb-6 md:mb-8 animate-spin-slow" />
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Synchronisation des données...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 md:p-24 rounded-[32px] md:rounded-[64px] shadow-2xl border border-gray-100 text-center">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-50 rounded-[32px] md:rounded-[48px] flex items-center justify-center text-gray-200 mx-auto mb-6 md:mb-10">
                    <ShoppingBag size={40} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-brand-dark mb-4 md:mb-6 font-display uppercase tracking-tight">Le terrain est vide !</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6 md:mb-10 font-medium text-sm md:text-base">Vous n'avez pas encore passé de commande.</p>
                  <Link to="/boutique" className="inline-flex items-center gap-4 bg-brand-orange text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-brand-orange/20">Explorer la boutique <ArrowRight size={18} /></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className={`bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-hidden transition-all duration-500 ${
                        expandedOrder === order.id ? "ring-4 ring-brand-orange/10" : "hover:shadow-2xl"
                      }`}
                    >
                      <div className="p-8 md:p-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-brand-dark relative group">
                               <Package size={40} className="opacity-20" />
                               <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-orange text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg">
                                 {order.items.length}
                               </div>
                            </div>
                            <div>
                               <div className="flex items-center gap-3 mb-2">
                                 <h3 className="text-2xl font-black text-brand-dark font-display uppercase tracking-tight">#{order.id.split('-')[1]}</h3>
                                 <button onClick={() => handleCopyId(order.id)} className="p-2 bg-gray-50 rounded-xl hover:bg-brand-orange/10 hover:text-brand-orange transition-all text-gray-400 font-mono text-[10px]">COPIER</button>
                               </div>
                               <div className="flex flex-wrap gap-2">
                                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${getStatusStyle(order.status)}`}>
                                   {order.status}
                                 </span>
                                 <span className="bg-gray-50 text-gray-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100 font-mono">
                                   {new Date(order.createdAt).toLocaleDateString()}
                                 </span>
                               </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start lg:items-end w-full lg:w-auto">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total TTC</p>
                            <p className="text-4xl font-black text-brand-orange font-mono tracking-tighter leading-none mb-4">{(order.totalTTC || 0).toFixed(2)}€</p>
                            <button 
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all px-6 py-3 rounded-2xl border-2 ${
                                expandedOrder === order.id 
                                  ? "bg-brand-dark text-white border-brand-dark" 
                                  : "bg-white text-brand-orange border-brand-orange/20 hover:border-brand-orange shadow-lg"
                              }`}
                            >
                               {expandedOrder === order.id ? "Masquer" : "Détails"} 
                               {expandedOrder === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {expandedOrder === order.id && (
                            <div className="overflow-hidden"
                            >
                               <div className="mt-12 pt-12 border-t-2 border-dashed border-gray-100">
                                 <h4 className="text-lg font-black text-brand-dark font-display uppercase tracking-tight mb-8">Articles commandés</h4>
                                 <div className="space-y-6">
                                   {order.items.map((item, idy) => {
                                      const productInfo = products.find(p => p.id === item.id);
                                     const itemImage = item.image || productInfo?.image;

                                     return (
                                       <div key={idy} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 gap-4">
                                         <div className="flex items-center gap-6">
                                           <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-50">
                                             {itemImage ? (
                                               <img src={getImageUrl(itemImage) || ""} alt={item.name} className="w-full h-full object-cover" />
                                             ) : (
                                               <Package size={24} className="text-gray-200" />
                                             )}
                                           </div>
                                           <div>
                                              <p className="font-black text-brand-dark uppercase tracking-tight text-xl">{item.name}</p>
                                              {item.selectedOption && <p className="text-[9px] font-black text-brand-orange uppercase">Taille : {item.selectedOption}</p>}
                                              <p className="text-[10px] font-bold text-gray-400 uppercase">Quantité: {item.quantity || 1} | {((item.priceHT || 0)).toFixed(2)}€ HT</p>
                                           </div>
                                         </div>
                                         <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
                                           <p className="text-2xl font-black text-brand-dark font-mono">{((item.priceHT || 0) * (item.quantity || 1) * 1.2).toFixed(2)}€</p>
                                           <button 
                                             onClick={() => {
                                               setReviewForm({ ...reviewForm, productId: item.id });
                                               setActiveTab("review");
                                             }}
                                             className="text-[9px] font-black uppercase tracking-widest text-brand-orange hover:text-brand-dark transition-colors flex items-center gap-1"
                                           >
                                             <Star size={12} fill="currentColor" /> Laisser un avis
                                           </button>
                                         </div>
                                       </div>
                                     );
                                   })}
                                 </div>
                               </div>

                               {order.status === "En attente de virement" && (
                                 <div className="mt-8 p-10 bg-brand-orange/5 border-2 border-dashed border-brand-orange/30 rounded-[40px] flex flex-col md:flex-row items-center gap-8 justify-between">
                                   <div>
                                      <h4 className="text-xl font-black text-brand-dark font-display uppercase tracking-tight mb-1">Virement manquant</h4>
                                      <p className="text-xs font-medium text-gray-500">Scannez ou envoyez votre preuve pour accélérer l'expédition.</p>
                                   </div>
                                   <Link to="/paiement" className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl">Infos bancaires</Link>
                                 </div>
                               )}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "review" && (
            <div 
              key="review"
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[64px] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-[100px]" />
                
                <h2 className="text-2xl md:text-4xl font-black font-display uppercase tracking-tighter text-brand-dark mb-3 md:mb-4">Votre <span className="text-brand-orange">Avis</span></h2>
                <p className="text-gray-400 font-medium mb-8 md:mb-12 text-sm md:text-base">Partagez votre expérience avec la communauté Appiotti.</p>

                <form onSubmit={handleSubmitReview} className="space-y-10 relative z-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block text-left pl-6">Produit concerné</label>
                      <div className="relative">
                        <select 
                          value={reviewForm.productId}
                          onChange={(e) => setReviewForm({ ...reviewForm, productId: e.target.value })}
                          className="w-full bg-gray-50 border-4 border-gray-100 p-8 rounded-[40px] font-black uppercase text-xs tracking-widest outline-none focus:border-brand-orange transition-all shadow-inner appearance-none relative z-10"
                        >
                          <option value="">Avis général sur Appiotti</option>
                          {allPurchasedProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-brand-orange pointer-events-none z-20" size={24} />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Note Globale</p>
                      <div className="flex justify-center gap-3">
                         {[1, 2, 3, 4, 5].map((val) => (
                           <button 
                             key={val} 
                             type="button" 
                             onClick={() => setReviewForm({ ...reviewForm, rating: val })}
                             className={`p-3 rounded-2xl transition-all ${reviewForm.rating >= val ? "text-brand-yellow scale-110" : "text-gray-200"}`}
                           >
                             <Star size={40} className={reviewForm.rating >= val ? "fill-current" : ""} />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block text-left pl-6">Votre commentaire</label>
                      <textarea 
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="Qu'avez-vous pensé de votre achat ?"
                        className="w-full bg-gray-50 border-4 border-gray-100 p-8 rounded-[40px] font-bold min-h-[200px] outline-none focus:border-brand-orange transition-all placeholder:text-gray-300 shadow-inner"
                      />
                   </div>

                   <button 
                     type="submit" 
                     disabled={submittingReview}
                     className="w-full bg-brand-dark text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-dark/20 hover:bg-brand-orange hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                   >
                     {submittingReview ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                     Publier l'avis
                   </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div 
              key="favorites"
              className="space-y-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black font-display uppercase tracking-tight text-brand-dark flex items-center gap-3">
                    <Heart className="text-brand-orange" size={28} /> Ma Liste d'Envies
                  </h2>
                </div>
              </div>

              {wishlistLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-orange" size={48} /></div>
              ) : favoriteProducts.length === 0 ? (
                <div className="bg-white p-24 rounded-[64px] shadow-2xl border border-gray-100 text-center">
                  <h3 className="text-3xl font-black text-brand-dark mb-6">Vide !</h3>
                  <Link to="/boutique" className="inline-flex items-center gap-4 bg-brand-orange text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-orange/20">Explorer</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favoriteProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "profile" && (
            <div 
              key="profile"
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[64px] shadow-2xl border border-gray-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 md:mb-12">
                  <h2 className="text-2xl md:text-4xl font-black font-display uppercase tracking-tighter text-brand-dark">Mon <span className="text-brand-orange">Profil</span></h2>
                  {!editing && (
                    <button onClick={() => setEditing(true)} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-brand-orange transition-all"><Settings size={24} /></button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Prénom</label>
                        <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-3xl font-bold focus:outline-none focus:border-brand-orange transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Nom</label>
                        <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })} className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-3xl font-bold focus:outline-none focus:border-brand-orange transition-all" />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-6">
                      <button type="button" onClick={() => setEditing(false)} className="flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest border-2 border-gray-100 text-gray-400">Annuler</button>
                      <button type="submit" disabled={updatingProfile} className="flex-1 bg-brand-orange text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"> {updatingProfile && <Loader2 className="animate-spin" size={16} />} Enregistrer</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row gap-12">
                      <div className="w-40 h-40 bg-brand-orange/5 rounded-[48px] flex items-center justify-center text-brand-orange border border-brand-orange/10 relative group shrink-0">
                        <User size={80} className="opacity-20" />
                        <div className="absolute inset-0 border-2 border-dashed border-brand-orange/20 rounded-[48px] animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Utilisateur</p>
                             <p className="text-xl font-black text-brand-dark">{user.firstName} {user.lastName}</p>
                           </div>
                           <div className="bg-brand-dark text-white p-8 rounded-[40px] shadow-xl">
                             <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em] mb-2">Identité</p>
                             <p className="text-lg font-bold truncate">{user.email}</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div 
              key="security"
              className="space-y-12"
            >
              <div className="bg-brand-dark text-white p-6 md:p-12 rounded-[32px] md:rounded-[80px] shadow-2xl relative overflow-hidden">
                <div className="relative z-10 max-w-4xl">
                   <h2 className="text-3xl md:text-7xl font-black font-display uppercase tracking-tighter leading-none mb-6 md:mb-10">Besoin d'<span className="text-brand-orange">Aide ?</span></h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {[
                        { icon: <Phone className="text-brand-orange" />, title: "Hervé en direct", value: "+33 6 12 34 56 78", desc: "Un interlocuteur unique pour tout votre projet." },
                        { icon: <Mail className="text-brand-green" />, title: "Support Mail", value: "contact@appiotti.com", desc: "Réponse sous 4 heures maximum." }
                      ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[40px] group hover:bg-white/10 transition-all">
                           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6">{item.icon}</div>
                           <h3 className="text-xs font-black uppercase text-brand-orange mb-2">{item.title}</h3>
                           <p className="text-2xl font-black mb-4 tracking-tight font-mono">{item.value}</p>
                           <p className="text-gray-400 text-sm font-medium">{item.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          )}
        
      </div>
    </div>
  );
}

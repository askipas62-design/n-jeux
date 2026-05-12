import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Package, Clock, MapPin, Mail, ArrowRight, ChevronRight, 
  CheckCircle2, AlertCircle, Info, RefreshCw, LogOut, Settings, 
  CreditCard, ShieldCheck, Phone, ExternalLink, Copy, Check,
  ChevronDown, ChevronUp, ShoppingBag, Truck, Gift, Heart, Loader2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../components/ui/Toast";
import ProductCard from "../components/ProductCard";

interface Order {
  id: string;
  items: any[];
  totalTTC: number;
  status: string;
  createdAt: string;
  proofUploaded: boolean;
}

export default function ClientDashboard() {
  const { user, token, logout, login } = useAuth();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "favorites" | "profile" | "security">("orders");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  
  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({ 
    firstName: user?.firstName || "", 
    lastName: user?.lastName || "" 
  });

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.reverse()); // Newest first
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchProducts();
    }
    // Poll for status updates every 15 seconds for "real-time" feel
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const favoriteProducts = allProducts.filter(p => wishlist.includes(p.id));

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        addToast("Profil mis à jour !", "success");
        setEditing(false);
        // Refresh page to sync context (simpler for this demo)
        window.location.reload();
      }
    } catch (err) {
      addToast("Erreur lors de la mise à jour", "error");
    } finally {
      setUpdatingProfile(false);
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-16 rounded-[60px] shadow-2xl border-4 border-brand-orange/10 max-w-lg"
        >
          <div className="w-24 h-24 bg-brand-orange/10 rounded-3xl flex items-center justify-center text-brand-orange mx-auto mb-8">
            <User size={48} />
          </div>
          <h2 className="text-4xl font-black font-display uppercase tracking-tighter mb-4 text-brand-dark">Espace Client</h2>
          <p className="text-gray-400 mb-10 font-medium">Connectez-vous pour suivre vos commandes et gérer vos informations personnelles.</p>
          <Link to="/connexion" className="inline-flex items-center gap-3 bg-brand-orange text-white px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-brand-orange/20">Se connecter <ArrowRight size={18} /></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F0] min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* New Header Design */}
        <div className="bg-brand-dark text-white p-8 md:p-12 rounded-[56px] shadow-2xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-green rounded-full blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center text-brand-orange border border-white/10 shadow-inner">
                <User size={36} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-orange mb-2 block">Tableau de Bord</span>
                <h1 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tighter leading-none">
                  Hello, <span className="text-brand-orange">{user.firstName}</span>
                </h1>
                <p className="text-gray-400 text-xs font-bold mt-2 flex items-center gap-2">
                  <Mail size={14} /> {user.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === "orders" 
                    ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/20" 
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                <Package size={16} /> Mes Commandes
              </button>
              <button 
                onClick={() => { logout(); navigate("/"); }} 
                className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <LogOut size={16} /> Déconnexion
              </button>
              <Link to="/boutique" className="flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-orange/20">
                <ShoppingBag size={16} /> Continuer Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white p-2 rounded-3xl shadow-xl border border-gray-100 mb-12 max-w-lg mx-auto sticky top-24 z-30">
          {[
            { id: "orders", label: "Commandes", icon: <Package size={18} /> },
            { id: "favorites", label: "Favoris", icon: <Heart size={18} /> },
            { id: "profile", label: "Profil", icon: <Settings size={18} /> },
            { id: "security", label: "Aide", icon: <ShieldCheck size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-brand-dark text-white shadow-lg" 
                  : "text-gray-400 hover:text-brand-dark"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "orders" && (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Filters & Refresh */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black font-display uppercase tracking-tight text-brand-dark flex items-center gap-3">
                    <Clock className="text-brand-orange" size={28} /> Suivi Temps Réel
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Mise à jour automatique toutes les 30s</p>
                </div>
                <button onClick={fetchOrders} className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-brand-orange hover:border-brand-orange transition-all shadow-lg active:scale-95">
                  <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {loading && orders.length === 0 ? (
                <div className="bg-white p-24 rounded-[64px] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full mb-8 shadow-2xl shadow-brand-orange/20" />
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Synchronisation avec les serveurs Appiotti...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-24 rounded-[64px] shadow-2xl border border-gray-100 text-center">
                  <div className="w-32 h-32 bg-gray-50 rounded-[48px] flex items-center justify-center text-gray-200 mx-auto mb-10 shadow-inner">
                    <ShoppingBag size={64} />
                  </div>
                  <h3 className="text-3xl font-black text-brand-dark mb-6 font-display uppercase tracking-tight">Le terrain est vide !</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-10 font-medium text-lg leading-relaxed">
                    Vous n'avez pas encore passé de commande. C'est le moment d'équiper votre été avec nos baby-foot et billards authentiques.
                  </p>
                  <Link to="/boutique" className="inline-flex items-center gap-4 bg-brand-orange text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-brand-orange/20">Explorer la boutique <ArrowRight size={18} /></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {orders.map((order) => (
                    <motion.div 
                      key={order.id}
                      layout
                      className={`bg-white rounded-[48px] border border-gray-100 shadow-xl overflow-hidden transition-all duration-500 ${
                        expandedOrder === order.id ? "ring-4 ring-brand-orange/10" : "hover:shadow-2xl"
                      }`}
                    >
                      {/* Main Order Card */}
                      <div className="p-8 md:p-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-brand-dark relative group">
                               <Package size={40} className="opacity-20 group-hover:opacity-40 transition-opacity" />
                               <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-orange text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg">
                                 {order.items.length}
                               </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-brand-dark font-display uppercase tracking-tight">#{order.id.split('-')[1]}</h3>
                                <button 
                                  onClick={() => handleCopyId(order.id)}
                                  className="p-2 bg-gray-50 rounded-xl hover:bg-brand-orange/10 hover:text-brand-orange transition-all text-gray-400"
                                  title="Copier l'ID de commande"
                                >
                                  {copiedId === order.id ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 shadow-sm ${getStatusStyle(order.status)}`}>
                                  {order.status}
                                </span>
                                <span className="bg-gray-50 text-gray-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100">
                                  {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start lg:items-end w-full lg:w-auto">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Montant Total TTC</p>
                            <p className="text-4xl font-black text-brand-orange font-mono tracking-tighter leading-none mb-4">{order.totalTTC.toFixed(2)}€</p>
                            <button 
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all px-6 py-3 rounded-2xl border-2 ${
                                expandedOrder === order.id 
                                  ? "bg-brand-dark text-white border-brand-dark" 
                                  : "bg-white text-brand-orange border-brand-orange/20 hover:border-brand-orange shadow-lg"
                              }`}
                            >
                              {expandedOrder === order.id ? "Réduire l'aperçu" : "Détails commande"} 
                              {expandedOrder === order.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Visual Timeline */}
                        <div className="mt-12">
                          <div className="relative h-2 bg-gray-50 rounded-full overflow-hidden mb-6">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${((getStatusStep(order.status) + 1) / 5) * 100}%` 
                              }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full ${
                                order.status === 'Expédiée' || order.status === 'Livrée' ? 'bg-brand-green' : 'bg-brand-orange'
                              }`} 
                            />
                          </div>
                          <div className="grid grid-cols-5 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-400">
                            <div className={`text-left ${getStatusStep(order.status) >= 0 ? "text-brand-orange" : ""}`}>Virement</div>
                            <div className={`text-center ${getStatusStep(order.status) >= 1 ? "text-brand-orange" : ""}`}>Validation</div>
                            <div className={`text-center ${getStatusStep(order.status) >= 2 ? "text-brand-orange" : ""}`}>Préparation</div>
                            <div className={`text-center ${getStatusStep(order.status) >= 3 ? "text-brand-orange" : ""}`}>Expédition</div>
                            <div className={`text-right ${getStatusStep(order.status) >= 4 ? "text-brand-green" : ""}`}>Livraison</div>
                          </div>
                        </div>

                        {/* Detailed Content (Expandable) */}
                        <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-12 pt-12 border-t-2 border-dashed border-gray-100">
                                <h4 className="text-lg font-black text-brand-dark font-display uppercase tracking-tight mb-8 flex items-center gap-2">
                                  <ShoppingBag size={20} className="text-brand-orange" /> Articles commandés
                                </h4>
                                <div className="space-y-6">
                                  {order.items.map((item, idy) => (
                                    <div key={idy} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 group hover:shadow-2xl hover:border-brand-orange/20 transition-all duration-500 overflow-hidden relative">
                                      <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-orange border-2 border-white shadow-xl overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                          {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="bg-brand-orange/10 w-full h-full flex items-center justify-center">
                                              <Package size={32} />
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-black text-brand-dark uppercase tracking-tight text-xl mb-1 group-hover:text-brand-orange transition-colors">{item.name}</p>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
                                            Quantité: <span className="text-brand-dark text-xs">{item.quantity}</span> 
                                            <span className="mx-3 opacity-20">|</span> 
                                            Prix: <span className="text-brand-dark text-xs">{item.priceHT.toFixed(2)}€</span>
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right relative z-10">
                                        <p className="text-2xl font-black text-brand-dark font-mono tracking-tighter">{(item.priceHT * item.quantity).toFixed(2)}€</p>
                                        <div className="w-8 h-1 bg-brand-orange ml-auto mt-2 opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-500" />
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="bg-brand-dark text-white p-8 rounded-[40px] shadow-xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow rounded-full blur-[60px] opacity-10" />
                                     <div className="relative z-10">
                                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-yellow mb-4">Informations Livraison</h5>
                                        <div className="flex gap-4 items-start mb-6">
                                           <MapPin className="text-brand-yellow shrink-0" size={20} />
                                           <div className="text-xs font-medium text-gray-300 leading-relaxed">
                                              Domicile Principal<br />
                                              Adresse en attente de confirmation finale lors de l'expédition par Hervé.
                                           </div>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                           <Truck className="text-brand-green" size={20} />
                                           <span className="text-[10px] font-black uppercase tracking-widest text-brand-green">Mode d'envoi Premium Sécurisé</span>
                                        </div>
                                     </div>
                                  </div>
                                  
                                  <div className="bg-[#FFF8F0] p-8 rounded-[40px] border-2 border-brand-orange/10 flex flex-col justify-between">
                                     <div className="flex justify-between items-start mb-6">
                                        <div>
                                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Commande</h5>
                                          <p className="text-2xl font-black text-brand-dark">{(order.totalTTC / 1.2).toFixed(2)}€ <span className="text-xs font-bold text-gray-400">HT</span></p>
                                        </div>
                                        <div className="text-right">
                                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">TVA (20%)</h5>
                                          <p className="text-xl font-bold text-brand-dark">{(order.totalTTC - (order.totalTTC / 1.2)).toFixed(2)}€</p>
                                        </div>
                                     </div>
                                     <div className="pt-6 border-t border-brand-orange/10 flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-widest text-[#1B1B2F]">À Régler TTC</span>
                                        <span className="text-3xl font-black text-brand-orange font-mono">{order.totalTTC.toFixed(2)}€</span>
                                     </div>
                                  </div>
                                </div>

                                {order.status === "En attente de virement" && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-8 p-10 bg-brand-orange/5 border-2 border-dashed border-brand-orange/30 rounded-[40px] flex flex-col md:flex-row items-center gap-8 justify-between"
                                  >
                                    <div className="flex items-center gap-6">
                                       <div className="w-16 h-16 bg-brand-orange text-white rounded-3xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
                                         <CreditCard size={32} />
                                       </div>
                                       <div>
                                          <h4 className="text-xl font-black text-brand-dark font-display uppercase tracking-tight mb-1 italic">Action Requise</h4>
                                          <p className="text-xs font-medium text-gray-500 leading-relaxed">
                                            Votre virement n'a pas encore été reçu pour cette commande. <br />
                                            Utilisez le numéro <span className="font-black text-brand-orange">#{order.id.split('-')[1]}</span> comme motif.
                                          </p>
                                       </div>
                                    </div>
                                    <Link 
                                      to="/paiement" 
                                      className="bg-brand-dark text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl whitespace-nowrap"
                                    >
                                      Voir les infos bancaires
                                    </Link>
                                  </motion.div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Floating Indicator */}
                      <div className="absolute top-0 right-10 w-24 h-2 bg-gradient-to-r from-brand-orange to-brand-yellow rounded-b-full opacity-30" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "favorites" && (
            <motion.div 
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black font-display uppercase tracking-tight text-brand-dark flex items-center gap-3">
                    <Heart className="text-brand-orange" size={28} /> Ma Liste d'Envies
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Vos pépites préférées sauvegardées ici</p>
                </div>
              </div>

              {wishlistLoading ? (
                <div className="bg-white p-24 rounded-[64px] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full mb-8 shadow-2xl shadow-brand-orange/20" />
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Chargement de vos favoris...</p>
                </div>
              ) : favoriteProducts.length === 0 ? (
                <div className="bg-white p-24 rounded-[64px] shadow-2xl border border-gray-100 text-center">
                  <div className="w-32 h-32 bg-gray-50 rounded-[48px] flex items-center justify-center text-gray-200 mx-auto mb-10 shadow-inner">
                    <Heart size={64} />
                  </div>
                  <h3 className="text-3xl font-black text-brand-dark mb-6 font-display uppercase tracking-tight">Coup de cœur manquant ?</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-10 font-medium text-lg leading-relaxed">
                    Vous n'avez pas encore ajouté de produits à vos favoris. Parcourez la boutique pour trouver votre bonheur !
                  </p>
                  <Link to="/boutique" className="inline-flex items-center gap-4 bg-brand-orange text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-brand-orange/20">Explorer la boutique <ArrowRight size={18} /></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favoriteProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white p-12 md:p-16 rounded-[64px] shadow-2xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-[60px]" />
                
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-4xl font-black font-display uppercase tracking-tighter text-brand-dark">Mon <span className="text-brand-orange">Profil</span></h2>
                  {!editing && (
                    <button 
                      onClick={() => setEditing(true)}
                      className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-brand-orange hover:bg-brand-orange/5 transition-all border border-gray-100"
                    >
                      <Settings size={24} />
                    </button>
                  )}
                </div>

                {editing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Prénom</label>
                        <input 
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-3xl font-bold focus:outline-none focus:border-brand-orange transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Nom</label>
                        <input 
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-3xl font-bold focus:outline-none focus:border-brand-orange transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-2">Email (non modifiable)</label>
                      <div className="w-full bg-gray-100 border-2 border-gray-200 p-5 rounded-3xl font-bold text-gray-400 cursor-not-allowed">
                        {user.email}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button 
                        type="button" 
                        onClick={() => setEditing(false)}
                        className="flex-1 py-5 rounded-3xl font-black text-xs uppercase tracking-widest border-2 border-gray-100 text-gray-400 hover:bg-gray-50 transition-all"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={updatingProfile}
                        className="flex-1 bg-brand-orange text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updatingProfile ? <Loader2 className="animate-spin" size={16} /> : null}
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-10">
                    <div className="flex flex-col md:flex-row gap-12">
                      <div className="w-40 h-40 bg-brand-orange/5 rounded-[48px] flex items-center justify-center text-brand-orange border border-brand-orange/10 shadow-inner shrink-0 relative group">
                        <User size={80} className="opacity-20 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 border-2 border-dashed border-brand-orange/20 rounded-[48px] animate-pulse" />
                      </div>
                      
                      <div className="flex-1 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prénom</p>
                             <p className="text-xl font-black text-brand-dark">{user.firstName}</p>
                           </div>
                           <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nom</p>
                             <p className="text-xl font-black text-brand-dark">{user.lastName}</p>
                           </div>
                        </div>
                        <div className="bg-brand-dark text-white p-8 rounded-[40px] shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-green rounded-full blur-[60px] opacity-10" />
                          <p className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em] mb-2">Identité Digitale</p>
                          <p className="text-lg font-bold truncate">{user.email}</p>
                          <div className="mt-6 flex items-center gap-3">
                             <ShieldCheck className="text-brand-green" size={18} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Compte vérifié Appiotti 2026</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 border-t-2 border-dashed border-gray-100 grid grid-cols-2 lg:grid-cols-4 gap-6">
                       <div className="text-center">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                          <span className="bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Membre Actif</span>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Réseau</p>
                          <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Client Premium</span>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Points</p>
                          <span className="bg-brand-dark/5 text-brand-dark px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">1,240 pts</span>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscrit le</p>
                          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Mai 2026</span>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div 
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="bg-brand-dark text-white p-12 md:p-20 rounded-[80px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-orange rounded-full blur-[120px]" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-brand-green rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-4xl">
                   <h2 className="text-4xl md:text-7xl font-black font-display uppercase tracking-tighter leading-none mb-10">
                      Besoin d'<span className="text-brand-orange">Assistance ?</span>
                   </h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {[
                        { 
                          icon: <Phone className="text-brand-orange" />, 
                          title: "Ligne Directe", 
                          value: "+33 6 12 34 56 78",
                          desc: "Hervé vous répond directement du lundi au samedi (9h-19h)."
                        },
                        { 
                          icon: <Mail className="text-brand-green" />, 
                          title: "Support Mail", 
                          value: "herve@appiotti.com",
                          desc: "Nous répondons à toutes vos questions en moins de 4 heures."
                        },
                        { 
                          icon: <ShieldCheck className="text-sky-400" />, 
                          title: "Guide Sécurité", 
                          value: "Virement Bancaire",
                          desc: "Comprendre pourquoi le virement est le mode le plus sûr."
                        },
                        { 
                          icon: <Gift className="text-brand-yellow" />, 
                          title: "Parrainage", 
                          value: "Gagnez 50€",
                          desc: "Invitez un ami et recevez chacun 50€ sur votre prochain billard."
                        }
                      ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[40px] group hover:bg-white/10 transition-all">
                           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                              {item.icon}
                           </div>
                           <h3 className="text-xs font-black uppercase tracking-widest text-[#FF6B35] mb-2">{item.title}</h3>
                           <p className="text-2xl font-black mb-4 tracking-tight">{item.value}</p>
                           <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                   </div>
                   
                   <div className="mt-16 pt-16 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-brand-orange border border-white/10 animate-bounce">
                           <Info size={32} />
                         </div>
                         <div>
                            <p className="text-xl font-black uppercase tracking-tight italic">Hervé est à votre écoute</p>
                            <p className="text-gray-400 text-sm">Pas d'IA, pas de bots. Un vrai suivi humain.</p>
                         </div>
                      </div>
                      <Link to="/securite-virement" className="bg-brand-orange text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-110 transition-all flex items-center gap-3">
                        En savoir plus <ExternalLink size={16} />
                      </Link>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Summer Accent */}
        <div className="fixed bottom-10 right-10 z-40 hidden md:block">
           <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-gray-100 flex items-center gap-4 hover:scale-105 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-orange animate-pulse">
                <ShieldCheck size={28} />
              </div>
              <div className="pr-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark">Protection Appiotti</p>
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">100% de clients satisfaits</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

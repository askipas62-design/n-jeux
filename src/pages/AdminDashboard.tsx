import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { 
  Package, Clock, CheckCircle2, XCircle, TrendingUp, Users, 
  Search, Eye, MoreVertical, Filter, Loader2, Download, Truck,
  Star, MessageSquare, Trash2, ShieldCheck, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { adminService } from "../services/adminService";
import { reviewService } from "../services/reviewService";

type Tab = "orders" | "reviews" | "users" | "products";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("Tous");
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (user?.isAdmin) {
      if (activeTab === "orders") loadOrders();
      if (activeTab === "reviews") loadReviews();
      if (activeTab === "users") loadUsers();
      if (activeTab === "products") loadProducts();
    }
  }, [user, activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrders();
      setOrders(data || []);
    } catch (err: any) {
      console.error("Admin loadOrders error:", err);
      addToast(err.message || "Erreur chargement commandes", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAll();
      setReviews(data || []);
    } catch (err: any) {
      addToast("Erreur avis", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data || []);
    } catch (err: any) {
      addToast("Erreur utilisateurs", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts();
      setProducts(data || []);
    } catch (err: any) {
      addToast("Erreur produits", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await adminService.updateOrderStatus(id, status);
      addToast(`Statut : ${status}`, "success");
      loadOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      addToast(err.message || "Erreur mise à jour", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleProductStock = async (product: any) => {
    setUpdatingId(product.id);
    try {
      const newStock = product.stock > 0 ? 0 : 5;
      await adminService.updateProduct(product.id, { stock: newStock });
      addToast(`Stock mis à jour pour ${product.name}`, "success");
      loadProducts();
    } catch (err) {
      addToast("Erreur stock", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = [
    { label: "Commandes", value: orders.length, icon: <Package />, color: "bg-blue-500" },
    { label: "Clients", value: users.length, icon: <Users />, color: "bg-sky-500" },
    { label: "Avis Clients", value: reviews.length, icon: <MessageSquare />, color: "bg-brand-orange" },
    { label: "CA Validé", value: `${orders.filter(o => o.status === "Validée" || o.status === "Expédiée" || o.status === "Livrée").reduce((sum, o) => sum + (o.totalTTC || 0), 0).toFixed(2)}€`, icon: <TrendingUp />, color: "bg-brand-green" },
  ];

  const filteredOrders = filter === "Tous" ? orders : orders.filter(o => o.status === filter);

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      await reviewService.delete(id);
      addToast("Avis supprimé", "success");
      loadReviews();
    } catch (err) {
      addToast("Erreur suppression", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Validée": return "bg-emerald-500/20 text-emerald-500";
      case "Expédiée": return "bg-sky-500/20 text-sky-500";
      case "Livrée": return "bg-brand-dark/20 text-brand-yellow";
      case "Annulée":
      case "Refusée": return "bg-red-500/20 text-red-500";
      default: return "bg-orange-500/20 text-orange-500";
    }
  };

  const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <div className="bg-[#1B1B2F] min-h-screen text-white pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
           <div>
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-brand-green rounded-2xl flex items-center justify-center text-brand-dark shadow-lg shadow-brand-green/20">
                   <ShieldCheck size={28} />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black font-display uppercase tracking-tighter text-white">Dashboard <span className="text-brand-green">Admin</span></h1>
              </div>
              <p className="text-brand-orange font-black uppercase tracking-[0.3em] text-[10px] ml-16">Espace d'administration Hervé Appiotti</p>
           </div>
           
           <div className="flex bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-xl shrink-0 overflow-x-auto max-w-full">
              {[
                { id: "orders", label: "Commandes" },
                { id: "reviews", label: "Avis Clients" },
                { id: "users", label: "Clients" },
                { id: "products", label: "Produits" }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-brand-green text-brand-dark shadow-xl" : "text-gray-400 hover:text-white"}`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
           {stats.map((stat, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white/5 border border-white/10 p-8 rounded-[32px] flex items-center justify-between group hover:bg-white/10 transition-all cursor-default"
             >
                <div>
                   <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">{stat.label}</p>
                   <p className="text-3xl font-black font-mono tracking-tighter">{stat.value}</p>
                </div>
                <div className={`p-5 rounded-2xl ${stat.color} shadow-lg transition-transform group-hover:scale-110 shadow-current/20`}>{stat.icon}</div>
             </motion.div>
           ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "orders" ? (
            <motion.div 
              key="orders"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 md:p-12 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/[0.02]">
                 <div>
                    <h2 className="text-3xl font-black font-display uppercase tracking-tight mb-2">Gestion des commandes</h2>
                    <p className="text-xs text-gray-500 font-medium font-mono">SUPABASE CLOUD : {orders.length} entrées détectées</p>
                 </div>
                 <div className="flex gap-4">
                    <select 
                       value={filter} 
                       onChange={(e) => setFilter(e.target.value)}
                       className="bg-[#1B1B2F] border-2 border-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none focus:border-brand-green transition-all appearance-none cursor-pointer hover:bg-white/5"
                    >
                       <option value="Tous">Tous les statuts</option>
                       <option value="En attente de virement">En attente</option>
                       <option value="En cours de validation">À valider</option>
                       <option value="Validée">Validée</option>
                       <option value="Expédiée">Expédiée</option>
                       <option value="Livrée">Livrée</option>
                       <option value="Annulée">Annulée</option>
                       <option value="Refusée">Refusée</option>
                    </select>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-[0.3em]">
                          <th className="px-10 py-8">ID</th>
                          <th className="px-6 py-8">Date</th>
                          <th className="px-6 py-8">Total</th>
                          <th className="px-6 py-8">Preuve</th>
                          <th className="px-6 py-8">Statut</th>
                          <th className="px-10 py-8 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {filteredOrders.map((order) => (
                         <tr key={order.id} className="hover:bg-white/[0.05] transition-colors group">
                            <td className="px-10 py-10 font-black font-mono text-brand-green text-lg tracking-tighter">#{order.id.split('-')[1]}</td>
                            <td className="px-6 py-10 text-sm font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                            <td className="px-6 py-10 font-black text-2xl font-mono tracking-tighter">{(order.totalTTC || 0).toFixed(2)}€</td>
                            <td className="px-6 py-10">
                               {order.proofUploaded ? (
                                  <button 
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex items-center gap-3 bg-brand-green/10 text-brand-green px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-green/20 hover:bg-brand-green hover:text-brand-dark transition-all"
                                  >
                                     <Eye size={16} /> VOIR
                                  </button>
                               ) : (
                                  <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest opacity-50">En attente</span>
                               )}
                            </td>
                            <td className="px-6 py-10">
                               <span className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${getStatusColor(order.status)}`}>
                                  {order.status}
                               </span>
                            </td>
                            <td className="px-10 py-10 text-right">
                               <div className="flex justify-end gap-3">
                                  {updatingId === order.id ? (
                                    <div className="p-4 text-brand-green"><Loader2 className="animate-spin" size={24} /></div>
                                  ) : (
                                    <>
                                      <button onClick={() => updateStatus(order.id, "Validée")} title="Valider" className="p-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-500/20 shadow-lg active:scale-90"><CheckCircle2 size={20} /></button>
                                      <button onClick={() => updateStatus(order.id, "Expédiée")} title="Expédier" className="p-3 bg-sky-500/10 hover:bg-sky-500 text-sky-500 hover:text-white rounded-xl transition-all border border-sky-500/20 shadow-lg active:scale-90"><Truck size={20} /></button>
                                      <button onClick={() => updateStatus(order.id, "Refusée")} title="Refuser" className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-lg active:scale-90"><XCircle size={20} /></button>
                                    </>
                                  )}
                               </div>
                            </td>
                         </tr>
                       ))}
                       {filteredOrders.length === 0 && (
                         <tr>
                           <td colSpan={6} className="px-10 py-32 text-center">
                              <Package size={64} className="mx-auto text-white/5 mb-6" />
                              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Aucune commande trouvée</p>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
            </motion.div>
          ) : activeTab === "users" ? (
            <motion.div 
               key="users"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden"
            >
               <div className="p-12 border-b border-white/10">
                  <h2 className="text-3xl font-black font-display uppercase tracking-tight">Utilisateurs enregistrés</h2>
                  <p className="text-xs text-brand-orange font-bold uppercase tracking-widest mt-2">{users.length} clients dans la base</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 md:p-12">
                  {users.map(u => (
                     <div key={u.id} className="bg-white/[0.03] border border-white/10 p-8 rounded-[40px] hover:bg-white/[0.06] transition-all">
                        <div className="flex items-center gap-6 mb-6">
                           <div className="w-16 h-16 bg-brand-green/10 rounded-3xl flex items-center justify-center text-brand-green">
                              <Users size={32} />
                           </div>
                           <div>
                              <p className="text-xl font-black uppercase tracking-tight">{u.firstName} {u.lastName}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">{u.email}</p>
                           </div>
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                           <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${u.isAdmin ? 'bg-brand-green text-brand-dark' : 'bg-white/5 text-gray-500'}`}>
                              {u.isAdmin ? 'Administrateur' : 'Client Standard'}
                           </span>
                           <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest truncate max-w-[100px]">ID: {u.id.substring(0, 8)}...</span>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
          ) : activeTab === "products" ? (
            <motion.div 
               key="products"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden"
            >
               <div className="p-12 border-b border-white/10">
                  <h2 className="text-3xl font-black font-display uppercase tracking-tight">Catalogue Produits</h2>
                  <p className="text-xs text-brand-yellow font-bold uppercase tracking-widest mt-2">Vue d'ensemble et gestion des stocks</p>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-white/5 text-gray-500 font-black uppercase text-[10px] tracking-[0.3em]">
                           <th className="px-10 py-8">Nom</th>
                           <th className="px-6 py-8">Catégorie</th>
                           <th className="px-6 py-8">Prix HT</th>
                           <th className="px-6 py-8">Stock</th>
                           <th className="px-10 py-8 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {products.map(p => (
                           <tr key={p.id} className="hover:bg-white/[0.05] transition-colors">
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl overflow-hidden shrink-0 border border-white/10">
                                       <img src={p.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <p className="font-black uppercase tracking-tight">{p.name}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-8">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{p.category}</span>
                              </td>
                              <td className="px-6 py-8 font-mono text-lg font-black">{(p.priceHT || 0).toFixed(2)}€</td>
                              <td className="px-6 py-8">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${p.stock > 0 ? 'bg-brand-green' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${p.stock > 0 ? 'text-gray-400' : 'text-red-500'}`}>
                                       {p.stock > 0 ? `${p.stock} en stock` : 'RUPTURE'}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <button 
                                    onClick={() => toggleProductStock(p)}
                                    disabled={updatingId === p.id}
                                    className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                       p.stock > 0 
                                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20' 
                                          : 'bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-brand-dark border border-brand-green/20'
                                    } disabled:opacity-50`}
                                 >
                                    {updatingId === p.id ? <Loader2 className="animate-spin" size={14} /> : (p.stock > 0 ? 'Mettre en rupture' : 'Remettre en stock')}
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </motion.div>
          ) : (
            <motion.div 
               key="reviews"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
               {reviews.map((review) => (
                 <motion.div 
                   key={review.id}
                   layout
                   className="bg-white/5 border border-white/10 p-8 rounded-[40px] relative group hover:bg-white/10 transition-all"
                 >
                    <button 
                      onClick={() => handleDeleteReview(review.id)}
                      className="absolute top-6 right-6 p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                       <Trash2 size={18} />
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange border border-brand-orange/20">
                          <Users size={24} />
                       </div>
                       <div>
                          <p className="font-black text-lg uppercase tracking-tight">{review.userName}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{review.userEmail}</p>
                       </div>
                    </div>

                    <div className="flex gap-1 mb-4">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} size={16} className={i < review.rating ? "fill-brand-yellow text-brand-yellow" : "text-gray-700"} />
                       ))}
                    </div>

                    <p className="text-gray-300 leading-relaxed italic mb-6">"{review.comment}"</p>
                    
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-widest text-brand-green">Publié le {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                 </motion.div>
               ))}
               
               {reviews.length === 0 && (
                 <div className="col-span-full py-40 text-center bg-white/5 rounded-[80px] border border-white/10">
                    <Star size={80} className="mx-auto text-white/5 mb-8" />
                    <h3 className="text-2xl font-black mb-4">Un silence radio total...</h3>
                    <p className="text-gray-500 max-w-md mx-auto font-medium">Les clients n'ont pas encore partagé leur expérience Appiotti.</p>
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1B1B2F]/95 backdrop-blur-2xl flex items-center justify-center p-8"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 40 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 40 }}
               className="bg-white text-brand-dark rounded-[60px] p-12 max-w-2xl w-full relative overflow-hidden shadow-2xl border-4 border-white/20"
             >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-green" />
                <button onClick={() => setSelectedOrder(null)} className="absolute top-10 right-10 p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400"><XCircle size={32} /></button>
                
                <h3 className="text-4xl font-black mb-1 font-display uppercase tracking-tight">Vérification de Preuve</h3>
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-12">Réf. Commande {selectedOrder.id}</p>
                
                <div className="aspect-video bg-gray-50 rounded-[40px] border-4 border-gray-100 mb-10 overflow-hidden flex items-center justify-center shadow-2xl relative group">
                   {selectedOrder.proofUrl ? (
                     <>
                        <img src={getImageUrl(selectedOrder.proofUrl)} alt="Preuve" className="w-full h-full object-contain" />
                        <a href={getImageUrl(selectedOrder.proofUrl)} target="_blank" rel="noreferrer" className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                           <button className="bg-white text-brand-dark px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3">Agrandir <Download size={18} /></button>
                        </a>
                     </>
                   ) : (
                     <div className="text-gray-300 flex flex-col items-center gap-6">
                        <Package size={64} className="opacity-10" />
                        <span className="font-bold text-sm">Fichier corrompu ou manquant</span>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                     onClick={() => updateStatus(selectedOrder.id, "Validée")} 
                     disabled={updatingId === selectedOrder.id}
                     className="bg-emerald-500 text-white min-h-[72px] rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {updatingId === selectedOrder.id ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={24} />}
                     Valider & Confirmer
                   </button>
                   <button 
                     onClick={() => updateStatus(selectedOrder.id, "Refusée")} 
                     disabled={updatingId === selectedOrder.id}
                     className="bg-white text-red-500 border-2 border-red-100 min-h-[72px] rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-50 text-red-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {updatingId === selectedOrder.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={24} />}
                     Refuser la preuve
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

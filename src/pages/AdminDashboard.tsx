import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { 
  Package, Clock, CheckCircle2, XCircle, TrendingUp, Users, 
  Search, Eye, MoreVertical, Filter, Loader2, Download, Truck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminDashboard() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("Tous");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      addToast("Erreur lors du chargement des commandes", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        addToast(`Statut mis à jour : ${status}`, "success");
        loadOrders();
        setSelectedOrder(null);
      }
    } catch (err) {
      addToast("Erreur lors de la mise à jour", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = [
    { label: "Commandes Totales", value: orders.length, icon: <Package />, color: "bg-blue-500" },
    { label: "En attente", value: orders.filter(o => o.status.includes("attente") || o.status.includes("En cours")).length, icon: <Clock />, color: "bg-orange-500" },
    { label: "CA Total", value: `${orders.filter(o => o.status === "Validée").reduce((sum, o) => sum + o.totalTTC, 0).toFixed(2)}€`, icon: <TrendingUp />, color: "bg-emerald-500" },
    { label: "Nouveaux Clients", value: "12", icon: <Users />, color: "bg-purple-500" },
  ];

  const filteredOrders = filter === "Tous" ? orders : orders.filter(o => o.status === filter);

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

  return (
    <div className="bg-[#1B1B2F] min-h-screen text-white pt-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
           <div>
              <h1 className="text-4xl md:text-5xl font-black mb-4 font-display uppercase tracking-tighter text-white">Dashboard <span className="text-brand-green">Admin</span></h1>
              <p className="text-brand-orange font-black uppercase tracking-[0.3em] text-[10px]">Espace de gestion Hervé Appiotti</p>
           </div>
           <button onClick={loadOrders} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
              {loading ? <Loader2 className="animate-spin" /> : "Actualiser les données"}
           </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
           {stats.map((stat, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white/5 border border-white/10 p-8 rounded-[32px] flex items-center justify-between"
             >
                <div>
                   <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">{stat.label}</p>
                   <p className="text-3xl font-black font-mono">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.color} shadow-lg`}>{stat.icon}</div>
             </motion.div>
           ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white/5 border border-white/10 rounded-[48px] overflow-hidden shadow-2xl">
           <div className="p-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5">
              <h2 className="text-2xl font-black font-display uppercase tracking-tight">Gestion des commandes</h2>
              <div className="flex gap-4">
                 <select 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-[#1B1B2F] border border-white/20 px-6 py-3 rounded-full font-bold outline-none focus:border-brand-green"
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
                    <tr className="bg-white/5 text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                       <th className="px-10 py-6">ID Commande</th>
                       <th className="px-6 py-6">Date</th>
                       <th className="px-6 py-6">Total TTC</th>
                       <th className="px-6 py-6">Preuve</th>
                       <th className="px-6 py-6">Statut</th>
                       <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                         <td className="px-10 py-8 font-black font-mono text-brand-green">#{order.id.split('-')[1]}</td>
                         <td className="px-6 py-8 text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                         <td className="px-6 py-8 font-black text-xl font-mono">{order.totalTTC.toFixed(2)}€</td>
                         <td className="px-6 py-8">
                            {order.proofUploaded ? (
                               <button 
                                 onClick={() => setSelectedOrder(order)}
                                 className="flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-green/20"
                               >
                                  <Download size={14} /> Voir Preuve
                               </button>
                            ) : (
                               <span className="text-gray-600 text-xs font-bold italic">Aucune preuve</span>
                            )}
                         </td>
                         <td className="px-6 py-8">
                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                               {order.status}
                            </span>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <div className="flex justify-end gap-2">
                               {updatingId === order.id ? (
                                 <div className="p-3 text-brand-green">
                                   <Loader2 className="animate-spin" size={18} />
                                 </div>
                               ) : (
                                 <>
                                   <button onClick={() => updateStatus(order.id, "Validée")} title="Valider" className="p-3 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-95"><CheckCircle2 size={18} /></button>
                                   <button onClick={() => updateStatus(order.id, "Expédiée")} title="Expédier" className="p-3 bg-sky-500/20 hover:bg-sky-500 text-sky-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-95"><Truck size={18} /></button>
                                   <button onClick={() => updateStatus(order.id, "Livrée")} title="Livrer" className="p-3 bg-brand-yellow/20 hover:bg-brand-yellow text-brand-dark rounded-xl transition-all shadow-lg active:scale-95"><Package size={18} /></button>
                                   <button onClick={() => updateStatus(order.id, "Refusée")} title="Refuser" className="p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-95"><XCircle size={18} /></button>
                                   <button onClick={() => updateStatus(order.id, "En attente de virement")} title="Mettre en attente" className="p-3 bg-orange-500/20 hover:bg-orange-500 text-orange-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-95"><Clock size={18} /></button>
                                 </>
                               )}
                            </div>
                         </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-10 py-20 text-center text-gray-500 italic">
                           {loading ? "Chargement des commandes..." : "Aucune commande correspondante."}
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* Proof Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1B1B2F]/90 backdrop-blur-xl flex items-center justify-center p-8"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-white text-brand-dark rounded-[48px] p-12 max-w-2xl w-full relative"
             >
                <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 p-3 hover:bg-gray-50 rounded-full transition-all text-gray-400"><XCircle size={32} /></button>
                <h3 className="text-3xl font-black mb-1 font-display uppercase tracking-tight">Preuve de virement</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">Commande #{selectedOrder.id}</p>
                
                <div className="p-6 bg-brand-cream rounded-[32px] border border-gray-100 mb-8 max-h-[400px] overflow-auto flex items-center justify-center shadow-inner">
                   {selectedOrder.proofUrl ? (
                     <img src={selectedOrder.proofUrl} alt="Preuve" className="max-w-full rounded-2xl shadow-2xl" />
                   ) : (
                     <div className="text-gray-300 italic flex flex-col items-center gap-4">
                        <Package size={48} className="opacity-20" />
                        Image non disponible
                     </div>
                   )}
                </div>
                <div className="flex gap-4">
                   <button 
                     onClick={() => updateStatus(selectedOrder.id, "Validée")} 
                     disabled={updatingId === selectedOrder.id}
                     className="flex-grow bg-emerald-500 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {updatingId === selectedOrder.id ? <Loader2 className="animate-spin" size={16} /> : null}
                     Valider le paiement
                   </button>
                   <button 
                     onClick={() => updateStatus(selectedOrder.id, "Annulée")} 
                     disabled={updatingId === selectedOrder.id}
                     className="px-10 bg-red-500 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {updatingId === selectedOrder.id ? <Loader2 className="animate-spin" size={16} /> : null}
                     Refuser
                   </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

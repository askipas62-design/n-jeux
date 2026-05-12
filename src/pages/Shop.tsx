import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, SlidersHorizontal, ChevronDown, LayoutGrid, List, Loader2, Target, Circle, CircleDot, Move, Gamepad2, Monitor, CreditCard } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { BabyFootIcon, PingPongIcon, BillardIcon, TrampolineIcon, AccessoriesIcon, ConsoleIcon } from "../components/CategoryIcons";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("min") || "";
  const maxPrice = searchParams.get("max") || "";
  const query = searchParams.get("q") || "";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (query) params.append("q", query);

    fetch(`/api/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, [category, minPrice, maxPrice, query]);

  const categories = [
    { id: "baby-foot", name: "Baby-Foot", icon: <BabyFootIcon className="w-5 h-5 text-brand-orange" /> },
    { id: "ping-pong", name: "Ping-Pong", icon: <PingPongIcon className="w-5 h-5 text-brand-orange" /> },
    { id: "billard", name: "Billard", icon: <BillardIcon className="w-5 h-5 text-brand-orange" /> },
    { id: "trampoline", name: "Trampolines", icon: <TrampolineIcon className="w-5 h-5 text-brand-orange" /> },
    { id: "accessoires", name: "Accessoires", icon: <AccessoriesIcon className="w-5 h-5 text-brand-orange" /> },
    { id: "consoles", name: "Consoles", icon: <ConsoleIcon className="w-5 h-5 text-brand-orange" /> },
  ];

  const handleCategoryChange = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === category) {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="bg-[#FFF8F0] min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 font-display">
              Catalogue <span className="text-brand-orange">Appiotti</span>
            </h1>
            <p className="text-gray-500 font-medium">{products.length} pépites dénichées pour vous</p>
          </div>

          <div className="flex gap-4">
             <div className="relative flex-grow md:w-80">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..." 
                  value={query}
                  onChange={(e) => {
                    const next = new URLSearchParams(searchParams);
                    if (e.target.value) next.set("q", e.target.value);
                    else next.delete("q");
                    setSearchParams(next);
                  }}
                  className="w-full bg-white border-2 border-gray-100 rounded-full pl-14 pr-6 py-4 focus:outline-none focus:border-brand-orange shadow-lg transition-all font-medium"
                />
             </div>
             <button 
               onClick={() => setShowFilters(!showFilters)}
               className={`md:hidden p-4 rounded-2xl shadow-lg transition-all ${showFilters ? 'bg-brand-orange text-white' : 'bg-white text-brand-dark'}`}
             >
                <SlidersHorizontal size={24} />
             </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 space-y-12 transition-all ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Category Filter */}
            <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100">
               <h3 className="text-lg font-black mb-8 border-b pb-4 flex items-center gap-2 font-display">
                 <Filter size={20} className="text-brand-orange" /> Catégories
               </h3>
               <div className="space-y-4">
                 {categories.map((cat) => (
                   <button
                     key={cat.id}
                     onClick={() => handleCategoryChange(cat.id)}
                     className={`w-full flex items-center justify-between group px-4 py-3 rounded-2xl transition-all ${
                       category === cat.id ? 'bg-brand-orange text-white shadow-lg' : 'hover:bg-gray-50 text-gray-600'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <span className="text-xl">{cat.icon}</span>
                       <span className="font-bold">{cat.name}</span>
                     </div>
                     <div className={`w-2 h-2 rounded-full ${category === cat.id ? 'bg-white' : 'bg-gray-200'} transition-all`} />
                   </button>
                 ))}
               </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100">
               <h3 className="text-lg font-black mb-8 border-b pb-4 flex items-center gap-2 font-display">
                 💳 Budget (TTC)
               </h3>
               <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Prix Min</label>
                    <input 
                      type="number" 
                      placeholder="0€"
                      value={minPrice}
                      onChange={(e) => {
                        const next = new URLSearchParams(searchParams);
                        if (e.target.value) next.set("min", e.target.value);
                        else next.delete("min");
                        setSearchParams(next);
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand-orange"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Prix Max</label>
                    <input 
                      type="number" 
                      placeholder="5000€"
                      value={maxPrice}
                      onChange={(e) => {
                        const next = new URLSearchParams(searchParams);
                        if (e.target.value) next.set("max", e.target.value);
                        else next.delete("max");
                        setSearchParams(next);
                      }}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand-orange"
                    />
                 </div>
               </div>
            </div>

            {/* Support Box */}
            <div className="bg-brand-dark p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
               <h3 className="text-xl font-black mb-4 font-display">Besoin de conseil ?</h3>
               <p className="text-sm text-gray-400 mb-6 leading-relaxed font-medium">Hervé et son équipe sont là pour vous guider dans votre choix.</p>
               <a href="tel:0600000000" className="flex items-center justify-center gap-2 bg-brand-orange py-3 rounded-full font-bold hover:scale-105 transition-transform">
                  Nous appeler
               </a>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[32px] h-[500px] animate-pulse border border-gray-100 p-8 flex flex-col">
                     <div className="bg-gray-100 rounded-2xl w-full h-64 mb-6" />
                     <div className="bg-gray-100 h-6 w-3/4 rounded mb-4" />
                     <div className="bg-gray-100 h-4 w-full rounded mb-2" />
                     <div className="bg-gray-100 h-4 w-5/6 rounded mb-8" />
                     <div className="mt-auto flex justify-between">
                        <div className="bg-gray-100 h-8 w-24 rounded" />
                        <div className="bg-gray-100 h-10 w-10 rounded-xl" />
                     </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-[48px] p-20 text-center shadow-xl border border-gray-100"
              >
                <div className="flex justify-center mb-8">
                  <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
                    <Search size={64} />
                  </div>
                </div>
                <h2 className="text-3xl font-black text-[#1B1B2F] mb-4 font-display uppercase tracking-tight">Aucun résultat trouvé</h2>
                <p className="text-gray-500 mb-12 max-w-md mx-auto">Nous n'avons pas trouvé de pépites correspondant à vos filtres. Essayez d'élargir votre recherche !</p>
                <button 
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="bg-[#FF6B35] text-white px-10 py-4 rounded-full font-bold hover:scale-110 transition-transform shadow-lg"
                >
                  Réinitialiser les filtres
                </button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

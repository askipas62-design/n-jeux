import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { BabyFootIcon, PingPongIcon, BillardIcon, TrampolineIcon, AccessoriesIcon, ConsoleIcon } from "../components/CategoryIcons";
import { products as allProducts, type Product } from "../data/products";
import { getProductBrand, isSameBrand } from "../lib/catalog";

const normalizeQuery = (value: string) => value.trim().toLowerCase();

const categories = [
  { id: "baby-foot", name: "Baby-Foot", icon: <BabyFootIcon className="w-5 h-5" /> },
  { id: "ping-pong", name: "Ping-Pong", icon: <PingPongIcon className="w-5 h-5" /> },
  { id: "billard", name: "Billard", icon: <BillardIcon className="w-5 h-5" /> },
  { id: "trampoline", name: "Trampolines", icon: <TrampolineIcon className="w-5 h-5" /> },
  { id: "accessoires", name: "Accessoires", icon: <AccessoriesIcon className="w-5 h-5" /> },
  { id: "consoles", name: "Consoles", icon: <ConsoleIcon className="w-5 h-5" /> },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const query = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "default";

  const products = useMemo(() => {
    const filtered = allProducts.filter(Boolean) as Product[];
    const q = normalizeQuery(query);
    let result = filtered.filter((product) => {
      if (category && product.category !== category) return false;
      if (brand) {
        const productBrand = getProductBrand(product);
        if (!isSameBrand(productBrand, brand)) return false;
      }
      if (q) {
        const haystack = `${product.name} ${product.desc} ${product.category} ${product.brand || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.priceHT * 1.2 - b.priceHT * 1.2);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.priceHT * 1.2 - a.priceHT * 1.2);
    } else if (sortBy === "popularity") {
      result.sort((a, b) => b.rating - a.rating || b.stock - a.stock);
    } else {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [brand, category, query, sortBy]);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 120);
    return () => window.clearTimeout(timer);
  }, [brand, category, query, sortBy]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of allProducts) {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, []);

  const activeTags: { label: string; onRemove: () => void }[] = [];
  if (category) {
    const cat = categories.find((c) => c.id === category);
    activeTags.push({
      label: cat?.name || category,
      onRemove: () => { const next = new URLSearchParams(searchParams); next.delete("category"); setSearchParams(next); },
    });
  }
  if (brand) {
    activeTags.push({
      label: brand,
      onRemove: () => { const next = new URLSearchParams(searchParams); next.delete("brand"); setSearchParams(next); },
    });
  }
  if (query) {
    activeTags.push({
      label: `"${query}"`,
      onRemove: () => { const next = new URLSearchParams(searchParams); next.delete("q"); setSearchParams(next); },
    });
  }

  const sortOptions = [
    { id: "default", label: "Par défaut" },
    { id: "popularity", label: "Populaires" },
    { id: "price-asc", label: "Prix ↑" },
    { id: "price-desc", label: "Prix ↓" },
  ];

  return (
    <div className="bg-[#FFF8F0] min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-brand-dark font-display">
              Catalogue <span className="text-brand-orange">Appiotti</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2">{products.length} pépites dénichées pour vous</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={query}
              onChange={(e) => setParam("q", e.target.value)}
              className="w-full bg-white border-2 border-gray-100 rounded-full pl-14 pr-6 py-4 focus:outline-none focus:border-brand-orange shadow-lg transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => {
            const isActive = category === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setParam("category", isActive ? "" : cat.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-full font-bold text-sm transition-all border ${
                  isActive
                    ? "bg-brand-orange text-white border-brand-orange shadow-lg"
                    : "bg-white text-gray-600 border-gray-100 hover:border-brand-orange hover:text-brand-orange shadow-sm"
                }`}
              >
                <span className={isActive ? "text-white" : "text-brand-orange"}>{cat.icon}</span>
                {cat.name}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {activeTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-bold"
              >
                {tag.label}
                <button onClick={tag.onRemove} className="hover:bg-brand-orange/20 rounded-full p-0.5 transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-gray-400 font-medium">
            {activeTags.length > 0 && `${products.length} résultat${products.length > 1 ? "s" : ""}`}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Trier</span>
            <select
              value={sortBy}
              onChange={(e) => setParam("sort", e.target.value === "default" ? "" : e.target.value)}
              className="bg-white border border-gray-100 rounded-full px-4 py-2.5 text-sm font-bold text-gray-600 focus:outline-none focus:border-brand-orange shadow-sm cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[48px] p-20 text-center shadow-xl border border-gray-100 animate-fade-in">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200">
                <Search size={64} />
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#1B1B2F] mb-4 font-display uppercase tracking-tight">Aucun résultat trouvé</h2>
            <p className="text-gray-500 mb-12 max-w-md mx-auto">Nous n'avons pas trouvé de pépites correspondant à votre recherche. Essayez autre chose !</p>
            <button
              onClick={() => setSearchParams(new URLSearchParams())}
              className="bg-[#FF6B35] text-white px-10 py-4 rounded-full font-bold hover:scale-110 transition-transform shadow-lg"
            >
              Réinitialiser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

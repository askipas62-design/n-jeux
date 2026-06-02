import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, SlidersHorizontal, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ProductCard from "../components/ProductCard";
import { BabyFootIcon, PingPongIcon, BillardIcon, TrampolineIcon, AccessoriesIcon, ConsoleIcon } from "../components/CategoryIcons";
import { products as allProducts, type Product } from "../data/products";
import { getProductBrand, isSameBrand } from "../lib/catalog";

const normalizeQuery = (value: string) => value.trim().toLowerCase();

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("min") || "";
  const maxPrice = searchParams.get("max") || "";
  const query = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "default";

  const categories = useMemo(
    () => [
      { id: "baby-foot", name: "Baby-Foot", icon: <BabyFootIcon className="w-5 h-5 text-brand-orange" /> },
      { id: "ping-pong", name: "Ping-Pong", icon: <PingPongIcon className="w-5 h-5 text-brand-orange" /> },
      { id: "billard", name: "Billard", icon: <BillardIcon className="w-5 h-5 text-brand-orange" /> },
      { id: "trampoline", name: "Trampolines", icon: <TrampolineIcon className="w-5 h-5 text-brand-orange" /> },
      { id: "accessoires", name: "Accessoires", icon: <AccessoriesIcon className="w-5 h-5 text-brand-orange" /> },
      { id: "consoles", name: "Consoles", icon: <ConsoleIcon className="w-5 h-5 text-brand-orange" /> },
    ],
    []
  );

  const products = useMemo(() => {
    const filtered = allProducts.filter(Boolean) as Product[];

    const q = normalizeQuery(query);

    let result = filtered.filter((product) => {
      if (category && product.category !== category) return false;
      if (brand) {
        const productBrand = getProductBrand(product);
        if (!isSameBrand(productBrand, brand)) return false;
      }
      if (minPrice && product.priceHT * 1.2 < Number(minPrice)) return false;
      if (maxPrice && product.priceHT * 1.2 > Number(maxPrice)) return false;
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
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [brand, category, maxPrice, minPrice, query, sortBy]);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 120);
    return () => window.clearTimeout(timer);
  }, [category, brand, minPrice, maxPrice, query, sortBy]);

  const handleCategoryChange = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === category) {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const resetFilters = () => setSearchParams(new URLSearchParams());

  const uniqueBrands = useMemo(() => {
    const values = allProducts
      .map((product) => getProductBrand(product))
      .filter((value): value is string => Boolean(value))
      .map((value) => value.trim());
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "fr"));
  }, []);

  return (
    <div className="bg-[#FFF8F0] min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4">
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
                onChange={(e) => updateParam("q", e.target.value)}
                className="w-full bg-white border-2 border-gray-100 rounded-full pl-14 pr-6 py-4 focus:outline-none focus:border-brand-orange shadow-lg transition-all font-medium"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`md:hidden p-4 rounded-2xl shadow-lg transition-all ${showFilters ? "bg-brand-orange text-white" : "bg-white text-brand-dark"}`}
            >
              <SlidersHorizontal size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className={`lg:w-72 space-y-12 transition-all ${showFilters ? "block" : "hidden lg:block"}`}>
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
                      category === cat.id ? "bg-brand-orange text-white shadow-lg" : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-bold">{cat.name}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${category === cat.id ? "bg-white" : "bg-gray-200"} transition-all`} />
                  </button>
                ))}
              </div>
            </div>

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
                    onChange={(e) => updateParam("min", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand-orange"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Prix Max</label>
                  <input
                    type="number"
                    placeholder="5000€"
                    value={maxPrice}
                    onChange={(e) => updateParam("max", e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-brand-orange"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100">
              <h3 className="text-lg font-black mb-8 border-b pb-4 flex items-center gap-2 font-display">
                <SlidersHorizontal size={20} className="text-brand-orange" /> Tri & Ordre
              </h3>
              <div className="space-y-3">
                {[
                  { id: "default", label: "Par défaut" },
                  { id: "popularity", label: "Les plus populaires" },
                  { id: "price-asc", label: "Prix croissant" },
                  { id: "price-desc", label: "Prix décroissant" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateParam("sort", option.id === "default" ? "" : option.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-between ${
                      sortBy === option.id || (sortBy === "" && option.id === "default")
                        ? "bg-brand-orange/10 text-brand-orange"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                    {(sortBy === option.id || (sortBy === "" && option.id === "default")) && <CircleDot size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-brand-dark p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
              <h3 className="text-xl font-black mb-4 font-display">Besoin de conseil ?</h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed font-medium">Hervé et son équipe sont là pour vous guider dans votre choix.</p>
              <a href="tel:0600000000" className="flex items-center justify-center gap-2 bg-brand-orange py-3 rounded-full font-bold hover:scale-105 transition-transform">
                Nous appeler
              </a>
            </div>
          </aside>

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
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {products.map((product: Product) => (
                    <ProductCard key={product.id} product={product} />
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
                  onClick={resetFilters}
                  className="bg-[#FF6B35] text-white px-10 py-4 rounded-full font-bold hover:scale-110 transition-transform shadow-lg"
                >
                  Réinitialiser les filtres
                </button>
              </motion.div>
            )}
          </main>
        </div>

        <div className="mt-16 bg-white rounded-[32px] p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-brand-dark font-display">Marques disponibles</h3>
              <p className="text-sm text-gray-500">Les produits sans marque restent visibles par catégorie, mais n’apparaissent pas dans cette liste.</p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-orange">{uniqueBrands.length} marques</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {uniqueBrands.map((brandName) => (
              <button
                key={brandName}
                onClick={() => updateParam("brand", brand === brandName ? "" : brandName)}
                className={`px-4 py-2 rounded-full border font-bold text-sm transition-all ${
                  isSameBrand(brand, brandName)
                    ? "bg-brand-orange text-white border-brand-orange shadow-lg"
                    : "bg-gray-50 text-gray-600 border-gray-100 hover:border-brand-orange hover:text-brand-orange"
                }`}
              >
                {brandName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

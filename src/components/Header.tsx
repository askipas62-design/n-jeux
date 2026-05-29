import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Sparkles, Search, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";

const shopCategories = [
  { label: "Baby-foot", slug: "baby-foot", href: "/boutique?category=baby-foot" },
  { label: "Billard", slug: "billard", href: "/boutique?category=billard" },
  { label: "Tennis de table", slug: "ping-pong", href: "/boutique?category=ping-pong" },
  { label: "Trampoline", slug: "trampoline", href: "/boutique?category=trampoline" },
  { label: "Accessoires", slug: "accessoires", href: "/boutique?category=accessoires" },
];

const shopBrands = [
  { label: "Cornilleau", value: "Cornilleau", href: "/boutique?brand=Cornilleau" },
  { label: "Bonzini", value: "Bonzini", href: "/boutique?brand=Bonzini" },
  { label: "Kettler", value: "Kettler", href: "/boutique?brand=Kettler" },
  { label: "Garlando", value: "Garlando", href: "/boutique?brand=Garlando" },
  { label: "Sponeta", value: "Sponeta", href: "/boutique?brand=Sponeta" },
  { label: "René Pierre", value: "René Pierre", href: "/boutique?brand=Ren%C3%A9%20Pierre" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/connexion");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1B1B2F] text-white shadow-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,107,53,0.5)]"
          >
            <Sparkles className="text-white" size={24} />
          </motion.div>
          <span className="text-2xl font-black font-display tracking-tight">
            Appiotti <span className="text-brand-yellow">Game Shop</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium tracking-wide uppercase text-brand-cream/80">
          <div className="relative group">
            <Link to="/boutique" className="flex items-center gap-2 hover:text-brand-orange transition-colors">
              Boutique
              <span className="text-[10px]">▼</span>
            </Link>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="pointer-events-none absolute left-0 top-full mt-4 hidden w-[760px] rounded-[28px] border border-white/10 bg-[#1B1B2F]/95 p-6 text-left shadow-2xl backdrop-blur-xl group-hover:pointer-events-auto group-hover:block"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">Catégories</p>
                    <div className="space-y-2">
                      {shopCategories.map((item) => (
                        <Link
                          key={item.slug}
                          to={item.href}
                          className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold text-brand-cream/90 transition-all hover:bg-white/5 hover:text-brand-orange"
                        >
                          <span>{item.label}</span>
                          <span className="text-[10px] text-brand-orange/80">Découvrir</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">Marques</p>
                    <div className="grid grid-cols-2 gap-2">
                      {shopBrands.map((item) => (
                        <Link
                          key={item.value}
                          to={item.href}
                          className="rounded-2xl bg-white/5 px-3 py-3 text-xs font-bold uppercase tracking-wide text-brand-cream/90 transition-all hover:bg-brand-orange hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <Link to="/offres" className="hover:text-brand-orange transition-colors">Offres Été</Link>
          <Link to="/a-propos" className="hover:text-brand-orange transition-colors">L'Entreprise</Link>
          <Link to="/contact" className="hover:text-brand-orange transition-colors">Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-6">
          <form onSubmit={handleSearch} className="relative bg-white/10 rounded-full px-5 py-2 flex items-center gap-3 border border-white/20 text-sm focus-within:bg-white/20 transition-all focus-within:border-brand-orange/50 group">
             <button type="submit" className="text-white/40 group-focus-within:text-brand-orange transition-colors">
               <Search size={16} />
             </button>
             <input 
              type="text" 
              placeholder="Chercher une pépite..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder:text-white/40 font-bold w-48 lg:w-64 transition-all"
             />
          </form>

          <div className="flex items-center gap-4">
            <Link to="/panier" className="relative p-2.5 hover:bg-white/10 rounded-full transition-all group">
              <ShoppingCart size={22} className="group-hover:text-brand-orange transition-colors" />
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={itemCount}
                  className="absolute top-1 right-1 bg-brand-orange text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {user && (
              <Link 
                to="/client/dashboard" 
                onClick={(e) => {
                  // This is a bit hacky but works for a quick jump: we could set a state in dashboard if needed
                  // but just going to dashboard is fine for now as it's the first tab.
                  // Actually let's just go to dashboard.
                }}
                className="relative p-2.5 hover:bg-white/10 rounded-full transition-all group"
                title="Ma Liste de Souhaits"
              >
                <Heart size={22} className="group-hover:text-brand-orange transition-colors" />
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                {user.isAdmin && (
                  <Link to="/admin/dashboard" title="Dashboard Admin" className="p-2 hover:bg-white/10 rounded-full text-brand-yellow">
                    <LayoutDashboard size={22} />
                  </Link>
                )}
                <div className="flex flex-col items-end mr-1">
                  <Link to="/client/dashboard" className="text-[10px] font-black text-brand-yellow tracking-widest uppercase hover:text-brand-orange transition-colors">Mon Espace</Link>
                  <button onClick={handleLogout} className="text-[9px] uppercase tracking-tighter hover:text-brand-orange flex items-center gap-1 opacity-50">
                    Déconnexion
                  </button>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-yellow flex items-center justify-center font-black shadow-lg text-brand-dark text-xs border border-white/20">
                  {user.firstName[0]}
                </div>
              </div>
            ) : (
              <Link to="/connexion" className="p-2.5 hover:bg-white/10 rounded-full transition-all group" title="Connexion">
                <User size={22} className="group-hover:text-brand-orange transition-colors" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Actions & Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Link to="/panier" className="relative p-2 hover:bg-white/10 rounded-full transition-all group">
            <ShoppingCart size={24} className="group-hover:text-brand-orange transition-colors" />
            {itemCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={itemCount}
                className="absolute top-0 right-0 bg-brand-orange text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black border-2 border-[#1B1B2F]"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>
          <button className="p-2 hover:bg-white/10 rounded-full transition-all" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#1B1B2F] border-t border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6 text-xl">
              <form onSubmit={handleSearch} className="relative bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/10">
                <Search size={24} className="text-brand-orange" />
                <input 
                  type="text" 
                  placeholder="Rechercher une pépite..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white placeholder:text-white/40 font-black w-full text-lg"
                />
              </form>
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors">Accueil</Link>
              <Link to="/boutique" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors">Boutique</Link>
              <div className="ml-4 border-l border-white/10 pl-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">Catégories</p>
                {shopCategories.map((item) => (
                  <Link
                    key={`mobile-category-${item.slug}`}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-base text-brand-cream/80 hover:text-brand-orange transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="ml-4 border-l border-white/10 pl-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">Marques</p>
                {shopBrands.map((item) => (
                  <Link
                    key={`mobile-brand-${item.value}`}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-base text-brand-cream/80 hover:text-brand-orange transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              {user && (
                <Link to="/client/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 hover:text-brand-orange transition-colors">
                  <Heart size={24} className="text-brand-orange" />
                  <span>Favoris</span>
                </Link>
              )}
              {!user ? (
                <Link to="/connexion" onClick={() => setIsMenuOpen(false)} className="text-brand-orange">Connexion</Link>
              ) : (
                <>
                  <Link to="/client/dashboard" onClick={() => setIsMenuOpen(false)} className="text-brand-yellow">Mon Espace Client</Link>
                  {user.isAdmin && <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="text-brand-orange">Dashboard Admin</Link>}
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-400">Déconnexion</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

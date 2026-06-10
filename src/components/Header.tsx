import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Sparkles, Search, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";

// Structure of navigation categories and their respective brands
const navigationMenu = [
  {
    label: "Baby-foot",
    slug: "baby-foot",
    href: "/boutique?category=baby-foot",
    brands: [
      { label: "Bonzini", href: "/boutique?category=baby-foot&brand=Bonzini" },
      { label: "René Pierre", href: "/boutique?category=baby-foot&brand=Ren%C3%A9%20Pierre" },
      { label: "Stella", href: "/boutique?category=baby-foot&brand=Stella" },
      { label: "Leonhart", href: "/boutique?category=baby-foot&brand=Leonhart" },
    ]
  },
  {
    label: "Billard",
    slug: "billard",
    href: "/boutique?category=billard",
    brands: [
      { label: "Garlando", href: "/boutique?category=billard&brand=Garlando" },
      { label: "Cornilleau", href: "/boutique?category=billard&brand=Cornilleau" },
      { label: "René Pierre", href: "/boutique?category=billard&brand=Ren%C3%A9%20Pierre" },
    ]
  },
  {
    label: "Tennis de table",
    slug: "ping-pong",
    href: "/boutique?category=ping-pong",
    brands: [
      { label: "Cornilleau", href: "/boutique?category=ping-pong&brand=Cornilleau" },
      { label: "Sponeta", href: "/boutique?category=ping-pong&brand=Sponeta" },
      { label: "Kettler", href: "/boutique?category=ping-pong&brand=Kettler" },
      { label: "Butterfly", href: "/boutique?category=ping-pong&brand=Butterfly" },
    ]
  },
  {
    label: "Trampoline",
    slug: "trampoline",
    href: "/boutique?category=trampoline",
    brands: [
      { label: "BERG", href: "/boutique?category=trampoline&brand=BERG" },
      { label: "Jump'In", href: "/boutique?category=trampoline&brand=Jump%27In" },
      { label: "Springfree", href: "/boutique?category=trampoline&brand=Springfree" },
    ]
  },
  {
    label: "Consoles",
    slug: "consoles",
    href: "/boutique?category=consoles",
    brands: [
      { label: "Sony PlayStation", href: "/boutique?category=consoles&brand=Sony" },
      { label: "Microsoft Xbox", href: "/boutique?category=consoles&brand=Microsoft" },
      { label: "Nintendo", href: "/boutique?category=consoles&brand=Nintendo" },
    ]
  },
  {
    label: "Accessoires",
    slug: "accessoires",
    href: "/boutique?category=accessoires",
    brands: [
      { label: "Sony", href: "/boutique?category=accessoires&brand=Sony" },
      { label: "Razer", href: "/boutique?category=accessoires&brand=Razer" },
      { label: "Corsair", href: "/boutique?category=accessoires&brand=Corsair" },
      { label: "Logitech", href: "/boutique?category=accessoires&brand=Logitech" },
    ]
  }
];

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
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

  const toggleMobileCat = (slug: string) => {
    if (expandedMobileCat === slug) {
      setExpandedMobileCat(null);
    } else {
      setExpandedMobileCat(slug);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1B1B2F] text-white shadow-lg">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <motion.div 
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,107,53,0.5)]"
          >
            <Sparkles className="text-white" size={24} />
          </motion.div>
          <span className="text-2xl font-black font-display tracking-tight hidden sm:inline">
            Appiotti <span className="text-brand-yellow">Game Shop</span>
          </span>
          <span className="text-2xl font-black font-display tracking-tight sm:hidden">
            Appiotti
          </span>
        </Link>

        {/* Desktop Navigation (inspired by Freizeitshop24) */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-3 text-xs xl:text-sm font-black uppercase tracking-wider text-brand-cream/80 ml-4 mr-auto">
          {navigationMenu.map((cat) => (
            <div key={cat.slug} className="relative group">
              <Link 
                to={cat.href} 
                className="flex items-center gap-1 py-7 px-2.5 hover:text-brand-orange transition-colors"
              >
                <span>{cat.label}</span>
                <ChevronDown size={10} className="transition-transform duration-300 group-hover:rotate-180 opacity-70" />
              </Link>
              
              {/* Dropdown Menu (on hover) */}
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-0 w-[280px] rounded-b-3xl border border-white/10 bg-[#1B1B2F]/95 p-4 text-left shadow-2xl backdrop-blur-xl group-hover:pointer-events-auto group-hover:block hidden">
                <div className="flex flex-col">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-brand-orange border-b border-white/5 pb-1.5">Nos Marques</p>
                  <div className="space-y-1">
                    {cat.brands.map((brand) => (
                      <Link
                        key={brand.label}
                        to={brand.href}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-brand-cream/90 hover:bg-white/5 hover:text-brand-orange transition-all"
                      >
                        <span>{brand.label}</span>
                        <span className="text-[10px] text-brand-orange/50">→</span>
                      </Link>
                    ))}
                  </div>
                  
                  {/* View All category link */}
                  <Link
                    to={cat.href}
                    className="mt-4 text-center rounded-xl bg-brand-orange px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-white hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-lg shadow-brand-orange/20"
                  >
                    Voir Tout {cat.label}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          <Link to="/a-propos" className="py-7 px-2.5 hover:text-brand-orange transition-colors text-brand-cream/60 font-medium">L'Entreprise</Link>
          <Link to="/contact" className="py-7 px-2.5 hover:text-brand-orange transition-colors text-brand-cream/60 font-medium">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex relative bg-white/10 rounded-full px-4 py-1.5 items-center gap-3 border border-white/20 text-sm focus-within:bg-white/20 transition-all focus-within:border-brand-orange/50 group">
             <button type="submit" className="text-white/40 group-focus-within:text-brand-orange transition-colors">
               <Search size={16} />
             </button>
             <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder:text-white/40 font-bold w-32 xl:w-48 transition-all"
             />
          </form>

          {/* Cart & User Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/panier" className="relative p-2.5 hover:bg-white/10 rounded-full transition-all group">
              <ShoppingCart size={22} className="group-hover:text-brand-orange transition-colors" />
              {itemCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={itemCount}
                  className="absolute top-1 right-1 bg-brand-orange text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {user && (
              <Link 
                to="/client/dashboard" 
                className="relative p-2.5 hover:bg-white/10 rounded-full transition-all group"
                title="Ma Liste de Souhaits"
              >
                <Heart size={22} className="group-hover:text-brand-orange transition-colors" />
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {user.isAdmin && (
                  <Link to="/admin/dashboard" title="Dashboard Admin" className="p-2 hover:bg-white/10 rounded-full text-brand-yellow">
                    <LayoutDashboard size={22} />
                  </Link>
                )}
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <Link to="/client/dashboard" className="text-[10px] font-black text-brand-yellow tracking-widest uppercase hover:text-brand-orange transition-colors">Mon Espace</Link>
                  <button onClick={handleLogout} className="text-[9px] uppercase tracking-tighter hover:text-brand-orange flex items-center gap-1 opacity-50">
                    Déconnexion
                  </button>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-orange to-brand-yellow flex items-center justify-center font-black shadow-lg text-brand-dark text-xs border border-white/20">
                  {user.firstName[0]}
                </div>
              </div>
            ) : (
              <Link to="/connexion" className="p-2.5 hover:bg-white/10 rounded-full transition-all group" title="Connexion">
                <User size={22} className="group-hover:text-brand-orange transition-colors" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-all" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            className="lg:hidden bg-[#1B1B2F] border-t border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-5 text-lg font-bold">
              {/* Search in Mobile */}
              <form onSubmit={handleSearch} className="relative bg-white/5 rounded-2xl p-3 flex items-center gap-3 border border-white/10">
                <Search size={20} className="text-brand-orange" />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white placeholder:text-white/40 font-black w-full text-base"
                />
              </form>
              
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors py-1">Accueil</Link>
              
              {/* Categories Accordions (inspired by Freizeitshop24 mobile) */}
              <div className="flex flex-col gap-3 py-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">Nos Univers</p>
                {navigationMenu.map((cat) => (
                  <div key={`mobile-cat-${cat.slug}`} className="border-b border-white/5 pb-2">
                    <button 
                      onClick={() => toggleMobileCat(cat.slug)}
                      className="w-full flex items-center justify-between text-base text-brand-cream/90 hover:text-brand-orange py-1"
                    >
                      <span>{cat.label}</span>
                      {expandedMobileCat === cat.slug ? <ChevronUp size={16} className="text-brand-orange" /> : <ChevronDown size={16} />}
                    </button>
                    
                    <AnimatePresence>
                      {expandedMobileCat === cat.slug && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-4 mt-2 space-y-2 overflow-hidden flex flex-col border-l border-brand-orange/20"
                        >
                          {cat.brands.map((brand) => (
                            <Link
                              key={`mobile-brand-${brand.label}`}
                              to={brand.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="text-sm text-brand-cream/70 hover:text-brand-orange py-1.5 uppercase font-medium tracking-wide"
                            >
                              {brand.label}
                            </Link>
                          ))}
                          <Link 
                            to={cat.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-xs font-black text-brand-orange hover:text-brand-yellow uppercase tracking-widest pt-2"
                          >
                            Voir tout {cat.label} →
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              
              <Link to="/a-propos" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors py-1">L'Entreprise</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="hover:text-brand-orange transition-colors py-1">Contact</Link>

              {user && (
                <Link to="/client/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 hover:text-brand-orange transition-colors py-1 border-t border-white/5 pt-3">
                  <Heart size={20} className="text-brand-orange" />
                  <span>Favoris</span>
                </Link>
              )}
              
              {!user ? (
                <Link to="/connexion" onClick={() => setIsMenuOpen(false)} className="text-brand-orange py-1">Connexion</Link>
              ) : (
                <div className="border-t border-white/5 pt-3 flex flex-col gap-3">
                  <Link to="/client/dashboard" onClick={() => setIsMenuOpen(false)} className="text-brand-yellow py-1">Mon Espace Client</Link>
                  {user.isAdmin && <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="text-brand-orange py-1">Dashboard Admin</Link>}
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-400 py-1">Déconnexion</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck, Star, Users, Phone, Loader2, Gamepad2, Trophy, Zap, CircleDot, Orbit, Headset, Sparkles, Timer, Mail, MapPin } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ProductCard from "../components/ProductCard";
import { BabyFootIcon, PingPongIcon, BillardIcon, TrampolineIcon, AccessoriesIcon, ConsoleIcon } from "../components/CategoryIcons";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.slice(0, 8)); // Just top 8
        setLoading(false);
      });
  }, []);

  const categories = [
    { name: "Baby-Foot", slug: "baby-foot", icon: <BabyFootIcon className="w-8 h-8" />, image: "/images/categories/baby-foot.jpg", count: 12, gradient: "from-[#FF6B35] to-[#FF8C42]" },
    { name: "Tennis de Table", slug: "ping-pong", icon: <PingPongIcon className="w-8 h-8" />, image: "/images/categories/tennis-de-table.jpg", count: 10, gradient: "from-[#06D6A0] to-[#0EA5E9]" },
    { name: "Billard", slug: "billard", icon: <BillardIcon className="w-8 h-8" />, image: "/images/categories/billard.jpg", count: 8, gradient: "from-[#1B1B2F] to-[#3D3D6B]" },
    { name: "Trampoline", slug: "trampoline", icon: <TrampolineIcon className="w-8 h-8" />, image: "/images/categories/trampoline.jpg", count: 14, gradient: "from-[#FFD23F] to-[#FF6B35]" },
    { name: "Accessoires", slug: "accessoires", icon: <AccessoriesIcon className="w-8 h-8" />, image: "/images/categories/accessoires.jpg", count: 12, gradient: "from-[#06D6A0] to-[#7B2FBE]" },
    { name: "Consoles", slug: "consoles", icon: <ConsoleIcon className="w-8 h-8" />, image: "/images/categories/consoles.jpg", count: 6, gradient: "from-[#7B2FBE] to-[#1B1B2F]" },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* 4.1 Hero Banner */}
      <section ref={heroRef} className="relative h-[650px] flex items-center justify-between overflow-hidden bg-brand-dark p-8 lg:p-20 text-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-bg.jpg" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-70 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-brand-dark/20 to-transparent" />
        </div>

        <div className="z-10 max-w-2xl">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block bg-brand-orange/20 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-brand-orange/30 text-brand-orange"
          >
            ÉDITION LIMITÉE ÉTÉ 2025
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] font-display uppercase tracking-tighter"
          >
            LE PARADIS <br /><span className="text-brand-orange">DU JEU</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-medium text-brand-cream/70 mb-10 leading-snug max-w-lg"
          >
            Tout pour des vacances et une maison en fête ! Livraison rapide et service client local basé en Charente.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/boutique" className="bg-brand-orange text-white px-10 py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl shadow-brand-orange/20 text-lg uppercase tracking-widest">
              Catalogue
            </Link>
            <Link to="/boutique?badge=PROMO" className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-2xl font-black text-white border border-white/20 shadow-xl hover:scale-105 transition-transform text-lg uppercase tracking-widest">
              Offres Flash
            </Link>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 h-[80%] w-[45%] items-center justify-center pointer-events-none"
        >
          <div className="relative w-full h-full rounded-[48px] overflow-hidden border-8 border-white/10 rotate-3 shadow-2xl">
             <img 
               src="/images/gaming-scene.jpg" 
               className="w-full h-full object-cover"
               alt="Gaming"
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 bg-brand-orange/20 mix-blend-overlay" />
          </div>
          <div className="absolute -bottom-10 -left-10 bg-brand-yellow p-8 rounded-[32px] shadow-2xl -rotate-6">
             <Sparkles size={48} className="text-brand-dark" />
          </div>
        </motion.div>
      </section>

      {/* 4.2 Nos 6 Univers - Main Categories Section */}
      <section className="py-24 bg-white relative">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-0 w-full h-[800px] bg-brand-cream/30 -skew-y-3 -translate-y-48" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-12 h-[2px] bg-brand-orange" />
              <span className="text-brand-orange font-black uppercase tracking-[0.5em] text-[10px]">La Collection Appiotti</span>
              <div className="w-12 h-[2px] bg-brand-orange" />
            </motion.div>
            <h2 className="text-5xl md:text-8xl font-black text-brand-dark font-display uppercase tracking-tighter text-center leading-[0.9]">
              Explorez <br /><span className="text-brand-orange">Nos Univers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 50 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Link to={`/boutique?category=${cat.slug}`} className="group relative block h-[550px] rounded-[60px] overflow-hidden shadow-2xl transition-all duration-500">
                  {/* Category Image */}
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-40 group-hover:opacity-50 transition-opacity`} />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-12 z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center text-white mb-8 border border-white/20 group-hover:bg-brand-orange group-hover:border-brand-orange transition-all duration-500 shadow-2xl group-hover:rotate-12">
                       {cat.icon}
                    </div>
                    <span className="text-brand-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-0 group-hover:opacity-100 transition-all duration-700">Découvrir</span>
                    <h3 className="text-4xl md:text-5xl font-black text-white mb-3 font-display tracking-tight uppercase leading-none">{cat.name}</h3>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-10">{cat.count} articles premium</p>
                    
                    <div className="w-full bg-white text-brand-dark py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] group-hover:bg-brand-orange group-hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3">
                      Entrer dans l'univers <ArrowRight size={16} />
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/40 group-hover:bg-brand-orange group-hover:text-white group-hover:border-transparent transition-all">
                    <Orbit size={24} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4.3 Produits à la Une */}
      <section id="promos" className="py-24 bg-white relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange rounded-full blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-yellow rounded-full blur-[100px] opacity-10 translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4 font-display uppercase tracking-tighter">
                Coups de <span className="text-brand-orange">Cœur</span>
              </h2>
              <p className="text-xl text-gray-500 font-medium">Sélection spéciale été — nos produits les plus populaires</p>
            </div>
            <Link to="/boutique" className="text-brand-orange font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform bg-brand-orange/10 px-6 py-3 rounded-full border border-brand-orange/20">
              Voir tout le catalogue <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-brand-orange" size={48} />
              <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Chargement des pépites...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4.5 Pourquoi Appiotti? */}
      <section className="py-24 bg-brand-dark text-white overflow-hidden">
        <div className="container mx-auto px-4 text-center mb-20 px-8">
           <h2 className="text-4xl md:text-6xl font-black mb-4 font-display uppercase tracking-tighter">L'expérience <span className="text-brand-orange">Appiotti</span></h2>
           <p className="text-brand-cream/50 font-medium max-w-2xl mx-auto uppercase tracking-widest text-xs">Pourquoi nous faire confiance pour vos loisirs ?</p>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Truck size={32} />, title: "Livraison 48h", desc: "Expédition rapide, livraison offerte dès 100€ d'achat.", color: "text-brand-orange" },
              { icon: <ShieldCheck size={32} />, title: "Sécurité Totale", desc: "Virement bancaire direct, transparent et hautement sécurisé.", color: "text-brand-green" },
              { icon: <Star size={32} />, title: "Qualité Premium", desc: "Chaque produit est personnellement testé par Hervé.", color: "text-brand-yellow" },
              { icon: <Phone size={32} />, title: "Support Local", desc: "Besoin d'aide ? Nous sommes basés à Saint-Sornin en Charente.", color: "text-sky-400" },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center text-center p-10 rounded-[40px] bg-white/5 border border-white/5 hover:bg-white/10 transition-all hover:border-white/10"
              >
                <div className={`mb-8 p-5 bg-white/5 rounded-3xl shadow-xl ${item.color}`}>{item.icon}</div>
                <h4 className="text-xl font-black mb-4 font-display uppercase tracking-tight">{item.title}</h4>
                <p className="text-brand-cream/60 leading-relaxed text-sm font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4.6 Flash Sale Banner */}
      <section className="py-12 bg-gradient-to-r from-brand-orange to-brand-yellow relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
          <div className="text-brand-dark flex flex-col md:flex-row items-center gap-6">
            <div className="p-5 bg-white/30 backdrop-blur-md rounded-[32px] border border-white/40">
               <Timer size={48} className="text-brand-dark" />
            </div>
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-2 uppercase tracking-tighter leading-none">
                VENTE FLASH ÉTÉ
              </h2>
              <p className="text-xl font-bold opacity-80 uppercase tracking-widest text-xs">Jusqu'à -20% sur les équipements Premium</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="bg-brand-dark text-white p-6 rounded-3xl shadow-2xl min-w-[240px]">
               <div className="text-[10px] font-black uppercase mb-2 tracking-[0.3em] text-brand-yellow text-center">Fin de l'offre dans :</div>
               <div className="text-4xl font-black font-mono tracking-tighter text-center">71:59:59</div>
            </div>
            <Link to="/boutique?category=trampoline" className="bg-brand-dark text-white px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-transform shadow-2xl">
               Profiter de l'offre
            </Link>
          </div>
        </div>
      </section>

      {/* 4.7 Newsletter */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-[64px] p-12 md:p-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden border border-brand-yellow/10 text-center">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-orange to-brand-yellow" />
             
                 <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-brand-orange/20 backdrop-blur-md rounded-[32px] flex items-center justify-center text-brand-orange">
                       <Sparkles size={48} />
                    </div>
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black text-brand-dark mb-6 font-display uppercase tracking-tighter">
                    Restez dans la partie !
                 </h2>
             <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto font-medium">
                Inscrivez-vous à notre newsletter et recevez nos offres exclusives, nouveautés et bons plans directement dans votre boîte mail.
             </p>

             <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Votre adresse email..." 
                  className="flex-grow bg-gray-50 border-2 border-gray-100 px-8 py-5 rounded-[24px] focus:outline-none focus:border-brand-orange transition-colors font-bold text-xs"
                />
                <button className="bg-brand-dark text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-brand-orange transition-all shadow-xl shadow-brand-dark/10">
                   S'abonner
                </button>
             </form>
          </div>
        </div>
      </section>
    </div>
  );
}

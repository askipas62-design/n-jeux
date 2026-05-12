import { motion } from "motion/react";
import { History, Award, Heart, ShieldCheck, MapPin, Users } from "lucide-react";

export default function About() {
  return (
    <div className="bg-brand-cream min-h-screen">
      {/* Hero */}
      <section className="bg-brand-dark text-white py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-orange rounded-full blur-[200px] opacity-10 -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-8xl font-black mb-8 font-display uppercase tracking-tighter"
          >
            Notre <span className="text-brand-orange">Histoire</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Depuis 2016, Appiotti Game Shop apporte de la joie et du divertissement dans vos espaces de vie.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                 <div className="inline-block bg-brand-orange/10 px-4 py-1 rounded-full text-brand-orange font-black text-xs uppercase tracking-widest">L'excellence de proximité</div>
                 <h2 className="text-4xl md:text-6xl font-black text-brand-dark font-display leading-tight">
                    Plus qu'une boutique, une passion <span className="text-brand-yellow">partagée</span>.
                 </h2>
                 <p className="text-xl text-gray-500 leading-relaxed font-medium italic border-l-8 border-brand-yellow pl-8">
                    "Nous croyons que le jeu est le moteur de la convivialité. Un baby-foot en terrasse ou une partie de ping-pong au soleil crée des souvenirs impérissables."
                 </p>
                 <p className="text-lg text-gray-500 leading-relaxed font-medium">
                    Fondé par Hervé APPIOTTI en 2016 à Saint-Sornin, notre shop est né d'une volonté simple : offrir des équipements de loisirs de haute qualité, testés et approuvés par des experts, avec un service humain et transparent.
                 </p>
              </motion.div>
              
              <div className="grid grid-cols-2 gap-6">
                 {[
                   { icon: <History size={32} />, title: "Établi en 2016", color: "bg-brand-orange" },
                   { icon: <ShieldCheck size={32} />, title: "Confiance Totale", color: "bg-brand-green" },
                   { icon: <Heart size={32} />, title: "Passion Hobby", color: "bg-red-500" },
                   { icon: <Award size={32} />, title: "Qualité Pro", color: "bg-brand-yellow" }
                 ].map((item, i) => (
                   <motion.div 
                     key={i}
                     whileHover={{ y: -10 }}
                     className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100 flex flex-col items-center text-center group"
                   >
                      <div className={`p-4 rounded-2xl ${item.color} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                         {item.icon}
                      </div>
                      <h4 className="font-black text-brand-dark font-display uppercase text-sm tracking-widest">{item.title}</h4>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Team/Location */}
      <section className="py-24 bg-brand-dark text-white">
        <div className="container mx-auto px-4">
           <div className="bg-white/5 rounded-[64px] p-12 md:p-24 border border-white/10 flex flex-col md:flex-row gap-16 items-center">
              <div className="md:w-1/3">
                 <div className="w-64 h-64 bg-brand-orange rounded-[64px] shadow-2xl relative overflow-hidden group border-4 border-white">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800" 
                      alt="Hervé Appiotti" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                 </div>
              </div>
              <div className="md:w-2/3 space-y-6">
                 <h3 className="text-4xl font-black font-display uppercase tracking-widest text-brand-orange">Hervé APPIOTTI</h3>
                 <p className="text-xs font-bold text-brand-yellow uppercase tracking-[0.3em]">Fondateur & Propriétaire</p>
                 <p className="text-lg text-gray-400 leading-relaxed font-medium">
                    Entrepreneur passionné par l'univers du jeu et du commerce de proximité, Hervé gère Appiotti Game Shop avec un souci constant de la satisfaction client. Basé au cœur de la Charente, il sélectionne personnellement chaque référence de consoles et de jeux de plein air.
                 </p>
                 <div className="flex flex-wrap gap-8 pt-8">
                    <div className="flex items-center gap-3">
                       <MapPin className="text-brand-orange" />
                       <span className="font-bold">Saint-Sornin, France</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Users className="text-brand-green" />
                       <span className="font-bold">+5000 clients heureux</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}

import { Link } from "react-router-dom";
import { ShieldCheck, Truck } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-brand-cream px-8 py-10 flex-shrink-0 flex flex-col md:flex-row items-center justify-between border-t border-white/10 gap-8">
      <div className="text-[10px] leading-tight opacity-70 text-center md:text-left">
        <strong className="text-brand-orange uppercase">MONSIEUR HERVÉ APPIOTTI / Appiotti Jeux</strong><br />
        820 116 291 00023 | TVA FR48820116291<br />
        18 Route de Marillac, 16220 Saint-Sornin, France
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-10 text-[11px] font-black uppercase tracking-widest">
        <Link to="/securite-virement" className="flex items-center gap-3 text-brand-green hover:text-brand-orange hover:scale-105 transition-all">
          <ShieldCheck size={18} /> PAIEMENT VIREMENT SÉCURISÉ
        </Link>
        <Link to="/cgv#livraison" className="flex items-center gap-3 text-brand-cream/90 hover:text-brand-yellow hover:scale-105 transition-all">
          <Truck size={18} /> LIVRAISON 48H
        </Link>
        <Link to="/securite-virement" className="px-6 py-2.5 bg-brand-orange text-white rounded-xl hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-lg shadow-brand-orange/10">
          POURQUOI UN VIREMENT ?
        </Link>
      </div>

      <div className="flex gap-8 text-sm font-bold">
        <Link to="/mentions-legales" className="text-brand-cream/60 hover:text-brand-orange transition-all border-b border-transparent hover:border-brand-orange">Mentions Légales</Link>
        <Link to="/cgv" className="text-brand-cream/60 hover:text-brand-orange transition-all border-b border-transparent hover:border-brand-orange">CGV</Link>
        <span className="opacity-40 cursor-default font-medium">© 2016-{currentYear}</span>
      </div>
    </footer>
  );
}

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

      <div className="flex flex-col sm:flex-row items-center gap-8 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2 text-brand-green">
          <ShieldCheck size={16} /> PAIEMENT VIREMENT SÉCURISÉ
        </div>
        <div className="flex items-center gap-2 opacity-80">
          <Truck size={16} /> LIVRAISON 48H
        </div>
      </div>

      <div className="flex gap-6 text-xs font-medium">
        <Link to="/mentions-legales" className="opacity-60 hover:opacity-100 hover:text-brand-orange transition-all">Mentions Légales</Link>
        <Link to="/cgv" className="opacity-60 hover:opacity-100 hover:text-brand-orange transition-all">CGV</Link>
        <span className="opacity-40 cursor-default">© 2016-{currentYear}</span>
      </div>
    </footer>
  );
}

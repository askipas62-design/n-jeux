import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Mail, Phone, MapPin, CreditCard, RefreshCcw } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-brand-cream border-t border-white/10 pt-12 md:pt-16 pb-6 md:pb-8">
      <div className="container mx-auto px-4 md:px-8">
        {/* Brand Section - Full width on mobile */}
        <div className="flex flex-col gap-4 md:gap-6 mb-10 md:mb-16">
          <Link to="/" className="text-2xl font-black font-display tracking-tight">
            Appiotti <span className="text-brand-orange">Game Shop</span>
          </Link>
          <div className="text-sm opacity-70 flex flex-col gap-2 md:gap-3 font-medium">
            <p className="flex items-start gap-2">
              <MapPin size={16} className="text-brand-orange shrink-0 mt-0.5" />
              <span>18 Route de Marillac, 16220 Saint-Sornin, France</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="text-brand-orange shrink-0" />
              <span>+33 7 57 84 75 08</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} className="text-brand-orange shrink-0" />
              <a href="mailto:info@appiotti-jeux.com" className="hover:text-brand-orange transition-all">info@appiotti-jeux.com</a>
            </p>

          </div>
        </div>

        {/* Links Sections - 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-16">
          {/* Boutique Navigation */}
          <div>
            <h4 className="text-brand-orange font-black uppercase tracking-widest text-[10px] md:text-sm mb-3 md:mb-6">Boutique</h4>
            <ul className="flex flex-col gap-2 md:gap-4 text-xs md:text-sm font-bold opacity-80">
              <li><Link to="/boutique" className="hover:text-brand-orange transition-all">Tous les produits</Link></li>
              <li><Link to="/boutique?category=baby-foot" className="hover:text-brand-orange transition-all">Baby-foot</Link></li>
              <li><Link to="/boutique?category=ping-pong" className="hover:text-brand-orange transition-all">Ping-Pong / Tennis de table</Link></li>
              <li><Link to="/boutique?category=billard" className="hover:text-brand-orange transition-all">Billards</Link></li>
              <li><Link to="/boutique?category=trampoline" className="hover:text-brand-orange transition-all">Trampolines</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-brand-orange font-black uppercase tracking-widest text-[10px] md:text-sm mb-3 md:mb-6">Aide & Service</h4>
            <ul className="flex flex-col gap-2 md:gap-4 text-xs md:text-sm font-bold opacity-80">
              <li><Link to="/securite-virement" className="hover:text-brand-orange transition-all">Paiements</Link></li>
              <li><Link to="/cgv#livraison" className="hover:text-brand-orange transition-all">Suivi de Livraison</Link></li>
              <li><Link to="/contact" className="hover:text-brand-orange transition-all">Contactez Hervé</Link></li>
              <li><Link to="/faq" className="hover:text-brand-orange transition-all">FAQ</Link></li>
              <li><Link to="/boutique" className="hover:text-brand-orange transition-all">Nouveautés</Link></li>
            </ul>
          </div>

          {/* Legal Information */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="text-brand-orange font-black uppercase tracking-widest text-[10px] md:text-sm mb-3 md:mb-6">Informations</h4>
            <ul className="flex flex-col gap-2 md:gap-4 text-xs md:text-sm font-bold opacity-80">
              <li><Link to="/mentions-legales" className="hover:text-brand-orange transition-all">Mentions Légales</Link></li>
              <li><Link to="/cgv" className="hover:text-brand-orange transition-all">CGV</Link></li>
              <li><Link to="/politique-de-confidentialite" className="hover:text-brand-orange transition-all">Confidentialité</Link></li>
              <li><Link to="/cookies" className="hover:text-brand-orange transition-all">Cookies</Link></li>
              <li><Link to="/retour-colis" className="hover:text-brand-orange transition-all">Retours</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 md:gap-6 py-6 md:py-8 border-y border-white/5 mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 bg-white/5 p-3 md:p-5 rounded-xl md:rounded-2xl">
            <div className="w-9 h-9 md:w-12 md:h-12 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] md:text-xs font-black uppercase tracking-tighter">Paiement Sécurisé</p>
              <p className="text-[9px] md:text-[10px] opacity-60">Virement Bancaire</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 bg-white/5 p-3 md:p-5 rounded-xl md:rounded-2xl">
            <div className="w-9 h-9 md:w-12 md:h-12 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow shrink-0">
              <Truck size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] md:text-xs font-black uppercase tracking-tighter">Expédition Express</p>
              <p className="text-[9px] md:text-[10px] opacity-60">Livraison en 48h</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 bg-white/5 p-3 md:p-5 rounded-xl md:rounded-2xl">
            <div className="w-9 h-9 md:w-12 md:h-12 bg-brand-orange/20 rounded-full flex items-center justify-center text-brand-orange shrink-0">
              <RefreshCcw size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] md:text-xs font-black uppercase tracking-tighter">Satisfait ou Remboursé</p>
              <p className="text-[9px] md:text-[10px] opacity-60">14 jours pour changer d'avis</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 opacity-60">
          <div className="text-[9px] md:text-[10px] leading-relaxed text-center md:text-left">
            <p className="font-black">MONSIEUR HERVÉ APPIOTTI / Appiotti Jeux</p>
            <p>SIRET 820 116 291 00023 | TVA FR48820116291</p>
            <p>© 2016-{currentYear} — Tous droits réservés.</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 border border-white/10 rounded-lg">
              <CreditCard size={12} />
              <span className="text-[8px] md:text-[10px] font-black uppercase whitespace-nowrap">Virement Bancaire</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 border border-white/10 rounded-lg">
              <ShieldCheck size={12} className="text-brand-green" />
              <span className="text-[8px] md:text-[10px] font-black uppercase whitespace-nowrap">SSL Sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

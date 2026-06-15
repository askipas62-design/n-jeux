import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Mail, Phone, MapPin, CreditCard, RefreshCcw } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-brand-cream border-t border-white/10 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Address Section */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="text-2xl font-black font-display tracking-tight">
              Appiotti <span className="text-brand-orange">Game Shop</span>
            </Link>
            <div className="text-sm opacity-70 flex flex-col gap-3 font-medium">
              <p className="flex items-start gap-2">
                <MapPin size={18} className="text-brand-orange shrink-0 mt-0.5" />
                <span>18 Route de Marillac<br />16220 Saint-Sornin, France</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={18} className="text-brand-orange shrink-0" />
                <span>+33 (0)5 45 61 72 83</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={18} className="text-brand-orange shrink-0" />
                <span>contact@appiotti-jeux.fr</span>
              </p>
            </div>
          </div>

          {/* Boutique Navigation */}
          <div>
            <h4 className="text-brand-orange font-black uppercase tracking-widest text-sm mb-6">Boutique</h4>
            <ul className="flex flex-col gap-4 text-sm font-bold opacity-80">
              <li><Link to="/boutique" className="hover:text-brand-orange transition-all">Tous les produits</Link></li>
              <li><Link to="/boutique?category=baby-foot" className="hover:text-brand-orange transition-all">Baby-foot</Link></li>
              <li><Link to="/boutique?category=ping-pong" className="hover:text-brand-orange transition-all">Ping-Pong / Tennis de table</Link></li>
              <li><Link to="/boutique?category=billard" className="hover:text-brand-orange transition-all">Billards</Link></li>
              <li><Link to="/boutique?category=trampoline" className="hover:text-brand-orange transition-all">Trampolines</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-brand-orange font-black uppercase tracking-widest text-sm mb-6">Aide & Service</h4>
            <ul className="flex flex-col gap-4 text-sm font-bold opacity-80">
              <li><Link to="/securite-virement" className="hover:text-brand-orange transition-all">Paiements</Link></li>
              <li><Link to="/cgv#livraison" className="hover:text-brand-orange transition-all">Suivi de Livraison</Link></li>
              <li><Link to="/contact" className="hover:text-brand-orange transition-all">Contactez Hervé</Link></li>
              <li><Link to="/faq" className="hover:text-brand-orange transition-all">Foire aux Questions</Link></li>
              <li><Link to="/boutique" className="hover:text-brand-orange transition-all">Nouveautés</Link></li>
            </ul>
          </div>

          {/* Legal Information */}
          <div>
            <h4 className="text-brand-orange font-black uppercase tracking-widest text-sm mb-6">Informations</h4>
            <ul className="flex flex-col gap-4 text-sm font-bold opacity-80">
              <li><Link to="/mentions-legales" className="hover:text-brand-orange transition-all">Mentions Légales</Link></li>
              <li><Link to="/cgv" className="hover:text-brand-orange transition-all">CGV</Link></li>
              <li><Link to="/politique-de-confidentialite" className="hover:text-brand-orange transition-all">Politique de Confidentialité</Link></li>
              <li><Link to="/cookies" className="hover:text-brand-orange transition-all">Gestion des Cookies</Link></li>
              <li><Link to="/retour-colis" className="hover:text-brand-orange transition-all">Retours & Remboursements</Link></li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-white/5 mb-8">
          <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl">
            <div className="w-12 h-12 bg-brand-green/20 rounded-full flex items-center justify-center text-brand-green shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter">Paiement Sécurisé</p>
              <p className="text-[10px] opacity-60">Virement Bancaire</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl">
            <div className="w-12 h-12 bg-brand-yellow/20 rounded-full flex items-center justify-center text-brand-yellow shrink-0">
              <Truck size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter">Expédition Express</p>
              <p className="text-[10px] opacity-60">Livraison en 48h par Colissimo</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl">
            <div className="w-12 h-12 bg-brand-orange/20 rounded-full flex items-center justify-center text-brand-orange shrink-0">
              <RefreshCcw size={24} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-tighter">Satisfait ou Remboursé</p>
              <p className="text-[10px] opacity-60">14 jours pour changer d'avis</p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <div className="text-[10px] leading-relaxed text-center md:text-left">
            <p><strong>MONSIEUR HERVÉ APPIOTTI / Appiotti Jeux</strong></p>
            <p>SIRET 820 116 291 00023 | TVA FR48820116291</p>
            <p>© 2016-{currentYear} — Tous droits réservés.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-lg">
              <CreditCard size={14} />
              <span className="text-[10px] font-black uppercase">Virement Bancaire</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-lg">
              <ShieldCheck size={14} className="text-brand-green" />
              <span className="text-[10px] font-black uppercase">SSL Sécurisé</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

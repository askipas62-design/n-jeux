import { ShieldCheck, TrendingDown, Clock, MousePointer2, UserCheck, HeartHandshake, PhoneCall, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SafetyAndPayment() {
  const reasons = [
    {
      icon: <ShieldCheck size={32} className="text-brand-green" />,
      title: "Sécurité à 100%",
      desc: "Contrairement aux cartes bancaires, le virement est une transaction interbancaire directe. Aucun risque de piratage de vos données de carte sur notre site ou pendant le transfert."
    },
    {
      icon: <TrendingDown size={32} className="text-brand-orange" />,
      title: "Zéro frais de transaction",
      desc: "Les processeurs de paiement (Stripe, PayPal) prennent entre 2% et 4% de commission. En supprimant ces intermédiaires, nous pouvons vous proposer les prix les plus bas du marché."
    },
    {
      icon: <UserCheck size={32} className="text-brand-yellow" />,
      title: "Un lien direct avec Hervé",
      desc: "Chaque preuve de virement est vérifié manuellement par nos soins."
    },
    {
      icon: <HeartHandshake size={32} className="text-brand-green" />,
      title: "Indépendance et Éthique",
      desc: "Nous ne dépendons pas des géants du paiement américains. Nous privilégions le circuit court bancaire européen pour une gestion plus saine et transparente."
    },
    {
      icon: <Clock size={32} className="text-sky-500" />,
      title: "Réservation prioritaire",
      desc: "Dès que vous validez votre commande par virement, l'article est réservé pendant 72h. Vous avez l'esprit tranquille le temps de valider l'opération auprès de votre banque."
    },
    {
      icon: <PhoneCall size={32} className="text-brand-orange" />,
      title: "Accompagnement VIP",
      desc: "Si vous avez la moindre question lors de votre virement, nous sommes joignables directement par téléphone pour vous guider pas à pas."
    }
  ];

  return (
    <div className="bg-brand-cream min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/paiement" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand-orange transition-colors mb-12">
          <ArrowLeft size={16} /> Retour au paiement
        </Link>

        <div className="text-center mb-20">
          <h1 className="text-3xl md:text-8xl font-black text-brand-dark mb-4 md:mb-6 font-display uppercase tracking-tighter"
          >
            Pourquoi le <span className="text-brand-orange">Virement ?</span>
          </h1>
          <div className="w-16 md:w-24 h-1 bg-brand-orange mx-auto mb-6 md:mb-8" />
          <p className="text-sm md:text-xl text-gray-500 font-medium">Chez Appiotti, la confiance n'est pas un slogan, c'est un engagement personnel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {reasons.map((r, i) => (
            <div 
              key={i}
              className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[48px] shadow-2xl border border-gray-100 hover:border-brand-orange/20 transition-all group"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                {r.icon}
              </div>
              <h3 className="text-lg md:text-2xl font-black text-brand-dark mb-2 md:mb-4 font-display uppercase tracking-tight">{r.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-dark text-white p-6 md:p-20 rounded-[32px] md:rounded-[64px] shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange rounded-full blur-[100px] opacity-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-yellow rounded-full blur-[100px] opacity-10" />
          
          <h2 className="text-2xl md:text-5xl font-black mb-6 md:mb-8 font-display uppercase tracking-tight relative z-10">Une question ? Un doute ?</h2>
          <p className="text-gray-400 text-sm md:text-lg mb-8 md:mb-12 relative z-10">Je suis disponible personnellement pour vous rassurer sur notre processus.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 relative z-10">
            <a href="tel:+33757847508" className="w-full sm:w-auto bg-brand-orange text-white px-8 md:px-10 py-4 md:py-6 rounded-[20px] md:rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-brand-yellow hover:text-brand-dark transition-all shadow-xl text-center">
              Appeler Hervé
            </a>
            <Link to="/contact" className="w-full sm:w-auto bg-white/10 text-white px-8 md:px-10 py-4 md:py-6 rounded-[20px] md:rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all text-center">
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

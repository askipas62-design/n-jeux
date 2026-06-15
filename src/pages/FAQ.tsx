import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Pourquoi seulement le virement bancaire ?",
    a: "Le virement bancaire nous permet de réduire les frais de transaction élevés des banques traditionnelles et des plateformes comme PayPal, ce qui nous permet de vous proposer des prix défiant toute concurrence sur nos produits Pokémon et jeux de société."
  },
  {
    q: "Combien de temps prend la livraison ?",
    a: "Nous expédions généralement sous 24h après réception du virement. La livraison Colissimo prend ensuite 48h ouvrées pour arriver chez vous."
  },
  {
    q: "Les cartes Pokémon sont-elles authentiques ?",
    a: "Oui, à 100%. Tous nos produits proviennent de distributeurs officiels. Nous sommes des passionnés avant tout et nous luttons contre la contrefaçon."
  },
  {
    q: "Puis-je annuler ma commande ?",
    a: "Tant que le virement n'a pas été validé et le colis expédié, vous pouvez annuler votre commande en nous contactant directement."
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange mx-auto mb-6"
          >
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight mb-4">Foire aux Questions</h1>
          <p className="text-gray-600 font-medium font-mono uppercase text-sm tracking-widest">Tout ce que vous devez savoir</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white border-4 border-brand-dark rounded-2xl p-6 shadow-[8px_8px_0px_#1B1B2F] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <h3 className="text-xl font-black text-brand-dark flex items-center justify-between gap-4 mb-4">
                {faq.q}
                <ChevronDown size={20} className="text-brand-orange" />
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center bg-brand-dark text-white p-10 rounded-3xl">
          <h2 className="text-2xl font-black mb-4 uppercase">Encore des questions ?</h2>
          <p className="text-brand-cream/70 mb-8 font-medium">Hervé est à votre disposition pour vous répondre directement.</p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-brand-orange text-white font-black uppercase tracking-widest rounded-xl hover:bg-brand-yellow hover:text-brand-dark transition-all transform hover:scale-105"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
}

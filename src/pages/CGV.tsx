export default function CGV() {
  return (
    <div className="bg-[#FFF8F0] min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-[48px] p-12 md:p-20 shadow-2xl border border-gray-100 prose prose-slate max-w-none">
          <h1 className="text-4xl md:text-6xl font-black text-[#1B1B2F] mb-12 font-['Fredoka_One'] uppercase leading-tight">
            Conditions Générales de Vente
          </h1>
          
          <div className="space-y-12 text-gray-600 font-medium leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-black text-[#FF6B35] font-['Fredoka_One']">1. Objet</h2>
              <p>
                Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre <strong>Appiotti Game Shop</strong> (géré par MONSIEUR HERVÉ APPIOTTI) et ses clients pour tout achat effectué sur le site web.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-[#FF6B35] font-['Fredoka_One']">2. Produits</h2>
              <p>
                Les produits proposés sont ceux qui figurent dans le catalogue publié sur le site. Chaque produit est accompagné d'un descriptif. Les photographies du catalogue sont les plus fidèles possibles mais ne peuvent assurer une similitude parfaite avec le produit offert.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-[#FF6B35] font-['Fredoka_One']">3. Tarifs</h2>
              <p>
                Les prix figurant dans le catalogue sont des prix TTC en euro tenant compte de la TVA applicable au jour de la commande. Tout changement du taux pourra être répercuté sur le prix des produits.
              </p>
            </section>

            <section className="space-y-4 p-8 bg-[#1B1B2F] text-white rounded-3xl border-l-8 border-[#FFD23F] shadow-xl">
              <h2 className="text-2xl font-black text-[#FFD23F] font-['Fredoka_One'] mb-6">4. Modalités de Paiement EXCLUSIF</h2>
              <p className="text-gray-300">
                <strong>IMPORTANT :</strong> Appiotti Game Shop accepte exclusivement les règlements par <strong>VIREMENT BANCAIRE</strong>. 
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-400">
                <li>La commande est validée après réception d'une preuve de virement.</li>
                <li>L'expédition n'a lieu qu'après réception effective des fonds sur le compte de l'entreprise.</li>
                <li>Le client dispose de 72h pour effectuer son virement avant annulation automatique de la commande.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-[#FF6B35] font-['Fredoka_One']">5. Livraison</h2>
              <p>
                Les livraisons sont faites à l'adresse indiquée dans le bon de commande. Les délais ne sont donnés qu'à titre indicatif (généralement 2 à 5 jours ouvrés après réception du paiement). La livraison est offerte dès 100€ d'achat TTC.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-[#FF6B35] font-['Fredoka_One']">6. Droit de rétractation</h2>
              <p>
                Conformément à l'article L121-20 du Code de la Consommation, l'acheteur dispose d'un délai de quatorze jours ouvrables à compter de la livraison de leur commande pour exercer son droit de rétractation et ainsi faire retour du produit au vendeur pour échange ou remboursement sans pénalité.
              </p>
            </section>

            <section className="space-y-4">
               <h2 className="text-2xl font-black text-[#FF6B35] font-['Fredoka_One']">7. Règlement des litiges</h2>
               <p>
                 Les présentes conditions de vente à distance sont soumises à la loi française. Pour tous litiges ou contentieux, le Tribunal compétent sera celui d'Angoulême.
               </p>
            </section>
          </div>

          <div className="mt-20 pt-8 border-t flex flex-col md:flex-row justify-between gap-6 opacity-50 italic text-[10px] uppercase">
             <span>Appiotti Game Shop - Hervé APPIOTTI</span>
             <span>Édition du 08 Mai 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

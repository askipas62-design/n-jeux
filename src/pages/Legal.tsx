export default function Legal() {
  return (
    <div className="bg-[#FFF8F0] min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-[48px] p-12 md:p-20 shadow-2xl border border-gray-100 prose prose-slate max-w-none">
          <h1 className="text-4xl md:text-6xl font-black text-[#1B1B2F] mb-12 font-['Fredoka_One']">Mentions Légales</h1>
          
          <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-black text-[#FF6B35]">Identification de l'entreprise</h2>
            <p className="font-medium text-gray-600 leading-relaxed">
              En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site <strong>Appiotti Game Shop</strong> l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
            </p>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li className="flex gap-4"><strong>Propriétaire :</strong> MONSIEUR HERVÉ APPIOTTI</li>
              <li className="flex gap-4"><strong>Nom commercial :</strong> Appiotti Game Shop / Appiotti Jeux</li>
              <li className="flex gap-4"><strong>Statut juridique :</strong> Entrepreneur individuel</li>
              <li className="flex gap-4"><strong>SIREN :</strong> 820 116 291</li>
              <li className="flex gap-4"><strong>SIRET :</strong> 820 116 291 00023</li>
              <li className="flex gap-4"><strong>N° TVA Intracommunautaire :</strong> FR48820116291</li>
              <li className="flex gap-4"><strong>Adresse :</strong> 18 Route de Marillac, 16220 Saint-Sornin, France</li>
            </ul>
          </section>

          <section className="space-y-6 mb-12">
            <h2 className="text-2xl font-black text-[#FF6B35]">Activité et Réglementation</h2>
            <ul className="space-y-4 text-gray-500 font-medium">
              <li className="flex gap-4"><strong>Date de création :</strong> 14 avril 2016</li>
              <li className="flex gap-4"><strong>Code APE/NAF :</strong> 4765Z (Commerce de détail de jeux et jouets en magasin spécialisé)</li>
              <li className="flex gap-4"><strong>Convention collective :</strong> Commerces de détail non alimentaire (1517)</li>
            </ul>
          </section>

          <section className="space-y-6 mb-12 text-gray-500 leading-relaxed">
            <h2 className="text-2xl font-black text-[#FF6B35]">Hébergement</h2>
            <p>
              Ce site est hébergé sur les infrastructures sécurisées de Google Cloud Run, opérées par Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande.
            </p>
          </section>

          <section className="space-y-6 text-gray-500 leading-relaxed">
            <h2 className="text-2xl font-black text-[#FF6B35]">Propriété Intellectuelle</h2>
            <p>
              Hervé APPIOTTI est propriétaire des droits de propriété intellectuelle ou détient les droits d'usage sur tous les éléments accessibles sur le site, notamment les textes, images, graphismes, logo, icônes, sons, logiciels. Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de : Hervé APPIOTTI.
            </p>
          </section>

          <div className="mt-20 pt-8 border-t flex items-center justify-between opacity-50">
             <span className="text-[10px] font-bold uppercase tracking-widest">Dernière mise à jour : 2025</span>
             <img src="/logo-small.png" alt="" className="h-8 grayscale" />
          </div>
        </div>
      </div>
    </div>
  );
}

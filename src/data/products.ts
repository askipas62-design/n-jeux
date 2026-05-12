export interface Product {
  id: string;
  name: string;
  category: string;
  priceHT: number;
  stock: number;
  badge?: string;
  rating: number;
  desc: string;
  image: string;
  dimensions?: string;
}

export const products: Product[] = [
  { id: "bf-1", name: "Baby-foot Classique 2 joueurs", category: "baby-foot", priceHT: 149, stock: 12, badge: "Bestseller", rating: 4.7, desc: "Barres métalliques chromées, terrain MDF, pieds antidérapants. Idéal pour débuter.", image: "/images/products/baby-foot-classique-2-joueurs.jpg", dimensions: "120 x 60 x 80 cm" },
  { id: "bf-2", name: "Baby-foot Professionnel 4 joueurs", category: "baby-foot", priceHT: 289, stock: 6, badge: "Premium", rating: 4.9, desc: "Structure acier renforcé, billes liège incluses, plateau verre trempé.", image: "/images/products/baby-foot-professionnel-4-joueurs.jpg", dimensions: "152 x 76 x 90 cm" },
  { id: "bf-3", name: "Baby-foot Compact Enfants", category: "baby-foot", priceHT: 89, stock: 18, badge: "Nouveau", rating: 4.5, desc: "Sécurisé, coins arrondis, couleurs vives, pieds stables (3-8 ans).", image: "/images/products/baby-foot-compact-enfants.jpg" },
  { id: "bf-4", name: "Baby-foot Pliable Extérieur", category: "baby-foot", priceHT: 199, stock: 8, badge: "Été", rating: 4.6, desc: "Résistant UV, pliable pour rangement facile, idéal terrasse/jardin.", image: "/images/products/baby-foot-pliable-exterieur.jpg", dimensions: "140 x 70 x 85 cm" },
  { id: "bf-5", name: "Kit Accessoires Baby-foot", category: "baby-foot", priceHT: 24.9, stock: 35, badge: "Accessoire", rating: 4.8, desc: "12 billes, 2 poignées de rechange, kit entretien + lubrifiant barres.", image: "/images/products/kit-accessoires-baby-foot.jpg" },
  { id: "bf-6", name: "Baby-foot Vintage Bois", category: "baby-foot", priceHT: 349, stock: 4, badge: "Édition Limitée", rating: 5.0, desc: "Design rétro en bois massif verni, joueurs peints à la main.", image: "/images/products/baby-foot-vintage-bois.jpg" },
  { id: "tp-1", name: "Table de Tennis Intérieur Standard", category: "ping-pong", priceHT: 229, stock: 10, badge: "Bestseller", rating: 4.6, desc: "Plateau 15mm, filet réglable inclus, pliable en 2 moitiés, roulettes.", image: "/images/products/table-de-tennis-interieur-standard.jpg", dimensions: "274 x 152.5 x 76 cm" },
  { id: "tp-2", name: "Table de Tennis Extérieur Premium", category: "ping-pong", priceHT: 349, stock: 5, badge: "Été", rating: 4.8, desc: "Plateau aluminium traité anti-UV, châssis galvanisé, résistante pluie.", image: "/images/products/table-de-tennis-exterieur-premium.jpg" },
  { id: "tp-3", name: "Table de Tennis Professionnelle ITTF", category: "ping-pong", priceHT: 599, stock: 3, badge: "Pro", rating: 5.0, desc: "Certifiée ITTF, plateau 25mm, structure acier, roulettes blocables.", image: "/images/products/table-de-tennis-professionnelle-ittf.jpg", dimensions: "274 x 152.5 x 76 cm" },
  { id: "tp-4", name: "Mini Table de Tennis", category: "ping-pong", priceHT: 49, stock: 22, badge: "Nouveau", rating: 4.4, desc: "Format réduit, pose sur table existante, filet clipsable, raquettes incluses.", image: "/images/products/mini-table-de-tennis.jpg" },
  { id: "tp-5", name: "Set Complet Raquettes + Balles", category: "ping-pong", priceHT: 39.9, stock: 40, badge: "Pack Famille", rating: 4.7, desc: "4 raquettes bois/caoutchouc, 12 balles 3 étoiles, housse transport.", image: "/images/products/set-complet-raquettes-balles.jpg" },
  { id: "tp-6", name: "Robot d'Entraînement Ping-Pong", category: "ping-pong", priceHT: 179, stock: 7, badge: "High-Tech", rating: 4.9, desc: "Lancement automatique, 30 fréquences, réservoir 100 balles.", image: "/images/products/robot-dentrainement-ping-pong.jpg" },
  { id: "bi-1", name: "Table de Billard Américain 7 pieds", category: "billard", priceHT: 799, stock: 4, badge: "Bestseller", rating: 4.8, desc: "Tapis vert professionnel, billes résine complètes, 2 queues incluses.", image: "/images/products/table-de-billard-americain-7-pieds.jpg", dimensions: "213 x 118 x 80 cm" },
  { id: "bi-2", name: "Table de Billard Anglais 6 pieds", category: "billard", priceHT: 649, stock: 3, badge: "Premium", rating: 4.7, desc: "Format compact, tapis bleu, pieds réglables, kit accessoires complet.", image: "/images/products/table-de-billard-anglais-6-pieds.jpg" },
  { id: "bi-3", name: "Table de Billard Mixte Pool/Snooker", category: "billard", priceHT: 999, stock: 2, badge: "Exclusif", rating: 5.0, desc: "Convertible, bandes caoutchouc K-66, livraison + montage inclus.", image: "/images/products/table-de-billard-mixte-pool-snooker.jpg", dimensions: "244 x 132 x 82 cm" },
  { id: "bi-4", name: "Mini Billard de Salon 4 pieds", category: "billard", priceHT: 299, stock: 8, badge: "Nouveau", rating: 4.5, desc: "Idéal salon, design moderne, bois clair, tapis anthracite.", image: "/images/products/mini-billard-de-salon-4-pieds.jpg" },
  { id: "bi-5", name: "Kit Accessoires Billard Pro", category: "billard", priceHT: 69.9, stock: 20, badge: "Accessoire", rating: 4.6, desc: "2 queues 145cm, triangle, cendrier craie, 16 billes, housse queue.", image: "/images/products/kit-accessoires-billard-pro.jpg" },
  { id: "bi-6", name: "Éclairage Suspension Billard LED", category: "billard", priceHT: 129, stock: 15, badge: "Design", rating: 4.9, desc: "Rampe 3 spots LED réglables, style industriel, portée 140cm.", image: "/images/products/eclairage-suspension-billard-led.jpg" },
  { id: "tr-1", name: "Trampoline Jardin 244cm (8 pieds)", category: "trampoline", priceHT: 199, stock: 14, badge: "Bestseller", rating: 4.7, desc: "Filet de sécurité 180cm, coussinets protection, structure galvanisée.", image: "/images/products/trampoline-jardin-244cm-8-pieds.jpg", dimensions: "Ø 244 cm x H 180 cm" },
  { id: "tr-2", name: "Trampoline Jardin 366cm (12 pieds)", category: "trampoline", priceHT: 349, stock: 7, badge: "Famille", rating: 4.8, desc: "Haute capacité (150kg), double filet sécurité, bâche promotion.", image: "/images/products/trampoline-jardin-366cm-12-pieds.jpg", dimensions: "Ø 366 cm x H 200 cm" },
  { id: "tr-3", name: "Trampoline Enfant Intérieur 100cm", category: "trampoline", priceHT: 79, stock: 25, badge: "Nouveau", rating: 4.5, desc: "Idéal chambre/salon, barre stabilisatrice, charge max 50kg.", image: "/images/products/trampoline-enfant-interieur-100cm.jpg" },
  { id: "tr-4", name: "Trampoline Fitness Adulte", category: "trampoline", priceHT: 119, stock: 18, badge: "Sport", rating: 4.6, desc: "Diamètre 102cm, barre réglable, 8 ressorts renforcés.", image: "/images/products/trampoline-fitness-adulte.jpg" },
  { id: "tr-5", name: "Trampoline Semi-Enterré 430cm", category: "trampoline", priceHT: 1199, stock: 2, badge: "Premium", rating: 5.0, desc: "Filet affleurant sol, look premium, sécurité maximale.", image: "/images/products/trampoline-semi-enterre-430cm.jpg" },
  { id: "tr-6", name: "Kit Entretien Trampoline", category: "trampoline", priceHT: 49.9, stock: 30, badge: "Accessoire", rating: 4.8, desc: "Bâche hivernage, 8 ressorts rechange, réparation filet.", image: "/images/products/kit-entretien-trampoline.jpg" },
  { id: "ac-1", name: "Pack Accessoires Gaming Complet", category: "accessoires", priceHT: 149, stock: 20, badge: "Pack", rating: 4.8, desc: "Manette premium PS5/Xbox, casque sans fil, support console.", image: "/images/products/pack-accessoires-gaming-complet.jpg" },
  { id: "ac-2", name: "Casque Gaming Sans Fil 7.1 Surround", category: "accessoires", priceHT: 89, stock: 15, badge: "Bestseller", rating: 4.7, desc: "Son surround, micro rétractable, autonomie 20h.", image: "/images/products/casque-gaming-sans-fil-7-1-surround.jpg" },
  { id: "ac-3", name: "Manette Pro PS5 Dualsense Edge", category: "accessoires", priceHT: 109, stock: 12, badge: "Pro", rating: 4.9, desc: "Boutons arrière configurables, sticks interchangeables.", image: "/images/products/manette-pro-ps5-dualsense-edge.jpg" },
  { id: "ac-4", name: "Station de Recharge Double PS5/Xbox", category: "accessoires", priceHT: 34.9, stock: 28, badge: "Pratique", rating: 4.6, desc: "Charge 2 manettes simultanément, LED statut, compacte.", image: "/images/products/station-de-recharge-double-ps5-xbox.jpg" },
  { id: "ac-5", name: "Support Mural Console + Rangement Jeux", category: "accessoires", priceHT: 44.9, stock: 22, badge: "Design", rating: 4.5, desc: "Compatible PS5/Xbox/Switch, rangement 15 jeux.", image: "/images/products/support-mural-console-rangement-jeux.jpg" },
  { id: "ac-6", name: "Tapis de Sol Gaming Anti-Fatigue XL", category: "accessoires", priceHT: 59, stock: 16, badge: "Nouveau", rating: 4.7, desc: "120x60cm, mousse mémoire, impérméable.", image: "/images/products/tapis-de-sol-gaming-anti-fatigue-xl.jpg" },
  { id: "co-1", name: "PlayStation 4 Slim 500Go", category: "consoles", priceHT: 350, stock: 8, badge: "Classique", rating: 4.7, desc: "Console Sony PS4, noire, 1 manette DualShock 4.", image: "/images/products/playstation-4-slim-500go.jpg" },
  { id: "co-2", name: "PlayStation 5 Slim (Lecteur Disque)", category: "consoles", priceHT: 450, stock: 6, badge: "Nouveau", rating: 4.9, desc: "Édition standard 2025, 1To SSD, manette DualSense.", image: "/images/products/playstation-5-slim-lecteur-disque.jpg" },
  { id: "co-3", name: "PlayStation 5 Pro", category: "consoles", priceHT: 700, stock: 3, badge: "Premium", rating: 5.0, desc: "2To SSD, résolution 4K native améliorée, manette Pro.", image: "/images/products/playstation-5-pro.jpg" },
  { id: "co-4", name: "Nintendo Switch OLED", category: "consoles", priceHT: 320, stock: 10, badge: "Bestseller", rating: 4.8, desc: "Écran OLED 7 pouces, Joy-Con blanches, 64Go stockage.", image: "/images/products/nintendo-switch-oled.jpg" },
  { id: "co-5", name: "Nintendo Switch 2", category: "consoles", priceHT: 380, stock: 5, badge: "Nouveauté 2025", rating: 5.0, desc: "Nouvelle génération 2025, rétrocompatible, écran 8\".", image: "/images/products/nintendo-switch-2.jpg" },
  { id: "co-6", name: "Xbox Series X", category: "consoles", priceHT: 450, stock: 7, badge: "High-Tech", rating: 4.8, desc: "1To SSD, 4K/120fps, Game Pass compatible, noir mat.", image: "/images/products/xbox-series-x.jpg" },
];

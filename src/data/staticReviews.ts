export interface StaticReview {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const staticReviews: StaticReview[] = [
  // Baby-foot
  { id: "sr-1", productId: "bf-1", userName: "Jean M.", rating: 5, comment: "Super rapport qualité prix pour mon fils, il adore !", createdAt: "2025-01-15T10:00:00Z" },
  { id: "sr-2", productId: "bf-1", userName: "Sophie L.", rating: 4, comment: "Montage un peu long mais résultat impeccable.", createdAt: "2025-02-02T14:30:00Z" },
  { id: "sr-3", productId: "bf-2", userName: "Marc A.", rating: 5, comment: "Une vraie bête ! Très stable et les sensations sont géniales.", createdAt: "2025-03-10T12:00:00Z" },
  { id: "sr-4", productId: "bf-2", userName: "Lucas P.", rating: 5, comment: "Parfait pour mon entreprise, les employés sont ravis.", createdAt: "2025-03-12T09:15:00Z" },
  { id: "sr-5", productId: "bf-3", userName: "Marie D.", rating: 4, comment: "Taille parfaite pour mon fils de 5 ans. Il ne s'arrête plus.", createdAt: "2025-01-20T16:00:00Z" },
  { id: "sr-6", productId: "bf-6", userName: "Hervé G.", rating: 5, comment: "Magnifique objet de décoration et super jeu. Le bois est splendide.", createdAt: "2025-02-14T18:00:00Z" },

  // Ping-Pong
  { id: "sr-7", productId: "tp-1", userName: "Thomas B.", rating: 4, comment: "Très bonne table pour s'amuser en famille le weekend.", createdAt: "2025-01-12T11:00:00Z" },
  { id: "sr-8", productId: "tp-2", userName: "Sarah K.", rating: 5, comment: "Résiste super bien à la pluie cet hiver. Top !", createdAt: "2025-03-05T15:20:00Z" },
  { id: "sr-9", productId: "tp-3", userName: "Club TT", rating: 5, comment: "Qualité pro, rebond parfait pour nos entraînements.", createdAt: "2025-02-28T10:45:00Z" },
  { id: "sr-10", productId: "tp-6", userName: "Julien R.", rating: 4, comment: "Le robot aide vraiment à progresser seul. Un peu bruyant mais efficace.", createdAt: "2025-03-20T14:00:00Z" },

  // Billard
  { id: "sr-11", productId: "bi-1", userName: "Damien V.", rating: 5, comment: "Le clou de ma salle de jeux. Qualité incroyable.", createdAt: "2025-01-05T13:30:00Z" },
  { id: "sr-12", productId: "bi-2", userName: "Clara S.", rating: 4, comment: "Plus petite que prévue mais parfaite pour mon salon.", createdAt: "2025-02-18T17:10:00Z" },
  { id: "sr-13", productId: "bi-3", userName: "Nicolas W.", rating: 5, comment: "Une merveille technique. Le passage pool/snooker est facile.", createdAt: "2025-03-15T19:00:00Z" },

  // Trampoline
  { id: "sr-14", productId: "tr-1", userName: "Emma F.", rating: 5, comment: "Les enfants sont en sécurité, le filet est très solide.", createdAt: "2025-03-02T10:00:00Z" },
  { id: "sr-15", productId: "tr-2", userName: "Paul T.", rating: 5, comment: "Très grand, on peut y aller à plusieurs sans soucis.", createdAt: "2025-03-10T11:30:00Z" },
];

export const getStaticReviewsForProduct = (productId: string) => {
  return staticReviews.filter(r => r.productId === productId);
};

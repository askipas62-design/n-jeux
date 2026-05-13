export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  priceHT: number;
  category: string;
  image: string;
  stock: number;
  platform: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "FIFA 24 - PS5",
    description: "Le dernier opus de la simulation de football de référence.",
    price: 69.99,
    priceHT: 58.33,
    category: "Jeux",
    image: "https://images.unsplash.com/photo-1628174457715-4679796e625d?auto=format&fit=crop&q=80&w=800",
    stock: 10,
    platform: "PS5"
  },
  {
    id: "2",
    name: "Spider-Man 2 - PS5",
    description: "Incarnez Peter Parker et Miles Morales dans cette aventure épique.",
    price: 79.99,
    priceHT: 66.66,
    category: "Jeux",
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=800",
    stock: 5,
    platform: "PS5"
  },
  {
    id: "3",
    name: "Elden Ring - PC",
    description: "L'action-RPG acclamé par la critique, développé par FromSoftware.",
    price: 59.99,
    priceHT: 49.99,
    category: "Jeux",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    stock: 15,
    platform: "PC"
  },
  {
    id: "4",
    name: "Carte Cadeau PSN 50€",
    description: "Rechargez votre compte PlayStation Network avec 50€.",
    price: 50.00,
    priceHT: 41.67,
    category: "Cartes",
    image: "https://images.unsplash.com/photo-1605898835373-03f1b0a88785?auto=format&fit=crop&q=80&w=800",
    stock: 100,
    platform: "Toutes"
  }
];

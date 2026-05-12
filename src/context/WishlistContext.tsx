import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "../components/ui/Toast";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
  processingId: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    // Local storage based wishlist for offline/json apps
    const savedWishlist = localStorage.getItem(`wishlist_${user?.email || "guest"}`);
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    setProcessingId(productId);
    const isCurrentlyIn = wishlist.includes(productId);
    
    let newWishlist;
    if (isCurrentlyIn) {
      newWishlist = wishlist.filter(id => id !== productId);
      addToast("Produit retiré des favoris", "info");
    } else {
      newWishlist = [...wishlist, productId];
      addToast("Produit ajouté aux favoris ❤️", "success");
    }
    
    setWishlist(newWishlist);
    localStorage.setItem(`wishlist_${user?.email || "guest"}`, JSON.stringify(newWishlist));
    setProcessingId(null);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading, processingId }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

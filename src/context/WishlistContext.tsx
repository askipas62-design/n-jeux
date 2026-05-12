import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
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
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const fetchWishlist = async () => {
    if (!user || !token) {
      setWishlist([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      setWishlist(data.map(item => item.product_id));
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user, token]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      addToast("Veuillez vous connecter pour ajouter des favoris.", "error");
      return;
    }

    setProcessingId(productId);
    setLoading(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const isCurrentlyIn = wishlist.includes(productId);

    try {
      if (isCurrentlyIn) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (error) throw error;
        setWishlist(prev => prev.filter(id => id !== productId));
        addToast("Produit retiré des favoris", "success");
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ user_id: userId, product_id: productId });

        if (error) throw error;
        setWishlist(prev => [...prev, productId]);
        addToast("Produit ajouté aux favoris ❤️", "success");
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      addToast("Erreur lors de la mise à jour des favoris", "error");
    } finally {
      setLoading(false);
      setProcessingId(null);
    }
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

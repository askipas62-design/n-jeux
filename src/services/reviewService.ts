import { getStaticReviewsForProduct } from "../data/staticReviews";

const STORAGE_KEY = "appiotti_local_reviews";

const API_URL = "";

export const reviewService = {
  async getAll(productId?: string) {
    try {
      const res = await fetch(`${API_URL}/api/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const allReviews = await res.json();
      
      if (productId) {
        return allReviews.filter((r: any) => r.productId === productId);
      }
      return allReviews;
    } catch (e) {
      console.error("Error fetching reviews from API, falling back to static:", e);
      return productId ? getStaticReviewsForProduct(productId) : [];
    }
  },

  async create(review: { rating: number; comment: string; userName?: string; productId?: string }) {
    // For now, creation remains local or we could add a POST endpoint.
    // Given the "stateless" requirement, we might keep it simple or just use localStorage for new reviews.
    // But since we want "functional admin", at least deleting should work from the file.
    const newReview = {
      ...review,
      id: "local-" + Date.now(),
      createdAt: new Date().toISOString()
    };
    
    let localReviews = [];
    try {
      localReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(localReviews)) localReviews = [];
    } catch (e) {
      console.error("Error parsing local reviews:", e);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newReview, ...localReviews]));
    
    return newReview;
  },

  async delete(id: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!res.ok) throw new Error("Erreur lors de la suppression de l'avis");
    
    return { success: true };
  }
};

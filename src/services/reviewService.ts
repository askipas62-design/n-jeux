import { getStaticReviewsForProduct } from "../data/staticReviews";

const STORAGE_KEY = "appiotti_local_reviews";

export const reviewService = {
  async getAll(productId?: string) {
    const staticReviews = productId ? getStaticReviewsForProduct(productId) : [];
    const localReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    
    let filteredLocal = localReviews;
    if (productId) {
      filteredLocal = localReviews.filter((r: any) => r.productId === productId);
    }
    
    return [...filteredLocal, ...staticReviews];
  },

  async create(review: { rating: number; comment: string; userName?: string; productId?: string }) {
    const newReview = {
      ...review,
      id: "local-" + Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const localReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newReview, ...localReviews]));
    
    return newReview;
  },

  async delete(id: string) {
    const localReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = localReviews.filter((r: any) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { success: true };
  }
};

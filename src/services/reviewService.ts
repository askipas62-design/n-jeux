const API_URL = "";

export const reviewService = {
  async getAll(productId?: string) {
    const url = productId ? `/api/reviews?productId=${productId}` : "/api/reviews";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
  },

  async create(review: { rating: number; comment: string; userName?: string; productId?: string }) {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(review)
    });
    if (!res.ok) throw new Error("Failed to create review");
    return res.json();
  },

  async delete(id: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/reviews/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error("Failed to delete review");
    return res.json();
  }
};

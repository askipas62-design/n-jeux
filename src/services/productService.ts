import { Product } from "../data/products";

const API_URL = "";

export const productService = {
  async getAll(filters?: { category?: string; minPrice?: number; maxPrice?: number; q?: string }): Promise<Product[]> {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      let filtered = await res.json();
      
      if (filters?.category) {
        filtered = filtered.filter((p: any) => p.category === filters.category);
      }
      if (filters?.minPrice) {
        // TTC price check (priceHT * 1.2)
        filtered = filtered.filter((p: any) => (p.priceHT * 1.2) >= (filters.minPrice || 0));
      }
      if (filters?.maxPrice) {
        filtered = filtered.filter((p: any) => (p.priceHT * 1.2) <= (filters.maxPrice || Infinity));
      }
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        filtered = filtered.filter((p: any) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
      }
      
      return filtered;
    } catch (e) {
      console.error("Error fetching products, falling back to static:", e);
      const { products: staticProducts } = await import("../data/products");
      return staticProducts;
    }
  },

  async getById(id: string): Promise<Product> {
    const products = await this.getAll();
    const product = products.find(p => p.id === id);
    if (!product) throw new Error("Product not found");
    return product;
  }
};

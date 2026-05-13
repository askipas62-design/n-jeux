import { PRODUCTS, Product } from "../constants/products";

export const productService = {
  async getAll(filters?: { category?: string; minPrice?: number; maxPrice?: number; q?: string }): Promise<Product[]> {
    let filtered = [...PRODUCTS];
    
    if (filters?.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    if (filters?.minPrice) {
      filtered = filtered.filter(p => p.price >= (filters.minPrice || 0));
    }
    if (filters?.maxPrice) {
      filtered = filtered.filter(p => p.price <= (filters.maxPrice || Infinity));
    }
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    
    return filtered;
  },

  async getById(id: string): Promise<Product> {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) throw new Error("Product not found");
    return product;
  }
};

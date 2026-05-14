const API_URL = window.location.origin; // Relative to the same domain

const getHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export const adminService = {
  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_URL}/api/admin/orders`, {
      headers: getHeaders()
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text.includes("<!doctype html>") ? "Le serveur API ne répond pas correctement (HTML reçu)" : "Erreur lors du chargement des commandes");
    }
    
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Le serveur n'a pas renvoyé de JSON valide");
    }
    
    return res.json();
  },
  updateOrderStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text.includes("<!doctype html>") ? "Le serveur API ne répond pas correctement (HTML reçu)" : "Erreur lors de la mise à jour du statut");
    }
    
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_URL}/api/admin/users`, {
      headers: getHeaders()
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error("Erreur lors du chargement des utilisateurs");
    }
    
    return res.json();
  },

  // Products
  getProducts: async () => {
    const res = await fetch(`${API_URL}/api/admin/products`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Erreur chargement produits admin");
    return res.json();
  },
  updateProduct: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error("Erreur mise à jour produit");
    return res.json();
  },
  deleteProduct: async (id: string) => {
    console.warn("deleteProduct is not available in stateless mode.");
    return { success: true };
  }
};

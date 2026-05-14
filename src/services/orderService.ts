const API_URL = window.location.origin; // Use current origin for API calls in production

export interface Order {
  id: string;
  user_email: string;
  items: any[];
  totalTTC: number;
  status: string;
  createdAt: string;
  proofUploaded: boolean;
}

const STORAGE_KEY = "appiotti_orders";

export const orderService = {
  async create(orderData: { items: any[]; totalTTC: number; status?: string; id?: string }) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    if (!res.ok) {
      const text = await res.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { error: text };
      }
      const msg = errorData.error || errorData.details || `Erreur ${res.status}: ${res.statusText}`;
      throw new Error(msg);
    }
    
    const newOrder = await res.json();
    
    // Save to localStorage for persistence on this device
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newOrder, ...existing]));
    
    return newOrder;
  },

  async getMyOrders() {
    const token = localStorage.getItem("token");
    if (!token) return [];

    try {
      const res = await fetch(`${API_URL}/api/orders/my`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error("Erreur lors de la récupération des commandes");
      
      return res.json();
    } catch (e) {
      console.error("Error fetching orders from API:", e);
      return [];
    }
  },

  async uploadProof(orderId: string, file: File) {
    const token = localStorage.getItem("token");
    
    // Convert file to Base64 for stateless transmission
    const toBase64 = (f: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
      reader.onerror = error => reject(error);
    });

    const base64 = await toBase64(file);

    const res = await fetch(`${API_URL}/api/orders/${orderId}/proof-stateless`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        proofBase64: base64,
        fileName: file.name
      })
    });
    
    if (!res.ok) throw new Error("Erreur lors de l'envoi de la preuve");
    
    // Update local state
    const orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const updated = orders.map((o: any) => 
      o.id === orderId ? { ...o, proofUploaded: true, status: "Preuve soumise" } : o
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    return { success: true };
  },

  async getAllForAdmin() {
    // Admin must rely on emails in stateless mode, or we could potentially aggregate, but let's stick to stateless.
    console.warn("getAllForAdmin is not available in stateless mode. Please check your emails.");
    return [];
  },

  async updateStatus(id: string, status: string) {
     console.warn("updateStatus is not available in stateless mode.");
     return { success: true };
  }
};

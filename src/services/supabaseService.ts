import { supabase } from '../lib/supabase';

// Types correspondants aux tables Supabase attendues
export interface SupabaseProduct {
  id: string;
  name: string;
  category: string;
  priceHT: number;
  stock: number;
  badge?: string;
  rating: number;
  desc: string;
  image?: string;
}

export interface SupabaseOrder {
  id: string;
  user_id: string;
  items: any[];
  total_ttc: number;
  status: string;
  created_at: string;
  proof_url?: string;
}

export const supabaseService = {
  // Produits
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (error) throw error;
    return data;
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  // Commandes
  async createOrder(order: Omit<SupabaseOrder, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMyOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Auth (Utilisant l'Auth native de Supabase)
  async signUp(email: string, password: string, metadata: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

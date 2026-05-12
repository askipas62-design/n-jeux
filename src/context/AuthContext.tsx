import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  logout: () => Promise<void>;
  updateProfile: (firstName: string, lastName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      firstName: supabaseUser.user_metadata?.firstName || "",
      lastName: supabaseUser.user_metadata?.lastName || "",
      isAdmin: supabaseUser.email === import.meta.env.VITE_ADMIN_EMAIL
    };
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
      if (session?.access_token) {
        localStorage.setItem("token", session.access_token);
      } else {
        localStorage.removeItem("token");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { firstName, lastName }
    });
    
    if (error) throw error;
    
    // Also sync with our local JSON backend if needed for orders/reviews consistency
    const token = localStorage.getItem("token");
    await fetch("/api/auth/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ firstName, lastName })
    });
    
    setUser(mapUser(data.user));
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

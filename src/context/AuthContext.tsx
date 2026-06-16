import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { isAdminEmail } from "../config/admin";

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
    const email = (supabaseUser.email || "").toLowerCase().trim();
    return {
      id: supabaseUser.id,
      email: email,
      firstName: supabaseUser.user_metadata?.firstName || "",
      lastName: supabaseUser.user_metadata?.lastName || "",
      isAdmin: isAdminEmail(email)
    };
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
      if (session?.access_token) {
        localStorage.setItem("token", session.access_token);
      }
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
    
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        email: data.user.email,
        updated_at: new Date().toISOString(),
      });
    }
    
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface User {
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial check: Local Storage (for backward compatibility if needed)
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }

    // 2. Real-time Supabase Check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const metadata = session.user.user_metadata;
        const isAdmin = session.user.email === "askipas62@gmail.com";
        const currentUser = {
          email: session.user.email || "",
          firstName: metadata?.firstName || "Client",
          lastName: metadata?.lastName || "Appiotti",
          isAdmin
        };
        setToken(session.access_token);
        setUser(currentUser);
        // Persist for page reloads
        localStorage.setItem("token", session.access_token);
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
      setLoading(false);
    };

    checkSession();

    // 3. Listen for changes (Sign in, Sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const metadata = session.user.user_metadata;
        const isAdmin = session.user.email === "askipas62@gmail.com";
        const currentUser = {
          email: session.user.email || "",
          firstName: metadata?.firstName || "Client",
          lastName: metadata?.lastName || "Appiotti",
          isAdmin
        };
        setToken(session.access_token);
        setUser(currentUser);
        localStorage.setItem("token", session.access_token);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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

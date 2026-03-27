"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  name: string;
  email: string;
  role: "admin" | "worker";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string, role: "admin" | "worker") => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pre-seeded users
const DEFAULT_USERS: { email: string; password: string; name: string; role: "admin" | "worker" }[] = [
  { email: "admin@gigshield.in", password: "admin123", name: "Jatin M.", role: "admin" },
  { email: "rahul@gigshield.in", password: "worker123", name: "Rahul Yadav", role: "worker" },
];

function getStoredUsers(): typeof DEFAULT_USERS {
  if (typeof window === "undefined") return DEFAULT_USERS;
  const stored = localStorage.getItem("gigshield_users");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_USERS;
    }
  }
  localStorage.setItem("gigshield_users", JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("gigshield_user");
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("gigshield_user");
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Invalid email or password" };

    const loggedInUser: User = { name: found.name, email: found.email, role: found.role };
    setUser(loggedInUser);
    localStorage.setItem("gigshield_user", JSON.stringify(loggedInUser));
    return { success: true };
  };

  const signup = (name: string, email: string, password: string, role: "admin" | "worker") => {
    const users = getStoredUsers();
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }

    const newUser = { email, password, name, role };
    const updatedUsers = [...users, newUser];
    localStorage.setItem("gigshield_users", JSON.stringify(updatedUsers));

    const loggedInUser: User = { name, email, role };
    setUser(loggedInUser);
    localStorage.setItem("gigshield_user", JSON.stringify(loggedInUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gigshield_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

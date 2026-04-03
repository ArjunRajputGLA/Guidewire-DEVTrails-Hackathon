"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface User {
  name: string;
  email: string;
  role: "admin" | "worker";
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: "admin" | "worker") => { success: boolean; error?: string };
  updateProfilePic: (picUrl: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Pre-seeded users
const DEFAULT_USERS: { email: string; password: string; name: string; role: "admin" | "worker" }[] = [
  { email: "admin@gigshield.in", password: "admin123", name: "Jatin M.", role: "admin" },
  { email: "admin@gigshield.com", password: "123456", name: "Admin", role: "admin" },
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
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);

        // Sync admin profile pic from DB on load
        if (parsedUser.role === "admin") {
          import("@/lib/supabase-browser").then(({ supabase }) => {
            supabase
              .from("admin_profiles")
              .select("profile_pic")
              .eq("email", parsedUser.email)
              .maybeSingle()
              .then(({ data }) => {
                if (data?.profile_pic && data.profile_pic !== parsedUser.profilePic) {
                  const syncedUser = { ...parsedUser, profilePic: data.profile_pic };
                  setUser(syncedUser);
                  localStorage.setItem("gigshield_user", JSON.stringify(syncedUser));
                }
              });
          });
        }
      } catch {
        localStorage.removeItem("gigshield_user");
      }
    }
    setLoading(false);
  }, []);

const login = async (email: string, password: string) => {
    const users = getStoredUsers();
    let found = users.find((u) => u.email === email && u.password === password);

    // Also check DEFAULT_USERS in case localStorage is missing the updated list
    if (!found) {
      found = DEFAULT_USERS.find((u) => u.email === email && u.password === password);
    }

    if (!found) return { success: false, error: "Invalid email or password" };  

    const loggedInUser: User = { name: found.name, email: found.email, role: found.role };

    if (found.role === "admin") {
      try {
        const { supabase } = await import("@/lib/supabase-browser");
        const { data } = await supabase
          .from("admin_profiles")
          .select("profile_pic")
          .eq("email", found.email)
          .maybeSingle();

        if (data?.profile_pic) {
          loggedInUser.profilePic = data.profile_pic;
        }
      } catch (err) {
        console.log("Failed to fetch admin profile pic from DB", err);
      }
    }

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

const updateProfilePic = async (picUrl: string) => {
    if (!user) return;
    const updatedUser = { ...user, profilePic: picUrl };
    setUser(updatedUser);
    localStorage.setItem("gigshield_user", JSON.stringify(updatedUser));        

    const users = getStoredUsers();
    const updatedUsers = users.map(u => u.email === user.email ? { ...u, profilePic: picUrl } : u);
    localStorage.setItem("gigshield_users", JSON.stringify(updatedUsers));      

    if (user.role === "admin") {
      try {
        const { supabase } = await import("@/lib/supabase-browser");
        const { error } = await supabase
          .from("admin_profiles")
          .upsert({ email: user.email, profile_pic: picUrl });
        if (error) {
          console.error("Failed to save admin profile pic to DB:", error);
        }
      } catch (err) {
        console.error("Error connecting to DB:", err);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("gigshield_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, updateProfilePic, logout }}>     
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

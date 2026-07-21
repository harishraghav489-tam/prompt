"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, challengeApi, getApiError } from "@/lib/api";
import { supabase } from "@/lib/supabase/client";
import type { LoginPayload, RegisterPayload, TimerConfig, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  timer: TimerConfig | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshTimer: () => Promise<void>;
}

const defaultTimer: TimerConfig = {
  preparationSecondsRemaining: 0,
  submissionSecondsRemaining: 5355,
  challengeUnlocked: true,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function createDemoUser(email: string): User {
  const normalizedEmail = email.trim().toLowerCase();
  const [localPart] = normalizedEmail.split("@");
  const displayName = (localPart || "Student")
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return {
    id: `demo-${Date.now()}`,
    email: normalizedEmail,
    name: displayName || "Student",
    college: "College Account",
    department: "Department",
    role: "participant",
  };
}

function createSupabaseUser(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): User {
  const email = authUser.email ?? "";
  const metadata = authUser.user_metadata ?? {};
  const name =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : createDemoUser(email).name;

  return {
    id: authUser.id,
    email,
    name,
    college:
      typeof metadata.college === "string" ? metadata.college : "College Account",
    department:
      typeof metadata.department === "string" ? metadata.department : "Department",
    role: metadata.role === "admin" ? "admin" : "participant",
  };
}

async function syncSupabaseProfile(user: User) {
  if (!supabase) {
    return;
  }

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      department: user.department,
      role: user.role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [timer, setTimer] = useState<TimerConfig | null>(defaultTimer);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTimer = useCallback(async () => {
    try {
      const { data } = await challengeApi.getTimer();
      setTimer(data);
    } catch {
      setTimer((current) => current ?? defaultTimer);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("promptwar_token");
      const storedUser = localStorage.getItem("promptwar_user");

      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (session?.user) {
          const supabaseUser = createSupabaseUser(session.user);
          await syncSupabaseProfile(supabaseUser);
          localStorage.setItem("promptwar_token", session.access_token);
          localStorage.setItem("promptwar_user", JSON.stringify(supabaseUser));
          setUser(supabaseUser);
          await refreshTimer();
          setIsLoading(false);
          return;
        }
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("promptwar_user");
        }
      }

      if (token) {
        try {
          const { data } = await authApi.me();
          setUser(data);
          localStorage.setItem("promptwar_user", JSON.stringify(data));
        } catch {
          localStorage.removeItem("promptwar_token");
          localStorage.removeItem("promptwar_user");
          setUser(null);
        }
      }

      await refreshTimer();
      setIsLoading(false);
    };

    void bootstrap();
  }, [refreshTimer]);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const { data } = await authApi.login(payload);
      localStorage.setItem("promptwar_token", data.access_token);
      localStorage.setItem("promptwar_user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      if (payload.email && (!payload.password || payload.provider === "google")) {
        const demoUser = createDemoUser(payload.email);
        const demoToken = `demo-${btoa(payload.email)}`;
        localStorage.setItem("promptwar_token", demoToken);
        localStorage.setItem("promptwar_user", JSON.stringify(demoUser));
        void syncSupabaseProfile(demoUser);
        setUser(demoUser);
        return;
      }

      throw new Error(getApiError(error));
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const { data } = await authApi.register(payload);
      localStorage.setItem("promptwar_token", data.access_token);
      localStorage.setItem("promptwar_user", JSON.stringify(data.user));
      void syncSupabaseProfile(data.user);
      setUser(data.user);
    } catch (error) {
      throw new Error(getApiError(error));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors when backend is unavailable
    } finally {
      localStorage.removeItem("promptwar_token");
      localStorage.removeItem("promptwar_user");
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      timer,
      login,
      register,
      logout,
      refreshTimer,
    }),
    [user, isLoading, timer, login, register, logout, refreshTimer]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

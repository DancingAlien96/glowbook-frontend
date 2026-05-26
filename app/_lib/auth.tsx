"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setAccessToken, getAccessToken, onAuthChange } from "./api";
import type { MeUser } from "./types";

type Status = "loading" | "authenticated" | "anonymous";

type AuthState = {
  status: Status;
  user: MeUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    salonName: string;
    salonSlug: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<MeUser | null>(null);

  const fetchMe = useCallback(async () => {
    try {
      const { user } = await api<{ user: MeUser }>("/auth/me");
      setUser(user);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  // Bootstrap: try refresh first (cookie may exist), then load me.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getAccessToken();
      if (!token) {
        try {
          const { accessToken } = await api<{ accessToken: string }>("/auth/refresh", {
            method: "POST",
            auth: false,
          });
          if (cancelled) return;
          setAccessToken(accessToken);
        } catch {
          if (!cancelled) {
            setStatus("anonymous");
            return;
          }
        }
      }
      if (!cancelled) await fetchMe();
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchMe]);

  // Cross-component access token sync (e.g. logout from another tab)
  useEffect(() => onAuthChange(() => {
    if (!getAccessToken()) {
      setUser(null);
      setStatus("anonymous");
    }
  }), []);

  const login = useCallback<AuthState["login"]>(async (email, password) => {
    const data = await api<{ accessToken: string; user: { id: string; email: string; role: string } }>(
      "/auth/login",
      { method: "POST", body: { email, password }, auth: false }
    );
    setAccessToken(data.accessToken);
    await fetchMe();
  }, [fetchMe]);

  const register = useCallback<AuthState["register"]>(async (input) => {
    const data = await api<{ accessToken: string }>("/auth/register", {
      method: "POST",
      body: input,
      auth: false,
    });
    setAccessToken(data.accessToken);
    await fetchMe();
  }, [fetchMe]);

  const logout = useCallback<AuthState["logout"]>(async () => {
    try {
      await api("/auth/logout", { method: "POST", auth: false, raw: true });
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthState>(
    () => ({ status, user, login, register, logout, refresh: fetchMe }),
    [status, user, login, register, logout, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

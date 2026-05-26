"use client";

// Single-flight API client with JWT access token + cookie-based refresh.
// Access token lives in memory + sessionStorage (so it survives reloads in dev).

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000/api";

const ACCESS_KEY = "gb.access";

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean; // default true for non-public
  raw?: boolean; // skip json parsing
};

let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function onAuthChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = window.sessionStorage.getItem(ACCESS_KEY);
  }
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) window.sessionStorage.setItem(ACCESS_KEY, token);
    else window.sessionStorage.removeItem(ACCESS_KEY);
  }
  notify();
}

export const apiUrl = (path: string) =>
  path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function refresh(): Promise<string | null> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(apiUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const data = (await res.json()) as { accessToken: string };
        setAccessToken(data.accessToken);
        return data.accessToken;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

export async function api<T = unknown>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { body, auth = true, raw = false, headers, ...rest } = opts;

  const buildHeaders = (token: string | null): HeadersInit => {
    const h: Record<string, string> = { ...(headers as Record<string, string> | undefined) };
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (body && !isFormData && !h["Content-Type"]) h["Content-Type"] = "application/json";
    if (token && auth) h["Authorization"] = `Bearer ${token}`;
    return h;
  };

  const doFetch = async (token: string | null) =>
    fetch(apiUrl(path), {
      ...rest,
      credentials: "include",
      headers: buildHeaders(token),
      body:
        body == null
          ? undefined
          : body instanceof FormData
          ? body
          : typeof body === "string"
          ? body
          : JSON.stringify(body),
    });

  let token = auth ? getAccessToken() : null;
  let res = await doFetch(token);

  if (res.status === 401 && auth) {
    const newToken = await refresh();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    let payload: { error?: { code?: string; message?: string; details?: unknown } } = {};
    try {
      payload = (await res.json()) as typeof payload;
    } catch {
      /* ignore */
    }
    throw new ApiError(
      res.status,
      payload.error?.message ?? res.statusText ?? "Request failed",
      payload.error?.code,
      payload.error?.details
    );
  }

  if (raw || res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
